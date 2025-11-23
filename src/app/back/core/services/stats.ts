import { Injectable } from '@angular/core';
import { PatrimoineService } from '../../../services/patrimoine.service';
import { Observable, map } from 'rxjs';
import { SiteHistorique } from '../../../models/site-historique';

export interface StatsSummary {
  totalSites: number;
  totalComments: number;
  avgRating: number | null;
  topSitesByComments: { site: SiteHistorique; comments: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class Stats {
  constructor(private patrimoineService: PatrimoineService) {}

  getSummary(): Observable<StatsSummary> {
    this.patrimoineService.loadAll();
    const sites = this.patrimoineService.patrimoines();

    return new Observable(observer => {
      const summary = this.calculateStats(sites);
      observer.next(summary);
      observer.complete();
    });
  }

  private calculateStats(sites: SiteHistorique[]): StatsSummary {
    const totalSites = sites.length;
    let totalComments = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    sites.forEach((site: SiteHistorique) => {
      const approved = (site.comments || []).filter(c => c.etat === 'approuvé');
      totalComments += approved.length;
      approved.forEach(c => {
        if (typeof c.note === 'number') {
          ratingSum += c.note;
          ratingCount++;
        }
      });
    });

    const avgRating = ratingCount > 0 ? +(ratingSum / ratingCount).toFixed(2) : null;

    const topSitesByComments = sites
      .map((s: SiteHistorique) => ({
        site: s,
        comments: (s.comments || []).filter(c => c.etat === 'approuvé').length
      }))
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 5);

    return {
      totalSites,
      totalComments,
      avgRating,
      topSitesByComments
    } as StatsSummary;
  }
}
