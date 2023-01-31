/* eslint-disable no-await-in-loop */
/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
import { v4 as uuidv4 } from 'uuid';
/* eslint-disable no-async-promise-executor */
import moment from 'moment';
import { newFirebase } from '../firebase/firebase';
import { SchedulesType } from '../models/SchedulesType';
import { getDayNumberByDate } from '../utils/formulas';
// eslint-disable-next-line import/no-cycle
import {
  getAllReservesByDoctorDate,
  getAllReservesByDate,
} from './ReservesAction';
import { getPatientValorationsComplete } from './PatientAction';
import { getUsers } from './UserAction';

// Obtener cita por su id
export const getDateById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .doc(id)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: { id: querySnapshot.id, ...querySnapshot.data() },
        });
      })
      .catch(() => {
        reject({ message: 'No se ha podido obtener los datos de la cita' });
      });
  });
};

// Obtener todas las citas que coincidan con una fecha
export const getAllDatesByDate = (date) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
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
            'Por el momento no es posible obtener la información de las citas.',
        });
      });
  });
};

// Obtener todas las citas que coincidan con un doctor, paciente y fecha
export const getAllDatesByDoctorPatientDate = (
  doctorIdAssigned,
  date,
  patientId,
) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .where('patientId', '==', patientId)
      .where('date', '==', date)
      .where('doctorIdAssigned', '==', doctorIdAssigned)
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
            'Por el momento no es posible obtener la información de las citas.',
        });
      });
  });
};

// Obtener todas las citas que coincidan con un doctor y fecha
export const getAllDatesByDoctorDate = (doctorIdAssigned, date) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .where('date', '==', date)
      .where('doctorIdAssigned', '==', doctorIdAssigned)
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
            'Por el momento no es posible obtener la información de las citas.',
        });
      });
  });
};

// Obtener todas las citas de un doctor en un día y horario específico
export const getAllDatesByDoctorDateSchedule = (
  doctorIdAssigned,
  date,
  schedule,
) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .where('date', '==', date)
      .where('doctorIdAssigned', '==', doctorIdAssigned)
      .where('schedule', '==', schedule)
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
            'Por el momento no es posible obtener la información de las citas.',
        });
      });
  });
};

// Obtener todas las citas de un paciente
export const getAllDatesByPatientId = (patientId) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .where('patientId', '==', patientId)
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
            'Por el momento no es posible obtener la información de las citas.',
        });
      });
  });
};

// Crear cita regular
export const createRegularDate = (dateData) => {
  return new Promise(async (resolve) => {
    const citas = [];
    const frecuencyWeeks = parseInt(dateData.frecuency || 0);
    const fechaInicial = dateData.startDate;
    const fechaFinal = moment(dateData.startDate)
      .add(frecuencyWeeks, 'weeks')
      .format('YYYY-MM-DD');
    const diaNumeroInicio = moment(dateData.startDate).weekday(); // 0 - 5
    const uuidDeGrupo = uuidv4();

    for (let j = 0; j < dateData.weekDates.length; j++) {
      const dayNumberDate = parseInt(dateData.weekDates[j].day.value); // 0 - 5
      let fechaCita;
      let fechaAnteriorAlInicio = false;
      if (dayNumberDate < diaNumeroInicio) {
        // el día de la primera cita es antes de la fecha inicial
        const diff = diaNumeroInicio - dayNumberDate; // diff en días
        fechaCita = moment(fechaInicial)
          .subtract(diff, 'days')
          .format('YYYY-MM-DD');
        fechaAnteriorAlInicio = true;
      } else if (dayNumberDate < diaNumeroInicio) {
        // el día de la primera cita es el día de la fecha inicial
        fechaCita = fechaInicial;
        fechaAnteriorAlInicio = false;
      } else {
        // el día de la primera cita es después de la fecha inicial
        const diff = dayNumberDate - diaNumeroInicio; // diff en días
        fechaCita = moment(fechaInicial).add(diff, 'days').format('YYYY-MM-DD');
        fechaAnteriorAlInicio = false;
      }

      let repeticionesFrecuenciaSemanas = frecuencyWeeks;
      if (fechaAnteriorAlInicio) {
        repeticionesFrecuenciaSemanas += 1;
      }
      for (
        let semanaNumero = 0;
        semanaNumero < repeticionesFrecuenciaSemanas;
        semanaNumero++
      ) {
        // Frecuencia / número de semanas
        let siguienteCita;
        if (fechaAnteriorAlInicio) {
          siguienteCita = moment(fechaCita)
            .add(semanaNumero + 1, 'weeks')
            .format('YYYY-MM-DD');
        } else {
          siguienteCita = moment(fechaCita)
            .add(semanaNumero, 'weeks')
            .format('YYYY-MM-DD');
        }
        const isRightDate = moment(siguienteCita).isSameOrBefore(fechaFinal);
        if (isRightDate) {
          citas.push({
            ...dateData,
            uuidDateGroup: uuidDeGrupo,
            date: siguienteCita,
            dateNumberGroup: citas.length + 1,
            doctorIdAssigned: dateData.weekDates[j].doctorIdAssigned,
            schedule: dateData.weekDates[j].schedule,
          });
        }
      }
    }
    const results = [];
    for (let i = 0; i < citas.length; i++) {
      const result = await createOneCita({
        ...citas[i],
        dateTotalGroup: citas.length,
      });
      results.push(result);
      if (!result?.resp) {
        break;
      }
    }
    if (citas.length === results.length) {
      resolve({
        message: 'Citas creadas con éxito',
      });
    } else {
      for (let i = 0; i < results.length; i++) {
        await deleteDateById(results[i].id);
      }
      resolve({
        reject: 'Hubo un error al crear las citas, intenta de nuevo.',
      });
    }
  });
};

