import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import '../styles/customAlert.scss';

const CustomAlert = ({ color = 'blue-one', spinnerDisplay, text }) => {
  return (
    <div
      className="custom-alert"
      style={{
        backgroundColor: `var(--${color})`,
      }}
    >
      <Spinner
        className="spinner"
        style={{
          display: spinnerDisplay ? 'block' : 'none',
          height: `${1}rem`,
          width: `${1}rem`,
        }}
      />
      <p>{text}</p>
    </div>
  );
};

CustomAlert.defaultProps = {
  color: 'red',
  spinnerDisplay: false,
  text: '',
};

CustomAlert.propTypes = {
  color: PropTypes.oneOf(['red', 'green', 'blue-one', 'blue-two', '']),
  spinnerDisplay: PropTypes.bool,
  text: PropTypes.string,
};

export default CustomAlert;
