/* eslint-disable max-len */
import { newFirebase } from '../firebase/firebase';

const tableToApply = 'GeneralMovements';

export const createGeneralMovements = (data) => {
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

export const getGeneralMovementsById = (id) => {
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

export const getGeneralMovementsByPatientId = (
  patientId,
  neuroMonitoringId,
) => {
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
          reject({ message: 'No hay un registro del formulario creado' });
        }
      })
      .catch((err) => {
        console.log(err);
        reject({ message: 'No se ha podido obtener los datos registro' });
      });
  });
};

export const getGeneralMovementsByPatientMonitoringId = (
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
          resolve({ message: 'No hay un registro del formulario creado' });
        }
      })
      .catch(() => {
        resolve({ message: 'No se ha podido obtener los datos registro' });
      });
  });
};

export const updateGeneralMovementsById = (id, data) => {
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

// export const getAllGeneralMovementsByPatientId = (patientId) => {
//   return new Promise((resolve, reject) => {
//     newFirebase.db.collection(tableToApply)
//       .where('patientId', '==', patientId).where('neuroMonitoringPatientId', '==', patientId).get()
//       .then((querySnapshot) => {
//         const data = querySnapshot.docs.map((item) => {
//           return { id: item.id, ...item.data() };
//         });
//         resolve({
//           data: { id: querySnapshot.id, data },
//         });
//       })
//       .catch((err) => {
//         reject({ message: 'No se ha podido obtener los datos registro' });
//       });
//   });
// };

// OR WHERE QUERY EXAMPLE START
export async function getAllGeneralMovementsByPatientId(patientId) {
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
