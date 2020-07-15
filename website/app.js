/* Global Variables */

// Localhost URL (with port)
const localhostURL = 'http://localhost:3000'

// Input fields
const zipCodeInput = document.getElementById('zip');
const feelingInput = document.getElementById('feelings');

// Personal API Key for OpenWeatherMap API
const openWeatherMapApiKey = '9242ce27542a97e7c5e37f274feb2e4d'
const openWeatherMapURL = 'http://api.openweathermap.org/data/2.5/weather'

// Error fields
const zipCodeErrorField = document.getElementById('zip-error');
const feelingErrorField = document.getElementById('feeling-error');

// City message field
const cityMessageField = document.getElementById('city-message');

// Latest entry labels
const entryDateHolder = document.getElementById('date');
const entryTemperatureHolder = document.getElementById('temp');
const entryContentHolder = document.getElementById('content');

// Create a new date instance dynamically with JS
let d = new Date();
let newDate = d.getMonth()+'.'+ d.getDate()+'.'+ d.getFullYear();

// Event listener to add function to existing HTML DOM element
const generateButton = document.getElementById('generate');

generateButton.addEventListener('click', clickedGenerate)

/* Function called by event listener */
async function clickedGenerate() {
  const zipCode = zipCodeInput.value;
  const feeling = feelingInput.value;

  // console.log(`Clicked generate with params: { zipCode: ${zipCode}, feeling: ${feeling} }`);

  // Validate input, show error message if not completed
  const hasError = validateInput(zipCode, feeling);

  if(hasError) {
    // console.log('Error detected in fields, stop processing...')
    // Do nothing
    return;
  }

  // Then, we fetch the weather data from OpenWeatherMap API
  const weatherData = await getWeatherData(zipCode);


  if(weatherData.cod === '404') {
    // Sample incorrect zip: 11132
    cityWasNotFound();
    // Stop processing if city was not found
    return;
  } else {
    // Hide error in case of sucssessful call
    cityFound(weatherData.name);
  }

  const { main: {temp: temperature} } = weatherData;

  // Post data in local API
  await addData(zipCode, feeling, temperature);

  // Get all data from local API
  const projectData = await getData();

  console.log('projectData', projectData);

  // Dynamically change the most recent entry
  const { data } = projectData;
  console.log('data', data);
  const latestEntry = data[data.length-1];
  console.log('latestEntry', latestEntry);
  showLatestEntry(latestEntry);
}

/* Function to GET Web API Data*/

async function getWeatherData(zipCode) {

  // Open Weather API URL
  const weatherApiURL = openWeatherMapURL + `?zip=${zipCode}&appid=${openWeatherMapApiKey}&units=imperial`

  return new Promise((resolve, reject) => {
    fetch(weatherApiURL)
    .then(response => response.json())
    .then(data => resolve(data))
    .catch(err => reject(err));
  });
}

/* Function to POST data */
async function addData(zipCode, feeling, temperature) {

  // Local API URL (saving data)
  const postDataURL = localhostURL + '/';

  return new Promise((resolve, reject) => {
    fetch(postDataURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zipCode,
        feeling,
        temperature,
        date: newDate,
      })
    })
    .then(response => response.json())
    .then(data => resolve(data))
    .catch(err => reject(err));
  })
}

/* Function to GET Project Data */
async function getData() {
  const getDataURL = localhostURL + '/all';

  return new Promise((resolve, reject) => {
    fetch(getDataURL)
    .then(response => response.json())
    .then(data => resolve(data))
    .catch(error => reject(error))
  })
}

/* Helper function (validations.. etc) */
function validateInput(zipCode, feeling) {
  // By default there are no errors (error flag)
  let hasError = false;

  if(!zipCode || !/^[0-9]{5}(?:-[0-9]{4})?$/.test(zipCode)) {
    // Show error for zip code input
    hasError = true;
    zipCodeErrorField.innerText = 'Incorrect Input';
  } else {
    // Hide error for zip code input
    zipCodeErrorField.innerText = '';
  }

  if(!feeling) {
    hasError = true;
    // Show error for feeling input
    feelingErrorField.innerText = 'Incorrect Input'
  } else {
    feelingErrorField.innerText = ''
  }

  return hasError;
}

function cityWasNotFound() {
  cityMessageField.innerText = 'City with given Zipcode was not found';
  cityMessageField.classList.add('error');
}

function cityFound(cityName) {
  cityMessageField.innerText = `Retrieved weather data for ${cityName}`;
  cityMessageField.classList.remove('error');
}

function showLatestEntry(latestEntry) {
  const { zipCode, feeling, temperature, date } = latestEntry;

  entryDateHolder.innerText = `Date: ${date}`;
  entryTemperatureHolder.innerText = `Temperature: ${temperature}`;
  entryContentHolder.innerText = `Feeling: ${feeling}, Temperature: ${temperature}, Zipcode: ${zipCode}`;
}