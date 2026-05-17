const { Worker } = require("bullmq");
const submissionService = require("../services/submissionService");
const connectDB = require("../config/db");
const dotenv = require("dotenv");

dotenv.config();

// Connect to MongoDB since worker needs DB access to query problem & save submission
connectDB();

const worker = new Worker(
  "submissionQueue",
  async job => {
    console.log(`[Worker] Processing submission job ${job.id} for user ${job.data.username}`);
    const result = await submissionService.handleSubmission(job.data);
    return result;
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT) || 6379
    }
  }
);

worker.on("completed", job => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

module.exports = worker;