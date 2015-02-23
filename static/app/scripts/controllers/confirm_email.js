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

        var element = $routeParams.random_generate_token;

        // Simple POST request example (passing data) :
        /*$http.get('/api/people/'+element).
          success(function(data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
            console.log(data);
            $scope.user = data;
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
          });

          console.log($scope.user);*/

          var em = Restangular.one('people',element).get().then(function(user) {
              $scope.user = user;
              console.log($scope.user);

              $scope.user.patch({
                    'email_confirmed':true
                }).then(function(response){
                    console.log(response);
                    $location.path('/#/login');
                })


            });





	});