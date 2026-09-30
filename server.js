require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;


/* =========================================
   UPI DETAILS
========================================= */

const UPI_ID = "9502877675-3@ybl";
const PAYEE_NAME = "CEZOO";


/* =========================================
   SERVER TEST
========================================= */

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "CEZOO Payment Server Running"
  });

});


/* =========================================
   CREATE PAYMENT
========================================= */

app.post("/api/payment/create", (req, res) => {

  try {

    const amount = Number(req.body.amount);

    const paymentApp =
      String(req.body.app || "upi");


    /* Validate amount */

    if (
      !Number.isFinite(amount) ||
      amount < 1
    ) {

      return res.status(400).json({
        success: false,
        error: "Invalid amount"
      });

    }


    /* Generate payment ID */

    const paymentId =
      "CZ" +
      Date.now() +
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();


    /* =====================================
       STANDARD UPI PARAMETERS
    ===================================== */

    const params =
      new URLSearchParams();

    params.set(
      "pa",
      UPI_ID
    );

    params.set(
      "pn",
      PAYEE_NAME
    );

    params.set(
      "am",
      amount.toFixed(2)
    );

    params.set(
      "cu",
      "INR"
    );


    /*
      IMPORTANT

      No package=com.phonepe.app
      No intent://
      No PhonePe forcing

      Android receives normal UPI URL.
    */

    const paymentUrl =
      `upi://pay?${params.toString()}`;


    console.log(
      "Payment created:",
      {
        paymentId,
        amount: amount.toFixed(2),
        app: paymentApp,
        upi: UPI_ID
      }
    );


    /* =====================================
       RESPONSE
    ===================================== */

    return res.json({

      success: true,

      paymentId:
        paymentId,

      amount:
        amount.toFixed(2),

      app:
        paymentApp,

      paymentUrl:
        paymentUrl

    });

  }

  catch (error) {

    console.error(
      "Payment create error:",
      error
    );


    return res.status(500).json({

      success: false,

      error:
        "Unable to create payment"

    });

  }

});


/* =========================================
   404
========================================= */

app.use((req, res) => {

  res.status(404).json({
    success: false,
    error: "Route not found"
  });

});


/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {

  console.log(
    `CEZOO Payment Server running on ${PORT}`
  );

});
