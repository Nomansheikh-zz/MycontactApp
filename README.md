mycontracts-backend

This repository is an Express + MongoDB REST API for managing contracts and users. It uses Node's built-in cluster module to fork worker processes so the app can use multiple CPU cores. Each worker opens its own DB connection and handles incoming HTTP requests.

---

Project structure (key files)

- server.js - application entry. Sets up clustering, forks workers, registers Express middleware and routes. Each worker calls connectDB() and starts the server.
- config/dbConnection.js - mongoose connection wrapper.
- routes/contractRoutes.js, routes/userRoutes.js - route definitions.
- controllers/contractController.js, controllers/userController.js - controller logic for routes.
- model/contractModel.js, model/userModel.js - mongoose schemas.
- middleware/errorHandler.js, middleware/validateTokenHandler.js - global error handler and JWT validation middleware.
- package.json - scripts and dependencies.

How clustering is implemented

- server.js checks cluster.isPrimary (master). The primary forks N workers where N = number of CPU cores.
- Primary attempts to enable round-robin scheduling (cluster.SCHED_RR) so incoming connections are distributed across workers.
- Each worker:
  - calls connectDB() to create its own mongoose connection
  - registers Express middleware and routes
  - starts listening on the configured port
- The primary listens for exit events and respawns workers so the pool is maintained.

Note: Because each worker runs the same startup code, some logs (dotenv, DB connect messages) will appear once per worker. This is expected.

Per-request PID logging and how to observe it

The code registers a small middleware in each worker that does two things for every request:

- Console log: [pid:<process.pid>] <METHOD> <URL> — useful for checking which worker handled a request.
- Response header: X-Worker-Pid is set to the worker's process.pid so clients can inspect which worker served the request.

Example console output for a request:

[pid:12345] GET /api/contracts

And the response contains the header:

X-Worker-Pid: 12345

How to run (Windows PowerShell)

1) Ensure you have a .env file with at least these variables:

    PORT=5001
    CONNECTION_STRING=mongodb://<user>:<pass>@localhost:27017/<dbname>
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=1d

2) Install dependencies (if not already):

    PowerShell: npm install

3) Start in production mode (forks workers):

    PowerShell: npm start

4) Start in dev mode (single process with nodemon):

    PowerShell: npm run dev

Note: npm run dev will still run server.js as-is; because clustering is in server.js you'll still get worker forking even under nodemon. If you want a single-process dev experience, temporarily comment out the cluster block in server.js.

Test which worker handled a request (PowerShell)

1) Simple request and view X-Worker-Pid header:

    PowerShell:
    $r = Invoke-WebRequest -Uri http://localhost:5001/debug/pid -UseBasicParsing
    $r.Content | ConvertFrom-Json
    # or show header
    $r.Headers['X-Worker-Pid']

2) Repeated requests to observe distribution (may show different PIDs if round-robin is effective):

    PowerShell:
    1..10 | ForEach-Object { $r = Invoke-WebRequest -Uri http://localhost:5001/api/contracts -UseBasicParsing; "$($_): $($r.Headers['X-Worker-Pid'])" ; Start-Sleep -Milliseconds 200 }

3) Alternatively, use curl (Git for Windows or WSL):

    PowerShell: curl -I http://localhost:5001/api/contracts

Look for the X-Worker-Pid header in the response.

Issues / Observations & Recommended Fixes

1) controllers/userController.js — syntax bug on login:

   Current line (problem):
   res.status(200).json({message: "User logged in successfully",token});s

   The trailing 's' will cause a syntax error. Remove it:
   res.status(200).json({message: "User logged in successfully", token});

2) JWT verify payload mismatch in middleware/validateTokenHandler.js:

   - When you sign the token in loginUser, you used jwt.sign({username, email, id: user._id}, ...) (i.e. top-level fields).
   - In the verify callback you reference decoded.user which doesn't exist.

   Update the verify handling to use the correct shape, e.g. req.user = decoded; and update how you read req.user elsewhere.

3) validateTokenHandler silent path when no Authorization header is present:

   - If no header is provided the middleware currently does nothing (it won't call next() or return an error). Make sure you return a 401 when missing.

4) Consider using structured logging (winston or pino) and include pid in the metadata. This will make it easier to aggregate logs from multiple workers and query by PID.

5) Startup noise from dotenv and DB connect messages per worker is expected. To reduce noise, limit developer tips to the primary process only or adjust dotenv config.

Optional improvements

- Use morgan with a custom token to include process.pid in access logs.
- Replace console.log with pino or winston and add a small helper to include pid on every log line.
- Add a health check endpoint and a readiness probe if deploying behind Kubernetes.

Next steps I can help with

- Apply the bug fixes above (I can create a small patch).
- Add morgan and a debug/pid endpoint (already exists; I can move or harden it).
- Add unit tests for key controllers and a small script to validate worker distribution.

If you'd like me to apply any of the fixes or add the suggested improvements, tell me which ones and I'll patch the code and run a quick smoke test.

Generated on: 2025-10-07
