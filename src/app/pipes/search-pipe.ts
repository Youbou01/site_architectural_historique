import { Pipe, PipeTransform } from '@angular/core';
import { SiteH } from '../../code/models/siteH.model';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  transform(sites: SiteH[] | null, term: string, category?: string): SiteH[] {
    if (!sites) return [];
    const t = (term || '').toLowerCase();
    return sites.filter(s => {
      const matchTerm = !t ||
        (s.nom && s.nom.toLowerCase().includes(t)) ||
        (s.localisation && s.localisation.toLowerCase().includes(t));
      const matchCat = !category || category === 'all' || s.categorie === category;
      return matchTerm && matchCat;
    });
  }
}
