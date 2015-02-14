'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the weberApp
 */
/*angular.module('weberApp')
	.controller('NavbarCtrl', function($scope, $auth, CurrentUser, $alert, $location, UserService) {


		$scope.UserService = UserService;





		$scope.dropdown = [{
			"text": "Settings",
			"href": "#/settings"
		},{
			"text": "Logout",
			"click": "logout()"
		}];
		$scope.logout = function() {
			CurrentUser.reset();
			$auth.logout();
			$location.path("/login");
		};
		$scope.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

	});*/