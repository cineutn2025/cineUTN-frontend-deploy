import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Buy, ResponseList, ResponseOne, ResponseWithError, Ticket, User } from '../interfaces/interfaces';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyAccountService {

  constructor(private http: HttpClient) { }

  readonly ticketsUrlByUser = `${environment.apiBaseUrl}/buys/byUser`;

  getBuyByUser(id: number): Observable<any> {
    return this.http.get<ResponseList<Buy> | ResponseWithError>(`${this.ticketsUrlByUser}/${id}`);
  }

}
