import { makeAutoObservable } from 'mobx';

class UserStore {
  // Login status
  isLoggedIn = false;
  token = null;

  // User information
  userId = null;
  userName = null;
  email = null;
  role = null; // Admin = 1, Marker = 2

  // Selected marker list
  selectedMarkerIds = [];

  get MarkerList() {
    return this.selectedMarkerIds.slice();
  }

  constructor() {
    makeAutoObservable(this);
    // Restore login status from localStorage
    this.loadFromStorage();
  }

  // Login
  login(token, userData) {
    this.token = token;
    this.userId = userData.userId;
    this.userName = userData.username;
    this.email = userData.email;
    this.role = userData.role;
    this.isLoggedIn = true;

    // Save to localStorage
    this.saveToStorage();
  }

  // Logout
  logout() {
    this.token = null;
    this.userId = null;
    this.userName = null;
    this.email = null;
    this.role = null;
    this.isLoggedIn = false;
    this.selectedMarkerIds = [];

    // Clear localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  }

  // Save to localStorage
  saveToStorage() {
    if (this.token) {
      localStorage.setItem('userToken', this.token);
      localStorage.setItem(
        'userData',
        JSON.stringify({
          userId: this.userId,
          username: this.userName,
          email: this.email,
          role: this.role,
        })
      );
    }
  }

  // Load from localStorage
  loadFromStorage() {
    const token = localStorage.getItem('userToken');
    const userDataStr = localStorage.getItem('userData');

    console.log('UserStore - Loading from localStorage:', {
      token,
      userDataStr,
    });

    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        this.token = token;
        this.userId = userData.userId;
        this.userName = userData.username;
        this.email = userData.email;
        this.role = userData.role;
        this.isLoggedIn = true;
        console.log('UserStore - Loaded user data:', userData);
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        this.logout();
      }
    } else {
      console.log('UserStore - No stored data found, user not logged in');
    }
  }

  setSelected(ids) {
    this.selectedMarkerIds = ids;
  }

  clearSelected() {
    this.selectedMarkerIds = [];
  }
}

export default new UserStore();
