/* eslint-disable no-console */
import moment from 'moment';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { newFirebase } from '../firebase/firebase';
import { getCurrentMonthNumber, getCurrentYear } from '../utils/formulas';
import { getAllUsersOptionsSearch } from './UserAction';

// const patientCollectionToModify = 'BackupPatientValorations';
// const patientCollectionToModify = 'BackupPatientValoration';
const patientCollectionToModify = 'PatientValoration';

export const createPatientValoration = (userData) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get()
      .then((querySnapshot) => {
        const lastItem = querySnapshot.docs.map((item) => item.data());
        let newNumber = 1;
        if (lastItem.length !== 0) newNumber = parseInt(lastItem[0].number) + 1;

        // crear folio por defecto
        const year = getCurrentYear().toString().substr(2, 2);
        const month = getCurrentMonthNumber().toString();
        let currentNumber = '001';
        if (lastItem.length && lastItem[0].folio) {
          const dates = lastItem[0].folio.split('-');
          if (
            year === dates[0].substr(0, 2)
            && month === dates[0].substr(2, 2)
          ) {
            currentNumber = (Number.parseInt(dates[1]) + 1).toString();
            currentNumber = currentNumber.length > 1
              ? `0${currentNumber}`
              : `00${currentNumber}`;
          }
        }
        const folio = `${year}${month}-${currentNumber}`;

        newFirebase.db
          .collection(patientCollectionToModify)
          .add({
            number: newNumber,
            timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            folio,
            ...userData,
          })
          .then((docRef) => {
            resolve({ message: 'Registro creado con éxito', docRef });
          })
          .catch(() => {
            reject({
              message: 'Por el momento no fue posible crear el registro',
            });
          });
      })
      .catch(() => {
        reject({ message: 'Ha ocurrido un error desconocido' });
      });
  });
};

// Obtener los pacientes activos
export const getPatientValorations = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .where('status', '==', 'active')
      .get()
      .then((querySnapshot) => {
        const createData = querySnapshot.docs.map((item) => {
          return { id: item.id, ...item.data() };
        });
        const data = createData.sort((a, b) => {
          return a.timestamp - b.timestamp;
        });
        resolve({
          data,
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de los pacientes',
        });
      });
  });
};

// Obtener los pacientes activos y los dados de alta
export const getPatientValorationsComplete = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .orderBy('timestamp')
      .get()
      .then((querySnapshot) => {
        getAllUsersOptionsSearch()
          .then((resp) => {
            const users = resp;
            const data = querySnapshot.docs.map((item) => {
              const register = item.data();
              if (!register.createdAt) {
                register.createdAt = moment(register.timestamp.toDate()).format(
                  'DD-MM-YYYY hh:mm:ss',
                );
              }
              return { id: item.id, ...register };
            });
            data.forEach((register) => {
              const doctor = users.find((user) => {
                const doctorIdRegistered = register.observations?.doctorIdAssigned || '';
                return user.value === doctorIdRegistered;
              });
              register.doctorAssigned = doctor || '';
            });
            resolve({
              data,
            });
          })
          .catch((error) => console.log(error));
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de los pacientes',
        });
      });
  });
};

// Obtener los pacientes activos
export const getPatientValorationsByYearMonthStatus = (year, month, status) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .where('status', '==', status)
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .filter((item) => {
            const date = item.general.consultDate.split('-');
            return date[0] === year && date[1] === month;
          })
          .sort((a, b) => {
            return a.timestamp - b.timestamp;
          });
        resolve({
          data,
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de los pacientes',
        });
      });
  });
};

export const getPatientByNameOptionsSearch = (name) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .where('general.name', '<', name.toLowerCase())
      .orderBy('general.name')
      .get()
      .then((querySnapshot) => {
        const dataComplete = querySnapshot.docs.filter(
          (item) => item.data().status === 'active',
        );
        resolve(
          dataComplete.map((item) => ({
            value: item.id,
            name: item.data().general.name,
          })),
        );
      })
      .catch(() => {
        reject({ value: '', name: 'Por el momento no se pueden obtener' });
      });
  });
};

