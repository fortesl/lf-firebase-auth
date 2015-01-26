An angular module for user authentication to the Firebase email & password authentication service.

Angular module name: <b>lfFirebaseAuth</b>


Name of service: <b>lfFirebaseAuthService</b>

<b>Important:</b> Calling module must declare a constant string named FIREBASE_URL containing the url of a firebase database.

Methods available on the lfFirebaseAuthService:
-----------------------------------------------
<ul>
<li>add - creates a new user</li>
<li>authServiceError - returns an object with details of the last error occurred</li>
<li>changePassword - changes a user password</li>
<li>isLoggedIn - returns true if user is logged in, returns false otherwise</li>
<li>isTemporaryPassword - returns true if user logged in with a temporary password. returns false otherwise</li>
<li>login - signs in an existing user</li>
<li>logout - logs out current user</li>
<li>resetPassword - Creates a temporary password and generates email to user for resetting current password</li>
<li>user - returns an object containing user properties</li>



Usage example
-------------
    var myApp = angular.module('myApp', ['lfFirebaseAuth']);
    myApp.constant('FIREBASE_URL',  'https://mydb.firebaseio.com');  // Needed by the auth service!!!

    myApp.controller('MyController', ['lfFirebaseAuthService', function(lfFirebaseAuthService) {
       var self = this;

        self.createUser = function() {
            lfFirebaseAuthService.add({email:'joe@me.com', password:'12345678', name: 'john doe'}, true).then(function(){
                    self.userServiceError = {};
                    $location.path('/#/');
                }, function(error) {
                    self.userServiceError = error;
                });
        };

    });
