import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Site } from '../../../../core/services/site';
import { SiteH } from '../../../../code/models/siteH.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-edit',
  templateUrl: './site-edit.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./site-edit.css']
})
export class SiteEditComponent implements OnInit {
  editingId?: string;

  formData = {
    nom: '',
    localisation: '',
    photo: '',
    dateConstruction: '',
    estClasse: false,
    prixEntree: 0,
    description: '',
    categorie: 'Autre',
    horaires: '',
    visitesGuideesDisponibles: false,
    lieuxProches: '',
    latitude: 0,
    longitude: 0
  };

  constructor(
    private siteService: Site,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId = id;
      this.loadSite(id);
    }
  }

  loadSite(id: string) {
    this.siteService.getSite(id).subscribe({
      next: (site) => {
        this.formData = {
          nom: site.nom || '',
          localisation: site.localisation || '',
          photo: site.photo || '',
          dateConstruction: site.dateConstruction ? site.dateConstruction.split('T')[0] : '',
          estClasse: site.estClasse || false,
          prixEntree: site.prixEntree || 0,
          description: site.description || '',
          categorie: site.categorie || 'Autre',
          horaires: (site.horaires || []).join(', '),
          visitesGuideesDisponibles: site.visitesGuideesDisponibles || false,
          lieuxProches: (site.lieuxProches || []).map(l => `${l.nom}|${l.type}|${l.distanceKm || 0}`).join('; '),
          latitude: site.latitude || 0,
          longitude: site.longitude || 0
        };
      },
      error: (err) => {
        alert('Error loading site: ' + err.message);
        this.router.navigate(['/admin/site-crud']);
      }
    });
  }

  save() {
    if (!this.formData.nom || !this.formData.localisation) {
      alert('Name and Location are required!');
      return false;
    }

    const horaires = this.formData.horaires
      .split(',')
      .map(h => h.trim())
      .filter(h => h);

    const lieuxProches = this.formData.lieuxProches
      .split(';')
      .map(l => {
        const parts = l.trim().split('|');
        return {
          nom: parts[0] || '',
          type: parts[1] || '',
          distanceKm: parseFloat(parts[2]) || 0
        };
      })
      .filter(l => l.nom);

    if (this.editingId) {
      this.siteService.getSite(this.editingId).subscribe({
        next: (original) => {
          const updated: SiteH = {
            ...original,
            nom: this.formData.nom,
            localisation: this.formData.localisation,
            photo: this.formData.photo,
            dateConstruction: this.formData.dateConstruction || original.dateConstruction,
            estClasse: this.formData.estClasse,
            prixEntree: this.formData.prixEntree,
            description: this.formData.description,
            categorie: this.formData.categorie,
            horaires,
            visitesGuideesDisponibles: this.formData.visitesGuideesDisponibles,
            lieuxProches,
            latitude: this.formData.latitude,
            longitude: this.formData.longitude
          };

          this.siteService.updateSite(updated).subscribe({
            next: () => {
              alert('Site updated successfully!');
              this.router.navigate(['/admin/site-crud']);
            },
            error: (err) => alert('Error updating site: ' + err.message)
          });
        },
        error: (err) => alert('Error fetching site: ' + err.message)
      });
    } else {
      const newSite: Partial<SiteH> = {
        nom: this.formData.nom,
        localisation: this.formData.localisation,
        photo: this.formData.photo || 'assets/images/default.jpg',
        dateConstruction: this.formData.dateConstruction || new Date().toISOString(),
        estClasse: this.formData.estClasse,
        prixEntree: this.formData.prixEntree,
        description: this.formData.description,
        categorie: this.formData.categorie,
        horaires,
        visitesGuideesDisponibles: this.formData.visitesGuideesDisponibles,
        lieuxProches,
        latitude: this.formData.latitude,
        longitude: this.formData.longitude,
        comments: []
      };

      this.siteService.createSite(newSite).subscribe({
        next: () => {
          alert('Site created successfully!');
          this.router.navigate(['/admin/site-crud']);
        },
        error: (err) => alert('Error creating site: ' + err.message)
      });
    }

    return true;
  }

  cancel() {
    this.router.navigate(['/admin/site-crud']);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default.jpg';
  }
}
