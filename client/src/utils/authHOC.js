import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import authenticate from './authenticate';
import UserData from '../context/UserData';
import LoadingSpinner from '../common/LoadingSpinner';
import { getPlayerId } from '../firebase/oneSignal';
import { uploadOneSignalIdToUser, verifyOneSignalIdByUserKey } from '../actions/UserAction';

export default (WrappedComponent, permision = []) => {
  return (props) => {
    const { isAuthenticate } = authenticate();

    if (isAuthenticate) {
      const { userData } = useContext(UserData);
      let role;
      if (userData?.oneSignalKeys) {
        console.log(Object.values(userData?.oneSignalKeys).map((el) => el.key));
      }
      if (userData) {
        role = userData.role;
        getPlayerId()
          .then((data) => {
            const player = data;
            console.log({ player });
            if (player) {
              verifyOneSignalIdByUserKey(userData.id, player)
                .then((data) => {
                  if (data === true) return;
                  uploadOneSignalIdToUser(userData.id, player)
                    .then((data) => console.log(data.message))
                    .catch((err) => console.log(err.message));
                })
                .catch((err) => {
                  uploadOneSignalIdToUser(userData.id, player)
                    .then((data) => console.log(data.message))
                    .catch((err) => console.log(err.message));
                  console.log(err);
                });
            }
          })
          .catch((err) => console.log(err));
      }
      if (!role) return <LoadingSpinner />;
      return permision.includes(role) ? (
        <WrappedComponent {...props} />
      ) : (
        <Redirect to="/pacientes" />
      );
    }
    return <Redirect to="/login" />;
  };
};
