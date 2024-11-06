import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseOne, ResponseWithError, User } from '../interfaces/interfaces';


@Injectable({
  providedIn: 'root',
})
export class LoginService {

  readonly url = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  user!: User;
  
  /*getUser(userData: any): Observable<any> {
    return this.http.post<ResponseOne<User> | ResponseWithError>(`${this.url}/login`, userData);
  }*/

  addUser(userData: any): Observable<any> {
    return this.http.post<ResponseOne<User> | ResponseWithError>(`${this.url}/register`, userData)
  }

  updateUser() {

  }

  deleteUser() {

  }

}
