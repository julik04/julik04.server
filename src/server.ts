// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { NextFunction, Response } from "express";
import cors from "cors";
import { Products } from "./constants/Product.js"
import { Masters, MasterInfo } from "./constants/Masters.js";
import productsDbService from "./services/db/productsDbService.js";



import express from "express";
// import loginRouter from "./routers/loginRouter.js";
// import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { options } from "./swagger/swagger.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..'); // Go one level up from the script's dir
const assetsPath = path.join(projectRoot, 'assets'); // Path to the actual assets folder

// --- Debugging: Log the calculated assets path ---
console.log(`[Server Setup] Serving static files from: ${assetsPath}`);
// ---

// Load environment variables from .env file
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const app = express();
const PORT = process.env.SERVER_PORT || 3000;
// Initialize Swagger
const swaggerSpecs = swaggerJsDoc(options);

app.use(express.json());
// Any request starting with /assets/... will look for files in your assetsPath folder
app.use('/assets', express.static(assetsPath));
// ---
app.use(cors({ origin: "http://localhost:3000" }));

// Swagger middleware
// app.use(
//   "/api-docs",
//   swaggerUI.serve,
//   swaggerUI.setup(swaggerSpecs, {
//     explorer: true,
//     customCssUrl: "/swagger-ui.css",
//   })
// );

app.get("/login", (req: any, res: Response) => {
  console.log("Received request for login...");

  res.status(200).send({ data: { message: "Hello world!" } });
});

app.get("/products", (req: any, res: Response) => {
  res.status(200).send({
    data: {
      Products
    }
  })
})

app.get("/product", async (req: any, res: Response) => {
  const product = await productsDbService.getById(6);
  console.log({ product })
  res.status(200).send({
    data: {
      Product: product,
    }
  })
})

app.get("/masters", (req: any, res: Response) => {
  res.status(200).send({
    data: {
      Masters,
      MasterInfo
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
