import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Media,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Label,
  Button,
} from 'reactstrap';
import '../styles/navbar.scss';
import userProfilePic from '../assets/user-profile-default.jpg';
import {
  uploadProfilePicUser,
  deleteProfilePicUserByName,
  updateUserById,
} from '../actions/UserAction';
import CustomModal from './CustomModal';
import CustomAlert from './CustomAlert';
import UserData from '../context/UserData';
import InputFormGroup from './InputFormGroup';

const Navbar = ({ history, search }) => {
  const { userData, clearUserData } = useContext(UserData);

  const [alert, setAlert] = useState({
    color: '',
    status: false,
    text: '',
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [profilePicUpload, setProfilePicUpload] = useState();

  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const toggleModal = () => setModalIsOpen((prevState) => !prevState);

  const filesSelected = (input) => {
    const label = input.nextElementSibling;
    const labelVal = 'Archivo seleccionado';
    label.querySelector('span').innerHTML = labelVal;
    label.querySelector('span').style.color = 'var(--green)';
    label.querySelector('span').style.fontWeight = '700';
  };

  const profilePicChange = (e) => {
    filesSelected(e.target);
    setProfilePicUpload(e.target.files[0]);
  };

  const updateProfilePic = async () => {
    if (!profilePicUpload) return;
    setAlert({ status: true, text: 'Cargando...', color: 'blue-two' });
    await deleteProfilePicUserByName(userData.profile_pic_name)
      .then(() => null)
      .catch(() => setAlert({
        status: true,
        text: 'Hubo un error al eliminar la imagen anterior',
        color: 'red',
      }));

    await uploadProfilePicUser(profilePicUpload)
      .then((result) => {
        const newProfilePic = {
          profile_pic_url: result.downloadURL,
          profile_pic_name: result.imageName,
        };
        return updateUserById(userData.id, newProfilePic);
      })
      .then(() => {
        setProfilePicUpload(null);
        setAlert({
          status: true,
          text: 'Imagen cambiada con éxito',
          color: 'green',
        });
        window.location.reload();
      })
      .catch(() => setAlert({
        status: true,
        text: 'Hubo un error al cambiar la imagen, intente más tarde',
        color: 'red',
      }));
    setTimeout(
      () => setAlert((prevState) => ({ ...prevState, status: false })),
      3000,
    );
  };

  return (
    <>
      <Row className="navbar">
        <Col xs="2" md="1" />
        <Col xs="6" md="6" className="col-input-search">
          {search ? (
            <Row>
              <Col xs="12" lg="6" className="column">
                <span className="icon-search" />
                <Input
                  id="input-search-filter-patient"
                  className="input-search"
                  placeholder="Nombre del paciente"
                  onChange={(e) => search(e.target)}
                  autoComplete="on"
                />
              </Col>
              <Col xs="12" lg="6" className="column">
                <span className="icon-search" />
                <Input
                  id="input-search-filter-doctor"
                  className="input-search"
                  placeholder="Terapeuta"
                  onChange={(e) => search(e.target)}
                  autoComplete="on"
                />
              </Col>
            </Row>
          ) : null}
        </Col>
        <Col xs="1" md="3" className="col-username">
          <p className="username">{userData ? userData.username : null}</p>
        </Col>
        <Col xs="2" sm="1" className="profile-pic-col">
          <Media
            className="profile-pic"
            src={userData ? userData.profile_pic_url : null}
          />
        </Col>
        <Col xs="1" className="col-settings">
          <Dropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle className="dropdown" color="" caret>
              <span className="icon-settings" />
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>
                <Label onClick={toggleModal}>Cambiar foto de perfil</Label>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem
                onClick={async () => {
                  await clearUserData();
                  history.push('/logout');
                }}
              >
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Col>
      </Row>

      <CustomModal
        show={modalIsOpen}
        close={toggleModal}
        title="Selecciona una nueva imagen para tu foto de perfil"
      >
        <Row className="modal-profile-pic">
          {alert.status ? (
            <CustomAlert text={alert.text} color={alert.color} />
          ) : null}
          <Col xs="6">
            <InputFormGroup
              name="input-profile-pic-user-change"
              type="file"
              onChange={profilePicChange}
              accept="image/*"
              inputFileSimple
            />
          </Col>
          <Col xs="6">
            <Media
              className="profile-pic-custom profile-pic"
              src={
                profilePicUpload
                  ? URL.createObjectURL(profilePicUpload)
                  : userProfilePic
              }
            />
          </Col>
          <Col xs="12" className="col-buttons">
            <Button
              className="btn-custom-cancel"
              color=""
              onClick={toggleModal}
            >
              Cancelar
            </Button>
            <Button className="btn-custom" color="" onClick={updateProfilePic}>
              Cambiar
            </Button>
          </Col>
        </Row>
      </CustomModal>
    </>
  );
};

Navbar.defaultProps = {
  search: null,
};

Navbar.propTypes = {
  history: PropTypes.object.isRequired,
  search: PropTypes.func,
};

export default Navbar;
