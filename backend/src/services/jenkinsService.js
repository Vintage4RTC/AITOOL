import fetch from 'node-fetch'

export class JenkinsService {
  constructor() {
    this.baseUrl = process.env.JENKINS_URL || 'http://localhost:8080'
    this.username = process.env.JENKINS_USERNAME
    this.apiToken = process.env.JENKINS_API_TOKEN
    this.initializeJenkins()
  }

  initializeJenkins() {
    try {
      console.log('Jenkins Configuration check:')
      console.log('- JENKINS_URL:', this.baseUrl)
      console.log('- JENKINS_USERNAME:', this.username ? 'Set' : 'Missing')
      console.log('- JENKINS_API_TOKEN:', this.apiToken ? 'Set' : 'Missing')

      if (!this.baseUrl) {
        throw new Error('JENKINS_URL is required in your .env file')
      }
    } catch (error) {
      console.error('Jenkins configuration error:', error.message)
    }
  }

  // Helper method to create authentication header
  getAuthHeader() {
    if (this.username && this.apiToken) {
      const auth = Buffer.from(`${this.username}:${this.apiToken}`).toString('base64')
      return { 'Authorization': `Basic ${auth}` }
    }
    return {}
  }

  // Test Jenkins connection
  async testConnection() {
    try {
      console.log(`Testing Jenkins connection to: ${this.baseUrl}`)
      console.log(`Using authentication: ${this.username ? 'Yes' : 'No'}`)
      
      // Try different API endpoints
      const endpoints = [
        '/api/json',
        '/api/json?pretty=true',
        '/jenkins/api/json',
        '/'
      ]
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${this.baseUrl}${endpoint}`)
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...this.getAuthHeader()
            },
            timeout: 5000 // 5 second timeout
          })

          if (response.ok) {
            const data = await response.json()
            console.log('Jenkins connection successful via endpoint:', endpoint)
            
            return {
              success: true,
              message: `Successfully connected to Jenkins via ${endpoint}`,
              jenkinsVersion: data.jenkinsVersion,
              url: this.baseUrl,
              data: {
                endpoint,
                jobsCount: data.jobs?.length || 0,
                mode: data.mode || 'NORMAL',
                nodeDescription: data.nodeDescription || 'Jenkins Master'
              }
            }
          } else {
            console.log(`Endpoint ${endpoint} returned status: ${response.status}`)
          }
        } catch (endpointError) {
          console.log(`Endpoint ${endpoint} failed:`, endpointError.message)
          continue
        }
      }
      
      // All endpoints failed - return detailed error
      throw new Error(`Unable to connect to Jenkins at ${this.baseUrl}. Please check:
1. Jenkins server is running on the VM
2. Port 8080 is accessible from this machine
3. Firewall allows connections to the VM
4. Jenkins authentication credentials are correct`)
      
    } catch (error) {
      console.error('Jenkins connection test failed:', error)
      return {
        success: false,
        error: error.message,
        suggestion: 'Please verify Jenkins is running and accessible. Check if authentication is required.'
      }
    }
  }

  // Get all jobs
  async getAllJobs() {
    try {
      const response = await fetch(`${this.baseUrl}/api/json?tree=jobs[name,url,color,description,lastBuild[number,url,timestamp,result,duration],lastSuccessfulBuild[number,url,timestamp],lastFailedBuild[number,url,timestamp],lastCompletedBuild[number,url,timestamp]]`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        timeout: 15000
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        jobs: data.jobs || []
      }
    } catch (error) {
      console.error('Failed to fetch Jenkins jobs:', error)
      return {
        success: false,
        error: error.message,
        jobs: []
      }
    }
  }

  // Get job details
  async getJobDetails(jobName) {
    try {
      const response = await fetch(`${this.baseUrl}/job/${encodeURIComponent(jobName)}/api/json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        timeout: 10000
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch job details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        job: data
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Trigger a build
  async triggerBuild(jobName, parameters = {}) {
    try {
      const url = Object.keys(parameters).length > 0 
        ? `${this.baseUrl}/job/${encodeURIComponent(jobName)}/buildWithParameters`
        : `${this.baseUrl}/job/${encodeURIComponent(jobName)}/build`

      const body = Object.keys(parameters).length > 0 
        ? new URLSearchParams(parameters).toString()
        : undefined

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...this.getAuthHeader()
        },
        body: body,
        timeout: 15000
      })

      if (!response.ok) {
        throw new Error(`Failed to trigger build: ${response.status} ${response.statusText}`)
      }

      // Get the queue item URL from the Location header
      const queueUrl = response.headers.get('Location')
      
      return {
        success: true,
        message: 'Build triggered successfully',
        queueUrl: queueUrl
      }
    } catch (error) {
      console.error('Failed to trigger build:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get build details
  async getBuildDetails(jobName, buildNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        timeout: 10000
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch build details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        build: data
      }
    } catch (error) {
      console.error('Failed to fetch build details:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get build console output
  async getBuildConsoleOutput(jobName, buildNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/consoleText`, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
          ...this.getAuthHeader()
        },
        timeout: 15000
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch console output: ${response.status} ${response.statusText}`)
      }

      const consoleOutput = await response.text()
      return {
        success: true,
        consoleOutput: consoleOutput
      }
    } catch (error) {
      console.error('Failed to fetch console output:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get build status
  async getBuildStatus(jobName, buildNumber) {
    try {
      const response = await fetch(`${this.baseUrl}/job/${encodeURIComponent(jobName)}/${buildNumber}/api/json?tree=result,timestamp,duration,url,changeSet[items[commitId,msg,author[fullName]]],actions[parameters[name,value]]`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        timeout: 10000
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch build status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        build: data
      }
    } catch (error) {
      console.error('Failed to fetch build status:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get queue status
  async getQueueStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/queue/api/json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        },
        timeout: 10000
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch queue status: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        queue: data
      }
    } catch (error) {
      console.error('Failed to fetch queue status:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Helper method to get job status color
  getJobStatusColor(color) {
    if (color.includes('blue') || color.includes('green')) return 'success'
    if (color.includes('red')) return 'failed'
    if (color.includes('yellow') || color.includes('orange')) return 'unstable'
    if (color.includes('grey') || color.includes('disabled')) return 'disabled'
    if (color.includes('aborted')) return 'aborted'
    return 'unknown'
  }

  // Helper method to format duration
  formatDuration(milliseconds) {
    if (!milliseconds) return 'N/A'
    
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Helper method to format timestamp
  formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }
}
