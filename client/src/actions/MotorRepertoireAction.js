/* eslint-disable max-len */
import { newFirebase } from '../firebase/firebase';

const tableToApply = 'MotorRepertoire';

export const createMotorRepertoire = (data) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(tableToApply)
      .add({
        ...data,
        timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((resp) => {
        resolve({
          message: 'Registro creado con éxito',
          id: resp?.id,
          resp: true,
        });
      })
      .catch(() => {
        reject({
          message: 'Por el momento no se puede crear el registro',
        });
      });
  });
};

export const getMotorRepertoireById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(tableToApply)
      .doc(id)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: { id: querySnapshot.id, ...querySnapshot.data() },
        });
      })
      .catch(() => {
        reject({ message: 'No se ha podido obtener los datos registro' });
      });
  });
};

export const getMotorRepertoireByPatientId = (patientId, neuroMonitoringId) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(tableToApply)
      .where(
        patientId ? 'patientId' : 'neuroMonitoringId',
        '==',
        patientId || neuroMonitoringId,
      )
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.docs.length) {
          const data = querySnapshot.docs.map((item) => {
            return { id: item.id, ...item.data() };
          });
          resolve({
            data: { id: querySnapshot.id, ...data[0] },
          });
        } else {
          reject({ message: 'No hay formulario relacionado' });
        }
      })
      .catch(() => {
        reject({ message: 'No se ha podido obtener los datos registro' });
      });
  });
};

export const getMotorRepertoireByPatientMonitoringId = (
  patientId,
  neuroMonitoringId,
) => {
  return new Promise((resolve) => {
    newFirebase.db
      .collection(tableToApply)
      .where(
        patientId ? 'patientId' : 'neuroMonitoringId',
        '==',
        patientId || neuroMonitoringId,
      )
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.docs.length) {
          const data = querySnapshot.docs.map((item) => {
            return { id: item.id, ...item.data() };
          });
          resolve({
            data: { id: querySnapshot.id, ...data[0] },
          });
        } else {
          resolve({ message: 'No hay formulario relacionado' });
        }
      })
      .catch(() => {
        resolve({ message: 'No se ha podido obtener los datos registro' });
      });
  });
};

export const updateMotorRepertoireById = (id, data) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(tableToApply)
      .doc(id)
      .set(data, { merge: true })
      .then(() => {
        resolve({
          message: 'Registro actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el registro',
        });
      });
  });
};

// export const getAllMotorRepertoireByPatientId = (patientId) => {
//   return new Promise((resolve, reject) => {
//     newFirebase.db.collection(tableToApply)
//       .where('patientId', '==', patientId).get()
//       .then((querySnapshot) => {
//         const data = querySnapshot.docs.map((item) => {
//           return { id: item.id, ...item.data() };
//         });
//         resolve({
//           data: { id: querySnapshot.id, ...data },
//         });
//       })
//       .catch(() => {
//         reject({ message: 'No se ha podido obtener los datos registro' });
//       });
//   });
// };

// OR WHERE QUERY EXAMPLE START
export async function getAllMotorRepertoireByPatientId(patientId) {
  const isPatientId = newFirebase.db
    .collection(tableToApply)
    .where('patientId', '==', patientId)
    .get();
  const isNeuroPatientId = newFirebase.db
    .collection(tableToApply)
    .where('neuroMonitoringPatientId', '==', patientId)
    .get();
  const [patientQuerySnapshot, neuroPatientQuerySnapshot] = await Promise.all([
    isPatientId,
    isNeuroPatientId,
  ]);
  const patientArray = patientQuerySnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
  const neuroPatientArray = neuroPatientQuerySnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  return patientArray.concat(neuroPatientArray);
}
// OR WHERE QUERY EXAMPLE END
