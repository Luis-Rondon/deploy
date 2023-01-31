/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Page, Text, View, Document, StyleSheet,
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
  column4: {
    flexDirection: 'column',
    width: '25%',
    marginVertical: 0,
  },
  column6: {
    flexDirection: 'column',
    width: '50%',
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

const PatientHistoryPdf = ({ data, patient, doctorList }) => {
  const getDoctorName = (idDoctor) => {
    const doctor = doctorList.find((element) => element.id === idDoctor);
    return doctor ? doctor.username : 'Usuario eliminado';
  };
  return (
    <Document
      creator="Unidad de Neuroterapia Pediátrica"
      producer="Unidad de Neuroterapia Pediátrica"
      title="Historial de citas de paciente"
      subtitle={patient}
    >
      <Page
        ruler={false}
        verticalRulerSteps="10%"
        horizontalRulerSteps="10%"
        style={styles.page}
        wrap
      >
        <View>
          <Text style={styles.title}>Historial de citas del paciente</Text>
        </View>
        <View style={styles.body} wrap>
          <View>
            <Text
              style={styles.subtitle}
            >
              {`Nombre del paciente ${patient}`}
            </Text>
          </View>
          {data.length > 0
            && data.map((history, i) => (
              <View key={i} wrap="false">
                <View
                  style={{ ...styles.row, marginTop: '5', marginBottom: '5' }}
                >
                  <View style={styles.column4}>
                    <Text style={styles.textLabel12}>Fecha:</Text>
                    <Text style={styles.textContent12}>
                      {history.date.split('-').reverse().join('-')}
                    </Text>
                  </View>
                  <View style={styles.column4}>
                    <Text style={styles.textLabel12}>Horario:</Text>
                    <Text style={styles.textContent12}>{history.schedule}</Text>
                  </View>
                  <View style={styles.column4}>
                    <Text style={styles.textLabel12}>Doctor asignado</Text>
                    <Text style={styles.textContent12}>
                      {getDoctorName(history.doctorIdAssigned)}
                    </Text>
                  </View>
                  <View style={styles.column4}>
                    <Text style={styles.textLabel12}>Estado:</Text>
                    <Text style={styles.textContent12}>
                      {history.arrivedState}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.column6}>
                    <Text style={styles.textLabel12}>
                      Motivo de la consulta:
                    </Text>
                    <Text style={styles.textContent12}>{history.reason}</Text>
                  </View>
                  {history.reasonNotArrived !== null && (
                    <View style={styles.column6}>
                      <Text style={styles.textLabel12}>Razón de la falta</Text>
                      <Text style={styles.textContent12}>
                        {history.reasonNotArrived}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.divider} />
              </View>
            ))}
        </View>
      </Page>
    </Document>
  );
};

PatientHistoryPdf.defaultProps = {
  data: null,
};

PatientHistoryPdf.propTypes = {
  data: PropTypes.array,
  patient: PropTypes.string.isRequired,
  doctorList: PropTypes.array.isRequired,
};

export default PatientHistoryPdf;
