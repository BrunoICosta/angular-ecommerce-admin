import { HttpParams } from '@angular/common/http';

type ParamValue = string | number | boolean | null | undefined;

/** Builds HttpParams, skipping empty values so URLs stay clean. */
export function toHttpParams(values: Record<string, ParamValue>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}
