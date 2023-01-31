import React from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import { useFieldArray } from 'react-hook-form';
import FormGroupCheckbox from './FormGroupCheckbox';
import '../styles/fieldArrayIndicators.scss';

const FieldArrayIndicators = ({
  control,
  register,
  errors,
  readOnly,
  setValue,
}) => {
  const { fields } = useFieldArray({
    control,
    name: 'otherVariables.indicators',
  });

  const onChange = (e) => {
    fields.forEach((indicator, index) => {
      const name = `otherVariables.indicators[${index}].value`;
      if (name !== e.target.name) setValue(name, false);
    });
  };

  return (
    <Row className="row-field-array-indicators">
      {fields.map((item, i) => (
        <Col
          xs="3"
          md="1"
          key={item.id}
          style={{
            padding: '0px',
          }}
        >
          <FormGroupCheckbox
            errors={errors?.otherVariables?.indicators}
            labelSize={6}
            inputSize={5}
            labelClassname="text"
            nameInput={`otherVariables.indicators[${i}].value`}
            nameLabel={`otherVariables.indicators[${i}].name`}
            readOnly={readOnly}
            register={register}
            typeStyle={i <= 4 ? 'strikeout' : 'dove'}
            onChange={onChange}
          />
        </Col>
      ))}
    </Row>
  );
};

FieldArrayIndicators.defaultProps = {
  errors: null,
  readOnly: false,
  setValue: null,
};

FieldArrayIndicators.propTypes = {
  control: PropTypes.object.isRequired,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  errors: PropTypes.object,
  readOnly: PropTypes.bool,
  setValue: PropTypes.func,
};

export default FieldArrayIndicators;
