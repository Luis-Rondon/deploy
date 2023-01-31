import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import confirm from 'reactstrap-confirm';
import authHOC from '../utils/authHOC';
import {
  getUsers,
  deleteUserAuthById,
  updateUserRole,
} from '../actions/UserAction';
import Navbar from '../common/Navbar';
import Menu from '../common/Menu';
import CustomAlert from '../common/CustomAlert';
import ContainerListItems from '../components/ContainerListItems';
import RowUserTable from '../components/RowUserTable';

const UserList = ({ history }) => {
  const [userList, setuserList] = useState();
  const [errorUserList, seterrorUserList] = useState(false);
  const [dataUpdate, setDataUpdate] = useState(true);
  const [alert, setalert] = useState({ status: false, text: '', color: '' });

  useEffect(() => {
    if (dataUpdate) {
      getUsers()
        .then((result) => {
          result.data.sort((a, b) => {
            return a.number - b.number;
          });
          setuserList(result.data);
        })
        .catch(() => {
          seterrorUserList(true);
        });
      setDataUpdate(false);
    }
  }, [dataUpdate]);

  const handleDeleteRegister = async (item) => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message: `Esta acción no se puede deshacer. Se borrará permanentemente el usuario ${item.username}`,
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });

    if (result === false) return;
    setalert({
      status: true,
      text: 'Eliminando registro...',
      color: 'blue-one',
    });
    deleteUserAuthById(item.id)
      .then(() => {
        setalert({
          status: true,
          text: 'Registro eliminado con éxito',
          color: 'green',
        });
        setDataUpdate(true);
      })
      .catch((error) => {
        setalert({
          status: true,
          text: error.message,
          color: 'green',
        });
      });

    setTimeout(() => setalert({ status: false, text: '', color: '' }), 4000);
  };

  const handleChangeRoleRegister = async (item, role) => {
    const result = await confirm({
      title: '¿Estás seguro?',
      message: `Esta acción cambiará el rol del usuario ${item.username}`,
      confirmText: 'Sí, estoy seguro',
      cancelText: 'No, cancelar',
      confirmColor: 'success',
      cancelColor: 'danger',
    });

    if (result === false) return;
    setalert({ status: true, text: 'Cambiando rol...', color: 'blue-one' });
    updateUserRole(item.id, role)
      .then(() => {
        setalert({
          status: true,
          text: 'Rol cambiado con éxito',
          color: 'green',
        });
        setDataUpdate(true);
      })
      .catch((error) => {
        setalert({
          status: true,
          text: error.message,
          color: 'green',
        });
      });

    setTimeout(() => setalert({ status: false, text: '', color: '' }), 4000);
  };

  return (
    <>
      <Menu />
      <Navbar history={history} />
      <div id="page-wrap">
        {alert.status ? (
          <CustomAlert text={alert.text} color={alert.color} />
        ) : null}
        {errorUserList ? (
          <CustomAlert text="Hubo un error al obtener la información, por favor recargue" />
        ) : (
          <ContainerListItems
            title="Usuarios del sistema"
            subtitle="Usuarios"
            textButton="Agregar usuario"
            listData={userList}
            type="user"
            itemsToShow={4}
            link="/usuarios/agregarusuario"
            handleDeleteRegister={handleDeleteRegister}
            handleChangeRoleRegister={handleChangeRoleRegister}
            history={history}
            RowComponent={RowUserTable}
          />
        )}
      </div>
    </>
  );
};

UserList.propTypes = {
  history: PropTypes.object.isRequired,
};

export default authHOC(UserList, ['Administrador']);
