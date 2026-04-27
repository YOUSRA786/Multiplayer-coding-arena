const { Queue } = require("bullmq");

const submissionQueue = new Queue("submissionQueue", {
 connection: {
   host: "127.0.0.1",
   port: 6379
 }
});

module.exports = submissionQueue;