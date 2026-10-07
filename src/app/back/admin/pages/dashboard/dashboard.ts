import { Component, OnInit, signal, inject } from '@angular/core';
import { PatrimoineService } from '../../../../services/patrimoine.service';
import { SiteHistorique } from '../../../../models/site-historique';
import { DecimalPipe } from '@angular/common';

interface StatsSummary {
  totalSites: number;
  totalMonuments: number;
  totalComments: number;
  avgRating: number | null;
  topSitesByComments: { site: SiteHistorique; comments: number }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [DecimalPipe],
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  stats = signal<StatsSummary | null>(null);
  isLoading = signal(true);

  private readonly patrimoineService = inject(PatrimoineService);

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading.set(true);

    this.patrimoineService.loadAll().subscribe({
      next: (sites) => {
        this.stats.set(this.calculateStats(sites));
        this.isLoading.set(false);
      },
      error: () => {
        this.stats.set(null);
        this.isLoading.set(false);
      },
    });
  }

  private calculateStats(sites: SiteHistorique[]): StatsSummary {
    const totalSites = sites.length;
    let totalMonuments = 0;
    let totalComments = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    sites.forEach((site) => {
      const siteComments = site.comments ?? [];
      totalComments += siteComments.length;
      totalMonuments += (site.monuments ?? []).length;

      siteComments.forEach((comment) => {
        if (comment.etat === 'approuvé' && typeof comment.note === 'number') {
          ratingSum += comment.note;
          ratingCount++;
        }
      });

      (site.monuments ?? []).forEach((monument) => {
        const monumentComments = monument.comments ?? [];
        totalComments += monumentComments.length;

        monumentComments.forEach((comment) => {
          if (comment.etat === 'approuvé' && typeof comment.note === 'number') {
            ratingSum += comment.note;
            ratingCount++;
          }
        });
      });
    });

    const avgRating = ratingCount > 0 ? +(ratingSum / ratingCount).toFixed(2) : null;

    const topSitesByComments = sites
      .map((site) => {
        const siteCommentsCount = (site.comments ?? []).length;
        const monumentCommentsCount = (site.monuments ?? []).reduce(
          (sum, monument) => sum + (monument.comments ?? []).length,
          0
        );
        return {
          site,
          comments: siteCommentsCount + monumentCommentsCount,
        };
      })
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 5);

    return {
      totalSites,
      totalMonuments,
      totalComments,
      avgRating,
      topSitesByComments,
    };
  }
}
