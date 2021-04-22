$(document).ready(function () {
  $("#search").click(()=>{
    console.log("Search");
  });
  $("#list").click(()=>{
    window.location.href = window.location.href + "recipes.html";
    console.log("Liste");
  });
  $("#add").click(()=>{
    console.log("Add");
  });
});
