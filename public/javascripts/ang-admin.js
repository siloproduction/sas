var adminApp = angular.module('project', ['ui.bootstrap'])

adminApp.controller('AdminUserCtrl', function ($scope, $http, $modal) {
  var EMPTY_USER = {id: 0, login: '', password: '', profile: 'User'};

  $scope.users = [];
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