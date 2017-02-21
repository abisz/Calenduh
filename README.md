# Calenduh
*Node.js wrapper for Google Calendar API*

This is a small wrapper to make working with Google Calendar API mor convenient and faster.

The main focus is to abstract the authentication process and management.

**! Attention !**

The authentication process requires the first-time user to click on a link in their terminal, accept access to their calendar and copy a verification code into their terminal.
At this point it isn't possible to do this another way.
That's why the use cases are mostly command line tools right now.

## Install
```
npm install calenduh
```

## Getting Started
Google requires you to register an application in order to work with their APIs.

You can use this [guide](https://developers.google.com/google-apps/calendar/quickstart/nodejs#step_1_turn_on_the_api_name) to generate a `client_secret.json` which will contain all necessary information.

With the secret file you can instantiate Calenduh:
```js
const Calenduh = require('calenduh');
const cal = new Calenduh('./path/to/client_secret.json');
```

## Methods
### calendarList()
Returns a promise with and array of all calendars of the authenticated user.
```js
cal.calendarList()
    .then((lists) => {
        // ...
    });
```

### events(calendarId, opts)
Returns all events from a specific calendar.
The options are passed directly to the Google Calendar API, all defaults and parameters can be found [here](https://developers.google.com/google-apps/calendar/v3/reference/events/list).
```js
cal.events(calendarId, {
    timeMin: (new Date('2017-02-01')).toISOString(),
    timeMax: (new Date('2017-02-28')).toISOString(),
}).then((events) => {
    // ...
});
```

### allEvents(opts)
Returns a list of all events from all calendars.
Options behave the same way as in `events()`.
```js
cal.allEvents({})
    .then((events) => {
        // ...
    });
```

### createCalendar(name)
Create a new calendar with the passed name.
Returns new calendar.
```js
cal.createCalendar('My new Calendar')
    .then((calendar) => {
        // ...
    });
```

### findOrCreateCalendar(name)
Checks if calendar with passed name already exists.
If it does it will be returned.
If not the calendar will be created and returned.
```js
cal.findOrCreateCalendar('My Calendar')
    .then((calendar) => {
        // ...
    });
```

### createEvent(calendarId, name, startDateTime, endDateTime, [opts])
Creates an event for a specific calendar and returns it.
`startDateTime` and `endDateTime` are required, additonal data can be passed in `opts` object.
Full list of available options can be found in the [official documentation](https://developers.google.com/google-apps/calendar/v3/reference/events/insert).
```js
cal.createEvent(
    calendarId,
    'My Event',
    '2017-02-21T10:00:00.000Z',
    '2017-02-21T12:00:00.000Z',
    {
        location: 'My Location',
    }
).then((event) => {
    // ...
});
```