import { Data } from '@angular/router';

/**
 * A translation key, or a function of the route's resolved data returning a
 * ready-to-display label (e.g. a product name, which is not translated).
 */
export type BreadcrumbDef = string | ((data: Data) => string);

export interface Breadcrumb {
  label: string;
  /** `true` when `label` is a translation key. */
  translate: boolean;
  url: string;
}
