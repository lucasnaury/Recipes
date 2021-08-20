$(document).ready(function () {
  //PICKERS
  var typePicker = new Picker(document.getElementById('type-input'),{
    format: 'MMMM',
    date: '0',
    headers: false,
    controls: false,
    text: {
      title: 'Difficulté',
      cancel: 'Annuler',
      confirm: 'OK',
      month: 'Diff.',
    },
    months:['a', 'b', 'c', 'Dessert', 'd', 'e', 'f', 'Entrée', 'g', 'h', 'i', 'Plat'],
    increment: {
      month: 4,
    },
    rows: 3
  });
  var timePicker = new Picker(document.getElementById('time-input'),{
    format: 'Hhmm',
    date: '0h30',
    headers: true,
    controls: false,
    text: {
      title: 'Temps total',
      cancel: 'Annuler',
      confirm: 'OK',
      hour: 'Heure',
      minute: 'Minute',
    },
    increment: {
      hour: 1,
      minute: 5
    }
  });
  var difficultyPicker = new Picker(document.getElementById('difficulty-input'),{
    format: 'MMMM',
    date: '0',
    headers: false,
    controls: false,
    text: {
      title: 'Difficulté',
      cancel: 'Annuler',
      confirm: 'OK',
      month: 'Diff.',
    },
    months:['a', 'b', 'c', 'Difficile', 'd', 'e', 'f', 'Facile', 'g', 'h', 'i', 'Moyen'],
    increment: {
      month: 4,
    },
    rows: 3
  });
  var nbPeoplePicker = new Picker(document.getElementById('nbPeople-input'),{
    format: 'S',
    date: '4',
    headers: true,
    controls: false,
    text: {
      title: 'Nombre de personnes',
      cancel: 'Annuler',
      confirm: 'OK',
      millisecond: 'Pers.',
    },
    increment: {
      millisecond: 1,
    },
    rows: 3
  });

  //Update parameters value on change
  $("#time-input").change(()=>{
    var value = "";
    if($("#time-input").val().split("h")[0] != 0){
      value = $("#time-input").val();
    }else{
      value = $("#time-input").val().split("h")[1] +" min";
    }
    $("#time-input").siblings().html(value);
  });
  $("#difficulty-input").change(()=>{
    $("#difficulty-input").siblings().html($("#difficulty-input").val());
  });
  $("#nbPeople-input").change(()=>{
    $("#nbPeople-input").siblings().html($("#nbPeople-input").val() + " Pers.");
  });


  //Add inputs when all filled
  $(document).on("input",$(".ingredient-input"),e=>{
    if($(e.target).attr("class") == "ingredient-input"){//If it's a ingredient-input
      if($(e.target).val()){
        appendInputAtBottom(".ingredient-input")//If not empty, add one at the bottom
      } else {
        $(e.target).remove();//If becomes empty, remove it
      }
      //Update placeholders to show the right index
      updatePlaceholders(".ingredient-input");
    }
  });
  $(document).on("input",$(".step-input"),e=>{
    if($(e.target).attr("class") == "step-input"){//If it's a step-input
      if($(e.target).val()){
        appendInputAtBottom(".step-input")//If not empty, add one at the bottom
      } else {
        $(e.target).remove();//If becomes empty, remove it
      }
      //Update placeholders to show the right index
      updatePlaceholders(".step-input");
    }
  });

  $("#recipe-img-input").on('change', event=>{
		var fileName = event.target.value.split("\\").pop(); //Here, \\ = \

		if( fileName ){
      $(".img-infos span").html(fileName);
      $("#choose-image-btn").html("Remplacer")
    }else{
      $(".img-infos span").html("Aucune image sélectionnée");
      $("#choose-image-btn").html("Ajouter")
    }
	});

  //FIREBASE
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  //FIREBASE STORAGE
  var storageRef = firebase.storage().ref();
  var imagesRef = storageRef.child('recipe-imgs/');


  //FIRESTORE DATABASE
  const db = firebase.firestore();

  let recipesRef;
  let unsubscribe;

  auth.onAuthStateChanged(user=>{ //Show user logged in or ask him to log in
    if(user){//if signed in
      recipesRef = db.collection("recipes");

      //ADD 10 RECIPES FOR TESTING
      /* for(i=0; i<10;i++){
        var paramsTest = {
          title: "Recipe n°" + i,
          type: "plate",
          time: "45 min",
          difficulty: "Moyen",
          nbPeople: 6,
          ingredients: ["Ingrédient A","Ingrédient B","Ingrédient C","Ingrédient D","Ingrédient E","Ingrédient F","Ingrédient G","Ingrédient H","Ingrédient I"],
          steps: ["Ajouter ingrédient A","Ajouter ingrédient B","Ajouter ingrédient C","Ajouter ingrédient D","Ajouter ingrédient E","Ajouter ingrédient F","Ajouter ingrédient G","Ajouter ingrédient H","Ajouter ingrédient I"],
        }
        console.log("Added recipe " + i);
        addRecipeToFirestore(recipesRef,user,paramsTest);
      }*/


      $("form").on("submit",(event)=>{
        event.preventDefault(); // cancel the default submit

        var params = getParams();

        //Get random auto generated ID
        var randomFirestoreID = firebase.firestore().collection("tmp").doc().id;

        if(params){
          if(params.imgFile){
            var imageRef = firebase.storage().ref('recipe-imgs/' + randomFirestoreID);

            imageRef.put(params.imgFile)//Push the img to the storage under the recipe-imgs folder
              .then(snapshot=>{//On success
                snapshot.ref.getDownloadURL().then(downloadURL => {//Get the url of the img
                  params.imgUrl = downloadURL;
                  addRecipeToFirestore(recipesRef, user, params);//Upload recipe to firestore with img
                });
              })
              .catch(error=>{
                alert("Error during image upload - " + error);
              });
          }else{
            addRecipeToFirestore(recipesRef, user, params);//Upload recipe to firestore without img
          }

        }


      });
    }else{
      window.location.href = "index.html";
    }
  });

});

