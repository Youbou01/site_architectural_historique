import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '../../code/services/auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.auth.getUser();
    const isAdmin = this.auth.isAdmin();

    if (user && isAdmin) {
      return true;
    }

    return this.router.createUrlTree(['/login']);
  }
}
