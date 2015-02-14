'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:SignupCtrl
 * @description
 * # SignupCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('SignupCtrl', function($scope, $auth) {
		$scope.registerUser = function() {
			$auth.signup({
				email: $scope.formData.email,
				password: $scope.formData.password,
				firstname: $scope.formData.firstname,
				lastname: $scope.formData.lastname,
				username: $scope.formData.username
			}).then(function(response) {
				console.log(response.data);
			});
		};
	}).directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue, $scope) {
                var noMatch = viewValue != scope.myForm.password.$viewValue
                ctrl.$setValidity('noMatch', !noMatch)
            })
        }
    }
});