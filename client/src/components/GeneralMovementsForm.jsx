/* eslint-disable max-len */
/* eslint-disable no-console */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Button, Label,
} from 'reactstrap';
import Input from 'reactstrap/lib/Input';
import { useFieldArray, useForm } from 'react-hook-form';
import moment from 'moment';
import CustomAlert from '../common/CustomAlert';
import '../styles/generalMovementsForm.scss';
import { GeneralMovementsType } from '../models/GeneralMovementsType';
import FieldArrayGeneralMovements from './FieldArrayGeneralMovements';
import UserData from '../context/UserData';
import {
  createGeneralMovements,
  getGeneralMovementsByPatientId,
  updateGeneralMovementsById,
} from '../actions/GeneralMovementsAction';
import { updatePatientIndicatorCheck } from '../actions/PatientAction';

const GeneralMovementsForm = ({
  idRegister,
  idPatientRegister,
  isLoading,
  typeForm,
  origin,
  // setIsLoading,
}) => {
  const foundType = { loading: 0, found: 1, notFound: 2 };
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [btnSubmitDisabled, setBtnSubmitDisabled] = useState(false);
  const [generalMovementsDataComplete, setGeneralMovementsDataComplete] = useState();
  const [readOnly, setReadOnly] = useState(true);
  const [isFound, setIsFound] = useState(foundType.loading);
  const {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    control, // getValues,
  } = useForm({ defaultValues: GeneralMovementsType });
  const fieldsSecuencia = useFieldArray({
    control,
    name: 'cuestionario.secuencia.indicadoresUno',
  }).fields;
  const fieldsEvaluacionMG = useFieldArray({
    control,
    name: 'cuestionario.evaluacionMG.indicadoresUno',
  }).fields;

  const { userData } = useContext(UserData);

  const getDataGeneralMovements = () => {
    getGeneralMovementsByPatientId(
      origin === 'formPatient' ? idPatientRegister : null,
      origin === 'neuroMonitoring' ? idRegister : null,
    )
      .then(({ data }) => {
        setIsFound(foundType.found);
        Object.keys(data).forEach((key) => setValue(key, data[key]));
        const valuesToSet = [
          {
            name: 'cuestionario.secuencia.indicadoresUno',
            value: data?.cuestionario?.secuencia.indicadoresUno,
          },
          {
            name: 'cuestionario.principal.indicadoresUno',
            value: data?.cuestionario?.principal.indicadoresUno,
          },
          {
            name: 'cuestionario.amplitud.indicadoresUno',
            value: data?.cuestionario?.amplitud.indicadoresUno,
          },
          {
            name: 'cuestionario.velocidad.indicadoresUno',
            value: data?.cuestionario?.velocidad.indicadoresUno,
          },
          {
            name: 'cuestionario.rangoEspacial.indicadoresUno',
            value: data?.cuestionario?.rangoEspacial.indicadoresUno,
          },
          {
            name: 'cuestionario.compRotatoriosProximales.indicadoresUno',
            value: data?.cuestionario?.compRotatoriosProximales.indicadoresUno,
          },
          {
            name: 'cuestionario.compRotatoriosDistales.indicadoresUno',
            value: data?.cuestionario?.compRotatoriosDistales.indicadoresUno,
          },
          {
            name: 'cuestionario.inicio.indicadoresUno',
            value: data?.cuestionario?.inicio.indicadoresUno,
          },
          {
            name: 'cuestionario.final.indicadoresUno',
            value: data?.cuestionario?.final.indicadoresUno,
          },
          {
            name: 'cuestionario.rigidez.indicadoresUno',
            value: data?.cuestionario?.rigidez.indicadoresUno,
          },
          {
            name: 'cuestionario.principal.indicadoresDos',
            value: data?.cuestionario?.principal.indicadoresDos,
          },
          {
            name: 'cuestionario.amplitud.indicadoresDos',
            value: data?.cuestionario?.amplitud.indicadoresDos,
          },
          {
            name: 'cuestionario.velocidad.indicadoresDos',
            value: data?.cuestionario?.velocidad.indicadoresDos,
          },
          {
            name: 'cuestionario.rangoEspacial.indicadoresDos',
            value: data?.cuestionario?.rangoEspacial.indicadoresDos,
          },
          {
            name: 'cuestionario.compRotatoriosProximales.indicadoresDos',
            value: data?.cuestionario?.compRotatoriosProximales.indicadoresDos,
          },
          {
            name: 'cuestionario.compRotatoriosDistales.indicadoresDos',
            value: data?.cuestionario?.compRotatoriosDistales.indicadoresDos,
          },
          {
            name: 'cuestionario.inicio.indicadoresDos',
            value: data?.cuestionario?.inicio.indicadoresDos,
          },
          {
            name: 'cuestionario.final.indicadoresDos',
            value: data?.cuestionario?.final.indicadoresDos,
          },
          {
            name: 'cuestionario.rigidez.indicadoresDos',
            value: data?.cuestionario?.rigidez.indicadoresDos,
          },
        ];
        valuesToSet.forEach(({ name, value }) => setValue(name, value));
        setGeneralMovementsDataComplete(data);
      })
      .catch((e) => {
        setIsFound(foundType.notFound);
        console.log(e?.message);
      });
  };

  const getPuntuacionOptimalidad = () => {
    let total = 0;
    const puntuacionesParciales = watch('puntuacionesParciales');
    Object.values(puntuacionesParciales).forEach((puntuacion) => {
      total += Number(puntuacion);
    });
    setValue('puntuacionOptimalidad', total);
  };

  const setPuntuacionParcial = () => {
    let totalExtreSup = 0;
    let totalExtreSInf = 0;
    let totalTronco = 0;
    let totalSecuencia = 0;
    const cuestionario = watch('cuestionario');
    Object.keys(cuestionario).forEach((key) => {
      if (
        key !== 'principal'
        && key !== 'secuencia'
        && key !== 'evaluacionMG'
      ) {
        totalExtreSup += Number(cuestionario[key].valorIndicadoresUno || 0);
        totalExtreSInf += Number(cuestionario[key].valorIndicadoresDos || 0);
      }
    });
    totalTronco = Number(cuestionario.principal.valorIndicadoresUno || 0)
      + Number(cuestionario.principal.valorIndicadoresDos || 0);
    totalSecuencia = cuestionario.secuencia.valorIndicadoresUno || 0;
    setValue('puntuacionesParciales.extremidadesSuperiores', totalExtreSup);
    setValue('puntuacionesParciales.extremidadesInferiores', totalExtreSInf);
    setValue('puntuacionesParciales.cuelloTronco', totalTronco);
    setValue('puntuacionesParciales.secuencia', totalSecuencia);
    getPuntuacionOptimalidad();
  };

  const changeRadioValue = (e, indicadorId, type) => {
    setValue(`cuestionario.${type}.valorIndicadoresUno`, e.target.value);
    setValue(`cuestionario.${type}.valorIndicadoresUnoId`, indicadorId);
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

  const updateGeneralMovements = (data) => {
    updateGeneralMovementsById(generalMovementsDataComplete?.id, {
      ...data,
      updatedAt: moment().format('DD-MM-YYYY hh:mm:ss'),
    })
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        setTimeout(
          () => setAlert({ status: false, text: '', color: '' }),
          4000,
        );
        setBtnSubmitDisabled(false);
        getDataGeneralMovements();
        const indicatorId = data?.cuestionario?.secuencia?.valorIndicadoresUnoId;
        let indicatorCharacter = '';
        switch (indicatorId) {
          case '1':
            indicatorCharacter = 'N';
            break;
          case '2':
            indicatorCharacter = 'PR';
            break;
          case '3':
            indicatorCharacter = 'CS';
            break;
          case '4':
            indicatorCharacter = 'CH';
            break;
          default:
            break;
        }
        // if (origin === 'formPatient') {
        return updatePatientIndicatorCheck(
          idPatientRegister,
          indicatorCharacter,
          indicatorId,
            data?.puntuacionOptimalidad,
        );
        // }
      })
      .catch((error) => {
        setBtnSubmitDisabled(false);
        setAlert({ status: true, text: error.message || error, color: 'red' });
      });
  };

  const createGeneralMovement = (data) => {
    createGeneralMovements({
      ...data,
      patientId: origin === 'formPatient' ? idPatientRegister : null,
      neuroMonitoringPatientId:
        origin === 'neuroMonitoring' ? idPatientRegister : null,
      neuroMonitoringId: origin === 'neuroMonitoring' ? idRegister : null,
      doctorIdCreated: userData.id,
      createdAt: moment().format('DD-MM-YYYY hh:mm:ss'),
    })
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        setTimeout(
          () => setAlert({ status: false, text: '', color: '' }),
          4000,
        );
        setBtnSubmitDisabled(false);
        getDataGeneralMovements();
        const indicatorId = data?.cuestionario?.secuencia?.valorIndicadoresUnoId;
        let indicatorCharacter = '';
        switch (indicatorId) {
          case '1':
            indicatorCharacter = 'N';
            break;
          case '2':
            indicatorCharacter = 'PR';
            break;
          case '3':
            indicatorCharacter = 'CS';
            break;
          case '4':
            indicatorCharacter = 'CH';
            break;
          default:
            break;
        }
        console.log(indicatorId, indicatorCharacter);
        // if (origin === 'formPatient') {
        return updatePatientIndicatorCheck(
          idPatientRegister,
          indicatorCharacter,
          indicatorId,
            data?.puntuacionOptimalidad,
        );
        // }
      })
      .catch((error) => {
        setBtnSubmitDisabled(false);
        setAlert({ status: true, text: error.message || error, color: 'red' });
      });
  };

  const catchData = (data) => {
    setBtnSubmitDisabled(true);
    setAlert({
      status: true,
      text: 'Cargando ... No cancele el proceso',
      color: 'blue-two',
    });
    if (generalMovementsDataComplete?.id) {
      // si tiene id es update
      updateGeneralMovements(data);
    } else {
      // si no, es create
      createGeneralMovement(data);
    }
  };

  useEffect(() => {
    getDataGeneralMovements();
    setReadOnly(typeForm === 'view');
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <form
        onSubmit={handleSubmit(catchData)}
        className={`form-general-movements form ${
          typeForm === 'view' || origin === 'neuroMonitoring' ? 'mx-0 px-0' : ''
        }`}
      >
        {alert.status ? (
          <CustomAlert text={alert.text} color={alert.color} />
        ) : null}
        {isLoading && isFound === foundType.loading && 'Por favor, espere.'}
        {isFound === foundType.notFound && readOnly && (
          <strong className="mx-5 d-block">
            El usuario no cuenta con una evaluación de los movimientos generales
            en esta sección. Cree uno nuevo en la ventana de edición
          </strong>
        )}
        {!isLoading
          && (isFound === foundType.found
            || (isFound === foundType.notFound && !readOnly)) && (
            // {isLoading ? (
            //   'Por favor, espere.'
            // ) : (
            <Row className="row row-general-movements">
              <Col xs="12" className="col col-title">
                <h1 className="title">
                  Evaluación detallada de los Movimientos Generales (MGs)
                  durante la edad del prematuro y a término
                </h1>
              </Col>

              <Col xs="12">
                <Row className="row-instructions">
                  <Col xs="12" lg="6" className="col-instructions">
                    <Row>
                      <Col xs="4" className="col col-table">
                        <Label>
                          <strong>Evaluación de MG</strong>
                        </Label>
                        <Input
                          name="cuestionario.evaluacionMG.titulo"
                          addon
                          innerRef={register()}
                          type="hidden"
                          disabled={readOnly}
                        />
                        <Input
                          name="cuestionario.evaluacionMG.valorIndicadoresUno"
                          addon
                          innerRef={register()}
                          type="hidden"
                          disabled={readOnly}
                        />
                        <Input
                          name="cuestionario.evaluacionMG.valorIndicadoresUnoId"
                          addon
                          innerRef={register()}
                          type="hidden"
                        />
                      </Col>
                      <Col xs="8">
                        <fieldset id="radio-group-one-evaluacionMG">
                          {fieldsEvaluacionMG.map((item, i) => (
                            <Row className="" key={item.id}>
                              <Col
                                xs="4"
                                md="2"
                                className="col-input-general-mg col-table"
                              >
                                <Input
                                  key={item.id}
                                  type="radio"
                                  value={item.valor}
                                  className={`input-radio radio-${getColorIndicator(
                                    item.estatus,
                                  )}`}
                                  name="radio-group-one-evaluacionMG"
                                  onChange={(e) => changeRadioValue(
                                    e,
                                    item.indicadorId,
                                    'evaluacionMG',
                                  )}
                                  checked={
                                    watch(
                                      'cuestionario.evaluacionMG.valorIndicadoresUnoId',
                                    )
                                    === watch(
                                      `cuestionario.evaluacionMG.indicadoresUno[${i}].indicadorId`,
                                    )
                                  }
                                  disabled={readOnly}
                                  // defaultChecked
                                  // eslint-disable-next-line react/jsx-one-expression-per-line
                                />{' '}
                                {item.valor}
                                <Input
                                  defaultValue={item.valor}
                                  id={`cuestionario.evaluacionMG.indicadoresUno[${i}].valor`}
                                  name={`cuestionario.evaluacionMG.indicadoresUno[${i}].valor`}
                                  addon
                                  innerRef={register()}
                                  type="hidden"
                                  disabled={readOnly}
                                />
                              </Col>
                              <Col
                                xs="8"
                                md="10"
                                className="col-label-general col-table"
                              >
                                <Label
                                  className={`text-indicator ${getColorIndicator(
                                    item.estatus,
                                  )}`}
                                  name={`cuestionario.evaluacionMG.indicadoresUno[${i}].valor`}
                                >
                                  {item.indicador}
                                </Label>
                                {/* Inputs ocultos para almacenar el valor en react-hook-form */}
                                <Input
                                  defaultValue={item.indicador}
                                  id={`cuestionario.${'evaluacionMG'}.indicadoresUno[${i}].indicador`}
                                  name={`cuestionario.${'evaluacionMG'}.indicadoresUno[${i}].indicador`}
                                  addon
                                  innerRef={register({ required: true })}
                                  type="hidden"
                                  disabled={readOnly}
                                />
                                <Input
                                  defaultValue={item.estatus}
                                  id={`cuestionario.${'evaluacionMG'}.indicadoresUno[${i}].estatus`}
                                  name={`cuestionario.${'evaluacionMG'}.indicadoresUno[${i}].estatus`}
                                  addon
                                  innerRef={register({ required: true })}
                                  type="hidden"
                                  disabled={readOnly}
                                />
                                <Input
                                  defaultValue={item.indicadorId}
                                  id={`cuestionario.${'evaluacionMG'}.indicadoresUno[${i}].indicadorId`}
                                  name={`cuestionario.${'evaluacionMG'}.indicadoresUno[${i}].indicadorId`}
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
                  </Col>
                  <Col xs="12" lg="6">
                    <Row>
                      <Col xs="4" className="col-table">
                        <Label>
                          <strong>Secuencia</strong>
                        </Label>
                        <Input
                          name="cuestionario.secuencia.titulo"
                          addon
                          innerRef={register()}
                          type="hidden"
                          disabled={readOnly}
                        />
                        <Input
                          name="cuestionario.secuencia.valorIndicadoresUno"
                          addon
                          innerRef={register()}
                          type="hidden"
                          disabled={readOnly}
                        />
                        <Input
                          name="cuestionario.secuencia.valorIndicadoresUnoId"
                          addon
                          innerRef={register()}
                          type="hidden"
                        />
                      </Col>
                      <Col xs="8">
                        <fieldset id="radio-group-one-secuencia">
                          {fieldsSecuencia.map((item, i) => (
                            <Row className="" key={item.id}>
                              <Col
                                xs="4"
                                md="2"
                                className="col-input-general col-table"
                              >
                                <Input
                                  key={item.id}
                                  type="radio"
                                  value={item.valor}
                                  className={`input-radio radio-${getColorIndicator(
                                    item.estatus,
                                  )}`}
                                  name="radio-group-one-secuencia"
                                  onChange={(e) => changeRadioValue(
                                    e,
                                    item.indicadorId,
                                    'secuencia',
                                  )}
                                  checked={
                                    watch(
                                      'cuestionario.secuencia.valorIndicadoresUnoId',
                                    )
                                    === watch(
                                      `cuestionario.secuencia.indicadoresUno[${i}].indicadorId`,
                                    )
                                  }
                                  disabled={readOnly}
                                  // defaultChecked
                                  // eslint-disable-next-line react/jsx-one-expression-per-line
                                />{' '}
                                {item.valor}
                                <Input
                                  defaultValue={item.valor}
                                  id={`cuestionario.secuencia.indicadoresUno[${i}].valor`}
                                  name={`cuestionario.secuencia.indicadoresUno[${i}].valor`}
                                  addon
                                  innerRef={register()}
                                  type="hidden"
                                  disabled={readOnly}
                                />
                              </Col>
                              <Col
                                xs="8"
                                md="10"
                                className="col-label-general col-table"
                              >
                                <Label
                                  className={`text-indicator ${getColorIndicator(
                                    item.estatus,
                                  )}`}
                                  name={`cuestionario.secuencia.indicadoresUno[${i}].valor`}
                                >
                                  {item.indicador}
                                </Label>
                                {/* Inputs ocultos para almacenar el valor en react-hook-form */}
                                <Input
                                  defaultValue={item.indicador}
                                  id={`cuestionario.${'secuencia'}.indicadoresUno[${i}].indicador`}
                                  name={`cuestionario.${'secuencia'}.indicadoresUno[${i}].indicador`}
                                  addon
                                  innerRef={register({ required: true })}
                                  type="hidden"
                                  disabled={readOnly}
                                />
                                <Input
                                  defaultValue={item.estatus}
                                  id={`cuestionario.${'secuencia'}.indicadoresUno[${i}].estatus`}
                                  name={`cuestionario.${'secuencia'}.indicadoresUno[${i}].estatus`}
                                  addon
                                  innerRef={register({ required: true })}
                                  type="hidden"
                                  disabled={readOnly}
                                />
                                <Input
                                  defaultValue={item.indicadorId}
                                  id={`cuestionario.${'secuencia'}.indicadoresUno[${i}].indicadorId`}
                                  name={`cuestionario.${'secuencia'}.indicadoresUno[${i}].indicadorId`}
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
                  </Col>
                </Row>
              </Col>

              <Col xs="12" style={{ borderBottom: '1px solid var(--blue-one' }}>
                {Object.keys(GeneralMovementsType.cuestionario).map(
                  (key, i) => key !== 'secuencia'
                    && key !== 'evaluacionMG' && (
                      <FieldArrayGeneralMovements
                        key={key}
                        nameField={key}
                        subtitle={GeneralMovementsType.cuestionario[key].titulo}
                        setPuntuacionParcial={setPuntuacionParcial}
                        index={i}
                        {...{
                          control,
                          register,
                          errors,
                          setValue,
                          watch,
                        }}
                        readOnly={readOnly}
                      />
                  ),
                )}
              </Col>

              <Col xs="12" lg="4" className="col-puntuacion-parcial subtitle">
                <Label>Optimalidad de puntiaciones parciales</Label>
              </Col>
              <Col xs="12" lg="4" className="col-puntuacion-parcial">
                <Row>
                  <Col xs="8" className="col-label">
                    <Label>Extremidades superiores (máx.16)</Label>
                  </Col>
                  <Col xs="4" className="col-input">
                    <Input
                      id="puntuacionesParciales.extremidadesSuperiores"
                      name="puntuacionesParciales.extremidadesSuperiores"
                      addon
                      innerRef={register({ required: true })}
                      type="number"
                      min="0"
                      max="16"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="8" className="col-label">
                    <Label>Cuello y tronco (máx.4)</Label>
                  </Col>
                  <Col xs="4" className="col-input">
                    <Input
                      id="puntuacionesParciales.cuelloTronco"
                      name="puntuacionesParciales.cuelloTronco"
                      addon
                      innerRef={register({ required: true })}
                      type="number"
                      min="0"
                      max="16"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                </Row>
              </Col>
              <Col xs="12" lg="4" className="col-puntuacion-parcial">
                <Row>
                  <Col xs="8" className="col-label">
                    <Label>Extremidades inferiores (máx.16)</Label>
                  </Col>
                  <Col xs="4" className="col-input">
                    <Input
                      id="puntuacionesParciales.extremidadesInferiores"
                      name="puntuacionesParciales.extremidadesInferiores"
                      addon
                      innerRef={register({ required: true })}
                      type="number"
                      min="0"
                      max="16"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs="8" className="col-label">
                    <Label>Secuencia (máx.2)</Label>
                  </Col>
                  <Col xs="4" className="col-input">
                    <Input
                      id="puntuacionesParciales.secuencia"
                      name="puntuacionesParciales.secuencia"
                      addon
                      innerRef={register({ required: true })}
                      type="number"
                      min="0"
                      max="16"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                </Row>
              </Col>

              <Col xs="12" className="col-puntuacion">
                <div className="container-puntuacion">
                  <Label>Puntuación de Optimalidad (máx. 38)</Label>
                  <Input
                    id="puntuacionOptimalidad"
                    name="puntuacionOptimalidad"
                    addon
                    innerRef={register({ required: true })}
                    type="number"
                    min="0"
                    max="32"
                    required
                    disabled
                    className="input-puntuacion"
                  />
                </div>
              </Col>

              <Col xs="12" className="col-btn">
                <Button
                  type="submit"
                  className="btn-custom"
                  color=""
                  disabled={btnSubmitDisabled}
                >
                  Guardar
                </Button>
              </Col>
              {alert.status ? (
                <CustomAlert text={alert.text} color={alert.color} />
              ) : null}
            </Row>
        )}
      </form>
    </>
  );
};

GeneralMovementsForm.defaultProps = {
  typeForm: 'view',
  isLoading: false,
  origin: 'formPatient',
};

GeneralMovementsForm.propTypes = {
  idRegister: PropTypes.string.isRequired,
  idPatientRegister: PropTypes.string.isRequired,
  // setIsLoading: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  typeForm: PropTypes.oneOf(['edit', 'view']),
  origin: PropTypes.oneOf(['formPatient', 'neuroMonitoring']),
};

export default GeneralMovementsForm;
