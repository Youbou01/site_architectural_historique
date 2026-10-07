import { Component, OnInit, signal, inject } from '@angular/core';
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
  allComments = signal<CommentWithSite[]>([]);
  sites = signal<SiteHistorique[]>([]);
  selectedSiteId = '';
  selectedStatus = '';

  private readonly patrimoineService = inject(PatrimoineService);

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    this.patrimoineService.loadAll().subscribe({
      next: (sites) => {
        this.sites.set(sites);
        this.collectComments(sites);
      },
      error: () => {
        this.sites.set([]);
        this.allComments.set([]);
      },
    });
  }

  private collectComments(sites: SiteHistorique[]) {
    const comments: CommentWithSite[] = [];

    sites.forEach((site) => {
      (site.comments ?? []).forEach((comment) => {
        comments.push({
          comment,
          siteId: site.id,
          siteName: site.nom,
        });
      });

      (site.monuments ?? []).forEach((monument) => {
        (monument.comments ?? []).forEach((comment) => {
          comments.push({
            comment,
            siteId: site.id,
            siteName: `${site.nom} - ${monument.nom}`,
          });
        });
      });
    });

    this.allComments.set(comments);
  }

  filteredComments(): CommentWithSite[] {
    return this.allComments().filter((item) => {
      const matchSite = !this.selectedSiteId || item.siteId === this.selectedSiteId;
      const matchStatus = !this.selectedStatus || item.comment.etat === this.selectedStatus;
      return matchSite && matchStatus;
    });
  }

  getTotalComments(): number {
    return this.allComments().length;
  }

  getApprovedCount(): number {
    return this.allComments().filter((c) => c.comment.etat === 'approuvé').length;
  }

  getRejectedCount(): number {
    return this.allComments().filter((c) => c.comment.etat === 'rejeté').length;
  }

  getPendingCount(): number {
    return this.allComments().filter((c) => c.comment.etat === 'en attente').length;
  }

  getCommentsCountForSite(siteId: string): number {
    return this.allComments().filter((c) => c.siteId === siteId).length;
  }

  approve(item: CommentWithSite) {
    if (item.comment.etat !== 'en attente') return;
    this.updateCommentInDb(item, 'approuvé');
  }

  reject(item: CommentWithSite) {
    if (item.comment.etat !== 'en attente') return;
    this.updateCommentInDb(item, 'rejeté');
  }

  delete(item: CommentWithSite) {
    if (!confirm('Supprimer ce commentaire ?')) return;

    const site = this.sites().find((s) => s.id === item.siteId);
    if (!site) {
      console.error('Site not found');
      return;
    }

    const siteCommentIndex = (site.comments ?? []).findIndex((c) => c.id === item.comment.id);
    if (siteCommentIndex !== -1) {
      site.comments.splice(siteCommentIndex, 1);
      this.updateSiteInDb(site);
      return;
    }

    for (const monument of site.monuments ?? []) {
      const monumentCommentIndex = (monument.comments ?? []).findIndex(
        (c) => c.id === item.comment.id
      );
      if (monumentCommentIndex !== -1) {
        monument.comments.splice(monumentCommentIndex, 1);
        this.updateSiteInDb(site);
        return;
      }
    }
  }

  private updateCommentInDb(item: CommentWithSite, etat: EtatCommentaire) {
    const site = this.sites().find((s) => s.id === item.siteId);
    if (!site) {
      console.error('Site not found');
      return;
    }

    const siteComment = (site.comments ?? []).find((c) => c.id === item.comment.id);
    if (siteComment) {
      siteComment.etat = etat;
      this.updateSiteInDb(site);
      return;
    }

    for (const monument of site.monuments ?? []) {
      const monumentComment = (monument.comments ?? []).find((c) => c.id === item.comment.id);
      if (monumentComment) {
        monumentComment.etat = etat;
        this.updateSiteInDb(site);
        return;
      }
    }
  }

  private updateSiteInDb(site: SiteHistorique) {
    this.patrimoineService.updatePatrimoine(site.id, site).subscribe({
      next: () => this.loadComments(),
      error: (err) => {
        console.error('Error updating site:', err);
        alert('Erreur lors de la mise à jour du commentaire');
        this.loadComments();
      },
    });
  }

  getStatusBadge(etat: EtatCommentaire): string {
    switch (etat) {
      case 'approuvé':
        return 'Approved';
      case 'rejeté':
        return 'Rejected';
      case 'en attente':
        return 'en attente';
    }
  }

  getStatusClass(etat: EtatCommentaire): string {
    switch (etat) {
      case 'approuvé':
        return 'badge-success';
      case 'rejeté':
        return 'badge-danger';
      case 'en attente':
        return 'badge-warning';
    }
  }
}
