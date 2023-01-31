import { newFirebase } from '../firebase/firebase';
import { SchedulesType } from '../models/SchedulesType';
import { getDayNumberByDate } from '../utils/formulas';
// eslint-disable-next-line import/no-cycle
import { getAllDatesByDoctorDate } from './DatesAction';

// Obtener todas las reservaciones que coincidan con una fecha
export const getAllReservesByDate = (date) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Reservations')
      .where('date', '==', date)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: querySnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de las reservaciones.',
        });
      });
  });
};

// Obtener todas las reservaciones que coincidan con un doctor y fecha
export const getAllReservesByDoctorDate = (doctorId, date) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Reservations')
      .where('date', '==', date)
      .where('doctorIdAssigned', '==', doctorId)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: querySnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de las reservaciones.',
        });
      });
  });
};

// Verificar si un día está reservado completamente según la fecha y el doctor
export const getAllReserveAllDayByDoctorDate = (doctorId, date) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Reservations')
      .where('date', '==', date)
      .where('doctorIdAssigned', '==', doctorId)
      .where('isCompleteDay', '==', true)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: querySnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de las reservaciones.',
        });
      });
  });
};

// Obtener reservación por su id
export const getReservationById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Reservations')
      .doc(id)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: { id: querySnapshot.id, ...querySnapshot.data() },
        });
      })
      .catch(() => {
        reject({
          message: 'No se ha podido obtener los datos de la reservación',
        });
      });
  });
};

// Crear reservación
export const createReservation = (reservationData) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Reservations')
      .add({
        ...reservationData,
        timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
      })
      .then((data) => {
        resolve({
          data: {
            id: data?.id,
          },
          message: 'Reservación creada con éxito',
        });
      })
      .catch((error) => {
        console.log(error);
        reject({
          message: 'Por el momento no se puede crear la reservación',
        });
      });
  });
};

// Obtener los horarios disponibles para reservar horario
export const getAllReservationSchedules = (doctorId, date, edit = false) => {
  return new Promise((resolve, reject) => {
    const schedulesListTaken = [];
    const dayNumber = getDayNumberByDate(date);
    if (dayNumber === 7) {
      resolve([
        {
          id: 0,
          schedule: '¡Ups!',
          type: 'taken',
          description: 'Día domingo no disponible',
        },
      ]);
      return;
    }
    getAllDatesByDoctorDate(doctorId, date)
      .then((data) => {
        data.data.forEach((date) => schedulesListTaken.push({
          id: date.id,
          schedule: date.schedule,
          type: 'date',
          description: date.reason,
          isFirstDate: date.isFirstDate,
        }));
        return getAllReservesByDoctorDate(doctorId, date);
      })
      .then((data) => {
        data.data.forEach((reservation) => schedulesListTaken.push({
          id: reservation.id,
          schedule: reservation.schedule,
          type: 'reservation',
          description: reservation.reason,
          isCompleteDay: reservation.isCompleteDay,
        }));
        const schedulesCompletesOfDay = Object.keys(
          SchedulesType[dayNumber],
        ).map((item) => ({
          id: dayNumber + item,
          schedule: SchedulesType[dayNumber][item],
          type: 'free',
          description: 'Espacio disponible',
        }));
        if (schedulesListTaken.length === 0) {
          resolve(schedulesCompletesOfDay);
        } else {
          let isDayBussy = false;
          let sameDay = false;
          // Recorre el modelo de los horarios completos
          schedulesListTaken.forEach((scheduleTaken) => {
            if (scheduleTaken.isCompleteDay === true) {
              isDayBussy = true;
              sameDay = true;
            }
            // Si hay horarios ocupados, reemplazarlos
            for (let i = 0; i < schedulesCompletesOfDay.length; i += 1) {
              // Si hay citas ene ese horario, se reemplaza con la cita o reservación
              if (
                schedulesCompletesOfDay[i].schedule === scheduleTaken.schedule
              ) {
                schedulesCompletesOfDay[i].id = scheduleTaken.id;
                schedulesCompletesOfDay[i].type = scheduleTaken.type;
                schedulesCompletesOfDay[i].description = scheduleTaken.description;
                if (scheduleTaken.isFirstDate === true) {
                  schedulesCompletesOfDay[i + 1].id = `${scheduleTaken.id}-1`;
                  schedulesCompletesOfDay[i + 1].type = scheduleTaken.type;
                  schedulesCompletesOfDay[i + 1].description = 'Continuación de cita';
                }
              }
            }
          });
          if (isDayBussy && sameDay === true && edit === false) {
            reject([
              {
                id: 0,
                schedule: '¡Ups!',
                type: 'taken',
                description: 'Ya has reservado este día',
              },
            ]);
          } else if (isDayBussy) {
            reject([
              {
                id: 0,
                schedule: '¡Ups!',
                type: 'taken',
                description: 'Ya has reservado este día',
              },
            ]);
          } else {
            resolve(schedulesCompletesOfDay);
          }
        }
      })
      .catch(() => reject([
        {
          id: 0,
          schedule: '',
          type: '',
          description: 'No se pueden cargar los horarios por ahora',
        },
      ]));
  });
};

// Actualzar una reservación por su id
export const updateReservationById = (id, data) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Reservations')
      .doc(id)
      .set(data, { merge: true })
      .then(() => {
        resolve({
          message: 'Reservación actualizada exitosamente',
        });
      })
      .catch((err) => {
        console.log(err);
        reject({
          message: 'Error al actualizar la reservación',
        });
      });
  });
};

// Eliminar una reservación
export const deleteReservationById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Reservations')
      .doc(id)
      .delete()
      .then(() => resolve({ message: 'Reservación eliminada con éxito' }))
      .catch(() => {
        reject({
          message: 'Error al eliminar la Reservación, intenta más tarde',
        });
      });
  });
};
