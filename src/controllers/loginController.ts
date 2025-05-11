import { NextFunction, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import productsDbService from "../services/db/productsDbService.js";


export class PupeteerController {
  login = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      console.log("Received request for login...");

      const product = await productsDbService.getWithCategory(1)


      res.status(200).json({ status: 'Ok', data: product });
    }
  );
}

export default new PupeteerController();
