$(document).ready(function () {
  //MAIN BUTTONS
  $("#search").click(()=>{ //Show serach bar + filters
    console.log("Search");
  });
  $("#list").click(()=>{ //Show list
    console.log("List");
  });
  $("#random").click(()=>{ //Show random btns
    hideMainBtns();
    $(".main-container-random").addClass("show");
  });

  //RANDOM
  $("#entree").click(()=>{
    console.log("Entree");
    loadRecipePage("entree");
  });
  $("#plate").click(()=>{
    console.log("Plate");
    loadRecipePage("plate");
  });
  $("#dessert").click(()=>{
    console.log("Dessert");
    loadRecipePage("dessert");
  });
});

function hideMainBtns(){
  $(".main-container").removeClass("show");
  $(".main-container").addClass("hide");
}

function loadRecipePage(plateType){
  //Hide active menu
  $(".show").addClass("hide");
  $(".show").removeClass("show");
  //Make the overlay + BG fade out
  $(".overlay").css("animation","showOverlay 1.5s ease-in-out forwards");
  $(".header").css("animation","hideBgEnd 1.5s ease-in-out forwards");
  //Load page after animations
  setTimeout(()=>{
    window.location.href = "recipes.html" + "#id="+"39495";
  },1500);
}
