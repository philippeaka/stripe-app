import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Outlet } from "@remix-run/react";

const stripePromise = loadStripe(
  "pk_test_51O8mkED3O1ra6yUNVoyIU1VL1T5oQD5WvMwCQTyVrYFt8rlomKtNzIesrFIhvJ1GAbqxTI9a3buKAkSqFoXH8SJ900ROHRyZ6H",
  {
    locale: "fr",
  }
);

const options = {
  mode: "setup" as StripeElementsOptions["mode"],
  currency: "usd",
};

const Payment = () => {
  return (
    <Elements stripe={stripePromise} options={options}>
      <h1>Make Payment</h1>
      <Outlet />
    </Elements>
  );
};

export default Payment;
