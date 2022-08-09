const axios = require('axios');
const ical = require('ical');

require('dotenv').config();

const {
  GOOGLE_CALENDAR_ID,
  TWITCH_CHANNEL_ID,
  TWITCH_CATEGORY_ID,
  TWITCH_OAUTH_TOKEN,
  TWITCH_CLIENT_ID,
} = process.env;

async function getGoogleEvents() {
  const { data } = await axios.get(`https://calendar.google.com/calendar/ical/${GOOGLE_CALENDAR_ID}/public/basic.ics`);
  const rightNow = new Date();
  const events = ical.parseICS(data);
  return Object.values(events)
    .filter((event) => event.start > rightNow);
}

async function getTwitchEvents() {
  const { data } = await axios.get('https://api.twitch.tv/helix/schedule', {
    params: {
      broadcaster_id: TWITCH_CHANNEL_ID,
    },
    headers: {
      authorization: `Bearer ${TWITCH_OAUTH_TOKEN}`,
      'client-id': TWITCH_CLIENT_ID,
    },
  });
  // TODO: handle pagination...
  return data.data;
}

async function removeTwitchEvent(event) {
  await axios.delete('https://api.twitch.tv/helix/schedule/segment', {
    params: {
      broadcaster_id: TWITCH_CHANNEL_ID,
      id: event.id,
    },
    headers: {
      authorization: `Bearer ${TWITCH_OAUTH_TOKEN}`,
      'client-id': TWITCH_CLIENT_ID,
    },
  });
}

async function createTwitchEvent(event) {
  const create = {
    start_time: event.start,
    timezone: 'UTC',
    is_recurring: false,
    duration: ((event.end - event.start) / 1000 / 60).toString(),
    category_id: TWITCH_CATEGORY_ID,
    title: event.summary,
  };
  await axios.post('https://api.twitch.tv/helix/schedule/segment', create, {
    params: {
      broadcaster_id: TWITCH_CHANNEL_ID,
    },
    headers: {
      authorization: `Bearer ${TWITCH_OAUTH_TOKEN}`,
      'client-id': TWITCH_CLIENT_ID,
    },
  });
}

async function waterfall(promises, cb) {
  await promises.reduce(async (promise, event) => {
    await promise;
    try {
      await cb(event);
    } catch (error) {
      console.error(error.response.data);
    }
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 500));
  }, Promise.resolve());
}

async function sync() {
  const googleEvents = await getGoogleEvents();
  const twitchEvents = await getTwitchEvents();
  await waterfall(twitchEvents.segments || [], removeTwitchEvent);
  await waterfall(googleEvents, createTwitchEvent);
}

sync();
