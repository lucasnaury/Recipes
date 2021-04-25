$(document).ready(function () {
  //MAIN BUTTONS
  $("#search").click(()=>{ //Show serach bar + filters
    hideMainBtns();
    $(".main-container-search").addClass("show");
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
    loadRecipePage("entree");
  });
  $("#plate").click(()=>{
    loadRecipePage("plate");
  });
  $("#dessert").click(()=>{
    loadRecipePage("dessert");
  });

  //SEARCH
  $("#search-btn").click(()=>{
    value = $("#search-input").val();
    loadRecipePage(null,value);
  });
});

function hideMainBtns(){
  $(".main-container").removeClass("show");
  $(".main-container").addClass("hide");
}

function loadRecipePage(type,searchValue,id){
  //Hide active menu
  $(".show").addClass("hide");
  $(".show").removeClass("show");
  //Make the overlay + BG fade out
  $(".overlay").css("animation","showOverlay 1.5s ease-in-out forwards");
  $(".header").css("animation","hideBgEnd 1.5s ease-in-out forwards");
  //Pass the params to the recipes page
  var query = "";

  if(type) query += "#type=" + type;
  if(searchValue) query += "#search=" + searchValue;
  if(id) query += "#id=" + id;
  //Load page after animations
  setTimeout(()=>{
    window.location.href = "recipes.html" + query;
  },1500);
}
