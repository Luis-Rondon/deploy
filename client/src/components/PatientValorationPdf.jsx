/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f4f7fc',
    padding: 40,
    color: '#213162',
  },
  body: {
    backgroundColor: '#fff',
    padding: '3%',
  },
  row: {
    height: 'auto',
    marginVertical: 0,
    marginHorizontal: 0,
    flexDirection: 'row',
  },
  column3: {
    flexDirection: 'column',
    width: '33%',
    marginVertical: 3,
  },
  column4: {
    flexDirection: 'column',
    width: '25%',
    marginVertical: 0,
  },
  column5: {
    flexDirection: 'column',
    width: '20%',
    marginVertical: 0,
  },
  column6: {
    flexDirection: 'column',
    width: '50%',
  },
  column12: {
    flexDirection: 'column',
    width: '100%',
  },
  profilePic: {
    borderRadius: '200',
    objectPosition: 'center',
    objectFit: 'cover',
    height: '90',
    width: '90',
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  formGroup: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  textLabel: {
    fontSize: 10,
    width: '40%',
  },
  textContent: {
    color: '#3e6a9b',
    fontSize: 10,
    marginLeft: 5,
    width: '60%',
  },
  textContent80: {
    color: '#3e6a9b',
    fontSize: 10,
    marginLeft: 5,
    width: '80%',
  },
  textContent12: {
    color: '#3e6a9b',
    fontSize: 10,
    marginVertical: 5,
    marginRight: 15,
    heigth: 200,
    maxLines: 12,
    paddingRight: 2,
  },
  textContentOtherVariables: {
    color: '#3e6a9b',
    fontSize: 10,
  },
  textLabelShort: {
    fontSize: 10,
    width: '13%',
  },
  textLabel12: {
    fontSize: 12,
    paddingRight: 2,
  },
  textLabel25: {
    fontSize: 10,
    width: '25%',
  },
  textLabel20: {
    fontSize: 10,
    width: '20%',
  },
  textNamePhysicalResponses: {
    fontSize: 10,
    width: '40%',
  },
  textLabelPhysicalResponses: {
    fontSize: 10,
    width: '22%',
    marginHorizontal: '5',
  },
  textBackgroundType: {
    color: '#3e6a9b',
    fontSize: 10,
    border: '1pt solid #213162',
    marginTop: '10',
    width: '50%',
    padding: '2 1 0 5',
  },
  textCheckbox: {
    fontSize: 10,
    paddingTop: 3,
    width: '40%',
  },
  textCheckboxIndicators: {
    fontSize: 10,
    marginRight: 2,
    paddingTop: '2',
  },
  checkbox: {
    fontSize: 9,
    border: '1pt solid #213162',
    padding: '2 1 0 4',
    height: '13',
    width: '13',
  },
  divider: {
    height: '3',
    backgroundColor: '#d9dddf',
    marginBottom: '7',
  },
});

