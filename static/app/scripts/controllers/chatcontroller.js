angular.module('weberApp')
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
                        //namespace = 'chat';
                         if(user.friends.length !== 0){
                            chatactivity.getChatFriends().then(function(data){
                                $scope.chatusers = data;
                            });
                         }
						var socket = io.connect('http://192.168.0.100:8000');

						socket.on('connect', function() {
							socket.emit('connect', {data: user._id});
						});


                        socket.on('join_status', function(msg) {
                            if(msg.data){
                                console.log('successfully joined into room');
                            }
                        });

                         socket.on('receive_messages', function(msg) {
                              new_message = {}
                              if(user._id == msg.senderid){
                                new_message = {
                                              sender :{
                                                name:{
                                                    first:user.name.first
                                                },
                                                picture :{
                                                    medium:user.picture.medium

                                                },
                                                _id:msg.senderid
                                              },

                                              receiver:{
                                                _id:msg.receiverid
                                              },

                                              message:msg.message
                                }
                              }else{

                                details = JSON.parse($window.sessionStorage.getItem(msg.senderid));

                                if($window.sessionStorage.getItem(msg.senderid) == null){
                                    $scope.chatnotification = 'New_Message';

                                }else if(!(details.minimize)){

                                    $scope.chatnotifcation = null;
                                    $scope.chatdivnotification = null;

                                        new_message = {
                                                  sender :{
                                                    name:{
                                                        first:details.name
                                                    }
                                                  },
                                                  sender :{
                                                    picture :{
                                                        medium:details.image

                                                    }
                                                  },
                                                  message:msg.message
                                    }
                                }else if(details.minimize){
                                    $scope.chatdivnotification = 'new_Message';

                                }else{}

                              }

                              var data = chatactivity.pushMessage(new_message);
                              $scope.$apply(function(){
                                $scope.loadedMessages = data;
                              });

                         });

                        $scope.send_message = function(receiverid){

                           var text = document.getElementById('send_'+receiverid).value;
                           socket.emit('send_message', {receiverid: receiverid, senderid :user._id  ,message: text});
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
                           previous_divs1 = getData();
                           var count = 300;

                           for(k in previous_divs1){
                                previous_divs1[k].right = count;
                                count = count+300;
                           }

                           $scope.previousdivs = previous_divs1;
                           //$scope.previousdivs;

                        }


                        $scope.newchatdiv = function(id, name, height,minimize,maximize){

                            height = typeof height !== 'undefined' ? height : 'auto';
                            minimize = typeof minimize !== 'undefined' ? minimize : false;
                            maximize = typeof maximize !== 'undefined' ? maximize : true;

                            var json = {};

                            for(k in $scope.chatusers){
                                if($scope.chatusers[k] != null
                                            && typeof $scope.chatusers[k]._id != undefined
                                            && $scope.chatusers[k].name != undefined
                                            && $scope.chatusers[k].picture != undefined
                                            && $scope.chatusers[k]._id == id){

                                    json = {
                                      name:$scope.chatusers[k].name.first,
                                      id: id,
                                      image:$scope.chatusers[k].picture.medium,
                                      minimize:minimize,
                                      maximize:maximize,
                                      right:0,
                                      height:height
                                    }
                                }
                            }



                            $window.sessionStorage.setItem(id, JSON.stringify(json));
                            display_divs();
                            socket.emit('connect', {data: id});

                            chatactivity.loadMessages(user._id, id);
                                $scope.loadedMessages = chatactivity.messages;
                            //$scope.apply();

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
                            $scope.chatdivnotification = null;
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