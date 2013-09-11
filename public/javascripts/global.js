function showTooltipById(id) {
	$("#"+id).tooltip({
		effect: "fade",
		position: "bottom center",
		delay: 50,
		opacity: 0.7});
}

function confirmDialog(message, yesFunction) {
    $('<div></div>').appendTo('body')
        .html('<div><h6>Are you sure ?</h6></div>')
        .dialog({
            modal: true, title: message, zIndex: 10000, autoOpen: true, width: 'auto', resizable: false,
            buttons: {
                Yes: function (event, ui) {
                    yesFunction(this)
                },
                No: function (event, ui) {
                    $(this).dialog('close');
                }
            }
        });
};