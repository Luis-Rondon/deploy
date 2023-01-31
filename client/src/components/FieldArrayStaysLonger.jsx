import React from 'react';
import PropTypes from 'prop-types';
import { useFieldArray } from 'react-hook-form';
import FormGroupCheckbox from './FormGroupCheckbox';
import '../styles/fieldArrayStaysLonger.scss';

const FieldArrayStaysLonger = ({
  control,
  errors,
  part,
  readOnly,
  register,
}) => {
  const { fields } = useFieldArray({
    control,
    name: 'background.staysLonger',
  });

  const sizeFields = fields.length / 6;

  return (
    <>
      {fields.map((item, i) => {
        if (i <= sizeFields && part === 1) {
          return (
            <div key={item.id} className="container-stays-longer">
              <FormGroupCheckbox
                checked={item.value}
                errors={errors?.background?.staysLonger}
                inputSize={2}
                labelSize={7}
                nameInput={`background.staysLonger[${i}].value`}
                nameLabel={`background.staysLonger[${i}].name`}
                readOnly={readOnly}
                register={register}
                typeStyle="dove"
              />
            </div>
          );
        }
        if (i > sizeFields && i <= sizeFields * 2 && part === 2) {
          return (
            <div key={item.id} className="container-stays-longer">
              <FormGroupCheckbox
                checked={item.value}
                errors={errors?.background?.staysLonger}
                inputSize={2}
                labelSize={7}
                nameInput={`background.staysLonger[${i}].value`}
                nameLabel={`background.staysLonger[${i}].name`}
                readOnly={readOnly}
                register={register}
                typeStyle="dove"
              />
            </div>
          );
        }
        if (i > sizeFields * 2 && i <= sizeFields * 3 && part === 3) {
          return (
            <div key={item.id} className="container-stays-longer">
              <FormGroupCheckbox
                checked={item.value}
                errors={errors?.background?.staysLonger}
                inputSize={2}
                labelSize={7}
                nameInput={`background.staysLonger[${i}].value`}
                nameLabel={`background.staysLonger[${i}].name`}
                readOnly={readOnly}
                register={register}
                typeStyle="dove"
              />
            </div>
          );
        }
        if (i > sizeFields * 3 && i <= sizeFields * 4 && part === 4) {
          return (
            <div key={item.id} className="container-stays-longer">
              <FormGroupCheckbox
                checked={item.value}
                errors={errors?.background?.staysLonger}
                inputSize={2}
                labelSize={7}
                nameInput={`background.staysLonger[${i}].value`}
                nameLabel={`background.staysLonger[${i}].name`}
                readOnly={readOnly}
                register={register}
                typeStyle="dove"
              />
            </div>
          );
        }
        if (i > sizeFields * 4 && i <= sizeFields * 5 && part === 5) {
          return (
            <div key={item.id} className="container-stays-longer">
              <FormGroupCheckbox
                checked={item.value}
                errors={errors?.background?.staysLonger}
                inputSize={2}
                labelSize={7}
                nameInput={`background.staysLonger[${i}].value`}
                nameLabel={`background.staysLonger[${i}].name`}
                readOnly={readOnly}
                register={register}
                typeStyle="dove"
              />
            </div>
          );
        }
        if (i > sizeFields * 5 && part === 6) {
          return (
            <div key={item.id} className="container-stays-longer">
              <FormGroupCheckbox
                checked={item.value}
                errors={errors?.background?.staysLonger}
                inputSize={2}
                labelSize={10}
                nameInput={`background.staysLonger[${i}].value`}
                nameLabel={`background.staysLonger[${i}].name`}
                readOnly={readOnly}
                register={register}
                typeStyle="dove"
              />
            </div>
          );
        }
        return null;
      })}
    </>
  );
};

FieldArrayStaysLonger.defaultProps = {
  errors: null,
  readOnly: false,
};

FieldArrayStaysLonger.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  readOnly: PropTypes.bool,
  part: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
};

export default FieldArrayStaysLonger;
