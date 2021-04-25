$(document).ready(function () {
  var returnedParams = window.location.hash.split("#");
  var params = {};

  for(i =1; i<returnedParams.length; i++){
    var key = returnedParams[i].split("=")[0];
    var value = returnedParams[i].split("=")[1].replaceAll("%20"," ");
    params[key] = value;
  }
  window.location.hash = ""; //Clear url

  for (const param of Object.entries(params)) {
    console.log("Do a request by type with " +param[0] + " : " + param[1]);
  }
  /*if(params.type){
    //Do request by type
    console.log("Do a request by type with type : "+params.type);
  }
  if(params.id){
    //Do request by ID
    console.log("Do a request by id with id : "+params.id);
  }*/
});

//http://127.0.0.1:3000/recipes.html#type=plate&id=39495
