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
  Button,
  Progress,
} from 'reactstrap';
import classnames from 'classnames';
import InputFormGroup from '../common/InputFormGroup';
import '../styles/HistoryFilesModalEdit.scss';

const HistoryFilesModalEdit = ({
  show,
  close,
  data,
  deleteOneFile,
  onDocFileChange,
  onSubmitFiles,
}) => {
  const [progressDocuments, setProgressDocuments] = useState(0);

  const [activeTab, setActiveTab] = useState('1');
  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  if (!data) return <></>;

  return (
    <>
      {show && <div className="history-files-modal-background" />}
      <div
        className="history-files-modal- edit"
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
                      {progressDocuments > 0 && progressDocuments < 100 && (
                        <>
                          <Label>Subiendo Documentos...</Label>
                          <Progress value={progressDocuments} />
                        </>
                      )}
                    </Col>
                    <Col xs="6">
                      <InputFormGroup
                        name={`${data?.id}document`}
                        type="file"
                        multiple
                        iconFile="file"
                        inputClassname={`input-file-reset-${data?.id}`}
                        columnSize={12}
                        labelClassname="subtitle"
                        accept="application/pdf"
                        required={false}
                        onChange={onDocFileChange}
                        miniButtonFile
                      />
                    </Col>
                    <Col xs="6">
                      <Button
                        className="btn-custom"
                        color=""
                        onClick={(e) => onSubmitFiles(e.target, setProgressDocuments)}
                        onKeyDown={(e) => onSubmitFiles(e.target, setProgressDocuments)}
                      >
                        Subir archivos
                      </Button>
                    </Col>
                    {Object.keys(data?.documentFiles || {}).length === 0 ? (
                      <Col xs="12">
                        <Label>Sin documentos</Label>
                      </Col>
                    ) : (
                      Object.values(data?.documentFiles).map(
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

HistoryFilesModalEdit.defaultProps = {
  data: {},
};

HistoryFilesModalEdit.propTypes = {
  close: PropTypes.func.isRequired,
  data: PropTypes.object,
  deleteOneFile: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  onDocFileChange: PropTypes.func.isRequired,
  onSubmitFiles: PropTypes.func.isRequired,
};

export default HistoryFilesModalEdit;
