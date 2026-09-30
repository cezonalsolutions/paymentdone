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


/* =========================================
   SERVER TEST
========================================= */

app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "CEZOO Payment Server Running",
    upi: UPI_ID
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


    /* =====================================
       VALIDATE AMOUNT
    ===================================== */

    if (
      !Number.isFinite(amount) ||
      amount < 1
    ) {

      return res.status(400).json({
        success: false,
        error: "Invalid amount"
      });

    }


    /* =====================================
       CREATE PAYMENT ID
    ===================================== */

    const paymentId =
      "CZ" +
      Date.now() +
      crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();


    /* =====================================
       MINIMUM UPI PARAMETERS

       pn removed
       tn removed
       tr removed

       Only:
       pa = UPI ID
       am = Amount
       cu = Currency
    ===================================== */

    const params = new URLSearchParams();

    params.set(
      "pa",
      UPI_ID
    );

    params.set(
      "am",
      amount.toFixed(2)
    );

    params.set(
      "cu",
      "INR"
    );


    /* =====================================
       STANDARD UPI URL
    ===================================== */

    const paymentUrl =
      `upi://pay?${params.toString()}`;


    /* =====================================
       LOG
    ===================================== */

    console.log(
      "Payment created:",
      {
        paymentId,
        amount: amount.toFixed(2),
        app: paymentApp,
        upi: UPI_ID,
        paymentUrl
      }
    );


    /* =====================================
       SEND TO FRONTEND
    ===================================== */

    return res.json({

      success: true,

      paymentId: paymentId,

      amount: amount.toFixed(2),

      app: paymentApp,

      paymentUrl: paymentUrl

    });

  }

  catch (error) {

    console.error(
      "Payment create error:",
      error
    );


    return res.status(500).json({

      success: false,

      error: "Unable to create payment"

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
