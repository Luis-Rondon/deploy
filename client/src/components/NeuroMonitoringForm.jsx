/* eslint-disable max-len */
import React, {
  useState, useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Button, Progress, Label, Input,
} from 'reactstrap';
import autosize from 'autosize';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { Link } from 'react-router-dom';
// import AgendarCitaModal from './AgendarCitaModal';
import { NeuroMonitoringType } from '../models/NeuroMonitoringType';
import fileFormats from '../utils/fileFormats.json';
import {
  uploadMultipleFiles,
  pushMonitoringPatientValorationById,
  getPatientValorationById,
} from '../actions/PatientAction';
import InputFormGroup from '../common/InputFormGroup';
import CustomModal from '../common/CustomModal';
import CustomAlert from '../common/CustomAlert';
import FormGroupPatient from './FormGroupPatient';
import NeuroMonitoringItem from './NeuroMonitoringItem';
import { confirmWrongFileAlert } from '../utils/confirmWrongFile';
import {
  getPlagiocephalyIndex,
  getBrachyphalyIndex,
} from '../utils/graphformulas';
// import UserData from '../context/UserData';
import {
  getCorrectedWeeksOfGestation,
  getMovementType,
} from '../utils/formulas';
import '../styles/neuroMonitoringForm.scss';
import { getAllDatesByPatientId, updateDateById } from '../actions/DatesAction';
// import { addSubdomain } from 'firebase-tools/lib/utils';

const frecuencyOptions = [
  { text: '-Seleccionar', value: '' },
  { text: '1 semana', value: '1 semana' },
  { text: '2 semanas', value: '2 semanas' },
  { text: '3 semanas', value: '3 semanas' },
  { text: '1 mes', value: '1 mes' },
  { text: '1 mes y medio', value: '1 mes y medio' },
  { text: '2 meses', value: '2 meses' },
  { text: '2 meses  y medio', value: '2 meses y medio' },
  { text: '3 meses', value: '3 meses' },
  { text: '3 meses y medio', value: '3 meses y medio' },
  { text: '4 meses', value: '4 meses' },
  { text: '4 meses y medio', value: '4 meses y medio' },
  { text: '5 meses', value: '5 meses' },
];

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

