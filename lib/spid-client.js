'use strict';

const _ = require('lodash');
const http = require('https');
const querystring = require('querystring');
const url = require('url');

class SpidError extends Error {
    constructor(endpoint, error, data) {
        let message = endpoint + ': ' + error;
        if (data) {
            message += ' ' + JSON.stringify(data);
        }

        super(message);

        this.endpoint = endpoint;
        this.error = error;
        this.data = data;
    }
}

const spidEndpoints = {
    me: 'api/me',
    login: 'flow/auth',
    logout: 'logout',
    oauth: 'oauth/token',
    users: 'api/users',
    account: '/account/summary'
};

/**
 * Makes SPiD API requests and processes responses. Returns result of successful requests; throws on errors.
 */
function *_spidRequest(spidClient, requestOptions) {
    const options = {
        baseUrl: spidClient.baseUrl,
        method: 'POST'
    };
    _.merge(options, requestOptions);

    if (options.method === 'POST') {
        _.merge(options, {
            form: {
                'client_id': spidClient.client,
                'client_secret': spidClient.secret
            }
        });
    }

    //  Below, follows a partial, simplified re-implementation of convenience functionality offered in the 'request'
    //  package, which can't be used here as it depends on node-uuid, which somehow breaks babel compilation.
    //
    //  See also:
    //  - https://github.com/broofa/node-uuid/issues/119
    //  - https://github.com/broofa/node-uuid/pull/121
    //  - https://github.com/request/request/issues/1661

    let formData = '';
    if (options.form) {
        formData = querystring.stringify(options.form);
        _.merge(options, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': formData.length
            }
        });

        delete options.form;
    }

    if (options.baseUrl) {
        let uri = options.baseUrl;
        if (uri.lastIndexOf('/') !== uri.length -1 && options.uri.charAt(0) !== '/') {
            uri += '/';
        }
        options.uri = uri + options.uri;

        delete options.baseUrl;
    }

    if (options.qs) {
        options.uri += '?' + querystring.stringify(options.qs);
        delete options.qs;
    }
    console.log(options.uri);

    if (options.uri) {
        _.merge(options, url.parse(options.uri));
        delete options.uri;
    }

    // Note: co's Readme.md mentions thunk support may be removed in a future version.
    let response = yield function (callback) {
        let req = http.request(options, function (res) {
            res.body = '';

            res.on('data', function (chunk) {
                res.body += chunk;
            });
            res.on('end', function () {
                callback(null, res);
            });
        });
        req.on('error', function (error) {
            callback(error);
        });

        if (formData) {
            req.write(formData);
        }
        req.end();
    };
    let result = JSON.parse(response.body);

    if (response.statusCode !== 200 || result.error) {
        throw new SpidError(options.uri, 'Request failed', result || { statusCode: response.statusCode });
    }

    return result;
}

function *_noop() {}

/**
 * A client for SPiD's API.
 *
 * The class's constructor does minimal setup to ensure the client behaves gracefully, mostly by redirecting all
 * requests to '/'. A fully functioning client requires a call to initialize() with credentials and other configuration.
 *
 * login(), loginCallback(), loginFailure() and logout() return generator functions to handle specific steps of the
 * sign-in/sign-out workflow. The functions are designed to function as koa middleware and can be hooked to specific
 * routes.
 *
 * checkAuthenticatedUser(), and requireAuthenticatedUser() return pass-through koa middleware to fetch user
 * information. requireAuthenticatedUser() redirects user to authenticate with SPiD, if necessary.
 * checkAuthenticatedUser() fetches user data for authenticated users, without blocking unauthenticated ones.
 */
class SpidClient {
    constructor() {
        // Allow application to (otherwise) function before successful call to initialize().
        this.loginUrl = this.logoutRedirectUrl = '/';
    }

