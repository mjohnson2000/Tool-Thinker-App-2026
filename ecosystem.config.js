// PM2 Ecosystem Configuration
// PM2 is a process manager for Node.js applications
// Install: npm install -g pm2
// Start: pm2 start ecosystem.config.js
// Save: pm2 save
// Setup startup: pm2 startup

module.exports = {
  apps: [
    {
      name: 'tool-thinker',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1, // Use 1 instance for now, increase for load balancing
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto-restart settings
      autorestart: true,
      watch: false, // Set to false for production
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced settings
      min_uptime: '10s', // Minimum uptime before considering app stable
      max_restarts: 10, // Max restarts in 1 minute
      restart_delay: 4000, // Wait 4 seconds before restarting
      
      // Health monitoring
      kill_timeout: 5000, // Time to wait before force kill
      listen_timeout: 10000, // Time to wait for app to start listening
      
      // Environment variables (will be loaded from .env)
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}

