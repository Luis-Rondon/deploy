/* eslint-disable max-len */
import React, {
  useState, useEffect, useContext, Fragment,
} from 'react';
import {
  Row, Col, Container, Button, Spinner, Label,
} from 'reactstrap';
import confirm from 'reactstrap-confirm';
import autosize from 'autosize';
import moment from 'moment';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import JoditEditor from 'jodit-react';
import { v4 as uuidv4 } from 'uuid';
import { useFieldArray, useForm } from 'react-hook-form';
import authHOC from '../utils/authHOC';
import UserData from '../context/UserData';
import {
  createHistoryDates,
  deleteFilePropertyFromHistoryFormatById,
  deleteOneHistoryFormatFiles,
  getHistoryFormatByPatientId,
  updateHistoryDatesById,
  uploadMultipleHistoryFormatFiles,
} from '../actions/HistoryFormatAction';
import { getCurrentDate, getCurrentDateFull } from '../utils/formulas';
import Menu from '../common/Menu';
import Navbar from '../common/Navbar';
import CustomAlert from '../common/CustomAlert';
import { HistoryDatesFormatType } from '../models/HistoryDatesFormatType';
import { getPatientValorationById } from '../actions/PatientAction';
import FormGroupPatient from '../components/FormGroupPatient';
import HistoryDatesPdf from '../components/HistoryDatesPdf';
import HistoryFilesModalEdit from '../components/HistoryFilesModalEdit';
// import HistoryDatesDocumentPdf from '../components/HistoryDatesDocumentPdf';
import fileFormats from '../utils/fileFormats.json';
import '../styles/historyDatesFormat.scss';
import { confirmWrongFileAlert } from '../utils/confirmWrongFile';

const screenWidth = window.screen.width || 575;

const configEditor = {
  // readonly: false, // all options from https://xdsoft.net/jodit/play.html
  useSearch: false,
  spellcheck: false,
  toolbarButtonSize: 'small',
  inline: true,
  toolbarInlineForSelection: true,
  buttons:
    'bold,italic,underline,strikethrough,ul,ol,indent,outdent,left,font,fontsize,undo,redo,print',
  // showPlaceholder: false,
  controls: {
    font: {
      list: {
        '-apple-system,BlinkMacSystemFont,Segoe WPC,Segoe UI,HelveticaNeue-Light,Ubuntu,Droid Sans,sans-serif':
          'OS System Font',
        'HG Michoe': 'HG Michoe',
      },
    },
  },
};

