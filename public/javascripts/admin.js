var updateUserPanelIdPrefix = "admin-update-user-";

var fillCurrentUsers = function() {
    $.get('/admin/getUsers', function(data) {
        $("#admin-list-user").html(data);
    });
}
var createUser = function(actionUrl, form, userFormId) {
    createOrUpdateUser(actionUrl, form, userFormId, function() {
        fillCurrentUsers();
    });
}
var updateUser = function(actionUrl, form, userFormId) {
    createOrUpdateUser(actionUrl, form, userFormId, function() {});
    $("#userFormId").dialog( "close" );
}
var createOrUpdateUser = function(actionUrl, form, userFormId, finishedHandler) {
    var serializedForm = form.serialize();
    var newUserLogin = form.get()[0].login.value;
    $.post(actionUrl, serializedForm)
       .done(function (form) {
           $("#" + userFormId).html(form);
           finishedHandler();
       })
       .fail(function (error) {
           $("#" + userFormId).html(error.responseText);
       });
}