'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:EmailCtrl
 * @description
 * # EmailCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('EmailCtrl', function($http, Restangular, $scope, $auth, $alert, $location, $routeParams) {

        var element = $routeParams.userId;

        // Simple POST request example (passing data) :
        $http.get('/api/people/'+element).
          success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(data);
            $scope.user = data;
            $location.path('/#/login');
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });


	});