export const getAllPatientsOptionsSearch = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .orderBy('general.name')
      .get()
      .then((querySnapshot) => resolve(
        querySnapshot.docs.map((item) => ({
          value: item.id,
          name: item.data().general.name,
        })),
      ))
      .catch(() => {
        reject({ value: '', name: 'Por el momento no se pueden obtener' });
      });
  });
};

export const getPatientValorationById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(id)
      .get()
      .then(async (querySnapshot) => {
        let neuroMonitoring = [];
        if (querySnapshot.data()?.neuroMonitoring) {
          const objectToArray = Object.values(
            querySnapshot.data().neuroMonitoring,
          );
          neuroMonitoring = objectToArray.map((neuroItem) => {
            if (!neuroItem.createdAt) {
              neuroItem.createdAt = moment(neuroItem.timestamp.toDate()).format(
                'DD-MM-YYYY hh:mm:ss',
              );
            }
            return neuroItem;
          });
        }
        resolve({
          data: {
            id: querySnapshot.id,
            ...{
              ...querySnapshot.data(),
              createdAt: moment(querySnapshot.data().timestamp.toDate()).format(
                'DD-MM-YYYY hh:mm:ss',
              ),
              neuroMonitoring,
            },
          },
        });
      })
      .catch((err) => {
        console.log(err);
        reject({ message: 'No se pudo obtener la información del paciente.' });
      });
  });
};

export const updatePatientValorationById = (id, data) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(id)
      .set(data, { merge: true })
      .then(() => {
        resolve({
          message: 'Registro actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el Registro',
        });
      });
  });
};

// eslint-disable-next-line max-len
export const deleteFilePropertyFromPatientValorationById = (
  idPatientRegister,
  idMonitoring,
  idFile,
  type,
) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(idPatientRegister)
      .update({
        [`neuroMonitoring.${idMonitoring}.${type}Files.${idFile}`]:
          newFirebase.firestore.FieldValue.delete(),
      })
      .then(() => {
        resolve({
          message: 'Registro actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el Registro',
        });
      });
  });
};

export const deletePatientValorationById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(id)
      .delete()
      .then(() => {
        resolve({
          message: 'Registro eliminado con éxito',
        });
      })
      .catch(() => {
        reject({ message: 'Error al eliminar el registro, intenta más tarde' });
      });
  });
};

// Dar de alta un paciente
export const freePatientValorationById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(id)
      .set({ status: 'free' }, { merge: true })
      .then(() => {
        resolve({
          message: 'Paciente dado de alta con éxito.',
        });
      })
      .catch(() => {
        reject({
          message:
            'Error al dar de alta al paciente. Por favor, intenta más tarde.',
        });
      });
  });
};

// Dar de alta un paciente
export const stopPatientValorationById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(id)
      .set({ status: 'suspended' }, { merge: true })
      .then(() => {
        resolve({
          message: 'Paciente suspendido con éxito.',
        });
      })
      .catch(() => {
        reject({
          message:
            'Error al suspender al paciente. Por favor, intenta más tarde.',
        });
      });
  });
};

// obtener los monitoreos de un paciente por el id de la valoración
export const getMonitoringPatientById = (id) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(id)
      .get()
      .then((querySnapshot) => {
        resolve({
          data: querySnapshot.data().neuroMonitoring,
        });
      })
      .catch(() => {
        reject({
          message: 'Error al obtener el registro',
        });
      });
  });
};