    initialize(config) {
        if (typeof config.baseUrl === 'object' || typeof config.hostname === 'string') {
            let baseUrl = config.baseUrl || {};
            baseUrl.protocol = baseUrl.protocol || 'https';
            baseUrl.hostname = baseUrl.hostname || config.hostname;

            this.baseUrl = url.format(baseUrl);
        } else {
            this.baseUrl = config.baseUrl;
        }

        this.loginCallbackUrl = config.loginCallback;
        this.logoutRedirectUrl = config.logoutRedirect;

        this.client = config.clientId;
        this.secret = config.clientSecret;

        this.apiVersion = typeof config.apiVersion !== 'undefined' ? config.apiVersion : 2;

        let loginQuery = querystring.stringify({
            'client_id': this.client,
            'redirect_uri': this.loginCallbackUrl,
            'response_type': 'code'
        });
        this.loginUrl = url.resolve(this.baseUrl, spidEndpoints.login) + '?' + loginQuery;
        this.logoutUrl = url.resolve(this.baseUrl, spidEndpoints.logout);

        console.log('[SpidClient] Initialized. Using ' + this.baseUrl);
    }

    /* eslint-disable consistent-this */
    // Generator functions below use 'spid' to refer to the SpidClient instance and 'ctx' for koa's context, breaking
    // eslint's consistent-this rule.

    /**
     * Returns middleware to initiate SPiD login. Typically associated with a /login endpoint.
     */
    login() {
        const spid = this;
        return function *spidLogin() {
            const ctx = this;
            ctx.redirect(spid.loginUrl);
        };
    }

    /**
     * Returns middleware to handle SPiD's callback. Typically associated with a /login/callback endpoint.
     *
     * The user will be redirected back to original destination if login was triggered by requireAuthenticatedUser()
     * middleware, otherwise to '/'.
     */
    loginCallback() {
        const spid = this;
        return function *spidLoginCallback() {
            const ctx = this;
            let redirectTo = '/';

            if (ctx.query.error) {
                console.log('[SpidClient] Login failed: ' + JSON.stringify(ctx.query));
            } else if (!ctx.query.code) {
                console.log('[SpidClient] Missing \'code\' in callback: ' + JSON.stringify(ctx.query));
            } else {
                try {
                    let oauthResponse = yield _spidRequest(spid, {
                        uri: spidEndpoints.oauth,
                        form: {
                            code: ctx.query.code,
                            'grant_type': 'authorization_code',
                            'redirect_uri': spid.loginCallbackUrl
                        }
                    });

                    ctx.session.spidData = {
                        user: oauthResponse.user_id,
                        accessToken: oauthResponse.access_token,
                        refreshToken: oauthResponse.refresh_token
                    };

                    redirectTo = ctx.session.spidRedirectTo || '/';
                    ctx.session.spidRedirectTo = '/';
                } catch (e) {
                    console.log('[SpidClient] Unable to obtain user token: ' + e.message);
                    ctx.redirect('/');
                }
            }

            ctx.redirect(redirectTo);
        };
    }

    /**
     * Returns middleware to handle SPiD's failure callback. Typically associated with a /login/failure endpoint. Client
     * will be redirected to '/'.
     */
    loginFailure() {
        return function spidLoginFailure() {
            const ctx = this;

            console.log('[SpidClient] Login failure: ' + JSON.stringify(ctx.query));
            ctx.redirect('/');
        };
    }

    /**
     * Returns middleware to clear user data and logout from SPiD.
     */
    logout(redirectUrl) {
        const spid = this;
        return function *spidLogout() {
            const ctx = this;

            let redirectTo = redirectUrl;
            if (ctx.session.spidData && ctx.session.spidData.accessToken) {
                let logoutQuery = querystring.stringify({
                    'oauth_token': ctx.session.spidData.accessToken,
                    'redirect_uri': redirectUrl || spid.logoutRedirectUrl
                });
                redirectTo = spid.logoutUrl + '?' + logoutQuery;
            }

            delete ctx.session.user;
            delete ctx.session.spidData;
            delete ctx.session.spidRedirectTo;

            ctx.redirect(redirectTo || '/');
        };
    }

