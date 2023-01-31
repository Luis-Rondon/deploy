/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
import React, { useState, useEffect, useContext } from 'react';
import {
  Row, Col, Container, Button, Spinner, Label,
} from 'reactstrap';
// import confirm from 'reactstrap-confirm';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import Form from 'reactstrap/lib/Form';
import authHOC from '../utils/authHOC';
import UserData from '../context/UserData';
import { getCurrentMonthYearText, getDayNumberByDate } from '../utils/formulas';
import {
  // deleteDateById,
  createDate,
  deleteDateById,
  deleteDatesByUuidGroup,
  // deleteDatesByUuidGroup,
  getAllDatesByDoctorWeek,
  getAllReservationsByDoctorWeek,
  // updateDateById,
} from '../actions/DatesAction';
// import { deleteReservationById } from '../actions/ReservesAction';
import {
  sendMultipleAppoiments,
  // sendNotificationCreate,
  // sendNotificationToAdmins,
  // sendReminder,
} from '../firebase/oneSignal';
import Menu from '../common/Menu';
import Navbar from '../common/Navbar';
import CustomAlert from '../common/CustomAlert';
import ModalReserveDate from '../components/ModalReserveDate';
// import AgendarCitaModal from '../components/AgendarCitaModal';
// import ReagendarCitaModal from '../components/ReagendarCitaModal';
import ModalRescheduleReserveDate from '../components/ModalRescheduleReserveDate';
import '../styles/appointmentsv2.scss';
import InputFormGroup from '../common/InputFormGroup';
import { getAllUsersOptionsSearch } from '../actions/UserAction'; // ,getUsersByUsernameOptionsSearch
import {
  frecuencyOptions,
  getCurrentWeek,
  scheduleWeekStructure,
  getDayNameByNumber,
  scheduleSevenDaysWeekStructure,
} from '../utils/scheduleSstructure';
import {
  getAllPatientsOptionsSearch,
  getPatientByNameOptionsSearch,
  getPatientValorationById,
} from '../actions/PatientAction';
import { DatesType } from '../models/DatesType';
// import ScheduleList from "../components/ScheduleList";

// let datesEditingNow = [];

const yesNoOptions = [
  { name: 'Sí', value: 'si' },
  { name: 'No', value: 'no' },
];

