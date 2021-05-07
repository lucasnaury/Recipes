$(document).ready(function () {
  //console.log(firebase);
  var returnedParams = window.location.hash.split("#");
  var params = {};

  for(i =1; i<returnedParams.length; i++){
    var key = returnedParams[i].split("=")[0];
    var value = returnedParams[i].split("=")[1].replaceAll("%20"," ");
    params[key] = value;
  }
  window.location.hash = ""; //Clear url
  //when you do the request, set the hash to the id to keep the recipe even when you refresh

  /*for (const param of Object.entries(params)) {
    console.log("Do a request by type with " +param[0] + " : " + param[1]);
  }*/
  if(params.id){
    window.location.hash = "id=" + params.id;
  }
  //FIREBASE
  //Authentication
  const auth = firebase.auth();

  //Firestore
  const db = firebase.firestore();

  let recipesRef;
  let unsubscribe;

  auth.onAuthStateChanged(user=>{
    if(user){
      //console.log(user.displayName);
      queryRecipe(params);
    }else{
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
          console.log("Error : " + error);
        });

    }
    else if(params.type){
      recipesRef.where("type","==", params.type).get()
        .then((querySnapshot)=>{
          processQuerySnapshot(querySnapshot);
        })
        .catch((error)=>{
          console.log("Error : " + error);
        });

    }
    else if(params.search){

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
    //Load the informations on the HTML page
    $(".header .titles h1").html(recipe.data.title);
    $(".header .titles h2").html(recipe.data.subtitle);
    $("#time span").html(recipe.data.preparationTime);
    $("#difficulty span").html(recipe.data.difficulty);
    $("#number-of-people span").html(recipe.data.nbPeople + " pers.");
    if(recipe.data.nbPeople == 1){
      $("#number-of-people img").attr("src","img/nb-people-one.svg");
    }
    var ingredients = recipe.data.ingredients.map((ingredient)=>{
      return `<li>${ingredient}</li>`;
    });
    $(".ingredients ul").html(ingredients.join(''));
    var steps = recipe.data.steps.map((step,index)=>{
      return `<li><h2 class="step-name">étape ${index +1}</h2><p class="step">${step}</p></li>`;
    });
    $(".preparation ul").html(steps.join(''));
  }
});








//http://127.0.0.1:3000/recipes.html#type=plate&id=39495
