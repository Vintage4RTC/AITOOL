import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import TestParserService from '../services/testParserService.js';
import NotificationService from '../services/notificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const testParserService = new TestParserService();
const notificationService = new NotificationService();

/**
 * @route GET /api/automation/list-tests
 * @desc Get list of available test files for a product
 */
router.get('/list-tests', (req, res) => {
  const { product } = req.query;
  
  if (!product) {
    return res.status(400).json({ error: 'product query parameter is required' });
  }

  try {
    const testClassesDir = path.join(__dirname, '../../test-classes', product);
    
    if (!fs.existsSync(testClassesDir)) {
      return res.json({ tests: [] });
    }

    const files = fs.readdirSync(testClassesDir)
      .filter(file => file.endsWith('.spec.js'))
      .map(file => ({
        name: file.replace('.spec.js', ''),
        path: `${product}/${file}`
      }));

    res.json({ tests: files });
  } catch (error) {
    console.error('Error listing tests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/automation/save-test-class
 * @desc Save a new test class file
 */
router.post('/save-test-class', async (req, res) => {
  try {
    const { product, testName, code } = req.body;

    if (!product || !testName || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'product, testName, and code are required' 
      });
    }

    // Validate product name
    const validProducts = ['lavinia', 'passage-prep', 'teaching-channel'];
    if (!validProducts.includes(product)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid product. Must be one of: ${validProducts.join(', ')}` 
      });
    }

    // Sanitize test name
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9-_]/g, '');
    if (!sanitizedTestName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid test name' 
      });
    }

    const testClassesDir = path.join(__dirname, '../../test-classes');
    const productDir = path.join(testClassesDir, product);
    const filePath = path.join(productDir, `${sanitizedTestName}.spec.js`);

    // Create product directory if it doesn't exist
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return res.status(409).json({ 
        success: false, 
        error: 'Test class with this name already exists' 
      });
    }

    // Validate code contains Playwright test structure
    if (!code.includes('import') || !code.includes('test(')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code must be a valid Playwright test file' 
      });
    }

    // Write the file
    fs.writeFileSync(filePath, code, 'utf8');

    // Send WebSocket notification
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'test-class-added',
            product,
            testClass: sanitizedTestName
          }));
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Test class saved successfully',
      testClass: sanitizedTestName,
      filePath: `${product}/${sanitizedTestName}.spec.js`
    });

  } catch (error) {
    console.error('Error saving test class:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/automation/get-test-class
 * @desc Get the content of a test class file
 */
router.get('/get-test-class', (req, res) => {
  try {
    const { product, testName } = req.query;

    if (!product || !testName) {
      return res.status(400).json({ 
        success: false, 
        error: 'product and testName are required' 
      });
    }

    const testClassesDir = path.join(__dirname, '../../test-classes');
    const filePath = path.join(testClassesDir, product, `${testName}.spec.js`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Test class not found' 
      });
    }

    const content = fs.readFileSync(filePath, 'utf8');

    res.json({ 
      success: true, 
      content,
      testClass: testName,
      product
    });

  } catch (error) {
    console.error('Error getting test class:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/automation/update-test-class
 * @desc Update an existing test class file
 */
router.post('/update-test-class', async (req, res) => {
  try {
    const { product, testName, code } = req.body;

    if (!product || !testName || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'product, testName, and code are required' 
      });
    }

    // Validate code contains Playwright test structure
    if (!code.includes('import') || !code.includes('test(')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code must be a valid Playwright test file' 
      });
    }

    const testClassesDir = path.join(__dirname, '../../test-classes');
    const filePath = path.join(testClassesDir, product, `${testName}.spec.js`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Test class not found' 
      });
    }

    // Update the file
    fs.writeFileSync(filePath, code, 'utf8');

    // Send WebSocket notification
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'test-class-updated',
            product,
            testClass: testName
          }));
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Test class updated successfully',
      testClass: testName
    });

  } catch (error) {
    console.error('Error updating test class:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/automation/test-cases
 * @desc Get all test cases from all products
 */
router.get('/test-cases', async (req, res) => {
  try {
    const testCases = testParserService.getAllTestCases();
    res.json({ success: true, testCases });
  } catch (error) {
    console.error('❌ Failed to get test cases:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/automation/test-cases/:product
 * @desc Get test cases for a specific product
 */
router.get('/test-cases/:product', async (req, res) => {
  try {
    const { product } = req.params;
    const testCases = testParserService.getProductTestCases(product);
    res.json({ success: true, testCases });
  } catch (error) {
    console.error('❌ Failed to get product test cases:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @route GET /api/automation/test-cases/:product/:testClass/:testId
 * @desc Get a specific test case
 */
router.get('/test-cases/:product/:testClass/:testId', async (req, res) => {
  try {
    const { product, testClass, testId } = req.params;
    const testCase = testParserService.getTestCase(product, testClass, testId);
    
    if (!testCase) {
      return res.status(404).json({ 
        success: false, 
        error: 'Test case not found' 
      });
    }
    
    res.json({ success: true, testCase });
  } catch (error) {
    console.error('❌ Failed to get test case:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

