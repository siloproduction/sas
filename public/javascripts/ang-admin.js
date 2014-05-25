angular
    .module('project', ['ngRoute', 'firebase'])
    .config(function($routeProvider) {
      $routeProvider
        .when('/', {
          controller:'ListCtrl',
          templateUrl:'list.html'
        })
        .when('/edit/:projectId', {
          controller:'EditCtrl',
          templateUrl:'detail.html'
        })
        .when('/new', {
          controller:'CreateCtrl',
          templateUrl:'detail.html'
        })
        .otherwise({
          redirectTo:'/'
        });
    })

function AdminUserCtrl($scope) {
  var EMPTY_USER = {id: 0, username: '', password: '', profile: 'User'};

  $scope.users = [];
  $scope.user = EMPTY_USER;



  $scope.createUser = function(user) {
    $scope.user = angular.copy(user);
    $scope.users.push(user);
  };

  $scope.userCount = function() {
    return $scope.users.size;
  };
}