const createOneCita = (dateData) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .add({
        ...dateData,
        timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
        createAt: moment().format('YYYY-MM-DD'),
      })
      .then((resp) => resolve({
        message: 'Cita creada con éxito',
        id: resp.id,
        resp: true,
      }))
      .catch((error) => reject({
        message: 'Error al crear la cita',
        error,
        resp: false,
      }));
  });
};

// Crear primer cita
export const createFirstDate = (dateData) => {
  return new Promise((resolve, reject) => {
    let nextSchedule = '';
    const dayNumber = getDayNumberByDate(dateData.date);
    // Obtener el siguiente horario
    Object.keys(SchedulesType[dayNumber]).forEach((scheduleNumber) => {
      if (dateData.schedule === SchedulesType[dayNumber][scheduleNumber]) {
        nextSchedule = SchedulesType[dayNumber][parseInt(scheduleNumber) + 1];
      }
    });
    // dateData.schedule
    getAllDatesByDoctorDateSchedule(
      dateData.doctorIdAssigned,
      dateData.date,
      nextSchedule,
    )
      .then((data) => {
        if (data.length > 0) {
          reject({
            message:
              'El siguiente horario está ocupado, se necesitan dos horas para la primera cita.',
          });
        } else {
          newFirebase.db
            .collection('Dates')
            .add({
              ...dateData,
              timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
            })
            .then(() => resolve({
              message: 'Cita creada con éxito',
            }))
            .catch(() => reject({
              message: 'Error al crear la cita',
            }));
        }
      })
      .catch(() => reject({ message: 'Error al verificar disponibilidad' }));
  });
};

// Crear cita
export const createDate = (dateData) => {
  return new Promise(async (resolve, reject) => {
    if (dateData.isFirstDate === true) {
      delete dateData.frecuency;
      delete dateData.repetitions;
      await createFirstDate(dateData)
        .then((resp) => resolve(resp))
        .catch((error) => reject(error));
    } else {
      await createRegularDate(dateData)
        .then((resp) => resolve(resp))
        .catch((error) => reject(error));
    }
  });
};

export const deleteDatesByUuidGroup = (uuidDateGroup) => {
  const promises = [];
  return new Promise(async (resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .where('uuidDateGroup', '==', uuidDateGroup)
      .get()
      // .delete()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          // Create a Promise that deletes this document
          // Push the Promise in the "promises" array
          promises.push(deleteDocPromise(document));
        });
        return Promise.all(promises);
      })
      .then(() => {
        resolve({ message: 'Citas eliminada con éxito' });
      })
      .catch((err) => {
        console.log(err);
        reject({ message: 'Error al eliminar las citas, intenta más tarde' });
      });
  });
};

const deleteDocPromise = (document) => {
  return newFirebase.db.collection('Dates').doc(document.id).delete();
};

