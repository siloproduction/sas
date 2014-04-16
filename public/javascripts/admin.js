var dialogCreateUserPopup = null;
var dialogCreateCategoryPopup = null;
var dialogCreatePagePopup = null;
var dialogPopup = $('<div id="admin-update-popup"></div>');

var pagePreviewPopup = $('<div id="admin-page-preview-popup"></div>');

var admin = {

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

    fillCurrentPages: function () {
        $.get('/admin/getPages', function (data) {
            $('#admin-list-page-container').html(data);
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
            admin.fillCurrentUsers();
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
            admin.fillCurrentCategories();
        });
    },


    pageOpenCreateDialog: function () {
        dialogCreatePagePopup.dialog({
            title: 'Create a page',
            buttons: {
                Create: function (event, ui) {
                    dialogCreatePagePopup.children(":first").submit();
                },
                Close: function (event, ui) {
                    $(this).dialog('close');
                }
            }
        });
        dialogCreatePagePopup.dialog('open');
        return false;
    },

    pageOpenUpdateDialog: function (pageId) {
        $.get('/admin/page/' + pageId, function (data) {
            dialogPopup.html(data);
            dialogPopup.dialog({
                title: 'Edit a page' + pageId,
                buttons: {
                    Edit: function (event, ui) {
                        dialogPopup.children(":first").submit();
                    },
                    Close: function (event, ui) {
                        admin.fillCurrentPages();
                        $(this).dialog('close');
                    }
                }
            });
            dialogPopup.dialog('open');
        });
        return false;
    },

    pageCreateFormSubmit: function (form) {
        var actionUrl = '/admin/page';
        var formElement = $(form);
        admin.createOrUpdateEntity(actionUrl, formElement, function (form) {
            formElement.get(0).reset();
            admin.fillCurrentPages();
        });
    },

    pageUpdateFormSubmit: function (form, pageId) {
        var actionUrl = '/admin/page/' + pageId;
        admin.createOrUpdateEntity(actionUrl, $(form), function (form) {
            admin.fillCurrentPages();
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

    deletePage: function (actionUrl, pageName) {
        admin.deleteEntity(actionUrl, 'Delete page ' + pageName, function () {
            admin.fillCurrentPages();
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
    },

    popupPagePreview: function (pageDataId) {
        pagePreviewPopup.html($("#" + pageDataId).val());
        pagePreviewPopup.dialog('open');
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

    pagePreviewPopup.dialog({
        title: "Page preview",
        position: { my: "center top", at: "center top", of: window },
        autoOpen: false,
        modal: true,
        zIndex: 10000,
        resizable: true,
        width: "80%"
    });
    dialogCreatePagePopup = $('#admin-create-page');
    dialogCreatePagePopup.dialog({
        autoOpen: false,
        modal: true,
        zIndex: 10000,
        width: 'auto',
        resizable: true
    });

    admin.fillCurrentUsers();
    admin.fillCurrentCategories();
    admin.fillCurrentPages();
});