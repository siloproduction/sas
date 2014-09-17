app.controller('CarouselDemoCtrl',['$scope', '$animate', function ($scope, $animate) {
    $scope.animate = false;
    $scope.animateGlobal = true;
    $scope.myInterval = 3000;
    $scope.$watch('animateGlobal', function(val){
        console.log('Set Global animation Enabled: ' + val);
        $animate.enabled(val); 
    });  
    
    $scope.slides = [
        { image: 'http://lorempixel.com/400/200/', text: 'blah' },    
        { image: 'http://lorempixel.com/400/200/', text: 'blah' },
        { image: 'http://lorempixel.com/400/200/', text: 'blah' }, 
    ];
    
}]);
    
// apply to the parrent of the element you want 
// angular animations to be disabled on    

angular.module('ui.bootstrap.setNgAnimate', ['ngAnimate'])
.directive('setNgAnimate', ['$animate', function ($animate) {
    return {
        link: function ($scope, $element, $attrs) { 
          
            $scope.$watch( function() { 
                    return $scope.$eval($attrs.setNgAnimate, $scope); 
                }, function(valnew, valold){
                    $animate.enabled(!!valnew, $element);
            });  
            
            
        }
    };
}]);
