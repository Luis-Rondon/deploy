import React, { useEffect, useState } from 'react';
import Input from 'reactstrap/lib/Input';
import PropTypes from 'prop-types';


const iconsFolder = require.context('../assets/hammersmith-icons', true);

const HammersmithField = ({
  indicador,
  seccionId,
  clave,
  register,
  setResultado,
  lastValues,
  setValue,
  setLastValues,
  getValues,
  readOnly,
}) => {
  const [selected, setSelected] = useState(-1);
  const getColorIndicator = (estatus) => {
    switch (estatus) {
      case 0:
        return 'default';
      case 1:
        return 'green';
      case 2:
        return 'red';
      default:
        return 'default';
    }
  };

  const getDiIndicator = (totalDi) => {
    const elements = [];
    for (let i = 0; i < totalDi; i += 1) {
      elements.push('D I');
    }
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: '0 2em',
      }}
      >
        {elements.map((text) => <span>{text}</span>)}
      </div>
    );
  };

  useEffect(() => {
    const values = getValues();
    const indicadorValue = values.cuestionario[clave].secciones[seccionId].valorIndicador;
    setSelected(Number(indicadorValue));
  });

  return (
    // eslint-disable-next-line
    <td
      className={`${selected === indicador.valor ? 'selected-field' : ''} ${indicador.indicador ? 'p-1 con-info' : 'sin-info'}`}
      onClick={(e) => {
        const input = e.target.children[0];
        // eslint-disable-next-line
        input?.click();
      }}
    >
      {(
        <Input
          key={indicador.indicador}
          type="radio"
          name={`cuestionario.${clave}.secciones[${seccionId}].valorIndicador`}
          innerRef={register}
          value={indicador.valor}
          className={`input-radio ${clave}-${seccionId} radio-${getColorIndicator(
            indicador.status,
          )}`}
          onChange={setResultado}
          onClick={(e) => {
            const valorSel = lastValues?.cuestionario[clave]?.secciones[seccionId]?.valorIndicador;
            if (valorSel === e.target.value) {
              setValue(`cuestionario.${clave}.secciones[${seccionId}].valorIndicador`, 0);
            }
            setLastValues(getValues());
            setResultado();
          }}
          disabled={readOnly}
        />
      )}
      {indicador.indicador }
      {indicador.iconId && (
        <>
          <img
            src={iconsFolder(
              `./${indicador.iconId}.png`,
            )}
            alt={`icono formulario hammersmith ${indicador.iconId}`}
            className="icono-indicador"
          />
          {indicador.DI && getDiIndicator(indicador.DI)}
        </>
      )}
    </td>

  );
};

HammersmithField.propTypes = {
  indicador: PropTypes.object.isRequired,
  seccionId: PropTypes.number.isRequired,
  clave: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
  setResultado: PropTypes.func.isRequired,
  lastValues: PropTypes.array.isRequired,
  setValue: PropTypes.func.isRequired,
  setLastValues: PropTypes.func.isRequired,
  getValues: PropTypes.func.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

export default HammersmithField;
