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
import usersDbService from "./services/db/usersDbService.js";
import jwt from "jsonwebtoken";


import express from "express";
// import loginRouter from "./routers/loginRouter.js";
// import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { options } from "./swagger/swagger.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..'); // Go one level up from the script's dir
const assetsPath = path.join(projectRoot, 'assets'); // Path to the actual assets folder

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here' as jwt.Secret;;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || 3600000; // 1h

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

const generateToken = (id: number) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: 100 });
};

app.post("/login", async (req: any, res: Response) => {
  console.log("Received request for login...");

  console.log({ reg: req.body });
  const login = req.body.login;
  const password = req.body.password;

  if (!login || !password) {
    res.status(400).send({ data: { message: "Login or password is empty!" } });
    return;
  }

  const user = await usersDbService.findByLogin(login);
  console.log({ user });

  if (!user) {
    res.status(400).send({ data: { message: "Login is wrong!" } });
    return;
  }

  const isSuccess = user.password === password;

  if (!isSuccess) {
    res.status(400).send({ data: { message: "Password is wrong!" } });
    return;
  }

  // Логика с JWT токеном

  // let token;

  // // Get token from Authorization header
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith('Bearer')
  // ) {
  //   token = req.headers.authorization.split(' ')[1];
  // }

  // console.log({ token })

  const token = generateToken(user.id);

  console.log({ token })
  await usersDbService.updateAccessToken(user.id, token);


  res.status(200).send({ data: { message: "Success!", acessToken: token } });
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
