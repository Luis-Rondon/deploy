import React, { useState, useEffect, useContext } from 'react';
import {
  Row, Col, Container, Button, Spinner,
} from 'reactstrap';
import confirm from 'reactstrap-confirm';
import PropTypes from 'prop-types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import Form from 'reactstrap/lib/Form';
import authHOC from '../utils/authHOC';
import UserData from '../context/UserData';
import { getCurrentDate } from '../utils/formulas';
import {
  getAllDatesReservationsByDoctorDate,
  getAllDatesReservationsByAllDate,
  deleteDateById,
  getAllDatesByDoctorMonth,
  getAllReservationsByDoctorMonth,
  getAllReservationsByOfficeMonth,
  getAllDatesByOfficeMonth,
} from '../actions/DatesAction';
import { deleteReservationById } from '../actions/ReservesAction';
import { sendNotificationCreate } from '../firebase/oneSignal';
import Menu from '../common/Menu';
import Navbar from '../common/Navbar';
import CustomAlert from '../common/CustomAlert';
import RowCitas from '../components/RowCitas';
import ModalReserveDate from '../components/ModalReserveDate';
import AgendarCitaModal from '../components/AgendarCitaModal';
import ReagendarCitaModal from '../components/ReagendarCitaModal';
import ModalRescheduleReserveDate from '../components/ModalRescheduleReserveDate';
import '../styles/appointments.scss';
import InputFormGroup from '../common/InputFormGroup';
import { getUsersByUsernameOptionsSearch } from '../actions/UserAction';

