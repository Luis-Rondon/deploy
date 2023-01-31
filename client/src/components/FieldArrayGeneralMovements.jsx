/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { useFieldArray } from 'react-hook-form';
import '../styles/fieldArrayGeneralMovements.scss';
import Label from 'reactstrap/lib/Label';
import Input from 'reactstrap/lib/Input';

const FieldArrayGeneralMovements = ({
  control,
  register,
  // errors,
  readOnly,
  setValue,
  watch,
  nameField,
  index,
  subtitle,
  setPuntuacionParcial,
}) => {
  const fieldsUno = useFieldArray({
    control,
    name: `cuestionario.${nameField}.indicadoresUno`,
  }).fields;

  const fieldsDos = useFieldArray({
    control,
    name: `cuestionario.${nameField}.indicadoresDos`,
  }).fields;

  const changeRadioValue = (e, type, indicadorId) => {
    setValue(
      `cuestionario.${nameField}.valorIndicadores${type}`,
      e.target.value,
    );
    setValue(
      `cuestionario.${nameField}.valorIndicadores${type}Id`,
      indicadorId,
    );
    setPuntuacionParcial();
  };

  const getColorIndicator = (estatus) => {
    switch (estatus) {
      case 0:
        return 'default';
      case 1:
        return 'green';
      case 2:
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <Row
      className={`row-field-array-general-movements ${
        index % 2 === 0 ? 'bg-gray' : 'bg-white'
      }`}
    >
      {nameField === 'principal' && (
        <Col xs="6" className="col-title">
          <strong>Cuello</strong>
        </Col>
      )}
      {nameField === 'principal' && (
        <Col xs="6" className="col-title">
          <strong>Tronco</strong>
        </Col>
      )}
      {nameField === 'amplitud' && (
        <Col xs="6" className="col-title">
          <strong>Extremidades superiores</strong>
        </Col>
      )}
      {nameField === 'amplitud' && (
        <Col xs="6" className="col-title">
          <strong>Extremidades inferiores</strong>
        </Col>
      )}
      <Col xs="1" className="col col-subtitle">
        <Label className="text-subtitle">{subtitle}</Label>
        {/* Input oculto */}
        <Input
          name={`cuestionario.${nameField}.titulo`}
          addon
          innerRef={register()}
          type="hidden"
          disabled={readOnly}
        />
        <Input
          name={`cuestionario.${nameField}.valorIndicadoresUno`}
          addon
          innerRef={register()}
          type="hidden"
          disabled={readOnly}
        />
        <Input
          name={`cuestionario.${nameField}.valorIndicadoresDos`}
          addon
          innerRef={register()}
          type="hidden"
          disabled={readOnly}
        />
        <Input
          name={`cuestionario.${nameField}.valorIndicadoresUnoId`}
          addon
          innerRef={register()}
          type="hidden"
          disabled={readOnly}
        />
        <Input
          name={`cuestionario.${nameField}.valorIndicadoresDosId`}
          addon
          innerRef={register()}
          type="hidden"
          disabled={readOnly}
        />
      </Col>
      <Col xs="5" className="col">
        <fieldset id={`radio-group-one-${nameField}`}>
          {fieldsUno.map((item, i) => (
            <Row key={item.id}>
              <Col xs="4" md="3" className="col-input">
                <Input
                  type="radio"
                  value={item.valor}
                  className={`input-radio radio-${getColorIndicator(
                    item.estatus,
                  )}`}
                  name={`radio-group-one-${nameField}`}
                  onChange={(e) => changeRadioValue(e, 'Uno', item.indicadorId)}
                  checked={
                    watch(`cuestionario.${nameField}.valorIndicadoresUnoId`)
                    === watch(
                      `cuestionario.${nameField}.indicadoresUno[${i}].indicadorId`,
                    )
                  }
                  disabled={readOnly}
                  // defaultChecked
                />{' '}
                {item.valor}
                <Input
                  name={`cuestionario.${nameField}.indicadoresUno[${i}].valor`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  min="0"
                  max="2"
                  disabled
                  autoComplete="off"
                  className="input-custom"
                />
              </Col>
              <Col xs="8" md="9" className="col-label">
                <Label
                  className={`text-indicator ${getColorIndicator(
                    item.estatus,
                  )}`}
                  name={`cuestionario.${nameField}.indicadoresUno[${i}].valor`}
                >
                  {item.indicador}
                </Label>
                {/* Inputs ocultos para almacenar el valor en react-hook-form */}
                <Input
                  id={`cuestionario.${nameField}.indicadoresUno[${i}].indicador`}
                  name={`cuestionario.${nameField}.indicadoresUno[${i}].indicador`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  disabled={readOnly}
                />
                <Input
                  id={`cuestionario.${nameField}.indicadoresUno[${i}].estatus`}
                  name={`cuestionario.${nameField}.indicadoresUno[${i}].estatus`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  disabled={readOnly}
                />
                <Input
                  id={`cuestionario.${nameField}.indicadoresUno[${i}].indicadorId`}
                  name={`cuestionario.${nameField}.indicadoresUno[${i}].indicadorId`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  disabled={readOnly}
                />
              </Col>
            </Row>
          ))}
        </fieldset>
      </Col>
      <Col xs="5" className="col">
        <fieldset id={`radio-group-two-${nameField}`}>
          {fieldsDos.map((item, i) => (
            <Row className="" key={item.id}>
              <Col xs="4" md="3" className="col-input">
                <Input
                  type="radio"
                  value={item.valor}
                  className={`input-radio radio-${getColorIndicator(
                    item.estatus,
                  )}`}
                  name={`radio-group-two-${nameField}`}
                  onChange={(e) => changeRadioValue(e, 'Dos', item.indicadorId)}
                  checked={
                    watch(`cuestionario.${nameField}.valorIndicadoresDosId`)
                    === watch(
                      `cuestionario.${nameField}.indicadoresDos[${i}].indicadorId`,
                    )
                  }
                  disabled={readOnly}
                  // defaultChecked
                />{' '}
                {item.valor}
                <Input
                  id={`cuestionario.${nameField}.indicadoresDos[${i}].valor`}
                  name={`cuestionario.${nameField}.indicadoresDos[${i}].valor`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  min="0"
                  max="2"
                  disabled
                  className="input-custom"
                  autoComplete="off"
                />
              </Col>
              <Col xs="8" md="9" className="col-label">
                <Label
                  className={`text-indicator ${getColorIndicator(
                    item.estatus,
                  )}`}
                  name={`cuestionario.${nameField}.indicadoresDos[${i}].valor`}
                >
                  {item.indicador}
                </Label>
                {/* Inputs ocultos para almacenar el valor en react-hook-form */}
                <Input
                  id={`cuestionario.${nameField}.indicadoresDos[${i}].indicador`}
                  name={`cuestionario.${nameField}.indicadoresDos[${i}].indicador`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  disabled={readOnly}
                />
                <Input
                  id={`cuestionario.${nameField}.indicadoresDos[${i}].estatus`}
                  name={`cuestionario.${nameField}.indicadoresDos[${i}].estatus`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  disabled={readOnly}
                />
                <Input
                  id={`cuestionario.${nameField}.indicadoresDos[${i}].indicadorId`}
                  name={`cuestionario.${nameField}.indicadoresDos[${i}].indicadorId`}
                  addon
                  innerRef={register({ required: true })}
                  type="hidden"
                  disabled={readOnly}
                />
              </Col>
            </Row>
          ))}
        </fieldset>
      </Col>
    </Row>
  );
};

FieldArrayGeneralMovements.defaultProps = {
  subtitle: '',
  readOnly: false,
  setValue: null,
  watch: null,
  nameField: '',
};

FieldArrayGeneralMovements.propTypes = {
  subtitle: PropTypes.string,
  setPuntuacionParcial: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  // errors: PropTypes.object,
  readOnly: PropTypes.bool,
  setValue: PropTypes.func,
  watch: PropTypes.func,
  nameField: PropTypes.string,
  index: PropTypes.number.isRequired,
};

export default FieldArrayGeneralMovements;
