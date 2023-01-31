/* eslint-disable camelcase */
import { newFirebase } from '../firebase/firebase';

export const login = (inputs) => {
  return new Promise((resolve, reject) => {
    const encrypted = btoa(inputs.password);
    newFirebase.auth
      .signInWithEmailAndPassword(inputs.email, encrypted)
      .then((auth) => {
        newFirebase.db
          .collection('Users')
          .doc(auth.user.uid)
          .get()
          .then((doc) => {
            if (!doc.data()) {
              reject({
                message: 'Tu cuenta ha sido eliminada por el administrador',
              });
            }
            const { is_active, email, password } = doc.data();
            if (is_active) {
              resolve({
                is_active: true,
                id: auth.user.uid,
                email,
                password,
              });
            } else {
              reject({
                message: 'Tu cuenta ha sido eliminada por el administrador',
              });
            }
          })
          .catch((error) => {
            reject({ message: error.message });
          });
      })
      .catch(() => {
        reject({ message: 'No tienes una cuenta para acceder' });
      });
  });
};

export const logOut = () => {
  return new Promise((resolve, reject) => {
    newFirebase.auth
      .signOut()
      .then(() => {
        resolve({
          message: 'Sesión terminada',
        });
      })
      .catch(() => {
        reject({
          message: 'No se pudo cerrar sesión',
        });
      });
  });
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    newFirebase.auth.onAuthStateChanged((user) => {
      if (user) {
        resolve({
          id: user.uid,
        });
      } else {
        reject({
          message: 'No se pudo obtener la información del usuario',
        });
      }
    });
  });
};
