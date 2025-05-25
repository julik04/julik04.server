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
import jwtService from "./services/jwtService.js";
import ordersDbService from "./services/db/ordersDbService.js";


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

app.post("/signup", async (req: any, res: Response) => {
  const body = req.body;
  const login = body.login;
  const password = body.password;
  const repeatPassword = body.repeatPassword;
  const full_name = body.full_name;
  const phone_number = body.phone_number; // 8-917-324-21-21
  const birth_date = body.birth_date; // 2020-01-01


  if (!login) {
    res.status(400).send({ data: { message: "Login is empty!" } });
    return;
  }

  if (!password) {
    res.status(400).send({ data: { message: "Password is empty!" } });
    return;
  }

  if (!repeatPassword) {
    res.status(400).send({ data: { message: "RepeatPassword is empty!" } });
    return;
  }

  const isLoginValid = /^(?=.*\d)[a-zA-Z0-9]{4,14}$/.test(login);

  if (!isLoginValid || !(login.length > 6 && login.length < 255)) {
    res.status(400).send({ data: { message: "Login is not valid!" } });
    return;
  }

  const isLoginUnique = !(await usersDbService.findByLogin(login));

  if (!isLoginUnique) {
    res.status(400).send({ data: { message: "Login is not unique!" } });
    return;
  }

  const isPassValid = /^(?=.*\d)(?=.*[A-Z])[a-zA-Z0-9]{7,14}$/.test(password);

  if (!isPassValid || !(password.length > 6 && password.length < 255)) {
    res.status(400).send({ data: { message: "Password is not valid!" } });
    return;
  }

  if (repeatPassword !== password) {
    res.status(400).send({ data: { message: "Password is not equal to repeatPassword!" } });
    return;
  }

  const hashedPassword = await usersDbService.hashPassword(password);

  if (!hashedPassword) {
    res.status(400).send({ data: { message: "Error to hash a password!" } })
    return;
  }

  const dateRegex =
    /((20)[0-9]{2}[-](0[13578]|1[02])[-](0[1-9]|[12][0-9]|3[01]))|((20)[0-9]{2}[-](0[469]|11)[-](0[1-9]|[12][0-9]|30))|((20)[0-9]{2}[-](02)[-](0[1-9]|1[0-9]|2[0-8]))|((((20)(04|08|[2468][048]|[13579][26]))|2000)[-](02)[-]29)/;


  if (!birth_date || !dateRegex.test(birth_date)) {
    res.status(400).send({ data: { message: "Birth date is empty or not valid!" } });
    return;
  }

  if (!phone_number || !/^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(
    phone_number
  )) {
    res.status(400).send({ data: { message: "Phone number is empty or not valid!" } });
    return;
  }

  if (!full_name || !(full_name.length < 255)) {
    res.status(400).send({ data: { message: "Full name is empty or not valid!" } });
    return;
  }

  const user = await usersDbService.createUser({ login, password: hashedPassword, full_name, phone_number, birth_date });

  const isPassChecked = await usersDbService.comparePassword(password, hashedPassword);

  res.status(200).send({ data: { message: "User successfully created!" } });
})

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

  const isSuccess = await usersDbService.comparePassword(password, user.password);

  if (!isSuccess) {
    res.status(400).send({ data: { message: "Password is wrong!" } });
    return;
  }

  // Логика с JWT токеном

  const token = await jwtService.sign({ user });
  await usersDbService.updateAccessToken(user.id, token);

  const decodedPayload = jwtService.decode(token);

  console.log({ decodedPayload });

  res.status(200).send({ data: { message: "Success!", acessToken: token, login: login, role: user.role } });
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

app.get("/orders/:userId", async (req: any, res: Response) => {
  const userId = req.params;
  const orders = await (userId ? ordersDbService.getOrdersByUserId(userId) : ordersDbService.getAllOrders());

  res.status(200).send({
    data: {
      Orders: orders
    }
  })
})

app.post("/orders", async (req: any, res: Response) => {
  const user_id = req.body.user_id;
  // const phone_number = req.body.phone_number;
  const order_date = req.body.order_date;
  const comment = req.body.comment;

  if (!user_id || !(await usersDbService.getById(user_id))) {
    res.status(400).send({ data: { message: "User id is empty or not found!" } });
    return;
  }

  // if (!phone_number || !/^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/.test(
  //   phone_number
  // )) {
  //   res.status(400).send({ data: { message: "Phone number is empty or not valid!" } });
  //   return;
  // }

  console.log({ order_date })

  if (!order_date || (new Date(order_date) < new Date())) {
    console.log({
      order_date: new Date(order_date),
      today: new Date()
    })
    res.status(400).send({ data: { message: "Order date is empty or it cannot be in the past!" } });
    return;
  }

  try {
    const order = await ordersDbService.createOrder({ user_id, order_date, comment })


    res.status(200).send({
      data: {
        message: "Success!",
        Order: order,
      }
    });
    return;
  } catch (err) {
    res.status(400).send({ data: { message: err.message } });
    return;
  }
})

app.get("/users/:login", async (req: any, res: Response) => {
  const login = req.params.login;

  const user = await usersDbService.findByLogin(login);

  res.status(200).send({
    data: {
      message: "Success!",
      User: user,
    }
  });
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
