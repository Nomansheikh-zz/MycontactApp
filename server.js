const express = require("express");
const dotenv = require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const connectDB = require("./config/dbConnection");
const app = express();
const port = process.env.PORT || 5000;
console.log(process.env.PORT);
debugger;
const cluster = require('cluster');
const os = require('os');
const cpuCount = os.cpus().length;
console.log(`Number of CPU cores: ${cpuCount}`);

// Prefer the master to distribute connections in round-robin (when supported).
// This directs the master to distribute incoming connections evenly across workers.
if (cluster.isPrimary) {
    // Try to enable round-robin scheduling in the master.
    if (typeof cluster.SCHED_RR !== 'undefined') {
        cluster.schedulingPolicy = cluster.SCHED_RR;
    }

    console.log(`Primary ${process.pid} is running`);
    // Fork workers.
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }

    // If a worker dies, log and replace it so we maintain the worker pool.
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died (code: ${code}, signal: ${signal}), spawning a new worker`);
        cluster.fork();
    });
} else {
        // Each worker should create its own DB connection and start the server.
        connectDB();

        // Register middlewares before listening
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Per-request PID logger and header to help verify which worker handled a request
        app.use((req, res, next) => {
            console.log(`[pid:${process.pid}] ${req.method} ${req.originalUrl}`);
            res.setHeader('X-Worker-Pid', process.pid);
            next();
        });

        app.use(errorHandler);
        app.use('/api/contracts', require('./routes/contractRoutes'));
        app.use('/api/users', require('./routes/userRoutes'));
        app.get('/debug/pid', (req, res) => {
            res.json({ pid: process.pid, workerId: (cluster.worker ? cluster.worker.id : null) });
        });

        app.listen(port, () => {
            console.log(`Worker ${process.pid} listening on port ${port}`);
        });
}



