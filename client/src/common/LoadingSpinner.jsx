import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';

const LoadingSpinner = ({ size, text }) => {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <Spinner
        style={{
          color: 'var(--blue-one)',
          height: `${size}rem`,
          width: `${size}rem`,
        }}
      />
      <p
        style={{
          fontSize: `${size - 4}rem`,
        }}
      >
        {text}
      </p>
    </div>
  );
};

LoadingSpinner.defaultProps = {
  size: 6,
  text: 'Cargando ...',
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  text: PropTypes.string,
};

export default LoadingSpinner;
