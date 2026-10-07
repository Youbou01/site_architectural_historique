import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SiteHistorique } from '../models/site-historique';
import { Observable, of, tap, shareReplay, finalize } from 'rxjs';

/**
 * Service métier pour la gestion des patrimoines (sites historiques racines) et de leurs monuments.
 */
@Injectable({ providedIn: 'root' })
export class PatrimoineService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/patrimoines';
  private loadRequest: Observable<SiteHistorique[]> | null = null;

  readonly patrimoines = signal<SiteHistorique[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly currentPatrimoine = signal<SiteHistorique | null>(null);

  /**
   * Charge les patrimoines (avec cache) et déclenche la requête immédiatement.
   *
   * Les Observables HTTP sont "froids" : sans subscribe(), aucune requête n'est envoyée.
   * La requête est donc démarrée ici, puis partagée (shareReplay) afin que les composants
   * qui ignorent la valeur de retour (liste, CRUD...) comme ceux qui font
   * `.subscribe()` (dashboard, modération) obtiennent tous les données.
   */
  loadAll(): Observable<SiteHistorique[]> {
    const cached = this.patrimoines();
    if (cached.length) {
      return of(cached);
    }

    if (this.loadRequest) {
      return this.loadRequest;
    }

    this.loading.set(true);
    this.error.set(null);

    const request$ = this.http.get<SiteHistorique[]>(this.baseUrl).pipe(
      tap({
        next: (data) => this.patrimoines.set(data),
        error: (err) => {
          this.error.set(
            'Impossible de charger les patrimoines. Vérifiez que json-server tourne (npm run api).'
          );
          console.error(err);
        },
      }),
      finalize(() => {
        this.loading.set(false);
        this.loadRequest = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.loadRequest = request$;
    // Démarre la requête maintenant ; l'erreur est déjà gérée dans tap().
    request$.subscribe({ error: () => {} });

    return request$;
  }

  getById(id: string): Observable<SiteHistorique> {
    return this.http.get<SiteHistorique>(`${this.baseUrl}/${id}`);
  }

  addPatrimoine(patrimoineData: Partial<SiteHistorique>): Observable<SiteHistorique> {
    this.loading.set(true);
    return this.http.post<SiteHistorique>(this.baseUrl, patrimoineData).pipe(
      tap({
        next: (newPatrimoine) => {
          this.patrimoines.set([...this.patrimoines(), newPatrimoine]);
          this.error.set(null);
        },
        error: (err) => {
          this.error.set("Impossible d'ajouter le patrimoine");
          console.error(err);
        },
      }),
      finalize(() => this.loading.set(false))
    );
  }

  updatePatrimoine(
    id: string,
    patrimoineData: Partial<SiteHistorique>
  ): Observable<SiteHistorique> {
    this.loading.set(true);
    return this.http.put<SiteHistorique>(`${this.baseUrl}/${id}`, patrimoineData).pipe(
      tap({
        next: (updatedPatrimoine) => {
          const current = this.patrimoines();
          const index = current.findIndex((p) => p.id === id);
          if (index !== -1) {
            const updated = [...current];
            updated[index] = updatedPatrimoine;
            this.patrimoines.set(updated);
          }

          if (this.currentPatrimoine()?.id === id) {
            this.currentPatrimoine.set(updatedPatrimoine);
          }

          this.error.set(null);
        },
        error: (err) => {
          this.error.set('Impossible de mettre à jour le patrimoine');
          console.error(err);
        },
      }),
      finalize(() => this.loading.set(false))
    );
  }

  deletePatrimoine(id: string): Observable<unknown> {
    this.loading.set(true);
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(
      tap({
        next: () => {
          this.patrimoines.set(this.patrimoines().filter((p) => p.id !== id));
          if (this.currentPatrimoine()?.id === id) {
            this.currentPatrimoine.set(null);
          }
          this.error.set(null);
        },
        error: (err) => {
          this.error.set('Impossible de supprimer le patrimoine');
          console.error(err);
        },
      }),
      finalize(() => this.loading.set(false))
    );
  }

  forceReload(): Observable<SiteHistorique[]> {
    this.patrimoines.set([]);
    return this.loadAll();
  }
}