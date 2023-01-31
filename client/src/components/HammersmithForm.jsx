/* eslint-disable max-len */
/* eslint-disable no-console */
import React, {
  useState, useEffect, useContext, createContext,
} from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Button, Table,
} from 'reactstrap';
import Label from 'reactstrap/lib/Label';
import Input from 'reactstrap/lib/Input';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import CustomAlert from '../common/CustomAlert';
import '../styles/hammersmithForm.scss';
import { HammerSmithType } from '../models/HammersmithType';
import UserData from '../context/UserData';
import {
  createHammersmith,
  getHammersmithByPatientId,
  updateHammersmithById,
} from '../actions/HammersmithAction';
import HammersmithField from './HammersmithField';
import { updatePatientIndicatorCheck } from '../actions/PatientAction';

const selectedContext = createContext();

const firsColStyle = {
  backgroundColor: 'var(--blue-two)',
  transform: `translateY(${90}px)`,
};
const indicatorStyle = {
  alignText: 'center',
  width: `${100 / 5}%`,
};

const HammersmithForm = ({
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
  const [generalMovementsDataComplete, setHammersmithDataComplete] = useState();
  const [readOnly, setReadOnly] = useState(true);
  const [fieldsFilled, setFieldsFilled] = useState(false);
  const [isFound, setIsFound] = useState(foundType.loading);
  const [lastValues, setLastValues] = useState();
  const setLastValuesHandler = (newValues) => {
    setLastValues(newValues);
  };
  const {
    register, handleSubmit, setValue, getValues, watch,
  } = useForm({
    defaultValues: HammerSmithType,
  });

  const { userData } = useContext(UserData);

  const getDataHammersmith = () => {
    getHammersmithByPatientId(
      origin === 'formPatient' ? idPatientRegister : null,
      origin === 'neuroMonitoring' ? idRegister : null,
    )
      .then(({ data }) => {
        setIsFound(foundType.found);
        Object.keys(data).forEach((key) => setValue(key, data[key]));
        setHammersmithDataComplete(data);
      })
      .catch((e) => {
        setIsFound(foundType.notFound);
        console.log(e?.message);
      });
  };


  const updateHammersmith = (data) => {
    updateHammersmithById(generalMovementsDataComplete?.id, {
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
        getDataHammersmith();
        // const indicatorId = data?.cuestionario?.secuencia?.valorIndicadoresUnoId;
        // let indicatorCharacter = '';
        // switch (indicatorId) {
        //   case '1': indicatorCharacter = 'N'; break;
        //   case '2': indicatorCharacter = 'PR'; break;
        //   case '3': indicatorCharacter = 'CS'; break;
        //   case '4': indicatorCharacter = 'CH'; break;
        //   default: break;
        // }
        // if (origin === 'formPatient') {
        //   // return updatePatientIndicatorCheck(idPatientRegister, indicatorCharacter, indicatorId, data?.puntuacionOptimalidad);
        // }
        return updatePatientIndicatorCheck(idPatientRegister, '', '', data?.resultado);
      })
      .catch((error) => {
        setBtnSubmitDisabled(false);
        setAlert({ status: true, text: error.message || error, color: 'red' });
      });
  };

  const createHammersmithRecord = (data) => {
    createHammersmith({
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
        getDataHammersmith();
        // const indicatorId = data?.cuestionario?.secuencia?.valorIndicadoresUnoId;
        // let indicatorCharacter = '';
        // switch (indicatorId) {
        //   case '1': indicatorCharacter = 'N'; break;
        //   case '2': indicatorCharacter = 'PR'; break;
        //   case '3': indicatorCharacter = 'CS'; break;
        //   case '4': indicatorCharacter = 'CH'; break;
        //   default: break;
        // }
        // if (origin === 'formPatient') {
        return updatePatientIndicatorCheck(idPatientRegister, '', '', data?.resultado);
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
      updateHammersmith(data);
    } else {
      // si no, es create
      createHammersmithRecord(data);
    }
  };

  useEffect(() => {
    getDataHammersmith();
    setFieldsFilled(true);
    setReadOnly(typeForm === 'view');
    // setReadOnly(false)
    // eslint-disable-next-line
  }, []);

  // Hammersmith

  const setResultado = () => {
    if (fieldsFilled) {
      let [resultadoIzq, resultadoDer] = [0, 0];
      const { cuestionario } = getValues();
      const resultado = Object.keys(cuestionario).reduce((a, key) => {
        const resultadoParcial = cuestionario[key].secciones.reduce(
          (a, b) => (a + (Number(b.valorIndicador) >= 1 ? Number(b.valorIndicador) - 1 : 0)),
          0,
        );
        cuestionario[key].secciones.forEach((seccion) => {
          if (seccion.valorAsimetria === 'I') {
            resultadoIzq += 1;
          } else if (seccion.valorAsimetria === 'D') {
            resultadoDer += 1;
          }
        });
        setValue(`cuestionario.${key}.valorSecciones`, resultadoParcial);
        return resultadoParcial + a;
      }, 0);

      setValue('resultadoAsimetria.izquierda', resultadoIzq);
      setValue('resultadoAsimetria.derecha', resultadoDer);
      setValue('resultado', resultado);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(catchData)}
      className={`form-hammersmith form ${
        typeForm === 'view' || origin === 'neuroMonitoring' ? 'mx-0 px-0' : ''
      }`}
    >
      {alert.status ? (
        <CustomAlert text={alert.text} color={alert.color} />
      ) : null}
      {isLoading && isFound === foundType.loading && 'Por favor, espere.'}
      {isFound === foundType.notFound && readOnly && (
      <strong className="mx-5 d-block">
        El usuario no cuenta con un examen neurológico Hammersmith en esta
        sección. Cree uno nuevo en la ventana de edición
      </strong>
      )}
      {!isLoading
          && (isFound === foundType.found
            || (isFound === foundType.notFound && !readOnly)) && (
            // {isLoading ? (
            //   'Por favor, espere.'
            // ) : (
            <Row className="row row-hammersmith">
              <Col xs="12" className="col col-title">
                <h1 className="title">
                  Examen neurológico HAMMERSMITH - 2 a 24 meses
                </h1>
              </Col>
              <Col xs="12" className="col">
                <h4>Resultados</h4>
              </Col>

              <Table bordered>
                <thead>
                  <tr>
                    <th>
                      <p>Pares Craneales</p>
                      <p>15</p>
                    </th>
                    <th>
                      <p>Movimientos</p>
                      <p>6</p>
                    </th>
                    <th>
                      <p>Tono</p>
                      <p>24</p>
                    </th>
                    <th>
                      <p>Postura</p>
                      <p>18</p>
                    </th>
                    <th>
                      <p>Reflejos</p>
                      <p>15</p>
                    </th>
                    <th>
                      <p>Asimetrías</p>
                      <tr className="nested-row">
                        <th>I</th>
                        <th>D</th>
                      </tr>
                    </th>
                    <th>
                      <p>Total</p>
                      <p>78</p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.keys(HammerSmithType.cuestionario).map((key) => (
                      <th>
                        <Input
                          name={`cuestionario.${key}.valorSecciones`}
                          innerRef={register}
                        />
                      </th>
                    ))}
                    <th>
                      <tr className="nested-row">
                        <th>
                          <Input
                            name="resultadoAsimetria.izquierda"
                            innerRef={register}
                          />
                        </th>
                        <th>
                          <Input
                            name="resultadoAsimetria.derecha"
                            innerRef={register}
                          />
                        </th>
                      </tr>
                    </th>
                    <th>
                      <Input name="resultado" innerRef={register} />
                    </th>
                  </tr>
                </tbody>
              </Table>

              {Object.keys(HammerSmithType.cuestionario).map((key) => {
                const { titulo } = HammerSmithType.cuestionario[key];
                const paresCranealesTable = HammerSmithType.cuestionario[key].secciones;
                return (
                  <Col xs="12" className="col">
                    <h4>{titulo}</h4>
                    <Table responsive bordered className="section-table">
                      <colgroup>
                        <col className="first-col" style={firsColStyle} />
                        <col span={4} style={indicatorStyle} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th style={{ padding: '0' }}> </th>
                          <th>3</th>
                          <th>2.5</th>
                          <th>2</th>
                          <th>1.5</th>
                          <th>1</th>
                          <th>0.5</th>
                          <th>0</th>
                          <th>Asimetrías</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paresCranealesTable.map((seccion, seccionId) => (
                          <tr>
                            <td className="prueba">{seccion.subtitulo}</td>
                            {seccion.indicadores.map(
                              (indicador) => (
                                <HammersmithField
                                  indicador={indicador}
                                  readOnly={readOnly}
                                  seccionId={seccionId}
                                  clave={key}
                                  register={register}
                                  // getColorIndicator={getColorIndicator}
                                  setResultado={setResultado}
                                  lastValues={lastValues}
                                  setValue={setValue}
                                  setLastValues={setLastValuesHandler}
                                  getValues={getValues}
                                  watch={watch}
                                  context={selectedContext}
                                  // iconsFolder={iconsFolder}
                                />
                              ),
                            )}
                            <td className="celda-asimetrias">
                              <Row className="row-asimetrias">
                                {seccion.asimetrias?.map(
                                (asimetria, asimetriaId) => (
                                  <Col xs="12" lg="6">
                                    <Label
                                      onClick={(e) => {
                                        console.log('click', asimetriaId);
                                        const input = e.target.children[1];
                                        // eslint-disable-next-line
                                        input?.click();
                                      }}
                                    >
                                      {asimetria.valor}
                                      <Input
                                        key={asimetriaId}
                                        type="radio"
                                        name={`cuestionario.${key}.secciones[${seccionId}].valorAsimetria`}
                                        innerRef={register}
                                        value={asimetria.valor}
                                        className="input-radio"
                                        onChange={setResultado}
                                        onClick={(e) => {
                                          const valorSeleccionado = lastValues?.cuestionario[key]?.secciones[seccionId]?.valorAsimetria;
                                          if (valorSeleccionado === e.target.value) {
                                            setValue(`cuestionario.${key}.secciones[${seccionId}].valorAsimetria`, '');
                                          }
                                          setLastValues(getValues());
                                          setResultado();
                                        }}
                                        disabled={readOnly}
                                      />
                                    </Label>
                                  </Col>
                                ),
                              )}
                              </Row>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                );
              })}

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
  );
};

HammersmithForm.defaultProps = {
  typeForm: 'view',
  isLoading: false,
  origin: 'formPatient',
};

HammersmithForm.propTypes = {
  idRegister: PropTypes.string.isRequired,
  idPatientRegister: PropTypes.string.isRequired,
  // setIsLoading: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  typeForm: PropTypes.oneOf(['edit', 'view']),
  origin: PropTypes.oneOf(['formPatient', 'neuroMonitoring']),
};

export default HammersmithForm;
