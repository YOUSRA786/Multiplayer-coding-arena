const { Worker } = require("bullmq");
const submissionService = require("../services/submissionService");


const getRedisConnectionOptions = () => {
  let host = process.env.REDIS_HOST || "127.0.0.1";
  let port = parseInt(process.env.REDIS_PORT) || 6379;
  let password = undefined;

  let rawUri = process.env.REDIS_URI;
  if (rawUri) {
    const cleanUri = rawUri.replace('@HOST:', '@');
    try {
      const parsed = new URL(cleanUri);
      host = parsed.hostname;
      port = parseInt(parsed.port) || 6379;
      if (parsed.password) {
        password = decodeURIComponent(parsed.password);
      }
    } catch (e) {
      console.warn("Failed to parse REDIS_URI in BullMQ Worker config:", e.message);
    }
  }
  return { host, port, password };
};

const worker = new Worker(
  "submissionQueue",
  async job => {
    console.log(`[Worker] Processing submission job ${job.id} for user ${job.data.username}`);
    const result = await submissionService.handleSubmission(job.data);
    return result;
  },
  {
    connection: getRedisConnectionOptions()
  }
);
worker.on('ready', () => {
  console.log('[Worker] Connected to Redis and ready for jobs');
});

worker.on('error', (err) => {
  console.error('[Worker] Error:', err.message);
});
worker.on("completed", job => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

module.exports = worker;