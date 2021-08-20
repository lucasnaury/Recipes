$(document).ready(function () {
  if(CSS.supports("overflow-y", "overlay") == false){
    //$(".main-container").css("--scrollbar-width","0px")//If not supported, hide the scrollbar
  }

  var animationDuration = 4000;
  //console.log(firebase);
  var returnedParams = window.location.hash.split("#");
  var params = {};
  let currentUser;
  let recipeID;


  for(i=1; i<returnedParams.length; i++){
    var key = returnedParams[i].split("=")[0];
    var value = returnedParams[i].split("=")[1].replaceAll("%20"," ");
    params[key] = value;
  }

  //BUTTONS
  //Top buttons
  $("#back-btn").on("vclick",()=>{
    if($("#more-actions-popup").hasClass("visible") == false){//If popup not visible
      window.location.href = "";//Go back to main page
    }
  });
  $("#more-actions-btn").on("vclick",()=>{
    $("#more-actions-popup").toggleClass("visible"); //Show popup
  });
  $(document).on("vclick",e=>{
    if(e.target.id != "more-actions-popup" && e.target.id !="more-actions-btn"//If you click outside
    && $("#more-actions-popup").hasClass("visible")){//But the popup is already shown
      e.preventDefault();
      $("#more-actions-popup").removeClass("visible");//Hide popup when clicking outside
    }
  });
  $("body").scroll(()=>{
    $("#more-actions-popup").removeClass("visible");//Hide popup when clicking outside
  })
  //Popup buttons
  $("#delete").on("vclick",()=>{
    deleteRecipe(db,currentUser.uid,recipeID);
    //Hide popup
    $("#more-actions-popup").removeClass("visible");
  });
  //PROBLEM : CHECK WHEN LOADING WETHER THE RECIPE IS IN FAVORITES OR NOT
  $("#more-actions-popup").on("vclick",$("#add-favorite"),e=>{
    if(e.target.id == "add-favorite"){
      addRecipeToFavorites(db,currentUser.uid,recipeID);
      //Hide popup
      $("#more-actions-popup").removeClass("visible");
    }
  });
  $("#more-actions-popup").on("vclick",$("#remove-favorite"),e=>{
    if(e.target.id == "remove-favorite"){
      removeRecipeFromFavorites(db,currentUser.uid,recipeID);
      //Hide popup
      $("#more-actions-popup").removeClass("visible");
    }
  });



  //FIREBASE
  //Authentication
  const auth = firebase.auth();

  $("#log-out").on("vclick",()=>{
    auth.signOut();
    $("#more-actions-popup").removeClass("visible");//Hide popup
    window.location.href = "";//Go back to main page
  });
  //Firestore
  const db = firebase.firestore();

  let recipesRef;

  auth.onAuthStateChanged(user=>{
    if(user){
      currentUser = user;
      //console.log(user.displayName);
      queryRecipe(params);
    }else{
      currentUser = null;
      console.log("Not logged in");
    }
  });

  function queryRecipe(params){
    recipesRef = db.collection("recipes");
    let query;

    if(params.id){
      recipesRef.doc(params.id).get()
        .then((result)=>{
          loadRecipe({
            id : result.id,
            data : result.data()
          });
        })
        .catch((error)=>{
          console.log("ID Request - Error : " + error);
          showError(error);
        });

    }
    else if(params.type){

      //Get random auto generated ID
      var randomFirestoreID = firebase.firestore().collection("tmp").doc().id;

      var queryRef = recipesRef.where("__name__", ">=", randomFirestoreID).orderBy("__name__", "asc").limit(1)

      queryRef.get()
        .then((querySnapshot)=>{
          if(querySnapshot.docs.length >= 1){//If there is a document
            loadRecipe({
              id: querySnapshot.docs[0].id,
              data: querySnapshot.docs[0].data()
            })
          }else{
            recipesRef.where("__name__", "<", randomFirestoreID).orderBy("__name__", "desc").limit(1)
                        .get()
                        .then((querySnapshot)=>{
                          if(querySnapshot.docs.length >= 1){//If there is a document
                            loadRecipe({
                              id: querySnapshot.docs[0].id,
                              data: querySnapshot.docs[0].data()
                            })
                          }else{
                            console.log("No recipe found.")
                          }
                        })
          }
        })
        .catch((error)=>{
          console.log("Type Request - Error : " + error);
          showError(error);
        });

    }
    else if(params.search){
      //Search not implemented yet since firestore doesn't allow full text search
    }
    else{
      //No data provided, so go back to main page
      window.location.href = "index.html";
    }
  }

  function processQuerySnapshot (querySnapshot){
    var docs = [];
    querySnapshot.forEach((doc) => {
      docs.push({
        id : doc.id,
        data : doc.data()
      });
    });
    var randomIndex = Math.floor(Math.random() * docs.length);
    loadRecipe(docs[randomIndex]);
  }

  function loadRecipe(recipe){
    //Set url hash to this recipe so that when you refresh you get the same recipe
    window.location.hash = "id=" + recipe.id;
    recipeID = recipe.id;
    //Load the informations on the HTML page
    //Titles
    $(".header .titles h1").html(recipe.data.title);
    if(recipe.data.subtitle)    $(".header .titles h2").html(recipe.data.subtitle);

    //Data
    $("#time span").html(recipe.data.preparationTime);
    $("#difficulty span").html(recipe.data.difficulty);
    $("#number-of-people span").html(recipe.data.nbPeople + " pers.");
    if(recipe.data.nbPeople == 1)    $("#number-of-people img").attr("src","img/nb-people-one.svg");

    //Background
    if(recipe.data.imgUrl){
      //Set header:after bg img by appending a style tag because you can't access :after with jquery
      $("head").append(`<style>.header:after { background-image: linear-gradient(rgba(0, 0, 0, 0.45),rgba(0, 0, 0, 0.75)), url('${recipe.data.imgUrl}') !important}`);
    }else{
      //https://images.unsplash.com/photo-1470290449668-02dd93d9420a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80
      $("head").append(`<style>.header:after { background-image: linear-gradient(rgb(0 0 0 / 0%),rgb(0 0 0 / 30%)), url(img/bg/default-recipe-bg.png) !important;}`);
    }

    //Ingredients and steps arrays
    var ingredients = recipe.data.ingredients.map((ingredient)=>{
      return `<li>${ingredient}</li>`;
    });
    $(".ingredients ul").html(ingredients.join(''));

    var steps = recipe.data.steps.map((step,index)=>{
      return `<li><h2 class="step-name">étape ${index +1}</h2><p class="step">${step}</p></li>`;
    });
    $(".preparation ul").html(steps.join(''));

  }

  function showError(error){
    $(".header").css("animation","none");
    $(".header .titles").css("animation","none");
    //Load the informations on the HTML page
    $(".header .titles h1").html("Erreur");
    $(".header .titles h2").html(error);
    $(".header ul").remove();
    $(".ingredients ul").html("<li></li>");
    $(".preparation ul").html("<li></li>");
  }
});




