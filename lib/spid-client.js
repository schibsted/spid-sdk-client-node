"use strict";
var _ = require('underscore-contrib'),
    when = require('when'),
    request = require('request'),
    oauthModule = require('simple-oauth2'),

    api_url = '/api/2';

function logger () {
    var msg = [],
        meta = null;
    for (var i = 0, l = arguments.length; i < l; i++) {
        if (_.isString(arguments[i]) || _.isNumber(arguments[i])) {
            msg.push(arguments[i]);
        } else if (_.isObject(arguments[i]) && !meta) {
            meta = arguments[i];
        } else if (_.isObject(arguments[i])) {
            msg.push(JSON.stringify(arguments[i]));
        }
    }
    var ms = (new Date()).getTime();
//    console.log('info', ms + ': ' + msg.join(' -> '), meta);
}


module.exports = function (opts, mock_services) {
    mock_services = mock_services || {};
    request = mock_services.request || request;
    oauthModule = mock_services.oauthModule || oauthModule;

    if (mock_services.request) { logger("Using mock request"); }
    if (mock_services.oauthModule) { logger("Using mock oauthModule"); }

    return {
        GET: function (token, endpoint, callback) {
            request.get(opts.site + api_url + endpoint + "?oauth_token=" + token.token.access_token, function (err, response, body) {
//                console.log('RESPONSE: ', response.body);
                response.getResponseBody = function () {
                    var self = response;
                    return self.body;
                };
                logger(err, response.getResponseBody(), body);
                callback(err, response);
            });
        },

        POST: function (token, endpoint, params, callback) {
            request.post({
                url  : opts.site + api_url + endpoint,
                form : _.extend(params, { oauth_token : token.token.access_token })
            }, function (err, response, body) {
//                console.log('RESPONSE: ', response.body);
                response.getResponseBody = function () {
                    var self = response;
                    return self.body;
                };
                logger(err, response.getResponseBody(), body);
                callback(err, response);
            });
        },

        DELETE: function (token, endpoint, callback) {
            request.del(opts.site + api_url + endpoint + "?oauth_token=" + token.token.access_token, function (err, response, body) {
//                console.log('RESPONSE: ', response.body);
                response.getResponseBody = function () {
                    var self = response;
                    return self.body;
                };
                logger(err, response.getResponseBody(), body);
                callback(err, response);
            });
        },

        getServerToken: function (callback) {
            var token = null;
            var oauth = oauthModule({
                clientID: opts.clientID,
                clientSecret: opts.clientSecret,
                site: opts.site,
                tokenPath: opts.tokenPath || '/oauth/token',
                useBasicAuthorizationHeader: false
            });
            if (!token) {
                oauth.client.getToken({}, function (err, res) {
                    if (err) { throw err; }
                    token = oauth.AccessToken.create(res);
                    logger(token);
                    callback(err, token);
                });
            } else if (token.expired()) {
                token.refresh(function (err, response) {
                    if (err) { throw err; }
                    token = response;
                    logger(token);
                    callback(err, token);
                });
            }
        }
    };
};

