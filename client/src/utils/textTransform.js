export const capitalizeFirstLetter = (e) => {
  if (
    e.target.type === 'password'
    || e.target.type === 'email'
    || e.target.type === 'url'
  ) return;
  if (e.target.value.length > 0) {
    if (e.target.value.charAt(0) !== e.target.value.charAt(0).toUpperCase()) {
      e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.substr(1);
    }
  }
};

export const setBulletPoint = (e, bulletPoint) => {
  if (
    e.target.type === 'password'
    || e.target.type === 'email'
    || e.target.type === 'url'
  ) return;
  if (bulletPoint) {
    const key = window.event.keyCode;
    // If the user has pressed enter
    if (key === 13) {
      e.target.value = e.target.value.replace(/(^|\r\n|\n)([^●]|$)/g, '$1● $2');
      return false;
    }
    return true;
  }
};
