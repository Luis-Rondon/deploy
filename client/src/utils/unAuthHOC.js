import React from 'react';
import { Redirect } from 'react-router-dom';
import authenticate from './authenticate';

export default (WrappedComponent) => {
  return (props) => {
    const { isAuthenticate } = authenticate();
    return !isAuthenticate ? (
      <WrappedComponent {...props} />
    ) : (
      <Redirect to="/pacientes" />
    );
  };
};
