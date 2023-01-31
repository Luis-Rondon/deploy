import { newFirebase } from '../firebase/firebase';
import { SchedulesType } from '../models/SchedulesType';

// Crear todos los horarios con base en el modelo
export const createAllSchedules = () => {
  return new Promise((resolve, reject) => {
    Object.keys(SchedulesType).forEach((day) => {
      newFirebase.db
        .collection('Schedules')
        .doc(day)
        .set(SchedulesType[day], { merge: true })
        .then(() => {
          // console.log('bien');
          resolve({
            message: 'Horarios creados',
          });
        })
        .catch(() => {
          // console.log(error);
          reject({
            message: 'Error al crear los horarios',
          });
        });
    });
  });
};

// Obtener todos los horarios
export const getAllSchedules = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Schedules')
      .get()
      .then((querySnapshot) => {
        resolve({
          status: true,
          data: querySnapshot.docs.map((item) => ({
            id: item.id,
            data: item.data(),
          })),
        });
      })
      .catch(() => {
        reject({
          message: 'Error al obtener los horarios',
        });
      });
  });
};

// Obtener los horarios de un día
export const getSchedulesByDayOfWeek = (day) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Schedules')
      .doc(day.toString())
      .get()
      .then((querySnapshot) => {
        const data = Object.keys(querySnapshot.data()).map((item) => ({
          value: item,
          name: querySnapshot.data()[item],
        }));
        resolve(data);
      })
      .catch(() => {
        reject([{ value: '', name: 'Error desconocido al obtener' }]);
      });
  });
};
