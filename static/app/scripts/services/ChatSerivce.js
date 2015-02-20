angular.module('weberApp')

    .factory('ChatActivity', function($http, Restangular,$auth) {

        var ChatActivity = function(currentuser){

            this.currentuser = currentuser;
            this.chatfriends = null;
            this.messages = [];
            this.messageNotifc = [];
            this.latestMessages = [];
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

            /*var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();*/

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

            console.log('---------------------messages----------------')
            console.log(this.messages)

                for(k in this.messages){

                    if(
                     (typeof this.messages[k].sender   !== "undefined") &&
                     (typeof this.messages[k].receiver !== "undefined") &&
                     ((
                     this.messages[k].sender._id == user1 &&
                     this.messages[k].receiver._id == user2
                     )
                       ||
                     (this.messages[k].sender._id == user2 &&
                     this.messages[k].receiver._id == user1
                     ))
                    )
                    {

                        if(this.messages[k]._id === undefined){
                            this.messages.splice(k,1)
                        }

                        if(lastid == null)
                            lastid = this.messages[k]._id;

                        if(typeof this.messages[k] !== 'undefined' && lastid < this.messages[k]._id)
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

        ChatActivity.prototype.getMessageNotifcations= function(){
            var where_param = '{"$and":[{"receiver":"'+this.currentuser._id+'"},{"seen":false}]}';
            //var sort_param = '[("_created",-1)]';
            var embedded_param = '{"sender":1,"receiver":1}';
            var self = this;
            Restangular.all('messages').getList({
                where: where_param,
                embedded: embedded_param,
                seed:Math.random()
            }).then(function(data){
                self.messageNotifc.push.apply(self.messageNotifc, data);
            }.bind(self))
        }

        ChatActivity.prototype.loadLatestMessages = function(){
            this.latestMessages = [];
            this.messageNotifc = [];
            var where_param = '{"receiver":"'+this.currentuser._id+'"}';
            var sort_param = '[("_created",-1)]';
            var embedded_param = '{"sender":1,"receiver":1}';

            var self = this;

            Restangular.all('messages').getList({
                where: where_param,
                embedded: embedded_param,
                sort:sort_param,
                seed:Math.random()
            }).then(function(data){
                self.latestMessages.push.apply(self.latestMessages, data);
            }.bind(self))
        }

        ChatActivity.prototype.makeMessagesSeen = function(senderid){
            var self = this;
            for(k in self.latestMessages){
                if(self.latestMessages[k].sender._id == senderid  &&
                   self.latestMessages[k].receiver._id == this.currentuser._id &&
                   self.latestMessages[k].seen == false
                   ){
                    console.log('-------------recevied message-----------')
                    console.log(self.latestMessages[k]._id)
                    Restangular.one("messages",self.latestMessages[k]._id).patch(
                        {seen:true},{},
                        {
                            'Content-Type': 'application/json',
                            'If-Match': this.latestMessages[k]._etag,
                            'Authorization': $auth.getToken()
                        }
				    );
                }
            }
        }

        ChatActivity.prototype.pushLatestMessage = function(msg){
            console.log('---------pushing mesage--------')
            console.log(msg)
            this.messageNotifc.push.apply(this.messageNotifc,[msg]);
            console.log(this.messageNotifc)

        }


    return ChatActivity;
    });
