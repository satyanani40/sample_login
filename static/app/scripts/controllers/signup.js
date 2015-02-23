'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:SignupCtrl
 * @description
 * # SignupCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.directive('signupdirective', function ($compile, CurrentUser, Restangular, $routeParams, friendsActivity) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
        },
        controller:function($scope, $location, $auth, $element, $attrs, $transclude){

        	console.log("haiiiiiii")
            $scope.registerUser = function(){

                var html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                $element.html(html);
                $compile($element.contents())($scope);

                $auth.signup({
					email: $scope.formData.email,
					password: $scope.formData.password,
					firstname: $scope.formData.firstname,
					lastname: $scope.formData.lastname,
					username: $scope.formData.firstname+$scope.formData.lastname
				})
				.then(function(response){
					console.log(response.data)

					$location.path('/emaildetails/'+response.data)

				}, function(error) {
					html ='<b>'+error.data.error+'</b>';
					var e =$compile(html)($scope);
					$element.replaceWith(e);
				});
            };
        }
    };
})
.directive('validPasswordC', function () {
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