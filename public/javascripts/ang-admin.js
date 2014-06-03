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

function AdminUserCtrl($scope, $http) {
  var EMPTY_USER = {id: 0, login: '', password: '', profile: 'User'};

  $scope.users = [];
  $scope.user = EMPTY_USER;

  $scope.refreshUsers = function() {
    $http.get('/admin/getUsersJson')
        .success(function(data, status, headers, config) {
            $scope.users = data;
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
  };
  $scope.refreshUsers();

  $scope.createUser = function(user) {
    var userToCreate = angular.copy(user);
    $http.post('/admin/user', userToCreate)
        .success(function(data, status, headers, config) {
            $scope.users.push(userToCreate);
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
  };

  $scope.deleteUser = function(userId) {
    $http.delete('/admin/user/' + userId)
        .success(function(data, status, headers, config) {
            $scope.refreshUsers();
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
  };

  $scope.userCount = function() {
    return $scope.users.size;
  };
}