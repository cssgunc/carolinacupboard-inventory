# carolinacupboard-inventory

This is an inventory management app developed by UNC-CH CS+Social Good for Carolina Cupboard.

## Development Setup
1. Install nodejs and npm
1. Setup a local postgresql server or a remote postgresql server for development
1. Clone this repo
1. `cd` into the directory and run `npm install`
1. Make a copy of `.env-example` and name it `.env`
    * Edit the environment variables for your dev setup
    * See the section on environment variables for more info
1. Run the bootstrap.sh file (scripts/bootstrap.sh) to create the tables
    * If you're on Windows, try "sh ./scripts/bootstrap.sh" in PowerShell
    * You can also copy the line in bootstrap.sh and paste it into PowerShell/terminal
1. Run `npm run dev`
1. Go to `localhost:8080` in your web browser

## Environment Variables
`DATABASE_URL`: The url for your postgresql server

`DATABASE_USER`: The login username for your postgresql server

`DATABASE_PASSWORD`: The password for your postgresql login

`DEFAULT_ADMIN`: The onyen user you want to be the admin

`DEV_USERTYPE`: The user type you want the dev server to see you as (admin, volunteer, user)

`DEV_ONYEN`: The onyen user you want the dev server to see you as