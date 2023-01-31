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
  Button,
  Progress,
} from 'reactstrap';
import classnames from 'classnames';
import ReactPlayer from 'react-player';
import InputFormGroup from '../common/InputFormGroup';
import '../styles/neuroMonitoringFilesModal.scss';

const NeuroMonitoringFilesModalEdit = ({
  show,
  close,
  data,
  deleteOneFile,
  onImageFileChange,
  onVideoFileChange,
  onDocFileChange,
  onSubmitFiles,
}) => {
  const [progressVideos, setProgressVideos] = useState(0);
  const [progressImages, setProgressImages] = useState(0);
  const [progressDocuments, setProgressDocuments] = useState(0);

  const [activeTab, setActiveTab] = useState('2');
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  if (!data) return <></>;

  return (
    <>
      {show && <div className="monitoring-files-view-modal-background" />}
      <div
        className="monitoring-files-view-modal edit"
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
                    <Col xs="12" className="col">
                      {progressVideos > 0 && progressVideos < 100 && (
                        <>
                          <Label>Subiendo Videos...</Label>
                          <Progress value={progressVideos} />
                        </>
                      )}
                    </Col>
                    <Col xs="6">
                      <InputFormGroup
                        name={`${data.idRegister}video`}
                        type="file"
                        accept="video/mp4, video/avi, video/mpeg, video/quicktime"
                        multiple
                        iconFile="video"
                        inputClassname={`input-file-reset-${data.idRegister}`}
                        columnSize={12}
                        labelClassname="subtitle"
                        required={false}
                        onChange={onVideoFileChange}
                        miniButtonFile
                      />
                    </Col>
                    <Col xs="6">
                      <Button
                        className="btn-custom"
                        color=""
                        onClick={(e) => onSubmitFiles(e.target, null, setProgressVideos)}
                        onKeyDown={(e) => onSubmitFiles(e.target, null, setProgressVideos)}
                      >
                        Subir archivos
                      </Button>
                    </Col>
                    {Object.keys(data.videoFiles).length === 0 ? (
                      <Col xs="12">
                        <Label>Sin videos</Label>
                      </Col>
                    ) : (
                      Object.values(data.videoFiles).map((video, index) => (
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
                          <div>
                            <Button
                              className="btn-custom icon-delete"
                              color=""
                              onClick={() => deleteOneFile(
                                video,
                                Object.keys(data.videoFiles)[index],
                                'videos',
                              )}
                              onKeyDown={() => deleteOneFile(
                                video,
                                Object.keys(data.videoFiles)[index],
                                'videos',
                              )}
                            />
                          </div>
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="2">
                  <Row>
                    <Col xs="12" className="col">
                      {progressImages > 0 && progressImages < 100 && (
                        <>
                          <Label>Subiendo Imágenes...</Label>
                          <Progress value={progressImages} />
                        </>
                      )}
                    </Col>
                    <Col xs="6">
                      <InputFormGroup
                        name={`${data.idRegister}image`}
                        type="file"
                        multiple
                        iconFile="image"
                        inputClassname={`input-file-reset-${data.idRegister}`}
                        columnSize={12}
                        labelClassname="subtitle"
                        accept="image/gif, image/jpeg, image/png"
                        required={false}
                        onChange={onImageFileChange}
                        miniButtonFile
                      />
                    </Col>
                    <Col xs="6">
                      <Button
                        className="btn-custom"
                        color=""
                        onClick={(e) => onSubmitFiles(e.target, setProgressImages)}
                        onKeyDown={(e) => onSubmitFiles(e.target, setProgressImages)}
                      >
                        Subir archivos
                      </Button>
                    </Col>
                    {Object.keys(data.imageFiles).length === 0 ? (
                      <Col xs="12">
                        <Label>Sin imágenes</Label>
                      </Col>
                    ) : (
                      Object.values(data.imageFiles).map((image, index) => (
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
                          <div>
                            <Button
                              className="btn-custom icon-delete"
                              color=""
                              onClick={() => deleteOneFile(
                                image,
                                Object.keys(data.imageFiles)[index],
                                'images',
                              )}
                              onKeyDown={() => deleteOneFile(
                                image,
                                Object.keys(data.imageFiles)[index],
                                'images',
                              )}
                            />
                          </div>
                        </Col>
                      ))
                    )}
                  </Row>
                </TabPane>
              </TabContent>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="3">
                  <Row>
                    <Col xs="12" className="col">
                      {progressDocuments > 0 && progressDocuments < 100 && (
                        <>
                          <Label>Subiendo Documentos...</Label>
                          <Progress value={progressDocuments} />
                        </>
                      )}
                    </Col>
                    <Col xs="6">
                      <InputFormGroup
                        name={`${data.idRegister}document`}
                        type="file"
                        multiple
                        iconFile="file"
                        inputClassname={`input-file-reset-${data.idRegister}`}
                        columnSize={12}
                        labelClassname="subtitle"
                        accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint"
                        required={false}
                        onChange={onDocFileChange}
                        miniButtonFile
                      />
                    </Col>
                    <Col xs="6">
                      <Button
                        className="btn-custom"
                        color=""
                        onClick={(e) => onSubmitFiles(
                          e.target,
                          null,
                          null,
                          setProgressDocuments,
                        )}
                        onKeyDown={(e) => onSubmitFiles(
                          e.target,
                          null,
                          null,
                          setProgressDocuments,
                        )}
                      >
                        Subir archivos
                      </Button>
                    </Col>
                    {Object.keys(data.documentFiles).length === 0 ? (
                      <Col xs="12">
                        <Label>Sin documentos</Label>
                      </Col>
                    ) : (
                      Object.values(data.documentFiles).map(
                        (document, index) => (
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
                            <div className="file-name">
                              {document.originalName}
                            </div>
                            <div>
                              <Button
                                className="btn-custom icon-delete"
                                color=""
                                onClick={() => deleteOneFile(
                                  document,
                                  Object.keys(data.documentFiles)[index],
                                  'documents',
                                )}
                                onKeyDown={() => deleteOneFile(
                                  document,
                                  Object.keys(data.documentFiles)[index],
                                  'documents',
                                )}
                              />
                            </div>
                          </Col>
                        ),
                      )
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

NeuroMonitoringFilesModalEdit.defaultProps = {
  data: {},
};

NeuroMonitoringFilesModalEdit.propTypes = {
  close: PropTypes.func.isRequired,
  data: PropTypes.object,
  deleteOneFile: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  onImageFileChange: PropTypes.func.isRequired,
  onVideoFileChange: PropTypes.func.isRequired,
  onDocFileChange: PropTypes.func.isRequired,
  onSubmitFiles: PropTypes.func.isRequired,
};

export default NeuroMonitoringFilesModalEdit;
