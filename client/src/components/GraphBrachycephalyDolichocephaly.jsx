/* eslint-disable max-len */
/* eslint-disable func-names */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Container } from 'reactstrap';
import { Scatter } from 'react-chartjs-2';
import { defaultValuesBrachycephaly } from '../utils/defaultValuesGraphs';
import '../styles/graphBrachycephalyDolichocephaly.scss';
import { getBrachyphalyIndex } from '../utils/graphformulas';

const options = {
  type: 'scatter',
  showLine: true,
  responsive: true,
  interaction: {
    intersect: false,
    mode: 'nearest',
  },
  scales: {
    y: {
      suggestedMin: 60,
      suggestedMax: 110,
      beginAtZero: false,
      ticks: {
        stepSize: 5,
        font: {
          size: 15,
        },
        // eslint-disable-next-line func-names
        // eslint-disable-next-line object-shorthand
        callback: function (value) {
          return `${value}% `;
        },
      },
      title: {
        display: true,
        text: 'Cephalometric index (80%)',
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
      // position: 'right'
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
  plugins: {
    filler: {
      propagate: true,
    },
  },
};

const GraphBrachycephalyDolichocephaly = ({
  close,
  show,
  neuroMonitoringArray = [],
  patientData,
}) => {
  const sex = patientData?.general?.sex;
  const [graphNeuroItems, setGraphNeuroItems] = useState([]);

  const data = {
    datasets: [
      {
        label: patientData?.general?.name,
        data: graphNeuroItems,
        backgroundColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
        borderColor:
          sex === 'm' ? '#199cf5' : sex === 'f' ? '#e81475' : '#783ea4',
      },
      {
        type: 'bar',
        label: 'Middle',
        barPercentage: 1.0,
        categoryPercentage: 1.0,
        clip: {
          top: 0,
          right: 0,
          left: 0,
          bottom: -85,
        },
        data: defaultValuesBrachycephaly.barIndicator,
        backgroundColor: 'rgba(255, 159, 64, 0.4)',
        borderColor: '#bb9c04',
      },
      // {
      //   type: 'line',
      //   elements: {
      //     point: {
      //       pointStyle: 'line',
      //     },
      //   },
      //   label: 'Mo.',
      //   data: defaultValuesBrachycephaly.barModerateLow,
      //   backgroundColor: '#f17d1e79',
      //   borderColor: '#f17d1e79',
      //   // fill: true,
      // },
      {
        type: 'line',
        elements: {
          point: {
            pointStyle: 'line',
          },
        },
        label: 'Mi.',
        data: defaultValuesBrachycephaly.barMildLow,
        backgroundColor: '#f1dc1e79',
        borderColor: '#f1dc1e79',
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
        label: 'N.',
        data: defaultValuesBrachycephaly.normal,
        backgroundColor: '#1ec70e79',
        borderColor: '#1ec70e79',
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
        label: 'Mi. ',
        data: defaultValuesBrachycephaly.barMildHight,
        backgroundColor: '#f1dc1e79',
        borderColor: '#f1dc1e79',
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
        label: 'Mo. ',
        data: defaultValuesBrachycephaly.barModerateHight,
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
        label: 'S.',
        data: defaultValuesBrachycephaly.barSevere,
        backgroundColor: '#e92c1faf',
        borderColor: '#e92c1faf',
        // fill: '-1',
        borderWidth: 5,
      },
      {
        type: 'line',
        elements: {
          line: {
            borderDash: [0.8],
          },
        },
        label: 'High',
        fill: false,
        lineTension: 0.1,
        data: defaultValuesBrachycephaly.lineHighIndicator,
        backgroundColor: '#272823',
        borderColor: '#272823',
        tension: 0.1,
      },
      {
        type: 'line',
        elements: {
          line: {
            borderDash: [0.8],
          },
        },
        label: 'Low',
        data: defaultValuesBrachycephaly.lineLowIndicator,
        backgroundColor: '#272823',
        borderColor: '#272823',
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
        if (
          totalMeses >= 0
          && totalMeses <= 18
          && parseFloat(neuroItem.brachyphalySd) > 0
          && parseFloat(neuroItem.brachyphalyAp) > 0
        ) {
          headHistoricByMonths.push({
            x: totalMeses,
            y: getBrachyphalyIndex(
              neuroItem.brachyphalySd,
              neuroItem.brachyphalyAp,
            ),
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
      className="graph-branchycephaly-background"
      style={{
        transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
        opacity: show ? '1' : '0',
      }}
    >
      <Col xs="12" className="graph-branchycephaly-col">
        <div className="graph-branchycephaly-form">
          <span
            className="btn-close-modal icon-close"
            onClick={() => close()}
            onKeyDown={() => close()}
          />
          <p className="title mb-0">Braquicefalia y dolicocefalia</p>
          <div className="chart-container">
            <Scatter data={data} options={options} className="line-chart" />
            <Row className="aside-info">
              <Col className="chart-description">Dolicocefalia</Col>
              <Col className="chart-description">Branquicefalia</Col>
            </Row>
            <Container className="inside-info">
              <Row className="justify-content-end">
                <Col xs="3" className="chart-description">
                  Derivación a neurocirugía
                </Col>
                {' '}
              </Row>
              <Row className="justify-content-start">
                <Col xs="4" className="chart-description">
                  Tratamiento posular y cojin mimos
                </Col>
              </Row>
              <Row className="justify-content-end">
                <Col xs="3" className="chart-description">
                  Derivación a neurocirugía
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </Col>
    </Row>
  );
};

GraphBrachycephalyDolichocephaly.propTypes = {
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  neuroMonitoringArray: PropTypes.array.isRequired,
  patientData: PropTypes.object.isRequired,
};

export default GraphBrachycephalyDolichocephaly;
