var adminApp = angular.module('adminApp', ['ui.bootstrap', 'ui.tinymce']);

adminApp.controller('AdminUserCtrl', function ($scope, $http, $modal, $timeout) {
  var EMPTY_USER = {id: 0, email: '',login: '', password: '', profile: 'User'};

  $scope.users = [];
  $scope.usersAttributes = {};
  $scope.user = EMPTY_USER;
  $scope.userAttributes = {};
  $scope.creationIsClosed = true;

  $scope.refreshUsers = function() {
    $http.get('/admin/user')
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
            $scope.userAttributes["errors"] = {};
            $scope.users.push(data);
        })
        .error(function(data, status, headers, config) {
            $scope.userAttributes["errors"] = data;
        });
  };

  $scope.updateUser = function(user) {
    openConfirmDialog("Do you really want to modify " + user.login + "?", function() {
        $http.put('/admin/user/' + user.id, user)
            .success(function(data, status, headers, config) {
                getUserAttributes(user)["errors"] = {};
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

  $scope.createUserErrors = function() {
    return $scope.userAttributes["errors"];
  };

  $scope.createUserErrorsIsEmpty = function() {
    var errors = $scope.userAttributes["errors"];
    return utils.isEmpty(errors);
  };

  $scope.editUserErrors = function(user) {
    return getUserAttributes(user)["errors"];
  };

  $scope.editUserErrorsIsEmpty = function(user) {
    var errors = $scope.editUserErrors(user);
    return utils.isEmpty(errors);
  };

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

adminApp.controller('AdminPageCtrl', function ($scope, $http, $modal, $timeout) {
  var DEFAULT_PAGE = {id: 0, name: '',category: 0, rank: 5, enabled: false, data: 'Initial content'};

  $scope.categories = [];
  $scope.pages = [];
  $scope.pagesAttributes = {};
  $scope.page = DEFAULT_PAGE;
  $scope.pageAttributes = {};
  $scope.creationIsClosed = true;

  $scope.refreshCategories = function() {
    $http.get('/admin/category')
        .success(function(data, status, headers, config) {
            $scope.categories = data;
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
  };
  $scope.refreshCategories();

  $scope.refreshPages = function() {
    $http.get('/admin/page')
        .success(function(data, status, headers, config) {
            $scope.pages = data;
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
  };
  $scope.refreshPages();

  $scope.createPage = function(page) {
    var pageToCreate = angular.copy(page);
    $http.post('/admin/page', pageToCreate)
        .success(function(data, status, headers, config) {
            $scope.pageAttributes["errors"] = {};
            $scope.pages.push(data);
        })
        .error(function(data, status, headers, config) {
            $scope.pageAttributes["errors"] = data;
        });
  };

  $scope.updatePage = function(page) {
    var pageForJson = angular.copy(page);
    pageForJson.category = page.category.id;
    openConfirmDialog("Do you really want to modify " + page.name + "?", function() {
        $http.put('/admin/page/' + page.id, pageForJson)
            .success(function(data, status, headers, config) {
                getPageAttributes(page)["errors"] = {};
            })
            .error(function(data, status, headers, config) {
                getPageAttributes(page)["errors"] = data;
            });
    });
  };

  $scope.deletePage = function(pageId, pageName) {
    openConfirmDialog("Do you really want to delete " + pageName + "?", function() {
        $http.delete('/admin/page/' + pageId)
            .success(function(data, status, headers, config) {
                $scope.refreshPages();
            })
            .error(function(data, status, headers, config) {
                window.alert(data);
            });
    });
  };

  $scope.pageCount = function() {
    return $scope.pages.size;
  };

  $scope.editPageToggle = function(page) {
    var isToggled = getPageAttributes(page)["toggled"] == true;
    getPageAttributes(page)["toggled"] = !isToggled;
  };

  $scope.editPageIsToggled = function(page) {
    return getPageAttributes(page)["toggled"] == true;
  };

  $scope.createPageErrors = function() {
    return $scope.pageAttributes["errors"];
  };

  $scope.createPageErrorsIsEmpty = function() {
    var errors = $scope.pageAttributes["errors"];
    return utils.isEmpty(errors);
  };

  $scope.editPageErrors = function(page) {
    return getPageAttributes(page)["errors"];
  };

  $scope.editPageErrorsIsEmpty = function(page) {
    var errors = $scope.editPageErrors(page);
    return utils.isEmpty(errors);
  };

  var getPageAttributes = function(page) {
    var attributes = $scope.pagesAttributes[page.id];
    if (angular.isUndefined(attributes)) {
        attributes = [];
        $scope.pagesAttributes[page.id] = attributes;
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

  $scope.tinymceOptions = {
    fontsize_formats: "8pt 9pt 10pt 11pt 12pt 20pt 26pt 30pt 36pt",
    plugins: 'print textcolor link image code fullscreen',
    toolbar: "undo redo styleselect fontsizeselect bold italic advlist link image forecolor backcolor | alignleft aligncenter alignright | fullscreen print code"
  };
});

adminApp.controller('AdminCategoryCtrl', function ($scope, $http, $modal, $timeout) {
  var EMPTY_CATEGORY = {id: -1, name: '', parent: 0, link: '', rank: 5, enabled: true};

  $scope.categories = [];
  $scope.categoriesAttributes = {};
  $scope.category = EMPTY_CATEGORY;
  $scope.categoryAttributes = {};
  $scope.creationIsClosed = true;

  $scope.refreshCategories = function() {
    $http.get('/admin/category')
        .success(function(data, status, headers, config) {
            $scope.categories = data;
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
  };
  $scope.refreshCategories();

  $scope.createCategory = function(category) {
    var categoryToCreate = angular.copy(category);
    $http.post('/admin/category', categoryToCreate)
        .success(function(data, status, headers, config) {
            $scope.categoryAttributes["errors"] = {};
            $scope.categories.push(data);
        })
        .error(function(data, status, headers, config) {
            $scope.categoryAttributes["errors"] = data;
        });
  };

  $scope.updateCategory = function(category) {
    openConfirmDialog("Do you really want to modify " + category.login + "?", function() {
        $http.put('/admin/category/' + category.id, category)
            .success(function(data, status, headers, config) {
                getCategoryAttributes(category)["errors"] = {};
            })
            .error(function(data, status, headers, config) {
                getCategoryAttributes(category)["errors"] = data;
            });
    });
  };

  $scope.deleteCategory = function(categoryId, categoryLogin) {
    openConfirmDialog("Do you really want to delete " + categoryLogin + "?", function() {
        $http.delete('/admin/category/' + categoryId)
            .success(function(data, status, headers, config) {
                $scope.refreshCategories();
            })
            .error(function(data, status, headers, config) {
                window.alert(data);
            });
    });
  };

  $scope.categoryCount = function() {
    return $scope.categories.size;
  };

  $scope.editCategoryToggle = function(category) {
    var isToggled = getCategoryAttributes(category)["toggled"] == true;
    getCategoryAttributes(category)["toggled"] = !isToggled;
  };

  $scope.editCategoryIsToggled = function(category) {
    return getCategoryAttributes(category)["toggled"] == true;
  };

  $scope.createCategoryErrors = function() {
    return $scope.categoryAttributes["errors"];
  };

  $scope.createCategoryErrorsIsEmpty = function() {
    var errors = $scope.categoryAttributes["errors"];
    return utils.isEmpty(errors);
  };

  $scope.editCategoryErrors = function(category) {
    return getCategoryAttributes(category)["errors"];
  };

  $scope.editCategoryErrorsIsEmpty = function(category) {
    var errors = $scope.editCategoryErrors(category);
    return utils.isEmpty(errors);
  };

  var getCategoryAttributes = function(category) {
    var attributes = $scope.categoriesAttributes[category.id];
    if (angular.isUndefined(attributes)) {
        attributes = [];
        $scope.categoriesAttributes[category.id] = attributes;
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

utils.addLoadEvent(function () {
    angular.bootstrap(document.getElementById("adminAppEl"), ['adminApp']);
});