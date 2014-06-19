var adminApp = angular.module('project', ['ui.bootstrap'])

adminApp.controller('AdminUserCtrl', function ($scope, $http, $modal, $timeout) {
  var EMPTY_USER = {id: 0, login: '', password: '', profile: 'User'};

  $scope.users = [];
  $scope.usersAttributes = {};
  $scope.user = EMPTY_USER;
  $scope.creationIsClosed = true;

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
            $scope.users.push(data);
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
  };

  $scope.updateUser = function(user) {
    openConfirmDialog("Do you really want to modify " + user.login + "?", function() {
        $http.post('/admin/user/' + user.id, user)
            .success(function(data, status, headers, config) {
                // nothing
            })
            .error(function(data, status, headers, config) {
                getUserAttributes(user)["errors"] = data;
            });
    });
  };

  $scope.deleteUser = function(userId, userLogin) {
    openConfirmDialog("Do you really want to delete " + userLogin + "?", function() {
        $http.delete('/admin/user/' + userId)
            .success(function(data, status, headers, config) {
                $scope.refreshUsers();
            })
            .error(function(data, status, headers, config) {
                window.alert(data);
            });
    });
  };

  $scope.userCount = function() {
    return $scope.users.size;
  };

  $scope.editUserToggle = function(user) {
    var isToggled = getUserAttributes(user)["toggled"] == true;
    getUserAttributes(user)["toggled"] = !isToggled;
  };

  $scope.editUserIsToggled = function(user) {
    return getUserAttributes(user)["toggled"] == true;
  };

  $scope.editUserErrors = function(user) {
    var errors = getUserAttributes(user)["errors"];
    if (angular.isUndefined(errors)) {
        return {};
    }
    return errors;
  }

  var getUserAttributes = function(user) {
    var attributes = $scope.usersAttributes[user.id];
    if (angular.isUndefined(attributes)) {
        attributes = [];
        $scope.usersAttributes[user.id] = attributes;
    }
    return attributes;
  };

  var openConfirmDialog = function(content, yesCallback) {
      var modalInstance = $modal.open({
        templateUrl: '/assets/templates/dialog_confirm.html',
        controller: DialogConfirmCtrl,
        resolve: {
            title: function () {
                return "Confirmation";
            },
            message: function () {
                return content;
            }
        }
      });
      modalInstance.result.then(function () {
        yesCallback();
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });
  };

});