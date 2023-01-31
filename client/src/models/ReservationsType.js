import { getCurrentDate } from '../utils/formulas';

export const ReservationsType = {
  doctorIdAssigned: '',
  date: getCurrentDate(),
  schedule: 'todo el día',
  isCompleteDay: true,
  reason: '',
  timestamp: '',
};
