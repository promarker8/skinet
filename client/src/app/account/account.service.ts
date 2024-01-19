import { Injectable } from '@angular/core';
import { ReplaySubject, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../shared/models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

// when a user logs in, they will be stored inside the account service
export class AccountService {

  baseUrl = environment.apiUrl;

  // using an observable so that other components can subscribe to these changes
  private currentUserSource = new ReplaySubject<User | null>(1);
  currentUser$ = this.currentUserSource.asObservable();


  constructor(private http: HttpClient, private router: Router) { }

  loadCurrentUser(token: string | null) {

    if (token === null) {
      this.currentUserSource.next(null);
      // need to return an observable either way, so an obserable of null
      return of(null);
    }

    // need to send the token up to the API server, so we get the current user details back and authenticate
    let headers = new HttpHeaders();
    // need to use back ticks in here, so we can user javascript to concatinate the bearer & token
    headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.get<User>(this.baseUrl + 'account', { headers }).pipe(
      map(user => {
        if (user) {
          localStorage.setItem('token', user.token);
          this.currentUserSource.next(user);
          return user;
        } else {
          return null;
        }
      })
    )
  }

  login(values: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', values).pipe(
      map(user => {
        // want the token to persist, even if they close the browser -> key/value token
        localStorage.setItem('token', user.token);
        // store the user inside the observable
        this.currentUserSource.next(user);
      })
    )
  }

  // going to consider a user logged in, after they register
  register(values: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', values).pipe(
      map(user => {
        localStorage.setItem('token', user.token);
        this.currentUserSource.next(user);
      })
    )
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSource.next(null);
    this.router.navigateByUrl('/');
  }

  checkEmailExists(email: string) {
    return this.http.get<boolean>(this.baseUrl + 'account/emailExists?email=' + email);
  }
}
