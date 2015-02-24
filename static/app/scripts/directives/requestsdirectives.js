angular.module('weberApp')
.directive('checkinfunctions', function ($route, Restangular) {
    return {
        restrict: 'A',
        replace: true,
        link: function ($scope, element, attrs) {

            $scope.removeFriends = function(currentuser, profileuser,operations){
                operations = typeof operations !== 'undefined' ? operations : 'nothingtodo';

                for (k in profileuser.friends){
                    if(profileuser.friends[k] == currentuser._id){
                        profileuser.friends.splice(profileuser.friends.indexOf(currentuser._id),1)
                        profileuser.patch({
                           'friends': profileuser.friends
                        }).then(function(response){
                            console.log("deleted at profile friend")
                            if(operations == 'addfriend'){
                                var d = new Date();
                                var total_time = d.getDate()+d.getDay()+d.getFullYear()+d.getHours()+d.getMilliseconds()+d.getMinutes()+d.getMonth()+d.getSeconds()+d.getTime();
                                var new_request = {'friend_id':currentuser._id,'seen':false,'timestamp':total_time,'daterequest':d}
                                profileuser.notifications.push(new_request);
                                return Restangular.one('people', profileuser._id).patch({
                                    'notifications':profileuser.notifications,
                                    'all_seen':false
                                },{},{'If-Match':response._etag});
                            }

                        });
                    }
                }

                for(temp in currentuser.friends){
                    if(currentuser.friends[temp] ==(profileuser._id)){
                        currentuser.friends.splice(currentuser.friends.indexOf(profileuser._id),1);
                        return currentuser.patch({
                            'friends': currentuser.friends
                        }).then(function(response){
                            console.log('deleted at current user')

                        });
                    }
                }
            }

                $scope.checkInNotifcations = function(cuser, puser){
                    var pn_status = false;
                    var cn_status = false;

                    for(k in puser.notifications){
                        if(puser.notifications[k].friend_id == cuser._id){
                            console.log('yess in profile user notifications')
                            pn_status = true;
                        }

                    }
                    for(k in cuser.notifications){
                        if(cuser.notifications[k].friend_id == puser._id){
                            console.log('yess in current user notifications')
                            cn_status = true;
                        }

                    }
                    return ({cn_status:cn_status, pn_status:pn_status});
                }

                 $scope.checkInFriends = function(cuser, puser){
                    var pf_status = false;
                    var cf_status = false;

                    for(k in puser.friends){
                        if(puser.friends[k] == cuser._id){
                            console.log('yess in profile user friends')
                            pf_status = true;
                        }
                    }

                    for(k in cuser.friends){
                        if(cuser.friends[k] == puser._id){
                            console.log('yess in current user friends')
                            cf_status = true;
                        }
                    }
                    return ({cf_status:cf_status,pf_status:pf_status});
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
                            f_status = $scope.checkInFriends(user, profileuser)
                            if(f_status.pf_status && f_status.cf_status){
                                console.log('alredy friends')
                                $route.reload()

                            }else if((!(f_status.pf_status)&& f_status.cf_status)
                                                    ||
                                    (!(f_status.cf_status) && f_status.pf_status)){
                                    $scope.removeFriends(user, profileuser, 'addfriend').then(function(){
                                        console.log('remove friends add request sent')
                                        var html ='<addfriend><button ng-click="cancelrequest()" class="btn btn-primary">cancel request</button></addfriend>';
                                        e =$compile(html)($scope);
                                        element.replaceWith(e);

                                    });
                            }else if(!(f_status.pf_status && f_status.cf_status )){
                                n_status = $scope.checkInNotifcations(user, profileuser)
                                    if(n_status.pn_status){
                                        console.log('alredy add request sent')
                                        $route.reload()
                                    }else if(n_status.cn_status){
                                        console.log('accept add request first')
                                        $route.reload()
                                    }else{
                                        friendsactivity = new friendsActivity(user,profileuser)
                                        $scope.temps = friendsactivity.AddFriend();
                                        $scope.temps.then(function(data){
                                            var html ='<addfriend><button ng-click="cancelrequest()" class="btn btn-primary">cancel request</button></addfriend>';
                                            e =$compile(html)($scope);
                                            element.replaceWith(e);
                                        });

                                    }



                            }else
                                console.log('nothing to done in add friend request')
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
        link: function ($scope, $element, attrs) {

            $element.click(function(){
                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                $element.html(html);
                $compile($element.contents())($scope);

               var currentuserobj = new CurrentUser();
               currentuserobj.getUserId().then(function(){
                   currentuserobj.getCUserDetails(currentuserobj.userId).then(function(user){
                        var user_obj = Restangular.one('people', $routeParams.username);
		                user_obj.get({ seed : Math.random() }).then(function(profileuser) {

		                 var n_status = $scope.checkInNotifcations(user, profileuser);

                            $scope.currentuser = user;

                            friendsactivity = new friendsActivity($scope.currentuser, profileuser)

                            if(n_status.cn_status && n_status.pn_status){

                                friendsactivity.removeCnotifcations();

                                $scope.rf = friendsactivity.removePnotifcations();
                                $scope.rf.then(function(response){
                                    console.log('remove notifcations at profile user')
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                });


                            }else if(n_status.pn_status){
                                $scope.rf = friendsactivity.removePnotifcations();
                                console.log('===removing===')
                                console.log($scope.rf)

                                $scope.rf.then(function(response){
                                    console.log('remove notifcations at profile user')
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                });
                            }else if(n_status.cn_status){
                                $scope.rf = friendsactivity.removeCnotifcations();
                                $scope.rf.then(function(response){
                                    console.log('remove notifcations at current user')
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                });
                            }

                           else {
                                $route.reload()
                            }
		                });
                   });
               });
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

            $scope.acceptrequest = function(id,view){

                console.log('---------ddddddddddddprofiueeee----')
                console.log(id)
                console.log(view)
                if(view == 'navbarview')
                    $routeParams.username = id;


                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                $element.html(html);
                $compile($element.contents())($scope);

                var currentuserobj = new CurrentUser();
                    currentuserobj.getUserId().then(function(){
                    currentuserobj.getCUserDetails(currentuserobj.userId)
                        .then(function(user){
                            $scope.currentuser = user;
                             var user_obj = Restangular.one('people', $routeParams.username);
                             user_obj.get({ seed : Math.random() }).then(function(profileuser) {

                            var n_status = $scope.checkInNotifcations(user, profileuser)

                            if(n_status.cn_status){
                                friendsactivity = new friendsActivity($scope.currentuser, profileuser)

                                $scope.rf = friendsactivity.accept_request();

                                $scope.rf.then(function(response){
                                if(view == 'navbarview'){
                                    html ='<b>friends</b>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                }else{
                                    html ='<unaddfriend><button ng-click="unfriend()" class="btn btn-primary">unfriend</button></unaddfriend>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                }

                                });

                            }
                            });
                        });
                    });
            }

            $scope.rejectrequest = function(id, view){
                console.log('---------profiueeeennnnn----')
                console.log(id)
                console.log(view)
                if(view == 'navbarview'){
                    console.log('yes in nav bar view')
                    $routeParams.username = id;
                }
                html = '<image src="/static/app/images/loader.gif" alt="no image found" style="position:absolute">';
                $element.html(html);
                $compile($element.contents())($scope);
                var currentuserobj = new CurrentUser();

                    currentuserobj.getUserId().then(function(){

                    currentuserobj.getCUserDetails(currentuserobj.userId)

                        .then(function(user){
                         var user_obj = Restangular.one('people', $routeParams.username);
                             user_obj.get({ seed : Math.random() }).then(function(profileuser) {

                            var n_status = $scope.checkInNotifcations(user, profileuser);

                            $scope.currentuser = user;
                            friendsactivity = new friendsActivity($scope.currentuser, $scope.profileuser)

                            if(n_status.cn_status && n_status.pn_status){

                                friendsactivity.removeCnotifcations();

                                $scope.rf = friendsactivity.removePnotifcations();
                                $scope.rf.then(function(response){
                                if(view == 'navbarview'){
                                    console.log('navbarview')
                                    html ='<b>rejected</b>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);

                                }else{

                                    console.log('userprofileview')
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                }

                                });


                            }
                            else if(n_status.cn_status){
                                $scope.rf = friendsactivity.removeCnotifcations();
                                $scope.rf.then(function(response){
                                     if(view == 'navbarview'){
                                    console.log('navbarview')
                                    html ='<b>rejected</b>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);

                                }else{

                                    console.log('userprofileview')
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                }
                                });
                            }

                            else if(n_status.pn_status){
                                $scope.rf = friendsactivity.removePnotifcations();
                                $scope.rf.then(function(response){
                                    if(view == 'navbarview'){
                                    console.log('navbarview')
                                    html ='<b>rejected</b>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);

                                }else{

                                    console.log('userprofileview')
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    $element.replaceWith(e);
                                }
                                });
                            }else {
                                console.log('nothing to do')

                            }

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

                            var f_status = $scope.checkInFriends(user, profileuser);

                            if(f_status.pf_status && f_status.cf_status){
                                friendsactivity = new friendsActivity(user,profileuser)
                                $scope.temps = friendsactivity.unfriend();
                                $scope.temps.then(function(data){
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    element.replaceWith(e);
                                });
                            }else if(f_status.pf_status){
                                friendsactivity = new friendsActivity(user,profileuser)
                                $scope.temps = friendsactivity.remove_pfriends();
                                $scope.temps.then(function(data){
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    element.replaceWith(e);
                                });

                            }else if(f_status.cf_status){
                                friendsactivity = new friendsActivity(user,profileuser)
                                $scope.temps = friendsactivity.remove_cfriends();
                                $scope.temps.then(function(data){
                                    html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
                                    e =$compile(html)($scope);
                                    element.replaceWith(e);
                                });

                            }else{
                                console.log('nothing to done')
                            }

		                });
                   });
               });


            });

        }
    };
});