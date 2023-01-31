const admin = require("firebase-admin");
const fcm = require('@diavrank/fcm-notification')
const serviceAccount = require("./unete-pediatrica-app-test-firebase-adminsdk-5z4ni-66cfd7dd6c.json");
const FCM = new fcm(serviceAccount)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://unete-pediatrica-app-test.firebaseio.com"
});

class Firebase {
  send(token, message, multi = false) {
    if (multi) {
      FCM.sendMultiCast(message, function(err, response) {
          if(err){
              console.log('error found', err);
          }else {
              console.log('response here', response);
          }
      })      
    } else {
      FCM.send(message, function(err, response) {
          if(err){
              console.log('error found', err);
          }else {
              console.log('response here', response);
          }
      }) 
    }
    
  }

  subscribe = (token, topic) => {
    FCM.subscribeToTopic(token, topic,     
     function(err, response) {
       if(err){
        console.log('error found', err);
       }else {
        console.log('response here', response);
       }
    })
  }

  unsubscribe = (token, topic) => {

    FCM.unsubscribeFromTopic(token, topic, 
      function(err, response) {
      if(err){
        console.log('error found', err);
      }else {
        console.log('response here', response);
      }
    })
    
  }
  
}

module.exports = {
  firebase: new Firebase(),
  serviceAccount
}