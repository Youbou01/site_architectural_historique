import { Component, OnInit } from '@angular/core';
import { Stats, StatsSummary } from '../../../../core/services/stats';
import { Site } from '../../../../core/services/site';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [DecimalPipe],
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  stats: StatsSummary | null = null;
  isLoading = true;

  constructor(private statsService: Stats, private siteService: Site) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.statsService.getSummary().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading stats', err);
        this.isLoading = false;
      }
    });
  }
}