const PatientValorationPdf = ({ data }) => {
  return (
    <Document
      creator="Unidad de Neuroterapia Pediátrica"
      producer="Unidad de Neuroterapia Pediátrica"
      title="Formato de valoración de paciente "
      subtitle={data ? data.general.name : null}
    >
      {data ? (
        <Page
          ruler={false}
          verticalRulerSteps="10%"
          horizontalRulerSteps="10%"
          style={styles.page}
          wrap
        >
          <View>
            <Text style={styles.title}>Formato de valoración del paciente</Text>
          </View>
          <View style={styles.body} wrap>
            <Text style={styles.subtitle}>
              {`Datos generales - creado el ${data.createdAt}`}
            </Text>
            <View style={styles.row}>
              <View style={{ width: '20%' }}>
                <Image
                  src={
                    data.profile_pic_url || '../assets/user-profile-default.jpg'
                  }
                  cache={false}
                  style={styles.profilePic}
                />
              </View>
              <View style={{ width: '80%' }}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabelShort}>Nombre del paciente</Text>
                  <Text style={styles.textContent}>{data.general.name}</Text>
                </View>
                <View style={styles.row}>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Fecha de consulta</Text>
                      <Text style={styles.textContent}>
                        {data.general.consultDate}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>PC</Text>
                      <Text style={styles.textContent}>{data.general.pc}</Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Peso</Text>
                      <Text style={styles.textContent}>
                        {data.general.weight}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Fecha de nacimiento</Text>
                      <Text style={styles.textContent}>
                        {data.general.birthDate}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>E.Cron</Text>
                      <Text style={styles.textContent}>
                        {data.general.eCron}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Último alimento</Text>
                      <Text style={styles.textContent}>
                        {data.general.lastFoodTime}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Edad aproximada</Text>
                      <Text style={styles.textContent}>
                        {data.general?.ageApprox || ''}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>SG</Text>
                      <Text style={styles.textContent}>{data.general.sg}</Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>DN</Text>
                      <Text style={styles.textContent}>{data.general.dn}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Temperatura</Text>
                      <Text style={styles.textContent}>
                        {data.general.temperature}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Talla</Text>
                      <Text style={styles.textContent}>
                        {data.general.size}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>ECo.</Text>
                      <Text style={styles.textContent}>{data.general.eco}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.column3}>
                    <View style={styles.formGroup}>
                      <Text style={styles.textLabel}>Sexo</Text>
                      <Text style={styles.textContent}>
                        {data.general.sex === 'm'
                          ? 'Masculino'
                          : data.general.sex === 'f'
                            ? 'Femenino'
                            : 'No registrado'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {data.references ? (
              <View style={styles.row} wrap={false}>
                <View style={styles.column3}>
                  <Text style={styles.textLabel12}>Motivo de consulta</Text>
                  <Text style={styles.textContent12}>
                    {data.references.reasonForConsultation}
                  </Text>
                </View>
                <View style={styles.column3}>
                  <Text style={styles.textLabel12}>Referido por</Text>
                  <Text style={styles.textContent12}>
                    {data.references.referredBy}
                  </Text>
                </View>
                {data.references.referredBy === 'Otro' ? (
                  <View style={styles.column3}>
                    <Text style={styles.textLabel12}>Otra referencia</Text>
                    <Text style={styles.textContent12}>
                      {data.references.referredByOther}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <Text style={styles.subtitle}>Información de contacto</Text>
            <View style={styles.formGroup}>
              <Text style={styles.textLabelShort}>Domicilio</Text>
              <Text style={styles.textContent}>
                {data.contactInformation.address}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Teléfono</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.phoneNumber}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text
                    style={{
                      ...styles.textLabel,
                      textTransform: 'uppercase',
                    }}
                  >
                    Nombre del padre
                  </Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.fatherName}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Nombre de la madre</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.motherName}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>RFC</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.rfc}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Profesión del padre</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.fatherProffesion}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Profesión de la madre</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.motherProffesion}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Correo electrónico</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.email}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Edad del padre</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.fatherAge}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Edad de la madre</Text>
                  <Text style={styles.textContent}>
                    {data.contactInformation.motherAge}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.subtitle}>Antecedentes</Text>
            <View style={styles.row}>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Familiares</Text>
                  <Text style={styles.textContent}>
                    {data.background.family}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Personal no patológico</Text>
                  <Text style={styles.textContent}>
                    {data.background.nonPathologicalStaff}
                  </Text>
                </View>
              </View>
              <View style={styles.column3}>
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Personal patológico</Text>
                  <Text style={styles.textContent}>
                    {data.background.pathologicalStaff}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={{ width: '65%' }}>
                <Text style={styles.textLabel12}>
                  Antecedentes gineco-obstétricos y comportamiento actual
                </Text>
                {!data.background.backgroundTypes
                  ? null
                  : data.background.backgroundTypes.map((item, i) => (
                    <View wrap={false} key={i}>
                      <Text
                        style={{
                          ...styles.textContent12,
                          color:
                              item.type === 'antecedente normal'
                                ? '#07497d'
                                : item.type === 'antecedente alarmante'
                                  ? '#ea4b84'
                                  : '#fff',
                        }}
                      >
                        {item.text}
                      </Text>
                      <Text
                        style={{
                          ...styles.textBackgroundType,
                          color:
                              item.type === 'antecedente normal'
                                ? '#07497d'
                                : item.type === 'antecedente alarmante'
                                  ? '#ea4b84'
                                  : '#fff',
                        }}
                      >
                        {item.type}
                      </Text>
                    </View>
                  ))}
              </View>
              <View style={{ width: '35%' }}>
                <Text style={styles.textLabel12}>Permanece más tiempo en:</Text>
                {data.background.staysLonger.map((item, i) => (
                  <View style={styles.formGroup} key={i}>
                    <Text style={styles.textCheckbox}>{item.name}</Text>
                    <Text
                      style={{
                        ...styles.checkbox,
                        backgroundColor:
                          item.value === true ? '#36f469' : '#fff',
                      }}
                    />
                  </View>
                ))}
                <View style={styles.formGroup}>
                  <Text style={styles.textLabel}>Otro</Text>
                  <Text style={styles.textContent}>
                    {data.background.staysLongerOther}
                  </Text>
                </View>
              </View>
            </View>

            <View wrap={false}>
              <Text style={styles.subtitle}>Otras variables</Text>

              <View style={styles.formGroup}>
                <Text style={styles.textLabel12}>Presentación fetal:</Text>
                <Text style={styles.textContentOtherVariables}>
                  {data.otherVariables.fetalMotherPresentation}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.textLabel12}>
                  Movs. fetales percibidos:
                </Text>
                <Text style={styles.textContentOtherVariables}>
                  {data.otherVariables.fetalMotherPresentation}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.textLabel12}>1a Impresión / Estado:</Text>
                <Text style={styles.textContentOtherVariables}>
                  {data.otherVariables.firstImpression}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.textLabel12}>Otro Tx. / Logros:</Text>
                <Text style={styles.textContentOtherVariables}>
                  {data.otherVariables.anotherTx}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.textLabel12}>Principal preocupación:</Text>
                <Text style={styles.textContentOtherVariables}>
                  {data.otherVariables.mainConcern}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.textLabel12}>Patrón Alto / Edad:</Text>
                <Text style={styles.textContentOtherVariables}>
                  {data.otherVariables.highPattern}
                </Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.textLabel12}>Próxima Habilidad:</Text>
                <Text style={styles.textContentOtherVariables}>
                  {data.otherVariables.nextSkill}
                </Text>
              </View>

              {/* <View style={styles.row}>

                <View style={{ width: '100%' }}>
                  <View style={{ ...styles.row, justifyContent: 'space-between' }}>
                    {
                    data.otherVariables.indicators.map((item, i) => (
                      <View style={styles.formGroup} key={i}>
                        <Text style={styles.textCheckboxIndicators}>{item.name}</Text>
                        <Text style={{
                          ...styles.checkbox,
                          backgroundColor: item.value === false
                            ? '#fff'
                            : i <= 4
                              ? '#f44336'
                              : '#36f469',
                        }}
                        />
                      </View>
                    ))
                  }
                  </View>
                  {
                  data.otherVariables.physicalResponses.map((item, i) => (
                    <View style={styles.row} key={i}>
                      <View style={styles.formGroup}>
                        <Text style={styles.textNamePhysicalResponses}>{item.name}</Text>
                        <Text style={styles.textLabelPhysicalResponses}>{item.statusOneName}</Text>
                        <Text style={{
                          ...styles.checkbox,
                          backgroundColor: item.statusOneValue === true
                            ? '#36f469'
                            : '#fff',
                        }}
                        />
                        <Text style={styles.textLabelPhysicalResponses}>{item.statusTwoName}</Text>
                        <Text style={{
                          ...styles.checkbox,
                          backgroundColor: item.statusTwoValue === true
                            ? '#f44336'
                            : '#fff',
                        }}
                        />
                      </View>
                    </View>
                  ))
                }
                </View>
              </View> */}
            </View>

            <Text style={styles.subtitle}>Medicamentos</Text>
            <View style={styles.row}>
              <View style={styles.column6}>
                <Text style={styles.textLabel12}>Medicamentos actuales</Text>
                <Text style={styles.textContent12}>
                  {data.medicines.currents}
                </Text>
              </View>
              <View style={styles.column6}>
                <Text style={styles.textLabel12}>Medicamentos de la madre</Text>
                <Text style={styles.textContent12}>
                  {data.medicines.mother}
                </Text>
              </View>
            </View>
            <Text style={styles.subtitle}>Observación de la estructura</Text>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel20}>Cabeza/Cara:</Text>
              <Text style={styles.textContent80}>
                {data.observations.headFace}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel20}>Tórax</Text>
              <Text style={styles.textContent80}>
                {data.observations.chest}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel20}>Brazos/Manos:</Text>
              <Text style={styles.textContent80}>
                {data.observations.armsHands}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel20}>Abdomen/Genitales:</Text>
              <Text style={styles.textContent80}>
                {data.observations.abodemnGenitals}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel20}>Cadera/Rodillas/Pies:</Text>
              <Text style={styles.textContent80}>
                {data.observations.hipKneesFeet}
              </Text>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.textLabel20}>Columna:</Text>
              <Text style={styles.textContent80}>
                {data.observations.spine}
              </Text>
            </View>
            <View style={styles.row} wrap={false}>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>
                  Patrones no dinámicos constantes
                </Text>
                <Text style={styles.textContent12}>
                  {data.observations.constantNoDynamicPatterns}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>
                  Patrones dinámicos espontáneos
                </Text>
                <Text style={styles.textContent12}>
                  {data.observations.constantSpontaneousPatterns}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>
                  Problema principal / Alteraciones funcionales
                </Text>
                <Text style={styles.textContent12}>
                  {data.observations.mainTrouble}
                </Text>
              </View>
            </View>
            <View style={styles.row} wrap={false}>
              <View style={styles.column6}>
                <Text style={styles.textLabel12}>
                  Respuesta neuroconductual
                </Text>
                <Text style={styles.textContent12}>
                  {data.observations.neurobehavioralResponse}
                </Text>
              </View>
            </View>
            <View style={styles.row} wrap={false}>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Plan de Tx</Text>
                <Text style={styles.textContent12}>
                  {data.observations.txPlan}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Prox. Hab</Text>
                <Text style={styles.textContent12}>
                  {data.observations.nextHab}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Tx por sem.</Text>
                <Text style={styles.textContent12}>
                  {data.observations.txPerWeek}
                </Text>
              </View>
            </View>
            <View style={styles.row} wrap={false}>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Estudios</Text>
                <Text style={styles.textContent12}>
                  {data.observations.studies}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Se canaliza</Text>
                <Text style={styles.textContent12}>
                  {data.observations.canalization}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Terapeuta que atendió</Text>
                <Text style={styles.textContent12}>
                  {data?.doctorAssigned?.name || 'No registrado'}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>Seguimiento de neurodesarrollo</Text>
            {data.neuroMonitoring ? (
              <Text
                style={{
                  ...styles.subtitle,
                  marginTop: '5',
                  marginBottom: '5',
                }}
              >
                Aún no se ha agregado un seguimiento
              </Text>
            ) : null}
            {data.neuroMonitoring
              && Object.values(data.neuroMonitoring).map((neuroItem) => (
                <View key={neuroItem.idRegister} wrap={false}>
                  <View
                    style={{ ...styles.row, marginTop: '5', marginBottom: '5' }}
                  >
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>No.</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.number}
                      </Text>
                    </View>
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>Fecha</Text>
                      <Text style={styles.textContent12}>{neuroItem.date}</Text>
                    </View>
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>Eco.</Text>
                      <Text style={styles.textContent12}>{neuroItem.eco}</Text>
                    </View>
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>Resultado</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.result || '--'}
                      </Text>
                    </View>
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>Peso en grs.</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.weight || '--'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{ ...styles.row, marginTop: '5', marginBottom: '5' }}
                  >
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>
                        Perímetro cefálico(cm)
                      </Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.headCircunference || '--'}
                      </Text>
                    </View>
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>
                        Índice plagiocefálico(mm)
                      </Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.plagiocephalyIndex || '--'}
                      </Text>
                    </View>
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>
                        Distancia bioparental
                      </Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.bioparentalDistance || '--'}
                      </Text>
                    </View>
                    <View style={styles.column5}>
                      <Text style={styles.textLabel12}>
                        Distancia antero-posterior
                      </Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.antPostDistance || '--'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.column6}>
                      <Text style={styles.textLabel12}>Control</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.control || '--'}
                      </Text>
                    </View>
                    <View style={styles.column6}>
                      <Text style={styles.textLabel12}>Descripción</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.description || '--'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.column6}>
                      <Text style={styles.textLabel12}>Exploración</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.exploration || '--'}
                      </Text>
                    </View>
                    <View style={styles.column6}>
                      <Text style={styles.textLabel12}>Revaloración</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.Revaloración || '--'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.column6}>
                      <Text style={styles.textLabel12}>
                        Terapeuta que atendió
                      </Text>
                      <Text style={styles.textContent12}>
                        {neuroItem?.doctorAssigned?.name}
                      </Text>
                    </View>
                    <View style={styles.column6}>
                      <Text style={styles.textLabel12}>Creado el:</Text>
                      <Text style={styles.textContent12}>
                        {neuroItem.createdAt}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                </View>
              ))}
          </View>
        </Page>
      ) : null}
    </Document>
  );
};

PatientValorationPdf.defaultProps = {
  data: null,
};

PatientValorationPdf.propTypes = {
  data: PropTypes.object,
};

export default PatientValorationPdf;
