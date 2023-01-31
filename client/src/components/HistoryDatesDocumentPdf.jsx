/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import Html from 'react-pdf-html';
import {
  Page, Document, StyleSheet, View, Text,
} from '@react-pdf/renderer';
import moment from 'moment';

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

const HistoryDatesDocumentPdf = ({ data, patient, index }) => {
  const infoData = data?.historyDocument?.length
    ? data?.historyDocument[index]
    : {};
  return (
    <Document
      creator="Unidad de Neuroterapia Pediátrica"
      producer="Unidad de Neuroterapia Pediátrica"
      title="Constancia del paciente"
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
            <Text style={{ margin: '40pt 0pt 30pt 0pt', fontSize: '12pt' }}>
              {infoData?.addressedTo || 'A quién corresponda:'}
            </Text>
          </View>
          <View>
            <Html style={{ fontSize: 12, lineHeight: 0.5 }}>
              {infoData?.text}
            </Html>
          </View>
          {/* <View>
            <Text style={{ margin: '20pt 0pt', fontSize: '12pt', lineHeight: '1.5', textAlign: 'justify' }}>{infoData?.text}</Text>
          </View> */}
          <View
            style={{
              marginBottom: '30pt',
              textAlign: 'right',
              fontSize: '10pt',
            }}
          >
            <Text>
              Se extiende la presente en la Ciudad de Oaxaca de Juárez, Oax. a
              los
              {' '}
            </Text>
            <Text>
              {moment(infoData?.date).format(
                'DD [días del mes de] MMMM [del año] YYYY',
              )}
            </Text>
          </View>
          {/* <View style={{ textAlign: 'right', marginRight: '20pt' }}>
            <Text style={{ color: '#184887', fontSize: '12pt' }}>Lic. Efrén Jiménez L.</Text>
            <Text style={{ fontSize: '10pt' }}>Terapeuta Pediátrico Certificado</Text>
            <Text style={{ fontSize: '10pt' }}>UNETE-NEOPEDIATRICA A.C</Text>
            <Text style={{ fontSize: '10pt' }}>Ced.Prof. 3409909-09149877</Text>
            <Text style={{ fontSize: '9pt' }}>PREVENIR ES MEJOR QUE REHABILITAR</Text>
          </View> */}
        </View>
      </Page>
    </Document>
  );
};

HistoryDatesDocumentPdf.defaultProps = {
  data: null,
};

HistoryDatesDocumentPdf.propTypes = {
  data: PropTypes.object.isRequired,
  patient: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
};

export default HistoryDatesDocumentPdf;
