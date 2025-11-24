import { Component, OnInit } from '@angular/core';
import { PatrimoineService } from '../../../../services/patrimoine.service';
import { Router, RouterLink } from '@angular/router';
import { SiteHistorique } from '../../../../models/site-historique';
import { LieuProche } from '../../../../models/lieu-proche';
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

  // Monument management
  showMonumentsModal = false;
  showMonumentForm = false;
  selectedSite: SiteHistorique | null = null;
  editingMonumentId: string | null = null;

  formData = {
    nom: '',
    localisation: '',
    photo: '',
    dateConstruction: '',
    estClasse: false,
    prixEntree: 0,
    description: '',
    categorie: 'Site archéologique',
    horaires: '',
    visitesGuideesDisponibles: false,
    lieuxProches: '',
    latitude: 0,
    longitude: 0
  };

  monumentFormData = {
    nom: '',
    adresse: '',
    description: '',
    categories: '',
    prixEntree: 0,
    photos: '',
    dateConstruction: '',
    origineHistorique: '',
    horaires: '',
    lieuxProches: '',
    estClasse: false,
    ouvert: true,
    visitesGuideesDisponibles: false,
    latitude: 0,
    longitude: 0
  };

  constructor(
    private patrimoineService: PatrimoineService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.patrimoineService.patrimoines.set([]);
    this.patrimoineService.loadAll();

    const checkData = setInterval(() => {
      const sites = this.patrimoineService.patrimoines();
      if (sites.length > 0) {
        clearInterval(checkData);
        this.sites = sites;
      }
    }, 100);

    setTimeout(() => {
      clearInterval(checkData);
      this.sites = this.patrimoineService.patrimoines();
    }, 5000);
  }

  getCategories(): string[] {
    const categoriesSet = new Set<string>();
    this.sites.forEach(site => {
      site.categories.forEach(cat => categoriesSet.add(cat));
    });
    return Array.from(categoriesSet).sort();
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
    return this.sites.filter((s: SiteHistorique) => !s.prixEntree || s.prixEntree === 0).length;
  }

  truncate(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  getCategoryClass(category: string): string {
    const map: { [key: string]: string } = {
      'Site archéologique': 'archeologique',
      'Infrastructure romaine': 'romaine',
      'Ville historique': 'historique',
      'Médina': 'medina',
      'Patrimoine immatériel': 'immateriel',
      'Parc naturel': 'naturel',
      'Site historique': 'historique',
      'Ville religieuse': 'religieux',
      'Île culturelle': 'culturelle'
    };
    return map[category] || 'autre';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default.jpg';
  }

  // Site CRUD Methods
  openAddForm(): void {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(site: SiteHistorique): void {
    this.editingId = site.id;
    this.formData = {
      nom: site.nom || '',
      localisation: site.localisation || '',
      photo: (site.photoCarousel && site.photoCarousel[0]) || '',
      dateConstruction: site.dateConstruction ? site.dateConstruction.split('T')[0] : '',
      estClasse: site.estClasse || false,
      prixEntree: site.prixEntree || 0,
      description: site.description || '',
      categorie: (site.categories && site.categories[0]) || 'Site archéologique',
      horaires: (site.horaires || []).join(', '),
      visitesGuideesDisponibles: site.visitesGuideesDisponibles || false,
      lieuxProches: (site.lieuxProches || [])
        .map((l: LieuProche) => `${l.nom}|${l.type}|${l.distanceKm || 0}`)
        .join('; '),
      latitude: site.latitude || 0,
      longitude: site.longitude || 0
    };
    this.showForm = true;
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      localisation: '',
      photo: '',
      dateConstruction: '',
      estClasse: false,
      prixEntree: 0,
      description: '',
      categorie: 'Site archéologique',
      horaires: '',
      visitesGuideesDisponibles: false,
      lieuxProches: '',
      latitude: 0,
      longitude: 0
    };
  }

  saveSite(): void {
    if (!this.formData.nom || !this.formData.localisation) {
      alert('Name and Location are required');
      return;
    }

    const horairesArray = this.formData.horaires
      ? this.formData.horaires.split(',').map(h => h.trim()).filter(h => h)
      : [];

    const lieuxProchesArray: LieuProche[] = this.formData.lieuxProches
      ? this.formData.lieuxProches.split(';').map(lp => {
          const parts = lp.trim().split('|');
          return {
            nom: parts[0] || '',
            type: parts[1] || '',
            distanceKm: parseFloat(parts[2]) || 0
          };
        }).filter(lp => lp.nom)
      : [];

    const siteData: Partial<SiteHistorique> = {
      nom: this.formData.nom,
      localisation: this.formData.localisation,
      description: this.formData.description || '',
      origineHistorique: '',
      photoCarousel: this.formData.photo ? [this.formData.photo] : [],
      latitude: this.formData.latitude || 0,
      longitude: this.formData.longitude || 0,
      categories: [this.formData.categorie],
      dateConstruction: this.formData.dateConstruction || null,
      estClasse: this.formData.estClasse,
      prixEntree: this.formData.prixEntree || 0,
      ouvert: true,
      horaires: horairesArray,
      visitesGuideesDisponibles: this.formData.visitesGuideesDisponibles,
      lieuxProches: lieuxProchesArray,
      comments: [],
      stats: {
        vues: 0,
        favoris: 0,
        noteMoyenne: 0
      },
      monuments: []
    };

    if (this.editingId) {
      this.patrimoineService.updatePatrimoine(this.editingId, siteData).subscribe({
        next: () => {
          alert('Site updated successfully!');
          this.showForm = false;
          this.load();
        },
        error: (err) => {
          console.error('Error updating site:', err);
          alert('Failed to update site. Please try again.');
        }
      });
    } else {
      this.patrimoineService.addPatrimoine(siteData).subscribe({
        next: () => {
          alert('Site added successfully!');
          this.showForm = false;
          this.load();
        },
        error: (err) => {
          console.error('Error adding site:', err);
          alert('Failed to add site. Please try again.');
        }
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
  }

  delete(id: string): void {
    if (!confirm('Are you sure you want to delete this site?')) return;

    this.patrimoineService.deletePatrimoine(id).subscribe({
      next: () => {
        alert('Site deleted successfully!');
        this.load();
      },
      error: (err) => {
        console.error('Error deleting site:', err);
        alert('Failed to delete site. Please try again.');
      }
    });
  }

  // Monument Management Methods
  openMonumentsModal(site: SiteHistorique): void {
    this.selectedSite = site;
    this.showMonumentsModal = true;
  }

  closeMonumentsModal(): void {
    this.showMonumentsModal = false;
    this.selectedSite = null;
  }

  openAddMonumentForm(): void {
    this.editingMonumentId = null;
    this.resetMonumentForm();
    this.showMonumentForm = true;
  }

  openEditMonumentForm(monument: SiteHistorique): void {
    this.editingMonumentId = monument.id;
    this.monumentFormData = {
      nom: monument.nom || '',
      adresse: monument.adresse || '',
      description: monument.description || '',
      categories: (monument.categories || []).join(', '),
      prixEntree: monument.prixEntree || 0,
      photos: (monument.photoCarousel || []).join(', '),
      dateConstruction: monument.dateConstruction ? monument.dateConstruction.split('T')[0] : '',
      origineHistorique: monument.origineHistorique || '',
      horaires: (monument.horaires || []).join(', '),
      lieuxProches: (monument.lieuxProches || [])
        .map((l: LieuProche) => `${l.nom}|${l.type}|${l.distanceKm || 0}`)
        .join('; '),
      estClasse: monument.estClasse || false,
      ouvert: monument.ouvert !== false,
      visitesGuideesDisponibles: monument.visitesGuideesDisponibles || false,
      latitude: monument.latitude || 0,
      longitude: monument.longitude || 0
    };
    this.showMonumentForm = true;
  }

  resetMonumentForm(): void {
    this.monumentFormData = {
      nom: '',
      adresse: '',
      description: '',
      categories: '',
      prixEntree: 0,
      photos: '',
      dateConstruction: '',
      origineHistorique: '',
      horaires: '',
      lieuxProches: '',
      estClasse: false,
      ouvert: true,
      visitesGuideesDisponibles: false,
      latitude: 0,
      longitude: 0
    };
  }

  saveMonument(): void {
    if (!this.monumentFormData.nom || !this.monumentFormData.adresse) {
      alert('Monument name and address are required');
      return;
    }

    if (!this.selectedSite) {
      alert('No site selected');
      return;
    }

    const categoriesArray = this.monumentFormData.categories
      ? this.monumentFormData.categories.split(',').map(c => c.trim()).filter(c => c)
      : [];

    const photosArray = this.monumentFormData.photos
      ? this.monumentFormData.photos.split(',').map(p => p.trim()).filter(p => p)
      : [];

    const horairesArray = this.monumentFormData.horaires
      ? this.monumentFormData.horaires.split(',').map(h => h.trim()).filter(h => h)
      : [];

    const lieuxProchesArray: LieuProche[] = this.monumentFormData.lieuxProches
      ? this.monumentFormData.lieuxProches.split(';').map(lp => {
          const parts = lp.trim().split('|');
          return {
            nom: parts[0] || '',
            type: parts[1] || '',
            distanceKm: parseFloat(parts[2]) || 0
          };
        }).filter(lp => lp.nom)
      : [];

    const monumentData: SiteHistorique = {
      id: this.editingMonumentId || `mon-${this.selectedSite.id}-${Date.now()}`,
      nom: this.monumentFormData.nom,
      localisation: this.selectedSite.localisation,
      adresse: this.monumentFormData.adresse,
      description: this.monumentFormData.description,
      origineHistorique: this.monumentFormData.origineHistorique,
      photoCarousel: photosArray,
      latitude: this.monumentFormData.latitude,
      longitude: this.monumentFormData.longitude,
      dateConstruction: this.monumentFormData.dateConstruction || null,
      estClasse: this.monumentFormData.estClasse,
      prixEntree: this.monumentFormData.prixEntree,
      ouvert: this.monumentFormData.ouvert,
      horaires: horairesArray,
      categories: categoriesArray,
      visitesGuideesDisponibles: this.monumentFormData.visitesGuideesDisponibles,
      lieuxProches: lieuxProchesArray,
      comments: [],
      monuments: [],
      stats: {
        vues: 0,
        favoris: 0,
        noteMoyenne: 0
      }
    };

    // Update or add monument to the site's monuments array
    let updatedMonuments: SiteHistorique[] = [...(this.selectedSite.monuments || [])];

    if (this.editingMonumentId) {
      const index = updatedMonuments.findIndex(m => m.id === this.editingMonumentId);
      if (index !== -1) {
        updatedMonuments[index] = monumentData;
      }
    } else {
      updatedMonuments.push(monumentData);
    }

    // Update the site with the new monuments array
    const updatedSite: Partial<SiteHistorique> = {
      ...this.selectedSite,
      monuments: updatedMonuments
    };

    this.patrimoineService.updatePatrimoine(this.selectedSite.id, updatedSite).subscribe({
      next: () => {
        alert(this.editingMonumentId ? 'Monument updated successfully!' : 'Monument added successfully!');
        this.showMonumentForm = false;
        this.load();
        // Refresh selected site
        setTimeout(() => {
          const refreshedSite = this.sites.find(s => s.id === this.selectedSite?.id);
          if (refreshedSite) {
            this.selectedSite = refreshedSite;
          }
        }, 500);
      },
      error: (err) => {
        console.error('Error saving monument:', err);
        alert('Failed to save monument. Please try again.');
      }
    });
  }

  cancelMonumentForm(): void {
    this.showMonumentForm = false;
    this.editingMonumentId = null;
  }

  deleteMonument(monumentId: string): void {
    if (!confirm('Are you sure you want to delete this monument?')) return;

    if (!this.selectedSite) return;

    const updatedMonuments: SiteHistorique[] = (this.selectedSite.monuments || []).filter(m => m.id !== monumentId);

    const updatedSite: Partial<SiteHistorique> = {
      ...this.selectedSite,
      monuments: updatedMonuments
    };

    this.patrimoineService.updatePatrimoine(this.selectedSite.id, updatedSite).subscribe({
      next: () => {
        alert('Monument deleted successfully!');
        this.load();
        // Refresh selected site
        setTimeout(() => {
          const refreshedSite = this.sites.find(s => s.id === this.selectedSite?.id);
          if (refreshedSite) {
            this.selectedSite = refreshedSite;
          }
        }, 500);
      },
      error: (err) => {
        console.error('Error deleting monument:', err);
        alert('Failed to delete monument. Please try again.');
      }
    });
  }

  getFirstCategory(site: SiteHistorique): string {
    return site.categories && site.categories.length > 0
      ? site.categories[0]
      : 'Site archéologique';
  }
}
