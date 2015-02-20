'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:UserprofileCtrl
 * @description
 * # UserprofileCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
	.controller('UserprofileCtrl', function($scope, $routeParams,$templateCache,
	                                        Restangular, InfinitePosts, UserService,
	                                        CurrentUser, FriendsNotific, friendsActivity) {

		$scope.UserService = UserService;

        var currentuserobj = new CurrentUser();

         currentuserobj.getUserId()
            .then(function(){

                currentuserobj.getCUserDetails(currentuserobj.userId).then(function(user){

                    var user_obj = Restangular.one('people', $routeParams.username);
		            user_obj.get({ seed : Math.random() }).then(function(profileuser) {
		                $scope.profileuser = profileuser;
                        $scope.currentuser = user;
                        $scope.infinitePosts = new InfinitePosts(user_obj);

			            //get all friends
			            if ( $scope.profileuser.friends.length !== 0) {
                            var params = '{"_id": {"$in":["'+($scope.profileuser.friends).join('", "') + '"'+']}}'
                            Restangular.all('people').getList({
                                where:params,
                                seed:Math.random()
                            }).then(function(friends) {
                                $scope.friends = friends;
                            });
			            }

                        var friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)
                        console.log(friendsactivity)
                        $scope.check_relation = function(){
                            $scope.relation = friendsactivity.getRelation();
                            return $scope.relation;
                        }

                        $scope.AddFriend = function(){
                            var user_obj = Restangular.one('people', $routeParams.username);
		                    user_obj.get().then(function(profileuser) {
                                $scope.profileuser = profileuser;
                                friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)
                                $scope.temps = friendsactivity.AddFriend();
                                $scope.temps.then(function(data){
                                    //$scope.profileuser._etag = data._etag;
                                    console.log(data)
                                });
                            });
                        }


                        $scope.cancelrequest = function(){

                            var user_obj = Restangular.one('people', $routeParams.username);

		                    user_obj.get().then(function(profileuser) {

                                $scope.profileuser = profileuser;

                                friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)

                                $scope.cr = friendsactivity.cancelrequest();
                                console.log($scope.cr)
                                /*$scope.cr.then(function(data){
                                    console.log(data)

                                });*/
                            });
                        }

                        $scope.unfriend = function(){

                             var currentuserobj = new CurrentUser();

                             currentuserobj.getUserId().then(function(){

                                currentuserobj.getCUserDetails(currentuserobj.userId).then(function(user){

                                    var user_obj = Restangular.one('people', $routeParams.username);
                                    user_obj.get({seed: Math.random()}).then(function(profileuser) {

                                        $scope.profileuser = profileuser;
                                        $scope.currentuser = user;

                                        friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)

                                        $scope.uf = friendsactivity.unfriend();

                                    });
                                });
                             });
                        }

                        $scope.reject_request = function(){

                         var currentuserobj = new CurrentUser();

                         currentuserobj.getUserId().then(function(){

                            currentuserobj.getCUserDetails(currentuserobj.userId)

                                .then(function(user){

                                    $scope.currentuser = user;
                                    friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)
                                    $scope.rf = friendsactivity.reject_request();
                                    $scope.rf.then(function(response){
                                        console.log(response)
                                    });


                            });
                          });
                        }

                        $scope.accept_request = function(){

                            var currentuserobj = new CurrentUser();

                                 currentuserobj.getUserId().then(function(){

                                    currentuserobj.getCUserDetails(currentuserobj.userId).then(function(user){
                                        var user_obj = Restangular.one('people', $routeParams.username);
                                        user_obj.get().then(function(profileuser) {
                                            $scope.profileuser = profileuser;
                                            $scope.currentuser = user;
                                            friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)
                                            $scope.acceptfrnd = friendsactivity.accept_request();
                                        });
                                    });
                            });
                        }
                    });
                });
           });


	});
/*usefull may be in futhure


    scope.paramsObj = {
         fields: '*',
         limit: 10,
         offset: 0,
         filter: 'parameter in (5,15)'
    }
*/



