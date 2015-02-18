'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:MessagesCtrl
 * @description
 * # MessagesCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('MessagesCtrl', function($route, $scope, $auth, Restangular, InfinitePosts, $alert, $http, CurrentUser, UserService, fileUpload) {
		$scope.UserService = UserService;
		$http.get('/api/me', {
			headers: {
				'Content-Type': 'application/json',
                'Authorization':$auth.getToken()
			}
		}).success(function(user_id) {
			var passReq = Restangular.one("people", JSON.parse(user_id)).get().then(function(result) {
              $scope.user = result;
            });

            $scope.updateUsername = function() {
                $scope.user.patch({
                    'username':$scope.u_username
                }).then(function(response){
                    $route.reload();
                })
			};


			$scope.uploadFile = function(){
				var file = $scope.myFile;
				console.log('file is ' + JSON.stringify(file));
				var uploadUrl = "/fileUpload";
				fileUpload.uploadFileToUrl(file, uploadUrl,$scope.user);
                $route.reload();
			};

			$scope.updateEmail = function() {
                $scope.user.patch({
                    'email':$scope.u_email
                }).then(function(response){
                    $route.reload();
                })
			};

			$scope.updatePassword = function() {
                $scope.user.patch({
                    'password_test':$scope.u_password
                }).then(function(response){
                    $route.reload();
                })
			};

		});
	})
	.directive('validPasswordD', function () {
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