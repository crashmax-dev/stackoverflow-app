const win = require('electron').remote.getCurrentWindow();

exports.buildStackOverflowUrl = (url, parameters) => {
  url = 'https://api.stackexchange.com/2.2/' + url;

  let queryString = parameters && Object.keys(parameters)
      .map(function (key) {
        var value = parameters[key];
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');

  if (queryString) {
    url = url + '?' + queryString;
  }

  return url;
};

exports.fetch = (url, parameters, options) => {
  if (parameters) {
    parameters.site = 'stackoverflow';
    parameters.key = 'bdFSxniGkNbU3E*jsj*28w((';
  }

  return fetch(exports.buildStackOverflowUrl(url, parameters), options).then((response) => {
    return response.json();
  });
};

exports.logout = (token) => {
  const logoutPromise = fetch(exports.buildStackOverflowUrl('apps/' + token + '/de-authenticate', {
    key: 'bdFSxniGkNbU3E*jsj*28w(('
  }));

  // Remove acct cookies to logout user from SE
  logoutPromise.then(() => {
    win.webContents.session.cookies.remove('https://stackexchange.com', 'acct', () => {

    });
  });

  return logoutPromise;
};

class StackOverflowSocketClient {
  constructor() {
    this.subscribedActions = [];
    this.unsubscribedActions = [];

    this.socketConnectionPromise = new Promise((socketConnectionPromiseResolve, socketConnectionPromiseReject) => {
      const connection = new WebSocket('wss://qa.sockets.stackexchange.com');

      connection.onopen = function () {
        socketConnectionPromiseResolve(connection);
      };

      connection.onerror = socketConnectionPromiseReject;

      this.onMessagePromise = new Promise(onMessagePromiseResolve => {
        connection.onmessage = onMessagePromiseResolve;
      });
    });
  }

  on(action, callback) {
    this.socketConnectionPromise.then(connection => {
      if (!this.subscribedActions.includes(action)) {
        connection.send(action);
        this.subscribedActions.push(action)
      }

      this.onMessagePromise.then(event => {
        // Stack Overflow doesn't allow us to unsubscribe from actions we subscribed
        // so emulate unsubscribing by ignoring onMessage event
        if (this.unsubscribedActions.includes(action)) {
          return;
        }

        const response = JSON.parse(event.data);

        if (response.action === action) {
          let json;

          try {
            json = JSON.parse(response.data);
          } catch (ignore) {}

          callback(json || event.data);
        }
      })
    });
  }

  off(action) {
    if (!this.unsubscribedActions.includes(action)) {
      this.unsubscribedActions.push(action);

      const index = this.subscribedActions.indexOf(action);
      if (index !== -1) {
        this.subscribedActions.splice(index, 1);
      }
    }
  }
}

exports.socketClient = new StackOverflowSocketClient;