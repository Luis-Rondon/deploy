import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { Label, Input, FormGroup, Col, Row } from 'reactstrap';
import '../styles/formGroupPatient.scss';

const PatientFormGroup = ({
  onChange,
  onChangeOther,
  inputClassname,
  inputSize,
  labelClassname,
  label,
  labelSize,
  name,
  options,
  placeHolder,
  required,
  rows,
  tag,
  type,
  value,
}) => (
  <FormGroup className="patient-form-group">
    <Row className="row">
      <Col xs={labelSize} className="col">
        <Label className={`label ${labelClassname}`}>{label}</Label>
      </Col>
      <Col xs={inputSize} className="col">
        <Input
          addon
          type={type}
          checked={value}
          value={value}
          name={name}
          tag={tag}
          placeholder={placeHolder}
          required={required}
          onChange={(e) => {
            onChange(e);
            if (onChangeOther) onChangeOther(e);
          }}
          className={`input ${inputClassname}`}
          rows={rows}
        >
          {options.length > 0
            ? options.map((e) => (
                <option value={e.value} key={uuidv4()}>
                  {e.text}
                </option>
              ))
            : null}
        </Input>
      </Col>
    </Row>
  </FormGroup>
);

PatientFormGroup.defaultProps = {
  onChange: null,
  onChangeOther: null,
  inputClassname: '',
  inputSize: 6,
  labelClassname: '',
  label: null,
  labelSize: 6,
  name: null,
  options: [],
  placeHolder: null,
  required: true,
  rows: '15',
  tag: null,
  value: null,
};

PatientFormGroup.propTypes = {
  onChange: PropTypes.func,
  onChangeOther: PropTypes.func,
  inputClassname: PropTypes.string,
  inputSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  labelClassname: PropTypes.string,
  label: PropTypes.string,
  labelSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  options: PropTypes.array,
  placeHolder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tag: PropTypes.string,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PatientFormGroup;
