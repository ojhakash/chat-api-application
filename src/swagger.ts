import { Express, Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerSpec = swaggerJSDoc({
  failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chat api docs",
      version: "1.0.0",
    },
  },
  apis: ["./src/api/**/routes.ts", "./src/api/**/*Usecase.ts"],
});

function swaggerDocs(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs.json", (request: Request, response: Response) => {
    response.setHeader("Content-Type", "application/json");
    response.send(swaggerSpec);
  });
}

export default swaggerDocs;
