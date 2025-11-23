import { Injectable } from '@angular/core';
import { Site } from './site';
import { Observable, map } from 'rxjs';
import { SiteH } from '../../code/models/siteH.model';

export interface StatsSummary {
  totalSites: number;
  totalComments: number;
  avgRating: number | null;
  topSitesByComments: { site: SiteH; comments: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class Stats {
  constructor(private siteService: Site) {}

  getSummary(): Observable<StatsSummary> {
    return this.siteService.getSites().pipe(
      map(sites => {
        const totalSites = sites.length;
        let totalComments = 0;
        let ratingSum = 0;
        let ratingCount = 0;

        sites.forEach(site => {
          const approved = (site.comments || []).filter(c => c.approved !== false);
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
          .map(s => ({ site: s, comments: (s.comments || []).filter(c => c.approved !== false).length }))
          .sort((a, b) => b.comments - a.comments)
          .slice(0, 5);

        return {
          totalSites,
          totalComments,
          avgRating,
          topSitesByComments
        } as StatsSummary;
      })
    );
  }
}
