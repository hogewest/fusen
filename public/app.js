$(document).ready(function() { 
    $.ajaxSetup( { cache: false } );
    $.validity.setup({ outputMode:"customLabel" });
    $.validity.setup({ outputErrorTarget: {message: "message_title"}} );
});

$(function() {
    $.getJSON("/init", function(json) {
        for(var i=0; i < json.length; i++) {
            $('<div id="id_' + json[i].id + '"><div class="sticky-header"><span class="close">×</span></div><div class="sticky-body">' + json[i].message + '</div></div>')
            .addClass("sticky")
            .css("left", json[i].left + "px")
            .css("top", json[i].top + "px")
            .appendTo('#fusen-box')
            .draggable({
                containment: '#fusen-box',
                scroll: false,
                handle: "div.sticky-header",
                stop: function() {
                    update($(this), true);
                }
            });
        }
    });

    $('#create').click(function() {
        openDialog(null, "新規作成");
        $('#message').val("");
    });

    $(".close").live("click", function(){
        var sticky = $(this).closest(".sticky");
        $.post(
            "delete",
            {"id" : sticky.attr("id")},
            function() {
                sticky.remove();
            },
            "JSON"
        );
    });

    $(".sticky").live("dblclick", function() {
        openDialog($(this), "更新");
        $('#message').val(convertMessage($(this).find(".sticky-body").html()));
    });

    $("#create").mouseover(function() {
        $(this).addClass("create-color");
    });
    $("#create").mouseout(function() {
        $(this).removeClass("create-color");
    });
});

function convertMessage(message) {
    var convert_message = message.replace(/<br>|<BR>|<br\/>|<BR\/>/g, "\n");
    convert_message = convert_message.replace(/&lt;/g, "<");
    return convert_message.replace(/&gt;/g, ">");
}

function openDialog(owner, title) {
    $('#dialog').dialog({
        autoOpen: false,
        modal: true,
        title: title,
        width: "auto",
        resizable: false,
        buttons: {
            "キャンセル": function() {
                $.validity.clear();
                $(this).dialog("close");
            },
            "OK": function() {
                if(validateForm()) {
                    $(this).dialog("close");

                    var message = $('#message').val();
                    postData(owner, message);
                }
            }
        }
    });

    $('#dialog').dialog("open");
};

function postData(owner, message) {
    if(owner == null) {
        create(message);
    } else {
        update(owner, false);
    }
};

function create(message) {
    var sticky = new Object();
    sticky.message = message;
    $.post(
        "create",
        sticky,
        function(json) {
            add(json);
        },
        "JSON"
    );
};

function update(owner, is_draggable) {
    $.post(
        "update",
        createSticky(owner, is_draggable),
        function(json) {
            var data = eval("(" + json + ")");
            $("#id_" + data.id).find(".sticky-body").html(data.message);
        },
        "JSON"
    );
};

function add(json) {
    var sticky_data = eval("(" + json + ")");

    $('<div id="id_' + sticky_data.id + '"><div class="sticky-header"><span class="close">×</span></div><div class="sticky-body">' + sticky_data.message + '</div></div>')
    .addClass("sticky")
    .css("left", sticky_data.left + "px")
    .css("top", sticky_data.top + "px")
    .appendTo('#fusen-box')
    .draggable({
        containment: '#fusen-box',
        scroll: false,
        handle: "div.sticky-header",
        stop: function() {
            update($(this), true);
        }
    });
};

function createSticky(owner, is_draggable) {
    var sticky = {id: owner.attr("id"), left: owner.position().left, top: owner.position().top};
    if(!is_draggable) {
        sticky.message = $("#message").val();
    }
    return sticky;
};

// Validation
function validateForm() {
    $.validity.start();

    $("#message")
        .require("本文は必ず入力してください。")
        .maxLength(2000, "本文は2000文字以上は入力できません。");

    var result = $.validity.end();
    return result.valid;
};
