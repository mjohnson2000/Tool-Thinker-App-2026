// Health check script for monitoring
// This can be called by PM2 or external monitoring services

const http = require('http')

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000,
}

const request = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed')
    process.exit(0)
  } else {
    console.error(`Health check failed with status: ${res.statusCode}`)
    process.exit(1)
  }
})

request.on('error', (error) => {
  console.error(`Health check error: ${error.message}`)
  process.exit(1)
})

request.on('timeout', () => {
  console.error('Health check timeout')
  request.destroy()
  process.exit(1)
})

request.end()

