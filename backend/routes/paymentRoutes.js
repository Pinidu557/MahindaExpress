import express from "express";
import {
  createPaymentIntent,
  handleBankTransfer,
  upload,
} from "../controllers/paymentController.js";
const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/bank-transfer", upload.single("receipt"), handleBankTransfer);

export default router;
