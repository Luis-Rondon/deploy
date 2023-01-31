/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { useFieldArray } from 'react-hook-form';
import '../styles/fieldArrayMotorRepertoire.scss';
import Label from 'reactstrap/lib/Label';
import Input from 'reactstrap/lib/Input';

const FieldArrayMotorRepertoire = ({
  control,
  register,
  watch,
  // errors,
  readOnly,
  setValue,
  nameField,
  setPuntuacionParcial,
  titulo,
}) => {
  const { fields } = useFieldArray({
    control,
    name: `${nameField}.indicadores`,
  });

  const clickRadioValueFidgety = (e, index) => {
    const indValorSeleccionado = watch(`${nameField}.indicadores[${index}].valorSeleccionado`) || '';
    if (e.target.value === indValorSeleccionado) {
      setValue(`${nameField}.indicadores[${index}].valorSeleccionado`, '');
    } else {
      setValue(
        `${nameField}.indicadores[${index}].valorSeleccionado`,
        e.target.value,
      );
    }
    if (nameField === 'patronesMovObs' || nameField === 'patronesPostObs') {
      let totalNormal = 0;
      let totalAtipico = 0;
      const indicadores = watch(`${nameField}.indicadores`);
      indicadores.forEach((indicador) => {
        if (indicador.valorSeleccionado === 'N') {
          totalNormal += 1;
        } else if (indicador.valorSeleccionado === 'A') {
          totalAtipico += 1;
        }
      });
      setValue(`${nameField}.valorNormal`, totalNormal);
      setValue(`${nameField}.valorAtipico`, totalAtipico);
    }
    setTimeout(() => setPuntuacionParcial(nameField === 'patronesMovObs'), 300);
  };

  useEffect(() => {
    // console.log(nameField);
  }, []);

  return (
    <Row className="row-field-array-motor-repertoire">
      <Col
        xs="12"
        md={watch(`${nameField}.valorNormal`) !== undefined ? '6' : '12'}
      >
        <h5>
          <strong>{titulo}</strong>
        </h5>
      </Col>
      {watch(`${nameField}.valorNormal`) !== undefined && (
        <>
          <Col xs="1">
            <Input
              id={`${nameField}.valorNormal`}
              name={`${nameField}.valorNormal`}
              addon
              // innerRef={register({ required: true })}
              innerRef={register()}
              type="number"
              min="0"
              max="16"
              disabled
              className="input-custom"
            />
          </Col>
          <Col xs="2">
            <Label className="label-total green">Normal (N)</Label>
          </Col>
        </>
      )}
      {watch(`${nameField}.valorAtipico`) !== undefined && (
        <>
          <Col xs="1">
            <Input
              id={`${nameField}.valorAtipico`}
              name={`${nameField}.valorAtipico`}
              addon
              // innerRef={register({ required: true })}
              innerRef={register()}
              type="number"
              min="0"
              max="16"
              disabled
              className="input-custom"
            />
          </Col>
          <Col xs="2">
            <Label className="label-total red">Atípico (A)</Label>
          </Col>
        </>
      )}
      <Input
        name={`${nameField}.titulo`}
        addon
        innerRef={register()}
        type="hidden"
        disabled={readOnly}
      />

      {fields.map((item, i) => (
        <Col xs="12" md="4" key={item.id}>
          <fieldset id={`radio-group-${nameField}-${i}`}>
            <Row>
              <Col xs="3" className="col-input">
                <Row>
                  <Col xs="6" className="col">
                    {item.valorNormal && (
                      <span className="container-radio">
                        <Input
                          type="radio"
                          value={item.valorNormal}
                          className="input-radio radio-normal"
                          name={`radio-group-${nameField}-${i}`}
                          onChange={() => null}
                          onClick={(e) => clickRadioValueFidgety(e, i)}
                          checked={
                            watch(
                              `${nameField}.indicadores[${i}].valorNormal`,
                            )
                            === watch(
                              `${nameField}.indicadores[${i}].valorSeleccionado`,
                            )
                          }
                          disabled={readOnly}
                        />
                        <Label className="label-radio-value green">
                          {item.valorNormal}
                        </Label>
                        <Input
                          name={`${nameField}.indicadores[${i}].valorNormal`}
                          addon
                          // innerRef={register({ required: true })}
                          innerRef={register()}
                          type="hidden"
                          min="0"
                          max="2"
                          disabled
                          autoComplete="off"
                          className="input-custom"
                        />
                      </span>
                    )}
                  </Col>
                  <Col xs="6" className="col">
                    {item.valorAtipico && (
                      <span className="container-radio">
                        <Input
                          type="radio"
                          value={item.valorAtipico}
                          className="input-radio radio-anormal"
                          name={`radio-group-${nameField}-${i}`}
                          onChange={() => null}
                          onClick={(e) => clickRadioValueFidgety(e, i)}
                          checked={
                            watch(
                              `${nameField}.indicadores[${i}].valorAtipico`,
                            )
                            === watch(
                              `${nameField}.indicadores[${i}].valorSeleccionado`,
                            )
                          }
                          disabled={readOnly}
                        />
                        <Label className="label-radio-value red">
                          {item.valorAtipico}
                        </Label>
                        <Input
                          name={`${nameField}.indicadores[${i}].valorAtipico`}
                          addon
                          // innerRef={register({ required: true })}
                          innerRef={register()}
                          type="hidden"
                          min="0"
                          max="2"
                          disabled
                          autoComplete="off"
                          className="input-custom"
                        />
                      </span>
                    )}
                  </Col>
                </Row>
              </Col>
              <Col xs="9" className="col-label">
                {item.tipoIndicador === 'cerrado' && (
                  <Label
                    className="text-indicator"
                    name={`${nameField}.indicadores[${i}].indicador`}
                  >
                    {item.indicador}
                  </Label>
                )}
                <Input
                  id={`${nameField}.indicadores[${i}].indicador`}
                  name={`${nameField}.indicadores[${i}].indicador`}
                  addon
                  // innerRef={register({ required: true })}
                  innerRef={register()}
                  type="hidden"
                  disabled={readOnly}
                />
                <Input
                  name={`${nameField}.indicadores[${i}].valorSeleccionado`}
                  addon
                  innerRef={register()}
                  // innerRef={register({ required: true })}
                  type="hidden"
                  disabled
                  autoComplete="off"
                  className="input-custom"
                />
                {item.tipoIndicador === 'abierto' && (
                  <Input
                    name={`${nameField}.indicadores[${i}].valorEscrito`}
                    addon
                    // innerRef={register({ required: true })}
                    innerRef={register()}
                    type="text"
                    autoComplete="off"
                    className="input-custom"
                    disabled={readOnly}
                  />
                )}
                <Input
                  id={`${nameField}.indicadores[${i}].tipoIndicador`}
                  name={`${nameField}.indicadores[${i}].tipoIndicador`}
                  addon
                  // innerRef={register({ required: true })}
                  innerRef={register()}
                  type="hidden"
                  disabled={readOnly}
                />
              </Col>
            </Row>
          </fieldset>
        </Col>
      ))}
    </Row>
  );
};

FieldArrayMotorRepertoire.defaultProps = {
  readOnly: false,
  setValue: null,
  nameField: '',
  titulo: '',
};

FieldArrayMotorRepertoire.propTypes = {
  setPuntuacionParcial: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  watch: PropTypes.func.isRequired,
  // errors: PropTypes.object,
  readOnly: PropTypes.bool,
  setValue: PropTypes.func,
  nameField: PropTypes.string,
  titulo: PropTypes.string,
};

export default FieldArrayMotorRepertoire;
