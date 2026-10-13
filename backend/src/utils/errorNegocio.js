class ErrorNegocio extends Error {
  constructor(status, message, errores) {
    super(message);
    this.status = status;
    this.errores = errores;
  }
}

module.exports = ErrorNegocio;