// Crear un nuevo monitoreo
export const pushMonitoringPatientValorationById = (id, data) => {
  return new Promise((resolve, reject) => {
    // obtener el anterior para insertar el número que corresponde.
    getMonitoringPatientById(id).then(() => {
      newFirebase.db
        .collection(patientCollectionToModify)
        .doc(id)
        .get()
        .then((querySnapshot) => {
          // obtener la data del paciente
          let neuroItems = [];
          if (querySnapshot.data().neuroMonitoring) {
            neuroItems = Object.values(querySnapshot.data().neuroMonitoring)
              .sort((a, b) => {
                return a.number - b.number;
              })
              .reverse();
          }
          // calcular el nuevo numero
          let newNumber = 1;
          if (neuroItems.length) {
            newNumber = parseInt(neuroItems[0].number) + 1;
          }
          const idNewRegister = uuidv4();
          return newFirebase.db
            .collection(patientCollectionToModify)
            .doc(id)
            .update({
              [`neuroMonitoring.${idNewRegister}`]: {
                ...data,
                timestamp: newFirebase.firestore.FieldValue.serverTimestamp(),
                idRegister: idNewRegister,
                number: newNumber,
              },
            });
        })
        .then(() => {
          resolve({
            message: 'Registro añadido exitosamente',
          });
        })
        .catch((error) => {
          console.log(error);
          reject({
            message: 'Error al añadir el registro',
          });
        });
    });
  });
};

// Actualizar monitoreo del paciente completo
export const updateMonitoringPatientValorationById = (
  idPatientValoration,
  data,
) => {
  const idNeuroMonitoringRegister = data.idRegister;
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(idPatientValoration)
      .update({
        [`neuroMonitoring.${idNeuroMonitoringRegister}`]: {
          ...data,
        },
      })
      .then(() => {
        resolve({
          message: 'Registro actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el Registro creado exitosamente',
        });
      });
  });
};

// Actualizar (patch) monitoreo del paciente por el id del paciente y el id del monitoreo
export const updateMonitoringPatientValorationByTwoId = (
  idPatient,
  idMonitoring,
  data,
) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(idPatient)
      .set(
        {
          neuroMonitoring: {
            [idMonitoring]: {
              ...data,
              // imageFiles: newFirebase.firestore.FieldValue.delete(),
              // videoFiles: newFirebase.firestore.FieldValue.delete(),
              // documentFiles: newFirebase.firestore.FieldValue.delete(),
            },
          },
        },
        { merge: true },
      )
      .then(() => {
        resolve({
          message: 'Registro actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el Registro creado exitosamente',
        });
      });
  });
};

// eslint-disable-next-line max-len
export const deleteMonitoringPatientValorationById = (
  idPatientValoration,
  idNeuroMonitoringRegister,
) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(idPatientValoration)
      .update({
        [`neuroMonitoring.${idNeuroMonitoringRegister}`]:
          newFirebase.firestore.FieldValue.delete(),
      })
      .then(() => {
        resolve({
          message: 'Seguimiento eliminado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'No fue posible eliminar el seguimiento',
        });
      });
  });
};

export const uploadProfilePic = (profilePic) => {
  return new Promise((resolve, reject) => {
    const newName = Math.floor(Math.random() * (50 - 0)) + 0 + profilePic.name;
    const storageRef = newFirebase.storage.ref(
      `/profile_pictures_patient/${newName}`,
    );
    const uploadTask = storageRef.put(profilePic);
    // eslint-disable-next-line no-unused-vars
    uploadTask.on(
      'state_changed',
      () => {},
      () => {
        reject({ message: 'Ha ocurrido un error al guardar la imagen' });
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          resolve({
            imageName: newName,
            downloadURL,
            message: 'Imagen actualizada con éxito',
          });
        });
      },
    );
  });
};

export const deleteProfilePicByName = (imageName) => {
  return new Promise((resolve, reject) => {
    const storageRef = newFirebase.storage.ref();
    const desertRef = storageRef.child(`profile_pictures_patient/${imageName}`);
    desertRef
      .delete()
      .then(() => {
        resolve({ message: 'Imagen anterior borrada exitosamente' });
      })
      .catch(() => {
        reject({
          message:
            'El registro no tenía imagen de perfil previa, se usará la nueva.',
        });
      });
  });
};

