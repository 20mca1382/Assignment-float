const timeEl = document.getElementById('time');
const dateEl = document.getElementById('date');
const currentWeatherItemsEl = document.getElementById('current-weather-items');
const timezone = document.getElementById('time-zone');
const countryEl = document.getElementById('country');
const weatherForecastEl = document.getElementById('weather-forecast');
const currentTempEl = document.getElementById('current-temp');
const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');
const addBtn = document.getElementById('add-btn');
const favouritesListEl = document.getElementById('favourites-list');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const API_KEY ='49cc8c821cd2aff9af04c9f98c36eb74';

let favourites = JSON.parse(localStorage.getItem('favourites')) || [];

// Set up event listeners
searchBtn.addEventListener('click', searchWeatherByCity);
addBtn.addEventListener('click', addFavourite);

// Show the weather for the user's current location
getWeatherData();

function getWeatherData () {
    navigator.geolocation.getCurrentPosition((success) => {
        
        let {latitude, longitude } = success.coords;

        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`).then(res => res.json()).then(data => {

        console.log(data)
        showWeatherData(data);
        })

    })
}

function searchWeatherByCity() {
    const city = searchBox.value.trim();
    if (!city) return;
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(data => {
        console.log(data);
        const { coord } = data;
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=hourly,minutely&units=metric&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            showWeatherData(data);
        });
    });

}
function addFavourite() {
    const city = searchBox.value.trim();
    if (!city) return;
    
    // Check if city already exists in favorites list
    if (favourites.includes(city)) {
        alert(`${city} is already in your favorites list.`);
        return;
    }
    
    // Add city to favorites list
    favourites.push(city);
    
    // Update favorites list in local storage
    localStorage.setItem('favourites', JSON.stringify(favourites));
    
    // Update favorites list UI
    renderFavourites();
}

function renderFavourites() {
    // Clear favorites list UI
    favouritesListEl.innerHTML = '';
    
    // Render each favorite city as a list item
    favourites.forEach(city => {
        const listItem = document.createElement('li');
        listItem.textContent = city;
        favouritesListEl.appendChild(listItem);
    });
}

// Call renderFavourites on page load to show existing favorites
renderFavourites();


function showWeatherData (data){
    let {humidity, pressure, sunrise, sunset, wind_speed} = data.current;

    timezone.innerHTML = data.timezone;
    countryEl.innerHTML = data.lat + 'N ' + data.lon+'E'

    currentWeatherItemsEl.innerHTML = 
    `<div class="weather-item">
        <div>Humidity</div>
        <div>${humidity}%</div>
    </div>
    <div class="weather-item">
        <div>Pressure</div>
        <div>${pressure}</div>
    </div>
    <div class="weather-item">
        <div>Wind Speed</div>
        <div>${wind_speed}</div>
    </div>
    <div class="weather-item">
        <div>Sunrise</div>
        <div>${window.moment(sunrise * 1000).format('HH:mm a')}</div>
    </div>
    <div class="weather-item">
        <div>Sunset</div>
        <div>${window.moment(sunset*1000).format('HH:mm a')}</div>
    </div>`;

    let otherDaysForecast = '';
data.daily.forEach((day, idx) => {
    if (idx == 0) {
        currentTempEl.innerHTML = `${Math.round(day.temp.day)}&deg;C`;
        currentWeatherItemsEl.insertAdjacentHTML('afterbegin', `
            <div class="weather-item">
                <div>${days[(new Date()).getDay()]}</div>
                <div>${Math.round(day.temp.day)}&deg;C</div>
            </div>
        `);
    } else {
        otherDaysForecast += `
            <div class="weather-forecast-item">
                <div>${days[(new Date(day.dt * 1000)).getDay()]}</div>
                <div>${Math.round(day.temp.day)}&deg;C</div>
            </div>
        `;
    }
});

weatherForecastEl.innerHTML = otherDaysForecast;}

