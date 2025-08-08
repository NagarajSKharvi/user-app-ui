import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userName: string = 'User';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const name = localStorage.getItem('name');
    if (name) {
      this.userName = name;
    }

    const token = localStorage.getItem('access-token');
    if (!token) {
      alert('Token not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    // Prevent back navigation to login
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
  }

  handleClickLogout(): void {
    console.log('Logout button clicked');
    localStorage.clear();
    // localStorage.removeItem('access-token');
    // Navigate to login
    this.router.navigate(['/login']).then(() => {
      // Disable back navigation
      history.pushState(null, '', location.href);
      window.onpopstate = () => {
        history.pushState(null, '', location.href);
      };
    });
  }

  handleClickProfile() {
    console.log('Profile button clicked');

    const token = localStorage.getItem('access-token');
    if (!token) {
      alert('Token not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>('http://localhost:8080/api/v1/user/profile', { headers })
    .subscribe({
      next: (response) => {
        if (response?.code === 200 && response?.data) {
          const { userId, username, firstName, lastName, contact } = response.data;

          // ✅ Save profile details to localStorage
          localStorage.setItem('userId', userId.toString());
          localStorage.setItem('username', username);
          localStorage.setItem('firstName', firstName);
          localStorage.setItem('lastName', lastName);
          localStorage.setItem('contact', contact);

          console.log('✅ User profile loaded successfully');

          // ✅ Navigate ONLY after data is saved
          this.router.navigate(['/my-profile']);
        } else {
          alert('Failed to fetch profile data. Please try again.');
        }
      },
      error: (err) => {
        console.error('❌ Failed to fetch profile:', err);
        const errorMessage = err?.error?.message || 'Unable to load profile.';
        alert(errorMessage);
        this.router.navigate(['/dashboard']);
      }
    });
    
    // Navigate to my-profile
    this.router.navigate(['/my-profile']);
  }
}
