const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const { produceCustomerRequest } = require("./producer.js");
const { query } = require("./query");
const { addInvoice } = require("./addInvoice.js");
const { consumeCustomerRequest } = require("./consumer.js");

// const { produceRequests } = require("./producer");
// const { consumeRequests } = require("./consumer");

const makeKafkaRequest = async (mobile, invoice_date) => {
  try {
  } catch (error) {
    console.log("error while making kafka request", error.message);
    throw error;
  }
};
app.post("/api/invoice", async (req, res) => {
  try {
    const { invoice_date, mobile } = req.body;
    const searchMobile = `SELECT * FROM customers WHERE mobile=${mobile} `;
    const response = await query(searchMobile);
    console.log("customer  ", response);

    if (response.length == 0) {
      // means that customer does not exist we have to make a request in kafka to make a customer
      try {
        await produceCustomerRequest(mobile, invoice_date);
        await consumeCustomerRequest();
        res.status(200).send("called after making kafka request");
        return;
      } catch (error) {
        console.log("some other message ", error.message);
      }
      return;
    }
    await addInvoice(invoice_date, mobile);
    res.status(200).send("called");
  } catch (error) {
    console.log("error", error.message);
  }
});

// const kafkaWork = async () => {
//   try {
//     await produceRequests();
//     console.log("\n\n");
//     await consumeRequests();
//   } catch (err) {
//     console.log("error while working with kafka", err.message);
//   }
// };
// app.get("/api/kafka", async (req, res) => {
//   kafkaWork();
//   res.status(200).send("called");
// });
app.listen(5000, () => {
  console.log("listening at 5000");
});
