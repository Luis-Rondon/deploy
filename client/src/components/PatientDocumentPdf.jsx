/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Page, Text, View, Document, StyleSheet,
} from '@react-pdf/renderer';
import moment from 'moment';

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
    marginVertical: 0,
  },
  column4: {
    flexDirection: 'column',
    width: '25%',
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
  textLabel12: {
    fontSize: 12,
  },
  textContent12: {
    color: '#3e6a9b',
    fontSize: 10,
    marginVertical: 5,
    marginRight: 15,
    heigth: 200,
    maxLines: 12,
  },
  divider: {
    height: '3',
    backgroundColor: '#d9dddf',
    marginBottom: '7',
  },
});

const PatientDocumentPdf = ({
  monitoringItems = [],
  patient,
  doctorList = [],
}) => {
  const today = moment().format('DD-MM-YYYY hh:mm:ss');

  const getDoctorName = (idDoctor) => {
    const doctor = doctorList.find((element) => element.id === idDoctor);
    return doctor ? doctor.username : 'No registrado';
  };

  const getAge = () => {
    const today = moment();
    const birthd = moment(patient.general.birthDate);
    return today.diff(birthd, 'years');
  };

  return (
    <Document
      creator="Unidad de Neuroterapia Pediátrica"
      producer="Unidad de Neuroterapia Pediátrica"
      title="Historial de citas de paciente"
      subtitle={patient?.general?.name}
    >
      <Page
        ruler={false}
        verticalRulerSteps="10%"
        horizontalRulerSteps="10%"
        style={styles.page}
        wrap
      >
        <View>
          <Text style={styles.title}>Historial de neurodesarrollo</Text>
          <Text style={styles.subtitle}>
            Fecha de expedición del documento:
            {' '}
            {today}
          </Text>
        </View>
        <View style={styles.body} wrap>
          <View>
            <Text
              style={styles.subtitle}
            >
              {`Paciente: ${patient?.general?.name}`}
            </Text>
          </View>
          <View wrap="false">
            <View style={{ ...styles.row, marginTop: '5', marginBottom: '5' }}>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>No. de expediente:</Text>
                <Text style={styles.textContent12}>
                  {patient?.folio || '-No asignado-'}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>No. de registro:</Text>
                <Text style={styles.textContent12}>{patient?.number}</Text>
              </View>
            </View>
          </View>
          <View wrap="false">
            <View style={{ ...styles.row, marginTop: '5', marginBottom: '5' }}>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Teléfono de contacto</Text>
                <Text style={styles.textContent12}>
                  {patient?.contactInformation?.phoneNumber || '--'}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Fecha de nacimiento:</Text>
                <Text style={styles.textContent12}>
                  {patient?.general?.birthDate.split('-').reverse().join('-')}
                </Text>
              </View>
              <View style={styles.column3}>
                <Text style={styles.textLabel12}>Edad:</Text>
                <Text style={styles.textContent12}>{getAge()}</Text>
              </View>
            </View>
          </View>
          <View>
            <Text style={styles.subtitle}>Historial de neuroseguimiento</Text>
          </View>
          {!monitoringItems.length && (
            <Text style={styles.textLabel12}>Sin registros.</Text>
          )}
          {monitoringItems.map((monitoringItem, i) => (
            <View key={i} wrap="false">
              <View
                style={{ ...styles.row, marginTop: '5', marginBottom: '5' }}
              >
                <View style={styles.column3}>
                  <Text style={styles.textLabel12}>Valoración No.:</Text>
                  <Text style={styles.textContent12}>
                    {monitoringItem?.number}
                  </Text>
                </View>
                <View style={styles.column3}>
                  <Text style={styles.textLabel12}>Fecha:</Text>
                  <Text style={styles.textContent12}>
                    {monitoringItem.createdAt}
                  </Text>
                </View>
                <View style={styles.column3}>
                  <Text style={styles.textLabel12}>Doctor asignado</Text>
                  <Text style={styles.textContent12}>
                    {getDoctorName(monitoringItem.doctorIdAssigned)}
                  </Text>
                </View>
              </View>
              <View style={{ ...styles.row, marginBottom: '5' }}>
                <View style={styles.column4}>
                  <Text style={styles.textLabel12}>Descripción:</Text>
                  <Text style={styles.textContent12}>
                    {monitoringItem.description || 'N/A'}
                  </Text>
                </View>
                <View style={styles.column4}>
                  <Text style={styles.textLabel12}>Exploración:</Text>
                  <Text style={styles.textContent12}>
                    {monitoringItem.exploration || 'N/A'}
                  </Text>
                </View>
                <View style={styles.column4}>
                  <Text style={styles.textLabel12}>Revaloración:</Text>
                  <Text style={styles.textContent12}>
                    {monitoringItem.reassessment || 'N/A'}
                  </Text>
                </View>
                <View style={styles.column4}>
                  <Text style={styles.textLabel12}>Control:</Text>
                  <Text style={styles.textContent12}>
                    {monitoringItem.control || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

PatientDocumentPdf.defaultProps = {
  monitoringItems: [],
};

PatientDocumentPdf.propTypes = {
  monitoringItems: PropTypes.array,
  patient: PropTypes.object.isRequired,
  doctorList: PropTypes.array.isRequired,
};

export default PatientDocumentPdf;
