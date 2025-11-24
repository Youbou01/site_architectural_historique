import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SiteHistorique } from '../models/site-historique';
import { Observable, tap } from 'rxjs';

/**
 * Service métier pour la gestion des patrimoines (sites historiques racines) et de leurs monuments.
 *
 * Responsabilités:
 * - Récupération des données patrimoniales depuis l'API REST
 * - Gestion du cache en mémoire via des signaux Angular
 * - Gestion des états de chargement et d'erreur
 * - Stockage du patrimoine actuellement consulté pour optimiser la navigation
 * - CRUD complet: Create, Read, Update, Delete
 */
@Injectable({ providedIn: 'root' })
export class PatrimoineService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/patrimoines';

  // Signal cache: liste complète des sites racine chargés depuis l'API
  readonly patrimoines = signal<SiteHistorique[]>([]);

  // Signal indiquant si une requête HTTP est en cours
  readonly loading = signal<boolean>(false);

  // Signal contenant le message d'erreur en cas d'échec, null sinon
  readonly error = signal<string | null>(null);

  // Cache du patrimoine actuellement consulté en détail (inclut les monuments complets)
  // Permet d'éviter de recharger les données lors de la navigation vers un monument enfant
  readonly currentPatrimoine = signal<SiteHistorique | null>(null);

  /**
   * Charge tous les patrimoines depuis l'API si le cache est vide.
   * Implémente une stratégie de mémoisation simple pour éviter les requêtes redondantes.
   * Met à jour les signaux loading, error et patrimoines selon le résultat.
   */
  loadAll() {
    // Simple mémoisation: ne recharge pas si des données sont déjà présentes
    if (this.patrimoines().length) return;

    this.loading.set(true);
    this.http.get<SiteHistorique[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.patrimoines.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Impossible de charger les patrimoines');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  /**
   * Récupère un patrimoine spécifique par son ID, incluant tous ses monuments.
   * Retourne un Observable pour permettre aux composants de gérer la souscription.
   *
   * @param id - Identifiant unique du patrimoine à récupérer
   * @returns Observable émettant le patrimoine complet avec ses monuments
   */
  getById(id: string) {
    return this.http.get<SiteHistorique>(`${this.baseUrl}/${id}`);
  }

  /**
   * Ajoute un nouveau patrimoine à la base de données.
   * Met à jour automatiquement le cache local après succès.
   *
   * @param patrimoineData - Données du nouveau patrimoine (sans ID, généré côté serveur)
   * @returns Observable émettant le patrimoine créé avec son ID
   */
  addPatrimoine(patrimoineData: Partial<SiteHistorique>): Observable<SiteHistorique> {
    this.loading.set(true);
    return this.http.post<SiteHistorique>(this.baseUrl, patrimoineData).pipe(
      tap({
        next: (newPatrimoine) => {
          // Ajoute le nouveau patrimoine au cache local
          const current = this.patrimoines();
          this.patrimoines.set([...current, newPatrimoine]);
          this.loading.set(false);
          this.error.set(null);
        },
        error: (err) => {
          this.error.set('Impossible d\'ajouter le patrimoine');
          console.error(err);
          this.loading.set(false);
        }
      })
    );
  }

  /**
   * Met à jour un patrimoine existant.
   * Actualise le cache local pour refléter les modifications.
   *
   * @param id - Identifiant du patrimoine à mettre à jour
   * @param patrimoineData - Données partielles ou complètes à mettre à jour
   * @returns Observable émettant le patrimoine mis à jour
   */
  updatePatrimoine(id: string, patrimoineData: Partial<SiteHistorique>): Observable<SiteHistorique> {
    this.loading.set(true);
    return this.http.put<SiteHistorique>(`${this.baseUrl}/${id}`, patrimoineData).pipe(
      tap({
        next: (updatedPatrimoine) => {
          // Met à jour le patrimoine dans le cache local
          const current = this.patrimoines();
          const index = current.findIndex(p => p.id === id);
          if (index !== -1) {
            const updated = [...current];
            updated[index] = updatedPatrimoine;
            this.patrimoines.set(updated);
          }

          // Met à jour currentPatrimoine si c'est celui en cours de consultation
          if (this.currentPatrimoine()?.id === id) {
            this.currentPatrimoine.set(updatedPatrimoine);
          }

          this.loading.set(false);
          this.error.set(null);
        },
        error: (err) => {
          this.error.set('Impossible de mettre à jour le patrimoine');
          console.error(err);
          this.loading.set(false);
        }
      })
    );
  }

  /**
   * Supprime un patrimoine de la base de données.
   * Retire automatiquement l'élément du cache local après succès.
   *
   * @param id - Identifiant du patrimoine à supprimer
   * @returns Observable émettant void ou le patrimoine supprimé selon l'API
   */
  deletePatrimoine(id: string): Observable<any> {
    this.loading.set(true);
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: () => {
          // Retire le patrimoine du cache local
          const current = this.patrimoines();
          this.patrimoines.set(current.filter(p => p.id !== id));

          // Nettoie currentPatrimoine si c'est celui qui a été supprimé
          if (this.currentPatrimoine()?.id === id) {
            this.currentPatrimoine.set(null);
          }

          this.loading.set(false);
          this.error.set(null);
        },
        error: (err) => {
          this.error.set('Impossible de supprimer le patrimoine');
          console.error(err);
          this.loading.set(false);
        }
      })
    );
  }

  /**
   * Force le rechargement complet des patrimoines depuis l'API.
   * Utile après des opérations de modification pour garantir la synchronisation.
   */
  forceReload() {
    this.patrimoines.set([]);
    this.loadAll();
  }
}
