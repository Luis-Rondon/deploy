import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Row, Col, Button, Spinner,
} from 'reactstrap';
import { v4 as uuidv4 } from 'uuid';
import Pagination from 'react-js-pagination';
import UserData from '../context/UserData';
import ModalCalculatorSG from './ModalCalculatorSG';
import '../styles/containerListItem.scss';

const ContainerListItems = ({
  FilterComponent,
  handleDeleteRegister,
  handleDownloadRegister,
  handleFreeRegister,
  handleStopRegister,
  handleChangeRoleRegister,
  history,
  isLoading,
  itemsToShow,
  link,
  listData,
  RowComponent,
  subtitle,
  textButton,
  title,
  type,
}) => {
  const { userData } = useContext(UserData);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage] = useState(itemsToShow);
  const [listDataPage, setListDataPage] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const toggleModal = () => setModalIsOpen((prevState) => !prevState);

  const getActivePageByRoute = () => (history.location.pathname === '/pacientes'
    ? sessionStorage.getItem('unPePagePatAc')
    : sessionStorage.getItem('unPePageUsAc'));

  const setActivePageByRoute = (selectedPage) => (history.location.pathname === '/pacientes'
    ? sessionStorage.setItem('unPePagePatAc', selectedPage)
    : sessionStorage.setItem('unPePageUsAc', selectedPage));

  // eslint-disable-next-line
  useEffect(() => setActivePage(parseInt(getActivePageByRoute()) || 1), []);

  const handleSelected = (selectedPage) => {
    if (listData.length === 0) {
      setListDataPage([]);
      return;
    }
    const indexOfLastProject = selectedPage * itemsPerPage;
    const indexOfFirstProject = indexOfLastProject - itemsPerPage;
    const currentData = listData.slice(indexOfFirstProject, indexOfLastProject);
    setListDataPage(currentData);
    setActivePage(selectedPage);
    setActivePageByRoute(selectedPage);
  };

  useEffect(() => {
    if (listData.length > 0) handleSelected(activePage);
    // eslint-disable-next-line
  }, [listData]);

  return (
    <>
      <Container fluid className="container-data">
        <Row>
          <Col
            xs="12"
            md={FilterComponent ? 3 : 8}
            lg={FilterComponent ? 4 : 8}
            xl={FilterComponent ? 3 : 8}
          >
            <p className="title">{title}</p>
          </Col>
          {FilterComponent && (
            <Col xs="12" md="6" lg="5" xl="6">
              {FilterComponent()}
            </Col>
          )}
          <Col xs="6" md="3" lg="3" className="btn-column">
            {type === 'patient' && (
              <Button
                className="btn-custom btn-calculator"
                color=""
                onClick={toggleModal}
              >
                Calcular SG
              </Button>
            )}
            {userData
              ? userData.role === 'Administrador' && (
              <Button
                className="btn-custom"
                color=""
                onClick={() => history.push(link)}
              >
                {textButton}
              </Button>
              )
              : null}
          </Col>
          <Col xs="6" md="12" className="subtitle-column">
            <p className="subtitle">{subtitle}</p>
          </Col>
        </Row>
        <Row>
          <Col xs="12" className="content-column">
            {listData.length === 0 ? (
              <h3>No hay resultados</h3>
            ) : isLoading ? (
              <Spinner />
            ) : (
              listDataPage.map((item) => {
                return (
                  <RowComponent
                    key={uuidv4()}
                    item={item}
                    history={history}
                    handleDeleteRegister={handleDeleteRegister}
                    handleDownloadRegister={handleDownloadRegister}
                    handleFreeRegister={handleFreeRegister}
                    handleStopRegister={handleStopRegister}
                    handleChangeRoleRegister={handleChangeRoleRegister}
                  />
                );
              })
            )}
          </Col>
          <Col xs="12" className="pagination-column">
            <Pagination
              activePage={activePage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={listData.length}
              pageRangeDisplayed={3}
              onChange={handleSelected}
              itemClass="item"
              itemClassFirst="control"
              itemClassPrev="control"
              itemClassNext="control"
              itemClassLast="control"
              linkClass="link"
              hideFirstLastPages
            />
          </Col>
        </Row>
      </Container>
      <ModalCalculatorSG show={modalIsOpen} close={toggleModal} />
    </>
  );
};

ContainerListItems.defaultProps = {
  FilterComponent: null,
  handleDeleteRegister: () => null,
  handleDownloadRegister: () => null,
  handleFreeRegister: () => null,
  handleStopRegister: () => null,
  handleChangeRoleRegister: () => null,
  itemsToShow: 3,
  isLoading: false,
  listData: [],
};

ContainerListItems.propTypes = {
  FilterComponent: PropTypes.func,
  handleDeleteRegister: PropTypes.func,
  handleDownloadRegister: PropTypes.func,
  handleFreeRegister: PropTypes.func,
  handleStopRegister: PropTypes.func,
  handleChangeRoleRegister: PropTypes.func,
  history: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  itemsToShow: PropTypes.number,
  link: PropTypes.string.isRequired,
  listData: PropTypes.array,
  RowComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    .isRequired,
  subtitle: PropTypes.string.isRequired,
  textButton: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['patient', 'user']).isRequired,
};
export default ContainerListItems;