const HistoryDatesFormat = ({ history, match }) => {
  const [alert, setAlert] = useState({ status: false, text: '', color: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [typeActionForm, setTypeActionForm] = useState();
  const [btnSubmitDisabled, setBtnSubmitDisabled] = useState(false);
  const [patientDataComplete, setPatientDataComplete] = useState();
  const [historyDatesDataComplete, setHistoryDatesDataComplete] = useState();
  const [historyCreatedId, setHistoryCreatedId] = useState();
  const [isReady, setIsReady] = useState(false);
  const [historyDocumentFields, setHistoryDocumentFields] = useState([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [docFiles, setDocFiles] = useState([]);

  const { userData } = useContext(UserData);

  const {
    register, handleSubmit, setValue, errors, control,
  } = useForm({
    defaultValues: HistoryDatesFormatType,
  });
  const {
    fields: historyRegisterFields,
    append: historyRegisterAppend,
    remove: historyRegisterRemove,
  } = useFieldArray({
    control,
    name: 'historyRegister',
  });
  // const { fields: historyDocumentFields, append: historyDocumentAppend, remove: historyDocumentRemove } = useFieldArray({
  //   control,
  //   name: 'historyDocument',
  // });

  const toggleModal = () => {
    setModalIsOpen((prevState) => !prevState);
  };

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
      await confirmWrongFileAlert(
        incorrectedFileNames,
        'document',
        `Los siguientes archivos no son compatibles: ${incorrectedFileNames}. Solo se aceptan archivos: pdf.`,
      );
    }
  };

  const resetInputFiles = () => {
    [
      ...document.getElementsByClassName(
        `input-file-reset-${historyDatesDataComplete?.id}`,
      ),
    ].forEach((input) => {
      filesSelected(input, 0);
    });
  };

  const onSubmitFiles = async (button, setStateDocuments) => {
    const dataComplete = historyDatesDataComplete;
    button.textContent = 'Subiendo...';
    button.disabled = true;
    if (docFiles.length > 0) {
      await uploadMultipleHistoryFormatFiles(
        docFiles,
        'documents',
        patientDataComplete?.id,
        setStateDocuments,
      )
        .then((fileList) => {
          dataComplete.documentFiles = {
            ...fileList,
            ...dataComplete.documentFiles,
          };
          setDocFiles([]);
        })
        .catch((error) => setAlert({ status: true, text: error.message, color: 'red' }));
    }
    await updateHistoryDatesById(historyCreatedId, dataComplete)
      .then(() => {
        setHistoryDatesDataComplete(dataComplete);
        button.textContent = 'Subir archivos';
        button.disabled = false;
        resetInputFiles();
      })
      .catch(() => {
        button.textContent = 'Subir archivos';
        button.disabled = false;
      });
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
    setAlert({ status: true, text: 'Eliminando...', color: 'red' });
    await deleteOneHistoryFormatFiles(file, type, patientDataComplete?.id)
      .then(() => deleteFilePropertyFromHistoryFormatById(
          historyDatesDataComplete?.id,
          keyFile,
          type.substring(0, type.length - 1),
      ))
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        const newData = historyDatesDataComplete;
        switch (type) {
          case 'documents':
            delete newData.documentFiles[keyFile];
            break;
          default:
            break;
        }
        setHistoryDatesDataComplete(newData);
        // getHistoryData();
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

  const addHistoryRegister = () => {
    historyRegisterAppend({ date: getCurrentDate(), price: 0 });
  };

  const removeHistoryRegister = (index) => {
    historyRegisterRemove(index);
  };

  const addHistoryDocument = () => {
    // historyDocumentAppend({  });
    setHistoryDocumentFields((prevState) => [
      ...prevState,
      { text: '', date: getCurrentDateFull(), id: uuidv4() },
    ]);
    // simple value
  };

  const removeHistoryDocument = (item) => {
    // historyDocumentRemove(index);
    setHistoryDocumentFields((prevState) => prevState.filter((element) => element.id !== item?.id));
  };

  const getHistoryData = (id) => {
    getHistoryFormatByPatientId(id || patientDataComplete?.id)
      .then((result) => {
        if (result.data) {
          setHistoryCreatedId(result.data.id);
          Object.keys(result.data).forEach((key) => setValue(key, result.data[key]));
          if (result.data?.historyRegister?.length) {
            result.data.historyRegister.forEach((item) => historyRegisterAppend({ date: item.date, price: item.price }));
            setValue('historyRegister', result.data.historyRegister);
          }
          if (result.data?.historyDocument?.length) {
            // result.data.historyDocument.forEach((item) => historyDocumentAppend({ text: item.text, date: item.date, id: item?.id }));
            setValue('historyDocument', result.data.historyDocument);
            setHistoryDocumentFields(result.data.historyDocument);
          }
          setTypeActionForm('editar');
          const fullData = result.data;
          // const fullData = getValues({ nest: true });
          setHistoryDatesDataComplete(fullData);
          setIsReady(true);
          autosize(document.querySelectorAll('textarea'));
        } else {
          Object.keys(HistoryDatesFormatType).forEach((key) => setValue(key, HistoryDatesFormatType[key]));
          setTypeActionForm('crear');
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const { id } = match.params;
    if (userData.role !== 'Administrador') history.push('/pacientes');
    getPatientValorationById(id)
      .then((result) => {
        setPatientDataComplete(result.data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
        history.push('/pacientes');
      });
    getHistoryData(id);
    // eslint-disable-next-line
  }, [match]);

  const onSubmit = async (data) => {
    data.historyDocument = historyDocumentFields;
    setIsReady(false);
    setBtnSubmitDisabled(true);
    setAlert({ status: true, text: 'Cargando ...', color: 'blue-two' });
    if (typeActionForm === 'crear') {
      await createHistoryDates({
        ...data,
        doctorIdCreated: userData.id,
        patientId: patientDataComplete?.id,
        createdAt: moment().format('DD-MM-YYYY hh:mm:ss'),
      })
        .then((resp) => {
          setAlert({ status: true, text: resp?.message, color: 'green' });
          setHistoryCreatedId(resp.id);
          setTypeActionForm('editar');
          // setHistoryDatesDataComplete(data);
          getHistoryData();
          setBtnSubmitDisabled(false);
          setTimeout(() => setIsReady(true), 3000);
        })
        .catch((error) => {
          setAlert({ status: true, text: error?.message, color: 'red' });
          setBtnSubmitDisabled(false);
        });
    } else if (typeActionForm === 'editar') {
      await updateHistoryDatesById(historyCreatedId, data)
        .then((resp) => {
          setAlert({ status: true, text: resp?.message, color: 'green' });
          setHistoryDatesDataComplete(data);
          setBtnSubmitDisabled(false);
          setTimeout(() => setIsReady(true), 3000);
        })
        .catch((error) => {
          setAlert({ status: true, text: error?.message, color: 'red' });
          setBtnSubmitDisabled(false);
        });
    } else {
      setBtnSubmitDisabled(true);
    }
    setTimeout(
      () => setAlert({ status: false, text: '', color: 'blue-two' }),
      3000,
    );
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap" className="history-dates-format">
        <Container fluid>
          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            <>
              <Row>
                <Col xs="12" md="8" lg="8">
                  <p className="title">Formato historial de citas</p>
                </Col>
                <Col xs="6" md="2" lg="2" className="btn-column">
                  {historyCreatedId && isReady ? (
                    <PDFDownloadLink
                      document={(
                        <HistoryDatesPdf
                          data={historyDatesDataComplete}
                          patient={patientDataComplete?.general?.name}
                        />
                      )}
                      fileName={`${
                        patientDataComplete
                          ? `Bitácora de citas ${patientDataComplete.general.name}`
                          : 'Bitácora de citas'
                      }.pdf`}
                    >
                      {({ blob, loading }) => (loading || blob.size < 650 ? (
                        <Spinner />
                      ) : (
                        <Button color="" className="btn-custom">
                          <i className="icon-dowload" />
                          {'  Bitácora'}
                        </Button>
                      ))}
                    </PDFDownloadLink>
                  ) : (
                    <></>
                  )}
                </Col>
                <Col xs="6" md="2" lg="1" className="btn-column">
                  {historyCreatedId && isReady && (
                    <Button
                      className="btn-custom btn-edit"
                      color=""
                      onClick={() => toggleModal()}
                    >
                      Archivos
                    </Button>
                  )}
                </Col>
              </Row>
              <form className="history-form">
                <Row className="container-data">
                  {alert.status ? (
                    <CustomAlert text={alert.text} color={alert.color} />
                  ) : null}
                  <Col xs="12" md="12">
                    <p>
                      <strong>Paciente: </strong>
                      {patientDataComplete?.general?.name}
                    </p>
                  </Col>
                  <Col xs="12" md="6" lg="3">
                    <FormGroupPatient
                      name="historyData.responsable"
                      label="Responsable*"
                      placeHolder="Ingresar responsable"
                      type="text"
                      labelSize={12}
                      inputSize={12}
                      register={register}
                      errors={errors?.historyData?.responsable}
                    />
                  </Col>
                  <Col xs="12" md="6" lg="3">
                    <FormGroupPatient
                      name="historyData.treatment"
                      label="Tratamiento"
                      placeHolder="Ingresar tratamiento"
                      type="text"
                      labelSize={12}
                      inputSize={12}
                      required={false}
                      register={register}
                      errors={errors?.historyData?.treatment}
                    />
                  </Col>
                  <Col xs="12" className="title-field-array-column">
                    <p>
                      <strong>Ingresa un nuevo registro de terapia: </strong>
                    </p>
                    <Button
                      className="btn-custom"
                      color=""
                      type="button"
                      title="Añadir"
                      onClick={addHistoryRegister}
                    >
                      <i className="fa fa-plus" />
                    </Button>
                  </Col>
                  {historyRegisterFields.map((item, index) => (
                    <Fragment key={item.id}>
                      <Col xs="11" md="5" lg="3">
                        <FormGroupPatient
                          name={`historyRegister[${index}].date`}
                          label="Fecha*"
                          type="date"
                          placeHolder="yyyy-mm-dd"
                          minLength={10}
                          maxLength={10}
                          labelSize={12}
                          inputSize={12}
                          register={register}
                        />
                      </Col>
                      <Col xs="11" md="5" lg="3">
                        <FormGroupPatient
                          name={`historyRegister[${index}].price`}
                          label="Precio (mxn)*"
                          type="number"
                          min="0"
                          placeHolder="Introducir precio"
                          labelSize={12}
                          inputSize={12}
                          register={register}
                        />
                      </Col>
                      <Col xs="1" className="col-icon-delete">
                        <i
                          className="icon-delete"
                          title="Eliminar registro"
                          onClick={() => removeHistoryRegister(index)}
                          onKeyDown={() => removeHistoryRegister(index)}
                        />
                      </Col>
                      {screenWidth > 575 && <Col md="1" lg="5" />}
                    </Fragment>
                  ))}
                </Row>

                <Row>
                  <Col xs="12" className="title-field-array-column">
                    <p className="title">Formato constancia</p>
                    <Button
                      className="btn-custom"
                      color=""
                      type="button"
                      title="Añadir"
                      onClick={addHistoryDocument}
                    >
                      <i className="fa fa-plus" />
                    </Button>
                  </Col>
                </Row>
                <Row className="row container-data">
                  {historyDocumentFields.map((item, index) => (
                    <Fragment key={item.id}>
                      <Col xs="12" md="11" className="col-title-date">
                        <Label>{`Fecha de creación: ${item.date}`}</Label>
                      </Col>
                      <Col xs="12" md="11" className="col-editor">
                        <JoditEditor
                          name={`historyDocument[${index}].text`}
                          ref={item?.ref}
                          value={item.text}
                          config={configEditor}
                          tabIndex={index} // tabIndex of textarea
                          onBlur={(newContent) => {
                            setHistoryDocumentFields((prevState) => prevState.map((element) => {
                              if (element.id === item.id) {
                                element.text = newContent;
                              }
                              return element;
                            }));
                          }}
                        />
                      </Col>
                      <Col xs="1" className="col-icons-actions">
                        {/* {
                                isReady ? (
                                  <PDFDownloadLink
                                    document={<HistoryDatesDocumentPdf data={historyDatesDataComplete} index={index} patient={patientDataComplete?.general?.name} />}
                                    fileName={`${patientDataComplete ? `Constancia ${patientDataComplete.general.name}` : 'Constancia'}.pdf`}
                                  >
                                    {({
                                      blob, loading,
                                    }) => (loading || blob.size < 650 ? <Spinner /> : (
                                      <i
                                        className="icon-dowload"
                                        title="Descargar constancia"
                                      />
                                    ))}
                                  </PDFDownloadLink>
                                ) : <></>
                              } */}
                        <i
                          className="icon-delete"
                          title="Eliminar constancia"
                          onClick={() => removeHistoryDocument(item)}
                          onKeyDown={() => removeHistoryDocument(item)}
                        />
                      </Col>
                    </Fragment>
                  ))}
                </Row>
                <Row className="row container-data">
                  <Col xs="12" className="col-btn-action text-center">
                    <Button
                      className="btn-custom"
                      color=""
                      type="button"
                      disabled={btnSubmitDisabled}
                      onClick={handleSubmit(onSubmit)}
                    >
                      {typeActionForm === 'crear' ? 'Crear' : 'Actualizar'}
                    </Button>
                  </Col>
                  <Col xs="12" className="col-btn-action text-center">
                    {alert.status ? (
                      <CustomAlert text={alert.text} color={alert.color} />
                    ) : null}
                  </Col>
                </Row>
              </form>
            </>
          )}
        </Container>
        {historyCreatedId && isReady && (
          <HistoryFilesModalEdit
            show={modalIsOpen}
            close={toggleModal}
            data={historyDatesDataComplete || null}
            deleteOneFile={deleteOneFile}
            onDocFileChange={onDocFileChange}
            onSubmitFiles={onSubmitFiles}
          />
        )}
      </div>
    </>
  );
};

HistoryDatesFormat.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default authHOC(HistoryDatesFormat, [
  'Administrador',
  'Editor',
  'Colaborador',
]);
