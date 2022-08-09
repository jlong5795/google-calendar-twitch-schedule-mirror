# Google Calendar -> Twitch Schedule Mirror

Update a Twitch schedule based on a Google calendar link.

This script will:
* Remove all upcoming events on your Twitch Schedule
* Create an upcoming event on your Twitch Schedule for every upcoming event on the given Google calendar

> This node.js script requires at least [Node.js version 14](https://nodejs.org/en/).

| VARIABLE | DESCRIPTION |
|-|-|
| GOOGLE_CALENDAR_ID | Google calendar ID. It will look like this: fdjrq4spg16jkpg6ahg41v3510@group.calendar.google.com |
| TWITCH_CHANNEL_ID | The channel ID to sync to |
| TWITCH_CATEGORY_ID | The category to set for every scheduled stream |
| TWITCH_OAUTH_TOKEN | Must have `channel:manage:schedule` scope for the channel you are syncing to |
| TWITCH_CLIENT_ID | Your twitch client id |

## Install Dependencies

```sh
npm install
```

## Run

```sh
node src/index.js
```
