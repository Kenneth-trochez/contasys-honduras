
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Usuario, Rol } from '../models';

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('Falta configurar JWT_SECRET en el entorno');
}

passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    },
    async (payload, done) => {
      try {
        const id = Number(payload.id);

        if (!Number.isInteger(id) || id <= 0) {
          return done(null, false);
        }

        const usuario = await Usuario.findByPk(id, {
          include: [{ model: Rol, as: 'rol' }],
        });

        if (!usuario || usuario.estado !== 'Activo') {
          return done(null, false);
        }

        const rol = usuario.get('rol') as Rol | undefined;

        if (!rol) {
          return done(null, false);
        }

        return done(null, {
          id: usuario.id_usuario,
          id_rol: usuario.id_rol,
          rol: rol.nombre_rol,
        });
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
