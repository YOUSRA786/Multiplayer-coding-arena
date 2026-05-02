const { createClient } = require("redis");

const client = createClient();

client.on("error", err => {
  // Silence Redis errors to prevent log spamming
});

client.connect();

module.exports = client;