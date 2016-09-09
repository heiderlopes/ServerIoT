var five = require("johnny-five");
var FCM = require('fcm-push');
var express = require('express');
var app = express();

var board = new five.Board();

var serverKey = '';
var fcm = new FCM(serverKey);

var notificou = false;

var temperatura = 0;

var led;

var piezo;

app.get('/temperatura', function(req, res) {
  res.send("{'text':'" + temperatura + "'}");
});


app.get('/led/ligar', function(req, res) {
  led.on();
  res.send("{'text':'led ligado seu lindo'}");
});

app.get('/led/desligar', function(req, res) {
  led.off();
  res.send("{'text':'led desligado seu lindo'}");
});

app.get('/alarme/disparar', function(req, res) {
  piezo.frequency(10000, 1000);
  res.send("{'text':'alarme ligado mestre'}");
});

app.get('/alarme/desativar', function(req, res) {
  piezo.off();
  res.send("{'text':'alarme desligado mestre'}");
});

board.on("ready", function() {

   led = new five.Led(8);

   piezo = new five.Piezo(6);

  var proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7
  });

  var temperature = new five.Thermometer({
    controller: "LM35",
    pin: "A0"
  });

  temperature.on("change", function() {
    //console.log(this.celsius + "°C", this.fahrenheit + "°F");
    temperatura = this.celsius;
  });

  proximity.on("data", function() {

    if(this.cm == 0) {
      console.log("Proximity: ");
      console.log("  cm  : ", this.cm);
      console.log("-----------------");

      if(notificou === false) {

        var message = {
          //to: '', // required
          //Emulador Genymotion Android
          //to: '',
          to: '',
          //collapse_key: 'your_collapse_key', 
          data: {
              your_custom_data_key: 'your_custom_data_value'
          },
          notification: {
              title: 'Invasao IoT',
              body: 'Sua casa ta sendo invadida!'
          }
        };

        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
                notificou = true;
            }
        });
      }
    }
  });

  proximity.on("change", function() {
    //console.log("The obstruction has moved.");
  });
});


var server = app.listen(3000);
console.log('Servidor conectado');