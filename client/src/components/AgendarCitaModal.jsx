/* eslint-disable max-len */
import React, {
  useState, useEffect, useContext, Fragment,
} from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Form, Button,
} from 'reactstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import autosize from 'autosize';
import Label from 'reactstrap/lib/Label';
import UserData from '../context/UserData';
import { DatesType } from '../models/DatesType';
import { getCurrentDate } from '../utils/formulas';
import {
  createDate,
  getAllDateSchedulesFreeOptionsSearch,
  getAllSchedulesOptionsSearch,
} from '../actions/DatesAction';
import { getUsersByUsernameOptionsSearch } from '../actions/UserAction';
import { getPatientByNameOptionsSearch } from '../actions/PatientAction';
import CustomAlert from '../common/CustomAlert';
import InputFormGroup from '../common/InputFormGroup';
import '../styles/modalCreateDate.scss';
import { sendNotificationCreate } from '../firebase/oneSignal';

const frecuencyOptions = [
  { name: '1 semana', value: '1' },
  { name: '2 semanas', value: '2' },
  { name: '3 semanas', value: '3' },
  { name: '1 mes', value: '4' },
  { name: '1 mes y medio', value: '6' },
  { name: '2 meses', value: '8' },
  { name: '2 meses  y medio', value: '10' },
  { name: '3 meses', value: '12' },
  { name: '3 meses y medio', value: '14' },
  { name: '4 meses', value: '16' },
  { name: '4 meses y medio', value: '18' },
  { name: '5 meses', value: '20' },
];

