import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase, pool } from "./db";
import open from 'open';

const app = express();

// CORS configuration based on environment
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '*');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', corsOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MoneyWise API',
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DB_HOST ? 'Connected' : 'Not configured'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MoneyWise API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Graceful shutdown function
function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  // Close server
  if (server) {
    server.close((err: Error | undefined) => {
      if (err) {
        console.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('✅ HTTP server closed');
      
      // Close database connection
      if (pool) {
        pool.end()
          .then(() => {
            console.log('✅ Database connection closed');
            console.log('👋 Graceful shutdown completed');
            process.exit(0);
          })
          .catch((err: Error) => {
            console.error('❌ Error closing database connection:', err);
            process.exit(1);
          });
      } else {
        console.log('✅ No database connection to close');
        console.log('👋 Graceful shutdown completed');
        process.exit(0);
      }
    });
  } else {
    console.log('✅ No server to close');
    process.exit(0);
  }
}

let server: any;

(async () => {
  // Initialize database first
  await initializeDatabase();
  
  server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // For Railway production, we're serving API only
    // Frontend is served separately from Hostinger
    log("Running in production mode - API only");
  }

  // Use Railway's PORT environment variable in production, fallback to 5000 for development
  const port = process.env.PORT || 5000;
  const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

  server.listen(Number(port), host, () => {
    log(`serving on ${host}:${port}`);
    const backendUrl = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
    
    console.log('\n🚀 MoneyWise Development Server Started!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Backend API: ${backendUrl}`);
    console.log(`🌐 Frontend: http://localhost:3000`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Click the URLs above to open in your browser!');
    console.log('📝 Backend: API endpoints and server logic');
    console.log('🎨 Frontend: React app with Vite dev server\n');
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
})();
