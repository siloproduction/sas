var app = angular.module('MonApp', ['ngRoute','ui.bootstrap', 'ngSanitize', 'ngAnimate', 'ui.bootstrap.setNgAnimate']);
	
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
		$routeProvider
		.when('/', {templateUrl: 'assets/partials/home.html'})
		.when('/events', {templateUrl: 'assets/partials/events.html'})
		.when('/event/:id' ,{templateUrl: 'assets/partials/eventFocus.html', controller : 'EventViewCtrl'})
		.when('/artiste/:id', {templateUrl: 'assets/partials/artiste.html', controller : 'ArtistesCtrl'})
		.when('/user/:id', {templateUrl:'assets/partials/user.html', controller : 'UsersCtrl'})
		.when('/lieu/:id', {templateUrl:'assets/partials/lieu.html', controller : 'LieuCtrl'});
		
		$locationProvider.html5Mode(true);
}]);


