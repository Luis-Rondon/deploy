/* eslint-disable import/extensions */
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios'
import ReactDOM from 'react-dom'
import {
  Route, Switch, BrowserRouter, Redirect,
} from 'react-router-dom';
import OneSignal from 'react-onesignal';
import { logOut } from './actions/LoginAction';
import Login from './views/Login.jsx';
import AddUser from './views/AddUser.jsx';
import PatientList from './views/PatientList.jsx';
import Backup from './views/Backup.jsx';
import UserList from './views/UserList.jsx';
import FormPatient from './views/FormPatient.jsx';
import FormPatientView from './views/FormPatientView.jsx';
// import Appointment from './views/Appointments.jsx';
import AppointmentHistory from './views/AppointmentHistory';
import DocumentPatient from './views/DocumentPatient';
import HistoryDatesFormat from './views/HistoryDatesFormat';
import Appointmentsv2 from './views/Appointmentsv2';
import Tests from './views/tests';
import { requestPermission } from './utils/requestPermission'

import UserData from './context/UserData';

import { newFirebase } from './firebase/firebase';
import { sendNotificationToAdmins, unSubscribeAllAdmins, subscribeAllAdmins, subscribeUser, unSubscribeUser, sendNotificationNewPatient  } from './firebase/oneSignal';
import { Toast, ToastBody, ToastHeader, Button } from "reactstrap"


const Logout = () => {
  localStorage.removeItem('unetepediatricatkn');
  logOut()
    .then(() => null)
    .catch(() => null);
  return <Redirect to="/login" />;
};

const Notfound = () => <h1>Ruta no encontrada 404</h1>;

const ToastPortal = ({ children }) => {
  // Find our portal container in the DOM
  const portalRoot = document.querySelector("body");

  /* 
     Create a div as a wrapper for our toast
     using the useMemo hook so that a new value isn't 
     computed on every render
  */
  const toastContainer = React.useMemo(() => document.createElement("div"), []);

  React.useEffect(() => {
  /* 
     Append our toast container to the portal root
  */
    portalRoot.appendChild(toastContainer);

  /* 
     Clean up the DOM by removing our toast container
     when the component is unmounted
  */
    return () => {
      toastContainer.remove();
    };
  });

  /* 
     Render any child elements to the portal root
  */
  return ReactDOM.createPortal(children, portalRoot);
}

const Routes = () => {

  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({title: 'a test title', body: 'a test body'});
  const [isTokenFound, setTokenFound] = useState(false);
  const { userData } = useContext(UserData)

  useEffect(() => {
    requestPermission(setTokenFound)
  }, [])
  
  useEffect(() => {
      (async () => {
        try {
          const payload  = await newFirebase.onMessageListener()
          setShow(true);
          setNotification({title: payload.notification.title, body: payload.notification.body})
          console.log("payload", payload);
        } catch (err) {
            console.log('failed: ', err)
        }
      })()
  }, [])

  /*
  useEffect(() => {
    OneSignal.init({
      appId: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
      autoResubscribe: true,
      allowLocalhostAsSecureOrigin: true,
      autoRegister: true,
      safari_web_id: process.env.REACT_APP_ONE_SIGNAL_SAFARI_API,
      persistNotification: true,
    });
  });
  */

  /*
  useEffect(() => {
    (async () => {
      await subscribeAllAdmins()
    })()
    return () => {
       unSubscribeAllAdmins()
    }
  }, [])
  */
  console.log("not", notification)
  return (
    <BrowserRouter>
              { show && (
           <ToastPortal>
           <div
             style={{
               position: "fixed",
               bottom: 14,
               left: 14,
               backgroundColor: "pink",
               borderRadius: 8,
               padding: 8
             }}
             onClick={() => setShow(false)}
           >
           <Toast isOpen = {show} transition = {{ in: show, timeout: 150}}>
               <ToastHeader>{notification.title}</ToastHeader>
               <ToastBody>{notification.body}</ToastBody>
            </Toast>   
           </div>
         </ToastPortal>
        ) }

      <div>
              {!isTokenFound && 
               "Need notification permission ❗️"
              }
      </div>
       <div>
        <Button onClick={() => sendNotificationNewPatient('Jose')}> 
          Send new patient
        </Button>
        <Button onClick={() => sendNotificationToAdmins(userData.id, 'Jose', 'date')}> 
          Send notification to admins
        </Button>
      </div> 
      <Switch>
        <Redirect exact from="/" to="/login" />
        <Route exact path="/usuarios" component={UserList} />
        <Route exact path="/usuarios/agregarusuario" component={AddUser} />
        <Route exact path="/pacientes" component={PatientList} />
        <Route
          exact
          path="/pacientes/formato/:action/:id"
          component={FormPatient}
        />
        <Route exact path="/pacientes/ver/:id" component={FormPatientView} />
        <Route
          exact
          path="/pacientes/citas/:id"
          component={AppointmentHistory}
        />
        <Route exact path="/pacientes/oficio/:id" component={DocumentPatient} />
        <Route
          exact
          path="/pacientes/formato-citas/:id"
          component={HistoryDatesFormat}
        />
        {/* <Route exact path="/citas" component={Appointment} /> */}
        <Route exact path="/citas/:id" component={Appointmentsv2} />
        <Route exact path="/descargas" component={Backup} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/logout" component={Logout} />
        <Route path="*" component={Notfound} />
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;
