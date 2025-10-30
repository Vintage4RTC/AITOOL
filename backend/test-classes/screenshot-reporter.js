import fs from 'fs';
import path from 'path';

class ScreenshotReporter {
  constructor(options = {}) {
    this.screenshots = [];
    this.testResults = {};
    this.outputDir = options.outputDir || './test-results';
    this.screenshotDir = path.join(this.outputDir, 'screenshots');
  }

  onBegin(config, suite) {
    // Ensure screenshot directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  onTestBegin(test) {
    this.testResults[test.title] = {
      screenshots: [],
      steps: [],
      startTime: Date.now()
    };
  }

  onStepBegin(test, result, step) {
    if (step.title) {
      this.testResults[test.title].steps.push({
        title: step.title,
        status: 'running',
        startTime: Date.now(),
        screenshot: null
      });
    }
  }

  onStepEnd(test, result, step) {
    const testResult = this.testResults[test.title];
    if (testResult && step.title) {
      const stepIndex = testResult.steps.findIndex(s => s.title === step.title);
      if (stepIndex !== -1) {
        testResult.steps[stepIndex].status = step.error ? 'failed' : 'passed';
        testResult.steps[stepIndex].endTime = Date.now();
        
        // Capture screenshot for this step
        if (result.attachments) {
          const screenshotAttachment = result.attachments.find(att => att.name === 'screenshot');
          if (screenshotAttachment) {
            const screenshotPath = path.join(this.screenshotDir, `${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_${stepIndex}_${Date.now()}.png`);
            
            // Copy screenshot to our directory
            if (fs.existsSync(screenshotAttachment.path)) {
              fs.copyFileSync(screenshotAttachment.path, screenshotPath);
              testResult.steps[stepIndex].screenshot = screenshotPath;
              testResult.screenshots.push(screenshotPath);
            }
          }
        }
      }
    }
  }

  onTestEnd(test, result) {
    const testResult = this.testResults[test.title];
    if (testResult) {
      testResult.endTime = Date.now();
      testResult.status = result.status;
      testResult.error = result.error;
    }
  }

  onEnd(result) {
    // Save test results with screenshots
    const resultsPath = path.join(this.outputDir, 'test-results-with-screenshots.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
      summary: {
        total: result.total,
        passed: result.passed,
        failed: result.failed,
        duration: result.duration
      },
      tests: this.testResults
    }, null, 2));
    
    console.log(`📸 Screenshot reporter: Captured ${this.screenshots.length} screenshots`);
    console.log(`📊 Results saved to: ${resultsPath}`);
  }

  getScreenshotsForTest(testTitle) {
    return this.testResults[testTitle]?.screenshots || [];
  }

  getStepsForTest(testTitle) {
    return this.testResults[testTitle]?.steps || [];
  }
}

export default ScreenshotReporter;
