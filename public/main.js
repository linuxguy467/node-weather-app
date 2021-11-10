const weatherDisplay = document.querySelector('.weather');
const weatherForm = document.querySelector('#weather-form');
const cityInput = document.querySelector('#city-input');

// Fetch weather data from API
const fetchWeather = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=859e7e6266734e0ef466ebd9b62d1b8c
`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.cod === '404') {
    alert('City not found');
    return;
  }

  const displayData = {
    city: data.name,
    temp: kelvinToFahrenheit(data.main.temp),
  };

  addWeatherToDOM(displayData);
};

// Add display data to DOM
const addWeatherToDOM = (data) => {
  const h1 = document.createElement('h1');
  h1.textContent = `Weather in ${data.city}`;

  const h2 = document.createElement('h2');
  h2.innerHTML = `${data.temp} &deg;F`;

  weatherDisplay.appendChild(h1);
  weatherDisplay.appendChild(h2);

  cityInput.value = '';
};

// Convert Kelvin to Fahrenheit
const kelvinToFahrenheit = (temp) => {
  return Math.ceil(((temp - 273.15) * 9) / 5 + 32);
};

// Event listener for form submission
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (cityInput.value === '') {
    alert('Please enter a city');
  } else {
    fetchWeather(cityInput.value);
  }
});

// Initial fetch
fetchWeather('Miami');
