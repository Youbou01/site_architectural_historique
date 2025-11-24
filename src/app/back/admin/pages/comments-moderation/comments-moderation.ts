import { Component, OnInit } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatrimoineService } from '../../../../services/patrimoine.service';
import { SiteHistorique } from '../../../../models/site-historique';
import { Commentaire, EtatCommentaire } from '../../../../models/commentaire.model';

interface CommentWithSite {
  comment: Commentaire;
  siteId: string;
  siteName: string;
}

@Component({
  selector: 'app-comments-moderation',
  templateUrl: './comments-moderation.html',
  imports: [DatePipe, CommonModule, FormsModule],
  styleUrls: ['./comments-moderation.css']
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
    // FIXED: Force reload and wait for data with interval
    this.patrimoineService.patrimoines.set([]);
    this.patrimoineService.loadAll();

    // FIXED: Check data availability with interval
    const checkData = setInterval(() => {
      const sites = this.patrimoineService.patrimoines();
      if (sites.length > 0) {
        clearInterval(checkData);
        this.sites = sites;
        // FIXED: Separate data loading from comment collection
        this.collectComments();
      }
    }, 100);

    // Timeout fallback after 5 seconds
    setTimeout(() => {
      clearInterval(checkData);
      this.sites = this.patrimoineService.patrimoines();
      this.collectComments();
    }, 5000);
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
          siteName: site.nom
        });
      });

      // FIXED: Properly collect monument comments using SITE ID for proper grouping
      (site.monuments || []).forEach((monument: SiteHistorique) => {
        (monument.comments || []).forEach((comment: Commentaire) => {
          this.allComments.push({
            comment,
            // FIXED: Use parent site ID for proper filtering in dropdown
            siteId: site.id,
            siteName: `${site.nom} - ${monument.nom}`
          });
        });
      });
    });
  }

  filteredComments(): CommentWithSite[] {
    return this.allComments.filter(item => {
      const matchSite = !this.selectedSiteId || item.siteId === this.selectedSiteId;

      let matchStatus = true;
      // FIXED: Proper filtering by status
      if (this.selectedStatus === 'approved') {
        matchStatus = item.comment.etat === 'approuvé';
      } else if (this.selectedStatus === 'rejected') {
        matchStatus = item.comment.etat === 'rejeté';
      } else if (this.selectedStatus === 'pending') {
        matchStatus = item.comment.etat === 'en attente';
      }

      return matchSite && matchStatus;
    });
  }

  getTotalComments(): number {
    return this.allComments.length;
  }

  getApprovedCount(): number {
    return this.allComments.filter(c => c.comment.etat === 'approuvé').length;
  }

  getRejectedCount(): number {
    return this.allComments.filter(c => c.comment.etat === 'rejeté').length;
  }

  getPendingCount(): number {
    return this.allComments.filter(c => c.comment.etat === 'en attente').length;
  }

  getCommentsCountForSite(siteId: string): number {
    return this.allComments.filter(c => c.siteId === siteId).length;
  }

  approve(item: CommentWithSite) {
    item.comment.etat = 'approuvé';
    this.updateComment(item);
  }

  reject(item: CommentWithSite) {
    item.comment.etat = 'rejeté';
    this.updateComment(item);
  }

  delete(item: CommentWithSite) {
    if (!confirm('Supprimer ce commentaire ?')) return;

    // Trouver le site ou monument contenant ce commentaire
    const site = this.findSiteWithComment(item.siteId);
    if (site) {
      // Supprimer le commentaire du site principal
      site.comments = site.comments.filter(c => c.id !== item.comment.id);

      // Vérifier aussi dans les monuments
      site.monuments?.forEach(monument => {
        if (monument.id === item.siteId) {
          monument.comments = monument.comments.filter(c => c.id !== item.comment.id);
        }
      });

      this.loadComments();
    }
  }

  private updateComment(item: CommentWithSite) {
    // Recharger les données pour refléter les changements
    // Note: Dans une vraie application, vous feriez un appel HTTP PUT ici
    this.loadComments();
  }

  private findSiteWithComment(siteOrMonumentId: string): SiteHistorique | undefined {
    // Chercher d'abord parmi les sites principaux
    let found = this.sites.find(s => s.id === siteOrMonumentId);
    if (found) return found;

    // Chercher parmi les monuments
    for (const site of this.sites) {
      const monument = site.monuments?.find(m => m.id === siteOrMonumentId);
      if (monument) return site; // Retourner le site parent
    }

    return undefined;
  }

  getStatusBadge(etat: EtatCommentaire): string {
    switch(etat) {
      case 'approuvé': return 'Approved';
      case 'rejeté': return 'Rejected';
      case 'en attente': return 'Pending';
      default: return 'Unknown';
    }
  }

  getStatusClass(etat: EtatCommentaire): string {
    switch(etat) {
      case 'approuvé': return 'badge-success';
      case 'rejeté': return 'badge-danger';
      case 'en attente': return 'badge-warning';
      default: return 'badge-secondary';
    }
  }
}
