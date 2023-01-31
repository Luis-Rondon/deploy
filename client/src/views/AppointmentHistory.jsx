/* eslint-disable no-undef */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import {
  Row, Col, Container, Input, Button, Spinner, Label,
} from 'reactstrap';
import PropTypes from 'prop-types';
import Pagination from 'react-js-pagination';
import { PDFDownloadLink } from '@react-pdf/renderer';
import autosize from 'autosize';
import moment from 'moment';
import authHOC from '../utils/authHOC';
import { getPatientValorationById, onlyHaveControl } from '../actions/PatientAction';
import { getAllDatesByPatientId, updateDateById } from '../actions/DatesAction';
import { patientModel } from '../models/PatientType';
import Menu from '../common/Menu';
import Navbar from '../common/Navbar';
import CustomModal from '../common/CustomModal';
import RowDateHistory from '../components/RowDateHistory';
import PatientHistoryPdf from '../components/PatientHistoryPdf';
import GraphHeadCircunference from '../components/GraphHeadCircunference';
import { getUsers } from '../actions/UserAction';
import '../styles/appointmentHistory.scss';
import profilePic from '../assets/user-profile-default.jpg';
import GraphPlagiocephalyProtocol from '../components/GraphPlagiocephalyProtocol';
import GraphBrachycephalyDolichocephaly from '../components/GraphBrachycephalyDolichocephaly';
import GraphDevelopmentPath from '../components/GraphDevelopmentPath';

