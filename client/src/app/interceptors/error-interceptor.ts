import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message: string;
      if (error.status === 0) {
        message = 'Serveur injoignable';
      } else if (error.status === 429) {
        message = 'Trop de requêtes, veuillez réessayer dans un instant';
      } else {
        message = error.error?.message ?? 'Une erreur est survenue';
      }
      console.error(`[HTTP ${error.status}] ${message}`);
      return throwError(() => error);
    }),
  );
};