//MORE OPTIONS POPUP
function deleteRecipe(db,userID,recipeID){
  let recipesRef = db.collection("recipes");

  recipesRef.doc(recipeID).delete()//Remove from DB
    .then(()=>{
      console.log("Recipe removed from DB, id=" + recipeID);
      window.location.href = "";//Go back to main page
    })
    .catch(error=>{
      console.log("Recipe not removed from DB, id = " + recipeID);
      alert(error);
    });

  removeRecipeFromFavorites(db,userID,recipeID);
}
function addRecipeToFavorites(db,userID,recipeID){
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

    //Add to favorite database
    db.collection('users').doc(userID).get()
      .then(docSnapshot=> {
        console.log("Recipe added to favorites DB, ID=" + recipeID);
        //Add to the database
        usersRef.doc(userID).update({//Update the doc with the id=userID
          favorites: firebase.firestore.FieldValue.arrayUnion(recipeID)//Add the recipe ID to the "favorites" array field
        });
        //Change the popup button
        $("#more-actions-popup ul li:nth-child(2)").replaceWith('<li id="remove-favorite">Retirer des favoris</li>');


      })
      .catch(error=>{
        console.log("Couldn't add favorite - " + error);
        alert(error);
      });
}
function removeRecipeFromFavorites(db,userID,recipeID){
  let usersRef = db.collection("users");

  //Remove from favorite database
  usersRef.doc(userID).update({//Update the doc with the id=userID
      favorites: firebase.firestore.FieldValue.arrayRemove(recipeID)//Remove the recipe ID from the "favorites" array field.
  })
  .then(()=>{
    console.log("Recipe removed from favorites DB, ID=" + recipeID);
    //Change the popup button
    $("#more-actions-popup ul li:nth-child(2)").replaceWith('<li id="add-favorite">Ajouter aux favoris</li>');
  });

}



//http://127.0.0.1:3000/recipes.html#type=plate&id=39495
