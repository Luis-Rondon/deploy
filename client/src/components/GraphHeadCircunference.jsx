import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import { Scatter } from 'react-chartjs-2';
import { defaultValuesGraphHead } from '../utils/defaultValuesGraphs';
import '../styles/graphHeadCircunference.scss';

const options = {
  type: 'scatter',
  showLine: true,
  responsive: true,
  // plugins: {
  //   legend: {
  //     position: 'top',
  //   },
  // },
  // interaction: {
  //   intersect: false,
  //   mode: 'index',
  // },
  scales: {
    y: {
      suggestedMin: 31,
      suggestedMax: 51,
      ticks: {
        stepSize: 1,
        font: {
          size: 20,
        },
      },
      title: {
        display: true,
        text: 'Perímetro cefálico (cm)',
        color: '#213162',
        font: {
          size: 20,
          weight: 'bold',
          lineHeight: 1.2,
        },
        padding: {
          top: 20, left: 0, right: 0, bottom: 0,
        },
      },
    },
    x: {
      suggestedMin: 0,
      suggestedMax: 24,
      ticks: {
        stepSize: 2,
        font: {
          size: 18,
        },
      },
      title: {
        display: true,
        text: 'Edad (en meses cumplidos)',
        color: '#213162',
        font: {
          size: 20,
          weight: 'bold',
          lineHeight: 1.2,
        },
        padding: {
          top: 20, left: 0, right: 0, bottom: 0,
        },
      },
    },
  },
};

const GraphHeadCircunference = ({
  close,
  show,
  neuroMonitoringArray = [],
  patientData,
}) => {
  const { sex } = patientData.general;
  const typeGraph = sex === 'm' ? 'boy' : 'girl';

  const [graphNeuroItems, setGraphNeuroItems] = useState([]);

  const data = {
    datasets: [
      {
        label: 'Paciente',
        data: graphNeuroItems,
        backgroundColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
        borderColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
      },
      {
        label: 'Peligro Bajo',
        data: defaultValuesGraphHead[typeGraph].dangerLow,
        backgroundColor: '#d52e1b',
        borderColor: '#d52e1b',
      },
      {
        label: 'Advertencia Bajo',
        data: defaultValuesGraphHead[typeGraph].warningLow,
        backgroundColor: '#f64a04',
        borderColor: '#f64a04',
      },
      {
        label: 'Normal',
        data: defaultValuesGraphHead[typeGraph].normal,
        backgroundColor: '#44cc11',
        borderColor: '#44cc11',
      },
      {
        label: 'Advertencia Alto',
        data: defaultValuesGraphHead[typeGraph].warningHigh,
        backgroundColor: '#f64a04',
        borderColor: '#f64a04',
      },
      {
        label: 'Peligro Alto',
        data: defaultValuesGraphHead[typeGraph].dangerHigh,
        backgroundColor: '#d52e1b',
        borderColor: '#d52e1b',
      },
    ],
  };

  const getPatientData = () => {
    const headHistoricByMonths = [];
    neuroMonitoringArray.forEach((neuroItem) => {
      const ecoArray = neuroItem.eco.split(', ');
      if (ecoArray.length === 3) {
        const anios = parseInt(ecoArray[0].split(' ')[0]);
        const meses = parseInt(ecoArray[1].split(' ')[0]);
        const totalMeses = anios * 12 + meses;
        console.log(totalMeses);
        if (
          totalMeses >= 0
          && totalMeses <= 24
          && neuroItem.headCircunference
        ) {
          headHistoricByMonths.push({
            x: totalMeses,
            y: parseFloat(neuroItem.headCircunference),
          });
        }
      }
    });
    setGraphNeuroItems(headHistoricByMonths);
  };

  useEffect(() => {
    getPatientData();
    return () => null;
    // eslint-disable-next-line
  }, [neuroMonitoringArray]);

  return (
    <Row
      className="graph-head-circunference-background"
      style={{
        transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
        opacity: show ? '1' : '0',
        // display: show ? 'block' : 'none',
      }}
    >
      <Col xs="12" className="graph-head-circunference-col">
        <div className="graph-head-circunference-form">
          <span
            className="btn-close-modal icon-close"
            onClick={() => close()}
            onKeyDown={() => close()}
          />
          <p className="title mb-0">
            Perímetro cefálico para la edad -
            {' '}
            {sex === 'm' ? 'Niño' : sex === 'f' ? 'Niña' : '-Sin definir-'}
          </p>
          <p className="subtitle">Percentiles (Nacimiento a 2 años)</p>
          {!sex && (
            <p className="subtitle">
              Debe registrar el sexo del infante para ver su evolución
            </p>
          )}
          <div className="chart-container">
            {sex && <Scatter data={data} options={options} />}
          </div>
        </div>
      </Col>
    </Row>
  );
};

GraphHeadCircunference.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  neuroMonitoringArray: PropTypes.array,
  patientData: PropTypes.object,
};

export default GraphHeadCircunference;
