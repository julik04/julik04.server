// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import express from "express";
import loginRouter from "./routers/loginRouter.js";
// import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { options } from "./swagger/swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
// Initialize Swagger
const swaggerSpecs = swaggerJsDoc(options);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Swagger middleware
// app.use(
//   "/api-docs",
//   swaggerUI.serve,
//   swaggerUI.setup(swaggerSpecs, {
//     explorer: true,
//     customCssUrl: "/swagger-ui.css",
//   })
// );

app.use("/login", loginRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
