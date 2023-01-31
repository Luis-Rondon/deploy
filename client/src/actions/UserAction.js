import { v4 as uuidv4 } from 'uuid';
import { logOut } from './LoginAction';
import { newFirebase } from '../firebase/firebase';
import { getCurrentDate } from '../utils/formulas';

export const createUser = (userData) => {
  delete userData.confirm_password;
  const encrypted = btoa(userData.password);
  userData.password = encrypted;
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
      .then((querySnapshot) => {
        const lastItem = querySnapshot.docs.map((item) => item.data());
        let newNumber = 1;
        if (lastItem.length !== 0) newNumber = parseInt(lastItem[0].number) + 1;
        newFirebase.auth
          .createUserWithEmailAndPassword(userData.email, userData.password)
          .then((auth) => {
            newFirebase.db
              .collection('Users')
              .doc(auth.user.uid)
              .set(
                {
                  id: auth.user.uid,
                  number: newNumber,
                  is_active: true,
                  timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
                  ...userData,
                },
                {
                  merge: true,
                },
              )
              .then(() => logOut())
              .then(() => resolve({ message: 'Usuario creado con éxito' }))
              .catch(() => {
                reject({
                  message: 'Por el momento no fue posible añadir el usuario',
                });
              });
          })
          .catch(() => {
            reject({
              message:
                'El correo ingresado fue usado para crear una cuenta pero fue eliminado.',
            });
          });
      })
      .catch(() => {
        reject({ message: 'Ha ocurrido un error desconocido' });
      });
  });
};

export const getUsers = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .where('is_active', '==', true)
      .get()
      .then((querySnapshot) => {
        resolve({
          status: true,
          data: querySnapshot.docs.map((item) => {
            return { id: item.id, ...item.data() };
          }),
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de los usuarios.',
        });
      });
  });
};

export const getAdmins = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .where('role', '==', 'Administrador')
      .get()
      .then((querySnapshot) => {
        resolve({
          status: true,
          data: querySnapshot.docs.map((item) => {
            return { id: item.id, ...item.data() };
          }),
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de los administradores.',
        });
      });
  });
};

export const getUsersByUsernameOptionsSearch = (username) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .where('username', '<', username.toLowerCase())
      .orderBy('username')
      .get()
      .then((querySnapshot) => {
        const result = [];
        querySnapshot.docs.forEach((item) => {
          if (item.data().is_active) result.push({ value: item.id, name: item.data().username });
        });
        result.push({ value: ' ', name: '- No aplicar -' });
        resolve(result);
      })
      .catch(() => {
        reject({ value: '', name: 'Por el momento no se pueden obtener' });
      });
  });
};

export const getAllUsersOptionsSearch = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .orderBy('username')
      .get()
      .then((querySnapshot) => {
        const result = [];
        querySnapshot.docs.forEach((item) => {
          if (item.data().is_active) {
            result.push({
              value: item.id,
              name: item.data().username,
              role: item.data().role,
            });
          }
        });
        resolve(result);
      })
      .catch(() => {
        reject({ value: '', name: 'Por el momento no se pueden obtener' });
      });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .doc(id)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: { id: querySnapshot.id, ...querySnapshot.data() },
        });
      })
      .catch(() => {
        reject({ message: 'No se ha podido obtener los datos del usuario' });
      });
  });
};

export const updateUserById = (id, data) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .doc(id)
      .set(data, { merge: true })
      .then(() => {
        resolve({
          message: 'Usuario actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el usuario',
        });
      });
  });
};

export const getUserByEmail = (email) => {
  email.trim();
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .where('email', '==', email)
      .get()
      .then((querySnapshot) => {
        resolve({
          status: true,
          data: querySnapshot.docs.map((item) => {
            return { id: item.id, ...item.data() };
          }),
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no fue posible obtener los datos del usuario',
        });
      });
  });
};

export const deleteUserAuthById = (id) => {
  return new Promise((resolve, reject) => {
    updateUserById(id, { is_active: false })
      .then(() => resolve({ message: 'Usuario eliminado con éxito' }))
      .catch(() => reject({
        message: 'No fue posible eliminar el usuario, intenta más tarde',
      }));
  });
};

export const updateUserRole = (id, role) => {
  return new Promise((resolve, reject) => {
    updateUserById(id, { role })
      .then(() => resolve({ message: 'Usuario eliminado con éxito' }))
      .catch(() => reject({
        message: 'No fue posible eliminar el usuario, intenta más tarde',
      }));
  });
};

export const uploadProfilePicUser = (profilePic) => {
  return new Promise((resolve, reject) => {
    const newName = Math.floor(Math.random() * (50 - 0)) + 0 + profilePic.name;
    const storageRef = newFirebase.storage.ref(`/profile_pictures/${newName}`);
    const uploadTask = storageRef.put(profilePic);
    // eslint-disable-next-line no-unused-vars
    uploadTask.on(
      'state_changed',
      () => {},
      () => {
        reject({ message: 'Ha ocurrido un error al guardar la imagen' });
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          resolve({
            imageName: newName,
            downloadURL,
            message: 'Imagen actualizada con éxito',
          });
        });
      },
    );
  });
};

export const deleteProfilePicUserByName = (imageName) => {
  return new Promise((resolve, reject) => {
    const storageRef = newFirebase.storage.ref();
    const desertRef = storageRef.child(`profile_pictures/${imageName}`);
    desertRef
      .delete()
      .then(() => {
        resolve({ message: 'Archivo borrado exitosamente' });
      })
      .catch(() => {
        reject({ message: 'Error al borrar el archivo' });
      });
  });
};

export const verifyOneSignalIdByUserKey = (idUser, oneSignalKey) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Users')
      .doc(idUser)
      .get()
      .then((querySnapshot) => {
        let exist = false;
        if (querySnapshot.data().oneSignalKeys) {
          Object.keys(querySnapshot.data().oneSignalKeys).forEach(
            (idRegister) => {
              if (
                querySnapshot.data().oneSignalKeys[idRegister].key
                === oneSignalKey
              ) exist = true;
            },
          );
        }
        resolve(exist);
      })
      .catch(() => {
        reject({ message: 'Error al verificar el dispositivo.' });
      });
  });
};

export const uploadOneSignalIdToUser = (idUser, idOneSignal) => {
  return new Promise((resolve, reject) => {
    const idNewRegister = uuidv4();
    newFirebase.db
      .collection('Users')
      .doc(idUser)
      .update({
        [`oneSignalKeys.${idNewRegister}`]: {
          key: idOneSignal,
          date: getCurrentDate(),
          timestapm: newFirebase.firestore.FieldValue.serverTimestamp(),
        },
      })
      .then(() => {
        resolve({
          message: 'Dispositivo registrado con éxito',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al registrar dispositivo',
        });
      });
  });
};
