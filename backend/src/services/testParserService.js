import fs from 'fs'
import path from 'path'

class TestParserService {
  constructor() {
    this.testClassesDir = path.join(process.cwd(), 'test-classes')
  }

  /**
   * Parse a Playwright test file and extract individual test cases
   */
  parseTestFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const testCases = []
      
      // Regular expressions to match test cases
      const testRegex = /test\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g
      const describeRegex = /test\.describe\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g
      
      let match
      
      // Extract test.describe blocks
      const describeBlocks = []
      while ((match = describeRegex.exec(content)) !== null) {
        describeBlocks.push({
          type: 'describe',
          title: match[1],
          line: content.substring(0, match.index).split('\n').length
        })
      }
      
      // Extract individual test cases
      while ((match = testRegex.exec(content)) !== null) {
        const testTitle = match[1]
        const lineNumber = content.substring(0, match.index).split('\n').length
        
        // Determine test type based on title
        let testType = 'functional'
        let priority = 'medium'
        let status = 'not_run'
        
        if (testTitle.toLowerCase().includes('smoke')) {
          testType = 'smoke'
          priority = 'high'
        } else if (testTitle.toLowerCase().includes('regression')) {
          testType = 'regression'
          priority = 'high'
        } else if (testTitle.toLowerCase().includes('integration')) {
          testType = 'integration'
        }
        
        // Extract test ID if present (e.g., LAV-001, DP-123)
        const testIdMatch = testTitle.match(/([A-Z]{2,}-\d+)/)
        const testId = testIdMatch ? testIdMatch[1] : null
        
        testCases.push({
          id: testId || `TC-${testCases.length + 1}`,
          title: testTitle,
          type: testType,
          priority,
          status,
          lineNumber,
          description: this.extractTestDescription(content, match.index),
          steps: this.extractTestSteps(content, match.index)
        })
      }
      
      return {
        describeBlocks,
        testCases
      }
    } catch (error) {
      console.error('Error parsing test file:', error.message)
      return {
        describeBlocks: [],
        testCases: []
      }
    }
  }

  /**
   * Extract test description from comments above the test
   */
  extractTestDescription(content, testStartIndex) {
    const lines = content.substring(0, testStartIndex).split('\n').reverse()
    let description = ''
    
    for (const line of lines.slice(0, 10)) { // Look at last 10 lines before test
      const trimmed = line.trim()
      if (trimmed.startsWith('//') && !trimmed.includes('import') && !trimmed.includes('const')) {
        description = trimmed.replace(/^\/\/\s*/, '') + ' ' + description
      } else if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        break
      }
    }
    
    return description.trim() || 'Automated test case'
  }

  /**
   * Extract test steps from the test function body
   */
  extractTestSteps(content, testStartIndex) {
    const testEndIndex = this.findTestEnd(content, testStartIndex)
    const testBody = content.substring(testStartIndex, testEndIndex)
    
    const steps = []
    const lines = testBody.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Extract step comments
      if (trimmed.startsWith('// Step')) {
        steps.push(trimmed.replace(/^\/\/\s*/, ''))
      }
      // Extract expect statements
      else if (trimmed.includes('expect(') && trimmed.includes(').toBe')) {
        const expectMatch = trimmed.match(/expect\([^)]+\)\.toBe([^(]+)/)
        if (expectMatch) {
          steps.push(`Verify: ${expectMatch[0]}`)
        }
      }
      // Extract click actions
      else if (trimmed.includes('.click()')) {
        const clickMatch = trimmed.match(/(getBy|locator|getByRole)\([^)]+\)\.click/)
        if (clickMatch) {
          steps.push(`Click: ${clickMatch[0]}`)
        }
      }
      // Extract fill actions
      else if (trimmed.includes('.fill(')) {
        const fillMatch = trimmed.match(/\.fill\([^)]+\)/)
        if (fillMatch) {
          steps.push(`Fill: ${fillMatch[0]}`)
        }
      }
    }
    
    return steps.length > 0 ? steps : ['Execute test steps']
  }

  /**
   * Find the end of a test function
   */
  findTestEnd(content, startIndex) {
    let braceCount = 0
    let inFunction = false
    let i = startIndex
    
    while (i < content.length) {
      const char = content[i]
      
      if (char === '{') {
        braceCount++
        inFunction = true
      } else if (char === '}') {
        braceCount--
        if (inFunction && braceCount === 0) {
          return i + 1
        }
      }
      i++
    }
    
    return content.length
  }

  /**
   * Get all test cases for a specific product
   */
  getProductTestCases(product) {
    try {
      const productDir = path.join(this.testClassesDir, product)
      
      if (!fs.existsSync(productDir)) {
        return []
      }
      
      const files = fs.readdirSync(productDir).filter(file => file.endsWith('.spec.js'))
      const allTestCases = []
      
      for (const file of files) {
        const filePath = path.join(productDir, file)
        const testFile = path.parse(file)
        
        const parsed = this.parseTestFile(filePath)
        
        // Extract base name without .spec extension
        const baseName = testFile.name.endsWith('.spec') 
          ? testFile.name.slice(0, -5) // Remove '.spec'
          : testFile.name

        // Add file-level information
        const fileInfo = {
          fileName: file,
          filePath: filePath,
          testClass: baseName,
          describeBlocks: parsed.describeBlocks,
          testCases: parsed.testCases.map(testCase => ({
            ...testCase,
            file: file,
            testClass: baseName,
            fullPath: `${product}/${baseName}/${testCase.id}`
          }))
        }
        
        allTestCases.push(fileInfo)
      }
      
      return allTestCases
    } catch (error) {
      console.error('Error getting product test cases:', error.message)
      return []
    }
  }

  /**
   * Get all test cases across all products
   */
  getAllTestCases() {
    const products = ['lavinia', 'passage-prep', 'teaching-channel']
    const allTestCases = {}
    
    for (const product of products) {
      allTestCases[product] = this.getProductTestCases(product)
    }
    
    return allTestCases
  }

  /**
   * Get a specific test case by its full path
   */
  getTestCase(product, testClass, testId) {
    const productTestCases = this.getProductTestCases(product)
    
    for (const fileInfo of productTestCases) {
      if (fileInfo.testClass === testClass) {
        const testCase = fileInfo.testCases.find(tc => tc.id === testId)
        if (testCase) {
          return {
            ...testCase,
            fileInfo
          }
        }
      }
    }
    
    return null
  }
}

export default TestParserService
