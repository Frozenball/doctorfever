var Assets = window.Assets || {};

$(function(){
    $('#assets img').each(function(){
        var name = $(this).attr('id').replace('assets-', '');
        Assets[name] = this;
    });
});