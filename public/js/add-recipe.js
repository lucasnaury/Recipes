$(document).ready(function () {
  var timePicker = new Picker(document.getElementById('time-input'),{
    format: 'H:mm',
    date: '1h00',
    headers: true,
    controls: false,
    inline: true,
    text: {
      title: 'Choisissez une durée',
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




  var picker2 = new Picker(document.getElementById('testing'),{
    format: 'H m',
    headers: true,
    controls: false,
    inline: true,
    text: {
      title: 'Pick a value',
    },
    values : ["test1","test2","test3"]
  });
});
