/* eslint-disable no-undef */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  Row, Col, Container, Button, Spinner,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import Label from 'reactstrap/lib/Label';
import moment from 'moment';
import authHOC from '../utils/authHOC';
import { getPatientValorationById } from '../actions/PatientAction';
import { patientModel } from '../models/PatientType';
import Menu from '../common/Menu';
import Navbar from '../common/Navbar';
import FormGroupPatient from '../components/FormGroupPatient';
import '../styles/documentPatient.scss';
import { getUsers } from '../actions/UserAction';
import PatientDocumentPdf from '../components/PatientDocumentPdf';

const DocumentPatient = ({ history, match }) => {
  const [patientDataComplete, setPatientDataComplete] = useState(patientModel);
  const [usersList, setUsersList] = useState([]);
  const [monitoringItems, setMonitoringItems] = useState([]);
  const [age, setAge] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const { register, setValue, errors } = useForm({
    defaultValues: patientModel,
  });

  useEffect(() => {
    const { id } = match.params;
    getPatientValorationById(id)
      .then((result) => {
        setPatientDataComplete(result.data);
        Object.keys(result.data).forEach((key) => setValue(key, result.data[key]));
        if (result.data.neuroMonitoring) {
          const objectToArray = Object.values(result.data.neuroMonitoring);
          objectToArray.sort((a, b) => {
            return a.number - b.number;
          });
          setMonitoringItems(objectToArray);
        }
        const today = moment();
        const birthd = moment(result.data.general.birthDate);
        const years = today.diff(birthd, 'years');
        setAge(years);
        setIsReady(true);
      })
      .catch(() => history.push('/pacientes'));
    getUsers()
      .then((result) => setUsersList(result.data))
      .catch(() => history.push('/pacientes'));
    // eslint-disable-next-line
  }, [match]);

  const getDoctorName = (neuroMonitoringItem) => {
    const doctor = usersList.find(
      (user) => user.id === neuroMonitoringItem.doctorIdAssigned,
    );
    return doctor?.username || 'No registrado';
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap" className="document-patient">
        <Container fluid>
          <Row>
            <Col xs="10">
              <p className="title">Oficio de historial </p>
            </Col>
            <Col xs="2" className="center">
              {isReady && (
                <PDFDownloadLink
                  document={(
                    <PatientDocumentPdf
                      monitoringItems={monitoringItems}
                      patient={patientDataComplete}
                      doctorList={usersList}
                    />
                  )}
                  fileName={`Oficio historial ${patientDataComplete?.general?.name}.pdf`}
                >
                  {({ loading }) => (loading ? (
                    <Spinner />
                  ) : (
                    <Button className="btn-custom pdf-link" color="">
                      <i className="icon-dowload" alt="Descargar oficio" />
                    </Button>
                  ))}
                </PDFDownloadLink>
              )}
            </Col>
          </Row>
          <Row className="container-data">
            <Col xs="12" md="3">
              {/** className="col" */}
              <FormGroupPatient
                name="general.name"
                label="Nombre del paciente"
                labelClassname="label"
                type="text"
                labelSize={12}
                inputSize={12}
                register={register}
                errors={errors?.general?.name}
                readOnly
              />
            </Col>
            <Col xs="12" md="3">
              <FormGroupPatient
                name="contactInformation.phoneNumber"
                label="Teléfono de contacto"
                labelClassname="label"
                type="text"
                labelSize={12}
                inputSize={12}
                register={register}
                errors={errors?.contactInformation?.phoneNumber}
                readOnly
              />
            </Col>
            <Col xs="12" md="3">
              <FormGroupPatient
                name="general.birthDate"
                label="Fecha de nacimiento"
                labelClassname="label"
                type="date"
                placeHolder="yyyy-mm-dd"
                pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                register={register}
                readOnly
              />
              <Label>
                Edad:
                {age}
                {' '}
                años
              </Label>
            </Col>
            <Col xs="12" md="2">
              <FormGroupPatient
                name="folio"
                label="No. de expediente"
                labelClassname="label"
                type="text"
                labelSize={12}
                inputSize={12}
                register={register}
                readOnly
              />
            </Col>
            <Col xs="12" md="1">
              <FormGroupPatient
                name="number"
                label="Registro No."
                labelClassname="label"
                type="text"
                labelSize={12}
                inputSize={12}
                register={register}
                readOnly
              />
            </Col>

            <Col xs="12">
              <h4 className="subtitle">Historial de neuroseguimiento</h4>
            </Col>
            {monitoringItems.length === 0 ? (
              <Row>
                <Col xs="12">
                  <p className="title-monitoring-content-not-found">
                    Aún no ha agregado ningún seguimiento
                  </p>
                </Col>
              </Row>
            ) : (
              monitoringItems.map((item) => (
                <Col xs="12" md="12" key={item.idRegister}>
                  <Row>
                    <Col xs="12" md="4">
                      <Label>
                        <strong>Valoración No.:</strong>
                        {' '}
                        {item.number}
                      </Label>
                    </Col>
                    <Col xs="12" md="4">
                      <Label>
                        <strong>Fecha:</strong>
                        {' '}
                        {item.date}
                      </Label>
                    </Col>
                    <Col xs="12" md="4">
                      <Label>
                        <strong>Terapeuta:</strong>
                        {' '}
                        {getDoctorName(item)}
                      </Label>
                    </Col>
                    <Col xs="12" md="3">
                      <Label>
                        <strong>Descripción:</strong>
                        {' '}
                        {item.description}
                      </Label>
                    </Col>
                    <Col xs="12" md="3">
                      <Label>
                        <strong>Exploración:</strong>
                        {' '}
                        {item.exploration}
                      </Label>
                    </Col>
                    <Col xs="12" md="3">
                      <Label>
                        <strong>Revaloración:</strong>
                        {' '}
                        {item.reassessment}
                      </Label>
                    </Col>
                    <Col xs="12" md="3">
                      <Label>
                        <strong>Control:</strong>
                        {' '}
                        {item.control}
                      </Label>
                    </Col>
                  </Row>
                  <div className="divider" />
                </Col>
              ))
            )}
          </Row>
        </Container>
      </div>
    </>
  );
};

DocumentPatient.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default authHOC(DocumentPatient, [
  'Administrador',
  'Editor',
  'Colaborador',
]);
