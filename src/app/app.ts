import { DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { HttpParams, httpResource } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WeatherData, WeatherHour } from './models/weather.model';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Form per la ricerca della località.
  searchForm = new FormGroup({
    location: new FormControl('', { nonNullable: true }),
  });

  // Località per cui effettuare la ricerca meteo.
  location = signal('');

  // Chiave per accedere alla Weather API.
  private readonly apiKey = environment.weatherApiKey;

  // URL della Weather API.
  private readonly apiUrl =
    'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

  // Recupero i dati meteo da ieri a domani.
  weatherResource = httpResource<WeatherData>(() => {
    const location = this.location();

    // Se non è stata inserita una località allora non effettuo la richiesta.
    if (location === '') {
      return undefined;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const startDate = this.formatDate(yesterday);
    const endDate = this.formatDate(tomorrow);
    const params = new HttpParams()
      .set('unitGroup', 'metric')
      .set('include', 'days,hours,current')
      .set('key', this.apiKey)
      .set('contentType', 'json');

    return {
      url: `${this.apiUrl}/${encodeURIComponent(location)}/${startDate}/${endDate}`,
      params,
    };
  });

  // Recupero le 24h precedenti rispetto all'orario attuale.
  previous24Hours = computed<WeatherHour[]>(() => {
    if (!this.weatherResource.hasValue()) {
      return [];
    }

    const weather = this.weatherResource.value();
    const currentTime = weather.currentConditions.datetimeEpoch;
    return weather.days
      .flatMap((day) => day.hours)
      .filter((hour) => hour.datetimeEpoch < currentTime)
      .sort((firstHour, secondHour) => secondHour.datetimeEpoch - firstHour.datetimeEpoch)
      .slice(0, 24)
      .reverse();
  });

  // Recupero le 24 ore successive rispetto all'orario attuale.
  next24Hours = computed<WeatherHour[]>(() => {
    if (!this.weatherResource.hasValue()) {
      return [];
    }

    const weather = this.weatherResource.value();
    const currentTime = weather.currentConditions.datetimeEpoch;

    return weather.days
      .flatMap((day) => day.hours)
      .filter((hour) => hour.datetimeEpoch > currentTime)
      .sort((firstHour, secondHour) => firstHour.datetimeEpoch - secondHour.datetimeEpoch)
      .slice(0, 24);
  });

  // Imposto la località da cercare.
  searchWeather(): void {
    const location = this.searchForm.controls.location.value.trim();
    if (location === '') {
      return;
    }

    this.location.set(location);
  }

  // Riprovo la richiesta meteo.
  retry(): void {
    this.weatherResource.reload();
  }

  // Aggiorno i dati meteo.
  refresh(): void {
    this.weatherResource.reload();
  }

  // Restituisco un'emoji in base alle condizioni meteo.
  getWeatherEmoji(conditions: string): string {
    const weather = conditions.toLowerCase();
    if (weather.includes('rain')) {
      return '🌧️';
    }

    if (weather.includes('snow')) {
      return '❄️';
    }

    if (weather.includes('thunder')) {
      return '⛈️';
    }

    if (weather.includes('fog')) {
      return '🌫️';
    }

    if (weather.includes('overcast')) {
      return '☁️';
    }

    if (weather.includes('cloud')) {
      return '⛅';
    }

    return '☀️';
  }

  // Converto una data nel formato YYYY-MM-DD richiesto dalla API.
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
