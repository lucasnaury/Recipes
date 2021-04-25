$(document).ready(function () {
  var returnedParams = window.location.hash.split("#");
  var params = {};

  for(i =0; i<returnedParams.length; i++){
    //console.log(returnedParams[i]);
    var key = returnedParams[i].split("=")[0];
    var value = returnedParams[i].split("=")[1];
    params[key] = value;
  }

  if(params.type){
    console.log("Type : " + params.type);
  }
  if(params.id){
    console.log("ID : " + params.id);
  }
  window.location.hash = ""; //Clear url

  if(params.type){
    //Do request by type
    console.log("Do a request by type with type : "+params.type);
  }else if(params.id){
    //Do request by ID
    console.log("Do a request by id with id : "+params.id);
  }
});

//http://127.0.0.1:3000/recipes.html#type=plate&id=39495
