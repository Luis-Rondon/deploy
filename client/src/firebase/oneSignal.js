/* eslint-disable no-async-promise-executor */
import OneSignal from 'react-onesignal';
import axios from 'axios';
import { getAdmins, getUserById } from '../actions/UserAction';
import { newFirebase } from './firebase'

const API_URL = 'https://fcm-api.jorgeluisduran.repl.co'

export const subscribeToTopic = async (topic, token, ...axiosParams) => {
  const res = await axios.post(`${API_URL}/subscribe`, {topic, token}, { ...axiosParams })
  return res
}

export const unSubscribeToTopic = async (topic, token, ...axiosParams) => {
  const res = await axios.post(`${API_URL}/unsubscribe`, {topic, token}, { ...axiosParams })
  return res
}

export const subscribeUser = async (userId, ...axiosParams) => {
  try {
    const token = await newFirebase.getToken()
    const res = await subscribeToTopic(userId, token, ...axiosParams)    
    return res
  } catch (error) {
    console.log(error)
  }
}

export const unSubscribeUser = async (userId, ...axiosParams) => {
  try {
    const token = await newFirebase.getToken()
    const res = await unSubscribeToTopic(userId, token, ...axiosParams) 
  return res.data    
  } catch (error) {
    console.error(error)
  }
} 

export const subscribeAllAdmins = async (...axiosParams) => {
  const token = await newFirebase.getToken()
  const admins = await getAdmins().then(ad => ad.data)
  console.log("ad", admins)
  return new Promise((resolve, reject) => {
      Promise.all(admins.map(async ({id}) => {
        const res = await subscribeToTopic('admin', token, ...axiosParams)
        return res
      }))
      .then(results => {
        resolve(true)
      })
      .catch(err => reject(err))
  })
}

export const unSubscribeAllAdmins = async (...axiosParams) => {
  const token = await newFirebase.getToken()
  const admins = await getAdmins()
  return new Promise((resolve, reject) => {
      Promise.all(admins.map( async (id) => {
        const res = await unSubscribeToTopic(id +'-admin', token, ...axiosParams)
        return res
      }))
      .then(results => {
        resolve(true)
      })
      .catch(err => reject(err))
  })
} 

let playerID = '';
export const getPlayerId = () => {
  return new Promise(async (resolve, reject) => {
    await OneSignal.getUserId()
      .then((data) => {
        playerID = data;
        resolve(playerID);
      })
      .catch(() => reject('error'));
  });
};

/*export const sendNotificationCreate = (userId, patientName, type) => {
  OneSignal.setExternalUserId();
  let text = 'Han cambiado tus horarios, entra para verificar.';
  return new Promise((resolve, reject) => {
    getUserById(userId)
      .then((userData) => {
        const { username } = userData.data;
        const user = userData.data;
        let arrayKeys = [];
        if (user?.oneSignalKeys) {
          const oneSignalKeys = Object.values(user.oneSignalKeys);
          arrayKeys = oneSignalKeys.map((item) => item.key);
          switch (type) {
            case 'date':
              text = `${username}, tienes una nueva cita con el paciente ${patientName}.`;
              break;
            case 'redate':
              text = `${username}, el horario de tu cita ha cambiado.`;
              break;
            case 'deleteDate':
              text = `${username}, una de tus citas se ha eliminado`;
              break;
            case 'reservation':
              text = `El usuario ${username} ha reservado un nuevo horario.`;
              break;
            default:
              break;
          }
          console.log('send notification to doctor');
          console.log(arrayKeys);
          // oneSignalApi.createNotification(text)
          axios
            .post(
              'https://onesignal.com/api/v1/notifications',
              {
                app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
                contents: {
                  en: text,
                  es: text,
                },
                headings: {
                  en: 'Entra a tu cuenta para verificar.',
                  es: 'Entra a tu cuenta para verificar.',
                },
                include_player_ids: arrayKeys,
              },
              {
                headers: {
                  Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
                },
              },
            )
            .then(() => {
              console.log('Notification send...');
              resolve();
            })
            .catch((error) => {
              console.log('Notification fail...');
              reject(error);
            });
        }
        resolve();
      })
      .catch(() => null);
  });
};
*/
export const sendNotificationCreate = async (userId, patientName, type) => {
     let text = 'Han cambiado tus horarios, entra para verificar.';
         const token = await newFirebase.getToken()
        await subscribeUser(userId)
  return new Promise((resolve, reject) => {
      getUserById(userId)
      .then((userData) => {
        const { username } = userData.data;
        const body = 'Entra a tu cuenta para verificar.'
        const user = userData.data;
                  switch (type) {
            case 'date':
              text = `${username}, tienes una nueva cita con el paciente ${patientName}.`;
              break;
            case 'redate':
              text = `${username}, el horario de tu cita ha cambiado.`;
              break;
            case 'deleteDate':
              text = `${username}, una de tus citas se ha eliminado`;
              break;
            case 'reservation':
              text = `El usuario ${username} ha reservado un nuevo horario.`;
              break;
            default:
              break;
          }
        
          console.log('send notification to doctor');
          axios.post(
            `${API_URL}/notifications`,
            {
              token,
              message: { notification: { title: text, body }, token, topic: userId }
            }
          )
          .then(() => {
              console.log('Notification send...');
              resolve();
            })
          .catch((error) => {
              console.log('Notification fail...');
              reject(error);
            });
      })
      .catch(() => null)
  })
}

