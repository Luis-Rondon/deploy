import React, { useEffect, useState, useContext } from 'react';
import { Col, Row, Container } from 'reactstrap';
import PropTypes from 'prop-types';
import UserData from '../context/UserData';
import { getAllReservationSchedules } from '../actions/ReservesAction';
import '../styles/scheduleList.scss';

const defaultEventListValue = [
  {
    id: 0,
    time: '',
    type: '',
    description: 'Cargando...',
  },
];

const ScheduleList = ({ date, selectTime, edit }) => {
  const [schedules, setSchedules] = useState(defaultEventListValue);
  const { userData } = useContext(UserData);

  useEffect(() => {
    getAllReservationSchedules(userData.id, date, edit)
      .then((data) => setSchedules(() => data))
      .catch((error) => setSchedules(() => error));
    // eslint-disable-next-line
  }, [date]);

  const verifyScheduleDisponibility = (evento) => {
    if (evento.type === 'free') {
      selectTime(evento.schedule);
    }
  };

  return (
    <Container fluid className="schedule-list">
      {schedules.map((event) => (
        <Row key={event.id} className="row-item">
          <Col xs="5" md="5" className="pr-0">
            <p
              className="text-time"
              onClick={() => verifyScheduleDisponibility(event)}
              onKeyPress={() => verifyScheduleDisponibility(event)}
              role="presentation"
              style={{
                color:
                  event.type === 'free'
                    ? 'var(--blue-one)'
                    : 'var(--gray-dark)',
              }}
            >
              {event.schedule}
            </p>
          </Col>
          <Col xs="7" md="7" className="pl-0">
            <p className="text-description">
              {event.type === 'reservation'
                ? `No disponible: ${event.description}`
                : event.description}
            </p>
          </Col>
        </Row>
      ))}
    </Container>
  );
};

ScheduleList.defaultProps = {
  edit: false,
};

ScheduleList.propTypes = {
  date: PropTypes.string.isRequired,
  selectTime: PropTypes.func.isRequired,
  edit: PropTypes.bool,
};

export default ScheduleList;
