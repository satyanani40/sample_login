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
                        $scope.chatdivnotification = [];

                         $scope.chatactivity = new ChatActivity(user);
                        //namespace = 'chat';
                         if(user.friends.length !== 0){
                            $scope.chatactivity.getChatFriends().then(function(data){
                                $scope.chatusers = data;
                            });
                         }

						var socket = io.connect('http://127.0.0.1:8000');

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
                                    //$scope.chatnotification.push = 'New_Message';

                                    $scope.chatactivity.pushLatestMessage(msg)
                                    console.log($scope.chatactivity)

                                }else if(!(details.minimize)){

                                    $scope.chatnotifcation = null;
                                    $scope.chatdivnotification = null;

                                         new_message = {
                                              sender :{
                                                name:{
                                                    first:details.name
                                                },
                                                picture :{
                                                    medium:details.image

                                                },
                                                _id:msg.senderid
                                              },

                                              receiver:{
                                                _id:msg.receiverid
                                              },

                                              message:msg.message
                                         }

                                }else if(details.minimize){
                                    //$scope.chatdivnotification = 'new_Message';
                                    console.log('chatdiv notifications===========')
                                    $scope.chatdivnotification.push({ id:msg.senderid,
                                                                      message: true
                                                                     });
                                    console.log($scope.chatdivnotification)


                                }else{}

                              }

                              var data = $scope.chatactivity.pushMessage(new_message);
                              $scope.$apply(function(){
                                $scope.loadedMessages = data;
                              });

                         });

                        $scope.send_message = function(receiverid){

                           var text = document.getElementById('send_'+receiverid).value;
                           socket.emit('send_message', {receiverid: receiverid, senderid :user._id  ,message: text});
                           document.getElementById('send_'+receiverid).value = null;
                           var temp = $scope.chatactivity.sendMessage(receiverid,text);

                       }
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
                           previous_divs = getData();
                           console.log(getData())
                           var count = 300;
                           for(k in previous_divs){
                                previous_divs[k].right = count;
                                count = count+300;
                                socket.emit('connect', {data: previous_divs[k].id});
                           }

                           $scope.previousdivs = previous_divs;
                        }

                        function loadintodivs(){
                            for(k in previous_divs){
                                $scope.chatactivity.loadMessages(user._id, previous_divs[k].id);
                                $scope.loadedMessages = $scope.chatactivity.messages;
                           }
                        }


                        $scope.newchatdiv = function(id, name, height,minimize,maximize){

                            height = typeof height !== 'undefined' ? height : 'auto';
                            minimize = typeof minimize !== 'undefined' ? minimize : false;
                            maximize = typeof maximize !== 'undefined' ? maximize : true;

                            var json = {};
                           console.log("=======chatusers=======")
                           console.log($scope.chatusers)
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
                            if(json.maximize){
                                $scope.chatactivity.loadMessages(user._id, id);
                                $scope.loadedMessages =  $scope.chatactivity.messages;
                            }


                        }

                        $scope.close_div = function(id){
                          $window.sessionStorage.removeItem(id);
                          display_divs();
                        }

                        $scope.minimize = function(id){
                            var name = JSON.parse($window.sessionStorage.getItem(id)).name
                            $window.sessionStorage.removeItem(id);
                            $scope.newchatdiv(id, name,'40px',true,false);
                        }
                        $scope.maximize = function(id){
                            $scope.chatdivnotification = null;
                            var name = JSON.parse($window.sessionStorage.getItem(id)).name
                            $window.sessionStorage.removeItem(id);
                            $scope.newchatdiv(id, name, 'auto',false,true);
                        }

                        $scope.MessageNotifcations = function(){
                            $scope.chatactivity.getMessageNotifcations();
                            console.log('notifications sections')
                            console.log($scope.chatactivity)
                        }
                        $scope.loadLatestMessages = function(){
                            $scope.chatactivity.loadLatestMessages();
                            console.log('message sections')
                            console.log($scope.chatactivity)
                        }

                        $scope.makeMessagesSeen = function(senderid){
                            $scope.chatactivity.makeMessagesSeen(senderid);
                        }

                        $scope.checknotific = function(id){
                               for(k in $scope.chatdivnotification){

                                   console.log('========================')
                                   console.log($scope.chatdivnotification[k].id)
                                   console.log(id)
                                  if($scope.chatdivnotification[k].id == id && $scope.chatdivnotification[k].message == true){
                                     console.log('==========two divs equesl=======')
                                     console.log($scope.chatdivnotification[k].message)
                                     return true
                                     }else{
                                        console.log("not equal")
                                     }
                               }
                        }
                            display_divs();
                            loadintodivs();
                            $scope.MessageNotifcations();


                    });
            });

	    }
    }
}).directive("addchatdiv", function($compile){
	return function(scope, element, attrs){
		element.bind("click", function(){

		     scope.newchatdiv(element[0].id, element[0].name);
		     scope.makeMessagesSeen(element[0].id);
             scope.$apply()

		});
	};
});