const Appointment = ({ history }) => {
  const [alert, setAlert] = useState({ status: false, text: 'asd', color: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [modalCitaIsOpen, setModalCitaIsOpen] = useState(false);
  const [modalReagendarCitaIsOpen, setModalReagendarCitaIsOpen] = useState(false);
  const [modalReserveIsOpen, setModalReserveIsOpen] = useState(false);
  const [modalRescheduleReserveIsOpen, setModalRescheduleReserveIsOpen] = useState(false);

  const [personalView, setPersonalView] = useState(true);
  const [dateSelected, setDateSelected] = useState(getCurrentDate());
  const [citasList, setCitasList] = useState([]);
  const [eventsOfCurrentMonth, setEventsOfCurrentMonth] = useState([]);
  const [idRegisterToEdit, setIdRegisterToEdit] = useState(null);
  const [dataUpdate, setDataUpdate] = useState(false);

  const { userData } = useContext(UserData);

  const {
    handleSubmit, errors, control, watch, setValue,
  } = useForm({
    defaultValues: {
      doctorIdAssigned: null,
    },
  });

  const toggleModalCita = () => setModalCitaIsOpen((prevState) => !prevState);
  const toggleModalReagendarCita = () => setModalReagendarCitaIsOpen((prevState) => !prevState);
  const toggleModalReserveDate = () => setModalReserveIsOpen((prevState) => !prevState);
  // eslint-disable-next-line max-len
  const toggleModalRescheduleReserveDate = () => setModalRescheduleReserveIsOpen((prevState) => !prevState);

  const changeTypeView = async () => {
    await setPersonalView((prevState) => !prevState);
  };
  const setIdRegisterToNull = () => setIdRegisterToEdit(null);

  const dateClick = (arg) => setDateSelected(arg.dateStr);

  const editRegister = (idRegister, type) => {
    setIdRegisterToEdit(idRegister);
    if (type === 'date') {
      toggleModalRescheduleReserveDate();
    } else if (type === 'reservation') {
      toggleModalReagendarCita();
    }
  };

  const getEventsOfMonth = async (event) => {
    const currentDate = event
      ? moment(event.start).add(10, 'days').format('YYYY-MM-DD')
      : dateSelected;
    let events = [];
    if (personalView) {
      await getAllDatesByDoctorMonth(userData.id, currentDate)
        .then((resp) => {
          events = resp;
          return getAllReservationsByDoctorMonth(userData.id, currentDate);
        })
        .then((resp) => {
          setEventsOfCurrentMonth(events.concat(resp));
        })
        .catch(() => {
          setEventsOfCurrentMonth([]);
        });
    } else {
      const doctorId = watch('doctorIdAssigned');
      if (doctorId) {
        await getAllDatesByDoctorMonth(doctorId, currentDate)
          .then((resp) => {
            events = resp;
            return getAllReservationsByDoctorMonth(doctorId, currentDate);
          })
          .then((resp) => {
            setEventsOfCurrentMonth(events.concat(resp));
          })
          .catch(() => {
            setEventsOfCurrentMonth([]);
          });
      } else {
        await getAllDatesByOfficeMonth(currentDate)
          .then((resp) => {
            events = resp;
            return getAllReservationsByOfficeMonth(currentDate);
          })
          .then((resp) => {
            setEventsOfCurrentMonth(events.concat(resp));
          })
          .catch(() => {
            setEventsOfCurrentMonth([]);
          });
      }
    }
  };

  const getList = async (doctorId) => {
    setIsLoading(true);
    if (personalView) {
      await getAllDatesReservationsByDoctorDate(userData.id, dateSelected)
        .then((data) => {
          setCitasList(data);
          getEventsOfMonth();
        })
        .catch(() => setCitasList([]));
    } else if (doctorId) {
      await getAllDatesReservationsByDoctorDate(doctorId, dateSelected)
        .then((data) => {
          setCitasList(data);
          getEventsOfMonth();
        })
        .catch(() => setCitasList([]));
    } else {
      await getAllDatesReservationsByAllDate(dateSelected)
        .then((data) => {
          setCitasList(data);
          getEventsOfMonth();
        })
        .catch(() => setCitasList([]));
    }
    setIsLoading(false);
  };

  const searchDoctorLists = async (data) => {
    const valueDoctorIdAssigned = data?.doctorIdAssigned?.trim();
    if (!valueDoctorIdAssigned) {
      setValue('doctorIdAssigned', '');
    }
    getList(valueDoctorIdAssigned);
  };

  useEffect(() => {
    setIsLoading(true);
    searchDoctorLists();
    // getList();
    if (dataUpdate) {
      setDataUpdate(false);
    }
    // eslint-disable-next-line
  }, [personalView, dateSelected, dataUpdate]);

  useEffect(() => {
    getEventsOfMonth();
    // eslint-disable-next-line
  }, [personalView]);

  const toggleVisibleCalendar = () => {
    document
      .getElementsByClassName('fc-toolbar-chunk')[2]
      .classList.toggle('is-visible-calendar');
    document
      .getElementsByClassName('fc-view-harness')[0]
      .classList.toggle('is-visible-calendar');
  };

  useEffect(() => {
    document
      .getElementsByClassName('fc-toolbar-title')[0]
      .addEventListener('click', toggleVisibleCalendar);
    // cleanup this component
    return () => {
      document
        .getElementsByClassName('fc-toolbar-chunk')[0]
        .removeEventListener('keydown', toggleVisibleCalendar);
    };
  }, []);


  const deleteItem = async (idItem, type) => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message:
        'Esta acción no se puede deshacer. Se borrará permanentemente el registro',
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });
    if (result === false) return;
    setAlert({
      status: true,
      text: 'Eliminando registro...',
      color: 'blue-one',
    });
    if (type === 'reservation') {
      deleteReservationById(idItem)
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          sendNotificationCreate(userData.id, 'deleteDate');
          setDataUpdate(true);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'green' }));
    }
    if (type === 'date') {
      deleteDateById(idItem)
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          setDataUpdate(true);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'green' }));
    }
    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 4000);
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap" className="appointments">
        <Container fluid>
          <Row>
            <Col xs="12" md="6">
              <p className="title">
                Citas programadas para el
                {' '}
                {personalView ? ' terapeuta' : ' consultorio'}
              </p>
            </Col>
            <Col xs="12" md="6" className="btn-column">
              <Button color="" className="btn-custom" onClick={changeTypeView}>
                {personalView ? 'Horario general' : 'Horario personal'}
              </Button>
              <Button
                color=""
                className="btn-custom"
                onClick={toggleModalReserveDate}
              >
                Reservar horario
              </Button>
              <Button color="" className="btn-custom" onClick={toggleModalCita}>
                Agendar cita
              </Button>
            </Col>
          </Row>
          {!personalView && (
            <Form
              onSubmit={handleSubmit(searchDoctorLists)}
              className="calculator-sg-form"
            >
              <Row>
                <Col xs="10" md="4">
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
                    inputSize={8}
                    placeHolder="Buscar terapeuta"
                    getOptions={getUsersByUsernameOptionsSearch}
                    required={false}
                  />
                </Col>
                <Col xs="2">
                  <Button color="" className="btn-custom" type="submit">
                    <i className="fa fa-search" />
                  </Button>
                </Col>
              </Row>
            </Form>
          )}

          <Row className="container-data">
            <Col xs="12" md="5" lg="4" className="col-calendar">
              <FullCalendar
                buttonText={{ today: 'Hoy' }}
                timeZone="America/Mexico_City"
                fixedWeekCount={false}
                locale="esLocale"
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                dateClick={dateClick}
                selectable
                editable={false}
                unselectAuto={false}
                events={eventsOfCurrentMonth}
                datesSet={getEventsOfMonth}
              />
            </Col>
            <Col xs="12" md="7" lg="8" className="col-list">
              {alert.status ? (
                <CustomAlert text={alert.text} color={alert.color} />
              ) : null}
              <p className="subtitle-global">
                {`Citas agendadas y ausencias del día ${dateSelected
                  .split('-')
                  .reverse()
                  .join('-')}`}
              </p>
              {isLoading ? (
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
              )}
              {!isLoading && citasList.length === 0 && (
                <h4 className="subtitle">No hay citas programadas</h4>
              )}
            </Col>
          </Row>
        </Container>
        <ModalReserveDate
          show={modalReserveIsOpen}
          close={toggleModalReserveDate}
          setDataUpdate={setDataUpdate}
        />
        <AgendarCitaModal
          show={modalCitaIsOpen}
          close={toggleModalCita}
          setDataUpdate={setDataUpdate}
        />
        <ModalRescheduleReserveDate
          show={modalReagendarCitaIsOpen}
          close={toggleModalReagendarCita}
          idRegisterToEdit={idRegisterToEdit}
          setIdRegisterToNull={setIdRegisterToNull}
          setDataUpdate={setDataUpdate}
        />
        <ReagendarCitaModal
          show={modalRescheduleReserveIsOpen}
          close={toggleModalRescheduleReserveDate}
          idRegisterToEdit={idRegisterToEdit}
          setIdRegisterToNull={setIdRegisterToNull}
          setDataUpdate={setDataUpdate}
        />
      </div>
    </>
  );
};

Appointment.propTypes = {
  history: PropTypes.object.isRequired,
};

export default authHOC(Appointment, ['Administrador', 'Editor', 'Colaborador']);
