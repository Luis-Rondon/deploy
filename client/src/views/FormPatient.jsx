/* eslint-disable max-len */
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Media, Label, Button,
} from 'reactstrap';
import confirm from 'reactstrap-confirm';
import { useForm, useFieldArray } from 'react-hook-form';
import moment from 'moment';
import autosize from 'autosize';
import { Link } from 'react-router-dom';
import UserData from '../context/UserData';
import authHOC from '../utils/authHOC';
import {
  getCorrectedWeeksOfGestation,
  getEcoWeeksPrePost,
} from '../utils/formulas';
import { patientModel } from '../models/PatientType';
import {
  getPatientValorationById,
  createPatientValoration,
  updatePatientValorationById,
  uploadProfilePic,
  deleteProfilePicByName,
} from '../actions/PatientAction';
import { getAllUsersOptionsSearch } from '../actions/UserAction';
import { sendNotificationNewPatient } from '../firebase/oneSignal';
import Menu from '../common/Menu';
import Navbar from '../common/Navbar';
import CustomAlert from '../common/CustomAlert';
import InputFormGroup from '../common/InputFormGroup';
import LoadingSpinner from '../common/LoadingSpinner';
import FormGroupPatient from '../components/FormGroupPatient';
import FieldArrayStaysLonger from '../components/FieldArrayStaysLonger';
// import FieldArrayIndicators from '../components/FieldArrayIndicators';
// import FieldArrayPhysicalResponses from '../components/FieldArrayPhysicalResponses';
import NeuroMonitoringForm from '../components/NeuroMonitoringForm';
import '../styles/formPatient.scss';
import ConductTable from '../components/ConductTable';

// const screenWidth = window.screen.width || 575;

