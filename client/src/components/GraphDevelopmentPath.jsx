/* eslint-disable no-plusplus */
/* eslint-disable prefer-template */
/* eslint-disable max-len */
/* eslint-disable func-names */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import { defaultValuesDevelopmentGraph } from '../utils/defaultValuesGraphs';
import '../styles/graphDevelopmentPath.scss';
import { getGeneralMovementsByPatientMonitoringId } from '../actions/GeneralMovementsAction';
import { getMotorRepertoireByPatientMonitoringId } from '../actions/MotorRepertoireAction';
import { getEcoWeeksPrePost } from '../utils/formulas';

const defaultValues = defaultValuesDevelopmentGraph;

const GraphDevelopmentPath = ({
  close,
  show,
  neuroMonitoringArray = [],
  patientData,
}) => {
  // const sex = patientData?.general?.sex;
  const [graphItems, setGraphItems] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  const setFormatPatientData = () => {
    // eslint-disable-next-line no-unused-vars
    defaultValues.dateScore.forEach((item) => {
      item = {
        date: '',
        score: null,
        f: false,
        af: false,
        cs: false,
        ch: false,
        pr: false,
        h: false,
        n: false,
        sgNumber: 26,
      };
    });
    let columnSelectedIndex = null;
    let indicatorValue = null;
    graphItems.forEach((item) => {
      if (item?.correctedType === 'pret') {
        columnSelectedIndex = defaultValues.dateScore.findIndex(
          (column) => column?.sgNumber === item?.correctedAge
            && column?.sgNumber >= 26
            && column?.sgNumber <= 40,
        );
      } else if (item?.correctedType === 'post') {
        columnSelectedIndex = defaultValues.dateScore.findIndex(
          (column) => column?.sgNumber === item?.correctedAge
            && column?.sgNumber >= 1
            && column?.sgNumber <= 22,
        );
      }
      if (columnSelectedIndex !== -1) {
        defaultValues.dateScore[columnSelectedIndex].date = item?.createdAt?.substr(0, 10);
        defaultValues.dateScore[columnSelectedIndex].score = item?.puntuacionOptimalidadMotora;

        // Sigue agregar indicador que obtuvieron F, A, etc
        if (item?.typeGraph === 'generalMovements') {
          indicatorValue = item?.cuestionario?.evaluacionMG?.valorIndicadoresUno?.toLowerCase();
        } else if (item?.typeGraph === 'motorRepertoire') {
          indicatorValue = item?.movimientosFidgety?.valorSeleccionado?.toLowerCase();
        }
        if (
          typeof defaultValues.dateScore[columnSelectedIndex][
            indicatorValue
          ] === 'boolean'
        ) {
          defaultValues.dateScore[columnSelectedIndex][indicatorValue] = true;
        }
      }
      // else {
      //   defaultValues.dateScore[0].date = '22-12-2020';
      //   defaultValues.dateScore[0].score = '25';
      // }
    });
    // defaultValues
    setIsLoading(false);
  };

  const getGraphicValues = async () => {
    setIsLoading(true);
    const arrayForms = [];
    // meter los datos del paciente al inicio del array para que obtenja el formulario ligado al form principal del paciente
    const neuroMonitoringArrayCopy = [
      {
        ecoWeeks: patientData?.general?.ecoWeeks,
        sg: patientData?.general?.sg,
      },
    ].concat(neuroMonitoringArray);
    let age;
    let type;
    let sg;
    let respEcoWeeks;
    let patientForm;
    for (let i = 0; i < neuroMonitoringArrayCopy.length; i++) {
      respEcoWeeks = getEcoWeeksPrePost(neuroMonitoringArrayCopy[i].ecoWeeks);
      age = respEcoWeeks?.age;
      type = respEcoWeeks?.type;
      sg = Number(neuroMonitoringArrayCopy[i].sg || 0);
      // validar qué tipo de formulario tiene
      patientForm = null;
      if (
        sg === 40
        || (age >= 26 && age <= 40 && type === 'pret')
        || (age >= 0 && age <= 6 && type === 'post')
      ) {
        // si es la primera posición, buscar por paciente, si no, por id del seguimiento
        // eslint-disable-next-line no-await-in-loop
        patientForm = await getGeneralMovementsByPatientMonitoringId(
          i === 0 ? patientData?.id : null,
          i === 0 ? null : neuroMonitoringArrayCopy[i].idRegister,
        );
        if (patientForm?.data) {
          arrayForms.push({
            ...patientForm?.data,
            correctedSg: sg,
            correctedAge: age,
            correctedType: type,
            typeGraph: 'generalMovements',
          });
        }
      }
      if (type === 'post' && age >= 9 && age <= 22) {
        // si es la primera posición, buscar por paciente, si no, por id del seguimiento
        // eslint-disable-next-line no-await-in-loop
        patientForm = await getMotorRepertoireByPatientMonitoringId(
          i === 0 ? patientData?.id : null,
          i === 0 ? null : neuroMonitoringArrayCopy[i].idRegister,
        );
        if (patientForm?.data) {
          arrayForms.push({
            ...patientForm?.data,
            correctedSg: sg,
            correctedAge: age,
            correctedType: type,
            typeGraph: 'motorRepertoire',
          });
        }
      }
    }
    setGraphItems(arrayForms);
  };

  useEffect(() => {
    // getPatientData();
    getGraphicValues();
    return () => null;
    // eslint-disable-next-line
  }, [neuroMonitoringArray]);

  useEffect(() => {
    if (graphItems?.length) {
      setFormatPatientData();
    }
    return () => null;
    // eslint-disable-next-line
  }, [setGraphItems, graphItems]);

  return (
    <Row
      className="graph-development-path-background"
      style={{
        transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
        opacity: show ? '1' : '0',
      }}
    >
      <Col xs="12" className="graph-development-path-col">
        <div className="graph-development-path-form">
          <span
            className="btn-close-modal icon-close"
            onClick={() => close()}
            onKeyDown={() => close()}
          />
          <p className="title mb-0">Trayectoria de Desarrollo individual</p>
          <div className="chart-container">
            <div className="container-col-date">
              <div className="col-date-score-title">Fecha</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className="col-date-score date border"
                  key={item?.sgNumber}
                >
                  {item?.date}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">Puntaje</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className="col-date-score score border"
                  key={item?.sgNumber}
                >
                  {item?.score}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">F-</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className={`col-date-score ${
                    item?.sgNumber > 8 && item?.sgNumber < 23 ? 'border' : ''
                  } ${
                    item?.sgNumber > 8 && item?.sgNumber < 16 ? 'bg-dark' : ''
                  } ${item?.f ? 'color-green' : ''}`}
                  key={item?.sgNumber}
                >
                  {}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">AF</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className={`col-date-score ${
                    item?.sgNumber > 5 && item?.sgNumber < 23 ? 'border' : ''
                  } ${
                    item?.sgNumber > 8 && item?.sgNumber < 16 ? 'bg-dark' : ''
                  } ${item?.af ? 'color-red' : ''}`}
                  key={item?.sgNumber}
                >
                  {}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">CS</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className={`col-date-score border ${
                    item?.sgNumber > 8 && item?.sgNumber < 16 ? 'bg-dark' : ''
                  } ${item?.cs ? 'color-red' : ''}`}
                  key={item?.sgNumber}
                >
                  {}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">CH</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className={`col-date-score ${
                    item?.sgNumber > 25 || item?.sgNumber < 9 ? 'border' : ''
                  } ${item?.ch ? 'color-red' : ''}`}
                  key={item?.sgNumber}
                >
                  {}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">PR</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className={`col-date-score ${
                    item?.sgNumber > 25 || item?.sgNumber < 9 ? 'border' : ''
                  } ${item?.pr ? 'color-yellow' : ''}`}
                  key={item?.sgNumber}
                >
                  {}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">H</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className={`col-date-score border ${
                    item?.sgNumber > 8 && item?.sgNumber < 16 ? 'bg-dark' : ''
                  } ${item?.h ? 'color-red' : ''}`}
                  key={item?.sgNumber}
                >
                  {}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title">N</div>
              {defaultValues?.dateScore.map((item) => (
                <div
                  className={`col-date-score border ${
                    item?.sgNumber > 8 && item?.sgNumber < 16 ? 'bg-dark' : ''
                  } ${item?.n ? 'color-green' : ''}`}
                  key={item?.sgNumber}
                >
                  {}
                </div>
              ))}
            </div>
            <div className="container-col-date">
              <div className="col-date-score-title" />
              {defaultValues?.dateScore.map((item) => (
                <div className="col-date-number border" key={item?.sgNumber}>
                  {item?.sgNumber}
                </div>
              ))}
            </div>
            <div className="container-main-pre-port">
              <div className="container-col-text-pret">
                Semana de edad postmenstrual
              </div>
              <div className="container-col-text-post">
                Semanas de edad postermino
              </div>
            </div>
            <div className="container-main-pre-port">
              <div className="container-col-text-empty" />
              <div className="container-col-text-mov">
                <div className="container-col-text-mov-small">
                  Movimientos Writing
                </div>
                <div className="container-col-text-mov-smaller">
                  FMs + or +/-
                </div>
              </div>
              <div className="container-col-text-fm">
                <div className="container-col-text-fm1">FMs ++ or +</div>
                <div className="container-col-text-fm2">FMs ++ or + or +/-</div>
              </div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

GraphDevelopmentPath.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  neuroMonitoringArray: PropTypes.array.isRequired,
  patientData: PropTypes.object.isRequired,
};

export default GraphDevelopmentPath;
