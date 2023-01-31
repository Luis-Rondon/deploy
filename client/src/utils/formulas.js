/* eslint-disable no-else-return */
/* eslint-disable max-len */
import moment from 'moment';
import 'moment/locale/es';

export const getCorrectedWeeksOfGestation = (birthDate, currentDate, sg) => {
  const fechaActual = currentDate;
  const fechaNacimiento = birthDate;
  const semanasGestacion = parseInt(sg);

  const diaNacimiento = parseInt(moment(fechaNacimiento, 'YYYY-MM-DD').date());
  const mesNacimiento = parseInt(moment(fechaNacimiento, 'YYYY-MM-DD').month()) + 1;
  // const anioNacimiento = parseInt(moment(fechaNacimiento, 'YYYY-MM-DD').year());
  const diaActual = parseInt(moment(fechaActual, 'YYYY-MM-DD').date());
  let mesActual = parseInt(moment(fechaActual, 'YYYY-MM-DD').month()) + 1;
  // const anioActual = parseInt(moment(fechaActual, 'YYYY-MM-DD').year());

  let diasCronologicos = 0;
  let mesesCronologicos = 0;
  const aniosCronologicos = moment(fechaActual).diff(fechaNacimiento, 'years');
  // let aniosCronologicos = 0;
  let noAplica = false;
  if (mesNacimiento <= mesActual) {
    if (diaNacimiento <= diaActual) {
      diasCronologicos = diaActual - diaNacimiento;
      mesesCronologicos = mesActual - mesNacimiento;
    } else {
      const diferenciaDias = 30 - diaNacimiento;
      diasCronologicos = diaActual + diferenciaDias;
      mesActual -= 1;
      if (mesNacimiento <= mesActual) {
        mesesCronologicos = mesActual - mesNacimiento;
      } else {
        mesesCronologicos = mesActual + 12 - mesNacimiento;
      }
    }
    // aniosCronologicos = anioActual - anioNacimiento;
  } else {
    const diferenciaMeses = 12 - mesNacimiento;
    if (diaNacimiento <= diaActual) {
      diasCronologicos = diaActual - diaNacimiento;
      mesesCronologicos = mesActual + diferenciaMeses;
    } else {
      const diferenciaDias = 30 - diaNacimiento;
      diasCronologicos = diaActual + diferenciaDias;
      mesesCronologicos = mesActual + (diferenciaMeses - 1);
    }
    // aniosCronologicos = (anioActual - 1) - anioNacimiento;
  }
  if (mesesCronologicos < 0) mesesCronologicos = 0;
  const mesesReales = moment(fechaActual).diff(fechaNacimiento, 'months');
  const diasDeNacido = aniosCronologicos * 365 + mesesReales * 30 + diasCronologicos;

  const semanasFaltaban = 40 - semanasGestacion;
  let diasQuedan = 0;
  let mesesQuedan = 0;
  if (semanasFaltaban < 4) {
    diasQuedan = semanasFaltaban * 7;
  } else {
    mesesQuedan = Math.trunc(semanasFaltaban / 4);
    const semanasQuedan = semanasFaltaban % 4;
    diasQuedan = semanasQuedan * 7;
  }
  let mesesCorregidos = 0;
  let diasCorregidos = 0;
  // console.group('-EDAD CRONOLÓGICA-');
  // console.log(`${aniosCronologicos} a`);
  // console.log(`${mesesCronologicos} m`);
  // console.log(`${diasCronologicos} d`);
  // console.groupEnd('- END EDAD CRONOLÓGICA-');
  // console.group('-MESES QUEDAN-');
  // console.log(`${mesesQuedan} m`);
  // console.log(`${diasQuedan} d`);
  // console.groupEnd('- END MESES QUEDAN-');
  if (
    mesesQuedan <= mesesCronologicos
    || (aniosCronologicos > 0 && aniosCronologicos < 2)
  ) {
    // Cuando tienen más de un año de nacido y menos de dos
    if (diasQuedan <= diasCronologicos) {
      diasCorregidos = diasCronologicos - diasQuedan;
      mesesCorregidos = mesesCronologicos - mesesQuedan;
    } else {
      const diferenciaDias = 30 - diasQuedan;
      // console.log(`${diferenciaDias} diff dias`);
      diasCorregidos = diasCronologicos + diferenciaDias;
      // console.log(`${diasCorregidos} dias corregidos`);
      if (mesesCronologicos > mesesQuedan) {
        // Si tienen menos de un año de nacido
        mesesCorregidos = mesesCronologicos - mesesQuedan - 1;
      } else {
        // Si tienen más de un año de nacido
        mesesCorregidos = mesesCronologicos + 12 - mesesQuedan - 1;
        // aniosCronologicos -= 1;
      }
    }

    if (diasCorregidos >= 22) {
      // si se pasa de las 3 semanas por un día, se redondea a un mes
      diasCorregidos = 0;
      mesesCorregidos += 1;
    }
  } else {
    noAplica = true;
  }

  let edadCorregidaEnSemanas = aniosCronologicos * 52;
  let diasCorregidosQuedan = 0;
  if (noAplica) {
    edadCorregidaEnSemanas
      += semanasGestacion
      + Math.trunc(diasCronologicos / 7)
      + mesesCronologicos * 4;
    diasCorregidosQuedan = diasCronologicos % 7;
  } else {
    edadCorregidaEnSemanas += mesesCorregidos * 4;
    diasCorregidosQuedan = diasCorregidos;
    if (diasCorregidos >= 7) {
      edadCorregidaEnSemanas += Math.trunc(diasCorregidos / 7);
      diasCorregidosQuedan = diasCorregidos % 7;
    }
  }
  const results = {
    bornDays: diasDeNacido,
    chronoAge: {
      years: aniosCronologicos,
      months: mesesCronologicos,
      days: diasCronologicos,
    },
    leftTime: {
      months: mesesQuedan,
      days: diasQuedan,
    },
    correctedAge: {
      years: aniosCronologicos,
      months: mesesCorregidos < 0 ? 0 : mesesCorregidos,
      days: diasCorregidos,
    },
    correctedAgeInWeeks: {
      weeks: edadCorregidaEnSemanas,
      days: diasCorregidosQuedan,
    },
    notApply: noAplica,
  };
  return results;
};