// Obtener todas las citas y reservaciones de un doctor en una fecha
export const getAllDatesReservationsByDoctorDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    const schedulesListTaken = [];
    const dayNumber = getDayNumberByDate(date);
    if (dayNumber === 7) {
      resolve([]);
      return;
    }
    const patientList = await getPatientValorationsComplete();
    const userList = await getUsers();
    getAllDatesByDoctorDate(doctorId, date)
      .then((data) => {
        data.data.forEach((date) => schedulesListTaken.push({
          ...date,
          id: date.id,
          type: 'date',
          doctorName: '',
        }));
        return getAllReservesByDoctorDate(doctorId, date);
      })
      .then((data) => {
        data.data.forEach((reservation) => schedulesListTaken.push({
          ...reservation,
          id: reservation.id,
          type: 'reservation',
          doctorName: '',
        }));
        schedulesListTaken.sort((a, b) => {
          if (a.schedule > b.schedule) return 1;
          if (a.schedule < b.schedule) return -1;
          return 0;
        });
        schedulesListTaken.forEach((item) => {
          userList.data.forEach((doctor) => {
            if (item.doctorIdAssigned === doctor.id) {
              item.doctorName = doctor.username;
            }
          });
        });
        schedulesListTaken.forEach((item) => {
          patientList.data.forEach((patient) => {
            if (item.patientId === patient.id) {
              item.patientName = patient.general.name;
            }
          });
        });
        resolve(schedulesListTaken);
      })
      .catch((error) => reject({ message: error.message }));
  });
};