export const uploadOneMonitoringFiles = (file, type, setState) => {
  // types are videos, documents or images
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line max-len
    const newName = new Date().toISOString()
      + new Date().getTime()
      + (Math.floor(Math.random() * (50 - 0)) + 0)
      + file.name;
    const uploadTask = newFirebase.storage
      .ref()
      .child(`/monitoring/${type}/${newName}`)
      .put(file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (setState) {
          setState(progress);
          if (progress === 100) {
            setState(0);
          }
        }
      },
      () => {
        reject({ message: 'Ho ocurrido un error al subir el archivo' });
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          resolve({
            originalName: file.name,
            fileName: newName,
            fileUrl: downloadURL,
          });
        });
      },
    );
    // uploadTask.then(() => {
    //   uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
    //     resolve({
    //       originalName: file.name,
    //       fileName: newName,
    //       fileUrl: downloadURL,
    //     });
    //   });
    // })
    //   .catch(() => reject({ message: 'Ho ocurrido un error al subir el archivo' }));
  });
};

export const uploadMultipleFiles = (fileList, type, setState = () => null) => {
  // types are videos, documents or images
  return new Promise((resolve, reject) => {
    const promises = [];
    fileList.forEach((file) => {
      promises.push(uploadOneMonitoringFiles(file, type, setState));
    });
    Promise.all(promises)
      .then((results) => {
        const objectCreated = results.reduce((result, item) => {
          result[uuidv4()] = item;
          return result;
        }, {});
        resolve(objectCreated);
      })
      .catch((error) => {
        console.log(error);
        reject({ message: 'Ho ocurrido un error al subir los archivos' });
      });
  });
};

export const deleteOneMonitoringFiles = (file, type) => {
  // types are videos, documents or images
  return new Promise((resolve, reject) => {
    const storageRef = newFirebase.storage.ref();
    const desertRef = storageRef.child(`/monitoring/${type}/${file.fileName}`);
    desertRef
      .delete()
      .then(() => {
        resolve({ message: 'Archivo borrado' });
      })
      .catch(() => {
        reject({ message: 'Ho ocurrido un error al eliminar el archivo' });
      });
  });
};

export const deleteMultipleFiles = (fileList, type) => {
  // types are videos, documents or images
  return new Promise((resolve, reject) => {
    const promises = [];
    fileList.forEach((file) => {
      promises.push(deleteOneMonitoringFiles(file, type));
    });
    Promise.all(promises)
      .then((resultList) => {
        resolve(resultList);
      })
      .catch(() => reject({ message: 'Ha ocurrido un error al eliminar los archivos' }));
  });
};

// Obtener los pacientes activos y los dados de alta
export const getAllYearRange = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .orderBy('general.consultDate')
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        const less = parseInt(data[0].general.consultDate.split('-')[0]);
        const bloss = parseInt(
          data[data.length - 1].general.consultDate.split('-')[0],
        );
        const years = [];
        for (let i = less; i <= bloss; i += 1) {
          years.push({ name: i.toString(), value: i.toString() });
        }
        resolve(years);
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de los pacientes',
        });
      });
  });
};

uploadOneMonitoringFiles.propTypes = {
  file: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['videos', 'documents', 'images']),
};

uploadMultipleFiles.propTypes = {
  file: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['videos', 'documents', 'images']),
};

deleteOneMonitoringFiles.propTypes = {
  file: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['videos', 'documents', 'images']),
};

deleteMultipleFiles.propTypes = {
  file: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['videos', 'documents', 'images']),
};

// AL PASAR A PRODUCCIÓN ---------------------------------------------------------------------------

// Obtener los pacientes activos y los dados de alta
export const getPrueba = () => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .get()
      .then((querySnapshot) => {
        const data = querySnapshot.docs.map((item) => {
          return { id: item.id, ...item.data() };
        });
        resolve({
          data,
        });
      })
      .catch(() => {
        reject({
          message:
            'Por el momento no es posible obtener la información de los pacientes',
        });
      });
  });
};

