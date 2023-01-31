import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Row,
  Col,
  Label,
  Nav,
  NavItem,
  TabContent,
  TabPane,
  NavLink,
  Media,
} from 'reactstrap';
import classnames from 'classnames';
import ReactPlayer from 'react-player';
import '../styles/neuroMonitoringFilesModal.scss';

const NeuroMonitoringFilesModal = ({ show, close, data }) => {
  const [activeTab, setActiveTab] = useState('2');
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  if (!data) return <></>;

  return (
    <>
      {show && <div className="monitoring-files-view-modal-background" />}
      <div
        className="monitoring-files-view-modal"
        style={{
          transform: show ? 'translateY(0vh)' : 'translateY(-100vh)',
          opacity: show ? '1' : '0',
        }}
      >
        <span
          className="btn-close-modal icon-close"
          onClick={close}
          onKeyDown={close}
        />
        <Row className="body h-100">
          <Col xs="12" lg="4" className="col-title">
            <Label className="title">Archivos subidos</Label>
          </Col>
          <Col xs="12" lg="8" className="col-nav">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '1' })}
                  onClick={() => {
                    toggleTab('1');
                  }}
                >
                  Videos
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '2' })}
                  onClick={() => {
                    toggleTab('2');
                  }}
                >
                  Imágenes
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === '3' })}
                  onClick={() => {
                    toggleTab('3');
                  }}
                >
                  Documentos
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
          <Col xs="12" className="col-content">
            <div className="container">
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <Row>
                    {Object.keys(data.videoFiles).length === 0 ? (
                      <Label>Sin videos</Label>
                    ) : (
                      Object.values(data.videoFiles).map((video) => (
                        <Col
                          xs="12"
                          lg="6"
                          key={video.fileName}
                          className="col-videos"
                        >
                          <ReactPlayer
                            controls
                            url={video.fileUrl}
                            className="video"
                            width="100%"
                            height="12rem"
                            playsinline
                          />
                          <div className="file-name">{video.originalName}</div>
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="2">
                  <Row>
                    {Object.keys(data.imageFiles).length === 0 ? (
                      <Label>Sin imágenes</Label>
                    ) : (
                      Object.values(data.imageFiles).map((image) => (
                        <Col
                          xs="6"
                          lg="4"
                          key={image.fileName}
                          className="col-image"
                        >
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={image.fileUrl}
                          >
                            <Media src={image.fileUrl} className="image" />
                          </a>
                          <div className="file-name">{image.originalName}</div>
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="3">
                  <Row>
                    {Object.keys(data.documentFiles).length === 0 ? (
                      <Label>Sin documentos</Label>
                    ) : (
                      Object.values(data.documentFiles).map((document) => (
                        <Col
                          xs="12"
                          lg="6"
                          key={document.fileName}
                          className="col-document"
                        >
                          <iframe
                            src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                              document.fileUrl,
                            )}&embedded=true`}
                            className="document"
                            title={document.originalName}
                            frameBorder="0"
                          />
                          <div className="file-name">{document.fileName}</div>
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
              </TabContent>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

NeuroMonitoringFilesModal.defaultProps = {
  data: {},
};

NeuroMonitoringFilesModal.propTypes = {
  close: PropTypes.func.isRequired,
  data: PropTypes.object,
  show: PropTypes.bool.isRequired,
};

export default NeuroMonitoringFilesModal;
