import { Pipe, PipeTransform } from '@angular/core';
import { SiteHistorique } from '../models/site-historique';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform(sites: SiteHistorique[] | null, term: string, category?: string): SiteHistorique[] {
    if (!sites) return [];
    const t = (term || '').toLowerCase();
    return sites.filter(s => {
      const matchTerm = !t ||
        (s.nom && s.nom.toLowerCase().includes(t)) ||
        (s.localisation && s.localisation.toLowerCase().includes(t));
      const matchCat = !category || category === 'all' ||
        (s.categories && s.categories.includes(category));
      return matchTerm && matchCat;
    });
  }
}
