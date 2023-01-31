// estatus -> Indica el color: 0 = negro, 1 = verde, 2 = rojo
export const GeneralMovementsType = {
  id: '',
  patientId: '', // Cuando es del formulario de valoración
  neuroMonitoringId: '', // Cuando es del formulario de neuroseguimiento
  neuroMonitoringPatientId: '', // Cuando es del formulario de neuroseguimiento
  doctorIdCreated: '',
  timestamp: '',
  createdAt: '',
  updatedAt: '',
  puntuacionOptimalidad: 0,
  puntuacionesParciales: {
    extremidadesSuperiores: 0,
    extremidadesInferiores: 0,
    cuelloTronco: 0,
    secuencia: 0,
  },
  cuestionario: {
    // Preguntas
    evaluacionMG: {
      titulo: 'Evaluación de MG', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresUnoId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Normal N',
          estatus: 1,
          valor: 'N',
          indicadorId: 1,
        },
        {
          indicador: 'Pobre repertorio PR',
          estatus: 2,
          valor: 'PR',
          indicadorId: 2,
        },
        {
          indicador: 'Cramped-Synchronised CS',
          estatus: 2,
          valor: 'CS',
          indicadorId: 3,
        },
        {
          indicador: 'Caótico CH',
          estatus: 2,
          valor: 'CH',
          indicadorId: 4,
        },
        {
          indicador: 'Hipocinético H',
          estatus: 2,
          valor: 'H',
          indicadorId: 5,
        },
      ],
    },
    secuencia: {
      titulo: 'Secuencia', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresUnoId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Variable',
          estatus: 1,
          valor: 2,
          indicadorId: 1,
        },
        {
          indicador: 'Monótono y/o pausado',
          estatus: 2,
          valor: 1,
          indicadorId: 2,
        },
        {
          indicador: 'Síncrono',
          estatus: 2,
          valor: 0,
          indicadorId: 3,
        },
        {
          indicador: 'Desorganizado',
          estatus: 2,
          valor: 0,
          indicadorId: 4,
        },
      ],
    },
    principal: {
      titulo: '', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Variable que interviene en la secuencia',
          estatus: 1,
          valor: 2,
          indicadorId: 5,
        },
        {
          indicador: 'Se mueve aisladamente',
          estatus: 0,
          valor: 1,
          indicadorId: 6,
        },
        {
          indicador: 'No se mueve en absoluto',
          estatus: 2,
          valor: 0,
          indicadorId: 7,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Rotaciones fluidas y elegantes',
          estatus: 1,
          valor: 2,
          indicadorId: 8,
        },
        {
          indicador: 'Rotaciones repetitivas o escasas',
          estatus: 0,
          valor: 1,
          indicadorId: 9,
        },
        {
          indicador: 'Casi sin rotaciones o movimiento en bloque',
          estatus: 2,
          valor: 0,
          indicadorId: 10,
        },
      ],
    },
    amplitud: {
      titulo: 'Amplitud', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Variable',
          estatus: 1,
          valor: 2,
          indicadorId: 11,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 12,
        },
        {
          indicador: 'Casi siempre pequeñas',
          estatus: 0,
          valor: 0,
          indicadorId: 13,
        },
        {
          indicador: 'Casi siempre grandes',
          estatus: 2,
          valor: 0,
          indicadorId: 14,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Variable',
          estatus: 1,
          valor: 2,
          indicadorId: 15,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 16,
        },
        {
          indicador: 'Casi siempre pequeñas',
          estatus: 0,
          valor: 0,
          indicadorId: 17,
        },
        {
          indicador: 'Casi siempre grandes',
          estatus: 2,
          valor: 0,
          indicadorId: 18,
        },
      ],
    },
    velocidad: {
      titulo: 'Velocidad', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Variable',
          estatus: 1,
          valor: 2,
          indicadorId: 19,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 20,
        },
        {
          indicador: 'Casi siempre lentas',
          estatus: 2,
          valor: 0,
          indicadorId: 21,
        },
        {
          indicador: 'Casi siempre rápidas',
          estatus: 2,
          valor: 0,
          indicadorId: 22,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Variable',
          estatus: 1,
          valor: 2,
          indicadorId: 23,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 24,
        },
        {
          indicador: 'Casi siempre lentas',
          estatus: 2,
          valor: 0,
          indicadorId: 25,
        },
        {
          indicador: 'Casi siempre rápidas',
          estatus: 2,
          valor: 0,
          indicadorId: 26,
        },
      ],
    },
    rangoEspacial: {
      titulo: 'Rango espacial', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Espacio completo utilizado de forma variable',
          estatus: 1,
          valor: 2,
          indicadorId: 27,
        },
        {
          indicador: 'Espacio limitado',
          estatus: 0,
          valor: 1,
          indicadorId: 28,
        },
        {
          indicador: 'En un solo plano',
          estatus: 2,
          valor: 0,
          indicadorId: 29,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Espacio completo utilizado de forma variable',
          estatus: 1,
          valor: 2,
          indicadorId: 30,
        },
        {
          indicador: 'Espacio limitado',
          estatus: 0,
          valor: 1,
          indicadorId: 31,
        },
        {
          indicador: 'En un solo plano, p.e, levantado-liberado',
          estatus: 2,
          valor: 0,
          indicadorId: 32,
        },
      ],
    },
    compRotatoriosProximales: {
      titulo: 'Componentes Rotatorios Proximales', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Presente, fluido y elegante',
          estatus: 1,
          valor: 2,
          indicadorId: 33,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 34,
        },
        {
          indicador: 'Casi sin rotaciones',
          estatus: 2,
          valor: 0,
          indicadorId: 35,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Presente, fluido y elegante',
          estatus: 1,
          valor: 2,
          indicadorId: 36,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 37,
        },
        {
          indicador: 'Casi sin rotaciones',
          estatus: 2,
          valor: 0,
          indicadorId: 38,
        },
      ],
    },
    compRotatoriosDistales: {
      titulo: 'Componentes Rotatorios Distales', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Presente, fluido y elegante',
          estatus: 1,
          valor: 2,
          indicadorId: 39,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 40,
        },
        {
          indicador: 'Casi sin rotaciones',
          estatus: 2,
          valor: 0,
          indicadorId: 41,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Presente, fluido y elegante',
          estatus: 1,
          valor: 2,
          indicadorId: 42,
        },
        {
          indicador: 'Monótono',
          estatus: 0,
          valor: 1,
          indicadorId: 43,
        },
        {
          indicador: 'Casi sin rotaciones',
          estatus: 2,
          valor: 0,
          indicadorId: 44,
        },
      ],
    },
    inicio: {
      titulo: 'Inicio del movimiento', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Suave y fluctuante',
          estatus: 1,
          valor: 2,
          indicadorId: 45,
        },
        {
          indicador: 'Fluctuación mínima',
          estatus: 0,
          valor: 1,
          indicadorId: 46,
        },
        {
          indicador: 'Casi siempre abrupta',
          estatus: 2,
          valor: 0,
          indicadorId: 47,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Suave y fluctuante',
          estatus: 1,
          valor: 2,
          indicadorId: 48,
        },
        {
          indicador: 'Fluctuación mínima',
          estatus: 0,
          valor: 1,
          indicadorId: 49,
        },
        {
          indicador: 'Casi siempre abrupta',
          estatus: 2,
          valor: 0,
          indicadorId: 50,
        },
      ],
    },
    final: {
      titulo: 'Final del movimiento', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Suave y fluctuante',
          estatus: 1,
          valor: 2,
          indicadorId: 51,
        },
        {
          indicador: 'Fluctuación mínima',
          estatus: 0,
          valor: 1,
          indicadorId: 52,
        },
        {
          indicador: 'Casi siempre abrupta',
          estatus: 2,
          valor: 0,
          indicadorId: 53,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Suave y fluctuante',
          estatus: 1,
          valor: 2,
          indicadorId: 54,
        },
        {
          indicador: 'Fluctuación mínima',
          estatus: 0,
          valor: 1,
          indicadorId: 55,
        },
        {
          indicador: 'Casi siempre abrupta',
          estatus: 2,
          valor: 0,
          indicadorId: 56,
        },
      ],
    },
    rigidez: {
      titulo: 'Rigidez', // Título lateral
      valorIndicadoresUno: 0,
      valorIndicadoresDos: 0,
      valorIndicadoresUnoId: 0,
      valorIndicadoresDosId: 0,
      indicadoresUno: [
        // Preguntas
        {
          indicador: 'Ausencia, los movimientos son suaves',
          estatus: 1,
          valor: 2,
          indicadorId: 57,
        },
        {
          indicador: 'Ocasionalmente presentes',
          estatus: 0,
          valor: 1,
          indicadorId: 58,
        },
        {
          indicador: 'Casi siempre presentes',
          estatus: 2,
          valor: 0,
          indicadorId: 59,
        },
      ],
      indicadoresDos: [
        // Preguntas
        {
          indicador: 'Ausencia, los movimientos son suaves',
          estatus: 1,
          valor: 2,
          indicadorId: 60,
        },
        {
          indicador: 'Ocasionalmente presentes',
          estatus: 0,
          valor: 1,
          indicadorId: 61,
        },
        {
          indicador: 'Casi siempre presentes',
          estatus: 2,
          valor: 0,
          indicadorId: 62,
        },
      ],
    },
  },
};
