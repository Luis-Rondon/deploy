import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Input } from 'reactstrap';
import { getUserById } from '../actions/UserAction';
import '../styles/rowItemTable.scss';

const RowDateHistory = ({ item, setHistoryToEdit }) => {
  const [doctorName, setDoctorName] = useState('');
  const [arrivedState, setArrivedState] = useState(item.arrivedState);
  const date = item.date.split('-').reverse().join('/');

  useEffect(() => {
    getUserById(item.doctorIdAssigned)
      .then((data) => setDoctorName(data.data.username))
      .catch(() => null);
    // eslint-disable-next-line
  }, []);

  const changeArrivedState = (e) => {
    setHistoryToEdit({
      id: item.id,
      value: e.target.value,
    });
    setArrivedState(e.target.value);
  };

  return (
    <Row className="row-date-history row-item-table">
      <Col xs="6" lg="1" className="col col-date">
        {item.dateNumberGroup && (
          <p>{`${item.dateNumberGroup}/${item.dateTotalGroup}`}</p>
        )}
      </Col>
      <Col xs="6" lg="2" className="col col-date">
        <p>{date.slice(0, 7) + date.slice(9)}</p>
      </Col>
      <Col xs="12" lg="2" className="col col-schedule">
        <p>{item.schedule.replace(/am/g, '').replace(/pm/g, '')}</p>
      </Col>
      <Col xs="12" lg="3" className="col col-reason">
        {/* <p>{item.reason}</p> */}
        {item.reasonNotArrived && (
        <Col xs="12" className="col">
          <p>{`${item.reasonNotArrived}`}</p>
        </Col>
        )}
      </Col>
      <Col xs="5" lg="2" className="col col-new-date">
        <p className="ml-2">{doctorName}</p>
      </Col>
      <Col xs="7" lg="2" className="col col-dowload">
        <Input
          className="input checkbox-input-custom"
          type="select"
          onChange={changeArrivedState}
          value={arrivedState}
          // disabled
        >
          <option value="Sin confirmar">Sin confirmar</option>
          <option value="No llegó a la cita">No llegó a la cita</option>
          <option value="Llegó a la cita">Llegó a la cita</option>
        </Input>
      </Col>
    </Row>
  );
};

RowDateHistory.propTypes = {
  item: PropTypes.object.isRequired,
  setHistoryToEdit: PropTypes.func.isRequired,
};

export default RowDateHistory;
