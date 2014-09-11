'use strict';

var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var _ = require('underscore');

var path = __dirname + '/../';
var token = {
    create: function () {
    },
    token: {
        access_token: 'f1f3351ca286582fa244fbcafa9e643cf4452301',
        expires_in: 604800,
        scope: null,
        user_id: false,
        is_admin: false,
        refresh_token: '9c781c02708b2c336e66dcc6f16da872ce75e04a',
        server_time: 1409231368,
        expires_at: 'Thu Sep 04 2014 15:09:29 GMT+0200 (CEST)'
    },
    expired: function () {
        return false;
    },
    refresh: function () {
        var _token = token;
        return _token;
    }
};

var responses = {
    User: {
        get: {
            body: '{"name":"SPP Container","version":"0.2","api":2,"object":"User","type":"collection","code":200,"request":{"reset":1925,"limit":0,"remaining":-8},"debug":{"route":{"name":"List users","url":"\/api\/2\/users","controller":"Api\/2\/User.users"},"params":{"options":[],"where":[]}},"meta":{"count":10,"offset":0},"error":null,"data":[{"id":"51375fb0efd04b580b000002","displayName":"Mikael Lindstr\u00f6m","gender":"male","lastLoggedIn":"2014-08-28 16:43:26","locale":"nb_NO","name":{"familyName":"Lindstr\u00f6m","givenName":"Mikael","formatted":"Mikael Lindstr\u00f6m"},"preferredUsername":"MikaelLindstrom","published":"2013-03-06 16:24:32","status":1,"updated":"2014-08-28 23:49:49","userId":"102732","utcOffset":"+01:00"},{"id":"53fefdd8efd04b9972000002","userId":"238868","status":0,"displayName":"johnd","preferredUsername":"johnd","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 12:00:56","updated":"2014-08-28 12:00:56","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0a28efd04b9975000000","userId":"238878","status":0,"displayName":"johnd.1409223207588","preferredUsername":"johnd1409223207588","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 12:53:28","updated":"2014-08-28 12:53:31","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0b30efd04b7873000001","userId":"238879","status":0,"displayName":"johnd.1409223471448","preferredUsername":"johnd1409223471448","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 12:57:52","updated":"2014-08-28 12:57:53","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0b59efd04b1f74000000","userId":"238880","status":0,"displayName":"johnd.1409223513020","preferredUsername":"johnd1409223513020","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 12:58:33","updated":"2014-08-28 12:58:35","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0b9befd04b0a79000000","userId":"238881","status":0,"displayName":"johnd.1409223578269","preferredUsername":"johnd1409223578269","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 12:59:39","updated":"2014-08-28 12:59:41","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0baaefd04bd606000000","userId":"238882","status":0,"displayName":"johnd.1409223593338","preferredUsername":"johnd1409223593338","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 12:59:53","updated":"2014-08-28 12:59:55","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0c02efd04b8c7f000000","userId":"238883","status":0,"displayName":"johnd.1409223681828","preferredUsername":"johnd1409223681828","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 13:01:22","updated":"2014-08-28 13:01:24","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0c13efd04b0a79000003","userId":"238884","status":0,"displayName":"johnd.1409223698778","preferredUsername":"johnd1409223698778","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 13:01:39","updated":"2014-08-28 13:01:41","lastLoggedIn":false,"locale":"nb_NO"},{"id":"53ff0c36efd04b8f7f000000","userId":"238885","status":0,"displayName":"johnd.1409223733340","preferredUsername":"johnd1409223733340","gender":"undisclosed","utcOffset":"+02:00","name":{"familyName":"","givenName":"","formatted":""},"published":"2014-08-28 13:02:14","updated":"2014-08-28 13:02:17","lastLoggedIn":false,"locale":"nb_NO"}]}'
        },
        post: {
            body: '{"name":"SPP Container","version":"0.2","api":2,"object":"User","type":"element","code":200,"request":{"reset":1922,"limit":0,"remaining":-9},"debug":{"route":{"name":"Get and update users","url":"\/api\/2\/user\/{id}","controller":"Api\/2\/User.user"},"params":{"options":[],"where":{"id":"102732"}}},"meta":null,"error":null,"data":{"id":"51375fb0efd04b580b000002","accounts":{"4d00e8d6bf92fc8648000000":{"id":"4d00e8d6bf92fc8648000000","accountName":"SPiD","domain":"https:\/\/stage.payment.schibsted.no\/"},"4fc61301efd04bae41000001":{"id":"4fc61301efd04bae41000001","domain":"fvn.no","accountName":"Startapp"},"5187b23defd04bab65000001":{"id":"5187b23defd04bab65000001","domain":"aftenbladet.no","accountName":"Mediehuset Stavanger Aftenblad - Android"},"4f0d95c6efd04b7c44000005":{"id":"4f0d95c6efd04b7c44000005","domain":"pluss-stage.vg.no","accountName":"VG+ p\u00e5 alle platformer"},"506c29eaefd04b147c000001":{"id":"506c29eaefd04b147c000001","domain":"www.aftenbladet.no","accountName":"Aftenbladet"},"51b5a3c1efd04b8e68000003":{"id":"51b5a3c1efd04b8e68000003","domain":"www.fvn.no","accountName":"FVN iPhone app"},"4e8d8fef9caf7c5065000000":{"id":"4e8d8fef9caf7c5065000000","domain":"stage-ambassador.payment.schibsted.no","accountName":"Norwegian Ambassador"},"5236e633efd04b8b7c000000":{"id":"5236e633efd04b8b7c000000","domain":"","accountName":"Magne test client"},"504dffb6efd04b4512000000":{"id":"504dffb6efd04b4512000000","domain":"stage.payment.schibsted.no","accountName":"SPiD App iOS"},"52849cebefd04b313c00000e":{"id":"52849cebefd04b313c00000e","domain":"www.bakemag.no","accountName":"Bake for iOS"}},"addresses":{"home":{"type":"home","latitude":"","longitude":"","formatted":"Norge","streetAddress":"","streetNumber":"","streetEntrance":"","floor":"","apartment":"","locality":"","region":"","postalCode":"","country":"Norge"}},"birthday":"1980-10-01","currentLocation":[],"displayName":"Mikael Lindstr\u00f6m","email":"mikael.lindstrom@schibstedpayment.no","emailVerified":"2013-03-06 16:24:52","emails":[{"value":"mikael.lindstrom@schibstedpayment.no","type":"other","primary":"true","verified":"true","verifiedTime":"2013-03-06 16:24:52"}],"gender":"male","hashType":"bcrypt","lastAuthenticated":"2014-08-25 15:01:19","lastLoggedIn":"2014-08-28 16:43:26","locale":"nb_NO","merchants":[47000,47002,47005,47001,47006],"name":{"familyName":"Lindstr\u00f6m","givenName":"Mikael","formatted":"Mikael Lindstr\u00f6m"},"passwordChanged":"2013-03-27 12:09:31","phoneNumber":"+46706476583","phoneNumberVerified":"2014-03-24 13:12:48","phoneNumbers":[{"value":"+46706476583","type":"mobile","verified":"true","verifiedTime":"2014-03-24 13:12:48","primary":"true"}],"photo":"https:\/\/secure.gravatar.com\/avatar\/c1fe3f3caaff4960a8a38152c3ab0791?s=200","preferredUsername":"MikaelLindstrom","published":"2013-03-06 16:24:32","status":1,"updated":"2014-08-29 00:17:05","url":"","userId":"102732","utcOffset":"+01:00","verified":"2014-03-24 13:12:48"}}'
        }
    },
    Trait: {
        post: {
            body: '{"name":"SPP Container","version":"0.2","api":2,"object":"User","type":"element","code":200,"request":{"reset":1920,"limit":0,"remaining":-10},"debug":{"route":{"name":"List and manage user traits","url":"\/api\/2\/user\/{id}\/traits","controller":"Api\/2\/User.user_traits"},"params":{"options":[],"where":{"id":"102732"}}},"meta":null,"error":null,"data":{"spid-client-node":"You have been tagged by the node.js client!"}}'
        },
        del: {
            body: '{"name":"SPP Container","version":"0.2","api":2,"object":"User","type":"collection","code":202,"request":{"reset":3555,"limit":0,"remaining":-6},"debug":{"route":{"name":"Delete user trait","url":"\/api\/2\/user\/{id}\/trait\/{trait}","controller":"Api\/2\/User.user_trait"},"params":{"options":[],"where":{"trait":"spid-client-node","id":"102732"}}},"meta":{"count":0,"offset":0},"error":null,"data":[]}'
        },
        get: {
            body: '{"name":"SPP Container","version":"0.2","api":2,"object":"User","type":"collection","code":200,"request":{"reset":1917,"limit":0,"remaining":-12},"debug":{"route":{"name":"List and manage user traits","url":"\/api\/2\/user\/{id}\/traits","controller":"Api\/2\/User.user_traits"},"params":{"options":[],"where":{"id":"102732"}}},"meta":{"count":0,"offset":0},"error":null,"data":[]}'
        }
    }
};


