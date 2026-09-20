import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

import { ConfirmService } from '@shared/components/confirm-dialog/confirm.service';

export interface HasPendingChanges {
  hasPendingChanges(): boolean;
}

/** Asks before leaving a page with unsaved form changes. */
export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (component) =>
  !component.hasPendingChanges() ||
  inject(ConfirmService).confirm({
    title: 'Descartar alterações?',
    message: 'Você tem alterações não salvas. Se sair agora, elas serão perdidas.',
    confirmLabel: 'Descartar',
    cancelLabel: 'Continuar editando',
    tone: 'danger',
  });