// Obtener todas las citas del consultorio de un mes
export const getAllDatesByOfficeMonth = (date) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = date.substr(0, 7);
    await newFirebase.db
      .collection('Dates')
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          const dateExists = resp.findIndex(
            (date) => date.date === item.data().date,
          );
          if (dateExists === -1) {
            resp.push({ title: 'Citas', date: item.data().date, id: item.id });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las citas del consultorio de una semana
export const getAllDatesByOfficeWeek = (dateStart) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = dateStart.substr(0, 7);
    const dateEnd = moment(dateStart).add(5, 'days').format('YYYY-MM-DD');
    await newFirebase.db
      .collection('Dates')
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          if (
            moment(item.data().date).isSameOrAfter(dateStart)
            && moment(item.data().date).isSameOrBefore(dateEnd)
          ) {
            resp.push({ title: 'Cita', data: item.data(), id: item.id });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las reservaciones del consultorio de un mes
export const getAllReservationsByOfficeMonth = (date) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = date.substr(0, 7);
    await newFirebase.db
      .collection('Reservations')
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          const dateExists = resp.findIndex(
            (date) => date.date === item.data().date,
          );
          if (dateExists === -1) {
            resp.push({
              title: 'Reservación',
              date: item.data().date,
              id: item.id,
            });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las reservaciones del consultorio de una senana
export const getAllReservationsByOfficeWeek = (dateStart) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = dateStart.substr(0, 7);
    const dateEnd = moment(dateStart).add(5, 'days').format('YYYY-MM-DD');
    await newFirebase.db
      .collection('Reservations')
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          if (
            moment(item.data().date).isSameOrAfter(dateStart)
            && moment(item.data().date).isSameOrBefore(dateEnd)
          ) {
            resp.push({ title: 'Reservación', data: item.data(), id: item.id });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las citas de un doctor de un mes
export const getAllDatesByDoctorMonth = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = date.substr(0, 7);
    await newFirebase.db
      .collection('Dates')
      .where('doctorIdAssigned', '==', doctorId)
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          const dateExists = resp.findIndex(
            (date) => date.date === item.data().date,
          );
          if (dateExists === -1) {
            resp.push({ title: 'Citas', date: item.data().date, id: item.id });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las citas de un doctor de una semana
export const getAllDatesByDoctorWeek = (doctorId, dateStart) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = dateStart.substr(0, 7);
    const dateEnd = moment(dateStart).add(5, 'days').format('YYYY-MM-DD');
    await newFirebase.db
      .collection('Dates')
      .where('doctorIdAssigned', '==', doctorId)
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          if (
            moment(item.data().date).isSameOrAfter(dateStart)
            && moment(item.data().date).isSameOrBefore(dateEnd)
          ) {
            resp.push({
              title: 'Cita',
              data: {
                ...item.data(),
                id: item.id,
              },
              id: item.id,
            });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las reservaciones de un doctor de un mes
export const getAllReservationsByDoctorMonth = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = date.substr(0, 7);
    await newFirebase.db
      .collection('Reservations')
      .where('doctorIdAssigned', '==', doctorId)
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          const dateExists = resp.findIndex(
            (date) => date.date === item.data().date,
          );
          if (dateExists === -1) {
            resp.push({
              title: 'Reservación',
              date: item.data().date,
              id: item.id,
            });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las reservaciones de un doctor de un mes
export const getAllReservationsByDoctorWeek = (doctorId, dateStart) => {
  return new Promise(async (resolve, reject) => {
    const yearMonth = dateStart.substr(0, 7);
    const dateEnd = moment(dateStart).add(5, 'days').format('YYYY-MM-DD');
    await newFirebase.db
      .collection('Reservations')
      .where('doctorIdAssigned', '==', doctorId)
      .orderBy('date')
      .startAt(yearMonth)
      .get()
      .then((querySnapshot) => {
        const resp = [];
        querySnapshot.docs.forEach((item) => {
          if (
            moment(item.data().date).isSameOrAfter(dateStart)
            && moment(item.data().date).isSameOrBefore(dateEnd)
          ) {
            resp.push({
              title: 'Reservación',
              data: {
                ...item.data(),
                id: item.id,
              },
              id: item.id,
            });
          }
        });
        resolve(resp);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Obtener todas las citas y reservaciones del consultorio en una fecha
export const getAllDatesReservationsByAllDate = (date) => {
  return new Promise(async (resolve, reject) => {
    const schedulesListTaken = [];
    const dayNumber = getDayNumberByDate(date);
    if (dayNumber === 7) {
      resolve([]);
      return;
    }
    const patientList = await getPatientValorationsComplete();
    const userList = await getUsers();
    getAllDatesByDate(date)
      .then((data) => {
        data.data.forEach((date) => schedulesListTaken.push({
          ...date,
          id: date.id,
          type: 'date',
          doctorName: '',
        }));
        return getAllReservesByDate(date);
      })
      .then((data) => {
        data.data.forEach((reservation) => schedulesListTaken.push({
          ...reservation,
          id: reservation.id,
          type: 'reservation',
          doctorName: '',
        }));
        schedulesListTaken.sort((a, b) => {
          if (a.schedule > b.schedule) return 1;
          if (a.schedule < b.schedule) return -1;
          return 0;
        });
        schedulesListTaken.forEach((item) => {
          userList.data.forEach((doctor) => {
            if (item.doctorIdAssigned === doctor.id) {
              item.doctorName = doctor.username;
            }
          });
        });
        schedulesListTaken.forEach((item) => {
          patientList.data.forEach((patient) => {
            if (item.patientId === patient.id) {
              item.patientName = patient.general.name;
            }
          });
        });
        resolve(schedulesListTaken);
      })
      .catch((error) => reject({ message: error.message }));
  });
};

// Obtener los horarios disponibles para agendar la cita
export const getAllDateSchedulesFreeOptionsSearch = (
  doctorIdAssigned,
  date,
  patientId,
) => {
  return new Promise((resolve, reject) => {
    let patientDates = [];
    let doctorDates = [];
    const dayNumber = getDayNumberByDate(date);
    if (dayNumber === 7) {
      resolve([
        {
          name: 'Día no disponible',
          value: '',
        },
      ]);
      return;
    }
    if (patientId) {
      getAllDatesByDoctorPatientDate(doctorIdAssigned, date, patientId)
        .then((data) => {
          patientDates = data.data;
          return getAllReservesByDoctorDate(doctorIdAssigned, date);
        })
        .then((data) => {
          data.data.forEach((reservation) => doctorDates.push(reservation));
          return getAllDatesByDoctorDate(doctorIdAssigned, date);
        })
        .then((data) => {
          // doctorDates = data.data;
          data.data.forEach((date) => doctorDates.push(date));
          const schedulesCompletesOfDay = Object.keys(
            SchedulesType[dayNumber],
          ).map((item) => {
            const schedule = SchedulesType[dayNumber][item];
            return { name: schedule, value: schedule };
          });
          // Cuando no hay citas registardas en el mismo horario y fecha
          if (doctorDates.length === 0) {
            resolve(schedulesCompletesOfDay);
          } else {
            // Recorres el modelo de los horarios completos
            Object.keys(SchedulesType[dayNumber]).forEach((scheduleNumber) => {
              const schedule = SchedulesType[dayNumber][scheduleNumber];
              /**
               * Si hay citas programadas para el dcotor,
               * contrastar sus horarios con los horarios completos
               */
              if (doctorDates.length !== 0) {
                for (let i = 0; i < doctorDates.length; i += 1) {
                  // Si hay citas ene ese horario, eliminarlo de los horarios completos
                  if (doctorDates[i].schedule === schedule) {
                    const indexToDelete = schedulesCompletesOfDay.findIndex(
                      (element) => element.value === schedule,
                    );
                    // eslint-disable-next-line no-unused-expressions
                    doctorDates[i].isFirstDate === true
                      ? schedulesCompletesOfDay.splice(indexToDelete, 2)
                      : schedulesCompletesOfDay.splice(indexToDelete, 1);
                  }
                }
              }
              /**
               * Si hay citas programadas para el paciente,
               * contrastar sus horarios con los horarios completos
               */
              if (patientDates.length !== 0) {
                for (let i = 0; i < patientDates.length; i += 1) {
                  // Si hay citas ene ese horario, eliminarlo de los horarios completos
                  if (patientDates[i].schedule === schedule) {
                    const indexToDelete = schedulesCompletesOfDay.findIndex(
                      (element) => element.value === schedule,
                    );
                    // eslint-disable-next-line no-unused-expressions
                    patientDates[i].isFirstDate === true
                      ? schedulesCompletesOfDay.splice(indexToDelete, 2)
                      : schedulesCompletesOfDay.splice(indexToDelete, 1);
                  }
                }
              }
            });
            resolve(schedulesCompletesOfDay);
          }
        })
        .catch(() => reject([{ name: 'No se puede mostrar por ahora', value: '' }]));
    } else {
      getAllDatesByDoctorDate(doctorIdAssigned, date)
        .then((data) => {
          doctorDates = data.data;
          const schedulesCompletesOfDay = Object.keys(
            SchedulesType[dayNumber],
          ).map((item) => ({
            name: SchedulesType[dayNumber][item],
            value: SchedulesType[dayNumber][item],
          }));
          // Cuando no hay citas registardas en el mismo horario y fecha
          if (doctorDates.length === 0) {
            resolve(schedulesCompletesOfDay);
          } else {
            // Recorres el modelo de los horarios completos
            Object.keys(SchedulesType[dayNumber]).forEach((scheduleNumber) => {
              const schedule = SchedulesType[dayNumber][scheduleNumber];
              /**
               * Si hay citas programadas para el dcotor,
               * contrastar sus horarios con los horarios completos
               */
              if (doctorDates.length !== 0) {
                for (let i = 0; i < doctorDates.length; i += 1) {
                  // Si hay citas ene ese horario, eliminarlo de los horarios completos
                  if (doctorDates[i].schedule === schedule) {
                    const indexToDelete = schedulesCompletesOfDay.findIndex(
                      (element) => element.value === schedule,
                    );
                    // eslint-disable-next-line no-unused-expressions
                    doctorDates[i].isFirstDate === true
                      ? schedulesCompletesOfDay.splice(indexToDelete, 2)
                      : schedulesCompletesOfDay.splice(indexToDelete, 1);
                  }
                }
              }
            });
            resolve(schedulesCompletesOfDay);
          }
        })
        .catch(() => reject([{ name: 'No se puede mostrar por ahora', value: '' }]));
    }
  });
};

// Obtener los horarios
export const getAllSchedulesOptionsSearch = (date) => {
  return new Promise((resolve) => {
    const dayNumber = getDayNumberByDate(date);
    if (dayNumber === 7) {
      resolve([
        {
          name: 'Día no disponible',
          value: '',
        },
      ]);
      return;
    }
    const schedulesCompletesOfDay = Object.keys(SchedulesType[dayNumber]).map(
      (item) => ({
        name: SchedulesType[dayNumber][item],
        value: SchedulesType[dayNumber][item],
      }),
    );
    resolve(schedulesCompletesOfDay);
  });
};

// Actualzar una cita por su id
export const updateDateById = (id, data) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .doc(id)
      .set(data, { merge: true })
      .then(() => {
        resolve({
          message: 'Cita actualizada exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar la cita',
        });
      });
  });
};

// Eliminar una cita
export const deleteDateById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection('Dates')
      .doc(id)
      .delete()
      .then(() => resolve({ message: 'Cita eliminada con éxito' }))
      .catch(() => {
        reject({ message: 'Error al eliminar la cita, intenta más tarde' });
      });
  });
};
