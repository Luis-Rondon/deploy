/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import confirm from 'reactstrap-confirm';
import {
  Row, Col, Form, Button,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import autosize from 'autosize';
import Label from 'reactstrap/lib/Label';
import fileFormats from '../utils/fileFormats.json';
import { NeuroMonitoringType } from '../models/NeuroMonitoringType';
import {
  updateMonitoringPatientValorationById,
  deleteMultipleFiles,
  uploadMultipleFiles,
  deleteMonitoringPatientValorationById,
  deleteOneMonitoringFiles,
  deleteFilePropertyFromPatientValorationById,
} from '../actions/PatientAction';
import CustomAlert from '../common/CustomAlert';
import FormGroupPatient from './FormGroupPatient';
import NeuroMonitoringFilesModalEdit from './NeuroMonitoringFilesModalEdit';
import { confirmWrongFileAlert } from '../utils/confirmWrongFile';
import {
  getPlagiocephalyIndex,
  getBrachyphalyIndex,
} from '../utils/graphformulas';
import { getAllUsersOptionsSearch } from '../actions/UserAction';
import InputFormGroup from '../common/InputFormGroup';
import MotorRepertoireForm from './MotorRepertoireForm';
import GeneralMovementsForm from './GeneralMovementsForm';
import HammersmithForm from './HammersmithForm';
import { getEcoWeeksPrePost } from '../utils/formulas';

const riskLevelOptions = [
  { value: '', text: '-Seleccionar' },
  {
    value: 'normal-optimo',
    text: 'NORMAL ÓPTIMO',
  },
  {
    value: 'normal-suboptimo',
    text: 'NORMAL SUBÓPTIMO',
  },
  {
    value: 'ligeramente-anormal',
    text: 'LIGERAMENTE ANORMAL',
  },
  {
    value: 'definitivamente-anormal',
    text: 'DEFINITIVAMENTE ANORMAL',
  },
];

const legacyRiskLevelOptions = [
  { value: '', text: '-Seleccionar' },
  {
    value: 'normal-optimo',
    text: 'NORMAL ÓPTIMO',
  },
  {
    value: 'normal-suboptimo',
    text: 'NORMAL SUBÓPTIMO',
  },
  {
    value: 'ligeramente-anormal',
    text: 'LIGERAMENTE ANORMAL',
  },
  {
    value: 'definitivamente-anormal',
    text: 'DEFINITIVAMENTE ANORMAL',
  },
  {
    value: 'bajo',
    text: 'BAJO',
  },
  {
    value: 'medio',
    text: 'MEDIO',
  },
  {
    value: 'alto',
    text: 'ALTO',
  },
];

const riskLevelIsLegacy = (riskLevel) => {
  return !!(riskLevel === 'bajo' || riskLevel === 'medio' || riskLevel === 'alto');
};


const NeuroMonitoringItem = ({
  item,
  index,
  idPatientRegister,
  getDataMonitoringItems,
  typeForm = 'edit',
  onChangeDataMonitoringItem,
}) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [btnSubmitDisabled, setBtnSubmitDisabled] = useState(false);
  const [doctorReferencesSelected, setDoctorReferencesSelected] = useState('neurologist');
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [docFiles, setDocFiles] = useState([]);
  const [itemMonitoring, setItemMonitoring] = useState(item);

  const [readOnlyState] = useState(typeForm === 'view');

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [dataMonitoringItem, setDataMonitoringItem] = useState();

  const [doctorOptions, setDoctorOptions] = useState([
    { name: 'Cargando...', value: '' },
  ]);

  const [correctedAge, setCorrectedAge] = useState({
    age: null,
    type: '',
    sg: null,
  });

  const [showForms, setShowForms] = useState(false);
  const [form12weeks, setForm12weeks] = useState('');

  const toggleShowForms = () => setShowForms((prevState) => !prevState);

  const toggleModal = () => {
    setDataMonitoringItem(item);
    setModalIsOpen((prevState) => !prevState);
  };

  const {
    register, handleSubmit, errors, watch, control,
  } = useForm({
    defaultValues: itemMonitoring,
  });

  useEffect(() => {
    const { age, type } = getEcoWeeksPrePost(item?.ecoWeeks);
    setCorrectedAge({
      age,
      type,
      sg: Number(item?.sg || 0),
    });
    setForm12weeks(item.form12weeks);
    const inputsAutoHeight = document.getElementsByClassName('input-auto-heigth');
    autosize(inputsAutoHeight);
    getDataMonitoringItems();
    getAllUsersOptionsSearch()
      .then((data) => setDoctorOptions(data))
      .catch((error) => setAlert({ status: true, message: error.message, color: 'red' }));
    // eslint-disable-next-line
  }, []);

  const filesSelected = (input, fileNumber) => {
    const label = input.nextElementSibling;
    let labelVal = '';
    if (fileNumber === 0) {
      labelVal = 'Añadir';
      label.querySelector('span').innerHTML = labelVal;
      return;
    }
    if (fileNumber > 1) labelVal = `${fileNumber} nuevos`;
    else labelVal = '1 nuevo';
    label.querySelector('span').innerHTML = labelVal;
    label.querySelector('span').style.backgroundColor = 'var(--green)';
  };

  const resetInputFiles = () => {
    [
      ...document.getElementsByClassName(
        `input-file-reset-${itemMonitoring.idRegister}`,
      ),
    ].forEach((input) => {
      filesSelected(input, 0);
    });
  };

  const onImageFileChange = async (e) => {
    let incorrectedFileNames = '';
    let cont = 0;
    setImageFiles([]);
    for (let i = 0; i < e.target.files.length; i += 1) {
      const newImage = e.target.files[i];
      if (fileFormats.imageFormats.formats.includes(newImage.type)) {
        setImageFiles((prevState) => [...prevState, newImage]);
        cont += 1;
      } else incorrectedFileNames += `<${newImage.name}> `;
    }
    filesSelected(e.target, cont);
    if (incorrectedFileNames.length !== 0) {
      await confirmWrongFileAlert(incorrectedFileNames, 'image');
    }
  };

  const onVideoFileChange = async (e) => {
    let incorrectedFileNames = '';
    let cont = 0;
    setVideoFiles([]);
    for (let i = 0; i < e.target.files.length; i += 1) {
      const newVideo = e.target.files[i];
      if (fileFormats.videoFormats.formats.includes(newVideo.type)) {
        setVideoFiles((prevState) => [...prevState, newVideo]);
        cont += 1;
      } else incorrectedFileNames += `<${newVideo.name}> `;
    }
    filesSelected(e.target, cont);
    if (incorrectedFileNames.length !== 0) {
      await confirmWrongFileAlert(incorrectedFileNames, 'video');
    }
  };

  const onDocFileChange = async (e) => {
    let incorrectedFileNames = '';
    let cont = 0;
    setDocFiles([]);
    for (let i = 0; i < e.target.files.length; i += 1) {
      const newDoc = e.target.files[i];
      if (fileFormats.documentFormats.formats.includes(newDoc.type)) {
        setDocFiles((prevState) => [...prevState, newDoc]);
        cont += 1;
      } else incorrectedFileNames += `<${newDoc.name}> `;
    }
    filesSelected(e.target, cont);
    if (incorrectedFileNames.length !== 0) {
      await confirmWrongFileAlert(incorrectedFileNames, 'document');
    }
  };

  const onSubmit = async (data) => {
    // if (!data.doctorIdAssigned) {
    //   setAlert({
    //     status: true,
    //     text: 'Falta añadir el doctor que atendió',
    //     color: 'red',
    //   });
    //   setTimeout(() => setAlert({ ...alert, status: false }), 4000);
    //   return;
    // }
    const dataComplete = {
      ...itemMonitoring,
      ...data,
    };
    setBtnSubmitDisabled(true);
    setAlert({
      status: true,
      text: 'Actualizando ... No cancele el proceso',
      color: 'blue-two',
    });
    if (docFiles.length > 0) {
      await uploadMultipleFiles(docFiles, 'documents')
        .then((fileList) => {
          dataComplete.documentFiles = {
            ...fileList,
            ...dataComplete.documentFiles,
          };
          setDocFiles([]);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    if (imageFiles.length > 0) {
      await uploadMultipleFiles(imageFiles, 'images')
        .then((fileList) => {
          dataComplete.imageFiles = {
            ...fileList,
            ...dataComplete.imageFiles,
          };
          setImageFiles([]);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    if (videoFiles.length > 0) {
      await uploadMultipleFiles(videoFiles, 'videos')
        .then((fileList) => {
          dataComplete.videoFiles = {
            ...fileList,
            ...dataComplete.videoFiles,
          };
          setVideoFiles([]);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    await updateMonitoringPatientValorationById(idPatientRegister, dataComplete)
      .then((result) => {
        const { age, type } = getEcoWeeksPrePost(item?.ecoWeeks);
        setCorrectedAge({
          age,
          type,
          sg: Number(item?.sg || 0),
        });
        setItemMonitoring(dataComplete);
        setForm12weeks(dataComplete.form12weeks);
        setAlert({ status: true, text: result.message, color: 'green' });
        setBtnSubmitDisabled(false);
        resetInputFiles();
      })
      .catch(() => setBtnSubmitDisabled(false));
    setTimeout(() => {
      setAlert({ ...alert, status: false });
    }, 3000);
  };

  const onSubmitFiles = async (
    button,
    setStateImages,
    setStateVideos,
    setStateDocuments,
  ) => {
    const dataComplete = itemMonitoring;
    button.textContent = 'Subiendo...';
    button.disabled = true;
    if (docFiles.length > 0) {
      await uploadMultipleFiles(docFiles, 'documents', setStateDocuments)
        .then((fileList) => {
          dataComplete.documentFiles = {
            ...fileList,
            ...dataComplete.documentFiles,
          };
          setDocFiles([]);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    if (imageFiles.length > 0) {
      await uploadMultipleFiles(imageFiles, 'images', setStateImages)
        .then((fileList) => {
          dataComplete.imageFiles = {
            ...fileList,
            ...dataComplete.imageFiles,
          };
          setImageFiles([]);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    if (videoFiles.length > 0) {
      await uploadMultipleFiles(videoFiles, 'videos', setStateVideos)
        .then((fileList) => {
          dataComplete.videoFiles = {
            ...fileList,
            ...dataComplete.videoFiles,
          };
          setVideoFiles([]);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    await updateMonitoringPatientValorationById(idPatientRegister, dataComplete)
      .then(() => {
        setItemMonitoring(dataComplete);
        setForm12weeks(dataComplete.form12weeks);
        button.textContent = 'Subir archivos';
        button.disabled = false;
        resetInputFiles();
      })
      .catch(() => {
        button.textContent = 'Subir archivos';
        button.disabled = false;
      });
  };

  const handleSubmitdeleteMonitoringItem = async () => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message:
        'Esta acción no se puede deshacer. Se borrará permanentemente el registro de seguimiento y los archivos relacionados',
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });
    if (result === false) return;
    await deleteMonitoringPatientValorationById(
      idPatientRegister,
      item.idRegister,
    )
      .then(() => deleteMultipleFiles(Object.values(item.videoFiles), 'videos'))
      .then(() => deleteMultipleFiles(Object.values(item.imageFiles), 'images'))
      .then(() => deleteMultipleFiles(Object.values(item.documentFiles), 'documents'))
      .then(() => {
        setAlert({
          status: true,
          text: 'Seguimiento eliminado con éxito',
          color: 'green',
        });
      })
      .catch(() => setAlert({
        status: true,
        text: 'Ha ocurrido un error al eliminar el registro',
        color: 'red',
      }));
    setTimeout(() => {
      setAlert({ ...alert, status: false });
    }, 2000);
    getDataMonitoringItems();
  };

  const deleteOneFile = async (file, keyFile, type) => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message:
        'Está a punto de borrar permanentemente este archivo. Esta acción no se puede deshacer.',
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });
    if (result === false) return;
    await deleteOneMonitoringFiles(file, type)
      .then(() => deleteFilePropertyFromPatientValorationById(
        idPatientRegister,
        itemMonitoring.idRegister,
        keyFile,
        type.substring(0, type.length - 1),
      ))
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        const newData = itemMonitoring;
        switch (type) {
          case 'documents':
            delete newData.documentFiles[keyFile];
            break;
          case 'images':
            delete newData.imageFiles[keyFile];
            break;
          case 'videos':
            delete newData.videoFiles[keyFile];
            break;
          default:
            break;
        }
        getDataMonitoringItems();
      })
      .catch(() => setAlert({
        status: true,
        text: 'Por el momento no se pudo eliminar el archivo',
        color: 'red',
      }));
    setTimeout(() => {
      setAlert({ ...alert, status: false });
    }, 2500);
  };

  const getColorDoctorReference = (key) => {
    const currentObject = watch(`doctorReferences.${key}`);
    if (currentObject) {
      return currentObject.diagnosis
        || currentObject.treatment
        || currentObject.suggestions
        || currentObject.notes
        ? 'var(--green)'
        : 'var(--blue-one)';
    }
    return 'var(--blue-one)';
  };

  const getGradeType = (inputType) => {
    let index;
    let value;
    if (inputType === 'brachyphaly') {
      index = getBrachyphalyIndex(
        watch('brachyphalySd'),
        watch('brachyphalyAp'),
      );

      value = index < 60 ? 'severo'
        : index >= 60 && index < 70 ? 'moderado'
          : index >= 70 && index < 75 ? 'leve'
            : index >= 75 && index <= 85 ? 'normal'
              : index > 85 && index <= 90 ? 'leve'
                : index > 90 && index <= 100 ? 'moderado'
                  : index > 100 ? 'severo' : '';
    } else if (inputType === 'plagiocephaly') {
      index = getPlagiocephalyIndex(
        watch('plagiocephalyIndexA'),
        watch('plagiocephalyIndexB'),
      );

      value = index < 3 ? 'normal'
        : index < 10 ? 'leve'
          : index <= 20 ? 'moderado'
            : index >= 20 ? 'severo' : '';
    }

    return value;
  };

  const getBrachyDolyLabelText = () => {
    const index = getBrachyphalyIndex(
      watch('brachyphalySd'),
      watch('brachyphalyAp'),
    );

    let text;

    if (index === 'N/A') {
      text = 'Braquicefalia / Dolicefalia';
    }

    if (index < 75) {
      text = `Dolicefalia - Índice: ${index}`;
    } else if (index >= 75) {
      text = `Braquicefalia - Índice: ${index}`;
    }
    return text;
  };

  const oppositeIsFilled = (opposite) => {
    if (opposite === 'plagiocephaly') {
      return watch('plagiocephalyIndexA') && watch('plagiocephalyIndexB');
    } if (opposite === 'brachyphaly') {
      return watch('brachyphalySd') && watch('brachyphalyAp');
    }
    return false;
  };

  return (
    <>
      <span
        className={
          index % 2 === 0
            ? 'neuro-monitoring-item-gray'
            : 'neuro-monitoring-item-white'
        }
      >
        <Form
          onSubmit={handleSubmit(onSubmit)}
          className="neuro-monitoring-item"
        >
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
          <Row className="row row-neuro-monitoring">
            <Col xs="12" lg="12">
              <Row>
                <Col
                  xs="6"
                  md="3"
                  lg="1"
                  className="col neuroitem-input-number"
                >
                  <FormGroupPatient
                    name="number"
                    label="N°"
                    placeHolder="1"
                    type="number"
                    required
                    pattern="^[0-9]+"
                    min="1"
                    inputSize="6"
                    labelSize="6"
                    register={register}
                    errors={errors?.number}
                    readOnly
                  />
                </Col>
                <Col xs="6" md="3" lg={`${watch('onlyControl') ? '3' : '2'}`} className="col neuroitem-input-other">
                  <FormGroupPatient
                    name="createdAt"
                    label="Fecha"
                    minLength={10}
                    maxLength={10}
                    placeHolder="yyyy-mm-dd"
                    inputClassname="input-auto-heigth mt-2"
                    pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                    inputSize="7"
                    labelSize="5"
                    type="textarea"
                    register={register}
                    errors={errors?.date}
                    required
                    readOnly
                  />
                </Col>
                {
                  !watch('onlyControl') && (
                    <>
                      <Col xs="6" md="3" lg="1" className="col neuroitem-input-other">
                        <FormGroupPatient
                          name="sg"
                          label="SG"
                          placeHolder="SG"
                          inputSize="12"
                          labelSize="12"
                          type="number"
                          register={register}
                          errors={errors?.sg}
                          required={false}
                          readOnly
                        />
                      </Col>
                      <Col xs="6" md="3" lg="2" className="col neuroitem-input-other">
                        <FormGroupPatient
                          name="dn"
                          label="Días de nacido"
                          placeHolder=""
                          type="text"
                          inputSize="12"
                          labelSize="12"
                          register={register}
                          errors={errors?.dn}
                          required={false}
                          readOnly
                        />
                      </Col>
                      <Col xs="6" md="3" lg="2" className="col neuroitem-input-other">
                        <FormGroupPatient
                          name="leftTime"
                          label="Tiempo faltante"
                          placeHolder=""
                          type="text"
                          inputSize="12"
                          labelSize="12"
                          register={register}
                          errors={errors?.leftTime}
                          required={false}
                          readOnly
                        />
                      </Col>
                      <Col xs="6" md="3" lg="1" className="col neuroitem-input-other">
                        <FormGroupPatient
                          name="eCron"
                          label="E.Cron."
                          placeHolder=""
                          type="text"
                          inputSize="12"
                          labelSize="12"
                          register={register}
                          errors={errors?.eCron}
                          required={false}
                          readOnly
                        />
                      </Col>
                      <Col xs="6" md="3" lg="1" className="col neuroitem-input-other">
                        <FormGroupPatient
                          name="eco"
                          label="Eco."
                          placeHolder=""
                          type="text"
                          inputSize="12"
                          labelSize="12"
                          register={register}
                          errors={errors?.eco}
                          required={false}
                          readOnly
                        />
                      </Col>
                    </>
                  )
                }
                <Col xs="6" md="3" lg="2" className="col neuroitem-input-other">
                  <FormGroupPatient
                    name="ecoWeeks"
                    label="ECo. semanas"
                    placeHolder=""
                    type="text"
                    inputSize="12"
                    labelSize="12"
                    register={register}
                    errors={errors?.ecoWeeks}
                    required={false}
                    readOnly
                  />
                </Col>
                <Col xs="6" lg="2" className="col neuroitem-input-other">
                  <FormGroupPatient
                    name="movementType"
                    label="GMs esperado"
                    inputClassname="input-movement-type"
                    required={false}
                    placeHolder=""
                    type="text"
                    inputSize="12"
                    labelSize="12"
                    register={register}
                    errors={errors?.movementType}
                    readOnly
                  />
                </Col>
                {
                  !watch('onlyControl') && (
                    <>

                      <Col xs="6" md="3" lg="2" className="col neuroitem-input-other">
                        <FormGroupPatient
                          name="result"
                          label="Resultado"
                          placeHolder="PR"
                          type="text"
                          required={false}
                          inputSize="12"
                          labelSize="12"
                          register={register}
                          errors={errors?.result}
                          inputClassname="input-auto-heigth short-heigth"
                          readOnly={readOnlyState}
                        />
                      </Col>
                      <Col xs="6" md="3" lg="2" className="col">
                        <FormGroupPatient
                          name="score"
                          label="Puntuación"
                          inputClassname="input-auto-heigth short-heigth mt-0 px-0"
                          placeHolder="(PTS)"
                          type="text"
                          inputSize="12"
                          labelSize="12"
                          register={register}
                          errors={errors?.score}
                          required={false}
                          readOnly={readOnlyState}
                        />
                      </Col>
                      <Col xs="6" md="3" lg="2" className="col">
                        <FormGroupPatient
                          name="riskLevel"
                          label="Nivel de Riesgo"
                          inputClassname={`risk-${watch('riskLevel')}`}
                          placeHolder="Normal"
                          type="select"
                          inputSize="12"
                          labelSize="12"
                          // options={legacyRiskLevelOptions}
                          options={riskLevelIsLegacy(watch('riskLevel')) ? legacyRiskLevelOptions : riskLevelOptions}
                          register={register}
                          errors={errors?.riskLevel}
                          required={false}
                          readOnly={readOnlyState}
                        />
                      </Col>
                    </>
                  )
                }
                <Col xs="6" lg="3" className="col">
                  {item.doctorIdAssigned ? (
                    <InputFormGroup
                      name="doctorIdAssigned"
                      label="Terapeuta que registró"
                      type="select"
                      inputSearch
                      inputSize="12"
                      labelSize="12"
                      placeHolder="-Sin registrar-"
                      search={false}
                      control={control}
                      options={doctorOptions}
                      readOnly={readOnlyState}
                    />
                  ) : (
                    <FormGroupPatient
                      name="doctorsList"
                      label="Terapeutas responsables"
                    // required={false}
                      placeHolder="Ingresar terapeutas"
                      type="textarea"
                      inputSize="12"
                      labelSize="12"
                      rows="2"
                      register={register}
                      errors={errors?.control}
                      inputClassname="input-auto-heigth"
                      readOnly={readOnlyState}
                      bulletPoint
                    />
                  )}
                </Col>
                <Col xs="6" lg={`${watch('onlyControl') ? 11 : 3}`} className="col neuroitem-input-other">
                  <FormGroupPatient
                    name="control"
                    label="Control"
                    required={false}
                    placeHolder="Alcances motores"
                    type="textarea"
                    inputSize="12"
                    labelSize="12"
                    rows="2"
                    register={register}
                    errors={errors?.control}
                    inputClassname="input-auto-heigth"
                    readOnly={readOnlyState}
                    bulletPoint
                  />
                </Col>
                {
                  !watch('onlyControl') && (
                  <>
                    <Col xs="6" lg="3" className="col neuroitem-input-other">
                      <FormGroupPatient
                        name="description"
                        label="Descripción"
                        inputSize="12"
                        labelSize="12"
                        placeHolder="Administra neuro Leviracetam"
                        type="textarea"
                        rows="1"
                        register={register}
                        errors={errors?.description}
                        required={false}
                        inputClassname="input-auto-heigth"
                        readOnly={readOnlyState}
                        bulletPoint
                      />
                    </Col>
                    <Col xs="6" lg="3" className="col neuroitem-input-other">
                      <FormGroupPatient
                        name="exploration"
                        label="Exploración"
                        inputSize="12"
                        labelSize="12"
                        placeHolder="Exploración"
                        type="textarea"
                        rows="1"
                        register={register}
                        errors={errors?.exploration}
                        required={false}
                        inputClassname="input-auto-heigth"
                        readOnly={readOnlyState}
                        bulletPoint
                      />
                    </Col>
                    <Col xs="6" lg="3" className="col neuroitem-input-other">
                      <FormGroupPatient
                        name="cxObjetives"
                        label="Objetivos TX"
                        inputSize="12"
                        labelSize="12"
                        placeHolder="Objetivos TX"
                        type="textarea"
                        rows="1"
                        register={register}
                        errors={errors?.cxObjetives}
                        required={false}
                        inputClassname="input-auto-heigth"
                        readOnly={readOnlyState}
                        bulletPoint
                      />
                    </Col>
                    <Col xs="6" lg="3" className="col neuroitem-input-other">
                      <FormGroupPatient
                        name="reassessment"
                        label="Revaloración"
                        inputSize="12"
                        labelSize="12"
                        placeHolder="Revaloración"
                        type="textarea"
                        rows="1"
                        register={register}
                        errors={errors?.reassessment}
                        required={false}
                        inputClassname="input-auto-heigth short-heigth"
                        readOnly={readOnlyState}
                        bulletPoint
                      />
                    </Col>
                  </>
                  )
                }
                {/* <Col xs="6" lg="3" className="col neuroitem-input-createdat">
                  <FormGroupPatient
                    name="createdAt"
                    label="Seguimiento creado el:"
                    placeHolder=""
                    type="textarea"
                    rows="1"
                    inputSize="12"
                    labelSize="12"
                    register={register}
                    errors={errors?.createdAt}
                    required={false}
                    readOnly
                    inputClassname="input-auto-heigth"
                  />
                </Col> */}
              </Row>
              <Row>
                {
                  !oppositeIsFilled('brachyphaly')
                    && (
                    <Col xs="6" md="3" lg="4" xxl="3" className="col col-xxl-2">
                      <Row className="col">
                        <Col xs="12" className="col-index-header">
                          <Label className="index-header">
                            {`Plagiocefalia - Índice: ${getPlagiocephalyIndex(
                              watch('plagiocephalyIndexA'),
                              watch('plagiocephalyIndexB'),
                            )}`}
                          </Label>
                        </Col>
                        <Col xs="12" md="6" className="col neuroitem-input-other">
                          <FormGroupPatient
                            name="plagiocephalyIndexA"
                            label="Diagonal A "
                            placeHolder="(mm)"
                            type="number"
                            required={false}
                            inputSize="5"
                            labelSize="7"
                            register={register}
                            errors={errors?.plagiocephalyIndexA}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="12" md="6" className="col neuroitem-input-other">
                          <FormGroupPatient
                            name="plagiocephalyIndexB"
                            label="Diagonal B "
                            placeHolder="(mm)"
                            type="number"
                            required={false}
                            inputSize="5"
                            labelSize="7"
                            register={register}
                            errors={errors?.plagiocephalyIndexB}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="12">
                          <p className={`grade ${getGradeType('plagiocephaly')}`}>
                            {`Grado: ${getGradeType('plagiocephaly')}`}
                          </p>
                        </Col>
                      </Row>
                    </Col>
                    )
                }
                {
                  !oppositeIsFilled('plagiocephaly')
                  && (
                  <Col xs="6" md="3" lg="4" xxl="3" className="col-xxl-2">
                    <Row className="col">
                      <Col xs="12" className="col-index-header">
                        <Label className="index-header">
                          {getBrachyDolyLabelText()}
                        </Label>
                      </Col>
                      <Col xs="12" md="6" className="col">
                        <FormGroupPatient
                          name="brachyphalySd"
                          label="Biparietal "
                          placeHolder="(mm)"
                          type="number"
                          required={false}
                          inputSize="5"
                          labelSize="7"
                          register={register}
                          errors={errors?.brachyphalySd}
                          readOnly={readOnlyState}
                        />
                      </Col>
                      <Col xs="12" md="6" className="col">
                        <FormGroupPatient
                          name="brachyphalyAp"
                          label="Ant.-post. "
                          placeHolder="(mm)"
                          type="number"
                          required={false}
                          inputSize="6"
                          labelSize="6"
                          register={register}
                          errors={errors?.brachyphalyAp}
                          readOnly={readOnlyState}
                        />
                      </Col>
                      <Col xs="12">
                        <p className={`grade ${getGradeType('brachyphaly')}`}>
                          {`Grado: ${getGradeType('brachyphaly')}`}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  )
                }
                <Col xs="6" md="4" lg="2" xxl="3" className="col col-xxl-2">
                  <Row className="col">
                    <Col
                      xs="12"
                      className="col-index-header neuroitem-input-other"
                    >
                      <Label className="index-header">Perímetro cefálico</Label>
                    </Col>
                    <Col xs="12" className="col">
                      <FormGroupPatient
                        name="headCircunference"
                        label="Perímetro cefálico"
                        placeHolder="(cm)"
                        type="number"
                        required={false}
                        inputSize="5"
                        labelSize="7"
                        register={register}
                        errors={errors?.headCircunference}
                        readOnly={readOnlyState}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col xs="6" lg="2" xxl="3" className="col-xxl-3">
                  <Row>
                    <Col xs="6" md="6" lg="6" className="col">
                      <Row className="col">
                        <Col xs="12" className="col-index-header">
                          <Label className="index-header">Peso</Label>
                        </Col>
                        <Col xs="12" className="col p-0">
                          <FormGroupPatient
                            name="weight"
                            label="Peso"
                            placeHolder="(gr)"
                            type="number"
                            min="0"
                            inputSize="6"
                            labelSize="6"
                            register={register}
                            errors={errors?.weight}
                            required={false}
                            readOnly={readOnlyState}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs="6" md="6" lg="6" className="col">
                      <Row className="col">
                        <Col xs="12" className="col-index-header">
                          <Label className="index-header">Talla</Label>
                        </Col>
                        <Col xs="12" className="col p-0">
                          <FormGroupPatient
                            name="size"
                            label="Talla"
                            placeHolder="(cm)"
                            type="number"
                            min="0"
                            inputSize="6"
                            labelSize="6"
                            inputClassname="p-0"
                            register={register}
                            errors={errors?.size}
                            required={false}
                            readOnly={readOnlyState}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xs="12" className="references-container">
              {Object.keys(NeuroMonitoringType.doctorReferences).map((key) => (
                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                <p
                  className="references-doctor"
                  key={key}
                  onClick={() => setDoctorReferencesSelected(key)}
                  onKeyPress={() => setDoctorReferencesSelected(key)}
                  style={{
                    backgroundColor:
                      doctorReferencesSelected === key
                        ? 'var(--blue-two)'
                        : getColorDoctorReference(key),
                  }}
                >
                  {NeuroMonitoringType.doctorReferences[key].doctorType}
                </p>
              ))}
            </Col>
            <Col xs="12" xl="12">
              {Object.keys(NeuroMonitoringType.doctorReferences).map((key) => (
                <Row
                  key={key}
                  style={{
                    height: doctorReferencesSelected === key ? 'auto' : '0px',
                    visibility:
                      doctorReferencesSelected === key ? 'visible' : 'hidden',
                  }}
                >
                  <Col xs="6" md="3" className="col">
                    <FormGroupPatient
                      name={`doctorReferences.${key}.diagnosis`}
                      label="Diagnóstico"
                      required={false}
                      inputSize="12"
                      labelSize="12"
                      placeHolder="Ingresa el diagnóstico"
                      type="textarea"
                      rows="2"
                      register={register}
                      inputClassname="input-auto-heigth"
                      readOnly={readOnlyState}
                      bulletPoint
                    />
                  </Col>
                  <Col xs="6" md="3" className="col">
                    <FormGroupPatient
                      name={`doctorReferences.${key}.treatment`}
                      label="Tratamiento"
                      required={false}
                      inputSize="12"
                      labelSize="12"
                      placeHolder="Ingresa el tratamiento"
                      type="textarea"
                      rows="2"
                      register={register}
                      inputClassname="input-auto-heigth"
                      readOnly={readOnlyState}
                      bulletPoint
                    />
                  </Col>
                  <Col xs="6" md="3" className="col">
                    <FormGroupPatient
                      name={`doctorReferences.${key}.suggestions`}
                      label="Sugerencias"
                      required={false}
                      inputSize="12"
                      labelSize="12"
                      placeHolder="Ingresa las sugerencias"
                      type="textarea"
                      rows="2"
                      register={register}
                      inputClassname="input-auto-heigth"
                      readOnly={readOnlyState}
                      bulletPoint
                    />
                  </Col>
                  <Col xs="6" md="3" className="col">
                    <FormGroupPatient
                      name={`doctorReferences.${key}.notes`}
                      label="Notas"
                      required={false}
                      inputSize="12"
                      labelSize="12"
                      placeHolder="Ingresa las notas"
                      type="textarea"
                      rows="2"
                      register={register}
                      inputClassname="input-auto-heigth"
                      readOnly={readOnlyState}
                      bulletPoint
                    />
                  </Col>
                </Row>
              ))}
            </Col>
            <Col xs="12">
              <Row>
                {<Col xs="6" />}
                {
                  !readOnlyState
                  && correctedAge?.type === 'post'
                  && correctedAge?.age >= 8
                  && correctedAge?.age <= 24 && (
                    <Col xs="6">
                      <FormGroupPatient
                        type="select"
                        name="form12weeks"
                        label="Formulario a utilizar"
                        placeHolder="-Seleccionar-"
                        labelSize={4}
                        inputSize={8}
                        register={register}
                        search={false}
                        control={control}
                        options={[
                          { value: '', text: '-Seleccionar' },
                          {
                            value: 'motorRepertorie',
                            text: 'Evaluación del Repertorio Motor',
                          },
                          {
                            value: 'hammersmith',
                            text: 'Examen Neurológico Hammersmith',
                          },
                        ]}
                        inputClassname="background-type-blue"
                        readOnly={readOnlyState}
                        errors={errors?.form12weeks}
                      />
                    </Col>
                  )
}
              </Row>
            </Col>

            <Col xs="12" className="col">
              <Row className="col">
                <Col
                  xs="6"
                  md="3"
                  style={{ display: typeForm === 'edit' ? 'block' : 'none' }}
                  className="text-center"
                >
                  <Button
                    type="submit"
                    className="btn-custom"
                    color=""
                    disabled={btnSubmitDisabled}
                  >
                    Actualizar
                  </Button>
                </Col>
                <Col
                  xs="6"
                  md="3"
                  style={{ display: typeForm === 'edit' ? 'block' : 'none' }}
                  className="text-center"
                >
                  <Button
                    className="btn-custom"
                    color=""
                    onClick={handleSubmitdeleteMonitoringItem}
                  >
                    Eliminar
                  </Button>
                </Col>
                <Col
                  xs="6"
                  md="3"
                  style={{ display: typeForm === 'edit' ? 'block' : 'none' }}
                  className="text-center"
                >
                  <Button
                    className="btn-custom btn-edit"
                    color=""
                    onClick={() => toggleModal()}
                  >
                    Editar archivos
                  </Button>
                </Col>
                {(correctedAge?.age || correctedAge?.sg) && (
                  <Col
                    xs="6"
                    md={typeForm === 'view' ? 6 : 3}
                    className="text-center"
                  >
                    <Button
                      className="btn-custom btn-edit"
                      color=""
                      onClick={() => toggleShowForms()}
                    >
                      {showForms ? 'Ocultar formulario' : 'Ver formulario'}
                    </Button>
                  </Col>
                )}
                <Col
                  xs="6"
                  lg="6"
                  style={{ display: typeForm === 'view' ? 'block' : 'none' }}
                >
                  <Button
                    className="btn-custom"
                    color=""
                    onClick={() => onChangeDataMonitoringItem(item)}
                  >
                    Ver {Object.values(item.videoFiles || {}).length}{' '}
                    <i className="fas fa-video" />{' '}
                    {Object.values(item.imageFiles || {}).length}{' '}
                    <i className="fas fa-image" />{' '}
                    {Object.values(item.documentFiles || {}).length}{' '}
                    <i className="fas fa-file-alt" />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          {itemMonitoring.idRegister
            && correctedAge?.type === 'post'
            && correctedAge?.age >= 7
            && correctedAge?.age < 8 && (
              <Row
                className={
                  index % 2 === 0
                    ? 'neuro-monitoring-item-gray'
                    : 'neuro-monitoring-item-white'
                }
              >
                <Col
                  xs="12"
                  className="col col-title"
                  style={{ textAlign: 'center' }}
                >
                  <h1 className="title">Periodo de transición</h1>
                </Col>
              </Row>
          )}
          {itemMonitoring.idRegister
            && ((correctedAge?.type === 'pret' && correctedAge?.age < 26)
              || (correctedAge?.type === 'post' && correctedAge?.age > 105)
              || item?.eco === 'Mayor a 2 años') && (
              <Row
                className={
                  index % 2 === 0
                    ? 'neuro-monitoring-item-gray'
                    : 'neuro-monitoring-item-white'
                }
              >
                <Col
                  xs="12"
                  className="col col-title"
                  style={{ textAlign: 'center' }}
                >
                  <h1 className="title">No aplica formulario adicional</h1>
                </Col>
              </Row>
          )}
        </Form>
        <NeuroMonitoringFilesModalEdit
          show={modalIsOpen}
          close={toggleModal}
          data={dataMonitoringItem || null}
          deleteOneFile={deleteOneFile}
          onImageFileChange={onImageFileChange}
          onVideoFileChange={onVideoFileChange}
          onDocFileChange={onDocFileChange}
          onSubmitFiles={onSubmitFiles}
        />
        {itemMonitoring.idRegister
          && showForms
          && ((correctedAge?.age >= 26
            && correctedAge?.age <= 40
            && correctedAge?.type === 'pret')
            || (correctedAge?.age >= 0
              && correctedAge?.age <= 6
              && correctedAge?.type === 'post')
            || correctedAge?.sg === 40) && (
            <GeneralMovementsForm
              idRegister={itemMonitoring.idRegister}
              idPatientRegister={idPatientRegister}
              typeForm={typeForm}
              origin="neuroMonitoring"
            />
        )}
        {/* {itemMonitoring.idRegister &&
          showForms &&
          correctedAge?.type === "post" &&
          correctedAge?.age >= 9 &&
          correctedAge?.age <= 22 && (
            <MotorRepertoireForm
              idRegister={itemMonitoring.idRegister}
              idPatientRegister={idPatientRegister}
              ecoWeeksInput={itemMonitoring?.ecoWeeks}
              typeForm={typeForm}
              origin="neuroMonitoring"
            />
          )} */}
        {itemMonitoring.idRegister
          && showForms
          && correctedAge?.type === 'post'
          && ((correctedAge?.age >= 8 && correctedAge?.age <= 22)
          && (form12weeks !== 'hammersmith')
          // eslint-disable-next-line
          // || (form12weeks !== 'hammersmith' &&
          // correctedAge?.age >= 8
          // && correctedAge?.age <= 22)) && (

          // (correctedAge?.type === "post" &&
          //   correctedAge?.age >= 9 &&
          //   correctedAge?.age < 12) ||
          // (form12weeks === "motorRepertorie" &&
          // correctedAge?.age <= 22) (
            && (
              <MotorRepertoireForm
                idRegister={itemMonitoring.idRegister}
                idPatientRegister={idPatientRegister}
                ecoWeeksInput={itemMonitoring?.ecoWeeks}
                typeForm={typeForm}
                origin="neuroMonitoring"
              />
            )
          )}
        {itemMonitoring.idRegister
          && showForms
          && correctedAge?.type === 'post'
          // (correctedAge?.age >= 8 && correctedAge?.age < 12) ||
          && (form12weeks === 'hammersmith' || correctedAge?.age > 22)
          && correctedAge?.age >= 8
          && correctedAge?.age <= 105 && (
            // (correctedAge?.type === "post" &&
            //   correctedAge?.age >= 2 &&
            //   correctedAge?.age < 12) ||
            // (form12weeks === "hammersmith" &&
            //   correctedAge?.age <= 24)
            <HammersmithForm
              idRegister={itemMonitoring.idRegister}
              idPatientRegister={idPatientRegister}
              ecoWeeksInput={itemMonitoring?.ecoWeeks}
              typeForm={typeForm}
              origin="neuroMonitoring"
            />
        )}
        <hr className="divider" />
      </span>
    </>
  );
};

NeuroMonitoringItem.defaultProps = {
  getDataMonitoringItems: () => null,
  idPatientRegister: null,
  onChangeDataMonitoringItem: null,
  typeForm: 'edit',
};

NeuroMonitoringItem.propTypes = {
  getDataMonitoringItems: PropTypes.func,
  idPatientRegister: PropTypes.string,
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChangeDataMonitoringItem: PropTypes.func,
  typeForm: PropTypes.oneOf(['edit', 'view']),
};

export default NeuroMonitoringItem;
