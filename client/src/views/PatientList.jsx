/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import confirm from 'reactstrap-confirm';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  Row, Col, Button, Spinner, Container,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import authHOC from '../utils/authHOC';
import { monthOptions } from '../utils/monthOptions';
import { getCurrentMonthNumber, getCurrentYear } from '../utils/formulas';
import {
  deleteMonitoringPatientValorationById,
  deleteMultipleFiles,
  deleteProfilePicByName,
  deletePatientValorationById,
  freePatientValorationById,
  getAllYearRange,
  stopPatientValorationById,
  getPatientValorationsComplete,
} from '../actions/PatientAction';
import Navbar from '../common/Navbar';
import Menu from '../common/Menu';
import CustomAlert from '../common/CustomAlert';
import CustomModal from '../common/CustomModal';
import InputFormGroup from '../common/InputFormGroup';
import ContainerListItems from '../components/ContainerListItems';
import PatientValorationPdf from '../components/PatientValorationPdf';
import RowPatientValorationTable from '../components/RowPatientValorationTable';
import '../styles/filterPatientList.scss';
import { getAllUsersOptionsSearch } from '../actions/UserAction';
import LoadingSpinner from '../common/LoadingSpinner';

const typeUserOptions = [
  { name: 'Activos', value: 'active' },
  { name: 'Alta', value: 'free' },
  { name: 'Suspendidos', value: 'suspended' },
];

