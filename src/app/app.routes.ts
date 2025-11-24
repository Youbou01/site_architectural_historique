import { Routes } from '@angular/router';
import { PatrimoineListComponent } from './front/components/patrimoine-list/patrimoine-list.component';
import { PatrimoineDetailComponent } from './front/components/patrimoine-detail/patrimoine-detail.component';
import { MonumentDetailComponent } from './front/components/monument-detail/monument-detail.component';
import { MonumentListComponent } from './front/components/monument-list/monument-list.component';
import { FavoritesComponent } from './front/components/favorites/favorites.component';

// Import des composants admin
import { LoginComponent } from './back/admin/pages/login/login';
import { DashboardComponent } from './back/admin/pages/dashboard/dashboard';
import { SiteCrudComponent } from './back/admin/pages/site-crud/site-crud';
import { SiteEditComponent } from './back/admin/pages/site-edit/site-edit';
import { CommentsModerationComponent } from './back/admin/pages/comments-moderation/comments-moderation';
import { ChangePasswordComponent } from './back/admin/pages/change-password/change-password';
import { AdminLayout } from './back/admin/admin-layout/admin-layout';
import { AuthGuard } from './back/core/guards/auth-guard';
import { AdminGuard } from './back/core/guards/admin-guard';

export const routes: Routes = [
  // Routes publiques (frontend)
  { path: '', redirectTo: 'patrimoines', pathMatch: 'full' },
  { path: 'patrimoines', component: PatrimoineListComponent },
  { path: 'monuments', component: MonumentListComponent },
  { path: 'patrimoines/:patrimoineId', component: PatrimoineDetailComponent },
  { path: 'patrimoines/:patrimoineId/monuments/:monumentId', component: MonumentDetailComponent },
  { path: 'favoris', component: FavoritesComponent },

  // Routes admin (backend)
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'site-crud', component: SiteCrudComponent },
      { path: 'site-edit', component: SiteEditComponent },
      { path: 'site-edit/:id', component: SiteEditComponent },
      { path: 'comments-moderation', component: CommentsModerationComponent },
      { path: 'change-password', component: ChangePasswordComponent },
    ],
  },

  // Wildcard redirect
  { path: '**', redirectTo: 'patrimoines' },
];
