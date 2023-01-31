import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Form, Button,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import autosize from 'autosize';
import UserData from '../context/UserData';
import ScheduleList from './ScheduleList';
import { getCurrentDate } from '../utils/formulas';
import CustomAlert from '../common/CustomAlert';
import InputFormGroup from '../common/InputFormGroup';
import '../styles/modalReserveDate.scss';
import { ReservationsType } from '../models/ReservationsType';
import { getAllDatesByDoctorDate } from '../actions/DatesAction';
import {
  getAllReserveAllDayByDoctorDate,
  getReservationById,
  updateReservationById,
} from '../actions/ReservesAction';
import { sendNotificationCreate } from '../firebase/oneSignal';

const ModalRescheduleReserveDate = ({
  close,
  show,
  idRegisterToEdit,
  setIdRegisterToNull,
  setDataUpdate,
}) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [allDaySelected, setAllDaySelected] = useState(true);
  const [currentSchedule, setCurrentSchedule] = useState('');
  const { userData } = useContext(UserData);
  const {
    register, handleSubmit, errors, setValue, watch, reset,
  } = useForm({
    defaultValues: ReservationsType,
  });

  useEffect(() => {
    if (idRegisterToEdit) {
      getReservationById(idRegisterToEdit)
        .then((data) => {
          Object.keys(data.data).forEach((key) => setValue(key, data.data[key]));
          setCurrentSchedule(data.data.schedule);
        })
        .catch((error) => setAlert({ status: true, message: error.message, color: 'red' }));
    }
    // eslint-disable-next-line
  }, [idRegisterToEdit]);

  useEffect(() => {
    if (!allDaySelected) setValue('schedule', '');
    // eslint-disable-next-line
  }, [watch('date')]);

  const autoGrowInput = (e) => autosize(e.target);
  const selectTime = (schedule) => setValue('schedule', schedule);

  const catchData = async (newData) => {
    newData.isCompleteDay = allDaySelected;
    if (allDaySelected) {
      await getAllDatesByDoctorDate(userData.id, newData.date)
        .then((data) => {
          if (data.data.length) {
            throw new Error(
              'Tiene citas este día, debe reagendarlas primero o seleccionar otro día.',
            );
          } else {
            return getAllReserveAllDayByDoctorDate(userData.id, newData.date);
          }
        })
        .then((data) => {
          if (data.data.length > 0) {
            throw new Error('Ya reservaste este día.');
          } else {
            return updateReservationById(idRegisterToEdit, newData);
          }
        })
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          setIdRegisterToNull(newData, 'edit');
          reset(ReservationsType);
          setDataUpdate(true);
          setTimeout(() => close(), 4000);
        })
        .catch((error) => setAlert({
          status: true,
          text:
              error.message
              || 'Por el momento no se puede actualizar la reservación',
          color: 'red',
        }));
    } else {
      await updateReservationById(idRegisterToEdit, newData)
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          setValue('schedule', '');
          reset(ReservationsType);
          sendNotificationCreate(userData.id, 'reservation');
          setIdRegisterToNull(newData, 'edit');
          setDataUpdate(true);
          setTimeout(() => close(), 4000);
        })
        .catch(() => setAlert({
          status: true,
          text: 'Por el momento no se puede actualizar la reservación',
          color: 'red',
        }));
    }
    setTimeout(() => setAlert({ ...alert, status: false }), 4000);
  };

  return (
    <Row
      className="modal-reserve-date-bg"
      style={{
        transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
        opacity: show ? '1' : '0',
      }}
    >
      <Col xs="12" className="col-reserve-date">
        <Form onSubmit={handleSubmit(catchData)} className="reserve-date-form">
          <span
            className="btn-close-modal icon-close"
            onClick={() => {
              setAllDaySelected(true);
              setIdRegisterToNull();
              reset(ReservationsType);
              close();
            }}
            onKeyDown={() => {
              setAllDaySelected(true);
              setIdRegisterToNull();
              reset(ReservationsType);
              close();
            }}
          />
          {/* <p className="title">Horario no disponible</p> */}
          <p className="subtitle-global">Horario no disponible del terapeuta</p>
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
          <InputFormGroup
            columnSize={6}
            errors={errors?.reason}
            inputClassname="input-auto-heigth"
            label="Motivo de la ausencia"
            name="reason"
            onChange={autoGrowInput}
            placeHolder="Describir motivo"
            register={register}
            required
            rows={2}
            type="textarea"
          />
          <InputFormGroup
            columnSize={6}
            errors={errors?.date}
            label="Fecha"
            maxLength={10}
            minLength={10}
            min={getCurrentDate()}
            name="date"
            pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
            placeHolder="yyyy-mm-dd"
            register={register}
            required
            type="date"
          />
          <Row>
            <Col xs="6">
              <Button
                color=""
                className="btn-custom"
                onClick={() => {
                  setAllDaySelected(true);
                  setValue('schedule', 'todo el día');
                }}
                style={{
                  opacity: allDaySelected ? '1' : '.5',
                }}
              >
                Todo el día
              </Button>
            </Col>
            <Col xs="6">
              <Button
                color=""
                className="btn-custom"
                onClick={() => {
                  setAllDaySelected(false);
                  setValue('schedule', '');
                }}
                style={{
                  opacity: !allDaySelected ? '1' : '.5',
                }}
              >
                Hora específica
              </Button>
            </Col>
          </Row>
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
            columnSize={6}
            errors={errors?.schedule}
            label="Horario reservado para"
            name="schedule"
            placeHolder=""
            register={register}
            readOnly
            required
            type="text"
          />
          {!allDaySelected && (
            <ScheduleList date={watch('date')} selectTime={selectTime} edit />
          )}
          <Col className="col-btn">
            <Button className="btn-custom" color="" type="submit">
              Guardar
            </Button>
          </Col>
        </Form>
      </Col>
    </Row>
  );
};

ModalRescheduleReserveDate.defaultProps = {
  idRegisterToEdit: null,
  setDataUpdate: null,
  setIdRegisterToNull: null,
};

ModalRescheduleReserveDate.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  idRegisterToEdit: PropTypes.string,
  setDataUpdate: PropTypes.func,
  setIdRegisterToNull: PropTypes.func,
};

export default ModalRescheduleReserveDate;
