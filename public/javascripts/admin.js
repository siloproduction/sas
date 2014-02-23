var admin = {

    updateUserPanelIdPrefix: 'admin-update-user-',

    formOf: function (formId) {
        return $('#' + formId + '-form');
    },

    fillCurrentUsers: function () {
        $.get('/admin/getUsers', function (data) {
            $("#admin-list-user").replaceWith(data);
        });
    },

    fillCurrentCategories: function () {
        $.get('/admin/getCategories', function (data) {
            $('#admin-list-category').replaceWith(data);
        });
    },

    updateUserDialogButton: function (buttonId, formId) {
        admin.updateEntityDialogButton(buttonId, formId, function ( event, ui ) {
            admin.fillCurrentUsers();
        });
    },

    updateCategoryDialogButton: function (buttonId, formId) {
        admin.updateEntityDialogButton(buttonId, formId, function ( event, ui ) {
            admin.fillCurrentCategories();
        });
    },

    updateEntityDialogButton: function (buttonId, formId, finishedHandler) {
         $('#' + formId).dialog({
             modal: true,
             close: finishedHandler
         });
         return false;
    },

    createUserSubmitButton: function (actionUrl, formId) {
        admin.createEntitySubmitButton(actionUrl, formId, function () {
            admin.fillCurrentUsers();
        });
    },

    createCategorySubmitButton: function (actionUrl, formId) {
        admin.createEntitySubmitButton(actionUrl, formId, function () {
            admin.fillCurrentCategories();
        });
    },

    createEntitySubmitButton: function (actionUrl, formId, finishedHandler) {
        $('#' + formId + '-submit span').text('Create');
        admin.formOf(formId).submit(function () {
            admin.createOrUpdateEntity(actionUrl, admin.formOf(formId), formId, function (form) {
                //$('#' + formId).replaceWith(form);
                finishedHandler();
            });
            return false;
        });
    },

    updateUserSubmitButton: function (actionUrl, formId) {
        admin.updateEntitySubmitButton(actionUrl, formId, function () {
            admin.fillCurrentUsers();
        });
    },

    updateCategorySubmitButton: function (actionUrl, formId) {
        admin.updateEntitySubmitButton(actionUrl, formId, function () {
            admin.fillCurrentCategories();
        });
    },

    updateEntitySubmitButton: function (actionUrl, formId, finishedHandler) {
        $('#' + formId + '-submit span').text('Update');
        admin.formOf(formId).submit(function () {
            admin.createOrUpdateEntity(actionUrl, admin.formOf(formId), formId, function (form) {
                 $('#' + formId).dialog('close');
                 //$('#' + formId).replaceWith(form);
                 finishedHandler();
             });
            return false;
        });
    },

    createOrUpdateEntity: function (actionUrl, form, formId, finishedHandler) {
        var serializedForm = form.serialize();
        $.post(actionUrl, serializedForm)
            .done(function (form) {
               finishedHandler(form);
            }).fail(function (error) {
                if (typeof error === "string") {
                    window.alert(error);
                } else {
                    form.replaceWith(error.responseText);
                }
           });
        return false;
    },

    deleteUser: function (actionUrl, userLogin) {
        admin.deleteEntity(actionUrl, 'Delete user ' + userLogin, function () {
            admin.fillCurrentUsers();
        });
    },

    deleteCategory: function (actionUrl, categoryId, categoryName) {
        admin.deleteEntity(actionUrl, 'Delete category ' + categoryName, function () {
            admin.fillCurrentCategories();
        });
    },

    deleteEntity: function (actionUrl, title, finishedHandler) {
        utils.confirmDialog(title, function (dialogInstance) {
                $.ajax({
                    url: actionUrl,
                    type: 'DELETE'
                }).done(function () {
                    finishedHandler();
                    $(dialogInstance).dialog('close');
                }).fail(function ( msg ) {
                    var alertContent = 'Error: ' + msg.responseText;
                    alert(alertContent);
                });
            }
       );
    }
};