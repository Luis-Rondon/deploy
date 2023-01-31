import React from 'react';
import PropTypes from 'prop-types';
import {
  Label, Input, FormGroup, Col, Row,
} from 'reactstrap';
import { capitalizeFirstLetter, setBulletPoint } from '../utils/textTransform';
import '../styles/formGroupPatient.scss';

const FormGroupPatient = ({
  bulletPoint,
  control,
  errors,
  inputClassname,
  inputSize,
  label,
  labelClassname,
  labelSize,
  min,
  minLength,
  maxLength,
  name,
  onChange,
  options,
  pattern,
  placeHolder,
  readOnly,
  register,
  required,
  rows,
  styleInput,
  type,
}) => (
  <FormGroup className="patient-form-group">
    <Row className="row">
      {errors && (
        <p
          style={{
            backgroundColor: 'var(--blue-one)',
            color: 'var(--white)',
            padding: '0rem 0.2rem',
            position: 'absolute',
            top: '-1rem',
          }}
        >
          {errors.type === 'required' ? 'requerido' : errors.message}
        </p>
      )}
      {label && (
        <Col xs={labelSize} className="col">
          <Label className={`label ${labelClassname}`}>{label}</Label>
        </Col>
      )}
      <Col xs={inputSize} className="col">
        <Input
          addon
          className={`input input-readonly ${inputClassname}`}
          control={control}
          disabled={readOnly}
          innerRef={register ? register({ required }) : null}
          min={min}
          minLength={minLength}
          maxLength={maxLength}
          name={name}
          onChange={onChange}
          pattern={pattern}
          placeholder={placeHolder}
          readOnly={readOnly}
          required={register ? null : required}
          rows={rows}
          style={styleInput}
          type={type}
          step="any"
          onKeyUp={capitalizeFirstLetter}
          onKeyDown={(e) => {
            if (bulletPoint) {
              e.target.style.height = 'inherit';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }
            setBulletPoint(e, bulletPoint);
          }}
          autoComplete="on"
        >
          {options.length > 0
            ? options.map((e) => (
              <option value={e.value} key={e.value}>
                {e.text}
              </option>
            ))
            : null}
        </Input>
      </Col>
    </Row>
  </FormGroup>
);

FormGroupPatient.defaultProps = {
  bulletPoint: false,
  control: null,
  errors: null,
  inputClassname: '',
  inputSize: 6,
  label: '',
  labelClassname: '',
  labelSize: 6,
  min: null,
  minLength: null,
  maxLength: null,
  name: null,
  onChange: null,
  options: [],
  pattern: null,
  placeHolder: null,
  readOnly: false,
  register: null,
  required: true,
  rows: '15',
  styleInput: null,
  type: 'text',
};

FormGroupPatient.propTypes = {
  bulletPoint: PropTypes.bool,
  control: PropTypes.oneOfType([PropTypes.object]),
  errors: PropTypes.object,
  inputClassname: PropTypes.string,
  inputSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  labelClassname: PropTypes.string,
  labelSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  minLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  pattern: PropTypes.string,
  placeHolder: PropTypes.string,
  readOnly: PropTypes.bool,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  required: PropTypes.bool,
  rows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  styleInput: PropTypes.object,
  type: PropTypes.string,
};

export default FormGroupPatient;
