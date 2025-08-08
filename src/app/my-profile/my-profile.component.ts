import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent {

  userId: string = '';
  username: string = '';
  firstName: string = '';
  lastName: string = '';
  contact: string = '';
  isEditing: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.username = localStorage.getItem('username') || '';
    this.firstName = localStorage.getItem('firstName') || '';
    this.lastName = localStorage.getItem('lastName') || '';
    this.contact = localStorage.getItem('contact') || '';
  }

  handleClickEdit(): void {
    this.isEditing = true;
  }

  handleClickSave(): void {
    this.isEditing = false;

     const payload = {
      username: this.username,   // ❗ uses 'username' as key to match backend
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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    this.http.put<any>('http://localhost:8080/api/v1/user/profile', payload,
    {
      headers: headers, // Pass your HttpHeaders object here
      observe: 'response' // To get full HttpResponse
    })
    .subscribe({
      next: (response) => {
        if (response.status === 200) {
          console.log('✅ Update Success');
          localStorage.setItem('username', this.username);
          localStorage.setItem('firstName', this.firstName);
          localStorage.setItem('lastName', this.lastName);
          localStorage.setItem('contact', this.contact);
          alert(response.body?.message || 'Update successful');
          // this.router.navigate(['/my-profile']);
        } else {
          // Unlikely, but in case non-201 comes here
          alert('Unexpected response. Please try again.');
        }
      },
      error: (err) => {
        console.error('❌ Update failed', err);

        const statusCode = err?.status;
        const errorMessage = err?.error?.message || 'Update failed. Please try again.';

        alert(errorMessage); // 💬 Show backend error message
      }
    });
  }

  handleClickCancel(): void {
    console.log('✅ Back Success');
    this.router.navigate(['/dashboard']);
  }
}
