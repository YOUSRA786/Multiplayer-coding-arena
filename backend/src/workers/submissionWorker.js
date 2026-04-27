const { Worker } = require("bullmq");
const axios = require("axios");

new Worker(
 "submissionQueue",
 async job => {
   const data = job.data;

   // run executor
   const result = await axios.post(
     "http://localhost:5001/execute",
     data
   );

   console.log(result.data);

   // save DB
   // update leaderboard
   // emit socket result
 },
 {
   connection: {
     host: "127.0.0.1",
     port: 6379
   }
 }
);