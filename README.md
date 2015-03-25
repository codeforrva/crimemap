# RVA Crime Map

This app provides a map view of historical police incident data in Richmond, VA.

You can see it in action [on GitHub](http://codeforrva.github.io/crimemap/).

## Building and running

RVA Crime Map is a purely client-side JavaScript application built on React. It accesses data hosted in [Socrata](https://brigades.opendatanetwork.com/TRANSPARENCY/Richmond-Police-Incident-Data/ush7-in5v).

### To build:

1. Install [node.js with npm](https://nodejs.org/download/).
2. Run `npm install` to install dependencies.
3. Run `npm run build` to precompile React components once, or `npm run watch` to have them compiled automatically when you change files.

### To run:

Only a static HTTP server is needed to host the app. Configure an existing HTTP server or run `npm run server` to start a local nodejs server to serve the files.

## Contributing

You can contribute in several different ways:

1. __Submit a pull request.__ Fork this repository and make some changes!
2. __Submit bug reports and feature requests.__ Use our GitHub issue tracker.
3. __Get involved in Code for RVA.__ Check our [website](http://www.codeforrva.org/) for events and other projects, or [see what we're up to on GitHub](https://github.com/codeforrva).



