import React, { useContext } from 'react'
import { Button } from 'reactstrap'
import {
  sendNotificationCreate,
  sendNotificationNewPatient,
  sendNotificationToAdmins,
  sendReminder,
  sendMultipleAppoiments
} from '../firebase/oneSignal'
//import UserData from '../context/UserData';

function Tests({ userData }) {
  //const { userData } = useContext(UserData)
  const patientName = 'Juan'
  const userId = userData.id
  return (
    <div>
      <Button onClick={() => sendNotificationToAdmins(userId, patientName, 'date')}>Send noti to admins</Button>
    </div>
  )
}

export default Tests;