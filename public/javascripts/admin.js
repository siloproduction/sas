var dialogCreateUserPopup = null;
var dialogCreateCategoryPopup = null;
var dialogPopup = $('<div id="admin-update-popup"></div>');

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
            $('#admin-list-category-container').html(data);
        });
    },

    userOpenCreateDialog: function () {
        dialogCreateUserPopup.dialog({
            title: 'Create user',
            buttons: {
                Create: function (event, ui) {
                    dialogCreateUserPopup.children(":first").submit();
                },
                Close: function (event, ui) {
                    $(this).dialog('close');
                }
            }
        });
        dialogCreateUserPopup.dialog('open');
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
                        admin.fillCurrentUsers();
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
        admin.createOrUpdateEntity(actionUrl, formElement, function (form) {
            formElement.get(0).reset();
            admin.fillCurrentUsers();
        });
    },

    userUpdateFormSubmit: function (form, userId) {
        var actionUrl = '/admin/user/' + userId;
        admin.createOrUpdateEntity(actionUrl, $(form), function (form) {
            // nothing
        });
    },

    categoryOpenCreateDialog: function () {
        dialogCreateCategoryPopup.dialog({
            title: 'Create a category',
            buttons: {
                Create: function (event, ui) {
                    dialogCreateCategoryPopup.children(":first").submit();
                },
                Close: function (event, ui) {
                    $(this).dialog('close');
                }
            }
        });
        dialogCreateCategoryPopup.dialog('open');
        return false;
    },

    categoryOpenUpdateDialog: function (categoryId) {
        $.get('/admin/category/' + categoryId, function (data) {
            dialogPopup.html(data);
            dialogPopup.dialog({
                title: 'Edit a category' + categoryId,
                buttons: {
                    Edit: function (event, ui) {
                        dialogPopup.children(":first").submit();
                    },
                    Close: function (event, ui) {
                        admin.fillCurrentCategories();
                        $(this).dialog('close');
                    }
                }
            });
            dialogPopup.dialog('open');
        });
        return false;
    },

    categoryCreateFormSubmit: function (form) {
        var actionUrl = '/admin/category';
        var formElement = $(form);
        admin.createOrUpdateEntity(actionUrl, formElement, function (form) {
            formElement.get(0).reset();
            admin.fillCurrentCategories();
        });
    },

    categoryUpdateFormSubmit: function (form, categoryId) {
        var actionUrl = '/admin/category/' + categoryId;
        admin.createOrUpdateEntity(actionUrl, $(form), function (form) {
            // nothing
        });
    },

    createOrUpdateEntity: function (actionUrl, form, finishedHandler) {
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

    deleteCategory: function (actionUrl, categoryName) {
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
        zIndex: 10000,
        width: 'auto',
        resizable: true
    });

    dialogCreateUserPopup = $('#admin-create-user');
    dialogCreateUserPopup.dialog({
        autoOpen: false,
        modal: true,
        zIndex: 10000,
        width: 'auto',
        resizable: true
    });

    dialogCreateCategoryPopup = $('#admin-create-category');
    dialogCreateCategoryPopup.dialog({
        autoOpen: false,
        modal: true,
        zIndex: 10000,
        width: 'auto',
        resizable: true
    });

    admin.fillCurrentUsers();
    admin.fillCurrentCategories();
});