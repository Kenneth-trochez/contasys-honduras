const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="float-end d-none d-sm-inline">
        ContaSys Honduras
      </div>

      <strong>
        Copyright &copy; {new Date().getFullYear()} ContaSys.
      </strong>

      {' '}Todos los derechos reservados.
    </footer>
  );
};

export default Footer;