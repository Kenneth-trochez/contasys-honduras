
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'ContaSys Honduras API',
      version: '1.0.0',
      description:
        'Documentación y pruebas de los endpoints del sistema ContaSys Honduras.',
    },

    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor local de desarrollo',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido mediante el inicio de sesión.',
        },
      },
    },
  },

  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
