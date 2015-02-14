angular.module('weberApp')

    .factory('ChatActivity', function($http, Restangular) {

        var ChatActivity = function(currentuser){

            this.currentuser = currentuser;
            this.chatfriends = null;

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




    return ChatActivity;
    });
