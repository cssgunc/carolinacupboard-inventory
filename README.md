# carolinacupboard-inventory

This is an inventory management app developed by UNC-CH CS+Social Good for Carolina Cupboard.

## Development Setup
1. Install [nodejs and npm](https://nodejs.org)
1. Download PostgreSQL and setup a local PostgreSQL server OR use a remote PostgreSQL server for development
    1. CloudApps currently uses PostgreSQL 9.6
    1. [ElephantSQL](https://www.elephantsql.com/) was used by some members during the original development of this app
1. Clone this repo
1. `cd` into the cloned directory and run `npm install`
1. Make a copy of `.env-example` and name it `.env`
    * Edit the environment variables for your dev setup
    * See the section on [environment variables](#environment-variables) for more info
1. Run the bootstrap.sh file (scripts/bootstrap.sh) to create the tables
    * If you're on Windows, try "sh ./scripts/bootstrap.sh" in PowerShell
    * You can also copy the line in bootstrap.sh and paste it into PowerShell/terminal
1. Run `npm run dev` to start the server in development mode
1. Go to `localhost:8080` in your web browser

## Environment Variables
`DATABASE_URL`: The url for your postgresql server

- If you're using a local PostgreSQL server, the url will be `postgres` by default

`DATABASE_USER`: The login username for your postgresql server

- If you're using a local PostgreSQL server, the user will be `postgres` by default

`DATABASE_PASSWORD`: The password for your postgresql login

`DEFAULT_ADMIN`: The onyen that will be created in the `USERS` table as the default admin

`DEV_USERTYPE`: The user type you want to mock when running in dev mode (admin, volunteer, user)

`DEV_ONYEN`: The onyen user you want to mock when running in dev mode

**NOTE**:  In local development, you must either set `DEV_USERTYPE` OR you must create an admin/volunteer in the `USERS` table and set `DEV_ONYEN` to that user.

You may add more environment variable is you would like. You can access them through `process.env.ENV_VAR_NAME`

## Project Structure
This section will go over the project structure and what functionality is contained at each level.

### `config`

This folder contains `server.js` which sets up `dev` and `prod` as arguments for `npm run`. This sets the port number and logging level. Please do not change files in this folder unless you know what you're doing.

### `controllers`

This folder contains files that describe the routes for this app, the functions that are executed when a route is requested, and what each request returns to the client. The `index.js` file binds each other file to their root route (eg. `admin.js` to `/admin`, `entry.js` to `/entry`, etc.). 

The routes typically use a response object to render EJS files and return them to the client. These EJS files can be found in `views`. 

Calls to the PostgreSQL tables should never be made in controller files. That logic can be found in `services`.

Both `log.js` and `scan.js` are unused and should be deleted or revisted in the future.

### `db`

This folder contains scripts for configuring Sequelize (which we use to access and modify PostgreSQL tables in node. It also contains scripts for initializing and deleting PostgreSQL tables through Sequelize. 

The `init-admin.js` file is used to create the `PREORDER` admin and the default admin (as set in the environment variables). 

**NOTE**: These scripts are only used for development purposes. They are not run when deploying to production on CloudApps.

### `exceptions`

This folder contains files for custom exceptions. These are not well designed or fully implemented at the moment, and should be revisited in the future

### `models`

This folder contains files that describe the table schemas to Sequelize so that it can properly create tables and modify entries. 

If you change the table schemas, you must modify them here so that the table initialization scripts work properly.

### `psql_scripts`

This folder contains commands that can be run (or copy+pasted) in psql to create the tables used in this project. **NOTE**: These commands are currently used to create and update the production tables in CloudApps. 

If you change the table schemas, you should also update these scripts. This can be done by updating the Sequelize schemas in `models` and then running a `pg_dump` in psql. See [this thread](https://stackoverflow.com/questions/2593803/how-to-generate-the-create-table-sql-statement-for-an-existing-table-in-postgr) or [this thread](https://stackoverflow.com/questions/1884758/generate-ddl-programmatically-on-postgresql) for more info.

### `scripts`

This folder contains the `bootstrap.sh` script which runs the table deletion and initialization scripts in `db`. Consider refactoring this in the future.

### `services`

This folder contains service-level logic for the app. This mostly means that all calls to Sequelize (accessing/modifying tables) are done in these files.

### `static`

This folder contains static client-side content like CSS, JavaScript, and images.

### `views`

This folder contains EJS templates that are pre-processed and rendered as HTML to the client. It may be easy to think of these as HTML files with some dynamically rendered parts. Look [here](https://ejs.co/) for more details on EJS.

The EJS files are split into root, user, and admin folders. Consider adding a volunteer folder in the future because some files in the admin folder are accessible to volunteers.

`index-ui.css` is unused and should be removed.

### `.env, .env-example`
The `.env` file used for environment variables. Please see [the above section](#environment-variables) for more information.

### `app.js`
This file initializes many of the packages that are used throughout the app. It also registers all the routes defined in `controllers` as well as the root/index route.

### `index.js`
This file is the main file that is run when `npm run` is called. It starts the server.

### `package.json`

This file configures the node app. It defines the main file, the dependencies, and npm run arguments.

## whiteboard.jpg, whiteboard2electricboogaloo.jpg

These are images drawn during the planning phase of the project and should be deleted.

### `openshift`

This is meant for configuration of the Openshift platform which is used by Carolina CloudApps. Please do not change files in this folder unless you know what you're doing.

### `helm, node_modules, package-lock.json`

These files/folders are used by nodejs and npm.
