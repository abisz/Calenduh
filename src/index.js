const debug = require('debug')('calendar');
const GoogleAuth = require('google-auth-library');
const google = require('googleapis');

const fs = require('fs');
const readline = require('readline');

class Calendar {

  constructor(clientSecretPath) {
    this.TOKEN_DIR = `${process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE}/.credentials/`;
    this.TOKEN_PATH = `${this.TOKEN_DIR}calendar-nodejs-quickstart.json`;

    // authorization "modes"
    this.SCOPES = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.readonly',
    ];

    this.api = google.calendar('v3');
    this.clientSecretPath = clientSecretPath;
  }

  // AUTHENTICATION
  getAuth() {
    debug('Starting authentication');

    return new Promise((resolve, reject) => {
      if (this.auth) {
        debug('Authentication already available');
        resolve(this.auth);
      } else {
        debug('Reading client secret');
        // eslint-disable-next-line consistent-return
        fs.readFile(this.clientSecretPath, (err, content) => {
          if (err) {
            debug('Error while reading client_secret');
            debug(err);
            return reject(err);
          }

          try {
            debug('Successfully read client_secret.json');
            this.authorize(JSON.parse(content), (auth) => {
              this.auth = auth;
              return resolve(this.auth);
            });
          } catch (e) {
            debug('Error while parsing client_secret and authorizing');
            return reject(e);
          }
        });
      }
    });
  }

  authorize(credentials, cb) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new GoogleAuth();
    const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(this.TOKEN_PATH, (err, token) => {
      if (err) {
        this.getNewToken(oauth2Client, cb);
      } else {
        try {
          oauth2Client.credentials = JSON.parse(token);
          cb(oauth2Client);
        } catch (e) {
          debug('Error parsing the token');
          debug(e);
        }
      }
    });
  }

  getNewToken(oauth2Client, cb) {
    debug('Starting generating new auth token');
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
    });
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // eslint-disable-next-line no-console
    console.log('Authorize this app by visiting this url:', authUrl);

    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          debug('Error while trying to retrieve access token');
          debug(err);
          return;
        }

        // eslint-disable-next-line no-param-reassign
        oauth2Client.credentials = token;
        this.storeToken(token);
        cb(oauth2Client);
      });
    });
  }

  storeToken(token) {
    debug('Starting storing token');
    try {
      fs.statSync(this.TOKEN_DIR);
    } catch (e) {
      fs.mkdirSync(this.TOKEN_DIR);
    }

    fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) {
        debug('Error while storing the token:');
        debug(err);
        return;
      }
      debug('Finished storing token');
      debug('Token stored to ', this.TOKEN_PATH);
    });
  }

  // UTILS
  calendarList() {
    debug('Starting calendar list');
    const authPromise = this.getAuth();

    return new Promise((resolve, reject) => {
      authPromise
        .then((auth) => {
          debug('Calendar List successfully authenticated');

          this.api.calendarList.list({ auth }, (err, response) => {
            if (err) {
              debug('Error from calendarList.list()');
              debug(err);
              return reject(err);
            }

            debug('Calendar List successfully retrieved items');
            return resolve(response.items);
          });
        })
        .catch((err) => {
          debug('Calendar List auth problem');
          debug(err);
          return reject(err);
        });
    });
  }

  events(calId, opts) {
    debug('Starting retrieving events');
    const authPromise = this.getAuth();

    return new Promise((resolve, reject) => {
      authPromise
        .then((auth) => {
          debug('Events successfully authenticated');
          this.api.events.list(Object.assign({
            auth,
            calendarId: calId,
          }, opts), (err, response) => {
            if (err) {
              debug('Error from events.list()');
              debug(err);
              reject(err);
            }
            resolve((response && response.items) || []);
          });
        })
        .catch((err) => {
          debug('Event auth problem');
          debug(err);
          reject(err);
        });
    });
  }
}

module.exports = Calendar;
