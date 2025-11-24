import { Component, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatrimoineService } from '../../../../services/patrimoine.service';
import { SiteHistorique } from '../../../../models/site-historique';
import { Commentaire, EtatCommentaire } from '../../../../models/commentaire';

interface CommentWithSite {
  comment: Commentaire;
  siteId: string;
  siteName: string;
}

@Component({
  selector: 'app-comments-moderation',
  templateUrl: './comments-moderation.html',
  imports: [DatePipe, CommonModule, FormsModule],
  styleUrls: ['./comments-moderation.css'],
})
export class CommentsModerationComponent implements OnInit {
  allComments: CommentWithSite[] = [];
  sites: SiteHistorique[] = [];
  selectedSiteId: string = '';
  selectedStatus: string = '';

  constructor(private patrimoineService: PatrimoineService) {}

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    // Trigger load if cache is empty
    this.patrimoineService.loadAll();

    // Use signal directly - it will update when data loads
    const sites = this.patrimoineService.patrimoines();

    if (sites.length > 0) {
      // Data already loaded (from cache)
      this.sites = sites;
      this.collectComments();
    } else {
      // Wait for data to load
      const checkData = setInterval(() => {
        const currentSites = this.patrimoineService.patrimoines();
        if (currentSites.length > 0) {
          clearInterval(checkData);
          this.sites = currentSites;
          this.collectComments();
        }
      }, 100);

      // Timeout fallback after 5 seconds
      setTimeout(() => {
        clearInterval(checkData);
        const currentSites = this.patrimoineService.patrimoines();
        this.sites = currentSites;
        this.collectComments();
      }, 5000);
    }
  }

  // FIXED: Dedicated method to collect comments
  private collectComments() {
    this.allComments = [];

    this.sites.forEach((site: SiteHistorique) => {
      // Commentaires du site principal
      (site.comments || []).forEach((comment: Commentaire) => {
        this.allComments.push({
          comment,
          siteId: site.id,
          siteName: site.nom,
        });
      });

      // FIXED: Properly collect monument comments using SITE ID for proper grouping
      (site.monuments || []).forEach((monument: SiteHistorique) => {
        (monument.comments || []).forEach((comment: Commentaire) => {
          this.allComments.push({
            comment,
            // FIXED: Use parent site ID for proper filtering in dropdown
            siteId: site.id,
            siteName: `${site.nom} - ${monument.nom}`,
          });
        });
      });
    });
  }

  filteredComments(): CommentWithSite[] {
    return this.allComments.filter((item) => {
      const matchSite = !this.selectedSiteId || item.siteId === this.selectedSiteId;

      // Handle status matching - support both "en attente" and "pending"
      let matchStatus = !this.selectedStatus;
      if (this.selectedStatus) {
        if (this.selectedStatus === 'en attente') {
          // Match both "en attente" and "pending"
          matchStatus = item.comment.etat === 'en attente' || item.comment.etat === 'pending';
        } else {
          // Direct match for other statuses
          matchStatus = item.comment.etat === this.selectedStatus;
        }
      }

      return matchSite && matchStatus;
    });
  }

  getTotalComments(): number {
    return this.allComments.length;
  }

  getApprovedCount(): number {
    return this.allComments.filter((c) => c.comment.etat === 'approuvé').length;
  }

  getRejectedCount(): number {
    return this.allComments.filter((c) => c.comment.etat === 'rejeté').length;
  }

  getPendingCount(): number {
    return this.allComments.filter(
      (c) => c.comment.etat === 'en attente' || c.comment.etat === 'en attente'
    ).length;
  }

  getCommentsCountForSite(siteId: string): number {
    return this.allComments.filter((c) => c.siteId === siteId).length;
  }

  approve(item: CommentWithSite) {
    item.comment.etat = 'approuvé';
    this.updateCommentInDb(item);
  }

  reject(item: CommentWithSite) {
    item.comment.etat = 'rejeté';
    this.updateCommentInDb(item);
  }

  delete(item: CommentWithSite) {
    if (!confirm('Supprimer ce commentaire ?')) return;

    const site = this.sites.find((s) => s.id === item.siteId);
    if (!site) {
      console.error('Site not found');
      return;
    }

    // Remove from site comments
    const siteCommentIndex = site.comments.findIndex((c) => c.id === item.comment.id);
    if (siteCommentIndex !== -1) {
      site.comments.splice(siteCommentIndex, 1);
      this.updateSiteInDb(site);
      return;
    }

    // Remove from monument comments
    for (const monument of site.monuments || []) {
      const monumentCommentIndex = monument.comments.findIndex((c) => c.id === item.comment.id);
      if (monumentCommentIndex !== -1) {
        monument.comments.splice(monumentCommentIndex, 1);
        this.updateSiteInDb(site);
        return;
      }
    }
  }

  private updateCommentInDb(item: CommentWithSite) {
    const site = this.sites.find((s) => s.id === item.siteId);
    if (!site) {
      console.error('Site not found');
      return;
    }

    // Update in site comments
    const siteComment = site.comments.find((c) => c.id === item.comment.id);
    if (siteComment) {
      siteComment.etat = item.comment.etat;
      this.updateSiteInDb(site);
      return;
    }

    // Update in monument comments
    for (const monument of site.monuments || []) {
      const monumentComment = monument.comments.find((c) => c.id === item.comment.id);
      if (monumentComment) {
        monumentComment.etat = item.comment.etat;
        this.updateSiteInDb(site);
        return;
      }
    }
  }

  private updateSiteInDb(site: SiteHistorique) {
    this.patrimoineService.updatePatrimoine(site.id, site).subscribe({
      next: () => {
        // Reload to reflect changes
        this.loadComments();
      },
      error: (err) => {
        console.error('Error updating site:', err);
        alert('Erreur lors de la mise à jour du commentaire');
        this.loadComments();
      },
    });
  }

  getStatusBadge(etat: EtatCommentaire | 'en attente'): string {
    switch (etat) {
      case 'approuvé':
        return 'Approved';
      case 'rejeté':
        return 'Rejected';
      case 'en attente':
      case 'en attente':
        return 'en attente';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(etat: EtatCommentaire | 'en attente'): string {
    switch (etat) {
      case 'approuvé':
        return 'badge-success';
      case 'rejeté':
        return 'badge-danger';
      case 'en attente':
      case 'en attente':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }
}
