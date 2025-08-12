// dashboard.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  userName: string = 'User';
  private refreshCheckInterval: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.loadFromStorage();
    const profile = this.userService.userProfile();
    if (profile) {
      this.userName = profile.firstName || profile.username;
    }

    const token = localStorage.getItem('access-token');
    if (!token) {
      alert('Token not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    // 🔹 Check token immediately
    this.checkTokenAndHandle(token);

    // 🔹 Keep checking every 30 seconds
    this.refreshCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem('access-token');
      if (currentToken) {
        this.checkTokenAndHandle(currentToken);
      }
    }, 30000);

    // Prevent back navigation to login
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    };
  }

  private checkTokenAndHandle(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // ms
      const now = Date.now();
      const timeLeft = exp - now;

      if (timeLeft <= 0) {
        console.warn('⚠️ Token expired. Logging out...');
        this.handleClickLogout();
      } else if (timeLeft <= 60000) {
        console.log('⏳ Token will expire in 1 min, refreshing...');
        this.refreshToken();
      }
    } catch (e) {
      console.error('❌ Invalid token format', e);
      this.handleClickLogout();
    }
  }

  /**
   * Call backend to refresh token
   */
  private refreshToken() {
    const refreshToken = localStorage.getItem('refresh-token');
    if (!refreshToken) {
      console.warn('No refresh token found, logging out...');
      this.handleClickLogout();
      return;
    }

    this.http.post<any>('http://localhost:8080/api/v1/auth/refresh', { refreshToken })
      .subscribe({
        next: (res) => {
          if (res?.accessToken) {
            console.log('✅ Token refreshed successfully');
            localStorage.setItem('access-token', res.accessToken);
          } else {
            console.warn('❌ Refresh failed, logging out...');
            this.handleClickLogout();
          }
        },
        error: (err) => {
          console.error('❌ Refresh request failed', err);
          this.handleClickLogout();
        }
      });
  }

  handleClickLogout(): void {
    console.log('Logout button clicked');
    localStorage.clear();
    this.userService.clearProfile();
    this.router.navigate(['/login']);
  }

  handleClickProfile() {
    const token = localStorage.getItem('access-token');
    if (!token) {
      alert('Token not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get<any>('http://localhost:8080/api/v1/user/profile', { headers })
      .subscribe({
        next: (response) => {
          if (response?.code === 200 && response?.data) {
            const { userId, username, firstName, lastName, contact } = response.data;
            // ✅ Update signal (reactive) instead of only localStorage
            this.userService.setUserProfile({ userId, username, firstName, lastName, contact });
            console.log('✅ User profile loaded successfully');
            this.router.navigate(['/my-profile']);
          } else {
            alert('Failed to fetch profile data. Please try again.');
          }
        },
        error: (err) => {
          console.error('❌ Failed to fetch profile:', err);
          alert(err?.error?.message || 'Unable to load profile.');
          this.router.navigate(['/dashboard']);
        }
      });
  }
}
