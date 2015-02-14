'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('LoginCtrl', function($scope, $auth, $alert,$location) {

		$scope.submitLogin = function() {

			$auth.login({
				email: $scope.formData.email,
				password: $scope.formData.password
			}).then(function(response) {
				$auth.setToken(response.data.token);
			}, function(error) {
				alert("error");
				$alert({
					title: 'Login Failed: ',
					content: error.data.error,
					placement: 'top',
					type: 'danger',
					show: true
				});
			});
		};
	});