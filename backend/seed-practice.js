const mongoose = require('mongoose');
require('dotenv').config();
const Problem = require('./src/models/Problem');
const { generateRandomProblem } = require('./src/services/aiProblemGenerator');

const DSA_TOPICS = [
  'arrays', 'strings', 'linked-lists', 'stacks-queues', 'trees', 
  'graphs', 'dynamic-programming', 'sorting', 'recursion', 
  'hashing', 'greedy', 'bit-manipulation'
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB. Starting seed...');

  for (const topic of DSA_TOPICS) {
    console.log(`\n--- Seeding Topic: ${topic} ---`);
    
    const target = { easy: 3, medium: 4, hard: 3 };
    
    for (const diff of ['easy', 'medium', 'hard']) {
      const existingCount = await Problem.countDocuments({ topic, difficulty: diff });
      const needed = target[diff] - existingCount;
      
      if (needed <= 0) {
        console.log(`  [OK] ${diff}: ${existingCount} questions already exist.`);
        continue;
      }

      console.log(`  [GEN] Generating ${needed} ${diff} questions...`);
      for (let i = 0; i < needed; i++) {
        try {
          const exclude = (await Problem.find({ topic }).select('title')).map(p => p.title);
          const data = await generateRandomProblem(exclude, topic, diff);
          data.topic = topic; // Ensure topic is set
          await Problem.create(data);
          console.log(`    ✅ Created: ${data.title} (${diff})`);
          // Small delay to avoid aggressive rate limits
          await new Promise(r => setTimeout(r, 2000));
        } catch (err) {
          console.error(`    ❌ Failed to generate ${diff} question:`, err.message);
          break; // Stop if we hit a hard limit
        }
      }
    }
  }

  console.log('\nSeed process finished.');
  process.exit(0);
}

seed();
