// Dati di una singola ora.
export interface WeatherHour {
  datetime: string;
  datetimeEpoch: number;
  temp: number;
  windspeed: number;
  precipprob: number;
  conditions: string;
}

// Condizioni meteo attuali.
export interface CurrentWeather {
  datetime: string;
  datetimeEpoch: number;
  temp: number;
  windspeed: number;
  precipprob: number;
  conditions: string;
}

// Giorno con tutte le sue ore.
export interface WeatherDay {
  datetime: string;
  hours: WeatherHour[];
}

// Risposta complx ricevuta dalla nostra API.
export interface WeatherData {
  resolvedAddress: string;
  currentConditions: CurrentWeather;
  days: WeatherDay[];
}
