import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Form, Button,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import authHOC from '../utils/authHOC';
import {
  createUser,
  getUserByEmail,
  uploadProfilePicUser,
} from '../actions/UserAction';
import CustomAlert from '../common/CustomAlert';
import Navbar from '../common/Navbar';
import Menu from '../common/Menu';
import InputFormGroup from '../common/InputFormGroup';
import '../styles/addUser.scss';
import { UserModel } from '../models/UserType';

const AddUser = ({ history }) => {
  const [alert, setAlert] = useState({
    status: false,
    text: '',
    color: '',
  });

  const { register, handleSubmit, errors } = useForm({
    defaultValues: UserModel,
  });

  const filesSelected = (input) => {
    const label = input.nextElementSibling;
    const labelVal = 'Archivo seleccionado';
    label.querySelector('span').innerHTML = labelVal;
    label.querySelector('span').style.color = 'var(--green)';
    label.querySelector('span').style.fontWeight = '700';
  };

  const catchData = async (data) => {
    if (data.confirm_password !== data.password) {
      setAlert({
        status: true,
        text: 'Las contraseñas no coinciden',
        color: 'red',
      });
      return;
    }

    setAlert({ status: true, text: 'Cargando...', color: 'blue-two' });

    await getUserByEmail(data.email)
      .then((result) => {
        if (result.data.length > 0) throw new Error('El correo ya está en uso');
        else return uploadProfilePicUser(data.profile_pic[0]);
      })
      .then((result) => {
        const newUser = {
          ...data,
          profile_pic_url: result.downloadURL,
          profile_pic_name: result.imageName,
        };
        delete newUser.profile_pic;
        return createUser(newUser);
      })
      .then((result) => {
        setAlert({ status: true, text: result.message, color: 'green' });
        setTimeout(() => history.push('/usuarios'), 1500);
      })
      .catch((result) => {
        setAlert({
          status: true,
          text: `Ha ocurrido un error: ${result.message}`,
          color: 'red',
        });
      });

    setTimeout(() => setAlert({ status: false, text: '', color: '' }), 5000);
  };

  return (
    <>
      <Menu history={history} />
      <Navbar history={history} />
      <div id="page-wrap">
        {alert.status ? (
          <CustomAlert text={alert.text} color={alert.color} />
        ) : null}
        <Row>
          <Col xs="12" className="col-user-form">
            <Form className="adduser-form" onSubmit={handleSubmit(catchData)}>
              <i
                className="ico-close icon-close"
                onClick={() => history.push('/usuarios')}
                onKeyDown={() => history.push('/usuarios')}
              />
              <p className="title">Usuario nuevo</p>
              <InputFormGroup
                inputClassname="create-user-input"
                name="username"
                label="Nombre de usuario"
                placeHolder="Efrén Jiménez López"
                type="text"
                register={register}
                errors={errors?.username}
                required
                columnSize={6}
              />
              <InputFormGroup
                inputClassname="create-user-input"
                name="email"
                label="Correo electrónico"
                placeHolder="ejemplo@dominio.com"
                type="email"
                register={register}
                errors={errors?.email}
                required
                pattern="[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{1,5}"
                columnSize={6}
              />
              <InputFormGroup
                inputClassname="create-user-input"
                name="password"
                minLength="6"
                label="Contraseña"
                placeHolder="********"
                type="password"
                register={register}
                errors={errors?.password}
                required
                columnSize={6}
              />
              <InputFormGroup
                inputClassname="create-user-input"
                name="confirm_password"
                label="Confirmar contraseña"
                minLength="6"
                placeHolder="********"
                type="password"
                register={register}
                // eslint-disable-next-line camelcase
                errors={errors?.confirm_password}
                required
                columnSize={6}
              />
              <InputFormGroup
                inputClassname="custom-file"
                name="profile_pic"
                label="Seleccionar imagen"
                accept="image/*"
                type="file"
                register={register}
                // eslint-disable-next-line camelcase
                errors={errors?.profile_pic}
                onChange={(e) => {
                  filesSelected(e.target);
                }}
                required
                columnSize={6}
                inputFileSimple
              />
              <InputFormGroup
                inputClassname="create-user-input"
                name="role"
                label="Rol de usuario"
                type="select"
                register={register}
                errors={errors?.role}
                required
                options={[
                  { value: '', text: 'Seleccionar' },
                  { value: 'Administrador', text: 'Administrador' },
                  { value: 'Editor', text: 'Editor' },
                  { value: 'Colaborador', text: 'Colaborador' },
                ]}
                columnSize={6}
              />
              <Col className="btn-column">
                <Button type="submit" className="btn-custom" color="">
                  Agregar usuario
                </Button>
              </Col>
            </Form>
          </Col>
        </Row>
      </div>
    </>
  );
};

AddUser.propTypes = {
  history: PropTypes.object.isRequired,
};

export default authHOC(AddUser, ['Administrador']);
