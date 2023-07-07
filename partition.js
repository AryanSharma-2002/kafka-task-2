const { Kafka } = require("kafkajs");
const createPartitions = async () => {
  const kafka = new Kafka({
    clientId: "customer1",
    brokers: ["127.0.0.1:9092"],
  });
  const admin = kafka.admin();
  await admin.connect();

  await admin.createTopics({
    topics: [
      {
        topic: "customerTopic1",
        numPartitions: 3,
      },
    ],
  });
  console.log("3 partitions created");
  await admin.disconnect();
};
createPartitions();
module.exports = { createPartitions };
