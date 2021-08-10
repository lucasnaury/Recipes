$(document).ready(function () {
  //console.log(firebase);

  //FIREBASE AUTHENTICATION
  const auth = firebase.auth();
  let currentUser;
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

  $("#list").click(()=>{ //Show recipe list
    //Reset first tab opened to left tab :
    $(".top").removeClass("active");
    $(".panels").removeClass("active");

    //Query my recipes from databse to HTML
    queryMyRecipes(db,currentUser.uid);
    queryFavoriteRecipes(db,currentUser.uid);
  });
  $("#delete").click(()=>{
    deleteRecipes(db,$(".recipe-item.selected"));

    hideActionsPopup();
    selectingRecipes = false;
  });
  $(".more-actions-popup").on("click", "#add-favorites", ()=>{//using "on" event to handle click on appended elements
    addRecipesToFavorites(db,currentUser.uid,$(".recipe-item.selected"));

    hideActionsPopup();
    selectingRecipes = false;
  });
  $(".more-actions-popup").on("click", "#remove-favorites", ()=>{
    removeRecipesFromFavorites(db,currentUser.uid,$(".recipe-item.selected"));

    hideActionsPopup();
    selectingRecipes = false;
  });
  $("#add-btn").click(()=>{
    loadAddRecipePage();
  });

  //MORE OPTIONS POPUP
  $("#more-actions-btn").click(()=>{
    $(".more-actions-popup").toggleClass("visible");
  });

  auth.onAuthStateChanged(user=>{
    if(user){//if signed in
      currentUser = user;

      $("#log-out").click(()=>{
        auth.signOut();

        hideActionsPopup();
        selectingRecipes = false;
      });
    }else{
      currentUser = null;
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
    //Switch to left tab
    $(".top").removeClass("active");
    $(".panels").removeClass("active");

    selectingRecipes = false;//Stop selecting recipes
    hideActionsPopup();
    $(".more-actions-popup ul li:nth-child(2)").replaceWith('<li id="add-favorites">Ajouter aux favoris</li>');
  });
  $("#favorites-btn").click(()=>{
    //Switch to right tab
    $(".top").addClass("active");
    $(".panels").addClass("active");

    selectingRecipes = false;//Stop selecting recipes
    hideActionsPopup();
    $(".more-actions-popup ul li:nth-child(2)").replaceWith('<li id="remove-favorites">Retirer des favoris</li>');
  });
  $("#list-back-btn").click(()=>{
    //Hide list
    hide($(".main-container-list"));
    //Show main btns
    showMainBtns();
  });

  //Trigger on list element hold
  var held = false;
  var selectingRecipes = false;

  //List items
  $.event.special.tap.tapholdThreshold = 300;
  $('.recipe-list').on('taphold','.recipe-item',event=>{//taphold from jquery mobile
    if(selectingRecipes == false){
      held = true;
      selectingRecipes = true;//Allow the selection

      $('.checkbox').addClass("visible");
      $("#more-actions-btn").addClass("visible");

      //Add first item to the selection
      //console.log("Add to selection first");
      addRecipeToSelection($(event.currentTarget));
    }

  });
  $('.recipe-list').on('vmouseup', '.recipe-item', event=>{//"Click" event, refers to mouseup and touchend
    if(selectingRecipes && !held){//If selecting (and prevent from happening at the same time as taphold)
      if($(event.currentTarget).hasClass("selected")){
        //If already selected, deselect it
        removeRecipeFromSelection($(event.currentTarget));

        //Stop selecting if no element selected
        if($(".recipe-item.selected").length == 0){
          selectingRecipes = false;
          $('.checkbox').removeClass("visible");
          $('#more-actions-btn').removeClass("visible");
        }
      }else{
        //If not selected, select it
        //console.log("Add to selection");
        addRecipeToSelection($(event.currentTarget));
      }
    }else if(!selectingRecipes && !held){//If not selecting (and not tapheld), load recipe
      console.log("Load recipe clicked");
      var id = event.currentTarget.dataset.id; //Get the data-id element in HTML
      ////COMMENTED FOR DEBUG
      loadRecipePage(null,null,id);
    }
    held = false;//Reset
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



//QUERY MY RECIPES
function queryMyRecipes(db, userID){
  var appendParent = $(".my-panel .recipe-list");
  appendParent.html("<p>Aucune recette trouvée.</p>");//Remove already existing items
  //console.log("My Recipes Reset");

  let recipesRef = db.collection("recipes");

  recipesRef.where("uid","==", userID).get()
    .then((querySnapshot)=>{
      processQuerySnapshot(querySnapshot, appendParent);
    })
    .catch((error)=>{
      console.log("Type Request - Error : " + error);
      appendParent.html("<p>Aucune recette trouvée.</p>");//Remove already existing items
    });

}
function queryFavoriteRecipes(db, userID){
  var appendParent = $(".favorites-panel .recipe-list");
  appendParent.html("<p>Aucune recette trouvée.</p>");//Remove already existing items by default
  //console.log("Favorite Reset");

  let usersRef = db.collection("users");
  let recipesRef = db.collection("recipes");

  var recipes = [];
  //Search what recipe ID are in the favorites of the user and query them
  usersRef.doc(userID).get()//Get the user doc
    .then(userDoc=>{

      var recipeIds = userDoc.data().favorites.map(element=>{
        return element +"";//convert to string
      })
      //console.log(recipeIds);

      //recipesRef.doc(recipeID).get() returns a Promise
      var recipesDocs = recipeIds.map(recipeID=>{
        return recipesRef.doc(recipeID).get();
      });

      Promise.all(recipesDocs)//Waiting for every promise in the array to resolve
        .then(docs=>{
          recipes = docs.map(doc=>{
            return {
              id: doc.id,
              data: doc.data()
            };
          });

          //Append all elements
          appendRecipes(recipes,appendParent);
        });
    })
    .catch((error)=>{
      console.log("User/Recipe not in DB - " + error);
      appendParent.html("<p>Aucune recette trouvée.</p>");//Remove already existing items
    });
}

function processQuerySnapshot (querySnapshot,appendParent){
  var docs = [];
  querySnapshot.forEach((doc) => {
    docs.push({
      id : doc.id,//Recipe unique ID
      data : doc.data()//Recipe data
    });
  });

  appendRecipes(docs,appendParent);
}

function appendRecipes(recipes,appendParent){
  if(recipes.length>0){
    //console.log("append recipes");

    recipes = jQuery.map(recipes,(element)=>{//Replace each doc by the corresponding list item html element
      return `<li class="recipe-item" data-id="${element.id}">
                <img class="recipeImg" src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=653&q=80" alt="">
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
                <img class="checkbox" src="img/checkbox-inside.svg" alt="">
              </li>`;
    });
    appendParent.html(recipes.join("")); //Join array to append all list items at the same time (not using append to overwrite already existing items)
  }else{
    appendParent.html("<p>Aucune recette trouvée.</p>"); //Remove already existing items
  }

}

//Recipe selection
function addRecipeToSelection(recipe){
  recipe.addClass("selected");
}
function removeRecipeFromSelection(recipe){
  recipe.removeClass("selected");
}

//MORE OPTIONS POPUP
function deleteRecipes(db,recipes){
  let recipesRef = db.collection("recipes");
  let query;

  recipes.each((i,recipe)=>{
    //Remove from recipe database
    var recipeId = $(recipe).data("id");

    recipesRef.doc(recipeId).remove();//Remove from DB

    //Remove actual HTML element
    console.log("Remove, id=" + recipeId);
    $(recipe).css("animation","buttonPopOut 600ms ease-in-out forwards");

    $(recipe).fadeOut(600,function(){//call the function at the end of the fadeout
        $(recipe).css({"visibility":"hidden",display:'block'}).slideUp(600);//Hide element and slide others up for 600ms
    });
    setTimeout(()=>{
      if($(".favorites-panel .recipe-list .recipe-item").length == 1){//If it was the last element
        $(".favorites-panel .recipe-list").append("<p>Aucune recette trouvée.</p>");//Append it
        $(".favorites-panel .recipe-list>p").css("animation-delay","0s");//remove anim delay
      }
      //Remove the HTML element
      $(recipe).remove();
    },600+600);
  });
}
function addRecipesToFavorites(db,userID,recipes){//PROBLEM : Make sure it's not already in the favorites before appending it to the tab
  let usersRef = db.collection("users");

  db.collection('users').doc(userID).get()
    .then((docSnapshot) => {
      if(docSnapshot.exists == false){//If not already existing, create the document
        //console.log("Document doesn't exist yet, creating it.");
        usersRef.doc(userID).set({
          favorites: [] //Create doc
        });
      }
    })

  recipes.each((i,recipe)=>{
    var recipeId = $(recipe).data("id");

    //Add to favorite database
    db.collection('users').doc(userID).get()
      .then((docSnapshot) => {
        //Add to the database
        usersRef.doc(userID).update({//Update the doc with the id=userID
          favorites: firebase.firestore.FieldValue.arrayUnion(recipeId)//Add the recipe ID to the "favorites" array field
        });


        //Add to the favorites panel list if success
        $(".favorites-panel .recipe-list").children("p").remove();//Remove empty list paragraph

        var favoritesIDs = $.map( $(".favorites-panel .recipe-item"),item=>{
          return $(item).data("id"); //Get all IDs in favorites list
        });

        if( $.inArray($(recipe).data("id"), favoritesIDs) == -1 ){//If ID not already in favorites list, append it
          console.log("Add to favorites, id=" + recipeId);

          var recipeClone = $(recipe).clone().removeClass("selected").removeClass("visible");
          recipeClone.appendTo($(".favorites-panel .recipe-list"));
        }

      })
      .catch(error=>{
        console.log("Couldn't add favorite - " + error);
      });
  });
}
function removeRecipesFromFavorites(db,userID,recipes){
  let usersRef = db.collection("users");

  recipes.each((i,recipe)=>{
    var recipeId = $(recipe).data("id");
    console.log("Remove from favorites, id=" + recipeId);

    //Remove from favorite database
    usersRef.doc(userID).update({//Update the doc with the id=userID
        favorites: firebase.firestore.FieldValue.arrayRemove(recipeId)//Remove the recipe ID from the "favorites" array field.
    })
    .then(()=>{
      //Remove from HTML if success
      $(recipe).css("animation","buttonPopOut 600ms ease-in-out forwards");
      //animate orecipe and others to slideup when deleted
      $(recipe).fadeOut(600,function(){//call the function at the end of the fadeout
          $(recipe).css({"visibility":"hidden",display:'block'}).slideUp(600);//Hide element and slide others up for 600ms
      });
      setTimeout(()=>{
        if($(".favorites-panel .recipe-list .recipe-item").length == 1){//If it was the last element
          $(".favorites-panel .recipe-list").append("<p>Aucune recette trouvée.</p>");//Append it
          $(".favorites-panel .recipe-list>p").css("animation-delay","0s");//remove anim delay
        }
        //Remove the HTML element
        $(recipe).remove();
      },600+600);
    });


  });
}





function hideActionsPopup(){
  $(".more-actions-popup").removeClass("visible");//Hide popup
  $(".checkbox").removeClass("visible");//Hide checkboxes
  $("#more-actions-btn").removeClass("visible");//Hide more actions btn
  $(".recipe-item.selected").removeClass("selected");//Deselect items
}
