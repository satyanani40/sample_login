'use strict';

/**
 * @ngdoc overview
 * @name weberApp
 * @description
 * # weberApp
 *
 * Main module of the application.
 */
angular
	.module('weberApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngRoute',
		'ngSanitize',
		'ngTouch',
		'mgcrea.ngStrap',
		'infinite-scroll',
		'satellizer',
		'restangular',
		'angularMoment',
		'elasticsearch' 
	])
	.run(["$rootScope", "$location",
		function($rootScope, $location) {
			$rootScope.$on("$routeChangeError", function(event, current, previous, eventObj) {
				if (eventObj.authenticated === false) {
					$location.path("/login");
				}
			});
		}
	])
	.config(['RestangularProvider',
		function(RestangularProvider) {
			// point RestangularProvider.setBaseUrl to your API's URL_PREFIX
			RestangularProvider.setBaseUrl('/api');
			RestangularProvider.setRestangularFields({
				selfLink: '_links._self.href'
			});
			// add a response intereceptor
			RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
				var extractedData;
				// .. to look for getList operations
				if (operation === "getList") {
					// .. and handle the data and meta data
					extractedData = data._items;
					extractedData.meta = data._meta;
					extractedData.links = data._links;
				} else {
					extractedData = data;
				}
				return extractedData;
			});

			RestangularProvider.setRestangularFields({
				id: "_id"
			});
		}
	])
	.config(function($routeProvider, $locationProvider, $authProvider) {
		$authProvider.logoutRedirect = '/';
		$authProvider.loginOnSignup = true;
		$routeProvider
			.when('/', {
				templateUrl: '/static/app/views/main.html',
				controller: 'MainCtrl',
				resolve: {
					authenticated: function($location, $auth) {
						if (!$auth.isAuthenticated()) {
							return $location.path('/login');
						}
					}
				}
			})
			.when('/profile/:username', {
				templateUrl: '/static/app/views/userprofile.html',
				controller: 'UserprofileCtrl',
				resolve: {
					authenticated: function($location, $auth) {
						if (!$auth.isAuthenticated()) {
							return $location.path('/login');
						}
					}
				}
			})
			.when('/weber_search', {
				templateUrl: '/static/app/views/search.html',
				controller: 'WeberSearchCtrl',
			})
			.when('/login', {
				templateUrl: '/static/app/views/login.html',
				controller: 'LoginCtrl',
			})
			.when('/settings', {
				templateUrl: '/static/app/views/settings.html',
				controller: 'SettingsCtrl',
				resolve: {
					authenticated: function($location, $auth) {
						if (!$auth.isAuthenticated()) {
							return $location.path('/login');
						}
					}
				}
			})
			.when('/matchme', {
				templateUrl: '/static/app/views/matchme.html',
				controller: 'MatchMeCtrl',
			})
			.when('/friends', {
				templateUrl: '/static/app/views/friends.html',
				controller: 'FriendsCtrl',
				resolve: {
					authenticated: function($location, $auth) {
						if (!$auth.isAuthenticated()) {
							return $location.path('/login');
						}
					}
				}
			})
			.when('/search', {
				templateUrl: '/static/app/views/about.html',
				controller: 'AboutCtrl'
			})
			.when('/signup', {
				templateUrl: '/static/app/views/signup.html',
				controller: 'SignupCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	});