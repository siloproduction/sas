var dialogCreatePopup = null;
var dialogPopup = $('<div id="admin-update-user-popup"></div>');

var admin = {

    updateUserPanelIdPrefix: 'admin-update-user-',

    formOf: function (formId) {
        return $('#' + formId + '-form');
    },

    fillCurrentUsers: function () {
        $.get('/admin/getUsers', function (data) {
            $("#admin-list-user-container").html(data);
        });
    },

    fillCurrentCategories: function () {
        $.get('/admin/getCategories', function (data) {
            $('#admin-list-category').replaceWith(data);
        });
    },

    userOpenCreateDialog: function () {
        dialogCreatePopup.dialog({
            title: 'Create user',
            buttons: {
                Create: function (event, ui) {
                    dialogCreatePopup.children(":first").submit();
                },
                Close: function (event, ui) {
                    $(this).dialog('close');
                }
            }
        });
        dialogCreatePopup.dialog('open');
        return false;
    },

    userOpenUpdateDialog: function (userId) {
        $.get('/admin/user/' + userId, function (data) {
            dialogPopup.html(data);
            dialogPopup.dialog({
                title: 'Edit user' + userId,
                buttons: {
                    Edit: function (event, ui) {
                        dialogPopup.children(":first").submit();
                    },
                    Close: function (event, ui) {
                        $(this).dialog('close');
                    }
                }
            });
            dialogPopup.dialog('open');
        });
        return false;
    },

    userCreateFormSubmit: function (form) {
        var actionUrl = '/admin/user';
        var formElement = $(form);
        admin.createOrUpdateEntity(actionUrl, formElement, "not used", function (form) {
            formElement.get(0).reset();
            admin.fillCurrentUsers();
        });
    },

    userUpdateFormSubmit: function (form, userId) {
        var actionUrl = '/admin/user/' + userId;
        admin.createOrUpdateEntity(actionUrl, $(form), "not used", function (form) {
            // nothing
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
            .done(function (formResult) {
               form.replaceWith(formResult);
               finishedHandler(formResult);
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

$(document).ready( function() {
    dialogPopup.dialog({
        autoOpen: false,
        modal: true,
        close: admin.fillCurrentUsers,
        zIndex: 10000,
        width: 'auto',
        resizable: true
    });

    dialogCreatePopup = $('#admin-create-user');
    dialogCreatePopup.dialog({
        autoOpen: false,
        modal: true,
        zIndex: 10000,
        width: 'auto',
        resizable: true
    });

    admin.fillCurrentUsers();
});