import swaggerJSDoc from "swagger-jsdoc";

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}/api/v1`;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API do MatchMentor",
      version: "1.0.0",
      description:
        "Documentação oficial da API de forma dinâmica estruturada com YAML e JSDoc.",
    },
    servers: [
      {
        url: BASE_URL,
        description: "Servidor da API",
      },
    ],
  },
  apis: [
    // Lê os endpoints documentados nos comentários das rotas
    "./src/infrastructure/http/routes/*.ts",
    "./dist/infrastructure/http/routes/*.js",
    // Lê os modelos de dados centralizados no YAML
    "./src/infrastructure/http/docs/*.yaml",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);