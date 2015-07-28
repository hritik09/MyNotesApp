$(function () {

    $('.note-create').on('click', function (e) {
        var data = {
            'title': $.trim($('input[name="title"]').val()),
            'note': $.trim($('textarea[name="note"]').val())
        };

        $.ajax({
            'url': '/add',
            'type': 'POST',
            'data': data,
            success: function (obj) {
                location.reload();
            }
        });
    });

    $('.note-delete').on('click', function (e) {
        var $container = $(e.target).parent().parent(),
            data = {
                'note_id': $container.attr('data-id')
            };

        $.ajax({
            'url': '/delete',
            'type': 'POST',
            'data': data,
            success: function (obj) {
                location.reload();
            }
        });
    });

    $('.note-edit').on('click', function (e) {
        var $container = $(e.target).parent().parent(),
            $title = $container.find('.title'),
            $desc = $container.find('.desc');

        $title.after(function () {
            return $('<input>', {
                type: 'text',
                class: 'edit-title',
                value: $.trim($title.text())
            });
        });

        $desc.after(function () {
            return $('<textarea>', {
                html: $.trim($desc.text()),
                class: 'edit-desc',
                rows: 5
            });
        });
        $container.find('.title').hide();
        $container.find('.desc').hide();

        toggleActions($container);
    });

    $('.note-save').on('click', function (e) {
        var $container = $(e.target).parent().parent(),
            $titleEdit = $container.find('.edit-title'),
            $descEdit = $container.find('.edit-desc'),
            data = {
                'note_id': $container.attr('data-id'),
                'title': $.trim($titleEdit.val()),
                'note': $.trim($descEdit.val())
            };

        $.ajax({
            'url': '/update',
            'type': 'POST',
            'data': data,
            success: function (obj) {
                location.reload();
            }
        });
    });

    function toggleActions($container) {
        $container.find('.note-edit').toggle();
        $container.find('.note-delete').toggle();
        $container.find('.note-save').toggle();
    }
});