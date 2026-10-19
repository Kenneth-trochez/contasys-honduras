class ErrorNegocio extends Error {
  status: number;
  errores?: unknown;

  constructor(status: number, message: string, errores?: unknown) {
    super(message);
    this.status = status;
    this.errores = errores;
  }
}

export default ErrorNegocio;