const AppointmentHistory = ({ history, match }) => {
  const [patientDataComplete, setPatientDataComplete] = useState(patientModel);
  const [monitoringItems, setMonitoringItems] = useState([]);
  const [datesData, setDatesData] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [listDataPage, setListDataPage] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [historyToEdit, setHistoryToEdit] = useState({
    id: '',
    value: '',
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const toggleModal = () => setModalIsOpen((prevState) => !prevState);

  const [modalGraphHeadIsOpen, setModalGraphHeadIsOpen] = useState(false);
  const toggleModalGraphHead = () => {
    setModalGraphHeadIsOpen((prevState) => !prevState);
  };

  const [modalGraphPlagiocephalyIsOpen, setModalGraphPlagiocephalyIsOpen] = useState(false);
  const toggleModalGraphPlagiocephaly = () => {
    setModalGraphPlagiocephalyIsOpen((prevState) => !prevState);
  };

  const [modalGraphBranchycephalyIsOpen, setModalGraphBranchycephalyIsOpen] = useState(false);
  const toggleModalGraphBranchycephaly = () => {
    setModalGraphBranchycephalyIsOpen((prevState) => !prevState);
  };

  const [modalDevelopmentPathIsOpen, setModalDevelopmentPathIsOpen] = useState(false);
  const toggleModalDevelopmentPath = () => {
    setModalDevelopmentPathIsOpen((prevState) => !prevState);
  };

  const handleSelected = (selectedPage) => {
    if (datesData.length === 0) {
      setListDataPage([]);
      return;
    }
    const indexOfLastProject = selectedPage * itemsPerPage;
    const indexOfFirstProject = indexOfLastProject - itemsPerPage;
    const currentData = datesData.slice(
      indexOfFirstProject,
      indexOfLastProject,
    );
    setListDataPage(currentData);
    setActivePage(selectedPage);
    sessionStorage.setItem('unPePageHistAc', selectedPage);
  };

  const getDoctorName = (neuroMonitoringItem, doctorIdAssigned = '') => {
    if (!neuroMonitoringItem && !doctorIdAssigned) {
      return 'No registrado';
    }
    let doctor;
    if (doctorIdAssigned) {
      doctor = usersList.find((user) => user.id === doctorIdAssigned);
    } else {
      doctor = usersList.find(
        (user) => user.id === neuroMonitoringItem.doctorIdAssigned,
      );
    }
    return doctor?.username || 'No registrado';
  };

  useEffect(() => {
    const { id } = match.params;
    getPatientValorationById(id)
      .then((result) => {
        setPatientDataComplete(result.data);
        if (result.data.neuroMonitoring) {
          const objectToArray = Object.values(result.data.neuroMonitoring);
          objectToArray.sort((a, b) => {
            return a.number - b.number;
          });
          setMonitoringItems(objectToArray);
          const dataSet = [];
          objectToArray.forEach((neuroItem) => {
            dataSet.push(neuroItem.headCircunference || null);
          });
        }
        const inputsAutoHeight = document.getElementsByClassName('input-auto-heigth');
        autosize(inputsAutoHeight);
        return getUsers();
      })
      .then((result) => setUsersList(result.data))
      .catch((err) => console.log(err));
    getAllDatesByPatientId(id)
      .then((result) => setDatesData(result.data.filter((el) => {
        const today = new Date();
        const momentDate = moment(el.date, 'YYYY-MM-DD');
        const date = momentDate.toDate();
        return date.getTime() <= today.getTime() + 604800000;
      }).sort((a, b) => {
        return a.date < b.date ? 1 : -1;
      })))
      .catch(() => history.push('/pacientes'));
    // eslint-disable-next-line
  }, [match]);

  useEffect(() => {
    if (datesData.length > 0) handleSelected(activePage);
    // eslint-disable-next-line
  }, [datesData]);

  useEffect(() => {
    if (historyToEdit.value === 'No llegó a la cita') toggleModal();
    else {
      updateDateById(historyToEdit.id, {
        arrivedState: historyToEdit.value,
        reasonNotArrived: '',
      })
        .then(() => null)
        .catch(() => null);
    }
  }, [historyToEdit]);

  useEffect(
    () => setActivePage(parseInt(sessionStorage.getItem('unPePageHistAc')) || 1),
    [],
  );

  const updateArrivedState = () => {
    if (inputReasonHistory.value === '') return;
    updateDateById(historyToEdit.id, {
      arrivedState: historyToEdit.value,
      reasonNotArrived: inputReasonHistory.value,
    })
      .then(() => {
        toggleModal();
        setHistoryToEdit({
          id: '',
          value: '',
        });
        inputReasonHistory.value = '';
        getAllDatesByPatientId(match.params.id)
          .then((result) => setDatesData(result.data.filter((el) => {
            const today = new Date();
            const momentDate = moment(el.date, 'YYYY-MM-DD');
            const date = momentDate.toDate();
            return date.getTime() <= today.getTime() + 604800000;
          }).sort((a, b) => {
            return a.date < b.date ? 1 : -1;
          })))
          .catch(() => history.push('/pacientes'));
      })
      .catch(() => null);
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap" className="appointment-history">
        <Container fluid>
          <Row>
            <Col xs="12">
              <p className="title">Historial de citas del paciente</p>
            </Col>
          </Row>
          <Row className="container-data">
            <Col xs="3" lg="2" className="col col-profile-pic-large">
              <img
                className="profile-pic-custom"
                src={patientDataComplete?.profile_pic_url || profilePic}
                alt={patientDataComplete?.profile_pic_name || ''}
              />
            </Col>
            <Col xs="12" lg="10">
              <Row>
                <Col xs="3" className="col col-profile-pic-small">
                  <img
                    className="profile-pic-custom"
                    src={patientDataComplete?.profile_pic_url || ''}
                    alt={patientDataComplete?.profile_pic_name || ''}
                  />
                </Col>
                <Col xs="9" lg="12" className="col col-patient-name">
                  <Row>
                    <Col xs="12" md="12" lg="4">
                      <p className="label">
                        <span className="text">Nombre del paciente: </span>
                        {patientDataComplete.general.name}
                      </p>
                      <p className="label">
                        <span className="text">Terapeuta que remite: </span>
                        {getDoctorName(
                          null,
                          patientDataComplete.doctorIdAssigned,
                        )}
                      </p>
                    </Col>
                    {datesData.length > 0 && (
                      <Col
                        xs="12"
                        md="3"
                        lg="2"
                        className="text-center col-pdf-link"
                      >
                        <PDFDownloadLink
                          document={(
                            <PatientHistoryPdf
                              data={datesData}
                              patient={patientDataComplete?.general?.name}
                              doctorList={usersList}
                            />
                          )}
                          fileName={`Historial de citas ${patientDataComplete?.general?.name}.pdf`}
                        >
                          {({ loading }) => (loading ? (
                            <Spinner />
                          ) : (
                            <Button
                              className="btn-custom pdf-link"
                              color=""
                              title="Descargar historial de citas"
                            >
                              Historial de citas
                              {' '}
                              <i className="icon-dowload" />
                            </Button>
                          ))}
                        </PDFDownloadLink>
                      </Col>
                    )}
                    <Col
                      xs="12"
                      md="3"
                      lg="2"
                      className="text-center col-pdf-link"
                    >
                      <Button
                        className="btn-custom pdf-link"
                        color=""
                        title="Gráfica de perímetro cefálico"
                        onClick={toggleModalGraphHead}
                      >
                        {'Perímetro cefálico '}
                        <i className="fas fa-chart-line" />
                      </Button>
                    </Col>
                    <Col
                      xs="12"
                      md="3"
                      lg="2"
                      className="text-center col-pdf-link"
                    >
                      <Button
                        className="btn-custom pdf-link"
                        color=""
                        title="Gráfica de protocolo plagiocefálico"
                        onClick={toggleModalGraphPlagiocephaly}
                      >
                        {'Plagiocefalia '}
                        <i className="fas fa-chart-line" />
                      </Button>
                    </Col>
                    <Col
                      xs="12"
                      md="3"
                      lg="2"
                      className="text-center col-pdf-link"
                    >
                      <Button
                        className="btn-custom pdf-link"
                        color=""
                        title="Gráfica de braquicefalia"
                        onClick={toggleModalGraphBranchycephaly}
                      >
                        {'Braquicefalia '}
                        <i className="fas fa-chart-line" />
                      </Button>
                    </Col>
                    <Col
                      xs="12"
                      md="3"
                      lg="2"
                      className="text-center col-pdf-link"
                    >
                      <Button
                        className="btn-custom pdf-link"
                        color=""
                        title="Gráfica de trayectoria del desarrollo individual"
                        onClick={toggleModalDevelopmentPath}
                      >
                        {'Tray. Desarrollo '}
                        <i className="fas fa-chart-line" />
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col xs="12" className="col content-column">
                  {datesData.length === 0 ? (
                    <h3 className="no-data-title">El historial está vacío.</h3>
                  ) : (
                    <>
                      <Row className="row-date-history row-item-table">
                        <Col xs="6" lg="1" className="col col-date">
                          Grupo
                        </Col>
                        <Col xs="6" lg="2" className="col col-date">
                          Fecha
                        </Col>
                        <Col xs="12" lg="2" className="col col-schedule">
                          <p>Horario</p>
                        </Col>
                        <Col xs="12" lg="3" className="col col-reason">
                          <p>Razon de la falta</p>
                        </Col>
                        <Col xs="5" lg="2" className="col col-new-date">
                          <p className="ml-2">Terapeuta</p>
                        </Col>
                        <Col xs="7" lg="2" className="col col-dowload">
                          <p>Asistencia</p>
                        </Col>
                      </Row>
                      {listDataPage.sort((a, b) => {
                        return a.date < b.date ? 1 : -1;
                      }).map((date) => (
                        <RowDateHistory
                          key={date.id}
                          item={date}
                          setHistoryToEdit={setHistoryToEdit}
                        />
                      ))}
                    </>
                  )}
                </Col>
                <Col xs="12" className="pagination-column">
                  <Pagination
                    activePage={activePage}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={datesData.length}
                    pageRangeDisplayed={3}
                    onChange={handleSelected}
                    itemClass="item"
                    itemClassFirst="control"
                    itemClassPrev="control"
                    itemClassNext="control"
                    itemClassLast="control"
                    linkClass="link"
                    hideFirstLastPages
                  />
                </Col>
              </Row>
            </Col>

            <Col xs="12">
              <Row>
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
                      {console.log(item)}
                      <Row>
                        <Col xs="12" md="4" lg="3">
                          <Label className="label-container">
                            <strong>Valoración No.: </strong>
                            <span>{item.number}</span>
                          </Label>
                        </Col>
                        <Col xs="12" md="4" lg="3">
                          <Label className="label-container">
                            <strong>Fecha: </strong>
                            <span>
                              {item.date
                                ? item.date.split('-').reverse().join('-')
                                : '-No registrado-'}
                            </span>
                          </Label>
                        </Col>
                        <Col xs="12" md="4" lg="3">
                          <Label className="label-container">
                            <strong>Terapeuta: </strong>
                            <span>{getDoctorName(item)}</span>
                          </Label>
                        </Col>
                      </Row>
                      <Row>
                        {
                          (!item.onlyControl && !onlyHaveControl(item)) && (
                            <>
                              <Col xs="12" md="6" lg="3">
                                <Label className="label-container">
                                  <strong>Descripción: </strong>
                                  <Input
                                    addon
                                    className="input input-readonly input-auto-heigth"
                                    disabled
                                    readOnly
                                    type="textarea"
                                    value={item.description}
                                  />
                                </Label>
                              </Col>
                              <Col xs="12" md="6" lg="3">
                                <Label className="label-container">
                                  <strong>Exploración:</strong>
                                  <Input
                                    addon
                                    className="input input-readonly input-auto-heigth"
                                    disabled
                                    readOnly
                                    type="textarea"
                                    value={item.exploration}
                                  />
                                </Label>
                              </Col>
                              <Col xs="12" md="6" lg="3">
                                <Label className="label-container">
                                  <strong>Revaloración:</strong>
                                  <Input
                                    addon
                                    className="input input-readonly input-auto-heigth"
                                    disabled
                                    readOnly
                                    type="textarea"
                                    value={item.reassessment}
                                  />
                                </Label>
                              </Col>
                            </>
                          )
                        }
                        <Col xs="12" md={(item.onlyControl || onlyHaveControl(item)) ? '' : '6'} lg={(item.onlyControl || onlyHaveControl(item)) ? '' : '3'}>
                          <Label className="label-container">
                            <strong>Control:</strong>
                            <Input
                              addon
                              className="input input-readonly input-auto-heigth"
                              disabled
                              readOnly
                              type="textarea"
                              value={item.control}
                            />
                          </Label>
                        </Col>
                      </Row>
                      <div className="divider" />
                    </Col>
                  ))
                )}
              </Row>
            </Col>
          </Row>
        </Container>

        <CustomModal
          show={modalIsOpen}
          close={toggleModal}
          title="Ingresa el motivo de la falta"
        >
          <Row>
            <Col xs="12">
              <Input type="text" maxLength="500" id="inputReasonHistory" />
              <Button
                type="button"
                color=""
                className="btn-custom"
                onClick={updateArrivedState}
              >
                Guardar
              </Button>
            </Col>
          </Row>
        </CustomModal>
      </div>

      {modalGraphHeadIsOpen && (
        <GraphHeadCircunference
          show={modalGraphHeadIsOpen}
          close={toggleModalGraphHead}
          neuroMonitoringArray={monitoringItems}
          patientData={patientDataComplete}
        />
      )}
      {modalGraphPlagiocephalyIsOpen && (
        <GraphPlagiocephalyProtocol
          show={modalGraphPlagiocephalyIsOpen}
          close={toggleModalGraphPlagiocephaly}
          neuroMonitoringArray={monitoringItems}
          patientData={patientDataComplete}
        />
      )}
      {modalGraphBranchycephalyIsOpen && (
        <GraphBrachycephalyDolichocephaly
          show={modalGraphBranchycephalyIsOpen}
          close={toggleModalGraphBranchycephaly}
          neuroMonitoringArray={monitoringItems}
          patientData={patientDataComplete}
        />
      )}
      {modalDevelopmentPathIsOpen && (
        <GraphDevelopmentPath
          show={modalDevelopmentPathIsOpen}
          close={toggleModalDevelopmentPath}
          neuroMonitoringArray={monitoringItems}
          patientData={patientDataComplete}
        />
      )}
    </>
  );
};

AppointmentHistory.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default authHOC(AppointmentHistory, [
  'Administrador',
  'Editor',
  'Colaborador',
]);
