import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // have to use the pipe operator, in order to do something with an observale before we can pass it back to a component
    return next.handle(request).pipe(
      // want to catch the error coming back from the API (use rxjs stuff)
      catchError((error: HttpErrorResponse) => {
        if (error) {
          if (error.status === 400) {
            // validation error
            // errorS is an array that includes the error message, so we have to get all the way into that
            if (error.error.errors) {
              throw error.error;
            } else {
              this.toastr.error(error.error.message, error.status.toString())
            }
          }
          if (error.status === 401) {
            this.toastr.error(error.error.message, error.status.toString())
          }
          if (error.status === 404) {
            this.router.navigateByUrl('/not-found');
          };
          if (error.status === 500) {
            // want to pass the stuff that comes up in the console to the server error page for the user
            // eg stack trace, message, error code
            const navigationExtras: NavigationExtras = { state: { error: error.error } }
            // now will have access to all of that inside our server error component
            this.router.navigateByUrl('/server-error', navigationExtras);
          }
        }
        return throwError(() => new Error(error.message))
      })
    )
  }
}