const AgendarCitaModal = ({ close, show, setDataUpdate }) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [isFirstDate, setIsFirstDate] = useState(false);
  const [scheduleOptions, setScheduleOptions] = useState([
    { name: 'Llena los campos', value: '' },
  ]);

  const { userData } = useContext(UserData);
  const {
    register,
    handleSubmit,
    errors,
    reset,
    control,
    watch,
    setValue,
  } = useForm({ defaultValues: DatesType });

  const { fields: weekDatesFields } = useFieldArray({
    control,
    name: 'weekDates',
  });

  const catchData = (data) => {
    // Cuando elige vacío, viene ' ', así que hay que quitarle ese espacio con trim()
    if (
      (isFirstDate && (!data.doctorIdAssigned?.trim() || !data.schedule))
      || !data[isFirstDate ? 'patientName' : 'patientId']
    ) {
      setAlert({
        status: true,
        text: 'Faltan algunos campos por rellenar',
        color: 'red',
      });
      setTimeout(() => setAlert({ ...alert, status: false }), 4000);
    } else {
      const dataComplete = {
        ...data,
        doctorIdAssigned: data?.doctorIdAssigned?.trim(),
        doctorIdCreated: userData.id,
        isFirstDate,
        arrivedToDate: false,
        arrivedState: 'Sin confirmar',
        weekDates: data.weekDates.filter(
          (item) => item.doctorIdAssigned?.trim().length,
        ),
      };
      createDate(dataComplete)
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          if (setDataUpdate) setDataUpdate(true);
          reset(DatesType);
          sendNotificationCreate(userData.id, 'date');
          setTimeout(() => {
            setAlert({ ...alert, status: false });
            close();
          }, 6000);
        })
        .catch((error) => {
          setAlert({ status: true, text: error.message, color: 'red' });
          setTimeout(() => setAlert({ ...alert, status: false }), 5000);
        });
    }
  };

  useEffect(() => {
    const inputsAutoHeight = document.getElementsByClassName('input-auto-heigth');
    autosize(inputsAutoHeight);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setValue('schedule', '');
    setScheduleOptions([{ name: 'Llena los campos', value: '' }]);
    const doctorIdAssignedTrim = watch('doctorIdAssigned')?.trim();
    if (isFirstDate) {
      if (!watch('date') || !doctorIdAssignedTrim) return;
      getAllDateSchedulesFreeOptionsSearch(doctorIdAssignedTrim, watch('date'))
        .then((data) => {
          setScheduleOptions(data);
        })
        .catch((error) => {
          setScheduleOptions(error);
        });
    } else {
      if (!watch('startDate')) return; //  || !watch('patientId') || !doctorIdAssignedTrim
      getAllSchedulesOptionsSearch(watch('startDate'))
        .then((data) => {
          setScheduleOptions(data);
        })
        .catch((error) => {
          setScheduleOptions(error);
        });
    }
  // eslint-disable-next-line
  }, [// eslint-disable-next-line
    watch('date'),// eslint-disable-next-line
    watch('startDate'),// eslint-disable-next-line
    watch('patientId'),// eslint-disable-next-line
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
              close();
              reset(DatesType);
            }}
            onKeyDown={() => {
              close();
              reset(DatesType);
            }}
          />
          <p className="title">Agendar cita</p>
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
          <Row>
            <Col xs="6">
              <Button
                color=""
                className="btn-custom btn-regular-date"
                onClick={() => setIsFirstDate(false)}
                style={{
                  opacity: !isFirstDate ? '1' : '.5',
                }}
              >
                Cita regular
              </Button>
            </Col>
            <Col xs="6">
              <Button
                color=""
                className="btn-custom btn-first-day"
                onClick={() => setIsFirstDate(true)}
                style={{
                  opacity: isFirstDate ? '1' : '.5',
                }}
              >
                Primera cita
              </Button>
            </Col>
          </Row>
          {isFirstDate && (
            <>
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
                getOptions={getUsersByUsernameOptionsSearch}
              />
              <InputFormGroup
                name="patientName"
                label="Nombre del paciente"
                type="text"
                min="1"
                register={register}
                errors={errors?.patientName}
                required={false}
                labelSizeSm={12}
                inputSizeSm={12}
                labelSize={5}
                inputSize={7}
                placeHolder="Ingresar nombre"
              />
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
              <InputFormGroup
                name="schedule"
                label="Horario de la cita"
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
            </>
          )}
          {!isFirstDate && (
            <>
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
                getOptions={getPatientByNameOptionsSearch}
              />
              <InputFormGroup
                name="startDate"
                label="Primer cita"
                type="date"
                placeHolder="yyyy-mm-dd"
                pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                minLength={10}
                maxLength={10}
                min={getCurrentDate()}
                register={register}
                errors={errors?.startDate}
                labelSize={5}
                inputSize={7}
              />
            </>
          )}
          {/* <InputFormGroup
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
          /> */}
          {!isFirstDate && (
            <>
              <InputFormGroup
                name="frecuency"
                label="Frecuencia"
                type="select"
                inputSearch
                control={control}
                errors={errors?.frecuency}
                labelSize={5}
                inputSize={7}
                placeHolder="Seleccionar frecuencia"
                search={false}
                options={frecuencyOptions}
              />
              <Row>
                <Col xs="12" className="dates-modal-subtitle-banner">
                  <Label>Días de la cita</Label>
                </Col>
              </Row>
            </>
          )}
          {!isFirstDate
            && weekDatesFields.map((item, index) => (
              <Fragment key={item.id}>
                <Row>
                  <Col xs="12" lg="2">
                    <InputFormGroup
                      name={`weekDates[${index}].day.value`}
                      label={item.day.name}
                      type="hidden"
                      labelSizeSm={12}
                      inputSizeSm={12}
                      register={register}
                      readOnly
                    />
                  </Col>
                  <Col xs="0">
                    <InputFormGroup
                      name={`weekDates[${index}].day.name`}
                      label=""
                      type="hidden"
                      labelSizeSm={12}
                      inputSizeSm={12}
                      register={register}
                      readOnly
                    />
                  </Col>
                  <Col xs="12" md="5">
                    <InputFormGroup
                      name={`weekDates[${index}].doctorIdAssigned`}
                      label="Terapeuta"
                      type="select"
                      inputSearch
                      control={control}
                      errors={errors.doctorIdAssigned}
                      labelSizeSm={12}
                      inputSizeSm={12}
                      placeHolder="Buscar..."
                      getOptions={getUsersByUsernameOptionsSearch}
                    />
                  </Col>
                  <Col xs="12" md="5">
                    <InputFormGroup
                      name={`weekDates[${index}].schedule`}
                      label="Horario de la cita"
                      type="select"
                      inputSearch
                      control={control}
                      errors={errors?.schedule}
                      labelSizeSm={12}
                      inputSizeSm={12}
                      placeHolder="Seleccionar horario"
                      search={false}
                      options={scheduleOptions}
                    />
                  </Col>
                </Row>
              </Fragment>
            ))}
          <Col className="btn-column">
            <Button className="btn-custom" color="" type="submit">
              {isFirstDate ? 'Agendar cita' : 'Agendar citas'}
            </Button>
          </Col>
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
        </Form>
      </Col>
    </Row>
  );
};

AgendarCitaModal.defaultProps = {
  setDataUpdate: null,
};

AgendarCitaModal.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  setDataUpdate: PropTypes.func,
};

export default AgendarCitaModal;
