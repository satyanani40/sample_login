angular.module('weberApp')
.directive('cancelrequest', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            console.log("sdfsdf")
            element.click(function(){
               console.log('sdfsd')
               var html ='<addfriend><button ng-click="cancelrequest()" class="btn btn-primary">cancel request</button></addfriend>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });

        }
    };
}).directive('addfriend', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {

            element.click(function(){
               var html ='<cancelrequest><button ng-click="AddFriend()" class="btn btn-primary">AddFriend</button></cancelrequest>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });

        }
    };
}).directive('friends', function ($compile) {
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
}).directive('unfriend', function ($compile) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            element.click(function(){
               var html ='<addfriend><button ng-click="unfriend()" class="btn btn-primary">unfriend</button></addfriend>';
               var e =$compile(html)(scope);
               element.replaceWith(e);
            });

        }
    };
})
.directive('chatbar', function () {
    return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "/static/app/views/chat.html",
        controller:function ($scope, $auth, CurrentUser1,$http,$window,
        $document, Restangular,ChatActivity) {
            $http.get('/api/me', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
            }).success(function(userId) {
                    this.userId = userId;
                    Restangular.one('people', JSON.parse(userId)).get().then(function(user) {
                        this.user = user;
                        var chatactivity = new ChatActivity(user);

                        chatactivity.getChatFriends().then(function(data){
                            $scope.chatusers = data;
                        });

                       $scope.send_message = function(receiverid){
                           var text = document.getElementById('send_'+receiverid).value;
                           document.getElementById('send_'+receiverid).value = null;
                           var temp = chatactivity.sendMessage(receiverid,text);

                       }
                        //========save open div=======

                        var getValue = function(){
                            return $window.sessionStorage.length;
                        }

                        var getData = function(){
                          var json = [];
                          $.each($window.sessionStorage, function(i, v){
                            json.push(angular.fromJson(v));
                          });
                          return json;
                        }

                        function display_divs(){
                           console.log('======calling display divs========')
                           previous_divs1 = getData();
                           var count = 490;

                           for(k in previous_divs1){
                                previous_divs1[k].right = count;
                                count = count+300;
                           }

                           $scope.previousdivs = previous_divs1;
                           $scope.previousdivs;

                        }


                        $scope.newchatdiv = function(id, name, height,minimize,maximize){

                            height = typeof height !== 'undefined' ? height : 'auto';
                            minimize = typeof minimize !== 'undefined' ? minimize : false;
                            maximize = typeof maximize !== 'undefined' ? maximize : true;

                            console.log(id+height+minimize+maximize)

                            json = {
                              name:name,
                              id: id,
                              minimize:minimize,
                              maximize:maximize,
                              right:0,
                              height:height
                            }

                            $window.sessionStorage.setItem(id, JSON.stringify(json));
                            display_divs();
                        }

                        $scope.close_div = function(id){
                          console.log(id)
                          //$window.sessionStorage.clear();
                          $window.sessionStorage.removeItem(id);
                          display_divs();
                        }

                        $scope.minimize = function(id){
                            var name = JSON.parse($window.sessionStorage.getItem(id)).name
                            $window.sessionStorage.removeItem(id);
                            $scope.newchatdiv(id, name,'92px',true,false);
                        }
                        $scope.maximize = function(id){
                            var name = JSON.parse($window.sessionStorage.getItem(id)).name
                            $window.sessionStorage.removeItem(id);
                            $scope.newchatdiv(id, name, 'auto ',false,true);
                        }

                            display_divs();
                    });
            });

	    }
    }
}).directive("addchatdiv", function($compile){
	return function(scope, element, attrs){

		element.bind("click", function(){
		     console.log(element[0].name)
		     scope.newchatdiv(element[0].id, element[0].name);
             scope.$apply()

		});
	};
});