const PatientList = ({ history }) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [patientValorationList, setpatientValorationList] = useState([]);
  const [patientValorationtListSearch, setpatientValorationtListSearch] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorPatientValorationList, seterrorPatientValorationList] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(false);

  const [optionsYearRange, setOptionsYearRange] = useState([
    { name: getCurrentYear().toString(), value: getCurrentYear().toString() },
  ]);
  const [userOptions, setUserOptions] = useState([{ name: '', value: '' }]);
  const { control, watch, errors } = useForm({
    defaultValues: {
      yearFilter: getCurrentYear().toString(),
      monthFilter: getCurrentMonthNumber().toString(),
      typeFilter: 'active',
    },
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const toggleModal = () => setModalIsOpen((prevState) => !prevState);
  const [patientDataDownload, setpatientDataDownload] = useState();

  const filterByYearMonthStatus = (year, month, status) => {
    setIsLoading(true);
    const filtro = patientValorationList.filter((item) => {
      const date = item.general.consultDate.split('-');
      return date[0] === year && date[1] === month && item.status === status;
    });
    setpatientValorationtListSearch(filtro);
  };

  useEffect(() => {
    if (dataUpdate) {
      filterByYearMonthStatus(
        watch('yearFilter'),
        watch('monthFilter'),
        watch('typeFilter'),
      );
      setDataUpdate(false);
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [dataUpdate]);

  useEffect(() => {
    getAllYearRange()
      .then((resp) => {
        setOptionsYearRange(resp);
      })
      .catch(() => null);
    getPatientValorationsComplete()
      .then(async (result) => {
        await setpatientValorationList(result.data);
        setDataUpdate(true);
        setIsLoading(false);
      })
      .catch(() => {
        seterrorPatientValorationList(true);
        setIsLoading(false);
      });
    getAllUsersOptionsSearch()
      .then((resp) => {
        setUserOptions(resp);
      })
      .catch(() => null);
    // eslint-disable-next-line
  }, []);

  const searchPatient = () => {
    setIsLoading(true);
    const inputPatientValue = document.getElementById(
      'input-search-filter-patient',
    ).value;
    const inputDoctorValue = document.getElementById(
      'input-search-filter-doctor',
    ).value;
    let filterList = patientValorationList;
    if (inputPatientValue) {
      filterList = filterList.filter(
        (item) => item.general.name
          .toLowerCase()
          .indexOf(inputPatientValue.toLowerCase()) > -1,
      );
    }
    if (inputDoctorValue) {
      filterList = filterList.filter((item) => {
        return (
          item?.doctorAssigned?.name
            ?.toLowerCase()
            .indexOf(inputDoctorValue?.toLowerCase()) > -1
          || item?.references?.referredByOther
            ?.toLowerCase()
            .indexOf(inputDoctorValue?.toLowerCase()) > -1
        );
        // return item.doctorAssigned
        //   ? item?.doctorAssigned?.name.toLowerCase().indexOf(inputDoctorValue.toLowerCase()) > -1
        //   : null;
      });
    }
    setpatientValorationtListSearch(filterList);
    setIsLoading(false);
  };

  const handleDownloadRegister = (patientData) => {
    let neuroMonitoringArray = [];
    if (patientData.neuroMonitoring) {
      neuroMonitoringArray = Object.values(patientData.neuroMonitoring);
      neuroMonitoringArray.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });
    }
    Object.values(neuroMonitoringArray).forEach((neuroItem) => {
      neuroItem.createdAt = moment(neuroItem.timestamp.toDate()).format(
        'DD-MM-YYYY hh:mm:ss',
      );
      const doctor = userOptions.find((user) => {
        const doctorIdRegistered = neuroItem.doctorIdAssigned || '';
        return user.value === doctorIdRegistered;
      });
      neuroItem.doctorAssigned = doctor || '';
      return neuroItem;
    });
    patientData.neuroMonitoring = neuroMonitoringArray;
    setpatientDataDownload(patientData);
    toggleModal();
  };

  const handleDeleteRegister = async (item) => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message: `Esta acción no se puede deshacer. Se borrará permanentemente el registro de ${item.general.name}`,
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });

    if (result === false) return;
    setAlert({
      status: true,
      text: 'Eliminando registro...',
      color: 'blue-one',
    });

    let neuroMonitoringList = [];
    if (item.neuroMonitoring) {
      const objectToArray = Object.values(item.neuroMonitoring);
      objectToArray.sort((a, b) => {
        return b.number - a.number;
      });
      neuroMonitoringList = objectToArray;
    }

    await neuroMonitoringList.forEach(async (MonitoringItem) => {
      await deleteMonitoringPatientValorationById(
        item.id,
        MonitoringItem.idRegister,
      )
        .then(() => deleteMultipleFiles(MonitoringItem.videos, 'videos'))
        .then(() => deleteMultipleFiles(MonitoringItem.images, 'images'))
        .then(() => deleteMultipleFiles(MonitoringItem.documents, 'documents'))
        .then(() => null)
        .catch(() => null);
    });
    setAlert({
      status: true,
      text: 'Seguimientos eliminados con éxito',
      color: 'green',
    });

    if (item.profile_pic_name) {
      await deleteProfilePicByName(item.profile_pic_name)
        .then(() => null)
        .catch(() => null);
    }

    await deletePatientValorationById(item.id)
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        const idx = patientValorationList.findIndex(
          (value) => value.id === item.id,
        );
        if (idx !== -1) {
          const newData = patientValorationList.splice(idx, idx);
          setpatientValorationList(newData);
          setDataUpdate(true);
        }
      })
      .catch((error) => {
        setAlert({
          status: true,
          text: error.message,
          color: 'green',
        });
      });
    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 4000);
  };

  const handleFreeRegister = async (item) => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message: `Esta acción no se puede deshacer. Se dará de alta permanentemente el registro de ${item.general.name}`,
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });

    if (result === false) return;
    setAlert({
      status: true,
      text: 'Dando de alta al paciente...',
      color: 'blue-one',
    });

    await freePatientValorationById(item.id)
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        setDataUpdate(true);
      })
      .catch((error) => {
        setAlert({
          status: true,
          text: error.message,
          color: 'green',
        });
      });
    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 4000);
  };

  const handleStopRegister = async (item) => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message: `Esta acción no se puede deshacer. Se suspenderá el registro de ${item.general.name}`,
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });

    if (result === false) return;
    setAlert({
      status: true,
      text: 'Suspendiendo al paciente...',
      color: 'blue-one',
    });

    await stopPatientValorationById(item.id)
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        setDataUpdate(true);
      })
      .catch((error) => {
        setAlert({
          status: true,
          text: error.message,
          color: 'green',
        });
      });
    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 4000);
  };

  return (
    <>
      <Menu />
      <Navbar history={history} search={searchPatient} />
      <div id="page-wrap">
        {alert.status ? (
          <CustomAlert text={alert.text} color={alert.color} />
        ) : null}
        {errorPatientValorationList && (
          <CustomAlert text="Hubo un error al obtener la información, por favor recargue" />
        )}
        {isLoading ? (
          <LoadingSpinner size="4" text="Cargando...." />
        ) : (
          <ContainerListItems
            title="Pacientes registrados"
            subtitle="Datos de pacientes"
            textButton="Agregar paciente"
            listData={patientValorationtListSearch}
            itemsToShow={30}
            type="patient"
            link="/pacientes/formato/crear/nuevo"
            history={history}
            handleDeleteRegister={handleDeleteRegister}
            handleDownloadRegister={handleDownloadRegister}
            handleFreeRegister={handleFreeRegister}
            handleStopRegister={handleStopRegister}
            RowComponent={RowPatientValorationTable}
            isLoading={isLoading}
            FilterComponent={() => (
              <FilterComponent
                control={control}
                errors={errors}
                setDataUpdate={setDataUpdate}
                optionsYearRange={optionsYearRange}
              />
            )}
          />
        )}
      </div>
      <CustomModal
        show={modalIsOpen}
        close={toggleModal}
        title={`Descargar formato de valoración ${
          patientDataDownload ? `de ${patientDataDownload.general.name}` : ''
        }`}
      >
        <Row>
          <Col xs="12" className="d-flex justify-content-around">
            <Button
              className="btn-custom-cancel"
              color=""
              onClick={toggleModal}
            >
              Cancelar
            </Button>
            <PDFDownloadLink
              document={<PatientValorationPdf data={patientDataDownload} />}
              fileName={`${
                patientDataDownload
                  ? patientDataDownload.general.name
                  : 'Registro de paciente'
              }.pdf`}
            >
              {({ blob, loading }) => (loading || blob.size < 650 ? (
                <Spinner />
              ) : (
                <Button className="btn-custom" color="" onClick={toggleModal}>
                  Descargar
                </Button>
              ))}
            </PDFDownloadLink>
          </Col>
        </Row>
      </CustomModal>
    </>
  );
};

