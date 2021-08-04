$(document).ready(function () {
  //console.log(firebase);

  //FIREBASE AUTHENTICATION
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();


  //Buttons
  $("#login-btn").click(()=>{
    auth.signInWithPopup(provider);
  });
  $("#logout-btn").click(()=>{
    auth.signOut();
  });
  //Check if logged in on page load (only once)
  var hasCheckedOnPageLoad = false;
  auth.onAuthStateChanged(user=>{ //Show user logged in or ask him to log in
    if(!hasCheckedOnPageLoad){
      if(user){//if signed in
        //Show user info
        $(".user-info").html(`<span>${user.displayName.split(" ")[0]} ${user.displayName.split(" ")[1].substring(0,1)}.</span>`);
        //Show elements
        show($("#logout-btn"));
        $(".main-container").addClass("show");
        $(".main-container-login").css("--anim-delay","600ms");//If not loaded first, default delay
        $(".main-container").css("--anim-delay","3.2s");//If loaded first, long delay
      }else{//if not signed in
        $(".main-container-login").css("--anim-delay","3.2s");//If loaded first, long delay
        $(".main-container").css("--anim-delay","600ms")//If not loaded first, default delay
        $(".main-container-login").addClass("show");
      }
      setTimeout(()=>{hasCheckedOnPageLoad = true;},10);
    }
  });


  auth.onAuthStateChanged(user=>{ //Show user logged in or ask him to log in
    if(hasCheckedOnPageLoad){ //If not first load
      if(user){//if signed in
        //Show user info
        $(".user-info").html(`<span>${user.displayName.split(" ")[0]} ${user.displayName.split(" ")[1].substring(0,1)}.</span>`);
        //Reset animation delays
        $("#logout-btn").css("--anim-delay","600ms");
        $(".main-container-login").css("--anim-delay","600ms");
        $(".main-container").css("--anim-delay","600ms");
        //Hide and show elements
        show($("#logout-btn"));
        show($(".main-container"));
        hide($(".main-container-login"));

      }else{//if not signed in
        //Reset animation delays
        $(".main-container-login").css("--anim-delay","600ms");
        $(".main-container").css("--anim-delay","600ms");
        //Hide every tab
        hide($("#logout-btn"));
        hide($(".main-container"));
        hide($(".main-container-search"));
        hide($(".main-container-list"));
        hide($(".main-container-random"));
        //Show login page
        show($(".main-container-login"));
      }
    }
  });



  //FIRESTORE DATABASE
  const db = firebase.firestore();

  let recipesRef;
  let unsubscribe;

  auth.onAuthStateChanged(user=>{ //Show user logged in or ask him to log in
    if(user){//if signed in
      recipesRef = db.collection("recipes");
      var types = ["entree","plate","dessert"];

      $("#add-btn").click(()=>{
        loadAddRecipePage();
      });
      $("#list").click(()=>{ //Show serach bar + filters
        queryMyRecipes(db,user.uid);
      });
    }else{
      $("#add-btn").click(()=>{
        console.log("Error - User not signed in");
      });
    }
  });






  //MAIN BUTTONS
  $("#search").click(()=>{ //Show serach bar + filters
    hide($(".main-container"));
    show($(".main-container-search"));
  });
  $("#list").click(()=>{ //Show list
    hide($(".main-container"));
    show($(".main-container-list"));
  });
  $("#random").click(()=>{ //Show random btns
    hide($(".main-container"));
    show($(".main-container-random"));
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
    hide($(".main-container-search"));
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
    hide($(".main-container-list"));
    //Show main btns
    showMainBtns();
  });
  //List items
  /*$(".recipe-item").click((event)=>{
    console.log("clicked");
    var id= event.currentTarget.dataset.id; //Get the data-id element in HTML
    loadRecipePage(null,null,id);
  });*/
  $('.recipe-list').on('click', '.recipe-item', (event)=>{//using on event to handle click on appended elements
    var id = event.currentTarget.dataset.id; //Get the data-id element in HTML
    console.log(id);
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
    hide($(".main-container-random"));
    //Show main btns
    showMainBtns();
  });
});

//UI
function showMainBtns(){
  $(".main-container").css("--anim-delay","600ms");
  show($(".main-container"));
}
function show(container){
  container.css("display","flex");
  container.addClass("show");
  container.removeClass("hide");
}
function hide(container){
  if(container.hasClass("show") || (container == $(".main-container") && !container.hasClass("show"))){
    container.addClass("hide");
    container.removeClass("show");
    var transitionDuration = 700;
    setTimeout(()=>{
      container.css("display","none");
    },transitionDuration);
  }
}

//Add recipe
function loadAddRecipePage(){
  //Prevent user from logging out when loading
  $("#logout-btn").css("pointer-events","none");
  //Hide active menu
  hide($(".show"));
  $(".header").css("animation","hideBgEnd 1.5s ease-in-out forwards");
  //Load page after animations
  setTimeout(()=>{
    window.location.href = "add-recipe.html";
  },1500);
}

//Load recipe
function loadRecipePage(type,searchValue,id){
  //Prevent user from logging out when loading
  $("#logout-btn").css("pointer-events","none");
  //Hide active menu
  hide($(".show"));
  //Make the overlay + BG fade out
  show($(".overlay"));
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



//Query my recipes
function queryMyRecipes(db, userID){
  let recipesRef = db.collection("recipes");
  let query;

  recipesRef.where("uid","==", userID).get()
    .then((querySnapshot)=>{
      processQuerySnapshot(querySnapshot);
    })
    .catch((error)=>{
      console.log("Type Request - Error : " + error);
      $(".my-panel .recipe-list").html("<p>Aucune recette trouvée.</p>");//Remove already existing items
    });

}

function processQuerySnapshot (querySnapshot){
  var docs = [];
  querySnapshot.forEach((doc) => {
    docs.push({
      id : doc.id,//Recipe unique ID
      data : doc.data()//Recipe data
    });
  });

  appendMyRecipes(docs);
}

function appendMyRecipes(myRecipes){
  if(myRecipes.length>0){

    myRecipes = jQuery.map(myRecipes,(element)=>{//Replace each doc by the corresponding list item html element
      return `<li class="recipe-item" data-id="${element.id}">
                <img src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=653&q=80" alt="">
                <div class="content">
                  <div class="titles">
                    <h4>${element.data.title} <span>${element.data.subtitle}</span></h4>
                  </div>
                  <div class="desc">
                    <ul>
                      <li id=time>
                        <img src="img/time-dark.svg" alt="">
                        <span>${element.data.preparationTime}</span>
                      </li>
                      <li id="difficulty">
                        <img src="img/difficulty-dark.svg" alt="">
                        <span>${element.data.difficulty}</span>
                      </li>
                      <li id="number-of-people">
                        <img src="img/nb-people-many-dark.svg" alt="">
                        <span>${element.data.nbPeople} Pers.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>`;
    });
    $(".my-panel .recipe-list").html(myRecipes.join("")); //Join array to append all list items at the same time (not using append to overwrite already existing items)
  }else{
    $(".my-panel .recipe-list").html("<p>Aucune recette trouvée.</p>");//Remove already existing items
  }

}
