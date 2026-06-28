/**
 * BallKnowledge - AI Image Generation & Card Sync Stress Tester
 * 
 * Fired concurrent mock payload requests to `/api/generate-viral-card`
 * to test rate-limits, latency, fallback logic, and DB connection pooling.
 * 
 * Usage:
 *   node scripts/stress_test.js <endpoint_url> <concurrency_level> <total_requests>
 * 
 * Example:
 *   node scripts/stress_test.js http://localhost:3000 5 15
 */

const http = require('http');
const https = require('https');

const args = process.argv.slice(2);
const baseUrl = args[0] || 'http://localhost:3000';
const concurrency = parseInt(args[1] || '3', 10);
const totalRequests = parseInt(args[2] || '10', 10);

console.log(`==================================================`);
console.log(`🚀 BALLKNOWLEDGE AI GENERATOR STRESS TESTER`);
console.log(`==================================================`);
console.log(`Target Endpoint : ${baseUrl}/api/generate-viral-card`);
console.log(`Concurrency Limit: ${concurrency} parallel requests`);
console.log(`Total Requests   : ${totalRequests}`);
console.log(`==================================================\n`);

const payload = JSON.stringify({
  username: "STRESS_TESTER",
  favoriteNation: "Brazil",
  overallRating: 88,
  predictionRating: 90,
  hotTakeRating: 85,
  managerRating: 89,
  roastScore: 78,
  verdict: "STRESS TESTING VARDOM",
  charge: "HIGH CONCURRENCY READ/WRITE",
  sentence: "Sentenced to evaluate server response load logs."
});

let completed = 0;
let successes = 0;
let fallbacks = 0;
let failures = 0;
let totalLatency = 0;

function postRequest() {
  return new Promise((resolve) => {
    const start = Date.now();
    const parsedUrl = new URL(`${baseUrl}/api/generate-viral-card`);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 30000 // 30 second timeout
    };

    const client = parsedUrl.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        const latency = Date.now() - start;
        totalLatency += latency;
        completed++;

        if (res.statusCode === 200) {
          successes++;
          try {
            const data = JSON.parse(body);
            if (data.aiImageUrl && data.aiImageUrl.includes('toty_bg_premium.webp')) {
              fallbacks++;
              console.log(`[PASS] Req #${completed} completed in ${latency}ms (FALLBACK TEMPLATE ACTIVATED)`);
            } else {
              console.log(`[PASS] Req #${completed} completed in ${latency}ms (REAL OPENROUTER IMAGE GENERATED)`);
            }
          } catch (e) {
            console.log(`[PASS] Req #${completed} completed in ${latency}ms (JSON parse failed)`);
          }
        } else {
          failures++;
          console.log(`[FAIL] Req #${completed} failed with Status ${res.statusCode} in ${latency}ms: ${body.substring(0, 100)}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      const latency = Date.now() - start;
      completed++;
      failures++;
      console.log(`[ERROR] Req #${completed} error: ${e.message} in ${latency}ms`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  const queue = Array.from({ length: totalRequests });
  const workers = Array.from({ length: concurrency }).map(async () => {
    while (queue.length > 0) {
      queue.pop();
      await postRequest();
    }
  });

  const startTime = Date.now();
  await Promise.all(workers);
  const duration = Date.now() - startTime;

  console.log(`\n==================================================`);
  console.log(`🏁 TEST COMPLETED`);
  console.log(`==================================================`);
  console.log(`Total Duration      : ${(duration / 1000).toFixed(2)} seconds`);
  console.log(`Successful Requests : ${successes}`);
  console.log(`- Real Gen Successes: ${successes - fallbacks}`);
  console.log(`- Fallback Templated: ${fallbacks}`);
  console.log(`Failed Requests     : ${failures}`);
  console.log(`Success Rate        : ${((successes / totalRequests) * 100).toFixed(1)}%`);
  console.log(`Average Latency     : ${(totalLatency / totalRequests).toFixed(0)}ms`);
  console.log(`==================================================`);
}

run();
