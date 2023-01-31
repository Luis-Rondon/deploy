import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Form, Button,
} from 'reactstrap';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import {
  getCorrectedWeeksOfGestation,
  getCurrentDate,
} from '../utils/formulas';
import CustomAlert from '../common/CustomAlert';
import InputFormGroup from '../common/InputFormGroup';
import '../styles/modalCalculatorSG.scss';

const ModalCalculatorSG = ({ close, show }) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });

  const defaultFormValues = {
    currentDate: getCurrentDate(),
    birthDate: getCurrentDate(),
    sg: '',
    fixAge: 'Rellena los campos',
  };

  const {
    register, handleSubmit, errors, setValue,
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const catchData = (data) => {
    const birthDateConverted = moment(data.birthDate, 'YYYY-MM-DD');
    const currentDateConverted = moment(data.currentDate, 'YYYY-MM-DD');
    if (birthDateConverted > currentDateConverted) {
      setAlert({
        status: true,
        text: 'La fecha de nacimiento no puede ser mayor a la fecha actual',
        color: 'red',
      });
      setValue('fixAge', 'No hay resultados que mostrar');
    } else {
      const results = getCorrectedWeeksOfGestation(
        data.birthDate,
        data.currentDate,
        data.sg,
      );

      if (results.chronoAge.years >= 2) {
        setAlert({
          status: true,
          text: 'El niño es mayor a 2 años, no se corregirá la edad.',
          color: 'red',
        });
        setValue(
          'fixAge',
          `Días de nacido: ${results.bornDays},
Edad cronológica: ${results.chronoAge.years} años, ${results.chronoAge.months} meses y ${results.chronoAge.days} días.
Tiempo faltante: ${results.leftTime.months} meses y ${results.leftTime.days} días.
Edad corregida exacta: El niño es mayor a 2 años, no aplica.`,
        );
      } else if (data.sg >= 40) {
        setAlert({
          status: true,
          text: 'Esta formula aplica solo a bebés con menos de 40 semanas de gestación',
          color: 'red',
        });
        setValue(
          'fixAge',
          `Días de nacido: ${results.bornDays},
Edad cronológica: ${results.chronoAge.years} años, ${results.chronoAge.months} meses y ${results.chronoAge.days} días.
Tiempo faltante: ${results.leftTime.months} meses y ${results.leftTime.days} días.
Edad corregida exacta: No aplica.`,
        );
      } else {
        setValue(
          'fixAge',
          `Días de nacido: ${results.bornDays},
Edad cronológica: ${results.chronoAge.years} años, ${
  results.chronoAge.months
} meses y ${results.chronoAge.days} días.
Tiempo faltante: ${results.leftTime.months} meses y ${
  results.leftTime.days
} días.
Edad corregida exacta: ${
  results.notApply
    ? 'No aplica.'
    : `${results.correctedAge.years} años, ${results.correctedAge.months} meses y ${results.correctedAge.days} días.`
}
Edad corregida exacta en sem.: ${results.correctedAgeInWeeks.weeks} semanas y ${
  results.correctedAgeInWeeks.days
} días.`,
        );
      }
    }
    setTimeout(() => setAlert({ ...alert, status: false }), 4000);
  };

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
            onClick={close}
            onKeyDown={close}
          />
          <p className="title">Calcular semanas de gestación</p>
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
          <InputFormGroup
            name="birthDate"
            label="Fecha de nacimiento:"
            type="date"
            placeHolder="yyyy-mm-dd"
            pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
            minLength={10}
            maxLength={10}
            register={register}
            errors={errors?.birthDate}
            columnSize={6}
          />
          <InputFormGroup
            name="currentDate"
            label="Fecha actual:"
            type="date"
            placeHolder="yyyy-mm-dd"
            pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
            minLength={10}
            maxLength={10}
            register={register}
            errors={errors?.currentDate}
            columnSize={6}
          />
          <InputFormGroup
            name="sg"
            label="Semanas de gestación:"
            type="number"
            pattern="^[0-9]+"
            min="1"
            placeHolder="0"
            register={register}
            errors={errors?.sg}
            columnSize={6}
          />
          <Col className="btn-column">
            <Button className="btn-custom" color="" type="submit">
              Calcular
            </Button>
          </Col>
          <InputFormGroup
            labelClassname="label-fix-age"
            inputClassname="input-readonly"
            name="fixAge"
            label="Resultado:"
            type="textarea"
            rows={window.screen.width < 1024 ? 9 : 6}
            register={register}
            errors={errors?.fixAge}
            readOnly
            required={false}
            columnSize={12}
          />
        </Form>
      </Col>
    </Row>
  );
};

ModalCalculatorSG.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default ModalCalculatorSG;
