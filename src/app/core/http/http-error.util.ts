import { HttpErrorResponse } from '@angular/common/http';

const STATUS_MESSAGES: Record<number, string> = {
  0: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
  400: 'A requisição tem dados inválidos.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'O registro solicitado não foi encontrado.',
  409: 'O registro entrou em conflito com outro já existente.',
  422: 'Não foi possível processar os dados enviados.',
};

/** Turns any HTTP failure into a message that can be shown to the user (pt-BR). */
export function httpErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Ocorreu um erro inesperado.';

  const body: unknown = error.error;
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'string'
  ) {
    return body.error;
  }
  if (error.status >= 500) return 'O servidor encontrou um erro. Tente novamente em instantes.';
  return STATUS_MESSAGES[error.status] ?? 'Ocorreu um erro inesperado.';
}
