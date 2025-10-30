import cluster from 'cluster';
import os from 'os';
import process from 'process';
import express from 'express';
import v1Router from './router/v1.js';

const app = express();
const PORT = process.env.PORT || 3500;

app.use("/api/v1", v1Router);

// Get number of CPU cores available to the process
const numCPUs = os.availableParallelism ? os.availableParallelism() : os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Number of workers to spawn: ${numCPUs}`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker if it dies
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });

} else {
  // Worker processes share the same server port
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} running server on port ${PORT}`);
  });
}
