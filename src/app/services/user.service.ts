import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  contact: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  // Signal holding the current profile
  userProfile = signal<UserProfile | null>(null);

  setUserProfile(profile: UserProfile) {
    this.userProfile.set(profile);
    // Optional: also persist to localStorage for reloads
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }

  loadFromStorage() {
    const stored = localStorage.getItem('userProfile');
    if (stored) {
      this.userProfile.set(JSON.parse(stored));
    }
  }

  clearProfile() {
    this.userProfile.set(null);
    localStorage.removeItem('userProfile');
  }
}
