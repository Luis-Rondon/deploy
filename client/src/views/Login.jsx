import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Button, Form, Media,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';
import tripledes from 'crypto-js/tripledes';
import CryptoJS from 'crypto-js';
import { LoginModel } from '../models/LoginType';
import unAuthHOC from '../utils/unAuthHOC';
import { login } from '../actions/LoginAction';
import InputFormGroup from '../common/InputFormGroup';
import CustomAlert from '../common/CustomAlert';
import logo from '../assets/logo-unete-pediatrica-v2.png';
import UserData from '../context/UserData';
import { getPlayerId } from '../firebase/oneSignal';
import {
  uploadOneSignalIdToUser,
  verifyOneSignalIdByUserKey,
} from '../actions/UserAction';
import '../styles/login.scss';

const Login = ({ history }) => {
  const { getUserData } = useContext(UserData);
  let player;
  const [checkbox, setCheckbox] = useState(true);

  const defaultFormValues = Cookies.get('unetepediatricack')
    ? JSON.parse(
      tripledes
        .decrypt(
          Cookies.get('unetepediatricack'),
          process.env.REACT_APP_PASS_HASH,
        )
        .toString(CryptoJS.enc.Utf8),
    )
    : LoginModel;

  const { register, handleSubmit, errors } = useForm({
    defaultValues: defaultFormValues,
  });

  const [alert, setAlert] = useState({
    status: false,
    text: '',
    color: '',
  });

  const setCheckboxValue = () => {
    setCheckbox(!checkbox);
  };

  const catchData = (data) => {
    setAlert({ status: true, text: 'Cargando...', color: 'blue-two' });
    login(data)
      .then(async (userData) => {
        const userAuth = JSON.stringify(userData);
        const cryptResult = tripledes
          .encrypt(userAuth, process.env.REACT_APP_PASS_HASH)
          .toString();
        localStorage.setItem('unetepediatricatkn', cryptResult);
        const user = JSON.stringify({
          email: data.email,
          password: data.password,
        });
        if (checkbox) {
          Cookies.set(
            'unetepediatricack',
            tripledes.encrypt(user, process.env.REACT_APP_PASS_HASH),
          );
        } else Cookies.remove('unetepediatricack');
        getUserData();
        // PLAYERID en variable
        await getPlayerId()
          .then((data) => {
            player = data;
          })
          .catch((err) => console.log(err));
        if (player) {
          await verifyOneSignalIdByUserKey(userData.id, player)
            .then((data) => {
              if (data === true) return;
              uploadOneSignalIdToUser(userData.id, player)
                .then((data) => console.log(data.message))
                .catch((err) => console.log(err.message));
            })
            .catch((err) => console.log(err));
        }
        history.push('/pacientes');
      })
      .catch((result) => {
        setAlert({
          status: true,
          text: result.message,
          color: 'red',
        });
        setTimeout(
          () => setAlert({ status: false, text: '', color: '' }),
          5000,
        );
      });
  };

  return (
    <Row className="login">
      <Col md={5} className="col-logo">
        <Media src={logo} className="logo" />
      </Col>
      <Col md={7} className="col-form">
        {alert ? <CustomAlert text={alert.text} color={alert.color} /> : null}
        <h3 className="title">Iniciar sesión</h3>
        <Form onSubmit={handleSubmit(catchData)} className="login-form">
          <h4 className="subtitle">Bienvenido</h4>
          <InputFormGroup
            name="email"
            label="Correo electrónico"
            type="email"
            register={register}
            errors={errors?.email}
            icon="user"
            required
          />
          <InputFormGroup
            name="password"
            label="Contraseña"
            type="password"
            register={register}
            errors={errors?.password}
            icon="lock"
            required
          />
          <InputFormGroup
            name="checkbox"
            label="Recordar usuario en este dispositivo"
            checked={checkbox}
            register={register}
            errors={errors?.checkbox}
            required={false}
            type="checkbox"
            onChange={setCheckboxValue}
          />
          <Col>
            <Button type="submit" className="btn-custom" color="">
              Iniciar sesión
            </Button>
          </Col>
        </Form>
      </Col>
    </Row>
  );
};

Login.propTypes = {
  history: PropTypes.object.isRequired,
};

export default unAuthHOC(Login);
