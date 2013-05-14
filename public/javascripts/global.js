function showTooltipById(id) {
	$("#"+id).tooltip({
		effect: "fade",
		position: "bottom center",
		delay: 50,
		opacity: 0.7});
}
