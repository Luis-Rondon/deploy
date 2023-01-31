import React, { useState } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import ReagendarCitaModal from './ReagendarCitaModal';
import { getDayNameByDate } from '../utils/formulas';
import '../styles/rowCitas.scss';

const RowCitas = ({
  dateData, personalView, deleteItem, editRegister,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const toggleModal = () => setModalIsOpen((prevState) => !prevState);
  return (
    <>
      <Row className="row-citas-item">
        <Col xs="1" className="col-no-padding">
          {getDayNameByDate(dateData.date).substr(0, 1).toUpperCase()}
        </Col>
        <Col
          xs="3"
          md="3"
          className="col-no-padding"
          style={{
            color:
              !personalView && dateData.type === 'reservation'
                ? 'var(--red)'
                : 'var(--gray-dark)',
          }}
        >
          <p>{dateData.schedule}</p>
        </Col>
        <Col xs="7" md="3" className="col-no-padding">
          <p>{dateData.patientName}</p>
        </Col>
        <Col xs="9" md="3" className="col-no-padding">
          <p
            style={{
              color:
                personalView && dateData.type === 'reservation'
                  ? 'var(--red)'
                  : 'var(--gray-dark)',
            }}
          >
            {personalView
              ? dateData.type === 'reservation'
                ? `No disponible: ${dateData.reason}`
                : dateData.reason
              : dateData.doctorName}
          </p>
        </Col>
        <Col xs="3" md="2" className="col-no-padding col-icons">
          <i
            className="icon-edit"
            onClick={() => editRegister(dateData.id, dateData.type)}
            onKeyDown={() => editRegister(dateData.id, dateData.type)}
          />
          <i
            className="icon-delete"
            onClick={() => deleteItem(dateData.id, dateData.type)}
            onKeyDown={() => deleteItem(dateData.id, dateData.type)}
          />
        </Col>
      </Row>
      <ReagendarCitaModal show={modalIsOpen} close={toggleModal} />
    </>
  );
};

RowCitas.propTypes = {
  dateData: PropTypes.object.isRequired,
  personalView: PropTypes.bool.isRequired,
  deleteItem: PropTypes.func.isRequired,
  editRegister: PropTypes.func.isRequired,
};

export default RowCitas;
