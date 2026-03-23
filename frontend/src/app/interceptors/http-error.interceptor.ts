import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      retry({ count: 1, delay: 1000 }),

      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Nieznany błąd';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Błąd: ${error.error.message}`;
        } else {
          errorMessage = `Serwer zwrócił kod ${error.status}`;
          if (error.error?.message) {
            errorMessage += `: ${error.error.message}`;
          }

          if (error.status === 404) {
            errorMessage = 'Sesja nie znaleziona';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Nieprawidłowe dane';
          } else if (error.status === 500) {
            errorMessage = 'Błąd serwera. Spróbuj ponownie.';
          }
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: request.url,
          error: error.error,
        });

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          error: error.error,
        }));
      })
    );
  }
}
