import { ActivatedRouteSnapshot } from '@angular/router';

import { Breadcrumb, BreadcrumbDef } from './breadcrumb.model';

/**
 * Walks the activated route tree and collects a crumb for every route config
 * that declares `data.breadcrumb`. Reading `routeConfig.data` (instead of the
 * inherited snapshot data) avoids duplicated crumbs for `path: ''` children.
 */
export function buildBreadcrumbs(root: ActivatedRouteSnapshot): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [];
  const segments: string[] = [];
  let route: ActivatedRouteSnapshot | null = root;

  while (route) {
    segments.push(...route.url.map((segment) => segment.path));
    const def = route.routeConfig?.data?.['breadcrumb'] as BreadcrumbDef | undefined;
    if (def) {
      const label = typeof def === 'function' ? def(route.data) : def;
      const url = '/' + segments.join('/');
      if (label && crumbs.at(-1)?.url !== url) {
        crumbs.push({ label, url, translate: typeof def === 'string' });
      }
    }
    route = route.firstChild;
  }
  return crumbs;
}
