import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import BDDService from '../services/bddService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const bddService = new BDDService();

/**
 * @route POST /api/bdd/convert
 * @desc Convert BDD text to Playwright code
 */
router.post('/convert', async (req, res) => {
  try {
    const { bddText, testName, useAI = true } = req.body;

    if (!bddText) {
      return res.status(400).json({ 
        success: false, 
        error: 'bddText is required' 
      });
    }

    const result = await bddService.convertBDDToPlaywright(bddText, { 
      useAI, 
      testName 
    });

    res.json(result);
  } catch (error) {
    console.error('BDD conversion error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/bdd/save
 * @desc Save BDD test with both BDD and Playwright versions
 */
router.post('/save', async (req, res) => {
  try {
    const { product, testName, bddText, playwrightCode } = req.body;

    if (!product || !testName || !bddText || !playwrightCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'product, testName, bddText, and playwrightCode are required' 
      });
    }

    // Validate product
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
    const playwrightPath = path.join(productDir, `${sanitizedTestName}.spec.js`);
    const bddPath = path.join(productDir, `${sanitizedTestName}.feature`);

    // Create product directory if needed
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    // Check if files already exist
    if (fs.existsSync(playwrightPath) || fs.existsSync(bddPath)) {
      return res.status(409).json({ 
        success: false, 
        error: 'Test with this name already exists' 
      });
    }

    // Save both versions
    fs.writeFileSync(playwrightPath, playwrightCode, 'utf8');
    fs.writeFileSync(bddPath, bddText, 'utf8');

    // Send WebSocket notification
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'bdd-test-added',
            product,
            testClass: sanitizedTestName
          }));
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'BDD test saved successfully',
      testClass: sanitizedTestName,
      files: {
        playwright: `${product}/${sanitizedTestName}.spec.js`,
        bdd: `${product}/${sanitizedTestName}.feature`
      }
    });

  } catch (error) {
    console.error('Error saving BDD test:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/bdd/get-bdd/:product/:testName
 * @desc Get the BDD version of a test
 */
router.get('/get-bdd/:product/:testName', (req, res) => {
  try {
    const { product, testName } = req.params;

    const testClassesDir = path.join(__dirname, '../../test-classes');
    const bddPath = path.join(testClassesDir, product, `${testName}.feature`);

    if (!fs.existsSync(bddPath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'BDD file not found for this test' 
      });
    }

    const content = fs.readFileSync(bddPath, 'utf8');

    res.json({ 
      success: true, 
      bddText: content,
      testName,
      product
    });

  } catch (error) {
    console.error('Error getting BDD:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route POST /api/bdd/update
 * @desc Update both BDD and Playwright versions
 */
router.post('/update', async (req, res) => {
  try {
    const { product, testName, bddText, playwrightCode } = req.body;

    if (!product || !testName || !bddText || !playwrightCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'product, testName, bddText, and playwrightCode are required' 
      });
    }

    const testClassesDir = path.join(__dirname, '../../test-classes');
    const productDir = path.join(testClassesDir, product);
    const playwrightPath = path.join(productDir, `${testName}.spec.js`);
    const bddPath = path.join(productDir, `${testName}.feature`);

    // Update both files
    fs.writeFileSync(playwrightPath, playwrightCode, 'utf8');
    fs.writeFileSync(bddPath, bddText, 'utf8');

    // Send WebSocket notification
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'bdd-test-updated',
            product,
            testClass: testName
          }));
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'BDD test updated successfully'
    });

  } catch (error) {
    console.error('Error updating BDD test:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;

