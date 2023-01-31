import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  Button, Spinner, Row, Col, Label,
} from 'reactstrap';
import authHOC from '../utils/authHOC';
import { getPatientValorations } from '../actions/PatientAction';
import CustomAlert from '../common/CustomAlert';
import Navbar from '../common/Navbar';
import Menu from '../common/Menu';
import PatientValorationPdf from '../components/PatientValorationPdf';
import '../styles/backup.scss';

const Backup = ({ history }) => {
  const [patientValorationList, setpatientValorationList] = useState([]);
  const [alert, setAlert] = useState({
    status: false,
    text: '',
    color: '',
  });

  useEffect(() => {
    getPatientValorations()
      .then((result) => {
        const orderData = result.data.sort((a, b) => {
          if (a.general.name < b.general.name) return -1;
          if (a.general.name > b.general.name) return 1;
          return 0;
        });
        setpatientValorationList(orderData);
      })
      .catch(() => {
        setAlert({
          status: true,
          text: 'No se pudo obtener la infromación de los pacientes, por favor, recarga.',
          color: 'red',
        });
      });
  }, []);

  const downloadBackup = () => {
    const listUrlButtons = document.getElementsByClassName('pdf-link');
    if (patientValorationList.length === 0) {
      setAlert({
        status: true,
        text: 'No hay datos para descargar.',
        color: 'blue-two',
      });
    }
    if (listUrlButtons.length !== patientValorationList.length) {
      setAlert({
        status: true,
        text: 'Por favor espera que se generen todos los documentos.',
        color: 'green',
      });
    } else {
      for (let i = 0; i < listUrlButtons.length; i += 1) {
        listUrlButtons[i].click();
      }
    }
    setTimeout(() => setAlert({ ...alert, status: false }), 3000);
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap">
        {alert.status ? (
          <CustomAlert text={alert.text} color={alert.color} />
        ) : null}
        <Row className="row-download-items">
          <Col xs="12">
            <Label className="title">
              Se descargarán los registros de todos los pacientes
            </Label>
          </Col>
          <Col xs="12" className="col-btn">
            <Button
              onClick={downloadBackup}
              className="btn-download-backup btn-custom"
              color=""
            >
              Descargar copia de seguridad
            </Button>
          </Col>
          <Col xs="12">
            <Label className="subtitle">
              También puede descargar cada registro individualmente
            </Label>
          </Col>
        </Row>
        <Row className="row-download-items">
          {patientValorationList.length === 0 ? (
            <Label>Buscando registros...</Label>
          ) : (
            patientValorationList.map((item) => (
              <Col xs="12" md="6" className="col-download-item" key={item.id}>
                <Row>
                  <Col xs="8">
                    <Label>{item.general.name}</Label>
                  </Col>
                  <Col xs="4">
                    <PDFDownloadLink
                      key={item.id}
                      document={<PatientValorationPdf data={item} />}
                      fileName={`${
                        item ? item.general.name : 'Registro de paciente'
                      }.pdf`}
                    >
                      {({ loading }) => (loading ? (
                        <Spinner />
                      ) : (
                        <Button className="btn-custom pdf-link" color="">
                          <i className="icon-dowload" />
                        </Button>
                      ))}
                    </PDFDownloadLink>
                  </Col>
                </Row>
              </Col>
            ))
          )}
        </Row>
      </div>
    </>
  );
};

Backup.propTypes = {
  history: PropTypes.object.isRequired,
};

export default authHOC(Backup, ['Administrador']);
