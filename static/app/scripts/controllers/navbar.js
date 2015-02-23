'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:NavbarCtrl
 * @description
 * # NavbarCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.directive('navbar', function () {
    return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "/static/app/views/navbar.html",
        controller:function ($scope, $auth, CurrentUser, $alert,
                             $location,$http,Restangular,ChatActivity,
                             SearchActivity,FriendsNotific,friendsActivity) {

            //this is the testing part of the search bar in navbar

            var searchFriends = Restangular.all('people').getList();

            searchFriends.then(function(database_friends){

                $scope.friends1 = database_friends;

            });



              $scope.filterFunction = function(element) {
                return element.name.match(/^Ma/) ? true : false;
              };


              $scope.menuOpened = false;
              $scope.noteOpened = false;

              $scope.noteMenu = function(event) {


                $scope.noteOpened = !($scope.noteOpened);
                event.stopPropagation();

              };


              $scope.toggleMenu = function(event) {
                  $scope.menuOpened = !($scope.menuOpened);

              // Important part in the implementation
              // Stopping event propagation means window.onclick won't get called when someone clicks
              // on the menu div. Without this, menu will be hidden immediately
                  event.stopPropagation();
              };

              window.onclick = function() {
                  if ($scope.menuOpened) {
                      $scope.menuOpened = false;

                // You should let angular know about the update that you have made, so that it can refresh the UI
                      $scope.$apply();
                  }

                  if ($scope.noteOpened) {
                      $scope.noteOpened = false;

                // You should let angular know about the update that you have made, so that it can refresh the UI
                      $scope.$apply();
                  }

              };
            //####################ending part of testing part###########





 			$scope.dropdown = [{
				"text": "Settings",
				"href": "#/settings"
			},{
				"text": "Logout",
				"click": "logout()"
			}];

			$scope.logout = function() {
				//CurrentUser.reset();
				$auth.logout();
				$location.path("/login");
			};

			$scope.isAuthenticated = function() {
				return $auth.isAuthenticated();
			};


			$http.get('/api/me', {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': $auth.getToken()
				}
			}).success(function(user_id) {

				Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
				$scope.currentUser = user;
				$scope.searchActivity = new SearchActivity(user);
				var requested_peoples = [];
				var accepted_peoples = [];

				function get_friend_notifications(currentUser){
					var notific = new FriendsNotific(currentUser);
					notific.then(function(data){

							accepted_peoples = [];

							var currentuser = data
							var k = null;
							for (k in currentuser.notifications){
								if(currentuser.notifications[k].seen == false){
									requested_peoples.push(currentuser.notifications[k].friend_id)
								}
							}

							k= null;
							for (k in currentuser.accept_notifications){
								if(currentuser.accept_notifications[k].seen == false){
									accepted_peoples.push(currentuser.accept_notifications[k].accepted_id)
								}
							}

							console.log(accepted_peoples.length)

							if(requested_peoples.length+accepted_peoples.length > 0){

								if(!(currentUser.all_seen)){
									$scope.newnotific = requested_peoples.length+accepted_peoples.length
								}else{
									$scope.newnotific = null;
								}

							}else{
								$scope.newnotific = null;
							}
					});
				}


				get_friend_notifications(user);

				var source = new EventSource('/stream/'+user._id);

				source.onmessage = function (event) {

					data = JSON.parse(event.data)
					if(parseInt(data.searchNotific)){
     					$scope.searchActivity = new SearchActivity(user);
     				}

     				if(parseInt(data.friendsnotifc)){
     					$http.get('/api/me', {
							headers: {
								'Content-Type': 'application/json',
								'Authorization': $auth.getToken()
							}
						}).success(function(user_id) {
							Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
									get_friend_notifications(user);
							});

						});
					}
				};

  				$scope.getNewNotifcations = function(){
					$scope.newnotific = null;
  					$http.get('/api/me', {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': $auth.getToken()
						}
					}).success(function(user_id) {

						Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
								var anotific = [];
								var reqnotific = [];
								var k = null;
								for(k in user.accept_notifications){
									user.accept_notifications[k].seen = true
									anotific.push(user.accept_notifications[k].accepted_id)
								}

								k = null;

								for(k in user.notifications){
									user.notifications[k].seen = true
									reqnotific.push(user.notifications[k].friend_id)
								}

								user.patch(
								{	'all_seen':true,
									'accept_notifications':user.accept_notifications,
									'notifications': user.notifications
								}
								).then(function(data){
								});
									var params = '{"_id": {"$in":["'+(reqnotific).join('", "') + '"'+']}}'
									Restangular.all('people').getList({
										where : params,
										seed: Math.random()
									}).then(function(response){
										$scope.rpeoples = response;
									});

									var params = '{"_id": {"$in":["'+(anotific).join('", "') + '"'+']}}'
									Restangular.all('people').getList({
										where : params,
										seed: Math.random()
									}).then(function(resposne){
										$scope.apeoples = resposne;
									});

							});
						});
					}
  				$scope.confirmrequest = function(id){
					$http.get('/api/me', {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': $auth.getToken()
						}
					}).success(function(user_id) {
						Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
							var isInRequests = true;
							if(isInRequests){
								Restangular.one('people',id).get({seed: Math.random()}).then(function(profileuser){
									var friendsactivity = new friendsActivity(user,profileuser)
									console.log('comes to add friend')
									$scope.acceptfrnd = friendsactivity.accept_request();

								});
							}
						});
					});
  				}
			});
		});
	}
  }
});