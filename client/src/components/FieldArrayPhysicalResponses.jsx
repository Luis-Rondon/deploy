import React from 'react';
import PropTypes from 'prop-types';
import { useFieldArray } from 'react-hook-form';
import FormGroupPhysicalResponses from './FormGroupPhysicalResponses';

const FieldArrayPhysicalResponses = ({
  control,
  register,
  errors,
  readOnly,
}) => {
  const { fields } = useFieldArray({
    control,
    name: 'otherVariables.physicalResponses',
  });

  return (
    <>
      {fields.map((item, i) => (
        <FormGroupPhysicalResponses
          errors={errors?.otherVariables?.physicalResponses}
          key={item.id}
          nameLabel={`otherVariables.physicalResponses[${i}].name`}
          statusOneName={`otherVariables.physicalResponses[${i}].statusOneName`}
          statusTwoName={`otherVariables.physicalResponses[${i}].statusTwoName`}
          valueOneName={`otherVariables.physicalResponses[${i}].statusOneValue`}
          valueTwoName={`otherVariables.physicalResponses[${i}].statusTwoValue`}
          readOnly={readOnly}
          register={register}
        />
      ))}
    </>
  );
};

FieldArrayPhysicalResponses.defaultProps = {
  errors: null,
  readOnly: false,
};

FieldArrayPhysicalResponses.propTypes = {
  control: PropTypes.object.isRequired,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  errors: PropTypes.object,
  readOnly: PropTypes.bool,
};

export default FieldArrayPhysicalResponses;
