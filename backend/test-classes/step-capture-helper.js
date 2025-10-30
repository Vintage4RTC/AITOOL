import { writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

export class StepCaptureHelper {
  constructor(testTitle, runId) {
    this.testTitle = testTitle;
    this.runId = runId;
    this.stepCounter = 0;
    this.steps = [];
    this.screenshotsDir = join(process.cwd(), 'test-results', 'step-screenshots', runId);
    this.ensureScreenshotsDir();
  }

  ensureScreenshotsDir() {
    mkdirSync(this.screenshotsDir, { recursive: true });
  }

  startStep(stepTitle, category = 'action') {
    this.stepCounter++;
    const step = {
      stepNumber: this.stepCounter,
      title: stepTitle,
      category: category,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      status: 'running',
      screenshot: null,
      screenshotUrl: null
    };
    
    this.steps.push(step);
    console.log(`📸 Step ${this.stepCounter} started: ${stepTitle}`);
    
    return step;
  }

  endStep(stepNumber, status = 'passed', screenshotPath = null) {
    const step = this.steps.find(s => s.stepNumber === stepNumber);
    if (!step) return;

    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.status = status;
    
    if (screenshotPath) {
      step.screenshot = screenshotPath;
      step.screenshotUrl = `/screenshots/step-screenshots/${this.runId}/${screenshotPath.split('/').pop()}`;
    }
    
    console.log(`📸 Step ${stepNumber} completed: ${step.title} (${status}) - ${step.duration}ms`);
    return step;
  }

  captureScreenshot(stepNumber, page) {
    return new Promise(async (resolve, reject) => {
      try {
        const step = this.steps.find(s => s.stepNumber === stepNumber);
        if (!step) {
          reject(new Error(`Step ${stepNumber} not found`));
          return;
        }

        const filename = `${this.testTitle.replace(/[^a-zA-Z0-9]/g, '_')}_step_${stepNumber}_${Date.now()}.png`;
        const screenshotPath = join(this.screenshotsDir, filename);
        
        // Capture screenshot using Playwright page
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        
        step.screenshot = screenshotPath;
        step.screenshotUrl = `/screenshots/step-screenshots/${this.runId}/${filename}`;
        
        console.log(`📸 Screenshot captured for step ${stepNumber}: ${filename}`);
        resolve(step);
      } catch (error) {
        console.error(`❌ Failed to capture screenshot for step ${stepNumber}:`, error.message);
        reject(error);
      }
    });
  }

  getStepData() {
    return {
      testTitle: this.testTitle,
      runId: this.runId,
      totalSteps: this.steps.length,
      steps: this.steps,
      screenshotsDir: this.screenshotsDir
    };
  }

  saveResults() {
    const resultsPath = join(this.screenshotsDir, 'step-results.json');
    const results = this.getStepData();
    writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    return results;
  }

  // Method to get all screenshot files from the directory
  getAllScreenshots() {
    try {
      const files = readdirSync(this.screenshotsDir);
      return files.filter(file => file.endsWith('.png'));
    } catch (error) {
      console.error('Error reading screenshots directory:', error.message);
      return [];
    }
  }

  // Method to get screenshot metadata
  getScreenshotMetadata(filename) {
    try {
      const filePath = join(this.screenshotsDir, filename);
      const stats = statSync(filePath);
      return {
        filename: filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      console.error(`Error getting metadata for ${filename}:`, error.message);
      return null;
    }
  }
}

// Helper function to create a step capture instance
export function createStepCapture(testTitle, runId) {
  return new StepCaptureHelper(testTitle, runId);
}

// Helper function to inject step capture into test files
export function injectStepCapture(testCode, testTitle, runId) {
  const stepCaptureCode = `
import { createStepCapture } from './step-capture-helper.js';

// Initialize step capture for this test
const stepCapture = createStepCapture('${testTitle}', '${runId}');

// Helper function to capture step
async function captureStep(stepTitle, action, page) {
  const step = stepCapture.startStep(stepTitle);
  try {
    await action();
    await stepCapture.captureScreenshot(step.stepNumber, page);
    stepCapture.endStep(step.stepNumber, 'passed');
    return step;
  } catch (error) {
    stepCapture.endStep(step.stepNumber, 'failed');
    throw error;
  }
}
`;

  return stepCaptureCode + '\n\n' + testCode;
}
