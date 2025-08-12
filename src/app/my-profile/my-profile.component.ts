// my-profile.component.ts
import { Component, effect } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent {
  userId = '';
  username = '';
  firstName = '';
  lastName = '';
  contact = '';
  isEditing = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {
    // Watch signal changes and update local vars
    effect(() => {
      const profile = this.userService.userProfile();
      if (profile) {
        this.userId = profile.userId;
        this.username = profile.username;
        this.firstName = profile.firstName;
        this.lastName = profile.lastName;
        this.contact = profile.contact;
      }
    });
  }

  ngOnInit(): void {
    if (!this.userService.userProfile()) {
      this.userService.loadFromStorage();
    }
  }

  handleClickEdit(): void {
    this.isEditing = true;
  }

  handleClickSave(): void {
    this.isEditing = false;

    const payload = {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      contact: this.contact,
    };

    const token = localStorage.getItem('access-token');
    if (!token) {
      alert('Token not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.put<any>('http://localhost:8080/api/v1/user/profile', payload, { headers, observe: 'response' })
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            console.log('✅ Update Success');
            this.userService.setUserProfile({
              userId: this.userId,
              username: this.username,
              firstName: this.firstName,
              lastName: this.lastName,
              contact: this.contact
            });
            alert(response.body?.message || 'Update successful');
          } else {
            alert('Unexpected response. Please try again.');
          }
        },
        error: (err) => {
          console.error('❌ Update failed', err);
          alert(err?.error?.message || 'Update failed. Please try again.');
        }
      });
  }

  handleClickCancel(): void {
    console.log('✅ Back Success');
    this.router.navigate(['/dashboard']);
  }
}