function getNbEmptyInputs(elementClass){
  var count = 0;
  for(i=0; i<$(elementClass).length; i++){
    if($(elementClass).eq(i).val() == false) count++;
  }

  return count
}
function appendInputAtBottom(elementClass){
  if(getNbEmptyInputs(elementClass) == 0){//If no empty inputs
    $(elementClass).last().after(`<input type="text" placeholder="étape ${$(elementClass).length +1}" class="${elementClass.split(".")[1]}" autocomplete="off">`);
  }
}

function updatePlaceholders(elementClass){
  for(j=0; j<$(elementClass).length; j++){
    $(elementClass).removeAttr("id").removeAttr("required");//By default, input not required

    if(elementClass == ".ingredient-input"){
      $(elementClass).eq(j).attr("placeholder","Ingrédient " + (j+1) );
    }else{//.step-input
      $(elementClass).eq(j).attr("placeholder","Étape " + (j+1));
    }
  }
  //User must at least put the 1st element
  $(elementClass).eq(0).attr('id', 'first-step-input').attr('required','true');//First element required
}

  function getParams(){
    var params = {};

    if ($("#type-input").val() == "Entrée")   params.type = "entree";
    if ($("#type-input").val() == "Plat")   params.type = "plate";
    if ($("#type-input").val() == "Dessert")   params.type = "dessert";

    if ($("#title-input").val())   params.title = $("#title-input").val() + ""; //Convert to string
    if ($("#subtitle-input").val())   params.subtitle = $("#subtitle-input").val() + ""; //Convert to string

    if($("#recipe-img-input").prop('files').length >0){
      params.imgFile = $("#recipe-img-input").prop('files')[0];
      //console.log(params.imgFile);
    }


    if ($("#time-input ~ span").html())   params.time = $("#time-input ~ span").html();
    if ($("#difficulty-input ~ span").html())   params.difficulty = $("#difficulty-input ~ span").html();
    if (parseInt($("#nbPeople-input ~ span").html().split(" ")[0]))   params.nbPeople = parseInt($("#nbPeople-input ~ span").html().split(" ")[0]);

    if($(".ingredient-input")){
      params.ingredients = [];
      //Get all input values
      for(i=0; i<$(".ingredient-input").length; i++){
        if($(".ingredient-input").eq(i).val()){ //If input not empty
          params.ingredients.push($(".ingredient-input").eq(i).val());
        }
      }
    }
    if($(".step-input")){
      params.steps = [];
      //Get all input values
      for(i=0; i<$(".step-input").length; i++){
        if($(".step-input").eq(i).val()){ //If input not empty
          params.steps.push($(".step-input").eq(i).val());
        }

      }
    }

    return params;

  }



  function addRecipeToFirestore(recipesRef, user, params){

    //Required values
    var recipe = {
      uid: user.uid,
      title: params.title,
      type: params.type,
      preparationTime: params.time,
      difficulty: params.difficulty,
      nbPeople: params.nbPeople,
      ingredients: params.ingredients,
      steps: params.steps,
      createdAt: firebase.firestore.Timestamp.now().toDate()
    }
    //Optional values
    if(params.subtitle) recipe.subtitle = params.subtitle;
    if(params.imgUrl) recipe.imgUrl = params.imgUrl;



    recipesRef.add(recipe)
    .then(()=>{
     //alert("Successfully added")
      window.location.href = "index.html";//go back to the main page if success
    })
    .catch(error=>{
      alert("Error while adding recipe to DB : " + error);
    });
  }
