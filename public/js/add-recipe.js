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

  //Remove all empty inputs
  removeEmptyInputs(".ingredient-input");
  removeEmptyInputs(".step-input");

  //Add inputs when all filled
  $(document).on("input",$(".ingredient-input"),()=>{
    if($(".ingredient-input").last().val()){
      //Append new input when previous one is filled
      $(".ingredient-input").last().after(`<input type="text" placeholder="Ingrédient ${$('.ingredient-input').length +1}" class="ingredient-input">`);
    }else{
      //Remove all empty inputs
      removeEmptyInputs(".ingredient-input");
    }
  });
  $(document).on("input",$(".step-input"),()=>{
    if($(".step-input").last().val()){
      //Append new input when previous one is filled
      $(".step-input").last().after(`<input type="text" placeholder="étape ${$('.step-input').length +1}" class="step-input">`);
    }else{
      //Remove all empty inputs
      removeEmptyInputs(".step-input");
    }
  });

  //FIREBASE
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  //FIRESTORE DATABASE
  const db = firebase.firestore();

  let recipesRef;
  let unsubscribe;

  auth.onAuthStateChanged(user=>{ //Show user logged in or ask him to log in
    if(user){//if signed in
      recipesRef = db.collection("recipes");
      //DEBUG
      $("#add-btn").click(()=>{

      });

      $("form").on("submit",(event)=>{
        event.preventDefault(); // cancel the default submit
        //console.log(getParams());

        var params = getParams();

        if(params){
          recipesRef.add({
            uid: user.uid,
            type: params.type,
            title: params.title,
            subtitle: params.subtitle,
            preparationTime: params.time,
            difficulty: params.difficulty,
            nbPeople: params.nbPeople,
            ingredients: params.ingredients,
            steps: params.steps,
            createdAt: firebase.firestore.Timestamp.now().toDate()
          });

          window.location.href = "index.html";//go back to the main page

        }


      });
    }else{
      window.location.href = "index.html";
    }
  });

});

function removeEmptyInputs (elementClass){
  for(i=1;i<$(elementClass).length -1;i++){
    if($(elementClass).eq(i).val() == ""){//If empty input between first and last
        $(elementClass).eq(i).remove();
    }
  }
  if($(elementClass).eq(0).val() == "" && $(elementClass).eq($(elementClass).length - 1).val() =="" //If empty and first one too
    && $(elementClass).length > 1){ //If not only one input
    $(elementClass).eq($(elementClass).length - 1).remove(); //Remove last input
  }
  updatedPlaceholders(elementClass);
}

function updatedPlaceholders(elementClass){
  for(j=0;j<$(elementClass).length;j++){
    if(elementClass == ".ingredient-input"){
      $(elementClass).eq(j).attr("placeholder","Ingrédient " + (j+1) );
    }else{
      $(elementClass).eq(j).attr("placeholder","Étape " + (j+1));
    }
  }
}

function getParams(){
  var params = {};

  if ($("#type-input").val() == "Entrée")   params.type = "entree";
  if ($("#type-input").val() == "Plat")   params.type = "plate";
  if ($("#type-input").val() == "Dessert")   params.type = "dessert";

  if ($("#title-input").val())   params.title = $("#title-input").val();
  if ($("#subtitle-input").val())   params.subtitle = $("#subtitle-input").val();
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
