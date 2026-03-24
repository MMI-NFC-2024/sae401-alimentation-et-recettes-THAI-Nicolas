//Type pour les résultats des services, avec un type d'erreur générique
export type ServiceError = "not_found" | "server_error";

// Type générique pour les résultats des services, avec les données "data" et une erreur potentielle
export interface ServiceResult<T> {
  data: T;
  error: ServiceError | null;
}
