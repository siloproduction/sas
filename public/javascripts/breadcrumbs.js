var breadcrumbsApp = angular.module('breadcrumbsApp', ['ui.bootstrap']);

breadcrumbsApp.controller('BreadcrumbsCtrl', function ($scope) {

});

utils.addLoadEvent(function () {
    angular.bootstrap(document.getElementById("breadcrumbsAppEl"), ['breadcrumbsApp']);
});