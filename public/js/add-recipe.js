$(document).ready(function () {
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
    rows: 1
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
  removeEmptyInputs($(".ingredient-input"));
  removeEmptyInputs($(".step-input"));

  $(document).on("input",$(".ingredient-input"),()=>{
    if($(".ingredient-input").last().val()){
      //Append new input when previous one is filled
      $(".ingredient-input").last().after(`<input type="text" placeholder="Ingrédient ${$('.ingredient-input').length +1}" class="ingredient-input">`);
    }else{
      //Remove all empty inputs
      removeEmptyInputs($(".ingredient-input"));
    }
  });
  $(document).on("input",$(".step-input"),()=>{
    if($(".step-input").last().val()){
      //Append new input when previous one is filled
      $(".step-input").last().after(`<input type="text" placeholder="étape ${$('.step-input').length +1}" class="step-input">`);
    }else{
      //Remove all empty inputs
      removeEmptyInputs($(".step-input"));
    }
  });

});

function removeEmptyInputs (elements){
  var length = elements.length;
  for(i=0;i<length - 1;i++){
    if(elements.eq(i).val() == ""){
      elements.eq(i).remove();
    }
  }
  for(i=0;i<elements.length;i++){
    console.log(elements.length);
    if(elements.attr("class") == "ingredient-input"){
      console.log("test");
      elements.eq(i).attr("placeholder","Ingrédient " + (i+1) );
    }else{
      elements.eq(i).attr("placeholder","étape " + (i + 1));
    }
  }
}
