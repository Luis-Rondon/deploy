import React from 'react';
import PropTypes from 'prop-types';
import '../styles/customModal.scss';

const CustomModal = ({
  children, close, show, title,
}) => (
  <>
    {show && (
      <div
        className="custom-modal-background"
        onClick={close}
        onKeyDown={close}
      />
    )}
    <div
      className="custom-modal-wrapper"
      style={{
        opacity: show ? '1' : '0',
        transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
      }}
    >
      <span className="icon-close" onClick={close} onKeyDown={close} />
      {title && (
        <div className="header">
          <h2 className="title">{title}</h2>
        </div>
      )}
      <div className="body">{children}</div>
    </div>
  </>
);

CustomModal.defaultProps = {
  title: null,
};

CustomModal.propTypes = {
  children: PropTypes.node.isRequired,
  close: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

export default CustomModal;
