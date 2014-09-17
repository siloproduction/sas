
	app.controller ('UsersCtrl', function ($scope, UserFactory, $routeParams, $modal){
	var user = UserFactory.getUser($routeParams.id).then(function(user){
    $scope.newTab = {};
	$scope.user = user;
    $scope.open = function (size) {
        var modalInstance = $modal.open({
          templateUrl: 'partials/modalcontent.html',
            controller : ModalInstanceCtrl,
          size: size
        })
      };
var ModalInstanceCtrl = function ($scope, $modalInstance){
    $scope.user=user;
    $scope.addTab = function(){
    $scope.user.tabs.push($scope.newTab);
    $scope.newTab = {};
    }; 
  $scope.ok = function () {
    $modalInstance.close($scope.newTab);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
         
	}, function(msg){
		alert (msg);
		})
    
   $scope.addTab = function(){
    $scope.user.tabs.push($scope.newTab);
    $scope.newTab = {};
    };
    
	});
