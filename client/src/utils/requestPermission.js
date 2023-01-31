  export function requestPermission(setPermission) {
    console.log('Requesting permission...');
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        setPermission(true);
      } else {
        console.log('Unable to get permission to notify.');
      }
    });
  }
