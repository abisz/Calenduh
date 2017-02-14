#!/usr/bin/env node

const debug = require('debug')('index');

const Calendar = require('./Calendar.js');

const cal = new Calendar();

cal.calendarList()
  .then( lists => {
    lists.slice.forEach( list => {
      
      cal.events(list.id)
        .then( events => {
          console.log(events)
        })
        .catch( err => {
          console.log(err);
        });
    })
  })
  .catch( err => {
    debug('Error while getting calendar lists');
    debug(err);
  })

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