import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  contact: string = '';

  isRightPanelActive = false;

  showSignUp() {
    this.isRightPanelActive = true;
  }

  showSignIn() {
    this.isRightPanelActive = false;
  }

  constructor(private http: HttpClient, private router: Router) {}

  handleClickLogin(): void {
    console.log('Login button clicked');
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    const payload = {
      username: this.email,   // ❗ uses 'username' as key to match backend
      password: this.password
    };
    
  this.http.post<any>('http://localhost:8080/api/v1/auth/login', payload, { observe: 'response' })
    .subscribe({
      next: (response) => {
        if (response.status === 200) {
          const token = response.body?.data?.['access-token'];
          const name = response.body?.data?.['name'];
          if (token) {
            localStorage.setItem('access-token', token);
            localStorage.setItem('name', name);
            console.log('✅ Token saved to localStorage');
            this.router.navigate(['/dashboard']);
          } else {
            alert('Login failed: Token not found in response.');
          }
        } else {
          alert('Login failed. Please try again.');
        }
      },
      error: (err) => {
        const statusCode = err?.status;
        const errorMessage = err?.error?.message || 'Login failed. Please try again.';

        // Optional: log error details
        console.error(`❌ Login failed : ${errorMessage}`);

        alert(errorMessage);
      }
    });


  }

  handleClickSignUp() {
    console.log('Sign Up button clicked');
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    const payload = {
      username: this.email,   // ❗ uses 'username' as key to match backend
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      contact: this.contact,
    };
    

    this.http.post<any>('http://localhost:8080/api/v1/auth/register', payload, { observe: 'response' } // 🔍 allows us to check status code
    )
    .subscribe({
      next: (response) => {
        if (response.status === 201) {
          console.log('✅ Signup Success');
          alert(response.body?.message || 'Signup successful');
          this.router.navigate(['/login']);
        } else {
          // Unlikely, but in case non-201 comes here
          alert('Unexpected response. Please try again.');
        }
      },
      error: (err) => {
        console.error('❌ Signup failed', err);

        const statusCode = err?.status;
        const errorMessage = err?.error?.message || 'Signup failed. Please try again.';

        alert(errorMessage); // 💬 Show backend error message
      }
    });

  }

}
