# Nimbus: Live Weather App

A dynamic weather web app that fetches **real-time data from a free public API**, built with **HTML, CSS and JavaScript** as **Task 4** of the **Internify Frontend Development Internship**.

[Nimbus weather app](screenshots/preview.png)

## Features

- **Search bar** for city names (Pakistan / Worldwide scope) plus quick-pick popular cities
- Live data fetched with the **Fetch API and async/await** from [Open-Meteo](https://open-meteo.com/) (forecast, geocoding and air-quality APIs, no API key needed)
- **Loading spinner** while data is being fetched
- **Error handling**: clear messages such as "City not found" or "Couldn't reach the weather service", with a retry option
- Styled dashboard: current weather, next 24 hours, 7-day forecast, feels-like, humidity, wind, UV index, air quality and sunrise/sunset
- **°C / °F** unit switch
- **Local storage**: the last 3 searches are saved and still available after refreshing the page
- Animated transitions when new data loads, and a fully responsive layout for mobile devices

## Tech Stack

HTML5 · CSS3 (animations, responsive layout) · Vanilla JavaScript (Fetch API, async/await, localStorage)

## API Used

| API                              | Purpose                                    |
| -------------------------------- | ------------------------------------------ |
| `geocoding-api.open-meteo.com`   | Converts a city name to coordinates        |
| `api.open-meteo.com`             | Current weather, hourly and daily forecast |
| `air-quality-api.open-meteo.com` | US AQI                                     |

## Project Structure

```
project4/
├── index.html
├── style.css
└── script.js
```

## Run Locally

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
# open index.html in your browser (an internet connection is required for live data)
```

## What I Learned

Real-world API integration, asynchronous JavaScript, error handling and using browser storage.

## Author

**S Fatima Manzoor**

---

Built for the **Internify** Frontend Development Internship.