const NeuroMonitoringForm = ({
  idPatientRegister,
  setIsLoading,
  isLoading,
}) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [btnSubmitDisabled, setBtnSubmitDisabled] = useState(false);
  const [patientData, setPatientData] = useState();
  const [monitoringItems, setMonitoringItems] = useState([]);
  const [doctorReferencesSelected, setDoctorReferencesSelected] = useState('neurologist');
  const [docFiles, setDocFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const toggleModal = () => setModalIsOpen((prevState) => !prevState);
  const [datesData, setDatesData] = useState([]);
  // const [datesOptions, setDatesOptions] = useState([]);
  // const [confirmarCita, setConfirmarCita] = useState(false);
  // const toggleConfirmarCita = () => setConfirmarCita((prevState) => !prevState);
  const [tipoDeSeguimiento, setTipoDeSeguimiento] = useState('');
  const returnToMenu = () => { setTipoDeSeguimiento(''); };
  const [showMotivo, setShowMotivo] = useState(false);
  const [llegoACita, setLlegoACita] = useState('');
  const confirmarLlegada = (confirmacion) => {
    setLlegoACita(confirmacion);
  };
  const [motivoFalta, setMotivoFalta] = useState('');
  const toggleShowMotivo = () => setShowMotivo((prevState) => !prevState);
  const changeMotivoFalta = (e) => {
    setMotivoFalta(e.target.value);
  };
  const monitoringForm = useRef(null);
  const [progressVideos, setProgressVideos] = useState(0);
  const [progressImages, setProgressImages] = useState(0);
  const [progressDocuments, setProgressDocuments] = useState(0);

  // const [modalCitaIsOpen, setModalCitaIsOpen] = useState(false);

  // const { userData } = useContext(UserData);

  const {
    register, handleSubmit, errors, reset, watch, getValues, setValue,
  } = useForm({ defaultValues: NeuroMonitoringType });

  // const toggleModalCita = () => setModalCitaIsOpen((prevState) => !prevState);

  const getDataMonitoringItems = () => {
    getPatientValorationById(idPatientRegister)
      .then((result) => {
        if (result.data.neuroMonitoring) {
          const objectToArray = Object.values(result.data.neuroMonitoring);
          objectToArray.sort((a, b) => {
            return a.number - b.number;
          });
          setMonitoringItems(objectToArray);
          setIsLoading(false);
        }
        if (result.data.general) {
          setPatientData({
            name: result.data.general.name,
            birthDate: result.data.general.birthDate,
            sg: result.data.general.sg,
          });
          setValue('sg', result.data.general.sg);
        }
      })
      .catch(() => null);
    getAllDatesByPatientId(idPatientRegister)
      .then((result) => {
        setDatesData(result.data);
        // if (result.data.length > 0) {
        //   setDatesOptions([{ text: '-Seleccionar', value: '' }, ...result.data.filter((el) => {
        //     const today = new Date();
        //     const momentDate = moment(el.date, 'YYYY-MM-DD');
        //     const date = momentDate.toDate();
        //     return date.getTime() <= today.getTime();
        //   }).map((item) => ({ text: `${item.date} - ${item.schedule}`, value: `${item.date}` }))]);
        //   // setDatesOptions(result.data.map((item) => ({ text: `${item.date} - ${item.schedule}`, value: `${item.date} - ${item.schedule}` })).sort());
        // }
      })
      .catch(() => null);
  };

  useEffect(() => {
    const inputsAutoHeight = document.getElementsByClassName('input-auto-heigth');
    autosize(inputsAutoHeight);
    getDataMonitoringItems();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (llegoACita === 'si') {
      monitoringForm.current.dispatchEvent(new Event('submit'));
    }
  }, [llegoACita]);

  const filesSelected = (input, fileNumber) => {
    const label = input.nextElementSibling;
    let labelVal = '';
    if (fileNumber === 0) {
      labelVal = 'Subir archivos';
      label.querySelector('span').innerHTML = labelVal;
      label.querySelector('span').style.backgroundColor = 'var(--blue-one)';
      return;
    }
    if (fileNumber > 1) labelVal = `${fileNumber} archivos`;
    else labelVal = '1 archivo';
    label.querySelector('span').innerHTML = labelVal;
    label.querySelector('span').style.backgroundColor = 'var(--green)';
  };

  const resetInputFiles = () => {
    [
      ...document.getElementsByClassName(
        `input-file-reset-${idPatientRegister}`,
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

  const catchData = (data) => {
    if (tipoDeSeguimiento === 'control') {
      data.onlyControl = true;
    }
    setBtnSubmitDisabled(true);
    setAlert({
      status: true,
      text: 'Cargando ... No cancele el proceso',
      color: 'blue-two',
    });
    let arrived;
    if (llegoACita === 'si') {
      arrived = 'Llegó a la cita';
    } else if (llegoACita === 'no') {
      arrived = 'No llegó a la cita';
    }
    const selectedDate = datesData.find((date) => {
      return date.date === watch('date');
    });
    (new Promise((resolve, reject) => {
      if (!selectedDate) {
        resolve();
      }
      updateDateById(selectedDate?.id, {
        arrivedState: arrived,
        reasonNotArrived: llegoACita === 'si' ? null : motivoFalta,
      })
        .then(resolve)
        .catch(reject);
    }))
      .then(() => {
        return uploadMultipleFiles(docFiles, 'documents', setProgressDocuments);
      })
      .then((fileList) => {
        data.documentFiles = fileList;
        setDocFiles([]);
        return uploadMultipleFiles(videoFiles, 'videos', setProgressVideos);
      })
      .then((fileList) => {
        data.videoFiles = fileList;
        setVideoFiles([]);
        return uploadMultipleFiles(imageFiles, 'images', setProgressImages);
      })
      .then((fileList) => {
        data.imageFiles = fileList;
        setImageFiles([]);
        return pushMonitoringPatientValorationById(idPatientRegister, {
          ...data,
          // doctorIdAssigned: userData.id,
          createdAt: moment().format('DD-MM-YYYY hh:mm:ss'),
        });
      })
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        reset(NeuroMonitoringType);
        setTimeout(
          () => setAlert({ status: false, text: '', color: '' }),
          4000,
        );
        setLlegoACita('');
        setBtnSubmitDisabled(false);
        getDataMonitoringItems();
        resetInputFiles();
        setTipoDeSeguimiento('');
        // toggleConfirmarCita();
      })
      .catch((error) => {
        setLlegoACita('');
        setBtnSubmitDisabled(false);
        setAlert({ status: true, text: error.message || error, color: 'red' });
      });
  };

  const getColorDoctorReference = (key) => {
    const currentObject = watch(`doctorReferences.${key}`);
    return currentObject.diagnosis
      || currentObject.treatment
      || currentObject.suggestions
      || currentObject.notes
      ? 'var(--green)'
      : 'var(--blue-one)';
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

  const getGestationWeeks = async () => {
    const nestedObjectValue = getValues({ nest: true });
    // eslint-disable-next-line
    let { date, sg } = nestedObjectValue;
    if (!sg) {
      sg = patientData?.sg;
    }
    if (date && sg && patientData) {
      const { birthDate } = patientData;
      const birthDateConverted = moment(birthDate, 'YYYY-MM-DD');
      const consultDateConverted = moment(date, 'YYYY-MM-DD');
      if (birthDateConverted.isAfter(consultDateConverted)) {
        const valuesToSet = [
          { name: 'eCron', value: '' },
          { name: 'eco', value: '' },
          { name: 'dn', value: '' },
          { name: 'leftTime', value: '' },
          { name: 'ecoWeeks', value: '' },
          { name: 'bornDays', value: '' },
        ];
        valuesToSet.forEach(({ name, value }) => setValue(name, value));
        return;
      }
      const results = await getCorrectedWeeksOfGestation(
        birthDate,
        consultDateConverted,
        sg,
      );
      if (parseInt(sg) >= 40) {
        const valuesToSet = [
          {
            name: 'eCron',
            value: `${results.chronoAge.years} a, ${results.chronoAge.months} m, ${results.chronoAge.days} d`,
          },
          { name: 'eco', value: 'No aplica' },
          { name: 'dn', value: results.bornDays },
          { name: 'leftTime', value: '' },
          { name: 'ecoWeeks', value: '' },
          { name: 'bornDays', value: '' },
        ];
        valuesToSet.forEach(({ name, value }) => setValue(name, value));
        return;
      }
      if (results.chronoAge.years >= 2) {
        const valuesToSet = [
          {
            name: 'eCron',
            value: `${results.chronoAge.years} a, ${results.chronoAge.months} m, ${results.chronoAge.days} d`,
          },
          { name: 'eco', value: 'Mayor a 2 años' },
          { name: 'dn', value: results.bornDays },
          {
            name: 'leftTime',
            value: `${results.leftTime.months} m, ${results.leftTime.days} d`,
          },
          { name: 'ecoWeeks', value: '' },
          { name: 'bornDays', value: results.bornDays || '' },
        ];
        valuesToSet.forEach(({ name, value }) => setValue(name, value));
        return;
      }
      const correctedAgeWeeksNew = results.correctedAgeInWeeks.weeks;
      const correctedAgeDaysNew = results.correctedAgeInWeeks.days;
      let weeksPrePost = correctedAgeWeeksNew > 40
        ? `${correctedAgeWeeksNew - 40} s post`
        : correctedAgeWeeksNew === 40
          ? correctedAgeDaysNew > 0
            ? `${correctedAgeWeeksNew - 40} s post`
            : `${correctedAgeWeeksNew} s pret`
          : `${correctedAgeWeeksNew} s pret`;
      // const correctedAgeInWeeksNew = results.correctedAgeInWeeks.weeks;
      // let weeksPrePost = correctedAgeInWeeksNew <= 40 ? `${correctedAgeInWeeksNew} s pret` : `${correctedAgeInWeeksNew - 40} s post`;
      if (!results?.notApply && results?.bornDays >= 1) {
        weeksPrePost = correctedAgeWeeksNew <= 40
          ? `${correctedAgeWeeksNew} s post`
          : `${correctedAgeWeeksNew - 40} s post`;
      }
      const valuesToSet = [
        {
          name: 'eCron',
          value: `${results.chronoAge.years} a, ${results.chronoAge.months} m, ${results.chronoAge.days} d`,
        },
        {
          name: 'eco',
          value: results.notApply
            ? 'Aún no nace'
            : `${results.correctedAge.years} a, ${results.correctedAge.months} m, ${results.correctedAge.days} d`,
        },
        { name: 'dn', value: results.bornDays },
        {
          name: 'leftTime',
          value: `${results.leftTime.months} m, ${results.leftTime.days} d`,
        },
        { name: 'ecoWeeks', value: weeksPrePost },
        // { name: 'ecoWeeks', value: `${results.correctedAgeInWeeks.weeks} s, ${results.correctedAgeInWeeks.days} d` },
        { name: 'bornDays', value: results.bornDays },
      ];
      valuesToSet.forEach(({ name, value }) => setValue(name, value));
      if (!results?.notApply) {
        setValue('movementType', getMovementType(results.correctedAgeInWeeks));
      }
    } else {
      const valuesToSet = [
        { name: 'eCron', value: '' },
        { name: 'eco', value: '' },
        { name: 'dn', value: '' },
        { name: 'leftTime', value: '' },
        { name: 'ecoWeeks', value: '' },
        { name: 'bornDays', value: '' },
      ];
      valuesToSet.forEach(({ name, value }) => setValue(name, value));
    }
  };

  const oppositeIsFilled = (opposite) => {
    if (opposite === 'plagiocephaly') {
      return watch('plagiocephalyIndexA') && watch('plagiocephalyIndexB');
    } if (opposite === 'brachyphaly') {
      return watch('brachyphalySd') && watch('brachyphalyAp');
    }
    return false;
  };

  useEffect(() => {
    getGestationWeeks();
    // eslint-disable-next-line
  }, [patientData]);

  useEffect(() => {
    setValue('sg', patientData?.sg);
    getGestationWeeks();
    const inputsAutoHeight = document.getElementsByClassName('input-auto-heigth');
    autosize(inputsAutoHeight);
  // eslint-disable-next-line
  }, [tipoDeSeguimiento]);

  return (
    <div className="form-neuro-monitoring form">
      <Row className="row row-neuro-monitoring">
        <Col xs="12" className="col">
          {/* <hr className="divider" /> */}
          <p className="title">Historial</p>
          {monitoringItems.length === 0 && (
            <Row>
              <Col xs="12">
                <p className="title-monitoring-content-not-found">
                  Aún no ha agregado ningún seguimiento
                </p>
              </Col>
            </Row>
          )}
          {monitoringItems.length > 0
            && monitoringItems.map((item, index) => (
              <Row key={item.idRegister}>
                <Col>
                  <NeuroMonitoringItem
                    item={item}
                    index={index}
                    idPatientRegister={idPatientRegister}
                    getDataMonitoringItems={getDataMonitoringItems}
                    typeForm="edit"
                  />
                </Col>
              </Row>
            ))}
        </Col>
      </Row>
      {monitoringItems.length > 0
      && tipoDeSeguimiento === ''
      && (
      <div>

        <Row className="row row-neuro-monitoring">
          <Col xs="12" className="col">
            <p className="title">Seguimiento de neurodesarrollo</p>
          </Col>
        </Row>
        <Col xs="12">
          <p className="subtitle">¿Qué tipo de seguimiento desea crear?</p>
        </Col>
        <Col xs="12">
          <Row className="row-btn">
            <Col xs="6" className="confirmar-btn col-btn">
              <Button
                type="button"
                onClick={() => {
                  setTipoDeSeguimiento('revaloracion');
                }}
                className={`btn-custom ${llegoACita === 'si' ? 'btn-green' : ''}`}
                color=""
                disabled={btnSubmitDisabled}
              >
                Revaloración
              </Button>
            </Col>
            <Col xs="6" className="confirmar-btn col-btn">
              <Button
                type="button"
                onClick={() => {
                  setTipoDeSeguimiento('control');
                }}
                className={`btn-custom ${llegoACita === 'no' ? 'btn-red' : ''}`}
                color=""
                disabled={btnSubmitDisabled}
              >
                Seguimiento Control
              </Button>
            </Col>
          </Row>
        </Col>
      </div>
      )}
      {
        (tipoDeSeguimiento === 'control'
        || tipoDeSeguimiento === 'revaloracion'
        || monitoringItems.length === 0)
        && (
        <form onSubmit={handleSubmit(catchData)} ref={monitoringForm} className="neuro-monitoring-form">
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
          {isLoading ? (
            'Por favor, espere.'
          ) : (
            < >
              <i
                className="fas fa-chevron-left ico-backward"
                onClick={returnToMenu}
                onKeyDown={returnToMenu}
              />
              <Row className="row row-neuro-monitoring">
                <Col xs="12" className="col">
                  <p className="title">Seguimiento de neurodesarrollo</p>
                </Col>
                <Col xs="12" className="col">
                  {progressDocuments > 0 && progressDocuments < 100 && (
                    <>
                      <Label>Subiendo Documentos...</Label>
                      <Progress value={progressDocuments} />
                    </>
                  )}
                  {progressVideos > 0 && progressVideos < 100 && (
                    <>
                      <Label>Subiendo Videos...</Label>
                      <Progress value={progressVideos} />
                    </>
                  )}
                  {progressImages > 0 && progressImages < 100 && (
                    <>
                      <Label>Subiendo imágenes...</Label>
                      <Progress value={progressImages} />
                    </>
                  )}
                </Col>
                <Col xs="12">
                  <Row>
                    <Col xs="6" md="3" lg="2" className="col">
                      <FormGroupPatient
                        name="date"
                        inputSize="12"
                        label="Fecha"
                        labelSize="12"
                        onChange={getGestationWeeks}
                        pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                        register={register}
                        errors={errors?.date}
                        required
                        type="date"
                        // options={datesOptions}
                      />
                    </Col>
                    {
                      tipoDeSeguimiento !== 'control' && (
                        < >
                          <Col xs="6" md="3" lg="1" className="col">
                            <FormGroupPatient
                              name="sg"
                              inputSize="12"
                              label="SG"
                              labelClassname="subtitle"
                              labelSize="12"
                              onChange={getGestationWeeks}
                              placeHolder="SG"
                              register={register}
                              errors={errors?.sg}
                              required
                              type="number"
                            />
                          </Col>
                          <Col xs="6" md="3" lg="2" className="col">
                            <FormGroupPatient
                              name="dn"
                              label="Días de nacido"
                              inputSize="12"
                              labelClassname="subtitle"
                              labelSize="12"
                              placeHolder="Días de nacido"
                              register={register}
                              errors={errors?.dn}
                              required={false}
                              readOnly
                              type="text"
                            />
                          </Col>
                          <Col xs="6" md="3" lg="2" className="col">
                            <FormGroupPatient
                              name="leftTime"
                              label="Tiempo faltante"
                              inputSize="12"
                              labelClassname="subtitle"
                              labelSize="12"
                              placeHolder="Tiempo faltante"
                              register={register}
                              errors={errors?.leftTime}
                              required={false}
                              readOnly
                              type="text"
                            />
                          </Col>
                          <Col xs="6" md="3" lg="2" className="col">
                            <FormGroupPatient
                              name="eCron"
                              label="E.Cron."
                              inputSize="12"
                              labelClassname="subtitle"
                              labelSize="12"
                              placeHolder="Edad cronológica"
                              register={register}
                              errors={errors?.eCron}
                              required={false}
                              readOnly
                              type="text"
                            />
                          </Col>
                          <Col xs="6" md="3" lg="1" className="col">
                            <FormGroupPatient
                              name="eco"
                              label="Eco."
                              inputSize="12"
                              labelClassname="subtitle"
                              labelSize="12"
                              placeHolder="Edad corregida"
                              register={register}
                              errors={errors?.eco}
                              required={false}
                              readOnly
                              type="text"
                            />
                          </Col>
                        </>
                      )
                    }
                    <Col xs="6" md="3" lg="2" className="col">
                      <FormGroupPatient
                        name="ecoWeeks"
                        label="ECo. semanas"
                        inputSize="12"
                        labelClassname="subtitle"
                        labelSize="12"
                        placeHolder="Eco. en semanas"
                        register={register}
                        errors={errors?.ecoWeeks}
                        required={false}
                        readOnly
                        type="text"
                      />
                    </Col>
                    <Col xs="6" lg="2" className="col">
                      <FormGroupPatient
                        name="movementType"
                        label="GMs esperado"
                        inputClassname="input-movement-type"
                        placeHolder=""
                        type="text"
                        inputSize="12"
                        labelSize="12"
                        required={false}
                        register={register}
                        errors={errors?.movementType}
                        labelClassname="subtitle"
                        readOnly
                      />
                    </Col>
                    {
                      tipoDeSeguimiento !== 'control' && (
                        <>
                          <Col xs="6" md="3" lg="2" className="col">
                            <FormGroupPatient
                              name="result"
                              label="Resultado"
                              placeHolder="PR"
                              type="text"
                              labelClassname="subtitle"
                              inputSize="12"
                              labelSize="12"
                              register={register}
                              errors={errors?.result}
                              required={false}
                            />
                          </Col>
                          <Col xs="6" md="3" lg="2" className="col">
                            <FormGroupPatient
                              name="score"
                              label="Puntuación"
                              placeHolder="(PTS)"
                              type="text"
                              labelClassname="subtitle"
                              inputSize="12"
                              labelSize="12"
                              register={register}
                              errors={errors?.score}
                              required={false}
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
                              options={riskLevelOptions}
                              register={register}
                              errors={errors?.riskLevel}
                              required={false}
                            />
                          </Col>
                        </>
                      )
                    }
                    <Col>
                      <Row className="row-media-files">
                        <Col xs="12" className="text-left ml-2">Subir archivos</Col>
                        <Col xs="4" className="col">
                          <InputFormGroup
                            // label="Videos"
                            name="neuro-monitoring-form-input-videos"
                            type="file"
                            accept="video/mp4, video/avi, video/mpeg, video/quicktime"
                            multiple
                            iconFile="video"
                            columnSize={12}
                            labelClassname="subtitle"
                            inputClassname={`input-file-reset-${idPatientRegister}`}
                            required={false}
                            onChange={onVideoFileChange}
                          />
                        </Col>
                        <Col xs="4" className="col">
                          <InputFormGroup
                            // label="Imágenes"
                            name="neuro-monitoring-form-input-images"
                            type="file"
                            accept="image/gif, image/jpeg, image/png, image/jpg"
                            multiple
                            iconFile="image"
                            columnSize={12}
                            labelClassname="subtitle"
                            inputClassname={`input-file-reset-${idPatientRegister}`}
                            required={false}
                            onChange={onImageFileChange}
                          />
                        </Col>
                        <Col xs="4" className="col">
                          <InputFormGroup
                            // label="Documentos"
                            name="neuro-monitoring-form-input-documents"
                            type="file"
                            accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint"
                            multiple
                            iconFile="file"
                            columnSize={12}
                            labelClassname="subtitle"
                            inputClassname={`input-file-reset-${idPatientRegister}`}
                            required={false}
                            onChange={onDocFileChange}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col
                      xs={`${tipoDeSeguimiento === 'control' ? 12 : 6}`}
                      lg={`${tipoDeSeguimiento === 'control' ? 12 : 3}`}
                      className="col"
                    >
                      <FormGroupPatient
                        name="control"
                        label="Control"
                        placeHolder="Alcances motores"
                        type="textarea"
                        inputSize="12"
                        labelSize="12"
                        required={false}
                        rows="2"
                        register={register}
                        errors={errors?.control}
                        labelClassname="subtitle"
                        inputClassname="input-auto-heigth"
                        bulletPoint
                      />
                    </Col>
                    {
                    tipoDeSeguimiento !== 'control' && (
                      <>
                        <Col xs="6" lg="3" className="col">
                          <FormGroupPatient
                            name="description"
                            label="Descripción"
                            required={false}
                            inputSize="12"
                            labelSize="12"
                            labelClassname="subtitle"
                            inputClassname="input-auto-heigth"
                            placeHolder="Administra neuro Leviracetam"
                            type="textarea"
                            rows="2"
                            register={register}
                            errors={errors?.description}
                            bulletPoint
                          />
                        </Col>
                        <Col xs="6" lg="3" className="col">
                          <FormGroupPatient
                            name="exploration"
                            label="Exploración"
                            required={false}
                            inputSize="12"
                            labelSize="12"
                            labelClassname="subtitle"
                            inputClassname="input-auto-heigth"
                            placeHolder="Exploración"
                            type="textarea"
                            rows="2"
                            register={register}
                            errors={errors?.exploration}
                            bulletPoint
                          />
                        </Col>
                        <Col xs="6" lg="3" className="col">
                          <FormGroupPatient
                            name="cxObjetives"
                            label="Objetivos TX"
                            inputClassname="input-auto-heigth"
                            required={false}
                            inputSize="12"
                            labelSize="12"
                            labelClassname="subtitle"
                            placeHolder="Objetivos TX"
                            type="textarea"
                            rows="2"
                            register={register}
                            errors={errors?.cxObjetives}
                            bulletPoint
                          />
                        </Col>
                        <Col xs="6" lg="4" className="col">
                          {/* <FormGroupPatient
                            name="reassessment"
                            label="Revaloración"
                            inputClassname="input-auto-heigth"
                            required={false}
                            inputSize="12"
                            labelSize="12"
                            labelClassname="subtitle"
                            placeHolder="Revaloración"
                            type="textarea"
                            rows="2"
                            register={register}
                            errors={errors?.reassessment}
                            bulletPoint
                          /> */}
                          <FormGroupPatient
                            name="reassessment"
                            label="Revaloración"
                            placeHolder="Normal"
                            type="select"
                            inputSize="12"
                            labelSize="12"
                            options={frecuencyOptions}
                            register={register}
                            errors={errors?.riskLevel}
                            required={false}
                          />
                          {/* <FormGroupPatient
                            name="reassessment"
                            type="select"
                            inputSearch
                            control={control}
                            errors={errors?.frecuency}
                            labelSizeSm={12}
                            inputSizeSm={12}
                            labelSize={12}
                            inputSize={12}
                            placeHolder="Seleccionar frecuencia"
                            search={false}
                            options={frecuencyOptions}
                            // labelClassname="small-text"
                          /> */}
                        </Col>
                        <Col xs="6" lg="6" className="col">
                          <FormGroupPatient
                            name="doctorsList"
                            label="Terapeutas responsables"
                            placeHolder="Agregar doctores"
                            type="textarea"
                            inputSize="12"
                            labelSize="12"
                            // required={false}
                            rows="2"
                            register={register}
                            errors={errors?.doctorsList}
                            labelClassname="subtitle"
                            inputClassname="input-auto-heigth"
                            bulletPoint
                          />
                        </Col>
                      </>
                    )
                  }
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
                      <Col xs="6" md="3" lg="4" xxl="2" className="col col-xxl-2">
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
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs="6" lg="2" className="col col-xxl-3">
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
                                register={register}
                                errors={errors?.size}
                                required={false}
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
                          inputClassname="input-auto-heigth"
                          placeHolder="Ingresa el diagnóstico"
                          type="textarea"
                          rows="2"
                          register={register}
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
                          inputClassname="input-auto-heigth"
                          placeHolder="Ingresa el tratamiento"
                          type="textarea"
                          rows="2"
                          register={register}
                          bulletPoint
                        />
                      </Col>
                      {

                    }
                      <Col xs="6" md="3" className="col">
                        <FormGroupPatient
                          name={`doctorReferences.${key}.suggestions`}
                          label="Sugerencias"
                          required={false}
                          inputSize="12"
                          labelSize="12"
                          inputClassname="input-auto-heigth"
                          placeHolder="Ingresa las sugerencias"
                          type="textarea"
                          rows="2"
                          register={register}
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
                          inputClassname="input-auto-heigth"
                          placeHolder="Ingresa las notas"
                          type="textarea"
                          rows="2"
                          register={register}
                          bulletPoint
                        />
                      </Col>
                    </Row>
                  ))}
                </Col>
                <Col xs="12" md="6" className="col-btn">
                  <Button
                    type="button"
                    onClick={() => {
                      const selectedDate = datesData.find((date) => {
                        return date.date === watch('date');
                      });
                      if (watch('date') === '' || !selectedDate) {
                        monitoringForm.current.dispatchEvent(new Event('submit'));
                      } else {
                        toggleModal();
                      }
                    }}
                    className="btn-custom"
                    color=""
                    disabled={btnSubmitDisabled}
                  >
                    Agregar seguimiento
                  </Button>
                </Col>
                <Col xs="12" md="6" className="col-btn align-end">
                  <Button
                    type="button"
                    color=""
                    className="btn-custom btn-agendar-cita"
                  >
                    <Link
                      to={`/citas/${idPatientRegister}`}
                      target="_blank"
                      type="button"
                    >
                      Agendar cita
                    </Link>
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </form>
        )
}
      {/* <AgendarCitaModal show={modalCitaIsOpen} close={toggleModalCita} /> */}
      <CustomModal
        show={modalIsOpen}
        close={toggleModal}
        title=""
      >
        <Row className="row row-neuro-monitoring">
          <Col xs="12" className="col">
            <p className="title">Seguimiento de neurodesarrollo</p>
          </Col>
          <Col xs="12">
            <p className="subtitle">{`¿El paciente ${patientData?.name} llegó a la cita del ${watch('date')}?`}</p>
          </Col>
          <Col xs="12">
            <Row className="row-btn">
              <Col xs="6" className="confirmar-btn col-btn">
                <Button
                  type="button"
                  onClick={() => {
                    if (llegoACita === 'no') {
                      toggleShowMotivo();
                    }
                    confirmarLlegada('si');
                    toggleModal();
                    // monitoringForm.current.dispatchEvent(new Event('submit'));
                  }}
                  className={`btn-custom ${llegoACita === 'si' ? 'btn-green' : ''}`}
                  color=""
                  disabled={btnSubmitDisabled}
                >
                  Confirmar cita
                </Button>
              </Col>
              <Col xs="6" className="confirmar-btn col-btn">
                <Button
                  type="button"
                  onClick={() => {
                    if (llegoACita !== 'no') {
                      toggleShowMotivo();
                    }
                    confirmarLlegada('no');
                  }}
                  className={`btn-custom ${llegoACita === 'no' ? 'btn-red' : ''}`}
                  color=""
                  disabled={btnSubmitDisabled}
                >
                  No llegó a la cita
                </Button>
              </Col>
            </Row>
            <Row>
              {
                showMotivo && (
                  <>
                    <Col xs="12">
                      <Label for="motivo-input">Motivo por el cual no se llevó a cabo la cita:</Label>
                      <Input
                        id="motivo-input"
                        type="text"
                        required={false}
                        onChange={changeMotivoFalta}
                      />
                    </Col>
                    <Col xs="12" className="confirmar-btn col-btn">
                      <Button
                        type="button"
                        className="btn-custom"
                        color=""
                        disabled={llegoACita === ''}
                        onClick={() => {
                          toggleModal();
                          monitoringForm.current.dispatchEvent(new Event('submit'));
                        }}
                      >
                        Guardar
                      </Button>
                    </Col>
                  </>
                )
                }
            </Row>
          </Col>
        </Row>
      </CustomModal>
    </div>
  );
};


NeuroMonitoringForm.propTypes = {
  idPatientRegister: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  setIsLoading: PropTypes.func.isRequired,
};

export default NeuroMonitoringForm;
