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

            var self = this;
            var lastid = null;

            for(k in this.messages){
                if(
                 (this.messages[k].sender._id == user1 &&
                 this.messages[k].receiver._id == user2)
                   ||
                 (this.messages[k].sender._id == user2 &&
                 this.messages[k].receiver._id == user1)
                )
                {
                    console.log('------------messge ids---')
                    if(this.messages[k]._id === undefined){
                        this.messages.splice(k,1)
                    }

                    if(lastid == null)
                        lastid = this.messages[k]._id;

                    if(lastid < this.messages[k]._id)
                        lastid = this.messages[k]._id;
                }
            }

            var params = null;

            if(lastid != null){

                 params =  '{"$and":['+
                '{ "$or" : ['+
                    '{ "$and" : [ { "sender" : "'+user1+'" }, { "receiver" : "'+user2+'" } ] },'+
                    '{ "$and" : [ { "sender" : "'+user2+'" }, { "receiver": "'+user1+'" }  ] }'+
                ']},{"_id":{"$gt":"'+lastid+'"}}]}';
            }else{
                params =  '{ "$or" : ['+
                    '{ "$and" : [ { "sender" : "'+user1+'" }, { "receiver" : "'+user2+'" } ] },'+
                    '{ "$and" : [ { "sender" : "'+user2+'" }, { "receiver": "'+user1+'" }  ] }'+
                ']}';
            }


            var params2 = '{"sender":1,"receiver":1}'

            Restangular.all('messages').getList({
                where:params,
                embedded:params2,
                seed:Math.random()
            }).then(function(response){
                self.messages.push.apply(self.messages, response);
            }.bind(self));
        }

        ChatActivity.prototype.pushMessage = function(message){
            this.messages.push(message);
            return this.messages;
        }

    return ChatActivity;
    });
