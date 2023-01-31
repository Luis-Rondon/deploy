import { v4 as uuidv4 } from 'uuid';
import { newFirebase } from '../firebase/firebase';

// Obtener el historial por el id
export const getHistoryFormatById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('HistoryFormat')
      .id(id)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: querySnapshot.data(),
        });
      })
      .catch((err) => {
        console.log(err);
        reject({
          message:
            'Por el momento no es posible obtener la información del historial.',
        });
      });
  });
};

// Obtener el historial por el id del paciente
export const getHistoryFormatByPatientId = (patientId) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('HistoryFormat')
      .where('patientId', '==', patientId)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: querySnapshot.docs.length
            ? {
              ...querySnapshot.docs[0].data(),
              id: querySnapshot.docs[0].id,
            }
            : null,
        });
      })
      .catch((err) => {
        console.log(err);
        reject({
          message:
            'Por el momento no es posible obtener la información del historial.',
        });
      });
  });
};

// Crear historial
export const createHistoryDates = (historyData) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('HistoryFormat')
      .add({
        ...historyData,
        timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((resp) => {
        resolve({
          message: 'Historial creado con éxito',
          id: resp?.id,
          resp: true,
        });
      })
      .catch((error) => {
        console.log(error);
        reject({
          message: 'Por el momento no se puede crear el historial',
        });
      });
  });
};

// Actualzar un historial por su id
export const updateHistoryDatesById = (id, data) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('HistoryFormat')
      .doc(id)
      .set(data, { merge: true })
      .then(() => {
        resolve({
          message: 'Historial actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el historial',
        });
      });
  });
};

// Subir múltiples archivos del formato de citas

export const uploadOneHistoryFormatFiles = (file, type, userId, setState) => {
  // types are videos, documents or images
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line max-len
    const newName = new Date().toISOString()
      + new Date().getTime()
      + (Math.floor(Math.random() * (50 - 0)) + 0)
      + file.name;
    const uploadTask = newFirebase.storage
      .ref()
      .child(`/historyformat/${userId}/${type}/${newName}`)
      .put(file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (setState) {
          setState(progress);
          if (progress === 100) {
            setState(0);
          }
        }
      },
      () => {
        reject({ message: 'Ho ocurrido un error al subir el archivo' });
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          resolve({
            originalName: file.name,
            fileName: newName,
            fileUrl: downloadURL,
          });
        });
      },
    );
  });
};

export const uploadMultipleHistoryFormatFiles = (
  fileList,
  type,
  userId,
  setState = () => null,
) => {
  // types are videos, documents or images
  return new Promise((resolve, reject) => {
    const promises = [];
    fileList.forEach((file) => {
      promises.push(uploadOneHistoryFormatFiles(file, type, userId, setState));
    });
    Promise.all(promises)
      .then((results) => {
        const objectCreated = results.reduce((result, item) => {
          result[uuidv4()] = item;
          return result;
        }, {});
        resolve(objectCreated);
      })
      .catch(() => reject({ message: 'Ho ocurrido un error al subir los archivos' }));
  });
};

export const deleteOneHistoryFormatFiles = (file, type, userId) => {
  // types are videos, documents or images
  return new Promise((resolve, reject) => {
    const storageRef = newFirebase.storage.ref();
    const desertRef = storageRef.child(
      `/historyformat/${userId}/${type}/${file.fileName}`,
    );
    desertRef
      .delete()
      .then(() => {
        resolve({ message: 'Archivo borrado' });
      })
      .catch(() => {
        reject({ message: 'Ho ocurrido un error al eliminar el archivo' });
      });
  });
};

// eslint-disable-next-line max-len
export const deleteFilePropertyFromHistoryFormatById = (
  idRegister,
  idFile,
  type,
) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('HistoryFormat')
      .doc(idRegister)
      .update({
        [`${type}Files.${idFile}`]: newFirebase.firestore.FieldValue.delete(),
      })
      .then(() => {
        resolve({
          message: 'Registro actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el Registro',
        });
      });
  });
};
