// Setup empty JS object to act as endpoint for all routes
projectData = {
  data: []
};

/* Dependencies */
// const dotenv = require('dotenv');
// require('dotenv').config()

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const PORT = 3000; //process.env.PORT;

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static('website'));

// Initialize all route with a callback function
app.get('/all', getAllData);
app.post('/', addData);

// In case route is not found, send a message to the user
app.get('*', notFound);

// Callback function to complete GET '/all'
function getAllData(req, res) {
  return res.send(projectData);
}

// Post Route
function addData(req, res) {

  if(!isValidInput(req.body)) {
    return res.status(400).send({ message: "Incorrect input" })
  }

  projectData.data.push(req.body);

  return res.status(201).send({ message: "Successfully added data" });
}

// Show "404 not found" message to user
function notFound(req, res) {
  console.log("Incorrect endpoint, use either (GET: '/all') or (POST: '/')");
  res.status(404).send("Page was not found...");
}

// Spin up the server
app.listen(PORT, serverStatup);

// Callback to debug
function serverStatup() {
  console.log(`Started server --> [port = ${PORT}]`);
}

/* Helper functions */
function isValidInput(body) {
  const { zipCode, feeling, temperature, date } = body;

  if(
    !zipCode || !/^[0-9]{5}(?:-[0-9]{4})?$/.test(zipCode)
    || !feeling
    || !temperature
    || !date
  ) {
    return false;
  }

  return true;
}
