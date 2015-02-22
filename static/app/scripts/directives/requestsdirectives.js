angular.module('weberApp')
.directive('checkinfunctions', function ($route) {
    return {
        restrict: 'A',
        replace: true,
        link: function ($scope, element, attrs) {

             console.log('loading checking functions');
                $scope.checkInNotifcations = function(cuser, puser){
                    var status = true;
                    console.log('checking')

                    for(k in puser.notifications){
                        console.log('profile user notifications')
                        console.log(puser.notifications[k])
                        if(puser.notifications[k].friend_id == cuser._id){
                            console.log('yess in profile user notifications')
                            status = false;
                        }

                    }
                    for(k in cuser.notifications){
                        console.log('current user notifications')
                        console.log(cuser.notifications[k])
                        if(cuser.notifications[k].friend_id == puser._id){
                            console.log('yess in current user notifications')
                            status = false;
                        }

                    }
                    return status;

                }

                 $scope.checkInFriends = function(cuser, puser){
                    var status = true;

                    for(k in puser.friends){
                        console.log('profile user friends')
                        console.log(puser.friends[k])
                        if(puser.friends[k] == cuser._id){
                            console.log('yess in profile user friends')
                            status = false;
                        }
                    }

                    for(k in cuser.friends){
                        console.log('current user notifications')
                        console.log(cuser.friends[k])
                        if(cuser.friends[k] == puser._id){
                            console.log('yess in current user friends')
                            status = false;
                        }
                    }
                    return status;
                }

        }
    };
})


.directive('cancelrequest', function ($compile, CurrentUser, Restangular, $routeParams, $route,friendsActivity) {
    return {
        restrict: 'E',
        replace: true,

        link: function ($scope, element, attrs ) {


            element.click(function(){

                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                element.html(html);
                $compile(element.contents())($scope);
                var currentuserobj = new CurrentUser();


                currentuserobj.getUserId().then(function(){

                   currentuserobj.getCUserDetails(currentuserobj.userId).then(function(user){
                        var user_obj = Restangular.one('people', $routeParams.username);
                        user_obj.get({ seed : Math.random() }).then(function(profileuser) {

                            //console.log('-----------check in friends user--------')
                            //console.log(checkInFriends(user, profileuser))
                            //&& (checkInFriends(user, profileuser))
                            if(($scope.checkInNotifcations(user, profileuser)) && $scope.checkInFriends(user, profileuser)){

                                friendsactivity = new friendsActivity(user,profileuser)
                                $scope.temps = friendsactivity.AddFriend();
                                $scope.temps.then(function(data){
                                    var html ='<addfriend><button ng-click="cancelrequest()" class="btn btn-primary">cancel request</button></addfriend>';
                                    e =$compile(html)($scope);
                                    element.replaceWith(e);
                                });
                            }else{
                                $route.reload();
                            }

                        });
                   });
                });
            });
        },
    };
})

.directive('addfriend', function ($compile, CurrentUser, Restangular, $routeParams, friendsActivity, $route) {
    return {
        restrict: 'E',
        replace: true,
        link: function ($scope, element, attrs) {

            element.click(function(){
                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                element.html(html);
                $compile(element.contents())($scope);

               var currentuserobj = new CurrentUser();
               currentuserobj.getUserId().then(function(){
                   currentuserobj.getCUserDetails(currentuserobj.userId).then(function(user){
                        var user_obj = Restangular.one('people', $routeParams.username);
		                user_obj.get({ seed : Math.random() }).then(function(profileuser) {

		                    if($scope.checkInFriends(user,profileuser)){

                                friendsactivity = new friendsActivity(user,profileuser)
                                $scope.temps = friendsactivity.cancelrequest();
                                console.log(friendsactivity)
                                $scope.temps.then(function(data){
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    element.replaceWith(e);
                                });

                            }else{
                                $route.reload()
                            }

		                });
                   });
               });
            });
        }
    };
})
.directive('friends', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            element.click(function(){
               var html ='<b>friends</b>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });
        }
    };
})
.directive('acceptreject', function ($compile, CurrentUser, Restangular, $routeParams, friendsActivity) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {},
        controller:function($scope, $element, $attrs, $transclude){
            $scope.acceptrequest = function(){

                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                $element.html(html);
                $compile($element.contents())($scope);

                var currentuserobj = new CurrentUser();
                    currentuserobj.getUserId().then(function(){
                    currentuserobj.getCUserDetails(currentuserobj.userId)
                        .then(function(user){
                            $scope.currentuser = user;


                            friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)
                            $scope.rf = friendsactivity.accept_request();

                            $scope.rf.then(function(response){
                                html ='<unaddfriend><button ng-click="unfriend()" class="btn btn-primary">unfriend</button></unaddfriend>';
                                e =$compile(html)($scope);
                                $element.replaceWith(e);
                            });


                        });
                    });
            }

            $scope.rejectrequest = function(){
                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                $element.html(html);
                $compile($element.contents())($scope);
                var currentuserobj = new CurrentUser();

                    currentuserobj.getUserId().then(function(){

                    currentuserobj.getCUserDetails(currentuserobj.userId)

                        .then(function(user){

                            $scope.currentuser = user;
                            friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)
                            $scope.rf = friendsactivity.reject_request();
                            $scope.rf.then(function(response){
                                html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                e =$compile(html)($scope);
                                $element.replaceWith(e);
                            });


                        });
                    });
            }
        }
    };
})
.directive('unaddfriend', function ($compile, CurrentUser, Restangular, $routeParams, friendsActivity,$route) {
    return {
        restrict: 'E',
        replace: true,
        link: function ($scope, element, attrs) {

            element.click(function(){
                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                element.html(html);
                $compile(element.contents())($scope);

               var currentuserobj = new CurrentUser();
               currentuserobj.getUserId().then(function(){
                   currentuserobj.getCUserDetails(currentuserobj.userId).then(function(user){
                        var user_obj = Restangular.one('people', $routeParams.username);
		                user_obj.get({ seed : Math.random() }).then(function(profileuser) {



                            if(!($scope.checkInFriends(user,profileuser))){

                                friendsactivity = new friendsActivity(user,profileuser)
                                $scope.temps = friendsactivity.unfriend();
                                $scope.temps.then(function(data){
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    element.replaceWith(e);
                                });
                            }else{
                                $route.reload();
                            }
		                });
                   });
               });


            });

        }
    };
});