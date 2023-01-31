/* eslint-disable no-console */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Button, Label,
} from 'reactstrap';
import Input from 'reactstrap/lib/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import CustomAlert from '../common/CustomAlert';
import '../styles/motorRepertoireForm.scss';
import FieldArrayMotorRepertoire from './FieldArrayMotorRepertoire';
import UserData from '../context/UserData';
import { MotorRepertoireType } from '../models/MotorRepertoireType';
import {
  createMotorRepertoire,
  getMotorRepertoireByPatientId,
  updateMotorRepertoireById,
} from '../actions/MotorRepertoireAction';
import { updatePatientIndicatorCheck } from '../actions/PatientAction';

const MotorRepertoireForm = ({
  idRegister,
  idPatientRegister,
  isLoading,
  ecoWeeksInput,
  typeForm,
  origin,
  // setIsLoading,
}) => {
  const foundType = { loading: 0, found: 1, notFound: 2 };
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [btnSubmitDisabled, setBtnSubmitDisabled] = useState(false);
  const [motorRepertoireDataComplete, setMotorRepertoireDataComplete] = useState(null);
  const [edadCorregidaS, setEdadCorregidaS] = useState(0);
  const [readOnly, setReadOnly] = useState(true);
  const [isFound, setIsFound] = useState(foundType.loading);
  const {
    register,
    handleSubmit,
    errors,
    watch,
    setValue,
    control, // getValues,
  } = useForm({ defaultValues: MotorRepertoireType });

  const { userData } = useContext(UserData);

  const getColorIndicator = (max, valor, seleccionado) => {
    if (seleccionado === valor) {
      switch (Number(valor)) {
        case 12:
          return 'green';
        case 4:
          return Number(max) >= 12 ? 'orange' : 'green';
        case 2:
          return 'orange';
        case 1:
          return 'red';
        default:
          return 'default';
      }
    }
    return 'default';
  };

  const updateForm = (data) => {
    Object.keys(data).forEach((key) => setValue(key, data[key]));
    const valuesToSet = [
      {
        name: 'movimientosFidgety.indicadores',
        value: data?.movimientosFidgety?.indicadores,
      },
      {
        name: 'patronesMovObs.indicadores',
        value: data?.patronesMovObs?.indicadores,
      },
      {
        name: 'patronesPostObs.indicadores',
        value: data?.patronesPostObs?.indicadores,
      },
      {
        name: 'caracterMovimientos.indicadores',
        value: data?.caracterMovimientos?.indicadores,
      },
    ];
    valuesToSet.forEach(({ name, value }) => setValue(name, value));
  };

  const getDataMotorRepertoire = () => {
    getMotorRepertoireByPatientId(
      origin === 'formPatient' ? idPatientRegister : null,
      origin === 'neuroMonitoring' ? idRegister : null,
    )
      .then(({ data }) => {
        setIsFound(foundType.found);
        setMotorRepertoireDataComplete(data);
      })
      .catch((e) => {
        setIsFound(foundType.notFound);
        console.log(e?.message);
      });
  };

  const setPuntuacionOptimalidad = () => {
    let total = 0;
    const optimalidadMotoraValues = watch('optimalidadMotora');
    Object.values(optimalidadMotoraValues).forEach((optimalidad) => {
      total += Number(optimalidad.valorSeleccionado || 0);
    });
    setValue('puntuacionOptimalidadMotora', total);
  };

  const setPuntuacionRepMotEdad = () => {
    let movimientosAdecEdadT = 0;
    const patronesMovObsInd = watch('patronesMovObs.indicadores');
    // const edadCorregidaS = 16;
    if (edadCorregidaS >= 9 && edadCorregidaS <= 11) {
      const totalNormales = patronesMovObsInd.filter((indicador) => {
        return indicador?.valorSeleccionado === 'N';
      });
      if (totalNormales?.length === 1 || totalNormales?.length === 2) {
        movimientosAdecEdadT = 1;
      } else if (totalNormales?.length === 3) {
        movimientosAdecEdadT = 2;
      } else if (totalNormales?.length >= 4) {
        movimientosAdecEdadT = 4;
      }
    } else if (edadCorregidaS >= 12 && edadCorregidaS <= 13) {
      // Pie pie tiene que ser normal para que se tome en cuenta
      const isPiePie = patronesMovObsInd[13]?.valorSeleccionado; // N || A || ''
      const totalNormales = patronesMovObsInd.filter((indicador) => {
        return indicador?.valorSeleccionado === 'N';
      });
      const totalNormalesSinPie = patronesMovObsInd.filter(
        (indicador, index) => {
          return index !== 13 && indicador?.valorSeleccionado === 'N';
        },
      );
      if (isPiePie === 'N' && totalNormalesSinPie?.length >= 3) {
        movimientosAdecEdadT = 4;
      } else if (totalNormales?.length < 4) {
        movimientosAdecEdadT = 1;
      } else {
        // 4 normales o más
        // eslint-disable-next-line no-lonely-if
        if (isPiePie === 'A') {
          // pie pie tiene que ser anormal y 4 normales extras o más
          movimientosAdecEdadT = 2;
        }
      }
    } else if (edadCorregidaS >= 14 && edadCorregidaS <= 15) {
      const isPiePie = patronesMovObsInd[13]?.valorSeleccionado; // N || A || ''
      const isManoMano = patronesMovObsInd[4]?.valorSeleccionado; // N || A || ''
      const totalNormalesSPieMano = patronesMovObsInd.filter(
        (indicador, index) => {
          return (
            index !== 13 && index !== 4 && indicador?.valorSeleccionado === 'N'
          );
        },
      );
      if (isPiePie === 'N' && isManoMano === 'N') {
        if (totalNormalesSPieMano?.length >= 2) {
          movimientosAdecEdadT = 4;
        } else {
          movimientosAdecEdadT = 2;
        }
      } else if (isPiePie === 'N' || isManoMano === 'N') {
        if (totalNormalesSPieMano?.length >= 3) {
          movimientosAdecEdadT = 2;
        } else {
          movimientosAdecEdadT = 1;
        }
      }
      if (isPiePie === 'A' && isManoMano === 'A') {
        movimientosAdecEdadT = 1;
      }
    } else if (edadCorregidaS >= 16) {
      const isPiePie = patronesMovObsInd[13]?.valorSeleccionado; // N || A || ''
      const isManoMano = patronesMovObsInd[4]?.valorSeleccionado; // N || A || ''
      const isElevacionPiernas = patronesMovObsInd[16]?.valorSeleccionado; // N || A || ''
      const totalNormalesS3 = patronesMovObsInd.filter((indicador, index) => {
        return (
          index !== 13
          && index !== 4
          && index !== 16
          && indicador?.valorSeleccionado === 'N'
        );
      });
      if (
        isPiePie === 'N'
        && isManoMano === 'N'
        && isElevacionPiernas === 'N'
      ) {
        if (totalNormalesS3?.length >= 1) {
          movimientosAdecEdadT = 4;
        } else {
          movimientosAdecEdadT = 2;
        }
      } else if (
        // dos de los anteriores +  2 normales
        // eslint-disable-next-line max-len
        (isPiePie === 'N' && isManoMano === 'N')
        || (isPiePie === 'N' && isElevacionPiernas === 'N')
        || (isManoMano === 'N' && isElevacionPiernas === 'N')
      ) {
        if (totalNormalesS3?.length >= 2) {
          movimientosAdecEdadT = 2;
        } else {
          movimientosAdecEdadT = 1;
        }
      } else if (
        isPiePie === 'A'
        && isManoMano === 'A'
        && isElevacionPiernas === 'A'
      ) {
        // ninguno de los anteriores
        movimientosAdecEdadT = 1;
      } else if (
        // solo uno de los anteriores
        (isPiePie === 'N'
          && isManoMano === 'A'
          && isElevacionPiernas === 'A')
        || (isPiePie === 'A'
          && isManoMano === 'N'
          && isElevacionPiernas === 'A')
        || (isPiePie === 'A' && isManoMano === 'A' && isElevacionPiernas === 'N')
      ) {
        movimientosAdecEdadT = 1;
      }
    }
    // const patronesMovObsN = Number(optimPatronesMovObs.valorNormal || 0);
    setValue('repMovAdecEdad.valorSeleccionado', movimientosAdecEdadT);
    setValue('repMovAdecEdad.edadCorregidaSemanas', edadCorregidaS);
    setValue(
      'optimalidadMotora.movimientosAdecEdad.valorSeleccionado',
      movimientosAdecEdadT,
    );
    setPuntuacionOptimalidad();
  };

  const setPuntuacionParcial = (calcularPuntRepMotEdad = false) => {
    let patronesMovObs = 0;
    let patronesPostObs = 0;
    let caracterMovimientos = 0;

    const optimPatronesMovObs = watch('patronesMovObs');
    const patronesMovObsN = Number(optimPatronesMovObs.valorNormal || 0);
    const patronesMovObsA = Number(optimPatronesMovObs.valorAtipico || 0);
    if (patronesMovObsN > patronesMovObsA) {
      patronesMovObs = 4;
    } else if (patronesMovObsN === patronesMovObsA) {
      patronesMovObs = 2;
    } else if (patronesMovObsN < patronesMovObsA) {
      patronesMovObs = 1;
    }

    const optimPatronesPostObs = watch('patronesPostObs');
    const patronesPostObsN = Number(optimPatronesPostObs.valorNormal || 0);
    const patronesPostObsA = Number(optimPatronesPostObs.valorAtipico || 0);
    if (patronesPostObsN > patronesPostObsA) {
      patronesPostObs = 4;
    } else if (patronesPostObsN === patronesPostObsA) {
      patronesPostObs = 2;
    } else if (patronesPostObsN < patronesPostObsA) {
      patronesPostObs = 1;
    }
    const caracterMovInds = watch('caracterMovimientos.indicadores');
    if (caracterMovInds[0].valorSeleccionado === 'N') {
      caracterMovimientos = 4;
    } else if (
      caracterMovInds[0].valorSeleccionado !== 'N'
      && caracterMovInds[7].valorSeleccionado === ''
    ) {
      // verificar que haya puros anormales, pero no cs
      caracterMovimientos = 2;
    } else if (caracterMovInds[7].valorSeleccionado !== '') {
      caracterMovimientos = 1;
    }
    setValue(
      'optimalidadMotora.patronesMovObs.valorSeleccionado',
      patronesMovObs,
    );
    setValue(
      'optimalidadMotora.patronesPostObs.valorSeleccionado',
      patronesPostObs,
    );
    setValue(
      'optimalidadMotora.caracterMovimientos.valorSeleccionado',
      caracterMovimientos,
    );
    setTimeout(() => {
      if (calcularPuntRepMotEdad) {
        setPuntuacionRepMotEdad();
      } else {
        setPuntuacionOptimalidad();
      }
    }, 300);
  };

  const clickRadioValueFidgety = (e) => {
    const movFidgetySelected = watch('movimientosFidgety.valorSeleccionado') || '';
    if (e.target.value === movFidgetySelected) {
      setValue('movimientosFidgety.valorSeleccionado', '');
      setValue('optimalidadMotora.movimientosFidgety.valorSeleccionado', 0);
    } else {
      setValue('movimientosFidgety.valorSeleccionado', e.target.value);
      let movimientosFidgetyT = 0;
      const movFidgetySelected = watch('movimientosFidgety.valorSeleccionado') || '';
      if (movFidgetySelected === 'F' || movFidgetySelected === 'FeN') {
        movimientosFidgetyT = 12;
      } else if (movFidgetySelected === 'AF') {
        movimientosFidgetyT = 4;
      } else if (movFidgetySelected === 'F-' || movFidgetySelected === 'FeA') {
        movimientosFidgetyT = 1;
      }
      setValue(
        'optimalidadMotora.movimientosFidgety.valorSeleccionado',
        movimientosFidgetyT,
      );
    }
    setPuntuacionOptimalidad();
  };

  const updateMotorRepertoire = (data) => {
    updateMotorRepertoireById(motorRepertoireDataComplete?.id, {
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
        getDataMotorRepertoire();
        const indicatorCharacter = data?.movimientosFidgety?.valorSeleccionado;
        // if (origin === 'formPatient') {
        return updatePatientIndicatorCheck(
          idPatientRegister,
          indicatorCharacter,
          '',
            data?.puntuacionOptimalidadMotora,
        );
        // }
      })
      .catch((error) => {
        setBtnSubmitDisabled(false);
        setAlert({ status: true, text: error.message || error, color: 'red' });
      });
  };

  const createMotorRepertoir = (data) => {
    createMotorRepertoire({
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
        getDataMotorRepertoire();
        const indicatorCharacter = data?.movimientosFidgety?.valorSeleccionado;
        // if (origin === 'formPatient') {
        return updatePatientIndicatorCheck(
          idPatientRegister,
          indicatorCharacter,
          '',
            data?.puntuacionOptimalidadMotora,
        );
        // }
      })
      .catch((error) => {
        setBtnSubmitDisabled(false);
        setAlert({ status: true, text: error.message || error, color: 'red' });
      });
  };

  const catchData = (data) => {
    const puntuacion = Number(data.puntuacionOptimalidadMotora);
    if (puntuacion < 5 || puntuacion > 28) {
      setAlert({
        status: true,
        text: 'El MOS debe ser mayor o igual a 5 y menor o igual a 28',
        color: 'red',
      });
      return;
    }
    setBtnSubmitDisabled(true);
    setAlert({
      status: true,
      text: 'Cargando ... No cancele el proceso',
      color: 'blue-two',
    });
    if (motorRepertoireDataComplete?.id) {
      // si tiene id es update
      updateMotorRepertoire(data);
    } else {
      // si no, es create
      createMotorRepertoir(data);
    }
  };

  useEffect(() => {
    getDataMotorRepertoire();
    setReadOnly(typeForm === 'view');
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (motorRepertoireDataComplete) {
      updateForm(motorRepertoireDataComplete);
      setPuntuacionParcial(true);
    }
    // eslint-disable-next-line
  }, [isFound, motorRepertoireDataComplete]);

  useEffect(() => {
    const edadCorregidaSemanas = Number(ecoWeeksInput?.split(' s')[0] || 0); // < 39 s, 0 d >
    setEdadCorregidaS(edadCorregidaSemanas);
    // eslint-disable-next-line
  }, [ecoWeeksInput]);

  return (
    // notFound ?
    // <div className='not-found'>
    // </div> :
    <>
      <form
        onSubmit={handleSubmit(catchData)}
        className={`form-motor-repertoire form ${
          typeForm === 'view' || origin === 'neuroMonitoring' ? 'mx-0 px-0' : ''
        }`}
      >
        {alert.status ? (
          <CustomAlert text={alert.text} color={alert.color} />
        ) : null}
        {isLoading && isFound === foundType.loading && 'Por favor, espere.'}
        {isFound === foundType.notFound && readOnly && (
          <strong className="mx-5 d-block">
            El usuario no cuenta con una evaluación del repertorio motor en esta
            sección. Cree uno nuevo en la ventana de edición
          </strong>
        )}
        {!isLoading
          && (isFound === foundType.found
            || (isFound === foundType.notFound && !readOnly)) && (
            <Row className="row row-motor-repertoire">
              <Col xs="12" className="col col-title">
                <h1 className="title">
                  Evaluación del Repertorio Motor - 3 a 5 meses
                </h1>
              </Col>
              <Col
                xs="12"
                style={{
                  borderBottom: '1px solid var(--blue-one)',
                  paddingBottom: '10px',
                  paddingTop: '10px',
                }}
              >
                <Input
                  name="movimientosFidgety.titulo"
                  addon
                  innerRef={register()}
                  type="hidden"
                  disabled
                />
                <Input
                  id="movimientosFidgety.valorSeleccionado"
                  name="movimientosFidgety.valorSeleccionado"
                  addon
                  // innerRef={register({ required: true })}
                  innerRef={register()}
                  type="hidden"
                  min="0"
                  max="16"
                  disabled
                  className="input-custom"
                />
                <fieldset
                  id="radio-group-movimientosFidgety"
                  name="movimientosFidgety.valorSeleccionado"
                >
                  <Row className="row-field-array-motor-repertoire">
                    <Col xs="12">
                      <h5>
                        <strong>{watch('movimientosFidgety.titulo')}</strong>
                      </h5>
                    </Col>
                    <Col xs="6" md="3" className="">
                      <Input
                        addon
                        type="radio"
                        value={watch(
                          'movimientosFidgety.indicadores.movimientoFidgety.valor',
                        )}
                        className="input-radio radio-normal"
                        name="radio-group-movimientosFidgety"
                        onChange={() => null}
                        onClick={(e) => clickRadioValueFidgety(e)}
                        checked={
                          watch(
                            'movimientosFidgety.indicadores.movimientoFidgety.valor',
                          ) === watch('movimientosFidgety.valorSeleccionado')
                        }
                        disabled={readOnly}
                      />
                      <Label className="label-radio-value green">
                        {watch(
                          'movimientosFidgety.indicadores.movimientoFidgety.indicador',
                        )}
                      </Label>
                      <Input
                        name="movimientosFidgety.indicadores.movimientoFidgety.valor"
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
                      <Input
                        name="movimientosFidgety.indicadores.movimientoFidgety.indicador"
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
                      <Input
                        name="movimientosFidgety.indicadores.movimientoFidgety.estatus"
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
                    </Col>
                    <Col xs="6" md="3" className="">
                      <Input
                        value={watch(
                          'movimientosFidgety.indicadores.anormalExagerado.valor',
                        )}
                        type="radio"
                        className="input-radio radio-anormal"
                        name="radio-group-movimientosFidgety"
                        onChange={() => null}
                        onClick={(e) => clickRadioValueFidgety(e)}
                        checked={
                          watch(
                            'movimientosFidgety.indicadores.anormalExagerado.valor',
                          ) === watch('movimientosFidgety.valorSeleccionado')
                        }
                        disabled={readOnly}
                      />
                      <Label className="label-radio-value red">
                        {watch(
                          'movimientosFidgety.indicadores.anormalExagerado.indicador',
                        )}
                      </Label>
                      <Input
                        name="movimientosFidgety.indicadores.anormalExagerado.valor"
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
                      <Input
                        name="movimientosFidgety.indicadores.anormalExagerado.indicador"
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
                      <Input
                        name="movimientosFidgety.indicadores.anormalExagerado.estatus"
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
                    </Col>
                    <Col xs="6" md="2" className="">
                      <Input
                        type="radio"
                        value={watch(
                          'movimientosFidgety.indicadores.ausente.valor',
                        )}
                        className="input-radio radio-anormal"
                        name="radio-group-movimientosFidgety"
                        onChange={() => null}
                        onClick={(e) => clickRadioValueFidgety(e)}
                        checked={
                          watch(
                            'movimientosFidgety.indicadores.ausente.valor',
                          ) === watch('movimientosFidgety.valorSeleccionado')
                        }
                        disabled={readOnly}
                      />
                      <Label className="label-radio-value red">
                        {watch(
                          'movimientosFidgety.indicadores.ausente.indicador',
                        )}
                      </Label>
                      <Input
                        name="movimientosFidgety.indicadores.ausente.valor"
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
                      <Input
                        name="movimientosFidgety.indicadores.ausente.indicador"
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
                      <Input
                        name="movimientosFidgety.indicadores.ausente.estatus"
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
                    </Col>
                    <Col xs="6" md="4" className="">
                      <Row>
                        <Col xs="2">
                          <Input
                            type="radio"
                            value={watch(
                              'movimientosFidgety.indicadores.esporadico.valor',
                            )}
                            className="input-radio radio-normal"
                            name="radio-group-movimientosFidgety"
                            onChange={() => null}
                            onClick={(e) => clickRadioValueFidgety(e)}
                            checked={
                              watch(
                                'movimientosFidgety.indicadores.esporadico.valor',
                              )
                              === watch('movimientosFidgety.valorSeleccionado')
                            }
                            disabled={readOnly}
                          />
                          <Label className="green">
                            {watch(
                              'movimientosFidgety.indicadores.esporadico.valor',
                            )}
                          </Label>
                        </Col>
                        <Col xs="2">
                          <Input
                            type="radio"
                            value={watch(
                              'movimientosFidgety.indicadores.esporadico.valor2',
                            )}
                            className="input-radio radio-anormal"
                            name="radio-group-movimientosFidgety"
                            onChange={() => null}
                            onClick={(e) => clickRadioValueFidgety(e)}
                            checked={
                              watch(
                                'movimientosFidgety.indicadores.esporadico.valor2',
                              )
                              === watch('movimientosFidgety.valorSeleccionado')
                            }
                            disabled={readOnly}
                          />
                          <Label className="red">
                            {watch(
                              'movimientosFidgety.indicadores.esporadico.valor2',
                            )}
                          </Label>
                        </Col>
                        <Col xs="8">
                          <Label className="label-radio-value default">
                            {watch(
                              'movimientosFidgety.indicadores.esporadico.indicador',
                            )}
                          </Label>
                          <Input
                            name="movimientosFidgety.indicadores.esporadico.valor"
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
                          <Input
                            name="movimientosFidgety.indicadores.esporadico.valor2"
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
                          <Input
                            name="movimientosFidgety.indicadores.esporadico.indicador"
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
                          <Input
                            name="movimientosFidgety.indicadores.esporadico.estatus"
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
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </fieldset>
              </Col>

              <Col
                xs="12"
                style={{
                  borderBottom: '1px solid var(--blue-one)',
                  paddingBottom: '10px',
                  paddingTop: '10px',
                }}
              >
                <FieldArrayMotorRepertoire
                  nameField="patronesMovObs"
                  setPuntuacionParcial={setPuntuacionParcial}
                  titulo={watch('patronesMovObs.titulo')}
                  {...{
                    control,
                    register,
                    errors,
                    setValue,
                    watch,
                  }}
                  readOnly={readOnly}
                />
              </Col>

              {/* INICIO FORMULARIO CONDICIONAL */}
              <Col
                xs="12"
                style={{
                  borderBottom: '1px solid var(--blue-one)',
                  paddingBottom: '10px',
                  paddingTop: '10px',
                }}
              >
                <Input
                  name="repMovAdecEdad.titulo"
                  addon
                  innerRef={register()}
                  type="hidden"
                  disabled
                />
                <Input
                  id="repMovAdecEdad.valorSeleccionado"
                  name="repMovAdecEdad.valorSeleccionado"
                  addon
                  innerRef={register()}
                  type="hidden"
                  disabled
                  className="input-custom"
                />
                <Input
                  id="repMovAdecEdad.edadCorregidaSemanas"
                  name="repMovAdecEdad.edadCorregidaSemanas"
                  addon
                  innerRef={register()}
                  type="hidden"
                  disabled
                  className="input-custom"
                />
                <Row className="row-field-array-motor-repertoire">
                  <Col xs="12">
                    <h5>
                      <strong>
                        {watch('repMovAdecEdad.titulo')}
                        <span
                          style={{ color: 'var(--pink)' }}
                        >
                          {` - ${edadCorregidaS} SG`}
                        </span>
                      </strong>
                    </h5>
                  </Col>
                </Row>
                <Row>
                  {!edadCorregidaS || edadCorregidaS < 9 ? (
                    <Col xs="12">
                      <strong style={{ color: 'var(--pink)' }}>
                        PERIODO DE TRANSICIÓN
                      </strong>
                    </Col>
                  ) : (
                    <>
                      <Col xs="8" className="col-label">
                        <strong>Movimientos observados</strong>
                      </Col>
                      <Col xs="4">
                        <strong>Puntuación</strong>
                      </Col>
                    </>
                  )}
                  {edadCorregidaS >= 9 && edadCorregidaS <= 11 && (
                    <Col xs="12" className="col-input">
                      {Object.keys(
                        MotorRepertoireType.repMovAdecEdad.indicadores9a11,
                      ).map(
                        (key) => key !== 'valorSeleccionado' && (
                        <Row key={key}>
                          <Col xs="8">
                            <Label>
                              {watch(
                                `repMovAdecEdad.indicadores9a11.${key}.text`,
                              )}
                            </Label>
                            <Input
                              id={`repMovAdecEdad.indicadores9a11.${key}.text`}
                              name={`repMovAdecEdad.indicadores9a11.${key}.text`}
                              addon
                              innerRef={register()}
                              type="hidden"
                              disabled
                              className="input-custom"
                            />
                          </Col>
                          <Col xs="4">
                            <Input
                              id={`repMovAdecEdad.indicadores9a11.${key}.valor`}
                              name={`repMovAdecEdad.indicadores9a11.${key}.valor`}
                              addon
                              innerRef={register()}
                              type="number"
                              disabled
                              className="input-custom input-w-50"
                            />
                          </Col>
                        </Row>
                        ),
                      )}
                    </Col>
                  )}
                  {edadCorregidaS >= 12 && edadCorregidaS <= 13 && (
                    <Col xs="12" className="col-input">
                      {Object.keys(
                        MotorRepertoireType.repMovAdecEdad.indicadores12a13,
                      ).map(
                        (key) => key !== 'valorSeleccionado' && (
                        <Row key={key}>
                          <Col xs="8">
                            <Label>
                              {watch(
                                `repMovAdecEdad.indicadores12a13.${key}.text`,
                              )}
                            </Label>
                            <Input
                              id={`repMovAdecEdad.indicadores12a13.${key}.text`}
                              name={`repMovAdecEdad.indicadores12a13.${key}.text`}
                              addon
                              innerRef={register()}
                              type="hidden"
                              disabled
                              className="input-custom"
                            />
                          </Col>
                          <Col xs="4">
                            <Input
                              id={`repMovAdecEdad.indicadores12a13.${key}.valor`}
                              name={`repMovAdecEdad.indicadores12a13.${key}.valor`}
                              addon
                              innerRef={register()}
                              type="number"
                              disabled
                              className={`input-custom input-w-50 ${
                                watch(
                                  `repMovAdecEdad.indicadores12a13.${key}.valor`,
                                )
                                    === watch('repMovAdecEdad.valorSeleccionado')
                                  ? 'input-score-selected'
                                  : ''
                              }`}
                            />
                          </Col>
                        </Row>
                        ),
                      )}
                    </Col>
                  )}
                  {edadCorregidaS >= 14 && edadCorregidaS <= 15 && (
                    <Col xs="12" className="col-input">
                      {Object.keys(
                        MotorRepertoireType.repMovAdecEdad.indicadores14a15,
                      ).map(
                        (key) => key !== 'valorSeleccionado' && (
                        <Row key={key}>
                          <Col xs="8">
                            <Label>
                              {watch(
                                `repMovAdecEdad.indicadores14a15.${key}.text`,
                              )}
                            </Label>
                            <Input
                              id={`repMovAdecEdad.indicadores14a15.${key}.text`}
                              name={`repMovAdecEdad.indicadores14a15.${key}.text`}
                              addon
                              innerRef={register()}
                              type="hidden"
                              disabled
                              className="input-custom"
                            />
                          </Col>
                          <Col xs="4">
                            <Input
                              id={`repMovAdecEdad.indicadores14a15.${key}.valor`}
                              name={`repMovAdecEdad.indicadores14a15.${key}.valor`}
                              addon
                              innerRef={register()}
                              type="number"
                              disabled
                              className={`input-custom input-w-50 ${
                                watch(
                                  `repMovAdecEdad.indicadores14a15.${key}.valor`,
                                )
                                    === watch('repMovAdecEdad.valorSeleccionado')
                                  ? 'input-score-selected'
                                  : ''
                              }`}
                            />
                          </Col>
                        </Row>
                        ),
                      )}
                    </Col>
                  )}
                  {edadCorregidaS >= 16 && (
                    <Col xs="12" className="col-input">
                      {Object.keys(
                        MotorRepertoireType.repMovAdecEdad.indicadores16omas,
                      ).map(
                        (key) => key !== 'valorSeleccionado' && (
                        <Row key={key}>
                          <Col xs="8">
                            <Label>
                              {watch(
                                `repMovAdecEdad.indicadores16omas.${key}.text`,
                              )}
                            </Label>
                            <Input
                              id={`repMovAdecEdad.indicadores16omas.${key}.text`}
                              name={`repMovAdecEdad.indicadores16omas.${key}.text`}
                              addon
                              innerRef={register()}
                              type="hidden"
                              disabled
                              className="input-custom"
                            />
                          </Col>
                          <Col xs="4">
                            <Input
                              id={`repMovAdecEdad.indicadores16omas.${key}.valor`}
                              name={`repMovAdecEdad.indicadores16omas.${key}.valor`}
                              addon
                              innerRef={register()}
                              type="number"
                              disabled
                              className={`input-custom input-w-50 ${
                                watch(
                                  `repMovAdecEdad.indicadores16omas.${key}.valor`,
                                )
                                    === watch('repMovAdecEdad.valorSeleccionado')
                                  ? 'input-score-selected'
                                  : ''
                              }`}
                            />
                          </Col>
                        </Row>
                        ),
                      )}
                    </Col>
                  )}
                </Row>
              </Col>
              {/* FIN FORMULARIO CONDICIONAL */}

              <Col
                xs="12"
                style={{
                  borderBottom: '1px solid var(--blue-one)',
                  paddingBottom: '10px',
                  paddingTop: '10px',
                }}
              >
                <FieldArrayMotorRepertoire
                  nameField="patronesPostObs"
                  setPuntuacionParcial={setPuntuacionParcial}
                  titulo={watch('patronesPostObs.titulo')}
                  {...{
                    control,
                    register,
                    errors,
                    setValue,
                    watch,
                  }}
                />
              </Col>
              <Col
                xs="12"
                style={{
                  borderBottom: '1px solid var(--blue-one)',
                  paddingBottom: '10px',
                  paddingTop: '10px',
                }}
              >
                <FieldArrayMotorRepertoire
                  nameField="caracterMovimientos"
                  setPuntuacionParcial={setPuntuacionParcial}
                  titulo={watch('caracterMovimientos.titulo')}
                  {...{
                    control,
                    register,
                    errors,
                    setValue,
                    watch,
                  }}
                />
              </Col>

              <Col xs="12" lg="2" className="col-puntuacion-parcial subtitle">
                <Label>Nivel de optimalidad motora</Label>
              </Col>
              <Col xs="12" lg="10" className="col-puntuacion-parcial">
                <Row>
                  <Col xs="6" className="col-label">
                    <Label>1. Movimientos Fidgety + ++, * ** ±</Label>
                    <Input
                      id="optimalidadMotora.movimientosFidgety.valorSeleccionado"
                      name="optimalidadMotora.movimientosFidgety.valorSeleccionado"
                      addon
                      innerRef={register()}
                      type="hidden"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                  <Col xs="4" className="col-input">
                    {Object.keys(
                      MotorRepertoireType.optimalidadMotora.movimientosFidgety,
                    ).map(
                      (key) => key !== 'valorSeleccionado' && (
                      <Row key={key}>
                        <Col xs="7">
                          <Input
                            id={`optimalidadMotora.movimientosFidgety.${key}.text`}
                            name={`optimalidadMotora.movimientosFidgety.${key}.text`}
                            addon
                            innerRef={register()}
                            type="text"
                            disabled
                            className="input-custom"
                          />
                        </Col>
                        <Col xs="5">
                          <Input
                            id={`optimalidadMotora.movimientosFidgety.${key}.valor`}
                            name={`optimalidadMotora.movimientosFidgety.${key}.valor`}
                            addon
                            innerRef={register()}
                            min="0"
                            max="12"
                            disabled
                                // className="input-custom"
                            className={`input-custom input-${getColorIndicator(
                              watch(
                                'optimalidadMotora.movimientosFidgety.normal.valor',
                              ),
                              watch(
                                `optimalidadMotora.movimientosFidgety.${key}.valor`,
                              ),
                              watch(
                                'optimalidadMotora.movimientosFidgety.valorSeleccionado',
                              ),
                            )}`}
                          />
                        </Col>
                      </Row>
                      ),
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col xs="6" className="col-label">
                    <Label>2. Patrones de movimiento observados</Label>
                    <Input
                      id="optimalidadMotora.patronesMovObs.valorSeleccionado"
                      name="optimalidadMotora.patronesMovObs.valorSeleccionado"
                      addon
                      innerRef={register()}
                      type="hidden"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                  <Col xs="4" className="col-input">
                    {Object.keys(
                      MotorRepertoireType.optimalidadMotora.patronesMovObs,
                    ).map(
                      (key) => key !== 'valorSeleccionado' && (
                      <Row key={key}>
                        <Col xs="7">
                          <Input
                            id={`optimalidadMotora.patronesMovObs.${key}.text`}
                            name={`optimalidadMotora.patronesMovObs.${key}.text`}
                            addon
                            innerRef={register()}
                            type="text"
                            disabled
                            className="input-custom"
                          />
                        </Col>
                        <Col xs="5">
                          <Input
                            id={`optimalidadMotora.patronesMovObs.${key}.valor`}
                            name={`optimalidadMotora.patronesMovObs.${key}.valor`}
                            addon
                            innerRef={register()}
                            min="0"
                            max="12"
                            disabled
                                // className="input-custom"
                            className={`input-custom input-${getColorIndicator(
                              watch(
                                'optimalidadMotora.patronesMovObs.nMayorA.valor',
                              ),
                              watch(
                                `optimalidadMotora.patronesMovObs.${key}.valor`,
                              ),
                              watch(
                                'optimalidadMotora.patronesMovObs.valorSeleccionado',
                              ),
                            )}`}
                          />
                        </Col>
                      </Row>
                      ),
                    )}
                  </Col>
                </Row>

                <Row>
                  <Col xs="6" className="col-label">
                    <Label>
                      3. Repertorio de movimientos adecuados para la edad
                    </Label>
                    <small>No considere movimientos fidgety</small>
                    <Input
                      id="optimalidadMotora.movimientosAdecEdad.valorSeleccionado"
                      name="optimalidadMotora.movimientosAdecEdad.valorSeleccionado"
                      addon
                      innerRef={register()}
                      type="hidden"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                  <Col xs="4" className="col-input">
                    {Object.keys(
                      MotorRepertoireType.optimalidadMotora.movimientosAdecEdad,
                    ).map(
                      (key) => key !== 'valorSeleccionado' && (
                      <Row key={key}>
                        <Col xs="7">
                          <Input
                            id={`optimalidadMotora.movimientosAdecEdad.${key}.text`}
                            name={`optimalidadMotora.movimientosAdecEdad.${key}.text`}
                            addon
                            innerRef={register()}
                            type="text"
                            disabled
                            className="input-custom"
                          />
                        </Col>
                        <Col xs="5">
                          <Input
                            id={`optimalidadMotora.movimientosAdecEdad.${key}.valor`}
                            name={`optimalidadMotora.movimientosAdecEdad.${key}.valor`}
                            addon
                            innerRef={register()}
                            min="0"
                            max="12"
                            disabled
                            className={`input-custom input-${getColorIndicator(
                              watch(
                                'optimalidadMotora.movimientosAdecEdad.nMayorA.valor',
                              ),
                              watch(
                                `optimalidadMotora.movimientosAdecEdad.${key}.valor`,
                              ),
                              watch(
                                'optimalidadMotora.movimientosAdecEdad.valorSeleccionado',
                              ),
                              true,
                            )}`}
                          />
                        </Col>
                      </Row>
                      ),
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col xs="6" className="col-label">
                    <Label>4. Patrones posturales observados</Label>
                    <Input
                      id="optimalidadMotora.patronesPostObs.valorSeleccionado"
                      name="optimalidadMotora.patronesPostObs.valorSeleccionado"
                      addon
                      innerRef={register()}
                      type="hidden"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                  <Col xs="4" className="col-input">
                    {Object.keys(
                      MotorRepertoireType.optimalidadMotora.patronesPostObs,
                    ).map(
                      (key) => key !== 'valorSeleccionado' && (
                      <Row key={key}>
                        <Col xs="7">
                          <Input
                            id={`optimalidadMotora.patronesPostObs.${key}.text`}
                            name={`optimalidadMotora.patronesPostObs.${key}.text`}
                            addon
                            innerRef={register()}
                            type="text"
                            disabled
                            className="input-custom"
                          />
                        </Col>
                        <Col xs="5">
                          <Input
                            id={`optimalidadMotora.patronesPostObs.${key}.valor`}
                            name={`optimalidadMotora.patronesPostObs.${key}.valor`}
                            addon
                            innerRef={register()}
                            min="0"
                            max="12"
                            disabled
                            className={`input-custom input-${getColorIndicator(
                              watch(
                                'optimalidadMotora.patronesPostObs.nMayorA.valor',
                              ),
                              watch(
                                `optimalidadMotora.patronesPostObs.${key}.valor`,
                              ),
                              watch(
                                'optimalidadMotora.patronesPostObs.valorSeleccionado',
                              ),
                            )}`}
                          />
                        </Col>
                      </Row>
                      ),
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col xs="6" className="col-label">
                    <Label>5. Caracter del movimiento</Label>
                    <Input
                      id="optimalidadMotora.caracterMovimientos.valorSeleccionado"
                      name="optimalidadMotora.caracterMovimientos.valorSeleccionado"
                      addon
                      innerRef={register()}
                      type="hidden"
                      disabled
                      className="input-custom"
                    />
                  </Col>
                  <Col xs="4" className="col-input">
                    {Object.keys(
                      MotorRepertoireType.optimalidadMotora.caracterMovimientos,
                    ).map(
                      (key) => key !== 'valorSeleccionado' && (
                      <Row key={key}>
                        <Col xs="7">
                          <Input
                            id={`optimalidadMotora.caracterMovimientos.${key}.text`}
                            name={`optimalidadMotora.caracterMovimientos.${key}.text`}
                            addon
                            innerRef={register()}
                            type="textarea"
                            rows="2"
                            disabled
                            className="input-custom"
                          />
                        </Col>
                        <Col xs="5">
                          <Input
                            id={`optimalidadMotora.caracterMovimientos.${key}.valor`}
                            name={`optimalidadMotora.caracterMovimientos.${key}.valor`}
                            addon
                            innerRef={register()}
                                // type="number"
                            min="0"
                            max="12"
                            disabled
                            className={`input-custom input-${getColorIndicator(
                              watch(
                                'optimalidadMotora.caracterMovimientos.nMayorA.valor',
                              ),
                              watch(
                                `optimalidadMotora.caracterMovimientos.${key}.valor`,
                              ),
                              watch(
                                'optimalidadMotora.caracterMovimientos.valorSeleccionado',
                              ),
                            )}`}
                          />
                        </Col>
                      </Row>
                      ),
                    )}
                  </Col>
                </Row>
              </Col>

              <Col xs="12" className="col-puntuacion">
                <div className="container-puntuacion">
                  <Label>
                    Puntaje de optimalidad motora (MOS):
                    <br />
                    <small>Max. 28; Min. 5</small>
                  </Label>
                  <Input
                    id="puntuacionOptimalidadMotora"
                    name="puntuacionOptimalidadMotora"
                    addon
                    // innerRef={register({ required: true })}
                    innerRef={register()}
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

MotorRepertoireForm.defaultProps = {
  ecoWeeksInput: null,
  typeForm: 'view',
  isLoading: false,
  origin: 'formPatient',
};

MotorRepertoireForm.propTypes = {
  idRegister: PropTypes.string.isRequired,
  idPatientRegister: PropTypes.string.isRequired,
  ecoWeeksInput: PropTypes.string,
  // setIsLoading: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  typeForm: PropTypes.oneOf(['edit', 'view']),
  origin: PropTypes.oneOf(['formPatient', 'neuroMonitoring']),
};

export default MotorRepertoireForm;
