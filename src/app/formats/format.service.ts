import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseList } from '../interfaces/response-list.interface.js';
import { Format } from '../interfaces/format.interface.js';
import { ResponseWithError } from '../interfaces/response-with-error.interface.ts.js';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  readonly urlFormats = `${environment.apiBaseUrl}/formats`;

  //HttpClient Se inyecta en el servicio a través del constructor para que pueda usarse dentro de los métodos del servicio
  constructor(private http: HttpClient) { }

  getFormats(): Observable<any> {
    return this.http
      .get<ResponseList<Format> | ResponseWithError>(this.urlFormats)
  }

}

