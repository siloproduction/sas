var bodyControllers = angular.module('bodyControllers', []);

var changePage = function($rootScope, page) {
    $rootScope.pageContent = page.content;
    utils.changeDocumentTitle(page.title);
    $rootScope.$broadcast("page-content-changed");
};

var onRouteChangeFirst = true;
var onRouteChange = function(event, newUrl) {
    if (onRouteChangeFirst) {
        event.preventDefault();
        onRouteChangeFirst = false;
    }
};

bodyControllers.controller('indexRouteController', ['$rootScope', '$scope', '$http',
  function ($rootScope, $scope, $http) {
    $http.get("/content/index")
        .success(function(data, status, headers, config) {
            changePage($rootScope, data);
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
}]);

bodyControllers.controller('pageRouteController', ['$rootScope', '$scope', '$http', '$routeParams',
  function($rootScope, $scope, $http, $routeParams) {
    $http.get("/content/page/" + $routeParams.permanentLink)
        .success(function(data, status, headers, config) {
            changePage($rootScope, data);
        })
        .error(function(data, status, headers, config) {
            window.alert(data);
        });
}]);



var bodyApp = angular.module('bodyApp', ['ui.bootstrap', 'ngRoute', 'bodyControllers']);

bodyApp.controller('BodyCtrl', ['$rootScope', '$scope', '$sce',
  function ($rootScope, $scope, $sce) {
    $rootScope.$on('$locationChangeStart', onRouteChange);

    $scope.isInitialPage = true;
    $scope.htmlContent = function() {
        return $sce.trustAsHtml($scope.pageContent);
    };

    $scope.$on("page-content-changed", function(event, args) {
        $scope.isInitialPage = false;
    });
}]);

bodyApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/assets/partials/page.html',
            controller  : 'indexRouteController'
        })
        .when('/page/:permanentLink', {
            templateUrl: '/assets/partials/page.html',
            controller  : 'pageRouteController'
        });
    $locationProvider.html5Mode(true);
}]);