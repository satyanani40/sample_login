angular.module('weberApp')
.factory('friendsActivity', function($http, Restangular, $alert, $timeout,CurrentUser) {

        var friendsActivity = function(currentuser, profileuser){
            //console.log(profileuser)
            this.currentuser = currentuser;

            this.profileuser = profileuser;

            this.status = null;
            this.status_method = null;

            if (typeof this.profileuser.notifications === "undefined"){
                profileuser.patch({
                    "notifications": []
                })
            }

            if(typeof this.currentuser.notifications === "undefined"){
                currentuser.patch({
                    "notifications": []
                })
            }

        }

        friendsActivity.prototype.getRelation = function(){

                if(this.status === null){
                    if(this.profileuser.friends.indexOf(this.currentuser._id) > -1){
                        this.status = 'unfriend';
                    }
                }

                if(this.status === null){
                    var k = '';
                    for (k in this.profileuser.notifications){
                        if(this.profileuser.notifications[k].friend_id == (this.currentuser._id)){
                            this.status = 'cancelrequest';
                        }
                    }
                }

                if(this.status === null){
                    var k = ''
                    for (k in this.currentuser.notifications){
                        if(this.currentuser.notifications[k].friend_id == (this.profileuser._id)){
                            this.status = 'reject_accept';
                        }
                    }
                }

                if(this.status === null){
                    this.status = 'addfriend'
                }
            return (this.status)
        }

        friendsActivity.prototype.AddFriend = function(){
            var d = new Date();
            var total_time = d.getDate()+d.getDay()+d.getFullYear()+d.getHours()+d.getMilliseconds()+d.getMinutes()+d.getMonth()+d.getSeconds()+d.getTime();
            var new_request = {'friend_id':this.currentuser._id,'seen':false,'timestamp':total_time,'daterequest':d}
            this.profileuser.notifications.push(new_request);
            var data = this.profileuser.patch({
                'notifications':this.profileuser.notifications,
                'all_seen':false

            });
            return data;
        }

        friendsActivity.prototype.cancelrequest = function(){
            var k = null;

                for (k in this.profileuser.notifications){
                    if(this.profileuser.notifications[k].friend_id == (this.currentuser._id)){
                        this.profileuser.notifications.splice(this.profileuser.notifications.indexOf(this.currentuser._id),1)
                        return this.profileuser.patch({
                           'notifications': this.profileuser.notifications
                        });


                    }
                }


        }

        friendsActivity.prototype.unfriend = function(){

            var k = null;

                for (k in this.profileuser.friends){

                    if(this.profileuser.friends[k] == (this.currentuser._id)){
                        this.profileuser.friends.splice(this.profileuser.friends.indexOf(this.currentuser._id),1)
                        this.profileuser.patch({
                           'friends': this.profileuser.friends
                        }).then(function(response){
                            console.log("deleted at profile friend")
                        })

                    }
                }

            k = null;

            for(k in this.currentuser.friends){
                if(this.currentuser.friends[k] ==(this.profileuser._id)){
                    this.currentuser.friends.splice(this.currentuser.friends.indexOf(this.profileuser._id),1);
                    return this.currentuser.patch({
                        'friends': this.currentuser.friends
                    }).then(function(response){
                        console.log('deleted at current user')

                    });
                }
            }
        }

        friendsActivity.prototype.remove_pfriends = function(){
             var k = null;
                for (k in this.profileuser.friends){
                    if(this.profileuser.friends[k] == (this.currentuser._id)){
                        this.profileuser.friends.splice(this.profileuser.friends.indexOf(this.currentuser._id),1)
                        return this.profileuser.patch({
                           'friends': this.profileuser.friends
                        })
                    }
                }
        }

        friendsActivity.prototype.remove_cfriends = function(){
             k = null;
            for(k in this.currentuser.friends){
                if(this.currentuser.friends[k] ==(this.profileuser._id)){
                    this.currentuser.friends.splice(this.currentuser.friends.indexOf(this.profileuser._id),1);
                    return this.currentuser.patch({
                        'friends': this.currentuser.friends
                    });
                }
            }
        }

        friendsActivity.prototype.removeCnotifcations = function(){
            var k = null;
                for (k in this.currentuser.notifications){
                    if(this.currentuser.notifications[k].friend_id == (this.profileuser._id)){
                        this.currentuser.notifications.splice(this.currentuser.notifications.indexOf(this.profileuser._id),1)
                        return data = this.currentuser.patch({
                           'notifications': this.currentuser.notifications
                        });

                    }
                }


        }

        friendsActivity.prototype.removePnotifcations = function(){
            var k = null;
                for (k in this.profileuser.notifications){
                    if(this.profileuser.notifications[k].friend_id == (this.currentuser._id)){
                        this.profileuser.notifications.splice(this.profileuser.notifications.indexOf(this.currentuser._id),1)
                        console.log('removing pnotifcations in service')
                        return  this.profileuser.patch({
                           'notifications': this.profileuser.notifications
                        });

                    }
                }


        }


        friendsActivity.prototype.accept_request = function(){

            var k = null;
            var self = this;

            if(this.profileuser.friends.indexOf(this.currentuser._id) == -1){
                this.profileuser.friends.push(this.currentuser._id)

                this.profileuser.patch({
                   'friends': this.profileuser.friends
                }).then(function(response){
                        console.log('added to profile user friends')
                        var new_request = {'accepted_id':self.currentuser._id,'seen':false}
                        self.profileuser.accept_notifications.push(new_request);
                        Restangular.one('people',self.profileuser._id).patch({
                            'accept_notifications':self.profileuser.accept_notifications,
                            'all_seen':false
                        },{},{'If-Match':response._etag});

                })
            }

             if(self.currentuser.friends.indexOf(self.profileuser._id) == -1){

                        self.currentuser.friends.push(self.profileuser._id)
                        return self.currentuser.patch({
                            'friends': self.currentuser.friends
                        }).then(function(response){
                            k = null;

                            self.currentuser._etag = response._etag;
                            for (k in self.currentuser.notifications){
                                    if(self.currentuser.notifications[k].friend_id == (self.profileuser._id)){
                                        self.currentuser.notifications.splice(self.currentuser.notifications.indexOf(self.profileuser._id),1)
                                        console.log('----------accepting request-------------')

                                        data = Restangular.one('people',self.currentuser._id).patch({
                                           'notifications': self.currentuser.notifications
                                        },{},{'If-Match':response._etag});

                                    }
                            }
                        });

             }
        }
         return friendsActivity
	});