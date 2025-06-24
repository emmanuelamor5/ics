import React, { useEffect, useState } from 'react';

const WeatherBox = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = '17ced4ffb7c054e71e04110fd7051752';
      const lat = -1.286389;
      const lon = 36.817223;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };
    fetchWeather();
  }, []);

  return (
    <div className="weather">
      {weather ? (
        <>
          <h3>🌐 Current Weather in CBD</h3>
          <p>🌡️ Temperature: {weather.main.temp}°C</p>
          <p>🌥️ Conditions: {weather.weather[0].description}</p>
          <p>💨 Wind Speed: {weather.wind.speed} m/s</p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
        </>
      ) : (
        <h3>🔄 Loading weather...</h3>
      )}
    </div>
  );
};

export default WeatherBox;

