import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SiteH } from '../../code/models/siteH.model';
import { Observable, map, switchMap } from 'rxjs';
import { Commentaire } from '../../code/models/commentaire.model';

@Injectable({
  providedIn: 'root',
})
export class Site {
  private base = 'http://localhost:3000/sites';

  sitesSignal = signal<SiteH[]>([]);

  constructor(private http: HttpClient) {}

  loadSites(): Observable<SiteH[]> {
    return this.http.get<SiteH[]>(this.base).pipe(
      map(sites => {
        sites.forEach(s => s.comments = s.comments || []);
        this.sitesSignal.set(sites);
        return sites;
      })
    );
  }

  getSites(): Observable<SiteH[]> {
    return this.http.get<SiteH[]>(this.base).pipe(
      map(sites => {
        sites.forEach(s => s.comments = s.comments || []);
        this.sitesSignal.set(sites);
        return sites;
      })
    );
  }

  getSite(id: string): Observable<SiteH> {
    return this.http.get<SiteH>(`${this.base}/${id}`).pipe(
      map(s => {
        s.comments = s.comments || [];
        return s;
      })
    );
  }

  createSite(site: Partial<SiteH>): Observable<SiteH> {
    return this.http.post<SiteH>(this.base, { ...site, comments: site.comments || [] });
  }

  updateSite(site: SiteH): Observable<SiteH> {
    return this.http.put<SiteH>(`${this.base}/${site.id}`, site);
  }

  deleteSite(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  addComment(siteId: string, comment: Commentaire): Observable<SiteH> {
    return this.getSite(siteId).pipe(
      switchMap(site => {
        site.comments = site.comments || [];
        site.comments.push(comment);
        return this.updateSite(site);
      })
    );
  }

  deleteComment(siteId: string, commentId: string): Observable<SiteH> {
    return this.getSite(siteId).pipe(
      switchMap(site => {
        site.comments = (site.comments || []).filter(x => x.id !== commentId);
        return this.updateSite(site);
      })
    );
  }

  searchSites(q: string): Observable<SiteH[]> {
    if (!q || q.trim().length === 0) {
      return this.getSites();
    }
    const term = q.trim();
    return this.http.get<SiteH[]>(`${this.base}?q=${encodeURIComponent(term)}`).pipe(
      map(sites => sites.map(s => ({ ...s, comments: s.comments || [] })))
    );
  }
}
