// Utilidades para leer datos del request en los controladores.

// Lee un parámetro de query como texto (Express puede entregar arreglos u objetos).
export function textoQuery(valor: unknown): string | undefined {
  return typeof valor === 'string' ? valor : undefined;
}

// Devuelve el `name` de un error desconocido, si lo tiene.
export function nombreError(error: unknown): string | undefined {
  return error instanceof Error ? error.name : undefined;
}