/*
export const sendNotificationNewPatient = async (patientName) => {
  const text = `Se ha ingresado el nuevo paciente: ${patientName}.`;
  axios
    .post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
        contents: {
          en: text,
          es: text,
        },
        headings: {
          en: 'Entra a tu cuenta para ver el expediente completo.',
          es: 'Entra a tu cuenta para ver el expediente completo.',
        },
        included_segments: ['Active Users', 'Subscribed Users'],
      },
      {
        headers: {
          Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
        },
      },
    )
    .then(() => console.log('Notification send...'))
    .catch((error) => console.log('Notification fail...', error));
};
*/

export const sendNotificationNewPatient = async (patientName) => {
  try {
    const text = `Se ha ingresado el nuevo paciente: ${patientName}.`;
     const token = await newFirebase.getToken()
    const body = 'Entra a tu cuenta para ver el expediente completo.'
    await axios.post(
            `${API_URL}/notifications`,
            {
              token,
              message: { notification: { title: text, body }, token }
            }
        )
    console.log('Notification send...')
  } catch (error) {
    console.log('Notification fail...', error)
  }  
}


/*
export const sendNotificationTo= async (userId, patientName, type) => {
  let text = 'Se ha programado una cita. Entra para verificar.';
  const admins = await getAdmins();
  //const { username } = await getUserById(userId).then((user) => user.data);
  const username = "jorge"
  const arrayKeys = [];
  const setToken = (cond) => {};
  const token = await newFirebase.getToken(setToken)

  admins.data.forEach((admin) => {
    if (admin?.oneSignalKeys) {
      const oneSignalKeys = Object.values(admin.oneSignalKeys);
      oneSignalKeys.forEach((item) => {
        const key = item?.key;
        arrayKeys.push(key);
      });
    }
  });

  console.log('admins keys: ');
  console.log(arrayKeys);

  switch (type) {
    case 'date':
      text = `Se ha asignado una nueva cita a ${username} con el paciente ${patientName}`;
      break;
    case 'redate':
      text = '$Se ha cambiado el horario de una cita.';
      break;
    case 'deleteDate':
      text = 'Una de las citas se ha eliminado';
      break;
    case 'reservation':
      text = 'Se ha reservado un nuevo horario.';
      break;
    default:
      break;
  }
  
    if(admins.length > 0) {
     try {
      const res = await axios.post(
        'https://fcm-api.jorgeluisduran.repl.co/notifications',
        {
          admins,
          token,
          message: { title: text, body: 'test body', token }
        }
      )
     console.log('Notification send...');
    } catch(error) {
          console.log('Notification fail...', error);
      };
  }
  return new Promise((resolve, reject) => {
    if (arrayKeys.length > 0) {
      axios
        .post(
          'https://onesignal.com/api/v1/notifications',
          {
            app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
            contents: {
              en: text,
              es: text,
            },
            headings: {
              en: 'Entra a tu cuenta para verificar.',
              es: 'Entra a tu cuenta para verificar.',
            },
            include_player_ids: arrayKeys,
          },
          {
            headers: {
              Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
            },
          },
        )
        .then(() => {
          console.log('Notification send...');
          resolve();
        })
        .catch((error) => {
          console.log('Notification fail...', error);
          reject(error);
        });
    }
    resolve();
  }); 
  
};
*/

