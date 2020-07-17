const BASE_URL = "http://api.openweathermap.org/data/2.5/forecast?q=";
const API_KEY = "&appid=2109f92e69cf64b7217771b95cfff1bc";

//This function starts the app - pulls in previous searches from local storage and displays as clickable
$(document).ready(function () {
  makeHistoryRows();
//click event - takes input, empties the input, then initiates function with AJAX call
  $("#button").on("click", function () {
    var searchedCity = $("#searched-city").val();
    var searchedCityLowerCase = searchedCity.toLowerCase()
    $("#searched-city").val("");
    console.log(searchedCityLowerCase)
    //pass in name of city
    searchWeather(searchedCityLowerCase);
  });
});
//using AJAX to make a GET request to weather API that returns JSON data

function searchWeather(cityString) {
  
  var myRequest = $.ajax({
    url: BASE_URL + cityString + API_KEY,
    method: "GET",
    datatype: "json",
  });
  //pull out the list  - the data we need
  myRequest.done(function (response) {
    let fiveDayForecast = response.list;
    console.log(response);
    //Store in localStorage
    localStorage.setItem(cityString, JSON.stringify(response.list));
    //renders everything
    renderToday(cityString, response.list);
    makeHistoryRows();
  });
}
// Of selected city
/*
- cityString: what
- everything else in the object
*/
function renderToday(cityString, list) {
//extract key value pairs from response into our object, added date
  let today = new Date();
  console.log(today);
  let cityTodayObj = {
    imageURL:
      "http://openweathermap.org/img/wn/" + list[1].weather[0].icon + "@2x.png",
    name: cityString,
    temp: kelvinToFaranheit(list[1].main.temp),
    humidity: list[1].main.humidity,
    wind: list[1].wind.speed,
    date: today,
    fiveDayForecast: [],
  };
  var counter = 1;
//going by multiples of 8 so needed to get one forcast for each day
  for (i = 8; i < list.length; i += 8) {
    console.log(list[i])
    cityTodayObj.fiveDayForecast.push({
      //name
      imageURL:
        "http://openweathermap.org/img/wn/" +
        list[i].weather[0].icon +
        "@2x.png",
      temp: kelvinToFaranheit(list[i].main.temp),
      humidity: list[i].main.humidity,
      wind: list[i].wind.speed,
      date: new Date(list[i].dt * 1000)
    });
    counter++;
  }
  
//building html forecast and appending it to html
  var todayContainer = $(".today-container");
  var htmlStringToday = `
    <div class="row">
       <h1 class="display-4"> ${
    cityTodayObj.name
    } (${getFormattedDate(cityTodayObj.date)})</h1>
       <img src= "${cityTodayObj.imageURL}" />
    </div>
    <div class="row">
    <p>Temperature: ${cityTodayObj.temp}</p>
    </div>
    <div class="row">
    <p>Humidity: ${cityTodayObj.humidity}</p>
    </div>
    <div class="row">
    <p>Wind: ${cityTodayObj.wind}</p>
    </div>
    <div class="row">
    <p>UV-Index: N/A </p>
    </div>
    `;
  let htmlStringForecast = "<h1>5-Day forecast</h1>";

  todayContainer.html(htmlStringToday);
  for (var i = 0; i < cityTodayObj.fiveDayForecast.length; i++) {
    const cur = cityTodayObj.fiveDayForecast[i];
    htmlStringForecast += `
        <div class="card">
          <h4> ${getFormattedDate(cur.date)} </h4>
          <img class="card-img-top" src="${cur.imageURL}" />
          <div class="card-body">
          <p class="card-text"> Temperature: ${cur.temp}</p>
          <p class="card-text"> Humidity: ${cur.humidity}</p>
          </div>
        </div>
        `;
  }

  var forecastContainer = $(".forecast-container");
  forecastContainer.html(htmlStringForecast);
}
/* F= KELVIN * 9/5 - 459.67*/
function kelvinToFaranheit(kelvinDeg) {
  return Math.floor(kelvinDeg * (9 / 5) - 459.67);
}
//using javascript date object to get correct format
function getFormattedDate(dateObj) {
  return `${dateObj.getMonth()}/ ${dateObj.getDate()}/ ${dateObj.getFullYear()}`
}

function makeHistoryRows() {

  var container = document.getElementsByClassName("history-rows")[0];
  let htmlString = ``;
  for (var i = 0; i < localStorage.length; i++) {
    var curKey = localStorage.key(i);
    if (localStorage.getItem(curKey)) {
      htmlString += `<div class="row history-row">
            <h3 id="${curKey}"> ${curKey}</h3>
            </div>`
    }
  }
  container.innerHTML = "";
  container.innerHTML += htmlString;

  registerClickHistory()
}
//registers what happens when the history are clicked and adds click even to all in history
function registerClickHistory() {
  var historyArray = document.getElementsByClassName("history-row")
  console.log(historyArray);

  for (let index = 0; index < historyArray.length; index++) {
    const element = historyArray[index];
    $(element).on("click", function (event) {
      let name = event.target.id;
      let data = JSON.parse(localStorage.getItem(name));
      renderToday(name, data)
    });
  }
}