/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'reactstrap';
import { Scatter } from 'react-chartjs-2';
import { defaultValuesPlagiocephaly } from '../utils/defaultValuesGraphs';
import '../styles/graphPlagiocephalyProtocol.scss';
import { getPlagiocephalyIndex } from '../utils/graphformulas';
import LegendItem from './GraphPlagiocephalyLegendItem';

const options = {
  type: 'scatter',
  showLine: true,
  responsive: true,
  interaction: {
    intersect: false,
    mode: 'nearest',
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltips: {
      enabled: true,
      callbacks: {
        label(tooltipItem) {
          return tooltipItem.yLabel;
        },
      },
    },
  },
  scales: {
    y: {
      suggestedMin: 0,
      suggestedMax: 25.5,
      ticks: {
        stepSize: 1,
        font: {
          size: 15,
        },
      },
      title: {
        display: true,
        text: 'Plagiocephaly index (mm)',
        color: '#213162',
        font: {
          size: 18,
          weight: 'bold',
          lineHeight: 1.2,
        },
        padding: {
          top: 20,
          left: 0,
          right: 0,
          bottom: 0,
        },
      },
    },
    x: {
      suggestedMin: 0,
      suggestedMax: 18,
      ticks: {
        stepSize: 1,
        font: {
          size: 18,
        },
      },
      title: {
        display: true,
        text: 'Edad (meses cumplidos)',
        color: '#213162',
        font: {
          size: 20,
          weight: 'bold',
          lineHeight: 1.2,
        },
        padding: {
          top: 20,
          left: 0,
          right: 0,
          bottom: 0,
        },
      },
    },
  },
};

const GraphPlagiocephalyProtocol = ({
  close,
  show,
  neuroMonitoringArray = [],
  patientData,
}) => {
  const sex = patientData?.general?.sex;
  const [graphNeuroItems, setGraphNeuroItems] = useState([]);
  const [intersections, setIntersections] = useState([]);

  const data = {
    datasets: [
      {
        type: 'line',
        elements: {
          line: {
            borderDash: [0.8],
          },
        },
        label: 'Paciente teórico',
        data: defaultValuesPlagiocephaly.lineIndicator,
        backgroundColor: '#272823',
        borderColor: '#272823',
        size: 3,
      },
      {
        type: 'bar',
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        label: '',
        data: defaultValuesPlagiocephaly.barIndicator,
        backgroundColor: 'rgba(255, 159, 64, 0.4)',
        borderColor: '#bb9c04',
      },
      {
        label: 'Paciente real',
        data: graphNeuroItems,
        size: 3,
        backgroundColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
        borderColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
      },
      {
        type: 'line',
        elements: {
          point: {
            pointStyle: 'line',
          },
        },
        label: 'Riesgo',
        data: defaultValuesPlagiocephaly.lineHighIndicator,
        backgroundColor: '#e92c1faf',
        borderColor: '#e92c1faf',
        // fill: '-1',
        borderWidth: 5,
      },
      {
        type: 'line',
        elements: {
          point: {
            pointStyle: 'line',
          },
        },
        label: 'Moderado',
        data: defaultValuesPlagiocephaly.lineModerateIndicator,
        backgroundColor: '#f17d1e79',
        borderColor: '#f17d1e79',
        // fill: '-1',
        borderWidth: 5,
      },
      {
        type: 'line',
        elements: {
          point: {
            pointStyle: 'line',
          },
        },
        label: 'leve',
        data: defaultValuesPlagiocephaly.lineLowIndicator,
        backgroundColor: '#f1dc1e79',
        borderColor: '#f1dc1e79',
        // fill: '-1',
        borderWidth: 5,
      },
      ...intersections,
    ],
  };

  const addIntersections = (valueX, valueY) => {
    const verticalLine = {
      type: 'line',
      elements: {
        point: {
          pointStyle: 'dash',
        },
      },
      label: '',
      data: [
        { x: valueX, y: 0 },
        { x: valueX, y: 25 },
      ],
      backgroundColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
      borderColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
      // fill: '-1',
      borderWidth: 1,
      borderDash: [10, 5],
    };
    const horizontalLine = {
      type: 'line',
      elements: {
        point: {
          pointStyle: 'dash',
        },
      },
      label: '',
      data: [
        { x: 0, y: valueY },
        { x: 18, y: valueY },
      ],
      backgroundColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
      borderColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
      // fill: '-1',
      borderWidth: 1,
      borderDash: [10, 5],
    };
    setIntersections([verticalLine, horizontalLine]);
  };


  const getPatientData = () => {
    const headHistoricByMonths = [];
    neuroMonitoringArray.forEach((neuroItem) => {
      const ecoArray = neuroItem.eco.split(', ');
      if (ecoArray.length === 3) {
        const anios = parseInt(ecoArray[0].split(' ')[0]);
        const meses = parseInt(ecoArray[1].split(' ')[0]);
        const totalMeses = anios * 12 + meses;
        console.log({
          años: anios,
          meses,
          total: totalMeses,
        });
        if (
          totalMeses >= 0
          && totalMeses <= 18
          && parseFloat(neuroItem.plagiocephalyIndexA) > 0
          && parseFloat(neuroItem.plagiocephalyIndexB) > 0
        ) {
          console.log(totalMeses, neuroItem.plagiocephalyIndexA, neuroItem.plagiocephalyIndexB);
          const valueX = totalMeses;
          const valueY = getPlagiocephalyIndex(
            neuroItem.plagiocephalyIndexA,
            neuroItem.plagiocephalyIndexB,
          );
          headHistoricByMonths.push({
            x: valueX,
            y: valueY,
          });
          addIntersections(valueX, valueY);
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
      className="graph-plagiocephaly-protocol-background"
      style={{
        transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
        opacity: show ? '1' : '0',
      }}
    >
      <Col xs="12" className="graph-plagiocephaly-protocol-col">
        <div className="graph-plagiocephaly-protocol-form">
          <span
            className="btn-close-modal icon-close"
            onClick={() => close()}
            onKeyDown={() => close()}
          />
          <p className="title mb-0">Protocolo plagiocefálico</p>
          {!sex && (
            <p className="subtitle">
              Debe registrar el sexo del infante para ver su evolución
            </p>
          )}
          <Row style={{
            width: '70%',
            marginTop: '1em',
            marginLeft: '5em',
            marginBottom: '1em',
          }}
          >
            {data.datasets.map((item) => {
              return item.label !== '' ? (
                <Col xs={item.size ? item.size : '2'}>
                  <LegendItem title={item.label} color={item.backgroundColor} />
                </Col>
              )
                : null;
            })}
          </Row>
          <div className="chart-container">
            {sex && (
              <>
                <Scatter data={data} options={options} className="line-chart" />
              </>
            )}
          </div>
        </div>
      </Col>
    </Row>
  );
};

GraphPlagiocephalyProtocol.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  neuroMonitoringArray: PropTypes.array.isRequired,
  patientData: PropTypes.object.isRequired,
};

export default GraphPlagiocephalyProtocol;
