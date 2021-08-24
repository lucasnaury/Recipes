$(document).ready(function () {
  //CSS FALLBACK for scrollbar overlay
  if(CSS.supports("overflow-y", "overlay") == false){
    $(".main-container").css("--scrollbar-width","0px")//If not supported, hide the scrollbar
  }

  //Hide scrollbar when not scrolling
  var scrollTimeout;

  $(".main-container").on("scroll",()=>{
    //Reset
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(()=>{
      $(".main-container").css("--scrollbar-opacity", 0);//Hide scrollbar after 2.5s
    },2500)

    $(".main-container").css("--scrollbar-opacity", .3);//Thumb bg opacity to default when scrolling

  });


});
