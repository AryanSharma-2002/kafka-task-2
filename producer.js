// const connection = require("./db");
const { Kafka } = require("kafkajs");

const produceCustomerRequest = async (mobile, invoice_date) => {
  const kafka = new Kafka({
    clientId: "customer1",
    brokers: ["127.0.0.1:9092"],
  });
  const producer = kafka.producer();
  await producer.connect();
  console.log("producer connected");
  const customerData = {
    mobile: mobile,
    invoice_date: invoice_date,
    lastPartition: 0,
  };
  const producedData = await producer.send({
    topic: "customerTopic1",
    messages: [
      {
        value: JSON.stringify(customerData),
        partition: 0,
      },
    ],
  });

  console.log(`Produced data ${JSON.stringify(producedData)}`);
  await producer.disconnect();
};
module.exports = { produceCustomerRequest };
