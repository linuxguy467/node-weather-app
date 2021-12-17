const weatherDisplay = document.querySelector('.weather')
const weatherForm = document.querySelector('#weather-form')
const cityInputElement = document.querySelector('#city-input')

const addWrongLabels = (text = 'Enter a valid city') => {
  cityInputElement.classList.add('wrong-input')
  cityInputElement.insertAdjacentHTML(
    'afterend',
    `<p style="color:#d70318">${text}</p>`
  )
}

const removeWrongLabels = () => {
  if (cityInputElement.classList.contains('wrong-input')) {
    cityInputElement.classList.remove('wrong-input')
    const p = document.querySelectorAll('p')[0]
    cityInputElement.parentElement.removeChild(p)
  }
}

const isHTML = (str) => {
  const doc = new DOMParser().parseFromString(str, 'text/html')
  return [...doc.body.children].some((node) => node.nodeType === 1)
}

// Fetch weather data from API
const fetchWeather = async (city) => {
  const weatherCity = DOMPurify.sanitize(city, { USE_PROFILES: { html: true } })

  if (isHTML(weatherCity)) {
    addWrongLabels()
    return
  }

  const url = `/api?q=${encodeURIComponent(weatherCity)}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.cod === '404') {
    addWrongLabels('City not found')
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

  removeWrongLabels()

  const cityInput = e.target[0]

  if (cityInput.value === '') {
    addWrongLabels('Please enter a city')
  } else {
    fetchWeather(cityInput.value)
    cityInput.value = ''
  }
})

// Initial fetch
fetchWeather('Miami')
