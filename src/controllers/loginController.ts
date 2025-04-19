import { NextFunction, Response } from "express";
import catchAsync from "../utils/catchAsync.js";


export class PupeteerController {
  login = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
      console.log("Received request for login...");

      res.status(200).json({ status: 'Ok' });
    }
  );
}

export default new PupeteerController();
