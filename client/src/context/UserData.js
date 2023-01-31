/* eslint-disable react/no-unused-state */
/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tripledes from 'crypto-js/tripledes';
import encLatin1 from 'crypto-js/enc-latin1';
import { login } from '../actions/LoginAction';
import { getUserById } from '../actions/UserAction';

const UserData = React.createContext();
const { Provider, Consumer } = UserData;

class UserDataProvider extends Component {
  state = {
    userData: null,
    getUserData: this.getUserData.bind(this),
    clearUserData: this.clearUserData.bind(this),
  };

  componentDidMount() {
    this.getUserData();
  }

  getUserData() {
    const userDataStorage = localStorage.getItem('unetepediatricatkn');
    const { userData } = this.state;
    if (!userDataStorage || userData) return;
    // eslint-disable-next-line max-len
    const decrypt = tripledes
      .decrypt(userDataStorage, process.env.REACT_APP_PASS_HASH)
      .toString(encLatin1);
    // eslint-disable-next-line prefer-const
    let { email, password } = JSON.parse(decrypt);
    password = atob(password);
    login({ email, password })
      .then((result) => getUserById(result.id))
      .then((user) => {
        this.setState({
          userData: user.data,
        });
      })
      .catch(() => null);
  }

  clearUserData() {
    this.setState({
      userData: null,
    });
  }

  render() {
    const { children } = this.props;
    return <Provider value={this.state}>{children}</Provider>;
  }
}

UserDataProvider.propTypes = {
  children: PropTypes.object.isRequired,
};

export default UserData;
export { UserDataProvider, Consumer as UserDataConsumer };
