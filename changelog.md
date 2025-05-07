## Sprint 1: 6/2018
Get the dev app up and running
* Start a new app with create react app
* Add react router and set up basic routes
* Add eslint for sanity
* Set up react-bootstrap and write some demo controls
* Can't get the eslint rules how I like them. I will have to come back to it
* Write a basic form page to copy what was already implemented. It doesn't write to the server yet
* Set up leaflet-react
* Write a basic map tool page with leaflet react
At this point I have proof of concept pages for the survey and the map tool. The dev server works and can be run locally.

## Sprint 2: 7/2018
This week I am setting up a basic production server so that we can have REST calls for database connectivity.
The plan is to use Express as an app server and to proxy calls to the database. Step by step:
* Split the root of the project into a client and a server directory
* Add a package.json to the root directory for shared dependencies and scripts that I want 
to be able to run from the root. For example, it will be nice to have `build`, `start:dev` and `start:prod`
at the root. **NOTE:** For now I am using bash in the top-level yarn scripts, so they won't
work on windows. I will keep the README platform agnostic.
* Update .gitignore to ignore node_modules everywhere.
* Add `concurrently` to the root to run two server procs at once. This is because in dev
we want to run the dev server proxying to the api server.
* Add a yarn scipt to start the servers.
* Add dev server proxying to webpack config in `client/package.json`
* Create an express server in the `server` directory with a test API endpoint (on 3001 for now)
* Add a test api page to the app. We'll use it to develope the database.
* Add client-side routing and static file serving to `server.js`
* Install postgres locally for development
* Create dev db in postgres
* Add script to start postgres with everything else
* Add pg and sequelize node pacakges to server. We need these to talk to the database.
* Add a services directory and api interface for async calls
* Add `bodyParser` to express to parse json
* Add inputs to the test page 
* Add an echo endpoint to the server
* Removed `"eject": "react-scripts eject"` from `client/package.json`
* Add sql input to API test and `sendSql` to `api.js`. This is for dev time. We won't be sending raw SQL at run time.
* Add `_unsafe_sqlTest` endpoint to server. Again, for dev time. We will remove this altogether when ORM is in place.
* Set up server to run the unsafe SQL, then return the response
At this point we have a production dev server that proxies API requests to a production server, and a postgres database that can be queried.
There is a test page in the app where we can enter sql to test the database.

## Sprint 3: 8/2018
Next, the plan is to get the app writing to and reading from the database.
* Add a top-level script to start everything.
* Branch `orm-setup` to try a complete ORM setup with `sequelize`
* Add `bin` directory to root for scripts 
* Add `morgan` for logging
* Add `.sequelizerc` to configure sequelize
* Fix license warning with `"license": "UNLICENSED"` in all `package.json` files. We will have to decide later what this should actually be.
* I put sequelize in the server project instead of at the root because the client doesnt need it
* Intialize sequelize with `models`, `config`, and `migrations`. I left seeders out for now. We can revisit that if need be.
* Set up dev environment to use local database `flom_dev` as user `flom` with password `flom`
* Create models for `session`, `activity`, and `question`. This might cahnge later, but it seems like a good place to start
* Create migration files for models and initialize the database by migrating them
* Add controllers for session create and list
* Split out routes to their own server file
* I converted all the database objects to lower case. I will use the convention that all db objects will be lower case.
* Add `sessionId` to the activity model
* Add activity create controller
* Add a find session endpoint
* Add question `POST` controller
* Add activity list controller
* Add questins to session detail list
At this point I have functional database connectivity, a model for how to structure the database, and configuration touchpoints for the database. Now it's time to actually build out a demo app.

