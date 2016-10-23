//Fade header on scroll
$(window).scroll(function(){
    $("#header h1").css("opacity", 1 - $(window).scrollTop() / 300);
    $("#header hr").css("opacity", 1 - $(window).scrollTop() / 300);
  });


  $(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
  });
