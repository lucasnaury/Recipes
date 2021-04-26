$(document).ready(function () {
  //MAIN BUTTONS
  $("#search").click(()=>{ //Show serach bar + filters
    hideMainBtns();
    $(".main-container-search").addClass("show");
    $(".main-container-search").removeClass("hide");
  });
  $("#list").click(()=>{ //Show list
    hideMainBtns();
    $(".main-container-list").addClass("show");
    $(".main-container-list").removeClass("hide");
  });
  $("#random").click(()=>{ //Show random btns
    hideMainBtns();
    $(".main-container-random").addClass("show");
    $(".main-container-random").removeClass("hide");
  });


  //SEARCH
  $("#search-btn").click(()=>{
    value = $("#search-input").val();
    if(value){
      $(".main-container-search .input-container p").css("opacity",0);
      loadRecipePage(null,value);
    }else{
      $(".main-container-search .input-container p").css("opacity",1);
      setTimeout(()=>{
        $(".main-container-search .input-container p").css("opacity",0);
      },5000);
    }
  });
  $("#search-back-btn").click(()=>{
    //Hide search btns
    $(".main-container-search").removeClass("show");
    $(".main-container-search").addClass("hide");
    //Show main btns
    showMainBtns();
  });

  //MY RECIPES
  //Top tab buttons
  $("#my-recipes-btn").click(()=>{
    $(".top").removeClass("active");
    $(".panels").removeClass("active");
  });
  $("#favorites-btn").click(()=>{
    $(".top").addClass("active");
    $(".panels").addClass("active");
  });
  $("#list-back-btn").click(()=>{
    //Hide list
    $(".main-container-list").removeClass("show");
    $(".main-container-list").addClass("hide");
    //Show main btns
    showMainBtns();
  });
  //List items
  $(".recipe-item").click((event)=>{
    var id= event.currentTarget.dataset.id; //Get the data-id element in HTML
    loadRecipePage(null,null,id);
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
  $("#random-back-btn").click(()=>{
    //Hide search btns
    $(".main-container-random").removeClass("show");
    $(".main-container-random").addClass("hide");
    //Show main btns
    showMainBtns();
  });
});






function hideMainBtns(){
  $(".main-container").removeClass("show");
  $(".main-container").addClass("hide");
}
function showMainBtns(){
  $(".main-container").css("--anim-delay","600ms");
  $(".main-container").removeClass("hide");
  $(".main-container").addClass("show");
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
