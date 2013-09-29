var admin = {

    updateUserPanelIdPrefix: "admin-update-user-",

    formOf: function(formId) {
        return $('#' + formId + '-form')
    },

    fillCurrentUsers: function() {
        $.get('/admin/getUsers', function(data) {
            $("#admin-list-user").html(data);
        });
    },

    createUserSubmitButton: function(actionUrl, formId) {
        $('#' + formId + '-submit span').text('Create');
        admin.formOf(formId).submit(function() {
            admin.createOrUpdateUser(actionUrl, admin.formOf(formId), formId, function() {
                admin.fillCurrentUsers();
            });
        });
    },

    updateUserSubmitButton: function(actionUrl, formId) {
        $('#' + formId + '-submit span').text('Update');
        admin.formOf(formId).submit(function() {
            admin.createOrUpdateUser(actionUrl, admin.formOf(formId), formId, function() {
                admin.fillCurrentUsers();
                $("#userFormId").dialog( "close" );
            });
        });
    },

    createOrUpdateUser: function(actionUrl, form, formId, finishedHandler) {
        var serializedForm = form.serialize();
        var newUserLogin = form.get()[0].login.value;
        $.post(actionUrl, serializedForm)
           .done(function (form) {
               $("#" + formId).html(form);
               finishedHandler();
           })
           .fail(function (error) {
               $("#" + formId).html(error.responseText);
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