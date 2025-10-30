import express from 'express';
import JiraService from '../services/jiraService.js';

const router = express.Router();
const jiraService = new JiraService();

/**
 * @route GET /api/jira/test-connection
 * @desc Test Jira connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const result = await jiraService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Jira connection test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/jira/tickets/:username
 * @desc Get Jira tickets assigned to a user
 */
router.get('/tickets/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const tickets = await jiraService.getAssignedTickets(username);
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Failed to fetch Jira tickets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/jira/ticket/:ticketKey
 * @desc Get details of a specific Jira ticket
 */
router.get('/ticket/:ticketKey', async (req, res) => {
  try {
    const { ticketKey } = req.params;
    const ticket = await jiraService.getTicketDetails(ticketKey);
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Failed to fetch ticket details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/jira/generate-test-cases
 * @desc Generate test cases from Jira ticket
 */
router.post('/generate-test-cases', async (req, res) => {
  try {
    const { ticketKey, ticketDescription } = req.body;
    const testCases = await jiraService.generateTestCases(ticketKey, ticketDescription);
    res.json({ success: true, testCases });
  } catch (error) {
    console.error('Failed to generate test cases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/jira/generate-edge-cases
 * @desc Generate edge case test cases from Jira ticket
 */
router.post('/generate-edge-cases', async (req, res) => {
  try {
    const { ticketKey, ticketDescription, existingTestCases } = req.body;
    const edgeCases = await jiraService.generateEdgeCases(ticketKey, ticketDescription, existingTestCases);
    res.json({ success: true, edgeCases });
  } catch (error) {
    console.error('Failed to generate edge cases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/jira/generate-playwright
 * @desc Generate Playwright script from test cases
 */
router.post('/generate-playwright', async (req, res) => {
  try {
    const { testCases, ticketKey } = req.body;
    const script = await jiraService.generatePlaywrightScript(testCases, ticketKey);
    res.json({ success: true, script });
  } catch (error) {
    console.error('Failed to generate Playwright script:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route POST /api/jira/publish-test-cases
 * @desc Publish test cases to Jira
 */
router.post('/publish-test-cases', async (req, res) => {
  try {
    const { testCases, ticketKey, folderPath } = req.body;
    const result = await jiraService.publishTestCases(testCases, ticketKey, folderPath);
    res.json(result);
  } catch (error) {
    console.error('Failed to publish test cases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

