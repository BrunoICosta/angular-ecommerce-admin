import { Resource, Signal, linkedSignal } from '@angular/core';

/**
 * Keeps the last successfully loaded value of a resource while it reloads, so
 * tables do not flash empty between pages. Errors are surfaced separately via
 * `resource.error()`.
 */
export function latestValue<T>(resource: Resource<T | undefined>): Signal<T | undefined> {
  return linkedSignal<T | undefined, T | undefined>({
    source: () => (resource.hasValue() ? resource.value() : undefined),
    computation: (value, previous) => value ?? previous?.value,
  });
}
