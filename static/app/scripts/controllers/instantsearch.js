'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:InstantsearchCtrl
 * @description
 * # InstantsearchCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
  .controller('InstantsearchCtrl', function ($scope, $routeParams, $location, Restangular,$http,$auth) {

  $scope.searching = function(){

   var params = '{"keywords": {"$in":["'+($scope.search.split(" "))+'"]}}'
   var params2 = '{"author":1}'
        Restangular.all('people/posts').getList({where :params,embedded :params2}).then(function(data) {
						$scope.results = data
        });
   };

    $scope.searchSubmit = function(){
        $location.path("/search").search({q: $scope.search});
    };
    
   });

