import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Auth } from '../../../services/auth';

/**
 * Composant de navigation principal de l'application.
 *
 * Responsabilités:
 * - Affichage de la barre de navigation avec liens vers les différentes sections
 * - Gestion du thème clair/sombre avec persistance dans le DOM
 * - Indication de la route active pour feedback visuel utilisateur
 * - Gestion de l'état d'authentification et affichage conditionnel des liens admin
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  // Signal: thème actuel (dark ou light)
  theme = signal<'dark' | 'light'>('dark');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private auth = inject(Auth);
  router = inject(Router);

  /**
   * Bascule entre le thème clair et sombre.
   * Met à jour l'attribut data-theme du document HTML pour appliquer les styles correspondants.
   * Compatible SSR: ne modifie le DOM que côté navigateur.
   */
  toggleTheme() {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    if (isPlatformBrowser(this.platformId)) {
      (this.doc.documentElement as HTMLElement).dataset['theme'] = next;
    }
  }

  /**
   * Vérifie si une route est actuellement active.
   * Utilisé pour appliquer des styles de navigation active.
   *
   * @param path - Chemin de la route à vérifier
   * @returns true si l'URL courante commence par ce chemin
   */
  isActive(path: string) {
    return this.router.url.startsWith(path);
  }

  /**
   * Vérifie si l'utilisateur est authentifié.
   * @returns true si un utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  /**
   * Déconnecte l'utilisateur et redirige vers la page de login.
   */
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
