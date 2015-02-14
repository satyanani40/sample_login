'use strict';

/**
 * @ngdoc service
 * @name weberApp.weberService
 * @description
 * # weberService
 * Service in the weberApp.
 */
angular.module('weberApp')
	.filter('highlight', function($sce) {
		return function(text, phrase) {
			if (phrase) text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
				'<span class="highlighted">$1</span>');
			return $sce.trustAsHtml(text);
		};
	})
	.service('UserService', function($http, Restangular) {
		this.users = [];

		this.get = function(userId) {

			for (var i in this.users) {
				if (this.users[i]._id == userId) {
					return this.users[i];
				}
			}
			var promise = Restangular.one('people',userId).get().$object;
			promise._id = userId;
			this.users.push(promise);
			return promise;
		};
	}).service('CurrentUser1', function($http, Restangular) {
		this.userId = null;
		this.reset = function() {
			this.userId = null;
		};
		if (this.userId === null) {
			$http.get('/api/me', {
				headers: {
					'Content-Type': 'application/json'
				}
			}).success(function(userId) {
				this.userId = userId;
				Restangular.one('people', userId).get().then(function(user) {
					this.user = user;
				}.bind(this));
			}.bind(this));
		}
	})
	.factory('CurrentUser', function($http,$auth,$q, Restangular) {

            var CurrentUser = function() {

			    this.userId = null;
			    this.user = null;
            }

            CurrentUser.prototype.getUserId = function(){

                    return $http.get('/api/me', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': $auth.getToken()
                        }
                    }).success(function(userId) {
                        this.userId = userId;
                    }.bind(this));
            };


			CurrentUser.prototype.getCUserDetails = function(userid){

                return Restangular.one('people',JSON.parse(userid)).get();
            };

            return CurrentUser;
    })
    .service('ESClient', function(esFactory) {
		return esFactory({
			host: 'http://127.0.0.1:8000',
			apiVersion: '1.2',
			log: 'trace'
		});
	})
	.factory('InfinitePosts', function($http, Restangular, $alert, $timeout) {
		var InfinitePosts = function(user_obj) {
			this.posts = [];
			this.user_obj = user_obj;
			this.busy = false;
			this.page = 1;
			this.end = false;

			this.user_obj.all('posts').getList({
				max_results: 10,
				page: this.page,
				sort: '[("_created",-1)]'
			}).then(function(posts) {
				if (posts.length < 10) {
					this.end = true;
				}
				this.posts.push.apply(this.posts, posts);
				this.page = this.page + 1;
				this.busy = false;
			}.bind(this));

		};

		InfinitePosts.prototype.addPost = function(content,similar_keywords) {

			this.user_obj.all('posts').post({
				author: this.user_obj._id,
				content: content,
				keywords: similar_keywords
			}).then(function(data) {
					this.posts.unshift({
					author: this.user_obj._id,
					content: content,
					_created: "a few seconds ago"
				});
				var myAlert = $alert({
					title: 'Successfully Posted! :)',
					placement: 'top',
					type: 'success',
					show: true
				});
				$timeout(function() {
					myAlert.hide();
				}, 5000);
			}.bind(this));
		};


		InfinitePosts.prototype.nextPage = function() {
			if (this.busy | this.end) return;
			this.busy = true;

			this.user_obj.all('posts').getList({
				max_results: 10,
				page: this.page,
				sort: '[("_created",-1)]'
			}).then(function(posts) {
				if (posts.length === 0) {
					this.end = true;
				}
				this.posts.push.apply(this.posts, posts);
				this.page = this.page + 1;
				this.busy = false;
			}.bind(this));



		};
		return InfinitePosts;
	}).factory('SearchActivity', function($http, Restangular, $alert, $timeout) {

		var SearchActivity = function(user_obj) {
			this.searchResult = [];
			this.user_obj = user_obj;
			this.user_obj.all('searchActivity').getList({
				sort: '[("_created",-1)]',
				seed: Math.random()
			}).then(function(sResult) {
				this.searchResult.push.apply(this.searchResult,sResult);
			}.bind(this));

		};


		SearchActivity.prototype.addSearchText = function(content,resultcount,resultIds,keywords) {
			this.user_obj.all('searchActivity').post({
				author: this.user_obj._id,
				content: content,
				keywords:keywords,
				totalResults:resultcount,
				matchedPosts:resultIds
			}).then(function(data) {
					console.log(data)
					this.searchResult.unshift({
					author: this.user_obj._id,
					content: content,
					_id: data._id,
					matchesCount:resultcount
				});

			}.bind(this));
		};

		function combine_ids(ids) {
   			return (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
		}

    return SearchActivity;

	}).factory('MatchMeResults', function($http, Restangular, $alert, $timeout,CurrentUser,$auth,CurrentUser1) {

		var  MatchMeResults = function() {

			this.total_matches = '';
			this.mresults = [];
			this.matchedids = [];
			this.totalNames = '';
			this.searchNames =[];
		};

		function combine_ids(ids) {
   				return (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
		}

		MatchMeResults.prototype.getMatchedNewResults = function(searchPostId) {

			var params = '{"_id":"'+searchPostId+'"}';

			var data = Restangular.one("people",JSON.parse(CurrentUser1.userId)).all('searchActivity').getList({
				where :params,
				sort: '[("_created",-1)]',
				seed : Math.random()
			}).then(function(sResult) {

				var param = '{"_id":{"$in":['+combine_ids(sResult[0].matchedPosts)+']}}';
				var param2 = '{"author":1}';

				var data2 = Restangular.all("posts").getList({
					where: param,
					embedded: param2,
					seed : Math.random()
				}).then(function(data){
					this.total_matches = data.length;
					this.mresults.push.apply(this.mresults,data);
				}.bind(this));

				Restangular.one("searchActivity",searchPostId).patch(
					{newResults:0},{},
					{
						'Content-Type': 'application/json',
						'If-Match': sResult[0]._etag,
						'Authorization': $auth.getToken()
					}
				);

				return data2
            }.bind(this));
            return data
		};

		MatchMeResults.prototype.getMatchResults = function(content,keywords) {

			var param1 = '{"$or":[{"keywords": {"$in":['+keywords+']}},{"content":{"$regex":".*'+content+'.*"}}]}';
			var param2 = '{"author":1}';

			var data = '';
			var data = Restangular.all('posts').getList({
				where :param1,
				embedded :param2
				}).then(function(data) {
					this.total_matches = data.length;
					this.mresults.push.apply(this.mresults,data);

					var i;
					for(i=0;i<this.total_matches;i++){
						this.matchedids.push(this.mresults[i]['_id'])
					}
				}.bind(this));
        	return data;

		};

		MatchMeResults.prototype.getMatchPeoples = function(searchText) {
			var params = '{"$or":[{"name.first":{"$regex":".*'+searchText+'.*"}},{"name.last":{"$regex":".*'+searchText+'.*"}},{"username":{"$regex":".*'+searchText+'.*"}}]}';
			var data = Restangular.all('people').getList({
				where :params
				}).then(function(data) {
					console.log(data)
					this.totalNames = data.length;
					this.searchNames.push.apply(this.searchNames,data);
				}.bind(this));
				return data
			};

		return MatchMeResults;


	}).directive('navbar', function () {
    return {
        restrict: 'A', //This menas that it will be used as an attribute and NOT as an element. I don't like creating custom HTML elements
        replace: true,
        templateUrl: "/static/app/views/navbar.html",
        controller:function ($scope, $auth, CurrentUser, $alert,
                             $location,$http,Restangular,ChatActivity,
                             SearchActivity,FriendsNotific,friendsActivity) {


 			$scope.dropdown = [{
				"text": "Settings",
				"href": "#/settings"
			},{
				"text": "Logout",
				"click": "logout()"
			}];

			$scope.logout = function() {
				//CurrentUser.reset();
				$auth.logout();
				$location.path("/login");
			};

			$scope.isAuthenticated = function() {
				return $auth.isAuthenticated();
			};


			$http.get('/api/me', {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': $auth.getToken()
				}
			}).success(function(user_id) {

				Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {

				$scope.currentUser = user;



				$scope.searchActivity = new SearchActivity(user);
				var requested_peoples = [];
				var accepted_peoples = [];

				function get_friend_notifications(currentUser){

					var notific = new FriendsNotific(currentUser);
					notific.then(function(data){

							accepted_peoples = [];
							var currentuser = data
							var k = null;

							for (k in currentuser.notifications){
								if(currentuser.notifications[k].seen == false){
									requested_peoples.push(currentuser.notifications[k].friend_id)
								}
							}

							k= null;
							for (k in currentuser.accept_notifications){
								if(currentuser.accept_notifications[k].seen == false){
									accepted_peoples.push(currentuser.accept_notifications[k].accepted_id)
								}
							}

							console.log(accepted_peoples.length)

							if(requested_peoples.length+accepted_peoples.length > 0){

								if(!(currentUser.all_seen)){
									$scope.newnotific = requested_peoples.length+accepted_peoples.length
								}else{
									$scope.newnotific = null;
								}

							}else{
								$scope.newnotific = null;
							}
					});
				}


				get_friend_notifications(user);

				var source = new EventSource('/stream/'+user._id);

				source.onmessage = function (event) {

					data = JSON.parse(event.data)
					if(parseInt(data.searchNotific)){
     					$scope.searchActivity = new SearchActivity(user);
     				}

     				if(parseInt(data.friendsnotifc)){
     					$http.get('/api/me', {
							headers: {
								'Content-Type': 'application/json',
								'Authorization': $auth.getToken()
							}
						}).success(function(user_id) {
							Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
									get_friend_notifications(user);
							});

						});
					}
				};

  				$scope.getNewNotifcations = function(){
					$scope.newnotific = null;
  					$http.get('/api/me', {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': $auth.getToken()
						}
					}).success(function(user_id) {

						Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
								var anotific = [];
								var reqnotific = [];
								var k = null;
								for(k in user.accept_notifications){
									user.accept_notifications[k].seen = true
									anotific.push(user.accept_notifications[k].accepted_id)
								}

								k = null;

								for(k in user.notifications){
									user.notifications[k].seen = true
									reqnotific.push(user.notifications[k].friend_id)
								}

								user.patch(
								{	'all_seen':true,
									'accept_notifications':user.accept_notifications,
									'notifications': user.notifications
								}
								).then(function(data){
								});
									var params = '{"_id": {"$in":["'+(reqnotific).join('", "') + '"'+']}}'
									Restangular.all('people').getList({
										where : params,
										seed: Math.random()
									}).then(function(response){
										$scope.rpeoples = response;
									});

									var params = '{"_id": {"$in":["'+(anotific).join('", "') + '"'+']}}'
									Restangular.all('people').getList({
										where : params,
										seed: Math.random()
									}).then(function(resposne){
										$scope.apeoples = resposne;
									});
								
							});
						});
					}
  				$scope.confirmrequest = function(id){
					$http.get('/api/me', {
						headers: {
							'Content-Type': 'application/json',
							'Authorization': $auth.getToken()
						}
					}).success(function(user_id) {
						Restangular.one('people',JSON.parse(user_id)).get({seed: Math.random()}).then(function(user) {
							var isInRequests = true;
							if(isInRequests){
								Restangular.one('people',id).get({seed: Math.random()}).then(function(profileuser){
									var friendsactivity = new friendsActivity(user,profileuser)
									console.log('comes to add friend')
									$scope.acceptfrnd = friendsactivity.accept_request();

								});
							}
						});
					});
  				}
			});
		});
	}
  }
});