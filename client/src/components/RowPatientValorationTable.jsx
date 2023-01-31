/* eslint-disable max-len */
import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Media, Row, Col, Button, Label,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import '../styles/rowItemTable.scss';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import { Link } from 'react-router-dom';
import profilePic from '../assets/user-profile-default.jpg';
import FormGroupCheckbox from './FormGroupCheckbox';
import UserData from '../context/UserData';

const RowPatientValorationTable = ({
  handleDeleteRegister,
  handleDownloadRegister,
  handleFreeRegister,
  handleStopRegister,
  item,
}) => {
  const { userData } = useContext(UserData);
  const { register } = useForm({ defaultValues: item });
  const [indicator, setIndicator] = useState(-1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdownOpen = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    const found = item.otherVariables?.indicators?.findIndex(
      (indicator) => indicator.value === true,
    );
    setIndicator(found);
    // eslint-disable-next-line
  }, []);

  return (
    <Row className="row-patient-valoration row-item-table">
      <Col xs="3" lg="1" className="col col-number">
        #
        {item.folio || item.number}
      </Col>
      <Col xs="2" lg="1" className="col col-image">
        <Media
          src={item.profile_pic_url || profilePic}
          className="profile-pic-custom image"
        />
      </Col>
      <Col xs="6" lg="3" className="col col-name">
        {item.general.name}
      </Col>
      <Col xs="5" lg="1" className="col col-gestaion-weeks">
        {item.general.sg}
        {' '}
        SG
      </Col>
      <Col xs="4" lg="1" className="col col-cs">
        {item.otherVariables?.indicators && indicator !== -1 ? (
          <FormGroupCheckbox
            checked={
              item.otherVariables?.indicators
                ? item.otherVariables?.indicators[indicator].value
                : false
            }
            inputSize={6}
            labelSize={6}
            nameInput={`otherVariables.indicators[${indicator}].value`}
            nameLabel={`otherVariables.indicators[${indicator}].name`}
            readOnly
            register={register}
            typeStyle={indicator <= 4 ? 'strikeout' : 'dove'}
          />
        ) : (
          <Label className="label-pts">
            {item?.indicatorCheckForm
              ? `${item?.indicatorCheckForm || ''} - PTS ${
                  item?.scoreEvaluationForm || '0'
              }`
              : ''}
          </Label>
        )}
      </Col>
      <Col xs="4" lg="2" className="col col-btn">
        <Button className="btn-custom btn-watch" color="">
          <Link to={`/pacientes/ver/${item.id}`} target="_blank">
            Ver expediente
          </Link>
        </Button>
      </Col>
      <Col xs="12" lg="3" className="col col-icons">
        {userData && userData.role !== 'Colaborador' && (
          <Link to={`/pacientes/citas/${item.id}`} target="_blank">
            <i className="icon-history" title="Historial de citas" />
          </Link>
        )}
        {userData && userData.role === 'Administrador' && (
          <Link to={`/pacientes/formato-citas/${item.id}`} target="_blank">
            <i className="fas fa-file-invoice" title="Bitácora de citas" />
          </Link>
        )}
        {userData && userData.role !== 'Colaborador' && (
          <Link to={`/pacientes/formato/editar/${item.id}`} target="_blank">
            <i className="icon-edit" title="Editar" />
          </Link>
        )}
        {userData && userData.role !== 'Colaborador' && (
          <i
            className="icon-dowload"
            title="Descargar expediente"
            onClick={() => handleDownloadRegister(item)}
            onKeyDown={() => handleDownloadRegister(item)}
          />
        )}
        {userData && userData.role === 'Administrador' && (
          <Link to={`/pacientes/oficio/${item.id}`} target="_blank">
            <i
              className="icon fas fa-file-alt"
              title="Generar oficio de historial"
            />
          </Link>
        )}
        {userData && userData.role === 'Administrador' && (
          <ButtonDropdown
            isOpen={dropdownOpen}
            toggle={toggleDropdownOpen}
            title="Acciones"
          >
            <DropdownToggle caret size="sm">
              <i className="fas fa-ellipsis-v" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem>
                <span
                  className="icon icon-patient-free"
                  onClick={() => handleFreeRegister(item)}
                  onKeyDown={() => handleFreeRegister(item)}
                  title="Dar de alta"
                >
                  <span className="path1" />
                  <span className="path2" />
                  <span className="path3" />
                  <span className="path4" />
                  <span className="path5" />
                  <span className="path6" />
                  <span className="path7" />
                </span>
              </DropdownItem>
              <DropdownItem>
                <span
                  className="icon icon-patient-cancel"
                  onClick={() => handleStopRegister(item)}
                  onKeyDown={() => handleStopRegister(item)}
                  title="Suspender"
                >
                  <span className="path1" />
                  <span className="path2" />
                  <span className="path3" />
                  <span className="path4" />
                  <span className="path5" />
                  <span className="path6" />
                  <span className="path7" />
                  <span className="path8" />
                </span>
              </DropdownItem>
              <DropdownItem>
                <i
                  className="icon-delete"
                  onClick={() => handleDeleteRegister(item)}
                  onKeyDown={() => handleDeleteRegister(item)}
                  title="Borrar"
                />
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        )}
      </Col>
    </Row>
  );
};

RowPatientValorationTable.propTypes = {
  handleDeleteRegister: PropTypes.func.isRequired,
  handleDownloadRegister: PropTypes.func.isRequired,
  handleFreeRegister: PropTypes.func.isRequired,
  handleStopRegister: PropTypes.func.isRequired,
  item: PropTypes.object.isRequired,
};

export default RowPatientValorationTable;
