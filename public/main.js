const weatherDisplay = document.querySelector('.weather')
const weatherForm = document.querySelector('#weather-form')

// Fetch weather data from API
const fetchWeather = async (city) => {
  const url = `/api?q=${city}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.cod === '404') {
    alert('City not found')
    return
  }

  const displayData = {
    city: data.name,
    temp: kelvinToFahrenheit(data.main.temp),
  }

  addWeatherToDOM(displayData)
}

// Add display data to DOM
const addWeatherToDOM = (data) => {
  weatherDisplay.innerHTML = DOMPurify.sanitize(
    `
    <h1>Weather in ${data.city}</h1>
    <h2>${data.temp} &deg;F</h2>
  `,
    { USE_PROFILES: { html: true } }
  )
}

// Convert Kelvin to Fahrenheit
const kelvinToFahrenheit = (temp) => {
  return Math.ceil(((temp - 273.15) * 9) / 5 + 32)
}

// Event listener for form submission
weatherForm.addEventListener('submit', (e) => {
  e.preventDefault()

  while (weatherDisplay.firstChild) {
    weatherDisplay.removeChild(weatherDisplay.firstChild)
  }

  const cityInput = e.target[0]

  if (cityInput.value === '') {
    alert('Please enter a city')
  } else {
    fetchWeather(cityInput.value)
    cityInput.value = ''
  }
})

// Initial fetch
fetchWeather('Miami')
