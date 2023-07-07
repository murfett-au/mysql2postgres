# Custom Data Migration Script

## What this does

Makes a connection to the mysql database running a remote server (in the developer's initial case - on the Yapeen Farm Raspberry Pi), and copy data from the solar and data tables into a Postgres db running on a laptop.

## How to Run
### Create config.js file
Copy the configSample.js file and replace the connection parameters with your own.
### Install node modules

### Execute
In a command prompt, change to the folder and type

`node copyData.js`

## Troubleshooting
If you see `Error: Cannot find module 'sequelize'` you need to run npm install in the project root folder.
If you see `Please create config.js by copying configSample.js and editing it.` you need to create the config.js file, to give this program credentials to access the remote mysql database.
