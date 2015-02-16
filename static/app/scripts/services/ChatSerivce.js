angular.module('weberApp')

    .factory('ChatActivity', function($http, Restangular) {

        var ChatActivity = function(currentuser){

            this.currentuser = currentuser;
            this.chatfriends = null;
            this.messages = [];

        }

        ChatActivity.prototype.getChatFriends = function(){

            if (this.currentuser.friends.length !== 0) {
                var params = '{"_id": {"$in":["'+(this.currentuser.friends).join('", "') + '"'+']}}';
                var data = Restangular.all('people').getList({where :params});
                return data;
            }

        };

        ChatActivity.prototype.sendMessage = function(receiverid, text){
            var currentdate = new Date();
            this.receiverid = receiverid;

            var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

            return Restangular.all('messages').post({
                'sender':this.currentuser._id,
                'receiver': this.receiverid,
                'message': text,
                'seen': false


            });
        }

        ChatActivity.prototype.loadMessages = function(user1, user2){
            this.messages = [];
            var self = this;
            var params =  '{ "$or" : ['+
                '{ "$and" : [ { "sender" : "'+user1+'" }, { "receiver" : "'+user2+'" } ] },'+
                '{ "$and" : [ { "sender" : "'+user2+'" }, { "receiver": "'+user1+'" }  ] }'+
            ']}';
            var params2 = '{"sender":1,"receiver":1}'
            console.log(params)
            Restangular.all('messages').getList({
                where:params,
                embedded:params2
            }).then(function(response){
                self.messages.push.apply(self.messages, response);
                console.log(self.messages)
            }.bind(self));

        }



    return ChatActivity;
    });
