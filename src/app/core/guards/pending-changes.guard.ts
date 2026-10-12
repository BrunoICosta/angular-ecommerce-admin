import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

import { ConfirmService } from '@shared/components/confirm-dialog/confirm.service';

export interface HasPendingChanges {
  hasPendingChanges(): boolean;
}

/** Asks before leaving a page with unsaved form changes. */
export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (component) => {
  if (!component.hasPendingChanges()) return true;
  const transloco = inject(TranslocoService);
  return inject(ConfirmService).confirm({
    title: transloco.translate('pendingChanges.title'),
    message: transloco.translate('pendingChanges.message'),
    confirmLabel: transloco.translate('pendingChanges.confirm'),
    cancelLabel: transloco.translate('pendingChanges.cancel'),
    tone: 'danger',
  });
};
