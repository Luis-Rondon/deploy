import React from 'react';
import PropTypes from 'prop-types';
import {
  Input, FormGroup, Col, Row, Label,
} from 'reactstrap';
import '../styles/formGroupCheckbox.scss';
import backgroundStrikeout from '../assets/csscheckbox-strikeout.png';
import backgroundDove from '../assets/csscheckbox-dove.png';
import backgroundStrikeoutDove from '../assets/csscheckbox.png';

const FormGroupCheckbox = ({
  errors,
  inputClassname = '',
  inputSize = 6,
  labelClassname = '',
  labelSize = 6,
  nameInput,
  nameLabel,
  onChange,
  readOnly = false,
  required = false,
  register,
  typeStyle,
}) => (
  <FormGroup className="checkbox-form-group">
    <Row className="row">
      {errors && (
        <p
          style={{
            position: 'absolute',
            top: '-1.5rem',
            backgroundColor: 'var(--blue-one)',
            padding: '0rem 0.2rem',
            color: 'var(--white)',
          }}
        >
          {errors.type}
          {' '}
          {errors.message}
        </p>
      )}
      <Col xs={inputSize} className="col">
        <Input
          addon
          innerRef={register({ required })}
          type="checkbox"
          disabled={readOnly}
          id={nameInput}
          name={nameInput}
          onChange={onChange}
          className={`checkbox-input-custom ${inputClassname}`}
          autoComplete="on"
        />
        <Label
          htmlFor={nameInput}
          className="checkbox-label-custom"
          style={{
            backgroundImage: `url(${
              typeStyle === 'strikeout'
                ? backgroundStrikeout
                : typeStyle === 'dove'
                  ? backgroundDove
                  : backgroundStrikeoutDove
            })`,
          }}
        />
      </Col>
      <Col xs={labelSize} className="col">
        <Input
          addon
          name={nameLabel}
          readOnly
          innerRef={register()}
          className={`input-readonly ${labelClassname}`}
          autoComplete="on"
        />
      </Col>
    </Row>
  </FormGroup>
);

FormGroupCheckbox.defaultProps = {
  errors: {},
  inputClassname: '',
  inputSize: 6,
  labelClassname: '',
  labelSize: 6,
  nameInput: null,
  nameLabel: null,
  onChange: null,
  readOnly: false,
  required: false,
};

FormGroupCheckbox.propTypes = {
  errors: PropTypes.object,
  inputClassname: PropTypes.string,
  inputSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  labelClassname: PropTypes.string,
  labelSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  nameInput: PropTypes.string,
  nameLabel: PropTypes.string,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  typeStyle: PropTypes.oneOf(['dove', 'strikeout']).isRequired,
};

export default FormGroupCheckbox;
