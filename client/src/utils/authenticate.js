export default function () {
  const userData = localStorage.getItem('unetepediatricatkn');
  if (userData) {
    return {
      isAuthenticate: true,
    };
  }
  return {
    isAuthenticate: false,
  };
}
