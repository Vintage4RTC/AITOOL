import express from 'express';
import { JenkinsService } from '../services/jenkinsService.js';

const router = express.Router();
const jenkinsService = new JenkinsService();

/**
 * @route GET /api/jenkins/test-connection
 * @desc Test Jenkins connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const result = await jenkinsService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Jenkins connection test failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/jenkins/jobs
 * @desc Get all Jenkins jobs
 */
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await jenkinsService.getAllJobs();
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Failed to get Jenkins jobs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/jenkins/jobs/:jobName
 * @desc Get details of a specific Jenkins job
 */
router.get('/jobs/:jobName', async (req, res) => {
  try {
    const { jobName } = req.params;
    const jobDetails = await jenkinsService.getJobDetails(jobName);
    res.json({ success: true, job: jobDetails });
  } catch (error) {
    console.error('Failed to get job details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/jenkins/jobs/:jobName/build
 * @desc Trigger a Jenkins build
 */
router.post('/jobs/:jobName/build', async (req, res) => {
  try {
    const { jobName } = req.params;
    const { parameters } = req.body;
    const result = await jenkinsService.triggerBuild(jobName, parameters);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Failed to trigger build:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/jenkins/jobs/:jobName/builds/:buildNumber
 * @desc Get details of a specific build
 */
router.get('/jobs/:jobName/builds/:buildNumber', async (req, res) => {
  try {
    const { jobName, buildNumber } = req.params;
    const buildDetails = await jenkinsService.getBuildDetails(jobName, buildNumber);
    res.json({ success: true, build: buildDetails });
  } catch (error) {
    console.error('Failed to get build details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/jenkins/jobs/:jobName/builds/:buildNumber/console
 * @desc Get console output of a build
 */
router.get('/jobs/:jobName/builds/:buildNumber/console', async (req, res) => {
  try {
    const { jobName, buildNumber } = req.params;
    const console = await jenkinsService.getBuildConsoleOutput(jobName, buildNumber);
    res.json({ success: true, console });
  } catch (error) {
    console.error('Failed to get console output:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/jenkins/jobs/:jobName/builds/:buildNumber/status
 * @desc Get status of a build
 */
router.get('/jobs/:jobName/builds/:buildNumber/status', async (req, res) => {
  try {
    const { jobName, buildNumber } = req.params;
    const status = await jenkinsService.getBuildStatus(jobName, buildNumber);
    res.json({ success: true, status });
  } catch (error) {
    console.error('Failed to get build status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/jenkins/queue
 * @desc Get Jenkins build queue
 */
router.get('/queue', async (req, res) => {
  try {
    const queue = await jenkinsService.getQueueStatus();
    res.json({ success: true, queue });
  } catch (error) {
    console.error('Failed to get queue status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

