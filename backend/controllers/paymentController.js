import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Add your secret key to .env

export const createPaymentIntent = async (req, res) => {
  const { amount, bookingId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: "lkr", // Change to your currency
      metadata: { bookingId },
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
