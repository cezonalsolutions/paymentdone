require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Your bank-issued UPI VPA
const UPI_ID = "cezonalsolutionspvtltd@ybl";
const PAYEE_NAME = "Cezonal Solutions Pvt Ltd";

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CEZOO Payment Server Running"
  });
});


app.post("/api/payment/create", (req, res) => {

  try {

    const amount = Number(req.body.amount);
    const paymentApp = String(req.body.app || "upi");

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount"
      });
    }

    const paymentId =
      "CZ" +
      Date.now() +
      crypto.randomBytes(3).toString("hex").toUpperCase();

    /*
      Standard UPI URI.

      IMPORTANT:
      This initiates payment only.
      It does NOT prove that payment succeeded.
    */

    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: PAYEE_NAME,
      am: amount.toFixed(2),
      cu: "INR"
    });

    const upiUrl =
      `upi://pay?${params.toString()}`;

    let paymentUrl = upiUrl;

    /*
      Android Chrome app-specific intents.

      If browser/device doesn't support the
      requested app intent, use normal UPI instead.
    */

    if (paymentApp === "phonepe") {

      paymentUrl =
        `intent://pay?${params.toString()}` +
        `#Intent;` +
        `scheme=upi;` +
        `package=com.phonepe.app;` +
        `end`;

    }

    else if (paymentApp === "paytm") {

      paymentUrl =
        `intent://pay?${params.toString()}` +
        `#Intent;` +
        `scheme=upi;` +
        `package=net.one97.paytm;` +
        `end`;

    }

    else if (paymentApp === "gpay") {

      paymentUrl =
        `intent://pay?${params.toString()}` +
        `#Intent;` +
        `scheme=upi;` +
        `package=com.google.android.apps.nbu.paisa.user;` +
        `end`;

    }

    return res.json({
      success: true,
      paymentId,
      amount: amount.toFixed(2),
      app: paymentApp,
      paymentUrl,
      fallbackUrl: upiUrl
    });

  }

  catch (error) {

    console.error("Payment create error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to create payment"
    });

  }

});


app.listen(PORT, () => {
  console.log(`CEZOO Payment Server running on ${PORT}`);
});