export const setIsFreeTrueAllPatients = () => {
  getPrueba()
    .then((result) => {
      for (let i = 0; i < result.data.length; i += 1) {
        newFirebase.db
          .collection(patientCollectionToModify)
          .doc(result.data[i].id)
          .set({ status: 'active' }, { merge: true })
          .then(() => {
            console.log('actualizado');
          })
          .catch(() => {
            console.log('No actualizado');
          });
      }
    })
    .catch(() => {});
};

export const createBackupPatientValoration = () => {
  getPrueba()
    .then((result) => {
      for (let i = 0; i < result.data.length; i += 1) {
        delete result.data[i].id;
        newFirebase.db
          .collection('BackupPatientValorations')
          .add({
            ...result.data[i],
          })
          .then(() => {
            console.log({ message: `Registro creado con éxito ${i + 1}` });
          })
          .catch(() => {
            console.log({
              message: 'Por el momento no fue posible crear el registro',
            });
          });
      }
    })
    .catch((error) => console.log(error));
};

export const changeMonitoringDocStructure = () => {
  getPrueba()
    .then((result) => {
      console.log(result.data.length);
      for (let i = 0; i < result.data.length; i += 1) {
        // Todos los registros
        const idPaciente = result.data[i].id;
        console.log('ID registro paciente: ', idPaciente);
        const monitoring = result.data[i].neuroMonitoring; // Neuroseguimiento
        if (monitoring) {
          Object.keys(monitoring).forEach((neuroItemKey, j) => {
            const idMonitoring = monitoring[neuroItemKey].idRegister;
            console.log(`ID seguimiento ${j + 1} paciente: ${idMonitoring}`);
            const newData = {
              imageFiles: {},
              videoFiles: {},
              documentFiles: {},
            };
            if (monitoring[neuroItemKey].images) {
              monitoring[neuroItemKey].images.forEach((item) => {
                newData.imageFiles = {
                  ...newData.imageFiles,
                  [uuidv4()]: {
                    ...item,
                    originalName: item.fileName,
                  },
                };
              });
            }
            if (monitoring[neuroItemKey].videos) {
              monitoring[neuroItemKey].videos.forEach((item) => {
                newData.videoFiles = {
                  ...newData.videoFiles,
                  [uuidv4()]: {
                    ...item,
                    originalName: item.fileName,
                  },
                };
              });
            }
            if (monitoring[neuroItemKey].documents) {
              monitoring[neuroItemKey].documents.forEach((item) => {
                newData.documentFiles = {
                  ...newData.documentFiles,
                  [uuidv4()]: {
                    ...item,
                    originalName: item.fileName,
                  },
                };
              });
            }
            updateMonitoringPatientValorationByTwoId(
              idPaciente,
              idMonitoring,
              newData,
            )
              .then(() => console.log('si'))
              .catch(() => console.log('no'));
          });
        }
      }
    })
    .catch((error) => console.log(error));
};

export const updatePatientIndicatorCheck = (
  idPatient,
  indicator,
  indicatorId,
  score,
) => {
  return new Promise((resolve, reject) => {
    newFirebase.db
      .collection(patientCollectionToModify)
      .doc(idPatient)
      .set(
        {
          indicatorCheckForm: indicator,
          indicatorCheckFormId: indicatorId,
          scoreEvaluationForm: score,
        },
        { merge: true },
      )
      .then(() => {
        resolve({
          message: 'Registro actualizado exitosamente',
        });
      })
      .catch(() => {
        reject({
          message: 'Error al actualizar el Registro creado exitosamente',
        });
      });
  });
};

export const onlyHaveControl = (item) => {
  if (item.control && !item.description && !item.exploration && !item.reassessment && !item.cxObjetives) {
    return true;
  }
  return false;
};
