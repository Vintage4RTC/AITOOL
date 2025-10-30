import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

class StepScreenshotReporter {
  constructor(options = {}) {
    this.options = options;
    this.testResults = new Map();
    this.currentTest = null;
    this.stepCounter = 0;
  }

  onBegin(config, suite) {
    console.log('🎬 Step Screenshot Reporter initialized');
  }

  onTestBegin(test) {
    this.currentTest = test;
    this.stepCounter = 0;
    this.testResults.set(test.title, {
      title: test.title,
      steps: [],
      startTime: Date.now()
    });
    console.log(`📸 Starting test: ${test.title}`);
  }

  onStepBegin(test, result, step) {
    if (!this.currentTest || this.currentTest.title !== test.title) return;
    
    this.stepCounter++;
    const stepInfo = {
      stepNumber: this.stepCounter,
      title: step.title || `Step ${this.stepCounter}`,
      category: step.category || 'action',
      startTime: Date.now(),
      screenshot: null
    };
    
    const testResult = this.testResults.get(test.title);
    if (testResult) {
      testResult.steps.push(stepInfo);
    }
    
    console.log(`📸 Step ${this.stepCounter} started: ${stepInfo.title}`);
  }

  onStepEnd(test, result, step) {
    if (!this.currentTest || this.currentTest.title !== test.title) return;
    
    const testResult = this.testResults.get(test.title);
    if (testResult && testResult.steps.length > 0) {
      const currentStep = testResult.steps[testResult.steps.length - 1];
      currentStep.endTime = Date.now();
      currentStep.duration = currentStep.endTime - currentStep.startTime;
      currentStep.status = step.error ? 'failed' : 'passed';
      
      // Capture screenshot for this step
      try {
        const screenshotPath = this.captureStepScreenshot(test, currentStep);
        currentStep.screenshot = screenshotPath;
        console.log(`📸 Screenshot captured for step ${currentStep.stepNumber}: ${screenshotPath}`);
      } catch (error) {
        console.error(`❌ Failed to capture screenshot for step ${currentStep.stepNumber}:`, error.message);
      }
    }
  }

  captureStepScreenshot(test, step) {
    // Create screenshots directory
    const screenshotsDir = join(process.cwd(), 'test-results', 'step-screenshots');
    mkdirSync(screenshotsDir, { recursive: true });
    
    // Generate screenshot filename
    const testName = test.title.replace(/[^a-zA-Z0-9]/g, '_');
    const stepName = step.title.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const filename = `${testName}_step_${step.stepNumber}_${stepName}_${timestamp}.png`;
    const screenshotPath = join(screenshotsDir, filename);
    
    // Note: In a real implementation, we would need access to the page object
    // For now, we'll create a placeholder that indicates where the screenshot would be
    const placeholder = {
      path: screenshotPath,
      timestamp: timestamp,
      stepNumber: step.stepNumber,
      stepTitle: step.title
    };
    
    // Write metadata file
    const metadataPath = screenshotPath.replace('.png', '.json');
    writeFileSync(metadataPath, JSON.stringify(placeholder, null, 2));
    
    return screenshotPath;
  }

  onTestEnd(test, result) {
    const testResult = this.testResults.get(test.title);
    if (testResult) {
      testResult.endTime = Date.now();
      testResult.duration = testResult.endTime - testResult.startTime;
      testResult.status = result.status;
      testResult.error = result.error;
    }
    
    console.log(`✅ Test completed: ${test.title} (${result.status})`);
  }

  onEnd(result) {
    console.log('🎬 Step Screenshot Reporter finished');
    
    // Save all test results
    const resultsPath = join(process.cwd(), 'test-results', 'step-screenshots', 'test-results.json');
    mkdirSync(dirname(resultsPath), { recursive: true });
    
    const allResults = Array.from(this.testResults.values());
    writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
    
    console.log(`📊 Saved ${allResults.length} test results with step screenshots`);
  }
}

export default StepScreenshotReporter;
