app.directive('ngEvent', function(){
  return{
    restrict : 'C',
    templateUrl:'assets/partials/_event.html'
  }
});

app.directive('ngSearch', function(){
                return{
                    restrict : 'C',
                    templateUrl:'assets/partials/_searchEvent.html'
                } 

});


app.directive('ngAddtab', function(){
    return{
        restrict : 'C',
        templateUrl:'assets/partials/_addtab.html'
    }
});

app.directive('ngVideo', function(){
    return{
        restrict : 'C',
        templateUrl:'assets/partials/_video.html'
    }
});

app.directive('ngMusique', function(){
              return{
                  restrict : 'C',
                  templateUrl:'assets/partials/_musique.html'
              }
              
              });

app.directive('ngLecteur', function(){
    return{
        restrict : 'C',
        link : function(scope, element){
            $(document).ready(function(){
                $('.ng-lecteur').mouseover(function(){
                var w = $(this).find('iframe').css('width');
                var h = $(this).find('iframe').css('height');
                $(this).find('.lecteur_controller').css({'width': w});
                $(this).find('.lecteur_controller').css({'height': h});
                $(this).find('.lecteur_controller').css({'display': 'block'});
                });
                $('.ng-lecteur').mouseleave(function(){
                $(this).find('.lecteur_controller').css({'display': 'none'});
                });
                $(element).find('.lecteur_controller').find('a').click(function(){
                    $('.lecteur_content').find('iframe').remove();
                    $(this).parent().parent().find('iframe').clone().appendTo(".lecteur_content");
                    var bl = $('ng-lecture').css('bottom'); 
                    if(bl !=0){ $('.ng-lecture').animate({'bottom': 0}, 2000);
                              $('.restaurer').remove();
                              $('.reduire').remove();
                              $('.ng-control').append('<a class="reduire"> - </a>');
                    }
                    $('.ng-control').css({'display':'block'});
                    
                });
        });
    }
    }
});

app.directive('ngLecture', function(){
    return{
        restrict : 'C',
        templateUrl : 'assets/partials/_lecteur.html'
    }
});

app.directive('ngControl', function(){
    return{
        restrict : 'C',
        link : function(scope, element){
            $(element).find('.close').click(function(){
                $(this).parent().parent().find('iframe').remove();
                $(element).css({'display':'none'})
            });
            $(element).mouseenter(function(){
            $(element).find('.reduire').click(function(){
                var hr = $('.lecteur_content').css('height');
                $(element).parent().animate({'bottom':'-'+hr},2000);
                $('.reduire').remove();
                $('.ng-control').append('<a class="restaurer">+</a>');
                $(element).find('.restaurer').click(function(){
                $(element).parent().animate({'bottom': 0}, 2000);
                $('.restaurer').remove();
                $('.ng-control').append('<a class="reduire">-</a>')
            });
            });
            
            });
        }
    }
});

app.directive('navMenu', function($location) {
    return function(scope, element, attrs) {
        var links = element.find('a'),
            onClass = attrs.navMenu || 'on',
            routePattern,
            link,
            url,
            currentLink,
            urlMap = {},
            i;

        if (!$location.$$html5) {
            routePattern = /^#[^/]*/;
        }

        for (i = 0; i < links.length; i++) {
            link = angular.element(links[i]);
            url = link.attr('href');

            if ($location.$$html5) {
                urlMap[url] = link;
            } else {
                urlMap[url.replace(routePattern, '')] = link;
            }
        }

        scope.$on('$routeChangeStart', function() {
            var pathLink = urlMap[$location.path()];

            if (pathLink) {
                if (currentLink) {
                    currentLink.parent().removeClass(onClass);
                }
                currentLink = pathLink;
                currentLink.parent().addClass(onClass);
            }
        });
    };
});

app.directive('wrapper-outer', function(){
    return{
        restrict : 'C',
        link : function(scope, element){
            $('a').each().click(function(){
            $('#pages-nav').find('ul').find('li').removeClass('active');
            });
        }
    }
});

app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});
