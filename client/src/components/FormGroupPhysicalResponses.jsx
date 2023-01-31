import React from 'react';
import PropTypes from 'prop-types';
import {
  Input, FormGroup, Col, Row, Label,
} from 'reactstrap';
import backgroundStrikeout from '../assets/csscheckbox-strikeout.png';
import backgroundDove from '../assets/csscheckbox-dove.png';
import '../styles/formGroupPhysicalResponses.scss';

const FormGroupPhysicalResponses = ({
  errors,
  inputClassname = '',
  labelClassname = '',
  nameLabel,
  readOnly,
  register,
  required = false,
  statusOneName,
  statusTwoName,
  valueOneName,
  valueTwoName,
}) => (
  <FormGroup className="physical-responses-form-group">
    <Row className="row">
      {errors && (
        <p
          style={{
            backgroundColor: 'var(--blue-one)',
            color: 'var(--white)',
            padding: '0rem 0.2rem',
            position: 'absolute',
            top: '-1.5rem',
          }}
        >
          {errors.type}
          {' '}
          {errors.message}
        </p>
      )}
      <Col xs={4} className="col">
        <Input
          addon
          name={nameLabel}
          readOnly
          innerRef={register({ required })}
          className={`input-readonly title ${labelClassname}`}
          autoComplete="on"
        />
      </Col>
      <Col xs={3} className="col">
        <Input
          addon
          name={statusOneName}
          readOnly
          innerRef={register({ required })}
          className={`input-readonly text ${labelClassname}`}
          autoComplete="on"
        />
      </Col>
      <Col xs={1} className="col">
        <Input
          addon
          className={`checkbox-input-custom ${inputClassname}`}
          disabled={readOnly}
          id={valueOneName}
          innerRef={register({ required })}
          name={valueOneName}
          type="checkbox"
        />
        <Label
          className="checkbox-label-custom"
          htmlFor={valueOneName}
          style={{
            backgroundImage: `url(${backgroundDove})`,
          }}
        />
      </Col>
      <Col xs={3} className="col">
        <Input
          addon
          name={statusTwoName}
          readOnly
          innerRef={register({ required })}
          className={`input-readonly text ${labelClassname}`}
          autoComplete="on"
        />
      </Col>
      <Col xs={1} className="col">
        <Input
          addon
          className={`checkbox-input-custom ${inputClassname}`}
          disabled={readOnly}
          id={valueTwoName}
          innerRef={register({ required })}
          name={valueTwoName}
          type="checkbox"
        />
        <Label
          className="checkbox-label-custom"
          htmlFor={valueTwoName}
          style={{
            backgroundImage: `url(${backgroundStrikeout})`,
          }}
        />
      </Col>
    </Row>
  </FormGroup>
);

FormGroupPhysicalResponses.defaultProps = {
  errors: {},
  inputClassname: '',
  labelClassname: '',
  nameLabel: null,
  required: false,
};

FormGroupPhysicalResponses.propTypes = {
  errors: PropTypes.object,
  inputClassname: PropTypes.string,
  labelClassname: PropTypes.string,
  nameLabel: PropTypes.string,
  readOnly: PropTypes.bool.isRequired,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  required: PropTypes.bool,
  statusOneName: PropTypes.string.isRequired,
  statusTwoName: PropTypes.string.isRequired,
  valueOneName: PropTypes.string.isRequired,
  valueTwoName: PropTypes.string.isRequired,
};

export default FormGroupPhysicalResponses;
