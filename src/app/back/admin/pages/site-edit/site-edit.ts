import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PatrimoineService } from '../../../../services/patrimoine.service';
import { SiteHistorique } from '../../../../models/site-historique';
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
    private patrimoineService: PatrimoineService,
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
    this.patrimoineService.getById(id).subscribe({
      next: (site: SiteHistorique) => {
        this.formData = {
          nom: site.nom || '',
          localisation: site.localisation || '',
          photo: site.photoCarousel?.[0] || '',
          dateConstruction: site.dateConstruction ? site.dateConstruction.split('T')[0] : '',
          estClasse: site.estClasse || false,
          prixEntree: site.prixEntree || 0,
          description: site.description || '',
          categorie: site.categories?.[0] || 'Autre',
          horaires: (site.horaires || []).join(', '),
          visitesGuideesDisponibles: site.visitesGuideesDisponibles || false,
          lieuxProches: (site.lieuxProches || []).map(l => `${l.nom}|${l.type}|${l.distanceKm || 0}`).join('; '),
          latitude: site.latitude || 0,
          longitude: site.longitude || 0
        };
      },
      error: (err: Error) => {
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

    alert('Save functionality to be implemented');
    this.router.navigate(['/admin/site-crud']);
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
