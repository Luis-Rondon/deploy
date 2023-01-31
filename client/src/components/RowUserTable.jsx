import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Media, Row, Col } from 'reactstrap';
import '../styles/rowItemTable.scss';
import profilePic from '../assets/user-profile-default.jpg';
import UserData from '../context/UserData';
import InputFormGroup from '../common/InputFormGroup';

const RowUserTable = ({
  item,
  handleDeleteRegister,
  handleChangeRoleRegister,
}) => {
  const { userData } = useContext(UserData);
  const [passwordVisible, setpasswordVisible] = useState(false);
  const [editRole, setEditRole] = useState(false);
  const checKDeleteUser = (item) => {
    if (item.id === userData?.id) {
      return false;
    }
    return true;
  };
  const toggleIcon = (e) => {
    setpasswordVisible(!passwordVisible);
    e.target.style.opacity = !passwordVisible ? '0.6' : '1';
  };
  const editIcon = () => {
    setEditRole(!editRole);
  };

  return (
    <Row className="row-user row-item-table">
      <Col xs="2" lg="1" className="col col-number">{`#${item.number}`}</Col>
      <Col xs="2" lg="1" className="col col-image">
        <Media
          src={item.profile_pic_url || profilePic}
          className="profile-pic-custom image"
        />
      </Col>
      <Col xs="5" lg="2" className="col col-username">
        {item.username}
      </Col>
      <Col xs="5" lg="3" className="col col-email">
        {item.email}
      </Col>
      <Col xs="4" lg="2" className="col col-role">
        {!editRole ? (
          item.role
        ) : (
          <div>
            <InputFormGroup
              className="d-inline-block"
              type="select"
              name="role"
              options={[
                { value: '', text: 'Seleccionar' },
                { value: 'Administrador', text: 'Administrador' },
                { value: 'Editor', text: 'Editor' },
                { value: 'Colaborador', text: 'Colaborador' },
              ]}
              onChange={(e) => {
                const role = e.target.value;
                if (role !== '') {
                  handleChangeRoleRegister(item, role);
                }
              }}
            />
          </div>
        )}
      </Col>
      <Col xs="1" lg="1" className="col col-role-btn p-0">
        <i
          className="icon-edit"
          title="Editar"
          onClick={editIcon}
          onKeyDown={editIcon}
        />
      </Col>
      <Col xs="5" lg="2" className="col col-password">
        {passwordVisible ? atob(item.password) : '********'}
        <i className="icon-view" onClick={toggleIcon} onKeyDown={toggleIcon} />
      </Col>
      {checKDeleteUser(item) && (
        <i
          className="icon-delete btn-delete-user"
          onClick={() => handleDeleteRegister(item)}
          onKeyDown={() => handleDeleteRegister(item)}
        />
      )}
    </Row>
  );
};

RowUserTable.propTypes = {
  item: PropTypes.object.isRequired,
  handleDeleteRegister: PropTypes.func.isRequired,
  handleChangeRoleRegister: PropTypes.func.isRequired,
};

export default RowUserTable;
