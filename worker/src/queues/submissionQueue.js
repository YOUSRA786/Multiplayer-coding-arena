const { Queue } = require("bullmq");

const submissionQueue = new Queue("submissionQueue", {
  connection: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT) || 6379
  }
});

module.exports = submissionQueue;