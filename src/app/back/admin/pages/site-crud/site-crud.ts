import { Component, OnInit } from '@angular/core';
import { PatrimoineService } from '../../../../services/patrimoine.service';
import { Router, RouterLink } from '@angular/router';
import { SiteHistorique } from '../../../../models/site-historique';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-site-crud',
  templateUrl: './site-crud.html',
  imports: [RouterLink, FormsModule, CommonModule],
  styleUrls: ['./site-crud.css']
})
export class SiteCrudComponent implements OnInit {
  sites: SiteHistorique[] = [];
  showForm = false;
  editingId: string | null = null;
  searchTerm = '';
  filterCategory = '';

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
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.patrimoineService.loadAll();
    setTimeout(() => {
      this.sites = this.patrimoineService.patrimoines();
    }, 300);
  }

  filteredSites(): SiteHistorique[] {
    return this.sites.filter((s: SiteHistorique) => {
      const matchesSearch = !this.searchTerm ||
        s.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (s.localisation || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.filterCategory ||
        s.categories.includes(this.filterCategory);
      return matchesSearch && matchesCategory;
    });
  }

  getClassifiedCount(): number {
    return this.sites.filter((s: SiteHistorique) => s.estClasse).length;
  }

  getFreeCount(): number {
    return this.sites.filter((s: SiteHistorique) => s.prixEntree === 0).length;
  }

  truncate(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  getCategoryClass(category: string): string {
    const map: { [key: string]: string } = {
      'Médina': 'medina',
      'Monument': 'monument',
      'Musée': 'musee',
      'Site Archéologique': 'archeologique',
      'Religieux': 'religieux',
      'Autre': 'autre'
    };
    return map[category] || 'autre';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default.jpg';
  }

  openAddForm() {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(site: SiteHistorique) {
    this.editingId = site.id;
    this.formData = {
      nom: site.nom,
      localisation: site.localisation || '',
      photo: site.photoCarousel[0] || '',
      dateConstruction: site.dateConstruction || '',
      estClasse: site.estClasse,
      prixEntree: site.prixEntree,
      description: site.description,
      categorie: site.categories[0] || 'Autre',
      horaires: (site.horaires || []).join(', '),
      visitesGuideesDisponibles: site.visitesGuideesDisponibles,
      lieuxProches: (site.lieuxProches || []).map(l => `${l.nom}|${l.type}|${l.distanceKm || 0}`).join('; '),
      latitude: site.latitude || 0,
      longitude: site.longitude || 0
    };
    this.showForm = true;
  }

  resetForm() {
    this.formData = {
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
  }

  saveSite() {
    if (!this.formData.nom || !this.formData.localisation) {
      alert('Name and Location are required');
      return;
    }

    alert('Save functionality to be implemented');
    this.showForm = false;
  }

  cancelForm() {
    this.showForm = false;
  }

  delete(id: string) {
    if (!confirm('Are you sure you want to delete this site?')) return;

    alert('Delete functionality to be implemented');
    this.load();
  }
  getFirstCategory(site: SiteHistorique): string {
  return site.categories && site.categories.length > 0
    ? site.categories[0]
    : 'Autre';
}
}
