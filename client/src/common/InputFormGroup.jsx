import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  Label, Input, FormGroup, Col, Row,
} from 'reactstrap';
import { Controller } from 'react-hook-form';
import SelectSearch from 'react-select-search';
import backgroundStrikeoutDove from '../assets/csscheckbox.png';
import { capitalizeFirstLetter } from '../utils/textTransform';
import '../styles/inputFormGroup.scss';

const InputFormGroup = ({
  accept,
  checked,
  columnSize,
  control,
  errors,
  getOptions,
  icon,
  iconFile,
  inputClassname,
  inputFileSimple,
  inputSearch,
  inputSizeSm,
  inputSize,
  label,
  labelClassname,
  labelSizeSm,
  labelSize,
  multiple,
  max,
  min,
  miniButtonFile,
  minLength,
  maxLength,
  name,
  onChange,
  options,
  pattern,
  placeHolder,
  printOptions,
  readOnly,
  required,
  register,
  rows,
  search,
  type,
}) => {
  return (
    <FormGroup className="form-group">
      <Row className={columnSize === 6 ? 'line' : ''}>
        {errors && (
          <p
            style={{
              backgroundColor: 'var(--blue-one)',
              color: 'var(--white)',
              left: '0.5rem',
              padding: '0rem 0.2rem',
              position: 'absolute',
              bottom: '-1rem',
              zIndex: '1',
            }}
          >
            {errors.type === 'required' ? 'requerido' : errors.message}
          </p>
        )}
        {type !== 'checkbox' && label && (
          <Col
            xs={labelSizeSm || labelSize || columnSize}
            md={labelSize || columnSize}
          >
            <Label
              className={`label ${labelClassname} ${
                type === 'file' ? 'file-label-custom-text' : ''
              }`}
            >
              {label}
            </Label>
          </Col>
        )}
        <Col
          xs={inputSizeSm || inputSize || columnSize}
          md={inputSize || columnSize}
        >
          {inputSearch && (
            <Controller
              as={SelectSearch}
              control={control}
              getOptions={getOptions}
              name={name}
              options={options}
              placeholder={placeHolder}
              search={search}
              disabled={readOnly}
              required={required}
              autoComplete="on"
              multiple={multiple}
              closeOnSelect
              printOptions={printOptions}
              debounce={1500}
            />
          )}
          {!inputSearch && (
            <Input
              accept={accept}
              addon
              checked={checked}
              className={`input ${inputClassname} ${
                type === 'checkbox' ? 'checkbox-input-custom' : ''
              }  ${columnSize === 12 ? 'line-bot' : 'line-not'} ${
                type === 'file'
                  ? miniButtonFile
                    ? 'file-input-custom-mini'
                    : 'file-input-custom'
                  : ''
              }`}
              id={name}
              innerRef={register ? register({ required }) : null}
              maxLength={maxLength}
              minLength={minLength}
              max={max}
              min={min}
              multiple={multiple}
              name={name}
              onChange={onChange}
              pattern={pattern}
              placeholder={placeHolder}
              readOnly={readOnly}
              rows={rows}
              type={type}
              onKeyUp={capitalizeFirstLetter}
              autoComplete="on"
            >
              {options.length > 0
                ? options.map((e) => (
                  <option value={e.value} key={uuidv4()}>
                    {e.text}
                  </option>
                ))
                : null}
            </Input>
          )}
          {type === 'checkbox' && (
            <Label
              className="checkbox-label-custom"
              htmlFor={name}
              style={{
                backgroundImage: `url(${backgroundStrikeoutDove})`,
              }}
            />
          )}
          {type === 'file'
            && (inputFileSimple ? (
              <Label htmlFor={name} className="file-label-custom-simple">
                <span className="text">Subir archivos</span>
              </Label>
            ) : (
              <Label
                htmlFor={name}
                className={`file-label-custom-cube${
                  miniButtonFile ? '-mini' : ''
                }`}
              >
                <span className="text">
                  <i className={`icon icon-${iconFile}`} />
                  {label}
                </span>
              </Label>
            ))}
          {type === 'checkbox' && (
            <Label className={labelClassname}>{label}</Label>
          )}
        </Col>
      </Row>
      <span className={`icon icon-${icon}`} />
    </FormGroup>
  );
};

InputFormGroup.defaultProps = {
  accept: null,
  checked: null,
  columnSize: 12,
  control: {},
  errors: null,
  getOptions: () => null,
  icon: null,
  iconFile: null,
  inputClassname: '',
  inputFileSimple: false,
  inputSearch: false,
  inputSize: null,
  inputSizeSm: null,
  label: null,
  labelClassname: '',
  labelSize: null,
  labelSizeSm: null,
  multiple: false,
  min: null,
  max: null,
  miniButtonFile: false,
  minLength: null,
  maxLength: null,
  onChange: () => null,
  options: [],
  pattern: null,
  placeHolder: null,
  printOptions: 'auto',
  readOnly: false,
  register: null,
  required: true,
  search: true,
  rows: null,
};

InputFormGroup.propTypes = {
  accept: PropTypes.string,
  checked: PropTypes.bool,
  columnSize: PropTypes.number,
  control: PropTypes.object,
  errors: PropTypes.object,
  getOptions: PropTypes.func,
  icon: PropTypes.string,
  iconFile: PropTypes.string,
  inputClassname: PropTypes.string,
  inputFileSimple: PropTypes.bool,
  inputSearch: PropTypes.bool,
  inputSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  inputSizeSm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  labelClassname: PropTypes.string,
  labelSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  labelSizeSm: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  multiple: PropTypes.bool,
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  miniButtonFile: PropTypes.bool,
  minLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array,
  pattern: PropTypes.string,
  placeHolder: PropTypes.string,
  printOptions: PropTypes.string,
  readOnly: PropTypes.bool,
  register: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  required: PropTypes.bool,
  rows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  search: PropTypes.bool,
  type: PropTypes.string.isRequired,
};

export default InputFormGroup;
