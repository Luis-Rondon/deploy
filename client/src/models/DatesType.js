import { getCurrentDate } from '../utils/formulas';

export const DatesType = {
  doctorIdCreated: '',
  doctorIdAssigned: '',
  doctorIdLastUpdate: '', // al actualizar la cita
  date: getCurrentDate(), // fecha de la cita
  startDate: getCurrentDate(), // fecha de la primera cita regular -> Solo para el frente
  schedule: '',
  reason: '',
  patientId: '',
  patientName: '',
  timestamp: '',
  isFirstDate: false,
  arrivedState: 'Sin confirmar',
  reasonNotArrived: '',
  frecuency: '', // 4 - 20 semanas
  uuidDateGroup: '', // id único de cada grupo de citas
  dateNumberGroup: '', // Número secuencial de las citas creadas con formato: number 1...n
  dateTotalGroup: '', // Número total de citas creadas en el grupo: number
  updatealldates: 'no',
  weekDates: [
    { day: { value: 0, name: 'Lunes' }, doctorIdAssigned: '', schedule: '' },
    { day: { value: 1, name: 'Martes' }, doctorIdAssigned: '', schedule: '' },
    {
      day: { value: 2, name: 'Miércoles' },
      doctorIdAssigned: '',
      schedule: '',
    },
    { day: { value: 3, name: 'Jueves' }, doctorIdAssigned: '', schedule: '' },
    { day: { value: 4, name: 'Viernes' }, doctorIdAssigned: '', schedule: '' },
    { day: { value: 5, name: 'Sábado' }, doctorIdAssigned: '', schedule: '' },
  ],
  // [{ day: number, doctorIdAssigned: string }] // day 1-6, doctorIdAssigned
};

// NOTA: SUMAR UN NÚMERO CONSECUTIVO Y UN UUID DEL GRUPO PARA ELIMINAR
