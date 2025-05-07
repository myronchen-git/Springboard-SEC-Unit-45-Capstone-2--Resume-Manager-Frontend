import { jwtDecode } from 'jwt-decode';
import { useCallback, useMemo, useState } from 'react';

import ResumeManagerApi from './api.js';
import Notifications from './components/Notifications.jsx';
import { AppContext, UserContext } from './contexts.jsx';
import RoutesList from './RoutesList.jsx';

import './App.css';

// ==================================================

/**
 * The core app component.  This contains shared data and functions.
 */
function App() {
  const [user, setUser] = useState(
    ResumeManagerApi.authToken ? jwtDecode(ResumeManagerApi.authToken) : {}
  );
  const [alerts, setAlerts] = useState([]);

  // --------------------------------------------------

  /**
   * Adds a notification, alert, or error message to the list of notifications.
   *
   * @param {String} message - The text to display.
   * @param {String} color - Bootstrap color type (primary, danger).
   */
  const addAlert = useCallback((message, color) => {
    setAlerts((alerts) => [...alerts, { id: Date.now(), message, color }]);
  }, []);

  /**
   * Removes a notification, alert, or error message from the list of
   * notifications.
   *
   * @param {Number} id - The ID of an alert to remove.
   */
  const removeAlert = useCallback((id) => {
    setAlerts((alerts) => alerts.filter((alert) => alert.id !== id));
  }, []);

  /**
   * Clears all notifications, alerts, or error messages.
   */
  const clearAlerts = useCallback(() => setAlerts([]), []);

  /**
   * Registers a new user.
   *
   * @param {Object} formData - Holds the data for creating a new user.
   * @param {String} formData.username - Name of the new user.
   * @param {String} formData.password - Password for the user.
   */
  const registerUser = useCallback(async (formData) => {
    setUser(await ResumeManagerApi.registerUser(formData));
  }, []);

  /**
   * Signs in a user.
   *
   * @param {Object} formData - Holds the data for signing in a user.
   * @param {String} formData.username - Name of the user.
   * @param {String} formData.password - Password of the user.
   */
  const signinUser = useCallback(async (formData) => {
    setUser(await ResumeManagerApi.signinUser(formData));
  }, []);

  /**
   * Signs out a user.
   */
  const signoutUser = useCallback(async () => {
    ResumeManagerApi.authToken = null;
    setUser({});
  }, []);

  /**
   * Updates a user's account information, such as password.
   *
   * @param {Object} formData - Holds the data for updating account info.
   * @see ResumeManagerApi.updateAccount for formData properties.
   */
  const updateAccount = useCallback(
    async (formData) => {
      const userData = await ResumeManagerApi.updateAccount(formData);
      setUser({ ...user, ...userData });
    },
    [user]
  );

  // --------------------------------------------------

  const appContextValues = useMemo(
    () => ({ addAlert, clearAlerts }),
    [addAlert, clearAlerts]
  );

  const userContextValues = useMemo(
    () => ({
      user,
      registerUser,
      signinUser,
      signoutUser,
      updateAccount,
    }),
    [user, registerUser, signinUser, signoutUser, updateAccount]
  );

  // --------------------------------------------------

  return (
    <AppContext.Provider value={appContextValues}>
      <UserContext.Provider value={userContextValues}>
        <Notifications alerts={alerts} removeAlert={removeAlert} />
        <RoutesList />
      </UserContext.Provider>
    </AppContext.Provider>
  );
}

// ==================================================

export default App;
