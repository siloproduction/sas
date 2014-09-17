var ModalDemoCtrl = function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];
$scope.newTab = {};
    $scope.tabs = {};

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      templateUrl: 'partials/modalcontent.html',
      controller: ModalInstanceCtrl,
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
       $scope.addTab = function(){
        $scope.tabs.push($scope.newTab);
        tabs.add($scope.newTab);
        $scope.newTab = {};
    };
};

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {
 
 
  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };
    
  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};