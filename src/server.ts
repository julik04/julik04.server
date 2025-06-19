// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { NextFunction, Response } from "express";
import cors from "cors";
import { Masters, MasterInfo } from "./constants/Masters.js";
import productsDbService from "./services/db/productsDbService.js";
import usersDbService from "./services/db/usersDbService.js";
import mastersDbService from "./services/db/mastersDbService.js";
import jwtService from "./services/jwtService.js";
import ordersDbService from "./services/db/ordersDbService.js";
import { categorizedProducts } from "./utils/categorizedProducts.js";
import multer from "multer"
import { fileTypeFromFile } from "file-type";
import fs from "fs";
import checkAdmin from "./middlewares/checkAdminMiddleware.js";
import categoriesDbService from "./services/db/categoriesDbService.js";



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

const storage = multer.diskStorage({
  destination: assetsPath,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueName}${ext}`);
  },
});

const fileFilter = (
  req: express.Request,
  file: any,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG, GIF) are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Error handling middleware for Multer
const handleMulterError = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ data: { message: err.message } });
  }
  if (err) {
    return res.status(400).json({ data: { message: err.message } });
  }
  next();
};
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
app.use(cors({ origin: "http://localhost:3000", allowedHeaders: ['Content-Type', 'Authorization'] }));


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

  const isPassValid = /^(?=.*\d)(?=.*[A-Z])[a-zA-Z0-9]{7,255}$/.test(password);

  if (!isPassValid) {
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

  // const dateRegex =
    // /(((0[1-9]|[12][0-9]|3[01])\.(0[13578]|1[02])\.(20[0-9]{2}))|(((0[1-9]|[12][0-9]|30)\.(0[469]|11)\.(20[0-9]{2}))|(((0[1-9]|1[0-9]|2[0-8])\.02\.(20[0-9]{2})))|(29\.02\.20(0[048]|[2468][048]|[13579][26]))))/;
//|| !dateRegex.test(birth_date)

  // if (!birth_date ) {
  //   res.status(400).send({ data: { message: "Birth date is empty or not valid!" } });
  //   return;
  // }

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
  // console.log("Received request for login...");

  // console.log({ reg: req.body });
  const login = req.body.login;
  const password = req.body.password;

  if (!login || !password) {
    res.status(400).send({ data: { message: "Login or password is empty!" } });
    return;
  }

  const user = await usersDbService.findByLogin(login);
  // console.log({ user });

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

  const token = jwtService.sign({   id: user.id,
    role: user.role,
    login: user.login });
  await usersDbService.updateAccessToken(user.id, token);

  const decodedPayload = jwtService.decode(token);

  console.log({ decodedPayload });

  res.status(200).send({ data: { message: "Success!", acessToken: token, login: login, role: user.role, id: user.id } });
});

app.get("/categories", async (req: any, res: Response) => {
  const result = await categoriesDbService.getCategoriesHierarchy();
  console.log(result);
  res.status(200).send({
    data: {
      Categories: result
    }
  })
})

app.get("/product/:id", async (req: any, res: Response) => {
  const id = req.params.id;
  const product = await productsDbService.getById(id);
  if (!product) {
    res.status(404).json({ data: { message: "Product not found!" } });
    return;
  }

  res.status(200).send({
    data: {
      Product: product
    }
  })
});

app.get("/products/popular", async (req: any, res: Response) => {
  const popularProducts = await productsDbService.getPopularProducts();
  res.status(200).json(popularProducts);
});
app.get("/products", async (req: any, res: Response) => {
  const products = await productsDbService.getAllWithCategories({});

  console.log({ products: (products) });
  res.status(200).send({
    data: {
      Products: categorizedProducts(products)
    }
  })
})

app.post("/product",
  upload.single('image'),  // Multer middleware,
  // checkAdmin,
  async (req: any, res: Response) => {
    const body = req.body;
    const title = body.title;
    const file = req.file;
    const price = body.price;
    const category_id = body.category_id;

    console.log({ body: req.body })

    if (!title) {
      res.status(400).send({ data: { message: "Title is empty!" } });
      return;
    }

    // if (!image) {
    //   res.status(400).send({ data: { message: "Image is empty!" } });
    //   return;
    // }
    if (!price) {
      res.status(400).send({ data: { message: "Price is empty!" } });
      return;
    }
    if (!category_id) {
      res.status(400).send({ data: { message: "Category id is empty!" } });
      return;
    }

    // Image validation
    if (!file) {
      res.status(400).send({ data: { message: "Image is required!" } });
    }

    // Verify actual file content
    const type = await fileTypeFromFile(file.path);
    if (!type || !type.mime.startsWith('image/')) {
      fs.unlinkSync(file.path); // Remove invalid file
      res.status(400).json({ data: { message: 'Invalid image content!' } });
    }

    // Create product with image path
    const imagePath = `/assets/${file.filename}`;
    const product = await productsDbService.createProduct({
      title,
      price,
      category_id,
      image: imagePath
    });

    res.status(201).json({
      data: {
        message: "Product created successfully!",
        product: {
          ...product,
          image: imagePath
        }
      }
    })
  })

app.put("/product/:id",
  // checkAdmin,
  upload.single('image'),
  async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { title, price, category_id } = req.body;
      const file = req.file;

      // Validate product ID
      if (!id) {
        res.status(400).json({ data: { message: "Product ID is required!" } });
        return;
      }

      // Validate required fields
      if (!title) {
        res.status(400).json({ data: { message: "Title is required!" } });
        return;
      }
      if (!price) {
        res.status(400).json({ data: { message: "Price is required!" } });
        return;
      }
      if (!category_id) {
        res.status(400).json({ data: { message: "Category ID is required!" } });
        return;
      }

      // Check if product exists
      const existingProduct = await productsDbService.getById(id);
      if (!existingProduct) {
        res.status(404).json({ data: { message: "Product not found!" } });
        return;
      }

      let imagePath = existingProduct.image;

      // Handle new image if provided
      if (file) {
        // Validate image content
        const type = await fileTypeFromFile(file.path);
        if (!type || !type.mime.startsWith('image/')) {
          fs.unlinkSync(file.path);  // Remove invalid file
          res.status(400).json({ data: { message: 'Invalid image format!' } });
          return;
        }

        // Delete old image if exists
        if (existingProduct.image) {
          const oldImagePath = path.join(__dirname, '..', 'public', existingProduct.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        imagePath = `/assets/${file.filename}`;
      }

      // Update product
      const updatedProduct = await productsDbService.updateById(id, {
        title,
        price,
        category_id,
        image: imagePath
      });

      res.status(200).json({
        data: {
          message: "Product updated successfully!",
          product: updatedProduct
        }
      });
      return;
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ data: { message: "Internal server error" } });
      return;
    }
  }
);

app.delete("/product/:productId",
  // checkAdmin,
  async (req: any, res: Response) => {
    const productId = req.params.productId;

    if (!productId) {
      res.status(400).send({ data: { message: "Product id is required!" } });
      return;
    }
    const product = await productsDbService.getById(productId);

    if (!product) {
      res.status(400).send({ data: { message: "Product does not exist!" } });
      return;
    }

    const Product = await productsDbService.deleteById(Number(productId))

    res.status(201).json({
      data: {
        message: "Product deleted successfully!",
        Product,
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
app.get("/masters/:id", async (req: any, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ data: { message: "Master ID is required!" } });
    }

    const master = await mastersDbService.getById(Number(id));
    if (!master) {
      return res.status(404).json({ data: { message: "Master not found!" } });
    }

    res.status(200).json({ data: { master } });
  } catch (error) {
    console.error("Error fetching master:", error);
    res.status(500).json({ data: { message: "Internal server error" } });
  }
});

app.get("/orders", async (req: any, res: Response) => {
  const orders = await ordersDbService.getAllOrders();

  console.log({ orders })

  res.status(200).send({
    data: {
      Orders: orders
    }
  })
})

app.get("/orders/:userId", async (req: any, res: Response) => {
  const userId = req.params.userId;
  const orders = await ordersDbService.getOrdersByUserId(userId);

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

app.post("/orders/edit",
  // checkAdmin,
  async (req: any, res: Response) => {
    const user_id = req.body.user_id;
    // const phone_number = req.body.phone_number;
    const order_date = req.body.order_date;
    const comment = req.body.comment;

    if (!user_id || !(await usersDbService.getById(user_id))) {
      res.status(400).send({ data: { message: "User id is empty or not found!" } });
      return;
    }

    console.log({ order_date })

    if (order_date && (new Date(order_date) < new Date())) {
      console.log({
        order_date: new Date(order_date),
        today: new Date()
      })
      res.status(400).send({ data: { message: "Order date cannot be in the past!" } });
      return;
    }

    try {
      const order = await ordersDbService.updateOrder(user_id, { order_date, comment });

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

app.delete("/orders/:orderId",
  // checkAdmin,
  async (req: any, res: Response) => {
    const orderId = req.params.orderId;

    if (!orderId) {
      res.status(400).send({ data: { message: "Order id is required!" } });
      return;
    }
    const order = await ordersDbService.getById(orderId)

    if (!order) {
      res.status(400).send({ data: { message: "Order does not exist!" } });
      return;
    }

    const Order = await ordersDbService.deleteOrder(Number(orderId));

    res.status(201).json({
      data: {
        message: "Order deleted successfully!",
        Order,
      }
    })
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