const Appointmentv2 = ({ history, match }) => {
  // new
  const [startDayWeek, setStartDayWeek] = useState(
    moment().startOf('week').format('YYYY-MM-DD'),
  );
  const [scheduleEditing, setScheduleEditing] = useState();
  const [doctorIdSelected, setDoctorIdSelected] = useState();
  const [doctorRoleSelected, setDoctorRoleSelected] = useState();
  const [currentWeek, setCurrentWeek] = useState([]);
  const [dateEditingItem, setDateEditingItem] = useState(null); // El item de la lista pre-save setDateEditingItem
  const [patientSelected, setPatientSelected] = useState(null);
  const [doctorUsersOptions, setDoctorUsersOptions] = useState([]);
  const [patientUsersOptions, setPatientUsersOptions] = useState([]);
  const [allEditingItems, setAllEditingItems] = useState([]);
  const [dataSubmmited, setDataSubmitted] = useState([false]);
  const [scheduleWeekStructureDefault, setScheduleWeekStructureDefault] = useState(scheduleWeekStructure);

  // old
  const [alert, setAlert] = useState({ status: false, text: 'asd', color: '' });
  const [isLoading, setIsLoading] = useState(false);
  // const [modalCitaIsOpen, setModalCitaIsOpen] = useState(false);
  const [modalReagendarCitaIsOpen, setModalReagendarCitaIsOpen] = useState(false);
  const [modalReserveIsOpen, setModalReserveIsOpen] = useState(false);
  // const [
  //   modalRescheduleReserveIsOpen,
  //   setModalRescheduleReserveIsOpen,
  // ] = useState(false);

  const [personalView] = useState(false); // setPersonalView
  // const [dateSelected] = useState(getCurrentDate()); // setDateSelected
  // const [citasList, setCitasList] = useState([]);
  const [eventsOfCurrentWeek, setEventsOfCurrentWeek] = useState([]);
  const [idRegisterToEdit, setIdRegisterToEdit] = useState(null);
  const [dataUpdate, setDataUpdate] = useState(false);

  const { userData } = useContext(UserData);

  // Formulario Doctor asignado
  const {
    handleSubmit,
    errors,
    control,
    setValue, // watch,
  } = useForm({
    defaultValues: {
      doctorIdAssigned: '',
      doctorNameAssigned: '',
    },
  });

  // Formulario Date
  const {
    handleSubmit: handleSubmitDate,
    errors: errorsDate,
    control: controlDate,
    reset: resetDate,
    getValues: getValuesDate,
    setValue: setValueDate,
    register,
  } = useForm({
    defaultValues: {
      ...DatesType,
    },
  });

  // const toggleModalCita = () => setModalCitaIsOpen((prevState) => !prevState);
  const toggleModalReagendarCita = () => setModalReagendarCitaIsOpen((prevState) => !prevState);
  const toggleModalReserveDate = () => setModalReserveIsOpen((prevState) => !prevState);
  // eslint-disable-next-line max-len
  // const toggleModalRescheduleReserveDate = () => setModalRescheduleReserveIsOpen((prevState) => !prevState);

  // const changeTypeView = async () => {
  //   await setPersonalView((prevState) => !prevState);
  // };

  // para reservaciones
  const setIdRegisterToNull = (newDataReservation, type) => {
    // type = new || edit
    let dayNumber = null;
    let idxSchMain = null;
    if (!newDataReservation) {
      setScheduleEditing(null);
      setDateEditingItem(null);
      setIdRegisterToEdit(null);
      return;
    }
    if (type === 'new') {
      const newStartDay = moment(newDataReservation?.date)
        .startOf('week')
        .format('YYYY-MM-DD');
      if (newStartDay !== startDayWeek) {
        return;
      }
      dayNumber = getDayNumberByDate(newDataReservation?.date);
      scheduleWeekStructureDefault.forEach((sch) => {
        if (sch.schedule === newDataReservation?.schedule) {
          idxSchMain = scheduleWeekStructureDefault.findIndex(
            (sch2) => sch2.schedule === newDataReservation?.schedule,
          );
          if (idxSchMain !== -1) {
            scheduleWeekStructureDefault[idxSchMain][dayNumber].data = newDataReservation;
            scheduleWeekStructureDefault[idxSchMain][dayNumber].reserved = true;
            scheduleWeekStructureDefault[idxSchMain][
              dayNumber
            ].isEditing = false;
          }
        }
      });
    } else if (type === 'edit') {
      dayNumber = getDayNumberByDate(scheduleEditing?.dateFull);
      scheduleWeekStructureDefault.forEach((sch) => {
        // quitar la info de la reservación anterior
        if (sch.schedule === scheduleEditing?.schedule?.schedule) {
          sch[scheduleEditing?.dayWeek].reserved = false;
          sch[scheduleEditing?.dayWeek].data = {};
        }
        if (sch.schedule === scheduleEditing?.schedule?.schedule) {
          idxSchMain = scheduleWeekStructureDefault.findIndex(
            (sch2) => sch2.schedule === newDataReservation?.schedule,
          );
          if (idxSchMain !== -1) {
            scheduleWeekStructureDefault[idxSchMain][dayNumber].data = {
              ...newDataReservation,
              id: dateEditingItem?.id,
            };
            scheduleWeekStructureDefault[idxSchMain][dayNumber].reserved = true;
            scheduleWeekStructureDefault[idxSchMain][
              dayNumber
            ].isEditing = false;
          }
        }
      });
    }
    if (newDataReservation?.schedule === 'todo el día') {
      // si es reservación de todo el día
      scheduleWeekStructureDefault.forEach((schW) => {
        schW[dayNumber].reserved = true;
        schW[dayNumber].schedule = false;
        schW[dayNumber].data = {
          ...newDataReservation,
          id: type === 'new' ? newDataReservation?.id : dateEditingItem?.id,
        };
      });
    }
    setScheduleEditing(null);
    setDateEditingItem(null);
    setIdRegisterToEdit(null);
  };

  // Recorta el nombre para que entre en el recuadro de ser necesario
  const getShortNameFormat = (nombre = '') => {
    const patientNameFull = nombre?.split(' ');
    const patientName = patientNameFull?.length >= 3
      ? `${patientNameFull[0]} ${patientNameFull[
            patientNameFull?.length - 1
      ].substr(0, 1)} ${patientNameFull[patientNameFull?.length - 2].substr(
        0,
        1,
      )}`
      : patientNameFull?.length >= 2
        ? `${patientNameFull[0]} ${patientNameFull[
            patientNameFull?.length - 1
        ].substr(0, 1)}`
        : patientNameFull[0];
    return patientName;
  };

  // actualiza el calendario cuando se elige un nuevo doctor
  const updateCurrentWeekWithEvents = async () => {
    setIsLoading(true);
    scheduleWeekStructureDefault.forEach((item) => {
      for (let i = 0; i < 6; i++) {
        // item[i].isEditing = false;
        item[i].reserved = false;
        item[i].scheduled = false;
      }
    });
    for (let i = 0; i < eventsOfCurrentWeek.length; i++) {
      const event = eventsOfCurrentWeek[i];
      // eventsOfCurrentWeek.forEach((event) => {
      const { date, schedule } = event?.data;
      const dayNumber = getDayNumberByDate(date);
      // const patientData = await getPatientValorationById(event?.data?.patientId);
      const patientData = patientUsersOptions?.find(
        (pat) => pat?.value === event?.data?.patientId,
      );
      const patientName = getShortNameFormat(patientData?.name);

      if (schedule === 'todo el día') {
        // si es reservación de todo el día
        scheduleWeekStructureDefault.forEach((schW) => {
          schW[dayNumber].reserved = true;
        });
      } else {
        const idxSchMain = scheduleWeekStructureDefault.findIndex(
          (sch) => sch.schedule === schedule,
        );
        if (idxSchMain !== -1) {
          scheduleWeekStructureDefault[idxSchMain][dayNumber].data = event?.data;
          if (event?.title === 'Reservación') {
            scheduleWeekStructureDefault[idxSchMain][dayNumber].reserved = true;
            scheduleWeekStructureDefault[idxSchMain][
              dayNumber
            ].isEditing = false;
          } else if (event?.title === 'Cita') {
            scheduleWeekStructureDefault[idxSchMain][
              dayNumber
            ].scheduled = true;
            scheduleWeekStructureDefault[idxSchMain][
              dayNumber
            ].isEditing = false;
            scheduleWeekStructureDefault[idxSchMain][
              dayNumber
            ].data.patientName = patientName;
          }
        }
      }
      // });
    }
    // setScheduleEditing(null);
    setIsLoading(false);
    setDataUpdate(true);
  };

  // Obtiene los horarios reservados y pendientes del doctor seleccionado
  const getEventsOfWeek = async () => {
    let events = [];
    const doctorId = doctorIdSelected;
    if (doctorId) {
      setIsLoading(true);
      // accion desde la libreria
      await getAllDatesByDoctorWeek(doctorId, startDayWeek)
        .then((resp) => {
          events = resp;
          return Promise.allSettled(
            events.map((date) => getPatientValorationById(date.data.patientId)),
          );
        })
        .then((resp) => {
          events = events.filter(
            (date, idx) => resp[idx].status === 'fulfilled',
          );
          return getAllReservationsByDoctorWeek(doctorId, startDayWeek);
        })
        .then((resp) => {
          setEventsOfCurrentWeek(events.concat(resp));
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setEventsOfCurrentWeek([]);
          setIsLoading(false);
        });
    }
  };

  // busca las citas del docot para actualizar el calendario (se escucha desde el hook)
  const searchDoctorLists = async (data) => {
    const valueDoctorIdAssigned = data?.doctorIdAssigned?.trim();
    if (!valueDoctorIdAssigned) {
      setValue('doctorIdAssigned', '');
      setDoctorIdSelected('');
      setDoctorRoleSelected('');
    } else {
      setDoctorIdSelected(valueDoctorIdAssigned);
      setDoctorRoleSelected(doctorUsersOptions.find((doctor) => doctor.value === valueDoctorIdAssigned).role);
      // getEventsOfWeek();
    }
    // getList(valueDoctorIdAssigned);
    setAllEditingItems([]);
  };

  // Establece el paciente seleccionado cuando la data se actualiza o leyendo el de la ruta
  useEffect(() => {
    const { id } = match.params;
    if (!id || id === 'all') {
      setPatientSelected(null);
    } else if (id !== patientSelected?.id) {
      // si hay un id del paciente
      getPatientValorationById(id)
        .then((resp) => {
          setPatientSelected(resp?.data);
        })
        .catch((err) => console.log(err));
    }
    if (dataUpdate) {
      setDataUpdate(false);
    }
    // if (currentWeek.length) {
    //   getEventsOfWeek();
    // }
    // eslint-disable-next-line
  }, [dataUpdate, setDataUpdate, match]); // personalView,

  // Establece la semana a mostrar cuando el primer dia cambia
  useEffect(() => {
    const daysOfWeek = doctorRoleSelected === 'Administrador' ? 6 : 5;
    setCurrentWeek(getCurrentWeek(startDayWeek, daysOfWeek));
    // eslint-disable-next-line
  }, [startDayWeek]);

  // Actualiza el Registro a actualizar SOLO Cuando se hace click en una casilla reservada
  useEffect(() => {
    if (dateEditingItem?.reserved) {
      setIdRegisterToEdit(dateEditingItem?.id);
    }
    // eslint-disable-next-line
  }, [dateEditingItem, setDateEditingItem]);

  // Muestra el modal para reagendar un horario reservado
  useEffect(() => {
    if (idRegisterToEdit) {
      toggleModalReagendarCita();
    }
    // eslint-disable-next-line
  }, [setIdRegisterToEdit, idRegisterToEdit]);

  // obtiene los eventos a mostrar cuando los dias de la semana se actualizan
  //  y el doctor es seleccionado
  useEffect(() => {
    if (currentWeek) {
      getEventsOfWeek();
    }
    // eslint-disable-next-line
  }, [currentWeek, doctorIdSelected]);

  useEffect(() => {
    const daysOfWeek = doctorRoleSelected === 'Administrador' ? 6 : 5;
    const weekStructureToUse = doctorRoleSelected === 'Administrador' ? scheduleSevenDaysWeekStructure : scheduleWeekStructure;
    setCurrentWeek(getCurrentWeek(startDayWeek, daysOfWeek));
    setScheduleWeekStructureDefault(weekStructureToUse);
  }, [doctorRoleSelected, startDayWeek]);

  // Actualiza los eventos de la semana en la pantalla
  useEffect(() => {
    updateCurrentWeekWithEvents();
    // eslint-disable-next-line
  }, [setEventsOfCurrentWeek, eventsOfCurrentWeek]);

  // En la primera carga, estable los doctores y pacientes del option seach en los formularios
  useEffect(() => {
    getAllUsersOptionsSearch().then((resp) => setDoctorUsersOptions(resp));
    getAllPatientsOptionsSearch().then((resp) => setPatientUsersOptions(resp));
    // eslint-disable-next-line
  }, []);

  // Actualiza el paciente cuando el tamaña de all cambia
  useEffect(() => {
    const { id } = match.params;
    if (allEditingItems[0]?.dateEditingItem?.scheduled) {
      getPatientValorationById(allEditingItems[0].dateEditingItem?.patientId)
        .then((resp) => {
          setPatientSelected(resp?.data);
          // setValue('frecuency', resp.data.)
        })
        .catch((err) => console.log(err));
    } else if (!id || id === 'all') {
      setPatientSelected(null);
    }
    // eslint-disable-next-line
  }, [allEditingItems]);

  useEffect(() => {
    if (dataSubmmited) {
      getEventsOfWeek();
    }
    setDataSubmitted(false);
    // eslint-disable-next-line
  }, [dataSubmmited]);

  // useEffect(() => {
  //   console.log({
  //     schedule: scheduleEditing,
  //     date: dateEditingItem,
  //   }, [scheduleEditing, dateEditingItem]);
  // });

  function checkEnter(e) {
    if ((e.keyCode || e.which || e.charCode) === 13) {
      e.preventDefault();
    }
  }

  const convertTime12to24 = (time12h) => {
    const [time, modifier] = time12h.split(' ');

    // eslint-disable-next-line
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
  };

  const saveDate = async (schedule) => {
    const { dateEditingItem } = schedule;
    const scheduleEditing = schedule.scheduleEditingData;
    const data = getValuesDate();
    let twelveHours;
    // eslint-disable-next-line
    let time;
    // eslint-disable-next-line
    let timestamp;

    if (scheduleEditing) {
      twelveHours = scheduleEditing?.schedule.schedule
        .split('-')[0]
        .replace('am', ' AM');
      twelveHours = twelveHours?.replace('pm', ' PM');
      time = convertTime12to24(twelveHours);
      timestamp = Math.round(
        new Date(`${scheduleEditing?.dateFull} ${time}`).getTime() / 1000,
      );
    }

    if (patientSelected) {
      data.patientId = patientSelected.id;
    }
    if (!doctorIdSelected) {
      setAlert({
        status: true,
        text: 'Consulta el horario de un doctor para continuar',
        color: 'red',
      });
      setTimeout(() => setAlert({ ...alert, status: false }), 2500);
      return;
    }
    if (!dateEditingItem && !data?.frecuency) {
      //
      setAlert({
        status: true,
        text: 'Seleccione la frecuencia',
        color: 'red',
      });
      setTimeout(() => setAlert({ ...alert, status: false }), 2500);
      return;
    }
    if (!dateEditingItem && !patientSelected && !data?.patientId) {
      //
      setAlert({ status: true, text: 'Selecciona el paciente', color: 'red' });
      setTimeout(() => setAlert({ ...alert, status: false }), 2500);
      return;
    }
    if (!scheduleEditing) {
      setAlert({
        status: true,
        text: 'Selecciona un horario para continuar',
        color: 'red',
      });
      setTimeout(() => setAlert({ ...alert, status: false }), 2500);
      return;
    }

    const horarioOcupado = scheduleEditing.schedule[scheduleEditing?.dayWeek].scheduled
      || scheduleEditing.schedule[scheduleEditing?.dayWeek].reserved;
    // const existeHorario = datesEditingNow.findIndex((date) => date.weekDates[0].schedule === scheduleEditing?.schedule?.schedule && date.weekDates[0].day?.value === scheduleEditing?.dayWeek);
    const existeHorario = dateEditingItem?.weekDates[0].schedule
        === scheduleEditing?.schedule?.schedule
      && dateEditingItem.weekDates[0].day?.value === scheduleEditing?.dayWeek;
    if (!dateEditingItem && (horarioOcupado || existeHorario)) {
      //  (horarioOcupado || existeHorario !== -1)
      setAlert({
        status: true,
        text: 'El horario ya está ocupado',
        color: 'red',
      });
      setTimeout(() => setAlert({ ...alert, status: false }), 4000);
      return;
    }

    const patientIdAssingned = data?.patientId?.trim()
      ? data?.patientId
      : dateEditingItem?.patientId;

    const dataNewDate = {
      ...data,
      doctorIdAssigned: doctorIdSelected,
      patientId: patientIdAssingned,
      doctorIdCreated: userData.id,
      isFirstDate: false,
      arrivedToDate: false,
      arrivedState: 'Sin confirmar',
      weekDates: [
        {
          day: {
            value: scheduleEditing?.dayWeek,
            name: getDayNameByNumber(scheduleEditing?.dayWeek),
          },
          schedule: scheduleEditing?.schedule?.schedule,
          doctorIdAssigned: doctorIdSelected,
        },
      ],
      dateShort: scheduleEditing.date,
      uuid: uuidv4(),
    };
    // Buscar el nombre del nuevo paciente
    const patientData = patientUsersOptions?.find(
      (pat) => pat?.value === dataNewDate?.patientId,
    );
    const patientName = getShortNameFormat(patientData?.name);
    if (dateEditingItem) {
      // si está editando, se reemplaza
      if (data.updatealldates === 'si' && dateEditingItem?.uuidDateGroup) {
        deleteDatesByUuidGroup(dateEditingItem?.uuidDateGroup)
          .then(() => {
            setAlert({
              status: true,
              text: 'Citas actualizadas con éxito',
              color: 'green',
            });
            // Actualizar el calendario con la nueva información
            scheduleWeekStructureDefault.forEach((sch) => {
              if (sch.schedule === dataNewDate.weekDates[0].schedule) {
                sch[dataNewDate.weekDates[0].day.value] = {};
              }
            });
            setScheduleEditing(null);
            setDateEditingItem(null);
            setAllEditingItems([]);
            resetDate(DatesType);
            setDataUpdate(true);
            setDataSubmitted(true);
            setTimeout(() => {
              setAlert({ ...alert, status: false });
            }, 2500);
          })
          .catch((error) => {
            setAlert({ status: true, text: error.message, color: 'red' });
            setTimeout(() => setAlert({ ...alert, status: false }), 5000);
          });
      } else if (data.updatealldates === 'no') {
        // editar solo la cita actual
        await deleteDateById(dateEditingItem.id)
          // await updateDateById(dateEditingItem.id, dataNewDate)
          .then(() => {
            setAlert({
              status: true,
              text: 'Citas actualizadas con éxito',
              color: 'green',
            });
            if (
              dateEditingItem?.weekDates[0].schedule
                !== dataNewDate?.weekDates[0].schedule
              || dateEditingItem?.weekDates[0].day?.value
                !== dataNewDate?.weekDates[0].day?.value
            ) {
              scheduleWeekStructureDefault.forEach((sch) => {
                if (sch.schedule === dataNewDate?.weekDates[0].schedule) {
                  sch[dataNewDate?.weekDates[0].day?.value].isEditing = false;
                  sch[dataNewDate?.weekDates[0].day?.value].scheduled = false;
                }
              });
            }
            // Actualizar el calendario con la nueva información
            scheduleWeekStructureDefault.forEach((sch) => {
              if (sch.schedule === dataNewDate.weekDates[0].schedule) {
                sch[dataNewDate.weekDates[0].day.value].data = {};
                sch[dataNewDate?.weekDates[0].day?.value].isEditing = false;
                sch[dataNewDate?.weekDates[0].day?.value].scheduled = false;
              }
            });
            setScheduleEditing(null);
            setDateEditingItem(null);
            setAllEditingItems([]);
            resetDate(DatesType);
            setDataUpdate(true);
            setDataSubmitted(true);
            setTimeout(() => {
              setAlert({ ...alert, status: false });
            }, 2500);
          })
          .catch((error) => {
            setAlert({ status: true, text: error.message, color: 'red' });
            setTimeout(() => setAlert({ ...alert, status: false }), 5000);
          });
      }
    } else {
      await createDate(dataNewDate)
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          // sendNotificationCreate(userData.id, 'date');
          // sendNotificationToAdmins('date');
          sendMultipleAppoiments(doctorIdSelected, patientData?.name, 'date');
          // sendReminder(doctorIdSelected, Number(dataNewDate.frecuency), timestamp);
          // if (setDataUpdate) setDataUpdate(true);
          scheduleWeekStructureDefault.forEach((sch) => {
            if (sch.schedule === dataNewDate.weekDates[0].schedule) {
              sch[dataNewDate.weekDates[0].day.value].isEditing = false;
              sch[dataNewDate.weekDates[0].day.value].scheduled = true;
              sch[dataNewDate.weekDates[0].day.value].data = {
                ...dataNewDate,
                patientName,
              };
            }
          });
          // setIsLoading(false);
          setScheduleEditing(null);
          // scheduleWeekStructureDefault = scheduleWeekStructure;
          resetDate(DatesType);
          setDataUpdate(true);
          setDataSubmitted(true);
          setTimeout(() => {
            setAlert({ ...alert, status: false });
          }, 2500);
        })
        .catch((error) => {
          setAlert({ status: true, text: error.message, color: 'red' });
          setTimeout(() => setAlert({ ...alert, status: false }), 5000);
        });
    }
  };

  const multipleAppointments = () => {
    if (allEditingItems.length > 0) {
      allEditingItems.forEach((item) => saveDate(item));
    } else {
      saveDate({ dateEditingItem, scheduleEditing });
    }
    setAllEditingItems([]);
  };

  // manejar cuando se hace click en un espacio
  const clickScheduleSpace = (dayNumber, schedule, scheduleId) => {
    // setIsLoading(true);
    const scheduleEditingData = {
      ...currentWeek[dayNumber],
      id: `${scheduleId}-${dayNumber}`,
      schedule,
    };
    // let libre = true;
    let dateCurrentEditingItem = null;
    let editing = false;

    const ningunoEditandose = allEditingItems.every(
      (item) => !item?.dateEditingItem?.reserved
        && !item?.dateEditingItem?.scheduled
        && !item?.editing,
    );

    if (ningunoEditandose) {
      // Itera a traves de los horarios
      if (schedule[dayNumber].scheduled) {
        // establecer datos del item editando actualmente a scheluded
        dateCurrentEditingItem = {
          ...schedule[scheduleEditingData?.dayWeek]?.data,
          reserved: false,
          scheduled: true,
          editing: false,
        };
        console.log(dateCurrentEditingItem.frecuency);
        console.log(allEditingItems);
        setValueDate('frecuency', dateCurrentEditingItem.frecuency);
        setValueDate('patientId', dateCurrentEditingItem.patientId);
      } else if (schedule[dayNumber].reserved) {
        // establecer datos del item editando actualmente a reserved
        dateCurrentEditingItem = {
          ...schedule[scheduleEditingData?.dayWeek]?.data,
          reserved: true,
          scheduled: false,
          editing: false,
        };
      } else {
        editing = true;
        schedule[dayNumber].isEditing = true;
        // dateCurrentEditingItem = {
        //   ...schedule[scheduleEditingData?.dayWeek]?.data,
        //   reserved: false,
        //   scheduled: false,
        //   editing: true,
        // };
      }
      setDateEditingItem(dateCurrentEditingItem);
      setScheduleEditing(scheduleEditingData);
      setAllEditingItems(
        allEditingItems.concat({
          dateEditingItem: dateCurrentEditingItem,
          scheduleEditingData,
          editing,
        }),
      );
    } else {
      const actualizando = allEditingItems.some(
        (item) => item?.dateEditingItem?.reserved || item?.dateEditingItem?.scheduled,
      );
      if (schedule[scheduleEditingData?.dayWeek]?.data?.frecuency && allEditingItems.length > 0) {
        setValueDate('frecuency', '');
        console.log('condicion ocurre');
      }
      if (!actualizando) {
        if (
          !schedule[dayNumber].isEditing
          && !schedule[dayNumber].reserved
          && !schedule[dayNumber].scheduled
        ) {
          editing = true;
          schedule[dayNumber].isEditing = true;
          // dateCurrentEditingItem = {
          //   ...schedule[dayNumber]?.data,
          //   reserved: false,
          //   scheduled: false,
          //   editing: true,
          // }
          setDateEditingItem(dateCurrentEditingItem);
          setScheduleEditing(scheduleEditingData);
          setAllEditingItems(
            allEditingItems.concat({
              dateEditingItem: dateCurrentEditingItem,
              scheduleEditingData,
              editing,
            }),
          );
        } else if (schedule[dayNumber].isEditing) {
          editing = true;
          schedule[dayNumber].isEditing = false;
          // dateCurrentEditingItem = {
          //   ...schedule[dayNumber]?.data,
          //   reserved: schedule[dayNumber].reserved,
          //   scheduled: schedule[dayNumber].scheduled,
          //   editing: false,
          // }
          const filtered = allEditingItems.filter((item) => {
            return item.scheduleEditingData.id !== scheduleEditingData.id;
          });
          setAllEditingItems(filtered);
          setScheduleEditing(scheduleEditingData);
        }
      } else if (allEditingItems[0].dateEditingItem.scheduled) {
        if (
          !schedule[dayNumber].isEditing
            && !schedule[dayNumber].scheduled
            && !schedule[dayNumber].reserved
        ) {
          const copy = Array.from(allEditingItems);
          if (copy.length >= 2) {
            const [one, two] = scheduleEditing?.id.split('-');
            copy.pop();
            scheduleWeekStructureDefault[one][two].isEditing = false;
          }

          editing = true;
          schedule[dayNumber].isEditing = true;
          copy.push({
            dateEditingItem: dateCurrentEditingItem,
            scheduleEditingData,
            editing,
          });
          setDateEditingItem(dateCurrentEditingItem);
          setScheduleEditing(scheduleEditingData);
          setAllEditingItems(copy);
        } else {
          const [one, two] = scheduleEditing?.id.split('-');
          scheduleWeekStructureDefault[one][two].isEditing = false;
          setScheduleEditing(null);
          setDateEditingItem(null);
          setAllEditingItems([]);
        }
      } else {
        setScheduleEditing(null);
        setDateEditingItem(null);
        setAllEditingItems([]);
      }
    }
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap" className="appointments-v2">
        <Container fluid>
          <Row>
            <Col xs="12" md="9">
              <p className="title">Citas programadas para el terapeuta</p>
            </Col>
            <Col xs="12" md="3" className="btn-column">
              {/* <Button color="" className="btn-custom" onClick={changeTypeView}>
                {personalView ? 'Horario general' : 'Horario personal'}
              </Button> */}
              <Button
                color=""
                className="btn-custom"
                onClick={toggleModalReserveDate}
              >
                Reservar horario
              </Button>
              {/* <Button color="" className="btn-custom" onClick={toggleModalCita}>
                Agendar cita
              </Button> */}
            </Col>
          </Row>
          <Row className="container-data">
            {
              doctorRoleSelected !== 'Administrador' ? (
                <Col xs="12" md="6" lg="7" className="col-calendar">
                  <Row>
                    <Col xs="12" className="text-center">
                      <h2>{getCurrentMonthYearText()}</h2>
                    </Col>
                    <Col xs="12" className="text-center">
                      <input
                        type="date"
                        title="Semana a escoger"
                        onChange={(e) => {
                          const newStartDay = moment(e?.target?.value)
                            .startOf('week')
                            .format('YYYY-MM-DD');
                          if (newStartDay !== startDayWeek) {
                            setStartDayWeek(newStartDay);
                          }
                        }}
                        style={{ color: 'var(--blue-one)' }}
                        defaultValue={startDayWeek}
                      />
                    </Col>
                  </Row>
                  <Row className="row row-schedule-title">
                    <Col xs="2" className="col">
                      <small>Horario</small>
                    </Col>
                    <Col xs="10">
                      <Row className="row">
                        {currentWeek.map((day) => (
                          <Col xs="2" className="col" key={day.date}>
                            <p>{day.date}</p>
                          </Col>
                        ))}
                      </Row>
                    </Col>
                  </Row>
                  {scheduleWeekStructureDefault.map((schedule, idx) => (
                    <Row className="row row-schedule" key={schedule.schedule}>
                      <Col xs="2" className="col">
                        {/* Rango horario (HH:MM:TT - HH:MM:TT) */}
                        <small>{schedule.schedule}</small>
                      </Col>
                      <Col xs="10">
                        <Row className="row-date">
                          {/* Dias en el rango horario */}
                          <Col
                            xs="2"
                            className="col col-date"
                            onClick={() => clickScheduleSpace(0, schedule, idx)}
                          >
                            {schedule['0'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${0}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['0'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['0'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${0}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['0'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['0'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            xs="2"
                            className="col col-date"
                            onClick={() => clickScheduleSpace(1, schedule, idx)}
                          >
                            {schedule['1'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${1}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['1'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['1'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${1}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['1'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['1'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            xs="2"
                            className="col col-date"
                            onClick={() => clickScheduleSpace(2, schedule, idx)}
                          >
                            {schedule['2'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${2}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['2'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['2'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${2}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['2'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['2'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            xs="2"
                            className="col col-date"
                            onClick={() => clickScheduleSpace(3, schedule, idx)}
                          >
                            {schedule['3'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${3}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['3'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['3'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${3}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['3'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['3'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            xs="2"
                            className="col col-date"
                            onClick={() => clickScheduleSpace(4, schedule, idx)}
                          >
                            {schedule['4'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${4}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['4'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['4'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${4}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['4'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['4'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            xs="2"
                            className="col col-date"
                            onClick={() => clickScheduleSpace(5, schedule, idx)}
                          >
                            {schedule['5'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${5}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['5'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['5'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${5}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['5'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['5'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ))}
                </Col>
              ) : (
                <Col xs="12" md="6" lg="7" className="col-calendar">
                  <Row>
                    <Col xs="12" className="text-center">
                      <h2>{getCurrentMonthYearText()}</h2>
                    </Col>
                    <Col xs="12" className="text-center">
                      <input
                        type="date"
                        title="Semana a escoger"
                        onChange={(e) => {
                          const newStartDay = moment(e?.target?.value)
                            .startOf('week')
                            .format('YYYY-MM-DD');
                          if (newStartDay !== startDayWeek) {
                            setStartDayWeek(newStartDay);
                          }
                        }}
                        style={{ color: 'var(--blue-one)' }}
                        defaultValue={startDayWeek}
                      />
                    </Col>
                  </Row>
                  <Row className="row row-schedule-title">
                    <Col xs="2" className="col">
                      <small>Horario</small>
                    </Col>
                    <Col xs="10">
                      <Row className="row">
                        {currentWeek.map((day) => (
                          <Col className="col col-title-seven" key={day.date}>
                            <p>{day.date}</p>
                          </Col>
                        ))}
                      </Row>
                    </Col>
                  </Row>
                  {scheduleWeekStructureDefault.map((schedule, idx) => (
                    <Row className="row row-schedule" key={schedule.schedule}>
                      <Col xs="2" className="col">
                        {/* Rango horario (HH:MM:TT - HH:MM:TT) */}
                        <small>{schedule.schedule}</small>
                      </Col>
                      <Col xs="10">
                        <Row className="row-date">
                          {/* Dias en el rango horario */}
                          <Col
                            className="col col-date date-seven"
                            onClick={() => clickScheduleSpace(0, schedule, idx)}
                          >
                            {schedule['0'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${0}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['0'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['0'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${0}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['0'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['0'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            className="col col-date date-seven"
                            onClick={() => clickScheduleSpace(1, schedule, idx)}
                          >
                            {schedule['1'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${1}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['1'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['1'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${1}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['1'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['1'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            className="col col-date date-seven"
                            onClick={() => clickScheduleSpace(2, schedule, idx)}
                          >
                            {schedule['2'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${2}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['2'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['2'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${2}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['2'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['2'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            className="col col-date date-seven"
                            onClick={() => clickScheduleSpace(3, schedule, idx)}
                          >
                            {schedule['3'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${3}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['3'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['3'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${3}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['3'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['3'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            className="col col-date date-seven"
                            onClick={() => clickScheduleSpace(4, schedule, idx)}
                          >
                            {schedule['4'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${4}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['4'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['4'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${4}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['4'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['4'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            className="col col-date date-seven"
                            onClick={() => clickScheduleSpace(5, schedule, idx)}
                          >
                            {schedule['5'].scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${5}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['5'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['5'].reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${5}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['5'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['5'].isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                          <Col
                            className="col col-date date-seven"
                            onClick={() => clickScheduleSpace(6, schedule, idx)}
                          >
                            {schedule['6']?.scheduled && (
                            <div
                              className={`txt-reservado ${
                              allEditingItems[0]?.dateEditingItem?.scheduled
                              && allEditingItems[0]?.scheduleEditingData?.id
                                === `${idx}-${6}`
                                ? 'txt-active'
                                : ''
                              }`}
                            >
                              <span>{schedule['6'].data?.patientName}</span>
                            </div>
                            )}
                            {schedule['6']?.reserved && (
                            <div
                              className={`txt-reservado ${
                              dateEditingItem?.reserved
                              && scheduleEditing?.id === `${idx}-${5}`
                                ? 'txt-active'
                                : ''
                              }`}
                              title={schedule['6'].data?.reason}
                            >
                              <span>Reservado</span>
                            </div>
                            )}
                            {schedule['6']?.isEditing && (
                            <div className="txt-actual">
                              <span>Editando</span>
                            </div>
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  ))}
                </Col>
              )
            }
            <Col xs="12" md="6" lg="5" className="col-list">
              {alert.status ? (
                <CustomAlert text={alert.text} color={alert.color} />
              ) : null}
              {isLoading && (
                <>
                  <Spinner />
                  <p>Cargando...</p>
                </>
              )}
              {!personalView && (
                <Form
                  onSubmit={handleSubmit(searchDoctorLists)}
                  className="form-new-date"
                >
                  <Row>
                    {dateEditingItem && dateEditingItem?.reserved && (
                      <Col xs="12">
                        <p className="txt-pink">
                          <strong>Motivo de la reservación:</strong>{' '}
                          {dateEditingItem?.reason}.
                        </p>
                      </Col>
                    )}
                    <Col xs="12">
                      <InputFormGroup
                        name="doctorIdAssigned"
                        label="Terapeuta"
                        type="select"
                        inputSearch
                        errors={errors.doctorIdAssigned}
                        control={control}
                        labelSizeSm={12}
                        inputSizeSm={12}
                        labelSize={4}
                        inputSize={7}
                        placeHolder="Buscar terapeuta"
                        // getOptions={getUsersByUsernameOptionsSearch}
                        required={false}
                        search={false}
                        options={doctorUsersOptions}
                      />
                    </Col>
                    <Col xs="12">
                      <Button
                        color=""
                        className="btn-custom"
                        type="submit"
                        title="buscar"
                      >
                        <i className="fa fa-search" /> Buscar
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
              <Form
                onKeyDown={checkEnter}
                onSubmit={handleSubmitDate(multipleAppointments)}
                className="form-new-date"
              >
                <Row>
                  <Col xs="12">
                    {allEditingItems.length > 0 ? (
                      <div>
                        <h5>
                          <strong className="subtitle">
                            Horarios Seleccionados:
                          </strong>
                        </h5>
                        <ul className="p-1">
                          {allEditingItems.map((item, idx) => {
                            return (
                              <li key={`editing${item?.scheduleEditingData?.date}${item?.scheduleEditingData?.schedule?.schedule}`}>
                                <strong>{`${item?.scheduleEditingData?.date} - ${item?.scheduleEditingData?.schedule?.schedule}`}</strong>
                                {allEditingItems[0]?.dateEditingItem
                                  ?.scheduled
                                  && allEditingItems.length >= 2
                                  && idx === 0 && (
                                    <p className="txt-pink">
                                      Se sustituirá por
                                    </p>
                                  )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : dateEditingItem ? (
                      <h5>
                        <strong className="subtitle">{`Editando el horario ${dateEditingItem?.schedule}`}</strong>
                      </h5>
                    ) : (
                      <h5>
                        <strong className="subtitle">
                          Horario no seleccionado
                        </strong>
                      </h5>
                    )}
                  </Col>
                  <Col xs="12">
                    {patientSelected ? (
                      <Label>
                        <span style={{ fontWeight: '500' }}>
                          Nombre del paciente
                        </span>
                        <span style={{ color: '#000' }}>
                          {` ${patientSelected?.general?.name}`
                            || 'Cargando...'}
                        </span>
                      </Label>
                    ) : (
                      <InputFormGroup
                        name="patientId"
                        label="Nombre del paciente"
                        type="select"
                        inputSearch
                        control={controlDate}
                        errors={errorsDate?.patientId}
                        register={register}
                        labelSizeSm={12}
                        inputSizeSm={12}
                        labelSize={4}
                        inputSize={7}
                        placeHolder="Buscar paciente"
                        getOptions={getPatientByNameOptionsSearch}
                      />
                    )}
                  </Col>
                  <Col xs="12">
                    <InputFormGroup
                      name="frecuency"
                      label="Frecuencia"
                      type="select"
                      inputSearch
                      control={controlDate}
                      errors={errorsDate?.frecuency}
                      labelSizeSm={12}
                      inputSizeSm={12}
                      labelSize={4}
                      inputSize={7}
                      placeHolder="Seleccionar frecuencia"
                      search={false}
                      options={frecuencyOptions}
                    />
                  </Col>
                  {allEditingItems[0]?.dateEditingItem && (
                    <Col xs="12">
                      <InputFormGroup
                        name="updatealldates"
                        label="Afectar la serie"
                        type="select"
                        inputSearch
                        control={controlDate}
                        errors={errorsDate?.updatealldates}
                        labelSize={4}
                        inputSize={7}
                        placeHolder="Seleccionar"
                        search={false}
                        options={yesNoOptions}
                      />
                    </Col>
                  )}
                  {allEditingItems[0]?.dateEditingItem
                    && allEditingItems[0]?.dateEditingItem?.scheduled
                    && allEditingItems.length === 1 && (
                      <Col xs="12">
                        <p className="txt-pink">
                          Para actualizar la cita, seleccione otro horario.
                        </p>
                      </Col>
                    )}
                  <Col xs="12" className="submit-btn-container">
                    <Button
                      className={`btn-custom ${
                        dateEditingItem?.scheduled ? 'btn-important' : ''
                      }`}
                      color=""
                      type="submit"
                    >
                      {dateEditingItem?.reserved
                      || allEditingItems[0]?.dateEditingItem?.scheduled
                        ? allEditingItems.length === 1
                          ? 'Borrar'
                          : 'Actualizar'
                        : 'Crear'}
                    </Button>
                    {/* disabled={!datesEditingFormat.length} */}
                  </Col>
                </Row>
              </Form>

              {/* {isLoading ? (
                <>
                  <Spinner />
                  <p>Cargando...</p>
                </>
              ) : (
                citasList.map((item) => (
                  <RowCitas
                    key={item.id}
                    dateData={item}
                    personalView={personalView}
                    deleteItem={deleteItem}
                    editRegister={editRegister}
                  />
                ))
              )} */}
              {/* {!isLoading && citasList.length === 0 && (
                <h4 className="subtitle">No hay citas programadas</h4>
              )} */}
            </Col>
          </Row>
        </Container>

        <ModalReserveDate
          show={modalReserveIsOpen}
          close={toggleModalReserveDate}
          setDataUpdate={setDataUpdate}
          setIdRegisterToNull={setIdRegisterToNull}
        />
        <ModalRescheduleReserveDate
          show={modalReagendarCitaIsOpen}
          close={toggleModalReagendarCita}
          idRegisterToEdit={idRegisterToEdit}
          setIdRegisterToNull={setIdRegisterToNull}
          setDataUpdate={setDataUpdate}
        />
      </div>
    </>
  );
};

Appointmentv2.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default authHOC(Appointmentv2, [
  'Administrador',
  'Editor',
  'Colaborador',
]);
