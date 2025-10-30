const API_BASE = (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787'
console.log('🔧 API_BASE configured as:', API_BASE)

async function request(path, options={}){
  try {
    console.log('🌐 API Request:', `${API_BASE}${path}`, options)
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
      ...options
    })
    console.log('📡 API Response:', res.status, res.statusText)
    if(!res.ok){
      const text = await res.text().catch(()=> '')
      console.error('❌ API Error Response:', text)
      throw new Error(`HTTP ${res.status}: ${text}`)
    }
    const ct = res.headers.get('content-type') || ''
    if(ct.includes('application/json')) return res.json()
    return res.text()
  } catch (error) {
    console.error('🚨 API Request failed:', error)
    if (error.message.includes('Failed to fetch')) {
      console.error('❌ Network error - likely CORS or connection issue')
      throw new Error(`Cannot connect to backend server. Please ensure the backend is running on ${API_BASE}. Check the console for more details.`)
    }
    throw error
  }
}

export const api = {
  // Health
  health(){ return request('/api/health') },

  // Jira
  jiraTest(){ return request('/api/jira/test-connection') },
  jiraTickets(username){ return request(`/api/jira/tickets/${encodeURIComponent(username)}`) },
  jiraTicket(key){ return request(`/api/jira/ticket/${encodeURIComponent(key)}`) },
  jiraGenerateTestCases(payload){ return request('/api/jira/generate-test-cases', { method: 'POST', body: JSON.stringify(payload) }) },
  jiraGeneratePlaywright(payload){ return request('/api/jira/generate-playwright', { method: 'POST', body: JSON.stringify(payload) }) },
  jiraGenerateEdgeCases(payload){ return request('/api/jira/generate-edge-cases', { method: 'POST', body: JSON.stringify(payload) }) },
  jiraRunPlaywright(payload){ return request('/api/jira/run-playwright', { method: 'POST', body: JSON.stringify(payload) }) },
  jiraRunExistingPlaywright(payload){ return request('/api/jira/run-existing-playwright', { method: 'POST', body: JSON.stringify(payload) }) },
  jiraPublishTestCases(payload){ return request('/api/jira/publish-test-cases', { method: 'POST', body: JSON.stringify(payload) }) },
  
  // Playwright individual test execution
  runIndividualTest(payload){ return request('/api/playwright/run-test', { method: 'POST', body: JSON.stringify(payload) }) },

  // Automation test classes
  runAutomationTestClass(payload){ return request('/api/automation/run-test-class', { method: 'POST', body: JSON.stringify(payload) }) },
  runAutomationTestClassStreaming(payload){ return request('/api/automation/run-test-class-streaming', { method: 'POST', body: JSON.stringify(payload) }) },
  listAutomationTests(product){ return request(`/api/automation/list-tests?product=${encodeURIComponent(product)}`) },
  saveTestClass(payload){ return request('/api/automation/save-test-class', { method: 'POST', body: JSON.stringify(payload) }) },
  getTestClassCode(product, testName){ return request(`/api/automation/get-test-class?product=${encodeURIComponent(product)}&testName=${encodeURIComponent(testName)}`) },
  updateTestClass(payload){ return request('/api/automation/update-test-class', { method: 'POST', body: JSON.stringify(payload) }) },
  
  // Individual test cases
  getAllTestCases(){ return request('/api/automation/test-cases') },
  getProductTestCases(product){ return request(`/api/automation/test-cases/${encodeURIComponent(product)}`) },
  getTestCase(product, testClass, testId){ return request(`/api/automation/test-cases/${encodeURIComponent(product)}/${encodeURIComponent(testClass)}/${encodeURIComponent(testId)}`) },
  runIndividualTestCaseStreaming(payload){ 
    return fetch(`${API_BASE}/api/automation/run-test-case-streaming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  },

  runTestCaseWithHealing(payload){ 
    return fetch(`${API_BASE}/api/automation/run-test-case-healing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
  },
  saveTestClass(payload){ return request('/api/automation/save-test-class', { method: 'POST', body: JSON.stringify(payload) }) },
  getTestClass(product, testClass){ return request(`/api/automation/get-test-class?product=${encodeURIComponent(product)}&testName=${encodeURIComponent(testClass)}`) },
  updateTestClass(payload){ return request('/api/automation/update-test-class', { method: 'POST', body: JSON.stringify(payload) }) },
  
  // BDD Test Creation
  bddConvert(payload){ return request('/api/bdd/convert', { method: 'POST', body: JSON.stringify(payload) }) },
  bddSave(payload){ return request('/api/bdd/save', { method: 'POST', body: JSON.stringify(payload) }) },
  bddGetBDD(product, testName){ return request(`/api/bdd/get-bdd/${encodeURIComponent(product)}/${encodeURIComponent(testName)}`) },
  bddUpdate(payload){ return request('/api/bdd/update', { method: 'POST', body: JSON.stringify(payload) }) },

  // Jenkins CI/CD
  jenkinsTestConnection(){ return request('/api/jenkins/test-connection') },
  jenkinsGetJobs(){ return request('/api/jenkins/jobs') },
  jenkinsGetJobDetails(jobName){ return request(`/api/jenkins/jobs/${encodeURIComponent(jobName)}`) },
  jenkinsTriggerBuild(jobName, parameters = {}){ return request(`/api/jenkins/jobs/${encodeURIComponent(jobName)}/build`, { method: 'POST', body: JSON.stringify({ parameters }) }) },
  jenkinsGetBuildDetails(jobName, buildNumber){ return request(`/api/jenkins/jobs/${encodeURIComponent(jobName)}/builds/${encodeURIComponent(buildNumber)}`) },
  jenkinsGetBuildConsole(jobName, buildNumber){ return request(`/api/jenkins/jobs/${encodeURIComponent(jobName)}/builds/${encodeURIComponent(buildNumber)}/console`) },
  jenkinsGetBuildStatus(jobName, buildNumber){ return request(`/api/jenkins/jobs/${encodeURIComponent(jobName)}/builds/${encodeURIComponent(buildNumber)}/status`) },
  jenkinsGetQueue(){ return request('/api/jenkins/queue') },


  // Framework
  frameworkTestFiles(){ return request('/api/framework/test-files') },
  frameworkRunTest(payload){ return request('/api/framework/run-test', { method: 'POST', body: JSON.stringify(payload) }) },

  // Test runs (multipart expected by backend)
  async startTestRun(formData){
    const res = await fetch(`${API_BASE}/api/test-runs`, { method: 'POST', body: formData })
    if(!res.ok){
      const text = await res.text().catch(()=> '')
      throw new Error(`HTTP ${res.status}: ${text}`)
    }
    return res.json()
  },

  // Generic HTTP methods
  get(path){ return request(path) },
  post(path, payload){ return request(path, { method: 'POST', body: JSON.stringify(payload) }) },
  put(path, payload){ return request(path, { method: 'PUT', body: JSON.stringify(payload) }) },
  delete(path){ return request(path, { method: 'DELETE' }) }
}
