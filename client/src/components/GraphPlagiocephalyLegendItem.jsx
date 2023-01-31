import React from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import '../styles/fieldArrayIndicators.scss';

const PlagiocephalyLegendItem = ({
  title,
  color,
}) => {
  return (
    <Row className="row-field-array-indicators">
      <Col style={{
        backgroundColor: color,
        height: '1.5em',
      }}
      >
        {' '}
      </Col>
      <Col xs="10">
        {title}
      </Col>
    </Row>
  );
};

PlagiocephalyLegendItem.defaultProps = {
  title: '',
  color: '',
};

PlagiocephalyLegendItem.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
};

export default PlagiocephalyLegendItem;
