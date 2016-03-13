$(function() {
  var content = $('body > *').detach();
  $('body').load('/template.html', function() {
    content.appendTo('#body');
    $('#nav-' + $('body').data('nav')).attr('class', 'current-nav');
  });
});