const FilterComponent = ({
  control,
  errors,
  setDataUpdate,
  optionsYearRange,
}) => {
  return (
    <Container className="filter-patient-list">
      <Row>
        <Col xs="12" md="6" lg="6" xl="3" className="col-no-padding">
          <InputFormGroup
            name="yearFilter"
            label="Año"
            type="select"
            inputSearch
            control={control}
            errors={errors?.yearFilter}
            labelSize={5}
            inputSize={7}
            placeHolder="Seleccionar año"
            search={false}
            options={optionsYearRange}
          />
        </Col>
        <Col xs="12" md="6" lg="6" xl="3" className="col-no-padding">
          <InputFormGroup
            name="monthFilter"
            label="Mes"
            type="select"
            inputSearch
            labelSize={5}
            inputSize={7}
            control={control}
            errors={errors?.monthFilter}
            placeHolder="Seleccionar mes"
            search={false}
            options={monthOptions}
          />
        </Col>
        <Col xs="12" md="7" lg="6" xl="4" className="col-no-padding">
          <InputFormGroup
            name="typeFilter"
            label="Usuarios"
            type="select"
            inputSearch
            labelSize={5}
            inputSize={7}
            control={control}
            errors={errors?.typeFilter}
            placeHolder="Seleccionar"
            search={false}
            options={typeUserOptions}
          />
        </Col>
        <Col xs="12" md="5" lg="6" xl="2" className="col-no-padding">
          <Button
            className="btn-custom btn-search"
            color=""
            onClick={() => setDataUpdate(true)}
          >
            Confirmar
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

FilterComponent.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  setDataUpdate: PropTypes.func.isRequired,
  optionsYearRange: PropTypes.array.isRequired,
};

PatientList.propTypes = {
  history: PropTypes.object.isRequired,
};

export default authHOC(PatientList, ['Administrador', 'Editor', 'Colaborador']);
