export type ApiErrorCode =
  | 'invalid_credentials'
  | 'user_inactive'
  | 'unauthenticated'
  | 'session_expired'
  | 'forbidden'
  | 'customer_not_found'
  | 'order_not_found'
  | 'duplicate_sku'
  | 'invalid_transition';

/** Error body returned by the API. The UI translates `code` when it knows it. */
export interface ApiError {
  error: string;
  code?: ApiErrorCode;
  params?: Record<string, string | number>;
}
