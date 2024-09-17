import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { LoginService } from '../login/login.service';

interface User {
  id: number,
  dni: string,
  name: string,
  surname: string,
  email: string,
  password: string,
  type: string,
  cinema: string | null
}

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})
export class MyAccountComponent  {

  constructor(private service: LoginService) {}

  user: User = this.service.getOneUser();

  nameUser = this.user.name;


  // -------------------------------------------------

  /*
  ngOnInit(): void {
    // Te suscribes al observable para recibir los datos del usuario.
    this.service.currentUser.subscribe(user => {
      this.user = user;
      console.log('Usuario recibido:', this.user);
      this.nameUser = this.user.name;
    });
  }
*/

}
