import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Language, ResponseList, ResponseWithError } from '../interfaces/interfaces.js';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  readonly urlLanguages = `${environment.apiBaseUrl}/languages`;

  //HttpClient Se inyecta en el servicio a través del constructor para que pueda usarse dentro de los métodos del servicio
  constructor(private http: HttpClient) { }

  getLanguages(): Observable<any> {
    return this.http
      .get<ResponseList<Language> | ResponseWithError>(this.urlLanguages)
  }
}