export const sendNotificationToAdmins = async (userId, patientName, type) => {
      try {
        let text = 'Se ha programado una cita. Entra para verificar.';
        const { username } = await getUserById(userId).then((user) => user.data);
        const token = await newFirebase.getToken();
        const admins = await getAdmins().then(ad => ad.data)
        console.log("snta", admins)
        await subscribeAllAdmins()
        const body = 'Entra a tu cuenta para verificar.';

        switch (type) {
            case 'date':
              text = `Se ha asignado una nueva cita a ${username} con el paciente ${patientName}`;
              break;
            case 'redate':
              text = '$Se ha cambiado el horario de una cita.';
              break;
            case 'deleteDate':
              text = 'Una de las citas se ha eliminado';
              break;
            case 'reservation':
              text = 'Se ha reservado un nuevo horario.';
              break;
            default:
              break;
        }

    Promise.all(admins.map(async ({id}) => {
            const res = await axios.post(
            `${API_URL}/notifications`,
            {
              admins,
              token,
              message: { notification: { title: text, body }, token, topic: 'admin' }
            }
          )
          return res;
      })
    )
      } catch (error) {
         console.log(error)   
      }
      
}

export const sendReminder = async (userId, frequency, timestamp = 0) => {
    try {
       const token = await newFirebase.getToken()
      await subscribeUser(userId)
    const text = 'Tu proxima cita es en menos de 15 minutos';
    const body = 'Entra a tu cuenta para ver el expediente completo.'
    await axios.post(
            `${API_URL}/sendReminder`,
            {
              timestamp: new Date(timestamp),
              token,
              message: { notification: { title: text, body }, token, topic: userId }
            }
        )
    console.log('Notification send...')
  } catch (error) {
    console.log('Notification fail...', error)
  }  
}

export const sendMultipleAppoiments = async (id, patientName, type) => {
  sendNotificationCreate(id, patientName, type)
    .then(() => {
      setTimeout(sendNotificationToAdmins, 1000, id, patientName, type);
    });
};


/*
export const sendReminder = async (userId, frequency, timestamp = 0) => {
  // timestamp = timestamp 12;
  OneSignal.setExternalUserId();
  const text = 'Tu proxima cita es en menos de 15 minutos';
  getUserById(userId)
    .then((userData) => {
      // const { username } = userData.data;
      const user = userData.data;
      let arrayKeys = [];
      if (user?.oneSignalKeys) {
        const oneSignalKeys = Object.values(user.oneSignalKeys);
        arrayKeys = oneSignalKeys.map((item) => item.key);
      }
      return arrayKeys;
    })
    .then((keys) => {
      Promise.all(
        keys.map((key) => {
          const options = {
            method: 'PUT',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
              tags: {
                reminder: timestamp,
                lastCita: 0,
                // lastAppointment:
              },
            }),
          };

          return fetch(`https://onesignal.com/api/v1/players/${key}`, options)
            .then((response) => response.json())
            .catch((err) => console.error(err));
        }),
      )
        .then(() => {
          return axios.post(
            'https://onesignal.com/api/v1/notifications',
            {
              app_id: process.env.REACT_APP_ONE_SIGNAL_APP_ID,
              contents: {
                en: text,
                es: text,
              },
              headings: {
                en: 'Entra a tu cuenta para verificar.',
                es: 'Entra a tu cuenta para verificar.',
              },
              filters: [
                {
                  field: 'tag',
                  key: 'reminder',
                  relation: 'time_elapsed_gt',
                  value: '-900',
                },
              ],
            },
            {
              headers: {
                Authorization: `Basic ${process.env.REACT_APP_ONE_SIGNAL_API_REST}`,
              },
            },
          );
        })
        .then(() => console.log('Notification send...'))
        .catch(() => console.log('Notification fail...'));
    });
};
*/