export const flipDate = (date) => date.split('-').reverse().join('-');

export const getCurrentDateFull = () => moment().format('DD-MM-YYYY hh:mm:ss');

export const getCurrentDate = () => `${moment().year()}-${moment().month() + 1 < 10 ? 0 : ''}${
  moment().month() + 1
}-${moment().date() < 10 ? `0${moment().date()}` : moment().date()}`;

export const getCurrentYear = () => moment(getCurrentDate()).year();

export const getCurrentMonthNumber = () => `${moment(getCurrentDate()).month() + 1 < 10 ? 0 : ''}${
  moment(getCurrentDate()).month() + 1
}`;

export const getCurrentMonthYearText = () => moment().format('MMMM YYYY').toLocaleUpperCase();

export const getDayNumberByDate = (date) => moment(date).isoWeekday() - 1;

export const getDayNameByDate = (date) => moment(date).locale('es').format('dddd');

export const getMovementType = (correctedAgeWeeks) => {
  const totalWeeks = correctedAgeWeeks?.weeks + correctedAgeWeeks?.days / 7; // Math.trunc
  console.log(totalWeeks);
  if (totalWeeks >= 26 && totalWeeks < 38) {
    if (totalWeeks <= 31) return 'Mov. prematuro (N, PR)';
    if (totalWeeks <= 35) return 'Mov. prematuro (N, PR, CH)';
    return 'Mov. prematuro (N, PR, CS)';
  } else if ((totalWeeks >= 38 && totalWeeks <= 40) || totalWeeks < 9) {
    return 'Mov. writhing (N, PR, CS)';
  } else if (totalWeeks >= 9 && totalWeeks <= 22) {
    if (totalWeeks <= 15) return 'Fidgety (F, CS, AF, F-)';
    return 'Fidgety (CS, AF, F-)';
  } else if (totalWeeks >= 23 && totalWeeks < 25) {
    return 'Mov. Antigrav.';
  } else {
    return '';
  }
};

export const getEcoWeeksPrePost = (ecoWeeks) => {
  let weeksNumber;
  let type = '';
  if (ecoWeeks?.includes(' s pret')) {
    weeksNumber = ecoWeeks.split(' s ')[0].split(' ');
    type = 'pret';
  } else if (ecoWeeks?.includes(' s post')) {
    weeksNumber = ecoWeeks?.split(' s ')[0].split(' ');
    type = 'post';
  } else if (ecoWeeks?.split(', ')?.length === 2) {
    weeksNumber = ecoWeeks?.split(', ')[0].split(' ');
  }
  return {
    age: weeksNumber ? Number(weeksNumber[0]) : null,
    type,
  };
};
