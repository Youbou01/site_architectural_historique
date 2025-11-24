import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SiteHistorique } from '../../../models/site-historique';
import { Observable, map, switchMap } from 'rxjs';
import { Commentaire } from '../../../models/commentaire';

@Injectable({
  providedIn: 'root',
})
export class Site {
  private base = 'http://localhost:3000/patrimoines';

  sitesSignal = signal<SiteHistorique[]>([]);

  constructor(private http: HttpClient) {}

  loadSites(): Observable<SiteHistorique[]> {
    return this.http.get<SiteHistorique[]>(this.base).pipe(
      map((sites) => {
        sites.forEach((s) => (s.comments = s.comments || []));
        this.sitesSignal.set(sites);
        return sites;
      })
    );
  }

  getSites(): Observable<SiteHistorique[]> {
    return this.http.get<SiteHistorique[]>(this.base).pipe(
      map((sites) => {
        sites.forEach((s) => (s.comments = s.comments || []));
        this.sitesSignal.set(sites);
        return sites;
      })
    );
  }

  getSite(id: string): Observable<SiteHistorique> {
    return this.http.get<SiteHistorique>(`${this.base}/${id}`).pipe(
      map((s) => {
        s.comments = s.comments || [];
        return s;
      })
    );
  }

  createSite(site: Partial<SiteHistorique>): Observable<SiteHistorique> {
    return this.http.post<SiteHistorique>(this.base, { ...site, comments: site.comments || [] });
  }

  updateSite(site: SiteHistorique): Observable<SiteHistorique> {
    return this.http.put<SiteHistorique>(`${this.base}/${site.id}`, site);
  }

  deleteSite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addComment(siteId: string, comment: Commentaire): Observable<SiteHistorique> {
    return this.getSite(siteId).pipe(
      switchMap((site) => {
        site.comments = site.comments || [];
        site.comments.push(comment);
        return this.updateSite(site);
      })
    );
  }

  deleteComment(siteId: string, commentId: string): Observable<SiteHistorique> {
    return this.getSite(siteId).pipe(
      switchMap((site) => {
        site.comments = (site.comments || []).filter((x: Commentaire) => x.id !== commentId);
        return this.updateSite(site);
      })
    );
  }

  searchSites(q: string): Observable<SiteHistorique[]> {
    if (!q || q.trim().length === 0) {
      return this.getSites();
    }
    const term = q.trim();
    return this.http
      .get<SiteHistorique[]>(`${this.base}?q=${encodeURIComponent(term)}`)
      .pipe(map((sites) => sites.map((s) => ({ ...s, comments: s.comments || [] }))));
  }
}

