var express = require('express');
const cors = require('cors')
var app = express();
const {firebase, serviceAccount} = require('./firebase')
const morgan = require('morgan')
const FCMReminder = require("fcm-reminder");

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', function(req, res){
    res.send('Hello World');
});

app.post('/notifications', (req, res) => {
  const {token, message, multi } = req.body
  firebase.send(token, message, multi)
  res.status(200).send({ result: 'success' })
})

app.post('/sendReminder', (req, res) => {
  const { timestamp, token, message } = req.body
  const databaseURL = "https://unete-pediatrica-app-test.firebaseio.com"
  FCMReminder.FCMReminder(
    serviceAccount,
    databaseURL,
    token,
    timestamp,
    message
  );

  res.status(200).send({ result: 'success' })
})

app.post('/subscribe', (req, res) => {
  const { topic, token } = req.body;
  firebase.subscribe(token, topic)
  res.status(200).send({ result: 'success' })
})

app.post('/unsubscribe', (req, res) => {
  const { topic, token } = req.body
    firebase.unsubscribe(token, topic)
   res.status(200).send({ result: 'success' })
})

app.listen(5000);
