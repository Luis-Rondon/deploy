import { getCurrentDate } from '../utils/formulas';

export const patientModel = {
  profile_pic_url: '',
  profile_pic_name: '',
  number: 0,
  folio: '', // 2106-01
  timestamp: '',
  // createdAt: '', only for local
  createdBy: '', // idUser
  doctorIdAssigned: '',
  doctorIdAssignedName: '', // only for local
  isFree: false,
  status: 'active', // active, free, suspended
  useNewForm: true, // usa los nuevos formularios de valoración
  indicatorCheckForm: '', // Valor Seleccionado de los dos formularios de valoración
  indicatorCheckFormId: '', // Id del valor Seleccionado de los dos formularios de valoración
  scoreEvaluationForm: '', // Puntuación del formulario
  general: {
    name: '',
    consultDate: getCurrentDate(),
    birthDate: getCurrentDate(),
    ageApprox: '',
    sg: '',
    size: '',
    pc: '',
    eCron: '',
    dn: '',
    eco: '',
    ecoWeeks: '',
    leftTime: '',
    weight: '',
    lastFoodTime: '',
    temperature: '30',
    sex: '', // m, f
    spo2: '',
    fc: '',
    apgar: '',
    silverman: '',
  },
  contactInformation: {
    address: '',
    phoneNumber: '',
    rfc: '',
    email: '',
    fatherName: '',
    fatherProffesion: '',
    fatherAge: '',
    motherName: '',
    motherProffesion: '',
    motherAge: '',
  },
  background: {
    family: '',
    nonPathologicalStaff: '',
    pathologicalStaff: '',
    currentBehavior: '',
    // backgroundTypes: [
    //   { text: '', type: 'antecedente alarmante'}
    // ],
    backgroundTypes: [],
    staysLonger: [
      { name: 'Portabebé', value: false },
      { name: 'Hamaca', value: false },
      { name: 'Brincolín', value: false },
      { name: 'Andador', value: false },
      { name: 'Brazos', value: false },
      { name: 'Cama', value: false },
      { name: 'Cuna/Corral', value: false },
      { name: 'Piso especial', value: false },
      { name: 'Rebozo', value: false },
      { name: 'Cangurera', value: false },
      { name: 'Periquera', value: false },
      { name: 'Carriola', value: false },
      { name: 'Silla especial', value: false },
      { name: 'Bipedestador', value: false },
      { name: 'Fular', value: false },
      { name: 'Cojín antireflujo', value: false },
      { name: 'Almohada especial', value: false },
    ],
    staysLongerOther: '',
  },
  otherVariables: {
    description: '',
    fetalMotherPresentation: '',
    fetalMovements: '',
    firstImpression: '',
    anotherTx: '',
    mainConcern: '',
    highPattern: '',
    nextSkill: '',
    indicators: [
      { name: 'H', value: false },
      { name: 'AF', value: false },
      { name: 'F-', value: false },
      { name: 'CH', value: false },
      { name: 'CS', value: false },
      { name: 'PR', value: false },
      { name: 'F', value: false },
      { name: 'N', value: false },
    ],
    physicalResponses: [
      {
        name: 'Fluido',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
      {
        name: 'Variable',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
      {
        name: 'Amplitud',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
      {
        name: 'Monótono',
        statusOneName: 'Ausente',
        statusOneValue: false,
        statusTwoName: 'Presente',
        statusTwoValue: false,
      },
      {
        name: 'Empuñamiento',
        statusOneName: 'Ausente',
        statusOneValue: false,
        statusTwoName: 'Presente',
        statusTwoValue: false,
      },
      {
        name: 'Rígido',
        statusOneName: 'Ausente',
        statusOneValue: false,
        statusTwoName: 'Presente',
        statusTwoValue: false,
      },
      {
        name: 'Temblores',
        statusOneName: 'Ausente',
        statusOneValue: false,
        statusTwoName: 'Presente',
        statusTwoValue: false,
      },
      {
        name: 'Excitación',
        statusOneName: 'Ausente',
        statusOneValue: false,
        statusTwoName: 'Presente',
        statusTwoValue: false,
      },
      {
        name: 'Rotación tronco',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
      {
        name: 'Rotación Cefálica',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
      {
        name: 'Seguimiento Visual',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
      {
        name: 'Simétrico',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
      {
        name: 'Enderezamiento',
        statusOneName: 'Presente',
        statusOneValue: false,
        statusTwoName: 'Ausente',
        statusTwoValue: false,
      },
    ],
  },
  medicines: {
    currents: '',
    mother: '',
  },
  observations: {
    headFace: '',
    chest: '',
    armsHands: '',
    abodemnGenitals: '',
    hipKneesFeet: '',
    spine: '',
    constantNoDynamicPatterns: '',
    constantSpontaneousPatterns: '',
    mainTrouble: '',
    neurobehavioralResponse: '',
    txPlan: '',
    nextHab: '',
    txPerWeek: '',
    studies: '',
    canalization: '',
    conduct: {
      stateOfAlert: {
        title: 'Estado de alerta',
        selectedValue: -1,
        indicadores: [
          {
            text: 'No se le puede despertar',
            value: 1,
          },
          {
            text: 'Letárgico/a',
            value: 2,
          },
          {
            text: 'Somnoliento/a. pero se despierta fácilmente',
            value: 3,
          },
          {
            text: 'Despierto/a pero no muestra interés',
            value: 4,
          },
          {
            text: 'Pierde el interés',
            value: 5,
          },
          {
            text: 'Alerta, mantiene el interés',
            value: 6,
          },
        ],
        comments: '',
      },
      emotionalState: {
        title: 'Estado emocional',
        selectedValue: -1,
        indicadores: [
          {
            text: 'Irritable, no se le puede consolar',
            value: 1,
          },
          {
            text: 'Irritable, puede ser consolado por la madre',
            value: 2,
          },
          {
            text: 'Se muestra irritable cuando nos acercamos',
            value: 3,
          },
          {
            text: 'Indiferente',
            value: 4,
          },
          {
            text: 'Alegre, sonrie, balbucea',
            value: 5,
          },
          {
            text: 'Atento, con buena interacción',
            value: 6,
          },
        ],
        comments: '',
      },
      sociability: {
        title: 'Sociabilidad',
        selectedValue: -1,
        indicadores: [
          {
            text: 'Evita el contacto',
            value: 1,
          },
          {
            text: 'Inseguro, vacila cuando nos aproximamos',
            value: 2,
          },
          {
            text: 'Acepta el contacto',
            value: 3,
          },
          {
            text: 'Sociable solo con los padres',
            value: 4,
          },
          {
            text: 'Sociable con las demás personas',
            value: 5,
          },
          {
            text: 'Permite ser explorado',
            value: 6,
          },
        ],
        comments: '',
      },
    },
  },
  references: {
    reasonForConsultation: '',
    referredBy: '',
    referredByOther: '',
  },
  form12weeks: '',
  //  neuroMonitoring: {
  //     [key]: {
  //         number: '',
  //         date: '',
  //         eco: '',
  //         result: '',
  //         weight: '',
  //         control: '',
  //         description: '',
  //         videos: [],
  //         images: [],
  //         documents: []
  //     }
  // }
  // neuroMonitoring: {
  //   [key]: {
  //     number: '',
  //     date: '',
  //     eco: '',
  //     result: '',
  //     weight: '',
  //     control: '',
  //     description: '',
  //     videos: {
  //       [id]: {
  //         originalName: ''
  //         fileName: '',
  //         fileUrl: ''
  //       }
  //     },
  //     images: [],
  //     documents: []
  //   }
  // }
};
