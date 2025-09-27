import dotenv from "dotenv";
import Stripe from "stripe";

// Make sure environment variables are loaded
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("ERROR: Missing Stripe secret key. Check your .env file.");
}

const stripe = new Stripe(stripeSecretKey);

export default stripe;
