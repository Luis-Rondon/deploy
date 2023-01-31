import confirm from 'reactstrap-confirm';
import fileFormats from './fileFormats.json';

export const confirmWrongFileAlert = async (
  fileNames,
  typeFile = 'image',
  message,
) => {
  let array = [];
  switch (typeFile) {
    case 'video':
      array = fileFormats.videoFormats.names;
      break;
    case 'image':
      array = fileFormats.imageFormats.names;
      break;
    case 'document':
      array = fileFormats.documentFormats.names;
      break;
    default:
      break;
  }
  await confirm({
    title: '¡Ups!',
    message:
      message
      || `Los siguientes archivos no son compatibles: ${fileNames}. Los formatos aceptados son: ${array.map(
        (item) => `${item} `,
      )}.`,
    confirmText: 'Aceptar',
    confirmColor: 'success',
    cancelText: '',
    cancelColor: '',
  });
};
