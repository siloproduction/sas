$(document).ready(function(){  
  
  	var isShown = false;
    $("ul.topnav li").hover(function() { //When trigger is clicked...  
		if (isShown) {
			return;
		}
        //Following events are applied to the subnav itself (moving subnav up and down)  
        $(this).find("ul.subnav").slideDown('fast', function() {
			isShown = true;
        }).show(); //Drop down the subnav on click  
  		
        $(this).hover(function() {  
        }, function(){
			if (!isShown) {
				return;
			}
            $(this).find("ul.subnav").slideUp('slow', function() {
            	isShown = false;  
            }); //When the mouse hovers out of the subnav, move it back up
        });  
  		
        //Following events are applied to the trigger (Hover events for the trigger)  
        }).hover(function() {  
            $(this).addClass("subhover"); //On hover over, add class "subhover"  
        }, function(){  //On Hover Out  
            $(this).removeClass("subhover"); //On hover out, remove class "subhover"  
    });  
  
});  