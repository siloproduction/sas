var app = angular.module('MonApp', ['ngRoute','ui.bootstrap', 'ngSanitize', 'ngAnimate', 'ui.bootstrap.setNgAnimate']);
	
app.config(['$routeProvider', '$locationProvider', function($routeProvider){
		$routeProvider
		.when('/', {templateUrl: 'partials/home.html'})
		.when('/events', {templateUrl: 'partials/events.html'})
		.when('/event/:id' ,{templateUrl: 'partials/eventFocus.html', controller : 'EventViewCtrl'})
		.when('/artiste/:id', {templateUrl: 'partials/artiste.html', controller : 'ArtistesCtrl'})
		.when('/user/:id', {templateUrl:'partials/user.html', controller : 'UsersCtrl'})
		.when('/lieu/:id', {templateUrl:'partials/lieu.html', controller : 'LieuCtrl'});
		
		$locationProvider.html5Mode(true);
}]);


