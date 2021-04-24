$(document).ready(function () {
  $("#search").click(()=>{
    console.log("Search");
  });
  $("#list").click(()=>{
    $(".btn").addClass("hide");
    $(".overlay").css("animation","showOverlay 1.5s ease-in-out forwards");
    $(".header").css("animation","hideBgEnd 1.5s ease-in-out forwards");
    setTimeout(()=>{
      window.location.href = "recipes.html";
    },1500);
  });
  $("#add").click(()=>{
    console.log("Add");
  });
});
