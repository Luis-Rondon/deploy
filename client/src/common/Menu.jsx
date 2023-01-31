import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { push as SideMenu } from 'react-burger-menu';
import UserData from '../context/UserData';
import '../styles/menu.scss';

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userData } = useContext(UserData);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div id="outer-container">
      <SideMenu
        customBurgerIcon={<i className="icon-menu" />}
        isOpen={isOpen}
        noOverlay
        outerContainerId="outer-container"
        pageWrapId="page-wrap"
        width="5rem"
      >
        <i
          className="icon-close"
          name="ico-close"
          onClick={toggleMenu}
          onKeyDown={toggleMenu}
        />
        {userData && userData.role === 'Administrador' && (
          <Link to="/usuarios" target="_blank">
            <i className="icon-user-add" />
          </Link>
        )}
        <Link to="/pacientes" target="_blank">
          <i className="icon-dashboard" />
        </Link>
        {userData && userData.role === 'Administrador' && (
          <Link to="/descargas" target="_blank">
            <i className="icon-dowload" />
          </Link>
        )}
        <Link to="/citas/all" target="_blank">
          <i className="icon-calendar" />
        </Link>
      </SideMenu>
    </div>
  );
};

export default Menu;
