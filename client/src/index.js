import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './Routes';
import * as serviceWorker from './serviceWorker';
import { UserDataProvider } from './context/UserData';
import './styles/custom.scss';
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'video-react/dist/video-react.css'; // import css
// '8133d126-5b52-4727-9682-32813190affb'

ReactDOM.render(
  <React.StrictMode>
    <UserDataProvider>
      <Routes />
    </UserDataProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register();
