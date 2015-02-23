'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('SettingsCtrl', function($route, $location, $scope, $auth, Restangular, InfinitePosts, $alert, $http, CurrentUser, UserService, fileUpload) {
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

			$scope.updateFirstLastName = function() {
                $scope.user.patch({
                    'name':{
                        'first':$scope.edit_first_name,
                        'last':$scope.edit_last_name
                    }
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
	}).directive('pwCheck', [function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    // console.info(elem.val() === $(firstPassword).val());
                    ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                });
            });
        }
    }
}]);