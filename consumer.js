// const connection = require("./db");
const { Kafka } = require("kafkajs");
const { query } = require("./query.js");
const { addInvoice } = require("./addInvoice.js");

const kafka = new Kafka({
  clientId: "customers",
  brokers: ["127.0.0.1:9092"],
});

const generateCustomerEntry = async (mobile) => {
  try {
    const insertQuery = `INSERT INTO customers(mobile) VALUES('${mobile}')`;
    const response = await query(insertQuery);
    console.log("customer created");
  } catch (error) {
    console.log("error generating customer table ", error.message);
  }
};

const generateDeadEntry = async (mobile, invoice_date) => {
  try {
    console.log(mobile, invoice_date);
    console.log("putting into dead queue");
    const insertQuery = `INSERT INTO dead_table (mobile,invoice_date) VALUES('${mobile}','${invoice_date}')`;
    const response = await query(insertQuery);
  } catch (error) {
    console.log("error generating dead table ", error.message);
  }
};

const consumeCustomerRequest = async () => {
  try {
    const consumer = kafka.consumer({ groupId: "newGroup1" });
    await consumer.connect();
    await consumer.subscribe({
      topic: "customerTopic1",
      fromBeginning: true,
    });

    console.log("consumer connected");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const request = JSON.parse(message.value.toString());
        try {
          console.log(topic, partition, request);

          await consumer.commitOffsets([
            { topic, partition, offset: message.offset },
          ]);

          const randNo = Math.random();
          console.log("random no. ", randNo);
          if (!(randNo >= 0.2 && randNo <= 0.3)) {
            throw new Error("consumer table request failed");
          }
          await generateCustomerEntry(request.mobile);
          await addInvoice(request.invoice_date, request.mobile);
        } catch (error) {
          // produce it to other partition
          console.log(error.message);
          if (request.lastPartition == 2) {
            await generateDeadEntry(request.mobile, request.invoice_date);
          } else {
            const producer = kafka.producer();
            await producer.connect();
            console.log(
              "now customer request produced to ",
              request.lastPartition + 1
            );
            const customerData = {
              mobile: request.mobile,
              invoice_date: request.invoice_date,
              lastPartition: request.lastPartition + 1,
            };
            await producer.send({
              topic: "customerTopic1",
              messages: [
                {
                  value: JSON.stringify(customerData),
                  partition: request.lastPartition + 1,
                },
              ],
            });
            await producer.disconnect();
          }
        }
      },
    });
  } catch (error) {
    console.log("error while consuming", error.message);
  }
};

// consumeCustomerRequest();
module.exports = { consumeCustomerRequest };
