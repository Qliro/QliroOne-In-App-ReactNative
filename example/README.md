# Example App

## Setup

run `yarn` to install all dependencies

Before running iOS, also run the following:
`cd ios && pod install && ..`

Set `baseUrl` and `token` in [Client.ts](./Client.ts)

## Both iOS and Android

Start the javascript bundler and keep it running:

`yarn start`

To run iOS:

`yarn ios`

To run Android:

`yarn android`
