$(function() {
  var content = $('body > *').detach();
  $('body').load('/template.html', function() {
    $('header').clone().addClass('placeholder').prependTo('body');
    $('header nav a.' + $('body').data('nav')).addClass('current');
    content.appendTo('main');
  });
});
