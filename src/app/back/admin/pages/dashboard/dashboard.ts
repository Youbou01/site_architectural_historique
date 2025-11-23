import { Component, OnInit } from '@angular/core';
import { PatrimoineService } from '../../../../services/patrimoine.service';
import { SiteHistorique } from '../../../../models/site-historique';
import { DecimalPipe } from '@angular/common';

interface StatsSummary {
  totalSites: number;
  totalComments: number;
  avgRating: number | null;
  topSitesByComments: { site: SiteHistorique; comments: number }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [DecimalPipe],
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  stats: StatsSummary | null = null;
  isLoading = true;

  constructor(private patrimoineService: PatrimoineService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.patrimoineService.loadAll();

    setTimeout(() => {
      const sites = this.patrimoineService.patrimoines();
      this.stats = this.calculateStats(sites);
      this.isLoading = false;
    }, 500);
  }

  private calculateStats(sites: SiteHistorique[]): StatsSummary {
    const totalSites = sites.length;
    let totalComments = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    sites.forEach((site: SiteHistorique) => {
      const comments = site.comments || [];
      totalComments += comments.length;

      comments.forEach(c => {
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
        comments: (s.comments || []).length
      }))
      .sort((a, b) => b.comments - a.comments)
      .slice(0, 5);

    return {
      totalSites,
      totalComments,
      avgRating,
      topSitesByComments
    };
  }
}
