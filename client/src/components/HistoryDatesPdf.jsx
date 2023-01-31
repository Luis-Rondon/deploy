/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Page, Text, View, Document, StyleSheet,
} from '@react-pdf/renderer';
import moment from 'moment';
import { Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
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
    padding: '3pt',
  },
  column6: {
    flexDirection: 'column',
    width: '50%',
  },
  table: {
    border: '1pt solid #184887',
  },
});

const HistoryDatesPdf = ({ data, patient }) => {
  const monthsfirst = [];
  const registros = data?.historyRegister; // [{ date: '', price: '' }]
  if (registros?.length) {
    for (let i = 0; i < 12; i++) {
      monthsfirst.push(
        registros.filter(
          (register) => moment(register.date).get('month') === i,
        ),
      );
    }
  }
  const months = monthsfirst.filter((mes) => mes.length);

  return (
    <Document
      creator="Unidad de Neuroterapia Pediátrica"
      producer="Unidad de Neuroterapia Pediátrica"
      title="Bitácora de citas"
      subtitle={patient}
    >
      <Page
        size="A4"
        ruler={false}
        verticalRulerSteps="10%"
        horizontalRulerSteps="10%"
        style={styles.page}
        wrap
      >
        <View style={styles.body} wrap>
          <View>
            <Text style={{ marginBottom: '40pt' }}>A quién corresponda:</Text>
          </View>
          <View style={{ marginBottom: '20pt', textAlign: 'right' }}>
            <Text>BITÁCORA DE TERAPIA FÍSICA.</Text>
            <Text>CARNET DE SISTENCIA.</Text>
          </View>
          <View style={{ marginBottom: '5pt' }}>
            <Text>
              NOMBRE DEL PACIENTE:
              {patient}
            </Text>
            <Text>CLÍNICA: UNIDAD DE NEUROTERAPIA PEDIÁTRICA</Text>
            <Text>
              TRATAMIENTO:
              {data?.historyData?.treatment || '****'}
            </Text>
          </View>
          {months.map((mes, i) => (
            // Aquí van los headers
            <Fragment key={uuidv4()}>
              <View wrap="false">
                <View style={{ ...styles.row, marginTop: '15pt' }}>
                  <View
                    style={{
                      ...styles.column4,
                      ...styles.table,
                      textAlign: 'center',
                      width: '15%',
                    }}
                  >
                    <Text>N°</Text>
                  </View>
                  <View
                    style={{
                      ...styles.column4,
                      ...styles.table,
                      textAlign: 'center',
                      width: '25%',
                    }}
                  >
                    <Text>FECHA DE TERAPIA:</Text>
                  </View>
                  <View
                    style={{
                      ...styles.column4,
                      ...styles.table,
                      textAlign: 'center',
                      width: '25%',
                    }}
                  >
                    <Text>COSTO</Text>
                  </View>
                  <View
                    style={{
                      ...styles.column4,
                      ...styles.table,
                      textAlign: 'center',
                      width: '35%',
                    }}
                  >
                    <Text>FIRMA DEL PACIENTE</Text>
                    <Text style={{ wordBreak: 'break-word' }}>
                      (RESPONSABLE
                      {' '}
                      {data?.historyData?.responsable || 'No registrado'}
                      )
                    </Text>
                  </View>
                </View>
              </View>
              {mes.map((history, i) => (
                <View key={uuidv4()} wrap="false">
                  <View style={{ ...styles.row }}>
                    <View
                      style={{
                        ...styles.column4,
                        ...styles.table,
                        textAlign: 'center',
                        width: '15%',
                      }}
                    >
                      <Text>{i + 1}</Text>
                    </View>
                    <View
                      style={{
                        ...styles.column4,
                        ...styles.table,
                        textAlign: 'center',
                        width: '25%',
                      }}
                    >
                      <Text>{moment(history?.date).format('DD-MMM-YYYY')}</Text>
                    </View>
                    <View
                      style={{
                        ...styles.column4,
                        ...styles.table,
                        textAlign: 'center',
                        width: '25%',
                      }}
                    >
                      <Text>
                        $
                        {history?.price
                          ? parseFloat(history?.price).toFixed(2)
                          : ''}
                      </Text>
                    </View>
                    <View
                      style={{
                        ...styles.column4,
                        ...styles.table,
                        textAlign: 'center',
                        width: '35%',
                      }}
                    >
                      <Text />
                    </View>
                  </View>
                </View>
              ))}
            </Fragment>
          ))}
          <View
            style={{
              margin: '50pt 0pt',
              textAlign: 'right',
              fontSize: '9',
              marginRight: '20pt',
            }}
          >
            <Text>Se extiende la presente en la Ciudad de Oaxaca de</Text>
            <Text>
              Juárez, Oax. a los
              {' '}
              {moment().format('DD [días del mes de] MMMM [del año] YYYY')}
            </Text>
          </View>
          {/* <View style={{ textAlign: 'right', marginRight: '20pt' }}>
            <Text style={{ color: '#184887', fontSize: '12' }}>Lic. Efrén Jiménez L.</Text>
            <Text>Terapeuta Pediátrico Certificado</Text>
            <Text>UNETE-NEOPEDIATRICA A.C</Text>
            <Text>Ced.Prof. 3409909-09149877</Text>
            <Text style={{ fontSize: '9' }}>PREVENIR ES MEJOR QUE REHABILITAR</Text>
          </View> */}
        </View>
      </Page>
    </Document>
  );
};

HistoryDatesPdf.defaultProps = {
  data: null,
};

HistoryDatesPdf.propTypes = {
  data: PropTypes.object,
  patient: PropTypes.string.isRequired,
};

export default HistoryDatesPdf;
