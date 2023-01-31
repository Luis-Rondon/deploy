import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Table } from 'reactstrap';
import { patientModel } from '../models/PatientType';
// import FormGroupPatient from './FormGroupPatient';
import '../styles/conductTable.scss';


const ConductTable = ({
  register,
  readOnly,
  watch,
}) => {
  const [lastSelected, setLastSelected] = useState({});

  return (
    <Table
      className="conduct-table"
      bordered
      responsive
    >
      <colgroup span={1} className="first-col">
        {/* <col className="first-col" /> */}
        {/* <col span={patientModel.observations.conduct.emotionalState.indicadores.} /> */}
      </colgroup>
      {/* <thead className="header">
        <tr>
          <th>
            { }
          </th>
          {
            patientModel.observations.conduct.emotionalState.indicadores.map((el) => {
              return (
                <th key={`header-${el.text}`}><p>{ el.value }</p></th>
              );
            })
          }
          <th><p>Comentarios</p></th>
        </tr>
      </thead> */}
      <tbody>
        {
          Object.keys(patientModel.observations.conduct).map((conductKey) => {
            const conduct = patientModel.observations.conduct[conductKey];
            return (
              <tr key={`conduct-${conductKey}`}>
                <th className="first-col"><p>{conduct.title}</p></th>
                {
                  conduct.indicadores.map((indicador) => {
                    return (
                      <th
                        className={`${Number(watch(`observations.conduct.${conductKey}.selectedValue`)) === indicador.value ? 'selected' : ''}`}
                        key={`body-${indicador.text}`}
                        onClick={(e) => {
                          const input = e.target.children[0];
                          // eslint-disable-next-line
                          input?.click();
                        }}
                      >
                        <Input
                          key={indicador.text}
                          type="radio"
                          name={`observations.conduct.${conductKey}.selectedValue`}
                          innerRef={register}
                          value={indicador.value}
                          className="input-radio"
                          onClick={(e) => {
                            const newProp = { ...lastSelected };
                            if (indicador.value === Number(lastSelected[conductKey])) {
                              e.target.checked = false;
                              newProp[conductKey] = -1;
                            } else {
                              newProp[conductKey] = e.target.value;
                            }
                            setLastSelected(newProp);
                          }}
                          disabled={readOnly}
                        />
                        {indicador.text}
                      </th>
                    );
                  })
                }
                {/* <th className="comment-field">
                  <FormGroupPatient
                    name={`observations.conduct.${conductKey}.comments`}
                    type="textarea"
                    inputClassname="input-auto-heigth"
                    register={register}
                    inputSize="12"
                    readOnly={readOnly}
                  />
                </th> */}
              </tr>
            );
          })
        }
      </tbody>
    </Table>
  );
};

ConductTable.defaultProps = {
  readOnly: false,
};

ConductTable.propTypes = {
  register: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  watch: PropTypes.func.isRequired,
};

export default ConductTable;
