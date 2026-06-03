/**
 * BullMQ Queue Setup for Background Jobs
 */
import { Queue, Worker, Job } from 'bullmq'
import logger from '../utils/logger'

// Connection config for BullMQ (uses existing Redis)
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
}

// ─── Queues ─────────────────────────────────────────────────────────────────

/** Certificate PDF generation queue */
export const certificateQueue = new Queue('certificate-pdf', { connection })

/** Email sending queue */
export const emailQueue = new Queue('email', { connection })

/** Analytics aggregation queue */
export const analyticsQueue = new Queue('analytics', { connection })

/** Data export queue */
export const exportQueue = new Queue('export', { connection })

// ─── Workers ────────────────────────────────────────────────────────────────

// Certificate PDF Worker
const certificateWorker = new Worker(
  'certificate-pdf',
  async (job: Job) => {
    logger.info(`[Queue] Processing certificate PDF job ${job.id}`, { certId: job.data.certId })
    // TODO: Implement actual PDF generation with pdf-lib + sharp
    // 1. Fetch certificate data
    // 2. Generate PDF
    // 3. Upload to S3
    // 4. Update certificate.pdf_url in DB
    logger.info(`[Queue] Certificate PDF job ${job.id} completed`)
  },
  { connection }
)

// Email Worker
const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    logger.info(`[Queue] Processing email job ${job.id}`, { to: job.data.to, subject: job.data.subject })
    // TODO: Implement actual email sending with SendGrid/Nodemailer
    logger.info(`[Queue] Email job ${job.id} completed`)
  },
  { connection }
)

// Analytics Worker
const analyticsWorker = new Worker(
  'analytics',
  async (job: Job) => {
    logger.info(`[Queue] Processing analytics job ${job.id}`)
    // TODO: Implement analytics aggregation
    logger.info(`[Queue] Analytics job ${job.id} completed`)
  },
  { connection }
)

// Export Worker
const exportWorker = new Worker(
  'export',
  async (job: Job) => {
    logger.info(`[Queue] Processing export job ${job.id}`, { type: job.data.type })
    // TODO: Implement data export
    logger.info(`[Queue] Export job ${job.id} completed`)
  },
  { connection }
)

// ─── Event Handlers ─────────────────────────────────────────────────────────

function setupWorkerEvents(worker: Worker): void {
  worker.on('completed', (job: Job) => {
    logger.info(`[Queue] Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`[Queue] Job ${job?.id} failed:`, err)
  })
}

setupWorkerEvents(certificateWorker)
setupWorkerEvents(emailWorker)
setupWorkerEvents(analyticsWorker)
setupWorkerEvents(exportWorker)

// ─── Graceful Shutdown ──────────────────────────────────────────────────────

export async function closeQueues(): Promise<void> {
  await certificateQueue.close()
  await emailQueue.close()
  await analyticsQueue.close()
  await exportQueue.close()

  await certificateWorker.close()
  await emailWorker.close()
  await analyticsWorker.close()
  await exportWorker.close()

  logger.info('[Queue] All queues and workers closed')
}
