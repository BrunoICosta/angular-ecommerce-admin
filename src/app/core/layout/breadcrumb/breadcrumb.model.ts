import { Data } from '@angular/router';

/** Static label, or a function of the route's resolved data (e.g. a product name). */
export type BreadcrumbDef = string | ((data: Data) => string);

export interface Breadcrumb {
  label: string;
  url: string;
}
