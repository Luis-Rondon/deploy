/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Media, Label,
} from 'reactstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import autosize from 'autosize';
import authHOC from '../utils/authHOC';
import { patientModel } from '../models/PatientType';
import { getPatientValorationById } from '../actions/PatientAction';
import Menu from '../common/Menu';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import CustomAlert from '../common/CustomAlert';
import FormGroupPatient from '../components/FormGroupPatient';
import FieldArrayStaysLonger from '../components/FieldArrayStaysLonger';
// import FieldArrayIndicators from '../components/FieldArrayIndicators';
// import FieldArrayPhysicalResponses from '../components/FieldArrayPhysicalResponses';
import NeuroMonitoringItem from '../components/NeuroMonitoringItem';
import NeuroMonitoringFilesModal from '../components/NeuroMonitoringFilesModal';
import userProfilePic from '../assets/user-profile-default.jpg';
import { getAllUsersOptionsSearch } from '../actions/UserAction';
import '../styles/formPatient.scss';
import { getEcoWeeksPrePost } from '../utils/formulas';
import ConductTable from '../components/ConductTable';

const FormPatientView = ({ history, match }) => {
  const [readOnlyState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [patientDataComplete, setPatientDataComplete] = useState();
  const [correctedAge, setCorrectedAge] = useState({
    age: null,
    type: '',
    sg: null,
  });
  const [monitoringItems, setMonitoringItems] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [dataMonitoringItem, setDataMonitoringItem] = useState();


  const autoGrowInput = (e) => autosize(e.target);

  const {
    register, setValue, control, watch,
  } = useForm({
    defaultValues: patientModel,
  });
  const { fields, append } = useFieldArray({
    control,
    name: 'background.backgroundTypes',
  });
  const watchBackgroundType = watch('background.backgroundTypes');
  const watchReferedBy = watch('references.referredBy');
  const watchSexo = watch('general.sex');
  const watchSilverman = watch('general.silverman');
  const watchapgar = watch('general.apgar');

  const toggleModal = () => {
    setDataMonitoringItem(null);
    setModalIsOpen((prevState) => !prevState);
  };

  const onChangeDataMonitoringItem = (dataItem) => {
    setDataMonitoringItem(dataItem);
    setModalIsOpen(true);
  };

  const autosizeListInputs = () => {
    const inputsAutoHeight = document.getElementsByClassName('input-auto-heigth');
    autosize(inputsAutoHeight);
  };

  useEffect(() => {
    autosizeListInputs();
  }, []);

  useEffect(() => {
    if (patientDataComplete) {
      getAllUsersOptionsSearch()
        .then((data) => {
          const doctorName = data.find(
            (user) => user.value === patientDataComplete?.doctorIdAssigned,
          );
          setValue(
            'doctorIdAssigned',
            doctorName ? doctorName?.name : '- No registrado -',
          );
        })
        .catch((error) => console.log(error.message));
    }
    // eslint-disable-next-line
  }, [setPatientDataComplete, patientDataComplete]);

  useEffect(() => {
    const { id } = match.params;
    getPatientValorationById(id)
      .then((result) => {
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
        setIsLoading(false);
        if (result.data.neuroMonitoring) {
          setIsLoading(true);
          const objectToArray = Object.values(result.data.neuroMonitoring);
          objectToArray.sort((a, b) => {
            return a.number - b.number;
          });
          setMonitoringItems(objectToArray);
          setIsLoading(false);
        }
        autosizeListInputs();
      })
      .catch(() => {
        setIsLoading(false);
        history.push('/pacientes');
      });
    // eslint-disable-next-line
  }, [match]);

  return (
    <>
      <Menu />
      <Navbar history={history} />
      {isLoading && (
        <div id="page-wrap" className="patient-content">
          <LoadingSpinner size="4" text="Cargando..." />
        </div>
      )}
      {
        // isLoading
        patientDataComplete && (
          <div id="page-wrap" className="patient-content">
            {alert.status ? (
              <CustomAlert text={alert.text} color={alert.color} />
            ) : null}
            <Label className="title">Formato de valoración del paciente</Label>
            <form className="patient-form">
              <i
                className="ico-close icon-close"
                onClick={() => history.push('/pacientes')}
                onKeyDown={() => history.push('/pacientes')}
              />
              <Row className="row row-general">
                <Col xs="8" lg="10" className="col-title datos-generales">
                  <Label className="subtitle">Datos generales</Label>
                  <Row>

                    <Col xs="12" className="col">
                      <FormGroupPatient
                        name="general.name"
                        label="Nombre del paciente:"
                        labelSize={window.innerWidth > 1400 ? 2 : window.innerWidth > 500 ? 3 : 12}
                        inputSize={9}
                        placeHolder="Ingresar nombre"
                        onChange={autoGrowInput}
                        inputClassname="text-capitalize"
                        type="text"
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col xs="4" lg="2" className="col profile-pic-container">
                  <Media
                    className="profile-pic-custom profile-pic"
                    src={
                      patientDataComplete
                        ? patientDataComplete.profile_pic_url
                        : userProfilePic
                    }
                  />
                </Col>
                <Col xs="12" lg="4">
                  <Row className="row">
                    <Col xs="12" className="col">
                      <Row className="row">
                        <Col xs="12" className="col">
                          <FormGroupPatient
                            name="general.consultDate"
                            label="Fecha de consulta:"
                            type="date"
                            placeHolder="yyyy-mm-dd"
                            pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                            register={register}
                            readOnly={readOnlyState}
                          />
                          <FormGroupPatient
                            name="general.birthDate"
                            label="Fecha de nacimiento:"
                            type="date"
                            placeHolder="yyyy-mm-dd"
                            pattern="([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))"
                            register={register}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="12" className="col">
                          <FormGroupPatient
                            name="general.sg"
                            label="SG:"
                            type="number"
                            min="1"
                            pattern="^[0-9]+"
                            placeHolder="Ingresar SG"
                                // labelSize={screenWidth <= 575 ? 3 : 4}
                                // inputSize={screenWidth <= 575 ? 9 : 8}
                            register={register}
                            readOnly={readOnlyState}
                          />
                          <FormGroupPatient
                            name="general.pc"
                            label="P. Cefálico:"
                            type="text"
                            placeHolder="Ingresar pc"
                                // labelSize={3}
                                // inputSize={9}
                            register={register}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="12" className="col">
                          <FormGroupPatient
                            name="general.size"
                            label="Talla:"
                            type="text"
                            placeHolder="Ingresar talla (cm)"
                                // labelSize={screenWidth <= 575 ? 3 : 4}
                                // inputSize={screenWidth <= 575 ? 9 : 8}
                            register={register}
                            readOnly={readOnlyState}
                          />
                          <FormGroupPatient
                            name="general.weight"
                            label="Peso:"
                            type="text"
                            placeHolder="Ingresar peso (grs)"
                                // labelSize={screenWidth <= 575 ? 3 : 6}
                                // inputSize={screenWidth <= 575 ? 9 : 6}
                            register={register}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="12" className="col">
                          <FormGroupPatient
                            name="createdAt"
                            label="Creado el:"
                            type="textarea"
                            placeHolder="No registrada"
                            inputClassname="input-auto-heigth"
                            rows={2}
                            labelSize={6}
                            inputSize={6}
                            register={register}
                            readOnly={readOnlyState}
                          />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                <Col xs="12" lg="8">
                  <Row className="row">
                    <Col xs="6" className="col">
                      <FormGroupPatient
                        name="general.dn"
                        label="Días de Nacido:"
                        type="text"
                        placeHolder="Ingresar DN"
                        labelSize={6}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.leftTime"
                        label="Tiempo faltante:"
                        type="text"
                        placeHolder="Tiempo faltante"
                            // labelSize={3}
                            // inputSize={9}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.eCron"
                        label="E.Cron:"
                        type="text"
                        placeHolder="Ingresar E.Cron."
                            // labelSize={3}
                            // inputSize={9}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.eco"
                        label="ECo:"
                        type="text"
                        placeHolder="Ingresar ECo"
                            // labelSize={3}
                            // inputSize={9}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.ecoWeeks"
                        label="ECo semanas:"
                        type="text"
                        placeHolder="ECo en semanas"
                            // labelSize={3}
                            // inputSize={9}
                        required={false}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.ageApprox"
                        label="Edad aproximada:"
                        type="text"
                        placeHolder="Ingresar edad aproximada"
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                    <Col xs="6" className="col">
                      <FormGroupPatient
                        name="general.sex"
                        label="Sexo:"
                        type="select"
                        placeHolder="-Seleccionar-"
                        labelSize={4}
                        inputSize={7}
                        options={[
                          { value: '', text: '- Seleccionar -' },
                          { value: 'm', text: 'Masculino' },
                          { value: 'f', text: 'Femenino' },
                        ]}
                        inputClassname={
                            watchSexo
                              ? watchSexo === 'm'
                                ? 'background-type-masculino'
                                : watchSexo === 'f'
                                  ? 'background-type-femenino'
                                  : 'background-type-normal'
                              : 'background-type-normal'
                          }
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.temperature"
                        label="Temperatura:"
                        type="textarea"
                        placeHolder="Ingresar temperatura"
                        inputClassname="input-auto-heigth"
                        rows={1}
                        labelSize={4}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.spo2"
                        label="SpO2:"
                        type="text"
                        placeHolder=""
                        rows={1}
                        labelSize={4}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.fc"
                        label="FC:"
                        type="text"
                        placeHolder=""
                        rows={1}
                        labelSize={4}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.lastFoodTime"
                        label="Último alimento:"
                        type="textarea"
                        placeHolder="Ingresar tiempo del último alimento"
                        inputClassname="input-auto-heigth"
                        rows={1}
                        labelSize={4}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.apgar"
                        label="APGAR:"
                        type="TEXT"
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
                        labelSize={4}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="general.silverman"
                        label="SILVERMAN:"
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
                        labelSize={4}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
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
                    readOnly={readOnlyState}
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
                    options={[
                      { value: '', text: '- Seleccionar -' },
                      { value: 'Facebook', text: 'Facebook' },
                      { value: 'Instagram', text: 'Instagram' },
                      { value: 'Familiar', text: 'Familiar' },
                      { value: 'Paciente', text: 'Paciente' },
                      { value: 'Otro', text: 'Otro' },
                    ]}
                    readOnly={readOnlyState}
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
                    label="Otra referencia"
                    type="text"
                    placeHolder="Ingresar referencia"
                    labelSize={12}
                    inputSize={12}
                    maxLength={78}
                    labelClassname="subtitle"
                    register={register}
                    readOnly={readOnlyState}
                  />
                </Col>
              </Row>

              <hr className="divider" />
              <Row className="row row-contact-nformation">
                <Col xs="12" className="col-title">
                  <Label className="subtitle">Información de contacto</Label>
                </Col>
                <Col xs="12" lg="6" className="">
                  <FormGroupPatient
                    name="contactInformation.address"
                    label="Domicilio"
                    type="text"
                    placeHolder="Ingresar domicilio"
                    labelSize={3}
                    inputSize={9}
                    register={register}
                    readOnly={readOnlyState}
                  />
                </Col>
                <Col xs="12" className="">
                  <Row>
                    <Col xs="12" lg="4" className="col">
                      <Row>
                        <Col xs="6" lg="12" className="col">
                          <FormGroupPatient
                            name="contactInformation.phoneNumber"
                            label="Teléfono"
                            type="tel"
                            placeHolder="Ingresar número de teléfono"
                            labelSize={4}
                            inputSize={8}
                            register={register}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="12" className="col">
                          <FormGroupPatient
                            name="contactInformation.rfc"
                            label="RFC"
                            type="text"
                            placeHolder="Ingresar RFC"
                            labelSize={2}
                            inputSize={10}
                            register={register}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="12" className="col">
                          <FormGroupPatient
                            name="contactInformation.email"
                            label="Correo electrónico"
                            type="email"
                            placeHolder="Ingresar correo electrónico"
                            labelSize={5}
                            inputSize={7}
                            register={register}
                            readOnly={readOnlyState}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <FormGroupPatient
                        name="contactInformation.fatherName"
                        label="Nombre del padre"
                        type="text"
                        placeHolder="Ingresar nombre del padre"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="contactInformation.fatherProffesion"
                        label="Profesión del padre"
                        type="text"
                        placeHolder="Ingresar profesión del padre"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="contactInformation.fatherAge"
                        label="Edad del padre"
                        type="text"
                        placeHolder="Ingresar edad del padre"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                    <Col xs="12" lg="4" className="col">
                      <FormGroupPatient
                        name="contactInformation.motherName"
                        label="Nombre de la madre"
                        type="text"
                        placeHolder="Ingresar nombre de la madre"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="contactInformation.motherProffesion"
                        label="Profesión de la madre"
                        type="text"
                        placeHolder="Ingresar profesión de la madre"
                        labelSize={5}
                        inputSize={6}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="contactInformation.motherAge"
                        label="Edad de la madre"
                        type="text"
                        placeHolder="Ingresar edad de la madre"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
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
                        onChange={autoGrowInput}
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar familiares"
                        labelSize={12}
                        inputSize={12}
                        rows="3"
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                    <Col xs="12" md="6" lg="4" className="col">
                      <FormGroupPatient
                        name="background.nonPathologicalStaff"
                        label="Personal no patológico"
                        type="textarea"
                        onChange={autoGrowInput}
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar personal no patológico"
                        labelSize={12}
                        inputSize={12}
                        rows="3"
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                    <Col xs="12" md="6" lg="4" className="col">
                      <FormGroupPatient
                        name="background.pathologicalStaff"
                        label="Personal patológico"
                        type="textarea"
                        onChange={autoGrowInput}
                        inputClassname="input-auto-heigth"
                        placeHolder="Ingresar personal patológico de padre epiléptico"
                        labelSize={12}
                        inputSize={12}
                        rows="3"
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                    <Col xs="12" className="col">
                      {fields.map((item, index) => {
                        return (
                          <Row key={item.id}>
                            <Col xs="12" lg="8" className="col">
                              <FormGroupPatient
                                name={`background.backgroundTypes[${index}].text`}
                                inputClassname="input-auto-heigth"
                                type="textarea"
                                rows="2"
                                register={register}
                                labelSize={12}
                                inputSize={12}
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
                                readOnly={readOnlyState}
                              />
                            </Col>
                            <Col xs="12" lg="4" className="col">
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
                                readOnly={readOnlyState}
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
                          </Row>
                        );
                      })}
                    </Col>
                    <Col xs="12" className="col col-stays-longer">
                      <Label className="subtitle">
                        Permanece más tiempo en:
                        {' '}
                      </Label>
                      <Row>
                        <Col xs="6" lg="2" className="col ">
                          <FieldArrayStaysLonger
                            {...{ control, register }}
                            part={1}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register }}
                            part={2}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register }}
                            part={3}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register }}
                            part={4}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register }}
                            part={5}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="6" lg="2" className="col">
                          <FieldArrayStaysLonger
                            {...{ control, register }}
                            part={6}
                            readOnly={readOnlyState}
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
                            readOnly={readOnlyState}
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
                    register={register}
                    readOnly={readOnlyState}
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
                    register={register}
                    readOnly={readOnlyState}
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
                    register={register}
                    readOnly={readOnlyState}
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
                    register={register}
                    readOnly={readOnlyState}
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
                    register={register}
                    readOnly={readOnlyState}
                  />
                  <FormGroupPatient
                    name="medicines.currents"
                    label="Medicamentos actuales"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    placeHolder="Ingresar medicamentos actuales del paciente"
                    labelSize={12}
                    inputSize={12}
                    rows="10"
                    register={register}
                    readOnly={readOnlyState}
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
                    register={register}
                    readOnly={readOnlyState}
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
                    register={register}
                    readOnly={readOnlyState}
                  />
                  <FormGroupPatient
                    name="medicines.mother"
                    label="Medicamentos de la madre"
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    placeHolder="Ingresar medicamentos de la madre"
                    labelSize={12}
                    inputSize={12}
                    rows="10"
                    register={register}
                    readOnly={readOnlyState}
                  />
                </Col>
                {/* {
                  patientDataComplete && !patientDataComplete?.useNewForm && (
                    <Col xs="12" lg="7" className="">
                      <Row>
                        <Col xs="12" className="col col-indicators">
                          <FieldArrayIndicators
                            {...{ control, register }}
                            readOnly={readOnlyState}
                          />
                        </Col>
                        <Col xs="12" className="col">
                          <FieldArrayPhysicalResponses
                            {...{ control, register }}
                            readOnly={readOnlyState}
                          />
                        </Col>
                      </Row>
                    </Col>
                  )
                } */}
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
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="observations.chest"
                        label="Tórax:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="observations.armsHands"
                        label="Brazos/Manos:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="observations.abodemnGenitals"
                        label="Abdomen/Genitales:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="observations.hipKneesFeet"
                        label="Cadera/Rodillas/Pies:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                      <FormGroupPatient
                        name="observations.spine"
                        label="Columna:"
                        type="text"
                        placeHolder="Ingresar dato"
                        labelSize={5}
                        inputSize={7}
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                  </Row>
                  <Row className="row">
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
                        rows="8"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows="8"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows="8"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows="8"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows={3}
                        labelClassname="subtitle"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows={3}
                        labelClassname="subtitle"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows={3}
                        labelClassname="subtitle"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows="3"
                        labelClassname="subtitle"
                        register={register}
                        readOnly={readOnlyState}
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
                        rows="3"
                        labelClassname="subtitle"
                        register={register}
                        readOnly={readOnlyState}
                      />
                    </Col>
                    <Col xs="12" className="col mt-2">
                      <p className="label subtitle mr-1">Conducta</p>
                      <ConductTable
                        register={register}
                        watch={watch}
                        readOnly={readOnlyState}
                      />
                    </Col>
                  </Row>
                </Col>
                <hr className="divider" />
              </Row>

              {correctedAge?.type === 'post'
                && patientDataComplete?.id
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

              {patientDataComplete?.id
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
                )}
              <hr className="divider" />
            </form>
            {monitoringItems.length === 0 ? (
              <p className="title">Aún no ha agregado ningún seguimiento</p>
            ) : (
              <div className="form-neuro-monitoring mx-0 p-0">
                {monitoringItems.map((item, index) => (
                  <NeuroMonitoringItem
                    key={item.idRegister}
                    item={item}
                    index={index}
                    typeForm="view"
                    onChangeDataMonitoringItem={onChangeDataMonitoringItem}
                  />
                ))}
              </div>
            )}
            <NeuroMonitoringFilesModal
              show={modalIsOpen}
              close={toggleModal}
              data={dataMonitoringItem || null}
            />
          </div>
        )
      }
    </>
  );
};

FormPatientView.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default authHOC(FormPatientView, [
  'Administrador',
  'Editor',
  'Colaborador',
]);