const FormPatient = ({ history, match }) => {
  const { userData } = useContext(UserData);

  const [typeActionForm, setTypeActionForm] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [btnSubmitDisabled, setBtnSubmitDisabled] = useState(false);
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [profilePicUpload, setProfilePicUpload] = useState();
  const [patientDataComplete, setPatientDataComplete] = useState();
  const [idRegisterCreated, setIdRegisterCreated] = useState(null);
  const [correctedAge, setCorrectedAge] = useState({
    age: null,
    type: '',
    sg: null,
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    errors,
    control,
    watch,
  } = useForm({ defaultValues: patientModel });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'background.backgroundTypes',
  });
  const watchBackgroundType = watch('background.backgroundTypes');
  const watchReferedBy = watch('references.referredBy');
  const watchSexo = watch('general.sex');
  const watchSilverman = watch('general.silverman');
  const watchapgar = watch('general.apgar');
  const autoGrowInput = (e) => {
    autosize(e.target);
  };

  useEffect(() => {
    const { id, action } = match.params;
    if (action === 'crear') {
      if (userData.role !== 'Administrador') history.push('/pacientes');
      Object.keys(patientModel).forEach((key) => setValue(key, patientModel[key]));
      setTypeActionForm(action);
      setIsLoading(false);
    } else if (action === 'editar') {
      getPatientValorationById(id)
        .then((result) => {
          setIdRegisterCreated(result?.data?.id);
          const { age, type } = getEcoWeeksPrePost(
            result?.data?.general?.ecoWeeks,
          );
          setCorrectedAge({
            age,
            type,
            sg: Number(result?.data?.general?.sg || 0),
          });
          setPatientDataComplete(result.data);
          Object.keys(result.data).forEach((key) => setValue(key, result.data[key]));
          if (result.data.background.backgroundTypes) {
            // eslint-disable-next-line max-len
            result.data.background.backgroundTypes.map((item) => append({ text: item.text, type: item.type }));
            setValue(
              'background.backgroundTypes',
              result.data.background.backgroundTypes,
            );
          }
          const valuesToSet = [
            {
              name: 'background.staysLonger',
              value: result.data.background.staysLonger,
            },
            {
              name: 'otherVariables.indicators',
              value: result.data.otherVariables.indicators,
            },
            {
              name: 'otherVariables.physicalResponses',
              value: result.data.otherVariables.physicalResponses,
            },
          ];
          valuesToSet.forEach(({ name, value }) => setValue(name, value));
          setTypeActionForm(action);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          history.push('/pacientes');
        });
    } else {
      history.push('/pacientes');
    }
    // eslint-disable-next-line
  }, [match]);

  useEffect(() => {
    if (Object.entries(errors).length !== 0) {
      setAlert({
        status: true,
        text: 'Hay algunos campos que faltan rellenar',
        color: 'red',
      });
      setTimeout(() => setAlert({ ...alert, status: false }), 3500);
    }
    // eslint-disable-next-line
  }, [errors]);

  useEffect(() => {
    window.onbeforeunload = () => {
      return 'Los cambios no guardados se perderán';
    };
    const inputsAutoHeight = document.getElementsByClassName('input-auto-heigth');
    autosize(inputsAutoHeight);
  }, []);

  useEffect(() => {
    if (patientDataComplete && typeActionForm === 'editar') {
      getAllUsersOptionsSearch()
        .then((data) => {
          const doctorName = data.find(
            (user) => user.value === patientDataComplete?.doctorIdAssigned,
          );
          setValue(
            'doctorIdAssignedName',
            doctorName ? doctorName.name : '- No registrado -',
          );
        })
        .catch((error) => {
          setAlert({ status: true, message: error.message, color: 'red' });
        });
    }
    // eslint-disable-next-line
  }, [
    setPatientDataComplete,
    patientDataComplete,
    setTypeActionForm,
    typeActionForm,
  ]);

  const getGestationWeeks = async () => {
    const nestedObjectValue = getValues({ nest: true });
    const { birthDate, consultDate, sg } = nestedObjectValue.general;
    if (birthDate && consultDate && sg) {
      const birthDateConverted = moment(birthDate, 'YYYY-MM-DD');
      const consultDateConverted = moment(consultDate, 'YYYY-MM-DD');
      if (birthDateConverted > consultDateConverted) {
        setAlert({
          status: true,
          text: 'La fecha de nacimiento no puede ser mayor a la fecha actual',
          color: 'red',
        });
        const valuesToSet = [
          { name: 'general.eCron', value: '' },
          { name: 'general.eco', value: '' },
          { name: 'general.dn', value: '' },
          { name: 'general.ecoWeeks', value: '' },
        ];
        valuesToSet.forEach(({ name, value }) => setValue(name, value));
        return;
      }
      const results = await getCorrectedWeeksOfGestation(
        birthDate,
        consultDate,
        sg,
      );
      if (parseInt(sg) >= 40) {
        setAlert({
          status: true,
          text: 'Esta formula aplica solo a bebés con menos de 40 semanas de gestación',
          color: 'red',
        });
        const valuesToSet = [
          {
            name: 'general.eCron',
            value: `${results.chronoAge.years} a, ${results.chronoAge.months} m, ${results.chronoAge.days} d`,
          },
          { name: 'general.eco', value: 'No aplica' },
          { name: 'general.dn', value: results.bornDays },
          { name: 'general.ecoWeeks', value: '' },
        ];
        valuesToSet.forEach(({ name, value }) => setValue(name, value));
        setTimeout(() => setAlert({ ...alert, status: false }), 3000);
        return;
      }
      if (results.chronoAge.years >= 2) {
        setAlert({
          status: true,
          text: 'El niño es mayor a 2 años, no se corregirá la edad.',
          color: 'red',
        });
        const valuesToSet = [
          {
            name: 'general.eCron',
            value: `${results.chronoAge.years} a, ${results.chronoAge.months} m, ${results.chronoAge.days} d`,
          },
          { name: 'general.eco', value: 'Mayor a 2 años' },
          { name: 'general.dn', value: results.bornDays },
          {
            name: 'general.leftTime',
            value: `${results.leftTime.months} m, ${results.leftTime.days} d`,
          },
          { name: 'general.ecoWeeks', value: '' },
        ];
        valuesToSet.forEach(({ name, value }) => setValue(name, value));
        setTimeout(() => setAlert({ ...alert, status: false }), 3000);
        return;
      }
      setAlert({ ...alert, status: false });
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
          name: 'general.eCron',
          value: `${results.chronoAge.years} a, ${results.chronoAge.months} m, ${results.chronoAge.days} d`,
        },
        {
          name: 'general.eco',
          value: results.notApply
            ? 'Aún no nace'
            : `${results.correctedAge.years} a, ${results.correctedAge.months} m, ${results.correctedAge.days} d`,
        },
        { name: 'general.dn', value: results.bornDays },
        {
          name: 'general.leftTime',
          value: `${results.leftTime.months} m, ${results.leftTime.days} d`,
        },
        { name: 'general.ecoWeeks', value: weeksPrePost },
        // { name: 'general.ecoWeeks', value: `${results.correctedAgeInWeeks.weeks} s, ${results.correctedAgeInWeeks.days} d` },
      ];
      valuesToSet.forEach(({ name, value }) => setValue(name, value));
    } else {
      const valuesToSet = [
        { name: 'general.eCron', value: '' },
        { name: 'general.eco', value: '' },
        { name: 'general.dn', value: '' },
        { name: 'general.leftTime', value: '' },
        { name: 'general.ecoWeeks', value: '' },
      ];
      valuesToSet.forEach(({ name, value }) => setValue(name, value));
    }
  };

  const filesSelected = (input) => {
    const label = input.nextElementSibling;
    const labelVal = 'Archivo seleccionado';
    label.querySelector('span').innerHTML = labelVal;
    label.querySelector('span').style.color = 'var(--green)';
    label.querySelector('span').style.fontWeight = '700';
  };

  const createPatient = async (data) => {
    let patientId = null;
    if (profilePicUpload) {
      uploadProfilePic(profilePicUpload)
        .then((result) => {
          data.profile_pic_url = result.downloadURL;
          data.profile_pic_name = result.imageName;
          data.createdBy = userData.id;
          return createPatientValoration(data);
        })
        .then((result) => {
          patientId = result.docRef.id;
          history.push(`/pacientes/formato/editar/${patientId}`);
          sendNotificationNewPatient(data?.general?.name);
          setAlert({
            status: true,
            text: 'Registro creado con éxito. Introduzca debajo el primer seguimiento',
            color: 'green',
          });
          const { age, type } = getEcoWeeksPrePost(data?.general?.ecoWeeks);
          setCorrectedAge({
            age,
            type,
            sg: Number(data?.general?.sg || 0),
          });
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    } else {
      data.profile_pic_url = '';
      data.profile_pic_name = '';
      data.createdBy = userData.id;
      createPatientValoration(data)
        .then((result) => {
          patientId = result.docRef.id;
          history.push(`/pacientes/formato/editar/${patientId}`);
          sendNotificationNewPatient(data?.general?.name);
          setAlert({
            status: true,
            text: 'Registro creado con éxito. Introduzca debajo el primer seguimiento',
            color: 'green',
          });
          const { age, type } = getEcoWeeksPrePost(data?.general?.ecoWeeks);
          setCorrectedAge({
            age,
            type,
            sg: Number(data?.general?.sg || 0),
          });
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 4000);
  };

  const updatePatient = async (data) => {
    if (profilePicUpload) {
      await uploadProfilePic(profilePicUpload)
        .then((result) => {
          data.profile_pic_url = result.downloadURL;
          data.profile_pic_name = result.imageName;
          return updatePatientValorationById(patientDataComplete.id, data);
        })
        .then((result) => {
          setAlert({ status: true, text: result.message, color: 'green' });
          setIdRegisterCreated(patientDataComplete.id);
          return deleteProfilePicByName(patientDataComplete.profile_pic_name);
        })
        .then(() => null)
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    } else {
      await updatePatientValorationById(patientDataComplete.id, data)
        .then((result) => {
          setIdRegisterCreated(patientDataComplete.id);
          const { age, type } = getEcoWeeksPrePost(data?.general?.ecoWeeks);
          setCorrectedAge({
            age,
            type,
            sg: Number(data?.general?.sg || 0),
          });
          setAlert({ status: true, text: result.message, color: 'green' });
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 4000);
    setBtnSubmitDisabled(false);
  };

  const onSubmit = (data) => {
    setBtnSubmitDisabled(true);
    setAlert({ status: true, text: 'Cargando ...', color: 'blue-two' });
    const { action } = match.params;
    delete data.doctorIdAssignedName;
    if (
      !correctedAge?.age
      || (correctedAge?.age > 5 && correctedAge?.age < 9)
      || correctedAge?.age > 20
    ) {
      data.indicatorCheckForm = '';
      data.indicatorCheckFormId = '';
      data.scoreEvaluationForm = '';
    }
    if (typeActionForm === 'crear') {
      createPatient({
        ...data,
        doctorIdAssigned: userData.id,
        createdAt: moment().format('DD-MM-YYYY hh:mm:ss'),
        useNewForm: true,
      });
    } else if (action === 'editar' || typeActionForm === 'editar') {
      updatePatient(data);
    }
  };

  const updateProfilePic = async () => {
    setBtnSubmitDisabled(true);
    setAlert({ status: true, text: 'Cargando ...', color: 'blue-two' });
    await uploadProfilePic(profilePicUpload)
      .then((result) => {
        const data = {
          profile_pic_url: result.downloadURL,
          profile_pic_name: result.imageName,
        };
        return updatePatientValorationById(patientDataComplete?.id, data);
      })
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        setIdRegisterCreated(patientDataComplete?.id);
        return deleteProfilePicByName(patientDataComplete?.profile_pic_name);
      })
      .then(() => null)
      .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 4000);
    setBtnSubmitDisabled(false);
  };

  const addBackgroundType = () => {
    append({ text: '', type: 'antecedente normal' });
  };

  const removeBackgroundType = (index) => {
    remove(index);
  };

  const closePage = async () => {
    let result = true;
    if (!idRegisterCreated) {
      result = await confirm({
        title: 'Está por abandonar la página.',
        message: 'Los cambios sin guardar se perderán.',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        confirmColor: 'success',
        cancelColor: 'danger',
      });
    }
    if (result === false) return;
    history.push('/pacientes');
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap" className="patient-content">
        {alert.status ? (
          <CustomAlert text={alert.text} color={alert.color} />
        ) : null}
        {isLoading && <LoadingSpinner size="3" text="Cargando..." />}
        {userData.role === 'Administrador' && (
          <>
            <Label className="title">Formato de valoración del paciente</Label>
            <form className="patient-form">
              <i
                className="ico-close icon-close"
                onClick={closePage}
                onKeyDown={closePage}
              />
              <Row className="row row-general">
                <Col lg="10">
                  <Row>
                    <Col xs="8" lg="12" className="col-title datos-generales">
                      <Label className="subtitle">Datos generales</Label>
                      <Row>

                        <Col xs="12" lg="12" className="col">
                          <FormGroupPatient
                            name="general.name"
                            label="Nombre del paciente"
                            placeHolder="Ingresar nombre"
                            labelSize={window.innerWidth > 1400 ? 2 : window.innerWidth > 500 ? 3 : 12}
                            inputSize={9}
                            inputClassname="text-capitalize"
                            type="text"
                            onChange={autoGrowInput}
                            register={register}
                            errors={errors?.general?.name}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs="12" lg="4">
                      <Row className="row">
                        <Col xs="12" className="col">
                          <Row className="row">
                            <Col xs="12" className="col">
                              <FormGroupPatient
                                name="general.consultDate"
                                label="Fecha de consulta"
                                type="date"
                                placeHolder="yyyy-mm-dd"
                                onChange={getGestationWeeks}
                                minLength={10}
                                maxLength={10}
                                pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                                register={register}
                                errors={errors?.general?.consultDate}
                              />
                              <FormGroupPatient
                                name="general.birthDate"
                                label="Fecha de nacimiento"
                                type="date"
                                placeHolder="yyyy-mm-dd"
                                onChange={getGestationWeeks}
                                minLength={10}
                                maxLength={10}
                                pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                                register={register}
                                errors={errors?.general?.birthDate}
                              />
                            </Col>
                            <Col xs="6" lg="12" className="col">
                              <FormGroupPatient
                                name="general.sg"
                                label="SG"
                                onChange={getGestationWeeks}
                                type="number"
                                min="1"
                                pattern="^[0-9]+"
                                placeHolder="Ingresar SG"
                            // labelSize={screenWidth <= 575 ? 3 : 4}
                            // inputSize={screenWidth <= 575 ? 9 : 8}
                                register={register}
                                errors={errors?.general?.sg}
                              />
                              <FormGroupPatient
                                name="general.pc"
                                label="P. Cefálico"
                                type="text"
                                placeHolder="Ingresar pc"
                        // labelSize={3}
                        // inputSize={9}
                                register={register}
                                errors={errors?.general?.pc}
                              />
                            </Col>
                            <Col xs="6" lg="12" className="col">
                              <FormGroupPatient
                                name="general.size"
                                label="Talla"
                                type="text"
                                placeHolder="Ingresar talla (cm)"
                            // labelSize={screenWidth <= 575 ? 3 : 4}
                            // inputSize={screenWidth <= 575 ? 9 : 8}
                                register={register}
                                errors={errors?.general?.size}
                              />
                              <FormGroupPatient
                                name="general.weight"
                                label="Peso"
                                type="text"
                                placeHolder="Ingresar peso (grs)"
                        // labelSize={screenWidth <= 575 ? 3 : 6}
                        // inputSize={screenWidth <= 575 ? 9 : 6}
                                register={register}
                                errors={errors?.general?.weight}
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                    <Col xs="12" lg="8">
                      <Row className="row">
                        <Col xs="6" lg="6" className="col">
                          <FormGroupPatient
                            name="general.dn"
                            label="Días de Nacido"
                            type="text"
                            placeHolder="Ingresar DN"
                        // labelSize={3}
                        // inputSize={9}
                            readOnly
                            register={register}
                            errors={errors?.general?.dn}
                          />
                          <FormGroupPatient
                            name="general.leftTime"
                            label="Tiempo faltante"
                            type="text"
                            placeHolder="Tiempo faltante"
                        // labelSize={3}
                        // inputSize={9}
                            readOnly
                            register={register}
                            errors={errors?.general?.leftTime}
                          />
                          <FormGroupPatient
                            name="general.eCron"
                            label="E.Cron"
                            type="text"
                            placeHolder="Ingresar E.Cron."
                        // labelSize={3}
                        // inputSize={9}
                            readOnly
                            register={register}
                            errors={errors?.general?.eCron}
                          />
                          <FormGroupPatient
                            name="general.eco"
                            label="ECo"
                            type="text"
                            placeHolder="Ingresar ECo"
                        // labelSize={3}
                        // inputSize={9}
                            readOnly
                            register={register}
                            errors={errors?.general?.eco}
                          />
                          <FormGroupPatient
                            name="general.ecoWeeks"
                            label="ECo semanas"
                            type="text"
                            placeHolder="ECo en semanas"
                        // labelSize={3}
                        // inputSize={9}
                            readOnly
                            required={false}
                            register={register}
                            errors={errors?.general?.ecoWeeks}
                          />
                          <FormGroupPatient
                            name="general.ageApprox"
                            label="Edad aproximada"
                            type="text"
                            placeHolder="Ingresar edad aprox."
                            register={register}
                            required={false}
                            errors={errors?.general?.ageApprox}
                          />
                        </Col>
                        <Col xs="6" lg="6" className="col">
                          <FormGroupPatient
                            name="general.sex"
                            label="Sexo"
                            type="select"
                            placeHolder="-Seleccionar-"
                            labelSize={6}
                            inputSize={5}
                            options={[
                              { value: '', text: '- Seleccionar -' },
                              { value: 'm', text: 'Masculino' },
                              { value: 'f', text: 'Femenino' },
                            ]}
                            inputClassname={
                          watchSexo
                            ? watchSexo === 'm'
                              ? 'background-type-blue'
                              : watchSexo === 'f'
                                ? 'background-type-pink'
                                : 'background-type-normal'
                            : 'background-type-normal'
                        }
                            register={register}
                            errors={errors?.general?.sex}
                          />
                          <FormGroupPatient
                            name="general.temperature"
                            label="Temperatura"
                            type="textarea"
                            placeHolder="Ingresar temperatura"
                            inputClassname="input-auto-heigth"
                            rows={1}
                            labelSize={6}
                            inputSize={5}
                            register={register}
                            errors={errors?.general?.temperature}
                          />
                          <FormGroupPatient
                            name="general.spo2"
                            label="SpO2"
                            type="text"
                            placeHolder="Ingresar SpO2"
                        // inputClassname="input-auto-heigth"
                        // rows={1}
                            labelSize={6}
                            inputSize={5}
                            register={register}
                            errors={errors?.general?.spo2}
                          />
                          <FormGroupPatient
                            name="general.fc"
                            label="FC"
                            type="text"
                            placeHolder="Ingresar FC"
                        // inputClassname="input-auto-heigth"
                        // rows={1}
                            labelSize={6}
                            inputSize={5}
                            register={register}
                            errors={errors?.general?.temperature}
                          />
                          <FormGroupPatient
                            name="general.lastFoodTime"
                            label="Último alimento"
                            type="textarea"
                            placeHolder="Ingresar último alimento"
                            inputClassname="input-auto-heigth"
                            rows={1}
                            labelSize={6}
                            inputSize={5}
                            register={register}
                            errors={errors?.general?.lastFoodTime}
                          />
                          <FormGroupPatient
                            name="general.apgar"
                            label="APGAR"
                            type="text"
                            placeHolder="Ingresar APGAR"
                            inputClassname={
                          watchapgar
                            ? Number(watchapgar) === 8
                              ? 'background-type-blue'
                              : Number(watchapgar) >= 0
                                && Number(watchapgar) <= 7
                                ? 'background-type-red'
                                : ''
                            : ''
                        }
                            labelSize={6}
                            inputSize={5}
                            register={register}
                            errors={errors?.general?.apgar}
                          />
                          <FormGroupPatient
                            name="general.silverman"
                            label="SILVERMAN"
                            type="text"
                            placeHolder="Ingresar SILVERMAN"
                            inputClassname={
                          watchSilverman
                            ? Number(watchSilverman) === 0
                              ? 'background-type-blue'
                              : Number(watchSilverman) >= 0
                                && Number(watchSilverman) <= 3
                                ? 'background-type-red'
                                : ''
                            : ''
                        }
                            labelSize={6}
                            inputSize={5}
                            register={register}
                            required={false}
                            errors={errors?.general?.silverman}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                <Col xs="4" lg="2" className="col profile-pic-container">
                  <Row>
                    <Col xs="12" lg="12">
                      <Media
                        className="profile-pic-custom profile-pic"
                        src={
                          profilePicUpload
                            ? URL.createObjectURL(profilePicUpload)
                            : patientDataComplete ? patientDataComplete?.profile_pic_url
                              : null
                        }
                      />
                    </Col>
                    <Col xs="12" lg="12" className="col profile-pic-input">
                      <InputFormGroup
                        type="file"
                        name="profile-pic-patient"
                        columnSize={12}
                        accept="image/"
                        inputFileSimple
                        required={false}
                        onChange={(e) => {
                          setProfilePicUpload(e.target.files[0]);
                          filesSelected(e.target);
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              <hr className="divider" />

              <Row className="row row-references">
                <Col xs="12" md="4">
                  <FormGroupPatient
                    name="references.reasonForConsultation"
                    label="Motivo de consulta"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    placeHolder="Ingresar motivo"
                    labelSize={12}
                    inputSize={12}
                    labelClassname="subtitle"
                    rows="2"
                    register={register}
                    errors={errors?.references?.reasonForConsultation}
                  />
                </Col>
                <Col xs="12" md="3">
                  <FormGroupPatient
                    name="references.referredBy"
                    inputClassname="background-type-normal"
                    label="Referido por"
                    type="select"
                    labelSize={12}
                    inputSize={12}
                    labelClassname="subtitle"
                    register={register}
                    errors={errors?.references?.reasonForConsultation}
                    options={[
                      { value: '', text: '- Seleccionar -' },
                      { value: 'Facebook', text: 'Facebook' },
                      { value: 'Instagram', text: 'Instagram' },
                      { value: 'Familiar', text: 'Familiar' },
                      { value: 'Paciente', text: 'Paciente' },
                      { value: 'Otro', text: 'Otro' },
                    ]}
                  />
                </Col>
                <Col
                  xs="12"
                  md="5"
                  style={{
                    display: watchReferedBy === 'Otro' ? 'block' : 'none',
                  }}
                >
                  <FormGroupPatient
                    name="references.referredByOther"
                    label={`Otra referencia${
                      watchReferedBy === 'Otro' ? '' : ''
                    }`}
                    type="text"
                    placeHolder="Ingresar referencia"
                    labelSize={12}
                    inputSize={12}
                    maxLength={78}
                    labelClassname="subtitle"
                    required={watchReferedBy === 'Otro'}
                    register={register}
                    errors={errors?.references?.referredByOther}
                  />
                </Col>
              </Row>

              <hr className="divider" />

              <Row className="row row-contact-nformation">
                <Col xs="12" className="col-title">
                  <Label className="subtitle">Información de contacto</Label>
                </Col>
                <Col xs="12" lg="10" className="">
                  <FormGroupPatient
                    name="contactInformation.address"
                    label="Domicilio"
                    type="text"
                    placeHolder="Ingresar domicilio"
                    labelSize={2}
                    inputSize={10}
                    register={register}
                    errors={errors?.contactInformation?.address}
                  />
                </Col>
                <Col xs="12" className="container-inputs">
                  <Row>
                    <Col xs="12" lg="4" className="col">
                      <Row>
                        <Col xs="6" lg="12" className="col item">
                          <FormGroupPatient
                            name="contactInformation.phoneNumber"
                            label="Teléfono"
                            type="tel"
                            placeHolder="Ingresar número de teléfono"
                            labelSize={5}
                            inputSize={7}
                            register={register}
                            errors={errors?.contactInformation?.phoneNumber}
                          />
                        </Col>
                        <Col xs="6" lg="12" className="col item">
                          <FormGroupPatient
                            name="contactInformation.rfc"
                            label="RFC"
                            type="text"
                            placeHolder="Ingresar RFC"
                            labelSize={5}
                            inputSize={7}
                            register={register}
                            errors={errors?.contactInformation?.rfc}
                          />
                        </Col>
                        <Col xs="12" className="col item">
                          <FormGroupPatient
                            name="contactInformation.email"
                            label="Correo electrónico"
                            type="email"
                            placeHolder="Ingresar correo electrónico"
                            labelSize={5}
                            inputSize={7}
                            register={register}
                            errors={errors?.contactInformation?.email}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <div className="item">
                        <FormGroupPatient
                          name="contactInformation.fatherName"
                          label="Nombre del padre"
                          type="text"
                          placeHolder="Ingresar nombre del padre"
                          labelSize={5}
                          inputSize={7}
                          register={register}
                          errors={errors?.contactInformation?.fatherName}
                        />
                      </div>
                      <div className="item">
                        <FormGroupPatient
                          name="contactInformation.fatherProffesion"
                          label="Profesión del padre"
                          type="text"
                          placeHolder="Ingresar profesión del padre"
                          labelSize={5}
                          inputSize={7}
                          register={register}
                          errors={errors?.contactInformation?.fatherProffesion}
                        />
                      </div>
                      <div className="item">
                        <FormGroupPatient
                          name="contactInformation.fatherAge"
                          label="Edad del padre"
                          type="text"
                          placeHolder="Ingresar edad del padre"
                          labelSize={5}
                          inputSize={7}
                          register={register}
                          errors={errors?.contactInformation?.fatherAge}
                        />
                      </div>
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <div className="item">
                        <FormGroupPatient
                          name="contactInformation.motherName"
                          label="Nombre de la madre"
                          type="text"
                          placeHolder="Ingresar nombre de la madre"
                          labelSize={5}
                          inputSize={7}
                          register={register}
                          errors={errors?.contactInformation?.motherName}
                        />
                      </div>
                      <div className="item">
                        <FormGroupPatient
                          name="contactInformation.motherProffesion"
                          label="Profesión de la madre"
                          type="text"
                          placeHolder="Ingresar profesión de la madre"
                          labelSize={5}
                          inputSize={7}
                          register={register}
                          errors={errors?.contactInformation?.motherProffesion}
                        />
                      </div>
                      <div className="item">
                        <FormGroupPatient
                          name="contactInformation.motherAge"
                          label="Edad de la madre"
                          type="text"
                          placeHolder="Ingresar edad de la madre"
                          labelSize={5}
                          inputSize={7}
                          register={register}
                          errors={errors?.contactInformation?.motherAge}
                        />
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <hr className="divider" />

              <Row className="row row-background">
                <Col xs="12" className="col-title">
                  <Label className="subtitle">Antecedentes</Label>
                </Col>
                <Col xs="12" className="col-background-family">
                  <Row>
                    <Col xs="12" lg="4" className="col">
                      <FormGroupPatient
                        name="background.family"
                        label="Familiares"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar familiares"
                        labelSize={12}
                        inputSize={12}
                        rows="3"
                        register={register}
                        bulletPoint
                        errors={errors?.background?.family}
                      />
                    </Col>
                    <Col xs="12" md="6" lg="4" className="col">
                      <FormGroupPatient
                        name="background.nonPathologicalStaff"
                        label="Personal no patológico"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar personal no patológico"
                        labelSize={12}
                        inputSize={12}
                        rows="3"
                        bulletPoint
                        register={register}
                        errors={errors?.background?.nonPathologicalStaff}
                      />
                    </Col>
                    <Col xs="12" md="6" lg="4" className="col">
                      <FormGroupPatient
                        name="background.pathologicalStaff"
                        label="Personal patológico"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar personal patológico de padre epiléptico"
                        labelSize={12}
                        inputSize={12}
                        rows="3"
                        bulletPoint
                        register={register}
                        errors={errors?.background?.pathologicalStaff}
                      />
                    </Col>
                    <Col xs="12" className="col">
                      {fields.map((item, index) => {
                        return (
                          <Row key={item.id}>
                            <Col xs="12" md="7" className="col">
                              <FormGroupPatient
                                name={`background.backgroundTypes[${index}].text`}
                                inputClassname="input-auto-heigth"
                                type="textarea"
                                rows="1"
                                register={register}
                                placeHolder="Ingresar antecedente"
                                labelSize={12}
                                inputSize={12}
                                bulletPoint
                                styleInput={{
                                  color: watchBackgroundType[index]
                                    ? watchBackgroundType[index].type
                                      === 'antecedente normal'
                                      ? 'var(--blue-one)'
                                      : watchBackgroundType[index].type
                                        === 'antecedente alarmante'
                                        ? 'var(--pink)'
                                        : 'var(--blue-one)'
                                    : 'var(--blue-one)',
                                }}
                                onChange={(e) => autosize(e.target)}
                              />
                            </Col>
                            <Col xs="11" md="4" className="col">
                              <FormGroupPatient
                                name={`background.backgroundTypes[${index}].type`}
                                type="select"
                                inputClassname={
                                  watchBackgroundType[index]
                                    ? watchBackgroundType[index].type
                                      === 'antecedente normal'
                                      ? 'background-type-normal'
                                      : watchBackgroundType[index].type
                                        === 'antecedente alarmante'
                                        ? 'background-type-alarmant'
                                        : 'background-type'
                                    : 'background-type'
                                }
                                labelSize={12}
                                inputSize={12}
                                register={register}
                                options={[
                                  { value: '', text: 'Tipo de antecedente' },
                                  {
                                    value: 'antecedente alarmante',
                                    text: 'Antecedente alarmante',
                                  },
                                  {
                                    value: 'antecedente normal',
                                    text: 'Antecedente normal',
                                  },
                                ]}
                              />
                            </Col>
                            <Col xs="1" className="col">
                              <i
                                className="icon-delete"
                                onClick={() => removeBackgroundType(index)}
                                onKeyDown={() => removeBackgroundType(index)}
                              />
                            </Col>
                          </Row>
                        );
                      })}
                      <Button
                        className="btn-custom"
                        color=""
                        type="button"
                        onClick={addBackgroundType}
                      >
                        Añadir otro antecedente
                      </Button>
                    </Col>
                    <Col xs="12" lg="12" className="col col-stays-longer">
                      <Label className="subtitle">
                        Permanece más tiempo en:
                        {' '}
                      </Label>
                      <Row>
                        <Col xs="6" lg="2" className="col ">
                          <FieldArrayStaysLonger
                            {...{ control, register, errors }}
                            part={1}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register, errors }}
                            part={2}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register, errors }}
                            part={3}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register, errors }}
                            part={4}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register, errors }}
                            part={5}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register, errors }}
                            part={6}
                          />
                          <FormGroupPatient
                            name="background.staysLongerOther"
                            label="Otro especifique"
                            placeHolder="Otro..."
                            type="text"
                            labelSize={6}
                            inputSize={6}
                            required={false}
                            register={register}
                            errors={errors?.background?.staysLongerOther}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <hr className="divider" />

              <Row className="row col-other-variables">
                <Col xs="12" className="col-title">
                  <p className="subtitle">Otras variables</p>
                </Col>
                <Col xs="12" lg="4" className="">
                  <FormGroupPatient
                    name="otherVariables.fetalMotherPresentation"
                    label="Presentación fetal:"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    rows="2"
                    placeHolder="Ingresar dato"
                    labelSize={12}
                    inputSize={12}
                    bulletPoint
                    register={register}
                    errors={errors?.otherVariables?.fetalMotherPresentation}
                  />
                  <FormGroupPatient
                    name="otherVariables.fetalMovements"
                    label="Movs. fetales percibidos:"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    rows="2"
                    placeHolder="Ingresar dato"
                    labelSize={12}
                    inputSize={12}
                    bulletPoint
                    register={register}
                    errors={errors?.otherVariables?.fetalMovements}
                  />
                  <FormGroupPatient
                    name="otherVariables.firstImpression"
                    label="1a Impresión / Estado:"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    rows="2"
                    placeHolder="Ingresar dato"
                    labelSize={12}
                    inputSize={12}
                    bulletPoint
                    register={register}
                    errors={errors?.otherVariables?.firstImpression}
                  />
                </Col>
                <Col xs="12" lg="4" className="">
                  <FormGroupPatient
                    name="otherVariables.anotherTx"
                    label="Otro Tx. / Logros:"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    rows="2"
                    placeHolder="Ingresar dato"
                    labelSize={12}
                    inputSize={12}
                    bulletPoint
                    register={register}
                    errors={errors?.otherVariables?.anotherTx}
                  />
                  <FormGroupPatient
                    name="otherVariables.mainConcern"
                    label="Principal preocupación:"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    rows="2"
                    placeHolder="Ingresar dato"
                    labelSize={12}
                    inputSize={12}
                    bulletPoint
                    register={register}
                    errors={errors?.otherVariables?.mainConcern}
                  />
                  <FormGroupPatient
                    name="medicines.currents"
                    label="Medicamentos actuales"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    placeHolder="Ingresar medicamentos actuales del paciente"
                    labelSize={12}
                    inputSize={12}
                    // labelClassname="subtitle"
                    rows="2"
                    bulletPoint
                    register={register}
                    errors={errors?.medicines?.currents}
                  />
                </Col>
                <Col xs="12" lg="4" className="">
                  <FormGroupPatient
                    name="otherVariables.highPattern"
                    label="Patrón Alto / Edad:"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    rows="2"
                    placeHolder="Ingresar dato"
                    labelSize={12}
                    inputSize={12}
                    bulletPoint
                    register={register}
                    errors={errors?.otherVariables?.highPattern}
                  />
                  <FormGroupPatient
                    name="otherVariables.nextSkill"
                    label="Próxima Habilidad:"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    rows="2"
                    placeHolder="Ingresar dato"
                    labelSize={12}
                    inputSize={12}
                    bulletPoint
                    register={register}
                    errors={errors?.otherVariables?.nextSkill}
                  />
                  <FormGroupPatient
                    name="medicines.mother"
                    label="Medicamentos de la madre"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    placeHolder="Ingresar medicamentos de la madre"
                    labelSize={12}
                    inputSize={12}
                    // labelClassname="subtitle"
                    rows="2"
                    bulletPoint
                    register={register}
                    errors={errors?.medicines?.mother}
                  />
                </Col>
                {/* {
                    patientDataComplete && !patientDataComplete?.useNewForm && (
                      <Col xs="12" lg="7" className="">
                        <Row>
                          <Col xs="12" className="col col-indicators">
                            <FieldArrayIndicators
                              {...{
                                control, register, errors, setValue,
                              }}
                            />
                          </Col>
                          <Col xs="12" className="col">
                            <FieldArrayPhysicalResponses
                              {...{
                                control, register, errors, setValue,
                              }}
                            />
                          </Col>
                        </Row>
                      </Col>
                    )
                  } */}
              </Row>
              <hr className="divider" />
              <Row className="row row-btn">
                {
                  !idRegisterCreated && (
                  <Col xs="6" className="col-btn">
                    <Button
                      type="button"
                      className="btn-custom"
                      color=""
                      disabled={btnSubmitDisabled}
                      onClick={handleSubmit(onSubmit)}
                    >
                      {typeActionForm === 'crear' ? 'Crear' : 'Actualizar'}
                      {' '}
                      registro
                    </Button>
                  </Col>

                  )
                }
                <Col xs="6" className="col-btn">
                  {idRegisterCreated && (
                    <Button color="" className="btn-custom btn-cita">
                      <Link
                        to={`/citas/${idRegisterCreated}`}
                        target="_blank"
                        type="button"
                      >
                        Agendar cita
                      </Link>
                    </Button>
                  )}
                </Col>
                <Col xs="12">
                  {alert.status ? (
                    <CustomAlert text={alert.text} color={alert.color} />
                  ) : null}
                </Col>
              </Row>
              <hr className="divider" />
              <Row className="row row-observations">
                <Col xs="12" className="col-title">
                  <p className="subtitle">Observación de la estructura</p>
                </Col>
                <Col xs="12" className="">
                  <Row className="row">
                    <Col xs="12" md="7" lg="6" xl="6" className="col">
                      <FormGroupPatient
                        name="observations.headFace"
                        label="Cabeza/Cara:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        errors={errors?.observations?.headFace}
                        required={false}
                      />
                      <FormGroupPatient
                        name="observations.chest"
                        label="Tórax:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        errors={errors?.observations?.chest}
                        required={false}
                      />
                      <FormGroupPatient
                        name="observations.armsHands"
                        label="Brazos/Manos:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        errors={errors?.observations?.armsHands}
                        required={false}
                      />
                      <FormGroupPatient
                        name="observations.abodemnGenitals"
                        label="Abdomen/Genitales:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        errors={errors?.observations?.abodemnGenitals}
                        required={false}
                      />
                      <FormGroupPatient
                        name="observations.hipKneesFeet"
                        label="Cadera/Rodillas/Pies:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        errors={errors?.observations?.hipKneesFeet}
                        required={false}
                      />
                      <FormGroupPatient
                        name="observations.spine"
                        label="Columna:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        errors={errors?.observations?.spine}
                        required={false}
                      />
                    </Col>
                  </Row>
                  <Row className="row list-group-container">
                    <Col xs="12" md="4" className="col">
                      <FormGroupPatient
                        name="observations.constantNoDynamicPatterns"
                        label="Patrones no dinámicos constantes"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar patrones no dinámicos constantes"
                        labelSize={12}
                        inputSize={12}
                        labelClassname="subtitle"
                        rows="2"
                        bulletPoint
                        register={register}
                        errors={errors?.observations?.constantNoDynamicPatterns}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" md="4" className="col">
                      <FormGroupPatient
                        name="observations.constantSpontaneousPatterns"
                        label="Patrones dinámicos espontáneos"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar patrones dinámicos espontáneos"
                        labelSize={12}
                        inputSize={12}
                        labelClassname="subtitle"
                        rows="2"
                        bulletPoint
                        register={register}
                        errors={
                          errors?.observations?.constantSpontaneousPatterns
                        }
                        required={false}
                      />
                    </Col>
                    <Col xs="12" md="4" className="col">
                      <FormGroupPatient
                        name="observations.mainTrouble"
                        label="Problema principal / Alteraciones funcionales"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar el problema principal o las alteraciones funcionales"
                        labelSize={12}
                        inputSize={12}
                        labelClassname="subtitle"
                        rows="2"
                        bulletPoint
                        register={register}
                        errors={errors?.observations?.mainTrouble}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" md="4" className="col">
                      <FormGroupPatient
                        name="observations.neurobehavioralResponse"
                        label="Respuesta neuroconductual"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar la respuesta neuroconductual"
                        labelSize={12}
                        inputSize={12}
                        labelClassname="subtitle"
                        rows="2"
                        bulletPoint
                        register={register}
                        errors={errors?.observations?.neurobehavioralResponse}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" md="4" className="col">
                      <FormGroupPatient
                        name="observations.txPlan"
                        label="Plan de Tx"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar plan de Tx"
                        labelSize={12}
                        inputSize={12}
                        rows={2}
                        bulletPoint
                        labelClassname="subtitle"
                        register={register}
                        errors={errors?.observations?.txPlan}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <FormGroupPatient
                        name="observations.nextHab"
                        label="Prox. Hab"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar prox. hab."
                        labelSize={12}
                        inputSize={12}
                        rows={2}
                        bulletPoint
                        labelClassname="subtitle"
                        register={register}
                        errors={errors?.observations?.nextHab}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <FormGroupPatient
                        name="observations.txPerWeek"
                        label="Tx por sem."
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar Tx por sem."
                        labelSize={12}
                        inputSize={12}
                        rows={2}
                        bulletPoint
                        labelClassname="subtitle"
                        register={register}
                        errors={errors?.observations?.txPerWeek}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <FormGroupPatient
                        name="observations.studies"
                        label="Estudios"
                        type="textarea"
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar estudios"
                        labelSize={12}
                        inputSize={12}
                        rows={2}
                        bulletPoint
                        labelClassname="subtitle"
                        register={register}
                        errors={errors?.observations?.studies}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <FormGroupPatient
                        name="observations.canalization"
                        label="Se canaliza"
                        type="text"
                        inputClassname="observation-input"
                        // inputClassname="input-auto-heigth"
                        placeHolder="Ingresar canalización"
                        labelSize={12}
                        inputSize={12}
                        rows={2}
                        // bulletPoint
                        labelClassname="subtitle"
                        register={register}
                        errors={errors?.observations?.canalization}
                        required={false}
                      />
                    </Col>
                    <Col xs="12" className="col mt-2">
                      <p className="label subtitle mr-1">Conducta</p>
                      <ConductTable
                        register={register}
                        watch={watch}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <hr className="divider" />
              {idRegisterCreated && (
              <Row className="row row-btn">
                <Col xs="6" className="col-btn">
                  <Button
                    type="button"
                    className="btn-custom"
                    color=""
                    // disabled={btnSubmitDisabled}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {/* {typeActionForm === 'crear' ? 'Crear' : 'Actualizar'} */}
                    {/* {' '} */}
                    Actualizar registro
                  </Button>
                </Col>
                <Col xs="6" className="col-btn">
                  <Button color="" className="btn-custom btn-cita">
                    <Link
                      to={`/citas/${idRegisterCreated}`}
                      target="_blank"
                      type="button"
                    >
                      Agendar cita
                    </Link>
                  </Button>
                </Col>
                <Col xs="12">
                  {alert.status ? (
                    <CustomAlert text={alert.text} color={alert.color} />
                  ) : null}
                </Col>
              </Row>
              )}
              {/* {(typeActionForm === 'editar' || idRegisterCreated)
                && correctedAge?.type === 'post'
                && correctedAge?.age >= 7
                && correctedAge?.age < 8 && (
                  <Row className="row row-motor-repertoire">
                    <Col
                      xs="12"
                      className="col col-title"
                      style={{ textAlign: 'center' }}
                    >
                      <h1 className="title">Periodo de transición</h1>
                    </Col>
                  </Row>
              )}
              {(typeActionForm === 'editar' || idRegisterCreated)
                && ((correctedAge?.type === 'pret' && correctedAge?.age < 26)
                  || (correctedAge?.type === 'post' && correctedAge?.age > 105)
                  || patientDataComplete?.general?.eco === 'Mayor a 2 años') && (
                  <Row className="row row-motor-repertoire">
                    <Col
                      xs="12"
                      className="col col-title"
                      style={{ textAlign: 'center' }}
                    >
                      <h1 className="title">No aplica formulario adicional</h1>
                    </Col>
                  </Row>
              )} */}
              <hr className="divider" />
            </form>
          </>
        )}
        {userData.role === 'Editor' && typeActionForm === 'editar' && (
          <>
            <Label className="title">Formato de valoración del paciente</Label>

            <form className="patient-form">
              <i
                className="ico-close icon-close"
                onClick={closePage}
                onKeyDown={closePage}
              />
              <Row className="row row-general">
                <Col xs="12" lg="12" className="col-title">
                  <Label className="subtitle">Datos generales</Label>
                </Col>
                <Col xs="12" lg="2" className="col">
                  <Row>
                    <Col xs="6" lg="12" className="col">
                      <InputFormGroup
                        type="file"
                        name="profile-pic-patient"
                        columnSize={12}
                        accept="image/"
                        inputFileSimple
                        required={false}
                        onChange={(e) => {
                          setProfilePicUpload(e.target.files[0]);
                          filesSelected(e.target);
                        }}
                      />
                    </Col>
                    <Col xs="6" lg="12">
                      <Media
                        className="profile-pic-custom profile-pic"
                        src={
                          profilePicUpload
                            ? URL.createObjectURL(profilePicUpload)
                            : patientDataComplete?.profile_pic_url
                        }
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row className="row row-btn">
                <Col xs="12" lg="4" className="col-btn">
                  <Button
                    type="button"
                    className="btn-custom"
                    color=""
                    disabled={btnSubmitDisabled}
                    onClick={updateProfilePic}
                  >
                    Actualizar foto
                  </Button>
                </Col>
              </Row>
            </form>
          </>
        )}
      </div>
      {(typeActionForm === 'editar' || idRegisterCreated) && (
        <NeuroMonitoringForm
          idPatientRegister={idRegisterCreated || patientDataComplete?.id}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      )}
    </>
  );
};

FormPatient.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default authHOC(FormPatient, ['Administrador', 'Editor']);
