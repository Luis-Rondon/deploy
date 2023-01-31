import React from 'react';

const Firebasecontext = React.createContext();

export default Firebasecontext;

export const consumerFirebase = (Component) => (props) => (
  <Firebasecontext.Consumer>
    {(firebase) => <Component {...props} firebase={firebase} />}
  </Firebasecontext.Consumer>
);
