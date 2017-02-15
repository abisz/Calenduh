#!/usr/bin/env node

const debug = require('debug')('index');
const Calendar = require('./Calendar.js');
const moment = require('moment');

const cal = new Calendar();

cal.calendarList()
  .then((lists) => {
    lists.forEach((list) => {
      cal.events(list.id, {
        timeMin: moment().toISOString(),
        timeMax: moment().add(1, 'day').toISOString(),
      })
        .then((events) => {
          events.forEach(e => console.log(e.summary));
        })
        .catch((err) => {
          debug('Error in index.js cal.events');
          debug(err);
        });
    });
  })
  .catch((err) => {
    debug('Error while getting calendar lists');
    debug(err);
  });

/*
if (! process.argv[2]) {
  console.log('Please choose an action!');
  process.exit();
}

switch(process.argv[2]){
  case 'today':
    console.log('Today');
    break;

  default:
    console.log('Action not found:', process.argv[2]);
}

*/
