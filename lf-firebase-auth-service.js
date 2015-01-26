/**
 * @ngdoc service
 * @name lfFirebaseAuth.lfFirebaseAuthService
 * @description
 * authentication for the Firebase password authentication service.
 * Calling module must have defined a firebase URL, named 'FIREBASE_URL'
 *
 * @requires FIREBASE_URL a string constant with the firebase url.
 *
 * @filename: user-service.js
 * @author lfortes on 11/27/2014.
 *
 * */


(function () {
    'use strict';

    angular.module('lfFirebaseAuth', []).factory('lfFirebaseAuthService', ['FIREBASE_URL', '$rootScope', '$q', function(FIREBASE_URL, $rootScope, $q) {

        var authServiceError = {};
        var currentUser = {};
        var temporaryPassword = false;
        var BACKEND = new Firebase(FIREBASE_URL);

        var loginAfterCreateUser = function(user, login, callback) {
            BACKEND.authWithPassword(user, function(error, authData) {
                if (error === null) {
                    authServiceError = {};
                    var userData = user;
                    userData.id = authData.uid;
                    delete userData.password;
                    delete userData.repeatPassword;
                    delete userData.repeatEmail;
                    BACKEND.child('lfUsers').child(authData.uid).set(userData);
                    if (login) {
                        currentUser = userData;
                        $rootScope.$emit('USER_LOGGED_IN_EVENT');
                        window.localStorage.setItem('storeUser', angular.toJson(currentUser));
                    }
                    else {
                        BACKEND.unauth();
                        currentUser = {};
                    }
                    callback(true);
                }
                else {
                    authServiceError = error;
                    callback(false);
                }
            });
        };

        var getUserData = function(authData) {
            //TODO: get user from localStorage or backend
            var local = angular.fromJson(window.localStorage.getItem('storeUser'));
            if (local) {
                currentUser = local;
            }
            else {
                var sync = BACKEND.child('lfUsers').child(authData.uid);
                sync.on('value', function(snapshot) {
                    currentUser = snapshot.val();
                    $rootScope.$emit('USER_LOGGED_IN_EVENT');
                    window.localStorage.setItem('storeUser', angular.toJson(currentUser));
                });
            }
        };

        var processServerResponse = function(error) {
            if (error === null) {
                authServiceError = {};
                return true;
            }
            else {
                authServiceError = error;
                return false;
            }
        };

        return {
            /**
             * Adds a new user.  Returns promise with success and failure results.
             * Upon successful user creation, if login parameter is true, user is automatically signed in
             * and a 'USER_LOGGED_IN_EVENT' is emitted on $rootScope.
             * @param user {object} object with required 'mail' and 'password' fields. Other optional fields
             *        will be stored in the authentication server 'lfUsers' file. Fields 'repeatPassword' and 'repeatEmail, if present, are not stored.
             * @param login {boolean} true if should login after user is created, false if should not login
             */
            add: function(user, login) {
                return $q(function(resolve, reject) {
                    BACKEND.createUser(user, function(error) {
                        if (error === null) {
                            loginAfterCreateUser(user, login, function(userIn) {
                                if (userIn) { resolve('Success'); }
                                else { reject(authServiceError);}
                            });
                        } else {
                            authServiceError = error;
                            reject(error); 
                        }
                    });
                });

            },

            /**
             * Logs in an existing user.  Returns promise with success and failure results.
             * On successful login, it emits 'USER_LOGGED_IN_EVENT' on $rootScope
             * @param user {object} object with 'mail' and 'password' fields
             */
            login: function(user) {
                return $q(function(resolve, reject) {
                    BACKEND.authWithPassword(user, function(error, authData) {
                        if (error === null) {
                            // user authenticated with Firebase
                            getUserData(authData);
                            temporaryPassword = authData.password.isTemporaryPassword;
                            authServiceError = {};
                            resolve('logged in');
                        } else {
                            authServiceError = error;
                            reject(error);
                        }
                    });
                });
            },

            /**
             * Returns {boolean} true if user is logged in.
             * @returns {boolean}
             */
            isLoggedIn: function() {
                var authData = BACKEND.getAuth();
                if (authData) {
                    getUserData(authData);
                    return true;
                } else {
                    return false;
                }
            },

            /**
             * Logs out current user.
             */
            logout: function() {
                BACKEND.unauth();
                currentUser = {};
                localStorage.removeItem("storeUser");
            },

            /**
             * Returns an error object with 'message' and other properties, if error exists. Otherwise returns an empty object.
             * @returns {{}}
             */
            authServiceError: function() { return authServiceError; },

            /**
             * Returns logged in user.
             * @returns {{}}
             */
            user: function() { return currentUser; },

            /**
             * Resets user password. Returns promise with success and failure results.
             * @param user {object} object with 'email' property
             */
            resetPassword: function(user) {
                return $q(function(resolve, reject) {
                    BACKEND.resetPassword(user, function(error) {
                        var success = processServerResponse(error);
                        if (success) { resolve('Success'); }
                        else { reject(authServiceError); }
                    });
                });
            },

            /**
             * Returns true if current user password is temporary
             * @returns {boolean}
             */
            isTemporaryPassword: function() { return temporaryPassword; },

            /**
             * Changes user password. Returns promise with success and failure results.
             * @param user {object} object with 'email', 'oldPassword', and 'newPassword' properties.
             */
            changePassword: function(user) {
                return $q(function(resolve, reject) {
                    BACKEND.changePassword(user, function(error) {
                        var success = processServerResponse(error);
                        if (success) { resolve('Success'); }
                        else { reject(authServiceError); }
                    });
                });
            }

        };
    }]);

})();