    /**
     * Returns the URL for the SPiD account pages with a redirect URI that
     * returns to the subpage statet in the redirectUrl argument
     */
    getAccountURI(redirectUrl) {
        let redirectTo = this.redirectUrl + redirectUrl;

        let accountQuery = querystring.stringify({
            'client_id': this.client,
            'redirect_uri': redirectTo,
            'response_type': 'code'
        });

        let accountURI = url.resolve(this.baseUrl, spidEndpoints.account) + '?' + accountQuery

        console.log(accountURI);
        return accountURI;
    }

    /**
     * Returns middleware that checks whether the user is authenticated by SPiD, without triggering login.
     */
    checkAuthenticatedUser(shouldValidate) {
        const spid = this;
        return function *spidCheckAuthenticatedUser(next) {
            const ctx = this;
            if (shouldValidate || !ctx.session.user) {
                if (ctx.session.spidData &&
                    ctx.session.spidData.user &&
                    ctx.session.spidData.accessToken) {
                    // TODO: Detect access token expiration and use refresh token, instead.
                    try {
                        let userData = yield _spidRequest(spid, {
                            method: 'GET',
                            uri: spidEndpoints.me,
                            qs: { 'oauth_token': ctx.session.spidData.accessToken }
                        });

                        if (userData.data.userId !== ctx.session.spidData.user) {
                            // Can this even happen?!
                            throw new SpidError(spidEndpoints.me, 'Unexpected user ID mismatch', {
                                expected: { userId: ctx.session.spidData.user },
                                got: userData.data
                            });
                        }

                        ctx.session.user = userData.data;

                        console.log('[SpidClient] Authenticated user validated: ' + userData.data.userId);
                    } catch (e) {
                        console.log('[SpidClient] Unable to obtain user info: ' + e.message);
                        delete ctx.session.user;
                    }
                } else {
                    delete ctx.session.user;
                }
            }

            yield next;
        };
    }

    /**
     * Returns middleware that ensures user is authenticated by SPiD before proceeding.
     *
     * The client will be redirected to SPiD's login page, if necessary; will be redirected back to the current
     * request's path once authenticated.
     */
    requireAuthenticatedUser(shouldRedirect) {
        const spid = this;
        return function *spidRequireAuthenticatedUser(next) {
            const ctx = this;

            yield spid.checkAuthenticatedUser(true).call(ctx, _noop);

            if (!ctx.session.user) {
                if (shouldRedirect === true) {
                    ctx.session.spidRedirectTo = ctx.path;
                    yield spid.login();
                    return;
                }
                ctx.throw('Unauthorized', 401);
            }

            yield next;
        };
    }

    /**
     * Returns user data from a SPiD API endpoint
     *
     * @param {string} endpoint The endpoint used
     * @param {object} queryString The parameters for the request
     * @return {object} The user object from SPiD
     */
    *getUserData(endpoint, queryString) {
        queryString = typeof queryString !== 'undefined' ? queryString : {};

        const spid = this;
        let oauthResponse;
        // TODO: Detect access token expiration and use refresh token, instead.
        try {
            oauthResponse = yield _spidRequest(spid, {
                uri: spidEndpoints.oauth,
                form: {
                    'grant_type': 'client_credentials'
                }
            });
        } catch (e) {
            console.log('[SpidClient] Unable to obtain a access token: ' + e.message);
            return e;
        }

        try {
            queryString['oauth_token'] = oauthResponse.access_token

            let spidUser = yield _spidRequest(spid, {
                method: 'GET',
                uri: 'api/' + this.apiVersion + '/' + endpoint,
                qs: queryString
            });

            return spidUser.data;
        } catch (e) {
            console.log('[SpidClient] Could not find endpoint api/' + this.apiVersion + '/' + endpoint + ' with the params ' + queryString);
        }
    }
}

const defaultClient = new SpidClient();
defaultClient.SpidClient = SpidClient;

module.exports = defaultClient;
