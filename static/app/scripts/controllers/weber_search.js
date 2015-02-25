'use strict';

/**
 * @ngdoc function
 * @name weberApp.controller:WeberSearchCtrl
 * @description
 * # WeberSearchCtrl
 * Controller of the weberApp
 */
angular.module('weberApp')
		.controller('WeberSearchCtrl', function($scope, $auth, Restangular,
	 										InfinitePosts, $alert, $http,
	 										CurrentUser, UserService,CurrentUser1,
	 										SearchActivity, $routeParams, MatchMeResults) {
		$scope.UserService = UserService;


		$scope.searching = function(){



        	function combine_ids(ids) {
   				return (ids.length ? "\"" + ids.join("\",\"") + "\"" : "");
			}

            function get_match_results(query){
                $scope.search = query;
                var matchResults = new MatchMeResults();
                matchResults.getMatchResults($scope.search,combine_ids($scope.search.split(" ")))
                    .then(function() {
                        $scope.matchmeresults = matchResults;


                        var currentuserobj = new CurrentUser();
                        currentuserobj.getUserId()
                        .then(function(){
                            if(currentuserobj.userId != 'undefined'){
                                currentuserobj.getCUserDetails(currentuserobj.userId)
                                .then(function(user){
                                   $scope.searchActivity = new SearchActivity(user)
                                   $scope.searchActivity.addSearchText($scope.search,
                                    matchResults.total_matches,
                                    matchResults.matchedids,
                                    $scope.search.split(" "));
                                });
                            }
                        });



                });
                matchResults.getMatchPeoples($scope.search).then(function() {
                        $scope.matchmeresults = matchResults;
                });
			}

            if(typeof $routeParams.query !== 'undefined'){
			    get_match_results($routeParams.query);
			}else{

                    var currentuserobj = new CurrentUser();
                    currentuserobj.getUserId()
                    .then(function(){
                        if(currentuserobj.userId){
                            currentuserobj.getCUserDetails(currentuserobj.userId)
                                .then(function(user){
                                   $scope.searchActivity = new SearchActivity(user)
                                });
                        }
                    });


			}
        };

        $scope.searching();

		$scope.loadNewResullts = function(searchId){
			var matchResults = new MatchMeResults();
			matchResults.getMatchedNewResults(searchId).then(function() {
					$scope.matchmeresults = matchResults;
			});
		};
	}).directive('myDirective', function(){
    	return function(scope, element, attrib){
    	element.bind('click', function(){
        	scope.loadNewResullts(element[0].id);
			$('#notific'+element[0].id).css({"display":"none"});
        });
    };
});