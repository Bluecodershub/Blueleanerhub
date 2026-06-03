/**
 * Prometheus Metrics Middleware
 * Exposes /metrics endpoint for Prometheus scraping
 */
import { Request, Response, NextFunction } from 'express'
import client from 'prom-client'
import logger from '../utils/logger'

// Create a Registry to register the metrics
const register = new client.Registry()

// Add default metrics (GC, memory, CPU, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
})

// HTTP Request duration histogram
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
})
register.registerMetric(httpRequestDuration)

// HTTP Request counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})
register.registerMetric(httpRequestsTotal)

// Active users gauge
const activeUsersTotal = new client.Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users',
})
register.registerMetric(activeUsersTotal)

// Database connection gauge
const dbConnectionsTotal = new client.Gauge({
  name: 'db_connections_total',
  help: 'Number of database connections',
  labelNames: ['state'],
})
register.registerMetric(dbConnectionsTotal)

// Error rate counter
const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code', 'error_type'],
})
register.registerMetric(httpErrorsTotal)

/**
 * Middleware to track HTTP metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  const route = req.route?.path || req.path

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    const statusCode = res.statusCode.toString()

    httpRequestDuration.observe(
      { method: req.method, route, status_code: statusCode },
      duration
    )

    httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode })

    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error'
      httpErrorsTotal.inc({ method: req.method, route, status_code: statusCode, error_type: errorType })
    }
  })

  next()
}

/**
 * Metrics endpoint handler
 */
export const metricsEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (error) {
    logger.error('Failed to collect metrics:', error)
    res.status(500).end('Failed to collect metrics')
  }
}

/**
 * Update active users count
 */
export const updateActiveUsers = (count: number): void => {
  activeUsersTotal.set(count)
}

/**
 * Update database connections
 */
export const updateDbConnections = (state: 'active' | 'idle' | 'failed', count: number): void => {
  dbConnectionsTotal.set({ state }, count)
}

export { register }
