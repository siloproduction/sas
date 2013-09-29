var admin = {

    updateUserPanelIdPrefix: "admin-update-user-",

    formOf: function(formId) {
        return $('#' + formId + '-form')
    },

    fillCurrentUsers: function() {
        $.get('/admin/getUsers', function(data) {
            $("#admin-list-user").replaceWith(data);
        });
    },

    updateUserDialogButton: function(buttonId, formId) {
         $('#' + formId).dialog({
            modal: true,
             close: function( event, ui ) {
                 admin.fillCurrentUsers();
             }
         });
         return false;
    },

    createUserSubmitButton: function(actionUrl, formId) {
        $('#' + formId + '-submit span').text('Create');
        admin.formOf(formId).submit(function() {
            admin.createOrUpdateUser(actionUrl, admin.formOf(formId), formId, function(form) {
                $('#' + formId).replaceWith(form);
                admin.fillCurrentUsers();
            });
            return false;
        });
    },

    updateUserSubmitButton: function(actionUrl, formId) {
        $('#' + formId + '-submit span').text('Update');
        admin.formOf(formId).submit(function() {
            admin.createOrUpdateUser(actionUrl, admin.formOf(formId), formId, function(form) {
                 $('#' + formId).dialog('close');
                 $('#' + formId).replaceWith(form);
                 admin.fillCurrentUsers();
             });
            return false;
        });
    },

    createOrUpdateUser: function(actionUrl, form, formId, finishedHandler) {
        var serializedForm = form.serialize();
        var newUserLogin = form.get()[0].login.value;
        $.post(actionUrl, serializedForm)
           .done(function (form) {
               finishedHandler(form);
           })
           .fail(function (error) {
                if (typeof error === "string") {
                    window.alert(error)
                } else {
                    $("#" + formId).replaceWith(error.responseText);
                }
           });
        return false;
    },

    deleteUser: function(actionUrl, userLogin) {
        utils.confirmDialog('Delete user ' + userLogin, function (dialogInstance) {
                $.ajax({
                    url: actionUrl,
                    type: 'DELETE'
                }).done(function() {
                    admin.fillCurrentUsers();
                    $(dialogInstance).dialog('close');
                }).fail(function( msg ) {
                    var alertContent = 'Error: ' + msg.responseText
                    alert(alertContent);
                });
            }
       );
    }
}