## Sprint 4: 9/2018
Next, build a demo app on top of the app infrastructure and database that is in place.
* Begin defining a survey format in JSON.
* Add `api/suveys` endpoint.
* Add `glob` for finding survey files dyanmically.
* Add `lodash` to the server for mapping file paths to something useful. And for everything else.
* Update survey controller to read any survey in the `surveys` directory.
* Add a page to list available surveys.
* Add a utility to create ids from strings. We'll use titles and questions to create ids.
* Add a `survey` endpoint that understands survey ids and which survey to pick up.
* Add an intro page for begining a session.
* Make it so clicking 'ok' on the intro page generates a session and starts a survey.
* Add a form activity renderer
Now we can read and write to the database, create new sessions, and render forms. Next, more activities, and actual answers written to the DB

## Sprint 5: 9-10/2018
Build out activity types and data storage. Especially the Map activity.
* Added some linter rules for spaces.
* Add activity index to the route.
* Add redirecting to the next activity on activity submit.
* Create a `shared` directory and move `getIdFromString` utility there. We need it on both client and server.
* Sigh. Then put the utility back in the server and duplicate it. This is annoying. But Create React App doesn't support imports outside of itself. So we will have to keep two copies. Note symlinks are a bad idea because we are trying to be platform agnostic.
* Add state to form activity. Now it keeps track of the value for each question.
* Create an endpoint and controllers to submit all answers for an activity. This is in a branch for now.
* Merge that branch. Seems to work. Still need to send them from the client. 
* Refactor `MapToolPage` into `MapTool` and `MapToolPage`.
* Create `MapActivity` and add it to `SurveyPage`.
* Remove top-level css and create layout components so that maps and surveys can have different page layouts.
* Update map layout to work with a side bar.

## Sprint 6: 10/2018
More data saving and map activity features.
* Mark activity create async so it can be chained with await
* Modify the activity submit endpoint to first create an activity, then use the new id to add questions.
* Submit answers with sessionId isntead of activityId
* At this point you can submit answers with a session idea and an actitivity is created with those answers.
* Add questions to the session by id api
* Remove activity creation by sessionID endpoint
* Add find activity endpoint
* Update activity response format
* Add type and index to responses
* Properly submit questions
* At this point submits work and the answers are recorded
* Capture default values in for activities
* Need more data in the tables, adding fields
  * Update session model to have a 'complete' field
  * Update activites to have 'complete', 'title', and 'index'
  * Update questions to have 'text' and 'index'
* Send new activity data on submit
* Add a controller to edit sessions
* Add client api to update sessions
* Mark sessions complete when they are complete
* Add proposed format for data reuse to demo1
* At this point the basic infrastructure is there. Next I will try to build some surveys and add fetures as needed. 

## Sprint 7: 11/2018
* Add New England demo to drive features
* Add a practice section to the new england survey
* Add customizable start button
* Add zoom level to map activity definitions
* Move map state out of map to map activity. The map contract is now:
  * Parent element provides state (points and polygons)
  * Map calls a callback when interaction happens
  * Parent element calculates state and passes it back to map
* Make the map activity move through questions as they are completed
* Add info about data formats to README
* Make map activity submit answers as lat lon pairs
* Convert all responses to string before database storage
* Change response datatype to TEXT in the database
* Add `geojson` from npm to parse data
* Update MapTool data contract to use a better format for `geojson`
* Use `geojson` to parse responses before sending to the server

## Sprint 8: 12/2018
* Create demo survey with desired audio configuration
* Add skeleton for RandomAudioActivity
* Update readme with data on survey descriptions
* Add a readme in surveys directory to catalog survey format
* Describe supported survey properties and activity types
* Add some comments to map activity
* Map properties added to the readme
* Make it possible to move between questions on the map

## Sprint 9: 1/2019
* Add a client `contributing` doc.
* Document `index.js`
* Document `App.js`
* Add question state to `RandomAudioActivity`
* Render form questions in random audio
* Move activities to their own directory
* Add `FormInputRenderer`
* Refactor to render forms witn `FormInputRenderer`
* Add next button to `RandomAudioActivity` to move through audio files
* Clean up random audio activity
* Reset audio after playing
* Serve audio from static directory
* Add more demo audio
* Cycle between audio files
* Add help tittle and help text to audio activity
* Add Icons
* Style play button