var spidClient = require("../lib/spid-client")({}, {
    request : {
        get : function (url, callback) {
            var response = responses.User.get;
            callback(null, response, {});
        },
        del : function (url, callback) {
            var response = responses.Trait.del;
            callback(null, response, {});
        },
        post : function (opts, callback) {
            var response = responses.Trait.post;
            callback(null, response, {});
        }
    },

    oauthModule : function (opts) {
        return {
            Client : {
                getToken : function (opts, callback) {
                    callback(null, token);
                }
            },
            AccessToken : {
                create : function () {
                    return token;
                }
            }
        };
    }
});





var userId = 42,
    birthday = '1980-10-01',
    trait_key = 'spid-client-node',
    trait_value = 'You have been tagged by the node.js client!';

buster.testCase('spid-client-node', {
    setUp: function () {
        this.timeout = 5000;
    },

    'Unit tests for spid-client.js:': {
        'getServerToken': function (done) {
            spidClient.getServerToken(function (err, token) {
                if (err) { throw err; }
//                console.log(token);
                assert(token.token.access_token);
                assert(token.token.refresh_token);
                assert(_.isFunction(token.refresh));
                assert(_.isFunction(token.expired));
                done();
            });
        },

        'Get all users': function (done) {
            spidClient.getServerToken(function (err, token) {
                if (err) { throw err; }
//                console.log(token);
                spidClient.GET(token, "/users", function (err, response) {
                    if (err) { throw err; }
                    var body = JSON.parse(response.getResponseBody());
                    assert(_.isObject(body.meta));
                    assert(_.isArray(body.data));
                    refute(body.error);
                    userId = body.data[0].userId;
                    done();
                });
            });
        },

        '//Create a new user' : function (done) {
            spidClient.getServerToken(function (err, token) {
                if (err) { throw err; }
                var params = {
                    email: "johnd." + (new Date().getTime()) + "@example.com"
                };
                spidClient.POST(token, "/user", params, function (err, response) {
                    if (err) { throw err; }
                    var body = JSON.parse(response.getResponseBody());
                    assert(_.isObject(body.data));
                    refute(body.error);
                    userId = body.data.userId;
                    done();
                });
            });
        },

        'Update the user' : function (done) {
            spidClient.getServerToken(function (err, token) {
                if (err) { throw err; }
                var params = {
                    birthday: birthday
                };
                spidClient.POST(token, "/user/" + userId , params, function (err, response) {
                    if (err) { throw err; }
                    var body = JSON.parse(response.getResponseBody());
                    assert(_.isObject(body.data));
//                    assert.equals(birthday, body.data.birthday);
                    refute(body.error);
                    done();
                });
            });
        },


        'Set user trait' : function (done) {
            spidClient.getServerToken(function (err, token) {
                if (err) { throw err; }
                var traits = {};
                traits[trait_key] = trait_value;
                var params = {
                    traits : JSON.stringify(traits)
                };
                spidClient.POST(token, "/user/" + userId + "/traits" , params, function (err, response) {
                    if (err) { throw err; }
                    var body = JSON.parse(response.getResponseBody());
                    assert(_.isObject(body.data));
                    refute(body.error);
                    done();
                });
            });
        },

        'Delete user trait' : function (done) {
            spidClient.getServerToken(function (err, token) {
                if (err) { throw err; }
                var traits = {};
                traits[trait_key] = trait_value;
                spidClient.DELETE(token, "/user/" + userId + "/trait/" + trait_key, function (err, response) {
                    if (err) { throw err; }
                    var body = JSON.parse(response.getResponseBody());
                    assert(_.isObject(body.data));
                    refute(body.error);
                    done();
                });
            });
        },

        'Get user trait on new users' : function (done) {
            spidClient.getServerToken(function (err, token) {
                if (err) { throw err; }
                spidClient.GET(token, "/user/" + userId + "/traits" , function (err, response) {
                    if (err) { throw err; }
                    var body = JSON.parse(response.getResponseBody());
                    assert(_.isObject(body.data));
                    refute(body.error);
                    refute(body.data[trait_key]);
                    done();
                });
            });
        }

    },



});

