import {
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  ClickResolveDetails,
  StripeExpressCheckoutElementOptions,
  StripeExpressCheckoutElementClickEvent,
} from "@stripe/stripe-js";
import { LoaderFunction, json } from "@remix-run/cloudflare";
import { stripeServer } from "./../utils/stripe.server";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  try {
    const customer = "cus_id";
    const setupIntent = await stripeServer.setupIntents.create({
      customer: customer,
      automatic_payment_methods: { enabled: true },
    });

    return json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    return json({ error: error?.message }, { status: 500 });
  }
};

const Index = () => {
  const elements = useElements();
  const stripe = useStripe();
  const { clientSecret } = useLoaderData<typeof loader>();
  if (!elements) return null;

  elements.update({
    mode: "setup",
    currency: "usd",
  });
  const onClick = ({ resolve }: StripeExpressCheckoutElementClickEvent) => {
    const options: ClickResolveDetails = {
      applePay: {
        recurringPaymentRequest: {
          paymentDescription: "Monthly Recurring Charge",
          managementURL: "https://helloworld.js",
          billingAgreement:
            "You'll be billed $10.00 every month for the next 12 months",
          regularBilling: {
            amount: 1000, // 10 USD
            label: "Payment forfait",
            recurringPaymentStartDate: new Date(2024, 7, 29),
            recurringPaymentIntervalUnit: "month",
            recurringPaymentIntervalCount: 1,
          },
        },
      },
    };

    try {
      resolve(options);
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Confirm the SetupIntent using the details collected by the Express Checkout Element
    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: "https://stripeo.pages.dev",
        },
        redirect: "if_required",
      });

      if (error) {
        console.log("error", error);
      }

      if (setupIntent) {
        console.log("SetupIntent confirmed:", setupIntent.id);
        console.log("setupIntent id", setupIntent);
        // Handle the setupIntent or redirect to a confirmation page
      }
    } catch (error) {
      console.error("Error confirming SetupIntent:", error);
    }
  };

  const options: StripeExpressCheckoutElementOptions = {
    wallets: {
      applePay: "always",
      googlePay: "never",
    },
    buttonType: {
      applePay: "subscribe",
    },
    paymentMethods: {
      link: "never",
    },
  };

  return (
    <ExpressCheckoutElement
      onClick={onClick}
      options={options}
      onConfirm={handleSubmit}
    />
  );
};

export default Index;