## Sprint 10: 2/2019
* Update Random Audio activity to store answers by audio
* Comments for documentation in form renderer
* Add documentation for Random audio activity
* Add completed state to `RandomAudioActivity`
* Make `RandomAudioActivity` submit answers
* Add notes field to DB to store extra info about questions
* Submit audio file info as notes on random audio activity
* Store question notes field in db
* Upgrade `bootstrap` to address a security concern
* Upgrade `react-bootstrap` to 1.0
* Add start:prod to production server
* Remove build from git
* Add setup docs
* Fix dependencies from `yarn setup`
* Add `yarn start:dev` to start everything from the root
* Add `yarn:stop` for completeness
* Document running the dev app
* Document stopping the dev app
* Document all app commands
* Create docker branch
  * Add `Dockerfile`
  * Install dependencies on docker
  * Copy app to docker
  * Add `yarn start:prod`
  * Add CMD to docker
* Add server `start:prod`
* Expose port 3000
* At this point we have a docker container serving the app
* Add `.dockerignore` to speed up docker build by not copying node_modules
* Add postgres to Dockerfile
* Add postgres init scripts
* Use Ubuntu for docker base
* Make ubuntu install non-interactive
* Change to install yarn with NPM. There is an issue on ubuntu:
  * https://stackoverflow.com/questions/46013544/yarn-install-command-error-no-such-file-or-directory-install
* Change user to `postgres` in sequelize config to match docker container user setup
* Move database init to container start so the db can be initiated when postgress is up
* Docker container running the app and postgres works!!
* Add docker docs
* Add docs about resources
* Move docs to docs directory
* Add architecture docs
* Make home redirect to the first survey
* Add a survey name variable to docker build
* Make `/surveys` endpoint only return the specified survey when specified
* Redirect to single survey if set, survey list page if not
* Add docker start scripts so ports can be specified
* Add docker yarn commands
* Add arguments to docker commands
* Document new commands

I used a couple blog posts about how to set up Express and postgres:
* https://medium.freecodecamp.org/how-to-make-create-react-app-work-with-a-node-backend-api-7c5c48acb1b0
* https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/
* https://www.robinwieruch.de/postgres-express-setup-tutorial/
* https://scotch.io/tutorials/getting-started-with-node-express-and-postgres-using-sequelize

Some relevant stack overflow docs:
* https://stackoverflow.com/questions/46013544/yarn-install-command-error-no-such-file-or-directory-install

## Sprint 11: 5/2025 (new dev: Angie McMillan-Major)
* Fixed char used for newline split from '/n' to '\n' in `client/src/components/ParagraphRender/index.jsx` 
* Updated `client/src/components/FormRender/index.jsx` so that the scale for rating questions is labeled when the survey definition includes the `least` and `best` properties for rating questions
* Fixed Audio button not playing: 
  * Updated `client/src/components/AudioButton/index.jsx` with correct src folder path for audio file
  * Updated `client/src/pages/SurveyAddPage/index.jsx` with correct audio file path to show researcher when creating survey definition
  * Updated `server/index.js` to allow cross-origin access (restricted to app domain)
* Added `OutputFormatter` class to `client/src/components` to format response data into researcher-preferred TSV with one line per freedraw submission (possibly resulting in multiple lines for a single respondant) for table view and exporting
  * Added radio button to select latitude-longitude format for the export file and table to `client/src/components/OutputFormatter/index.jsx`, e.g. Format 1: POLYGON((LAT1, LON1), (LAT2, LON2), ...); Format 2: POLYGON((LON1 LAT1, LON2 LAT2, ...))
  * Updated `pages/SurveyResponsePage/index.jsx` call `client/src/components/OutputFormatter` to show response data in table format and to export TSV file instead of JSONviewer
  * Updated `App.css` with style for table view
* Fixed `client/src/components/IntroRender/index.jsx` and `client/src/pages/Survey/index.jsx` so they now use the startText property as given in a survey definition