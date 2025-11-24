import { Component, OnInit } from '@angular/core';
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
  stats: StatsSummary | null = null;
  isLoading = true;

  constructor(private patrimoineService: PatrimoineService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;

    // Trigger load if cache is empty
    this.patrimoineService.loadAll();

    // Use signal directly - it will update when data loads
    const sites = this.patrimoineService.patrimoines();

    if (sites.length > 0) {
      // Data already loaded (from cache)
      this.stats = this.calculateStats(sites);
      this.isLoading = false;
    } else {
      // Wait for data to load
      const checkData = setInterval(() => {
        const currentSites = this.patrimoineService.patrimoines();
        if (currentSites.length > 0) {
          clearInterval(checkData);
          this.stats = this.calculateStats(currentSites);
          this.isLoading = false;
        }
      }, 100);

      // Timeout fallback after 5 seconds
      setTimeout(() => {
        clearInterval(checkData);
        if (this.isLoading) {
          const currentSites = this.patrimoineService.patrimoines();
          this.stats = this.calculateStats(currentSites);
          this.isLoading = false;
        }
      }, 5000);
    }
  }

  private calculateStats(sites: SiteHistorique[]): StatsSummary {
    const totalSites = sites.length;
    let totalMonuments = 0;
    let totalComments = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    sites.forEach((site: SiteHistorique) => {
      // FIXED: Count comments from both site AND monuments
      const siteComments = site.comments || [];
      totalComments += siteComments.length;

      // Count monuments
      totalMonuments += (site.monuments || []).length;

      // Add monument comments
      (site.monuments || []).forEach((monument) => {
        const monumentComments = monument.comments || [];
        totalComments += monumentComments.length;

        // Include monument ratings
        monumentComments.forEach((c) => {
          if (typeof c.note === 'number') {
            ratingSum += c.note;
            ratingCount++;
          }
        });
      });

      // Count site ratings
      siteComments.forEach((c) => {
        if (typeof c.note === 'number') {
          ratingSum += c.note;
          ratingCount++;
        }
      });
    });

    const avgRating = ratingCount > 0 ? +(ratingSum / ratingCount).toFixed(2) : null;

    // FIXED: Include monument comments in top sites calculation
    const topSitesByComments = sites
      .map((s: SiteHistorique) => {
        const siteCommentsCount = (s.comments || []).length;
        const monumentCommentsCount = (s.monuments || []).reduce(
          (sum, m) => sum + (m.comments || []).length,
          0
        );
        return {
          site: s,
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
