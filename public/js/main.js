$(document).ready(function () {
  //console.log(firebase);
  //console.log(faker);
  //AUTHENTICATION
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
        //Hide and show elements
        hide($("#logout-btn"));
        hide($(".main-container"));
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
      /*$("#add-btn").click(()=>{
        var type = types[Math.floor(Math.random() * types.length)];
        recipesRef.add({
          uid: user.uid,
          type: type,
          title: faker.commerce.productName(),
          subtitle: "généré par faker",
          preparationTime: faker.random.number(),
          difficulty: "Facile",
          nbPeople: faker.random.number(),
          ingredients:[
            "150g de "+faker.commerce.productName(),
            "200mL de "+faker.commerce.productName(),
            "50g de "+faker.commerce.productName()
          ],
          steps: [
            "Mélanger 1 + 2",
            "Mélanger 2 + 4",
            "Mettre au four pendant "+ faker.random.number() + " minutes"
          ],
          createdAt: firebase.firestore.Timestamp.now().toDate()
        });
      });*/
      $("#add-btn").click(()=>{
        loadAddRecipePage();
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
  $(".recipe-item").click((event)=>{
    var id= event.currentTarget.dataset.id; //Get the data-id element in HTML
    loadRecipePage(null,null,id);
  });
  //Add recipe btn

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
  container.addClass("hide");
  container.removeClass("show");
  var transitionDuration = 700;
  setTimeout(()=>{
    container.css("display","none");
  },transitionDuration);
}


function loadAddRecipePage(){
  //Hide active menu
  hide($(".show"));
  $(".header").css("animation","hideBgEnd 1.5s ease-in-out forwards");
  //Load page after animations
  setTimeout(()=>{
    window.location.href = "add-recipe.html";
  },1500);
}

function loadRecipePage(type,searchValue,id){
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
