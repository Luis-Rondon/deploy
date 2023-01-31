import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Form, Button,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import autosize from 'autosize';
import UserData from '../context/UserData';
import { getCurrentDate } from '../utils/formulas';
import { DatesType } from '../models/DatesType';
import {
  updateDateById,
  getDateById,
  getAllDateSchedulesFreeOptionsSearch,
} from '../actions/DatesAction';
import { getAllUsersOptionsSearch } from '../actions/UserAction';
import { getAllPatientsOptionsSearch } from '../actions/PatientAction';
import { getAllReserveAllDayByDoctorDate } from '../actions/ReservesAction';
import CustomAlert from '../common/CustomAlert';
import InputFormGroup from '../common/InputFormGroup';
import '../styles/modalCreateDate.scss';
import { sendNotificationCreate } from '../firebase/oneSignal';

const ReagendarCitaModal = ({
  close,
  show,
  idRegisterToEdit,
  setIdRegisterToNull,
  setDataUpdate,
}) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [isFirstDate, setIsFirstDate] = useState(false);
  const [scheduleOptions, setScheduleOptions] = useState([
    { name: 'Llena los campos', value: '' },
  ]);
  const [doctorOptions, setDoctorOptions] = useState([
    { name: 'Cargando...', value: '' },
  ]);
  const [patientOptions, setPatientOptions] = useState([
    { name: 'Cargando...', value: '' },
  ]);
  const [currentSchedule, setCurrentSchedule] = useState('');

  const { userData } = useContext(UserData);

  useEffect(() => {
    autosize(document.getElementsByClassName('input-auto-heigth'));
  }, []);

  const {
    register, handleSubmit, errors, reset, control, watch, setValue,
  } = useForm({ defaultValues: DatesType });

  useEffect(() => {
    getAllUsersOptionsSearch()
      .then((data) => setDoctorOptions(data))
      .catch((error) => setAlert({ status: true, message: error.message, color: 'red' }));
    getAllPatientsOptionsSearch()
      .then((data) => setPatientOptions(data))
      .catch((error) => setAlert({ status: true, message: error.message, color: 'red' }));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (idRegisterToEdit) {
      getDateById(idRegisterToEdit)
        .then((data) => {
          Object.keys(data.data).forEach((key) => setValue(key, data.data[key]));
          setCurrentSchedule(data.data.schedule);
          setIsFirstDate(data.data.isFirstDate);
        })
        .catch((error) => setAlert({ status: true, message: error.message, color: 'red' }));
    }
    // eslint-disable-next-line
  }, [idRegisterToEdit]);

  const catchData = (data) => {
    if (
      !data.doctorIdAssigned
      || !data.reason
      || !data[isFirstDate ? 'patientName' : 'patientId']
    ) {
      setAlert({
        status: true,
        text: 'Faltan algunos campos por rellenar',
        color: 'red',
      });
      setTimeout(() => setAlert({ ...alert, status: false }), 4000);
    } else {
      if (data.schedule === '') {
        data.schedule = currentSchedule;
      }
      updateDateById(idRegisterToEdit, data)
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          setDataUpdate(true);
          sendNotificationCreate(userData.id, 'redate');
          setTimeout(() => {
            setAlert({ ...alert, status: false });
            close();
          }, 4000);
        })
        .catch((error) => {
          setAlert({ status: true, text: error.message, color: 'red' });
          setTimeout(() => setAlert({ ...alert, status: false }), 5000);
        });
    }
  };

  useEffect(() => {
    setValue('schedule', '');
    getAllReserveAllDayByDoctorDate(watch('doctorIdAssigned'), watch('date'))
      .then((data) => {
        if (data.data.length > 0) {
          setAlert({
            status: true,
            text: 'Este día fue reservado por el doctor.',
            color: 'red',
          });
          setTimeout(() => setAlert({ ...alert, status: false }), 4000);
          return;
        }
        if (isFirstDate) {
          if (!watch('date') || !watch('doctorIdAssigned')) return;
          getAllDateSchedulesFreeOptionsSearch(
            watch('doctorIdAssigned'),
            watch('date'),
          )
            .then((data) => {
              setScheduleOptions(data);
            })
            .catch((error) => {
              setScheduleOptions(error);
            });
        } else {
          if (
            !watch('date')
            || !watch('patientId')
            || !watch('doctorIdAssigned')
          ) return;
          getAllDateSchedulesFreeOptionsSearch(
            watch('doctorIdAssigned'),
            watch('date'),
            watch('patientId'),
          )
            .then((data) => {
              setScheduleOptions(data);
            })
            .catch((error) => {
              setScheduleOptions(error);
            });
        }
      })
      .catch(() => null);
    // eslint-disable-next-line
  }, [
    watch('date'),
    watch('patientId'),
    watch('doctorIdAssigned'),
    isFirstDate,
  ]);

  return (
    <Row
      className="calculator-sg-background"
      style={{
        transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
        opacity: show ? '1' : '0',
      }}
    >
      <Col xs="12" className="calculator-sg-col">
        <Form onSubmit={handleSubmit(catchData)} className="calculator-sg-form">
          <span
            className="btn-close-modal icon-close"
            onClick={() => {
              setIdRegisterToNull();
              reset(DatesType);
              close();
            }}
            onKeyDown={() => {
              setIdRegisterToNull();
              reset(DatesType);
              close();
            }}
          />
          <p className="title">Reagendar cita</p>
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
          <InputFormGroup
            name="doctorIdAssigned"
            label="Terapeuta que atiende"
            type="select"
            inputSearch
            errors={errors.doctorIdAssigned}
            control={control}
            labelSizeSm={12}
            inputSizeSm={12}
            labelSize={5}
            inputSize={7}
            placeHolder="Buscar terapeuta"
            search={false}
            options={doctorOptions}
          />
          <div
            style={{
              display: isFirstDate ? 'block' : 'none',
              heigth: '0.1px',
            }}
          >
            <InputFormGroup
              name="patientName"
              label="Nombre del paciente"
              type="text"
              min="1"
              register={register}
              errors={errors?.patientName}
              required={isFirstDate === true}
              labelSizeSm={12}
              inputSizeSm={12}
              labelSize={5}
              inputSize={7}
              placeHolder="Ingresar nombre"
            />
          </div>
          <div
            style={{
              display: !isFirstDate ? 'block' : 'none',
              heigth: '0.1px',
            }}
          >
            <InputFormGroup
              name="patientId"
              label="Nombre del paciente"
              type="select"
              inputSearch
              control={control}
              errors={errors?.patientId}
              labelSizeSm={12}
              inputSizeSm={12}
              labelSize={5}
              inputSize={7}
              placeHolder="Buscar paciente"
              search={false}
              options={patientOptions}
              required={isFirstDate === false}
            />
          </div>
          <InputFormGroup
            name="date"
            label="Fecha de la cita"
            type="date"
            placeHolder="yyyy-mm-dd"
            pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
            minLength={10}
            maxLength={10}
            min={getCurrentDate()}
            register={register}
            errors={errors?.date}
            labelSize={5}
            inputSize={7}
          />
          <div>
            <p
              style={{
                textAlign: 'center',
              }}
            >
              {`Horario anterior: ${currentSchedule}`}
            </p>
          </div>
          <InputFormGroup
            name="schedule"
            label="Nuevo horario de la cita"
            type="select"
            inputSearch
            control={control}
            errors={errors?.schedule}
            labelSize={5}
            inputSize={7}
            placeHolder="Seleccionar horario"
            search={false}
            options={scheduleOptions}
          />
          <InputFormGroup
            name="reason"
            label="Motivo de la consulta"
            inputClassname="input-auto-heigth"
            type="textarea"
            rows={1}
            register={register}
            errors={errors?.reason}
            required={false}
            labelSize={5}
            inputSize={7}
            placeHolder="Describir motivo"
          />
          <Col className="btn-column">
            <Button className="btn-custom" color="" type="submit">
              Agendar cita
            </Button>
          </Col>
        </Form>
      </Col>
    </Row>
  );
};

ReagendarCitaModal.defaultProps = {
  idRegisterToEdit: null,
  setDataUpdate: null,
  setIdRegisterToNull: null,
};

ReagendarCitaModal.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  idRegisterToEdit: PropTypes.string,
  setIdRegisterToNull: PropTypes.func,
  setDataUpdate: PropTypes.func,
};

export default ReagendarCitaModal;
