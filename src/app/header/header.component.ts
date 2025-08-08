import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  handleClickLogout(): void {
    console.log('Logout button clicked');
    localStorage.removeItem('access-token');
  }
}
