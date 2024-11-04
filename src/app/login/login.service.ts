import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseList, ResponseOne, ResponseWithError, User } from '../interfaces/interfaces';


@Injectable({
  providedIn: 'root',
})
export class LoginService {

  readonly url = 'http://localhost:3000/api/users';
  readonly urlManager = 'http://localhost:4200/manager-home/managers';

  constructor(private http: HttpClient) { }


  user!: User;



  getUser(userData: any): Observable<any> {
    return this.http.post<ResponseOne<User> | ResponseWithError>(`${this.url}/login`, userData);
  }

  addUser(userData: any): Observable<any> {
    return this.http.post<ResponseOne<User> | ResponseWithError>(`${this.url}/register`, userData)
  }

  updateUser() {

  }

  deleteUser() {

  }

  getAllManagers(): Observable<any> {
    return this.http.get<ResponseList<User> | ResponseWithError>(this.url)
  }

  getOneManager(id: number): Observable<any> {
    return this.http.get<ResponseOne<User> | ResponseWithError>(`${this.url}/managers/${id}`)
  }

  //-----------------------------------------------------------------------------


  // Método para actualizar el valor del usuario y pasarle a my-account
  setUser(user: User): void {
    this.user = user;
  }

  getOneUser(): User {
    return this.user;
  }



}
