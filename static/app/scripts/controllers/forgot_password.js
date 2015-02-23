'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:ForgotPasswordCtrl
 * @description
 * # ForgotPasswordCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('ForgotPasswordCtrl', function($http, Restangular, $scope, $auth, $alert, $location) {

        $scope.sendPassword = function(){

            // Simple POST request example (passing data) :
            $http.post('/forgotpasswordlink', {email:$scope.email}).
              success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                console.log(data);
                $scope.error = data;
              }).
              error(function(error) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                $scope.error = error.data;
              });

        }



	});