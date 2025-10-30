import React, { useEffect, useState } from 'react'
import { api } from '../../api.js'

export default function JenkinsSection() {
  // Jenkins CI/CD state
  const [jenkinsConnectionStatus, setJenkinsConnectionStatus] = useState('checking')
  const [jenkinsJobs, setJenkinsJobs] = useState([])
  const [loadingJenkinsJobs, setLoadingJenkinsJobs] = useState(false)
  const [jenkinsBuilds, setJenkinsBuilds] = useState({})
  const [jenkinsQueue, setJenkinsQueue] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJenkinsDetails, setShowJenkinsDetails] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load Jenkins data on component mount
  useEffect(() => {
    loadJenkinsData()
  }, [])

  // Jenkins functions
  const loadJenkinsData = async () => {
    await testJenkinsConnection()
    await loadJenkinsJobs()
    await loadJenkinsQueue()
  }

  const testJenkinsConnection = async () => {
    try {
      setJenkinsConnectionStatus('checking')
      const response = await api.jenkinsTestConnection()
      if (response.success) {
        setJenkinsConnectionStatus('connected')
      } else {
        setJenkinsConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Failed to test Jenkins connection:', error)
      setJenkinsConnectionStatus('disconnected')
    }
  }

  const loadJenkinsJobs = async () => {
    try {
      setLoadingJenkinsJobs(true)
      const response = await api.jenkinsGetJobs()
      if (response.success) {
        setJenkinsJobs(response.jobs || [])
      }
    } catch (error) {
      console.error('Failed to load Jenkins jobs:', error)
      setJenkinsJobs([])
    } finally {
      setLoadingJenkinsJobs(false)
    }
  }

  const loadJenkinsQueue = async () => {
    try {
      const response = await api.jenkinsGetQueue()
      if (response.success) {
        setJenkinsQueue(response.queue?.items || [])
      }
    } catch (error) {
      console.error('Failed to load Jenkins queue:', error)
      setJenkinsQueue([])
    }
  }

  const triggerJenkinsBuild = async (jobName, parameters = {}) => {
    try {
      const response = await api.jenkinsTriggerBuild(jobName, parameters)
      if (response.success) {
        // Refresh jobs and queue after triggering build
        await loadJenkinsJobs()
        await loadJenkinsQueue()
        return response
      } else {
        throw new Error(response.error || 'Failed to trigger build')
      }
    } catch (error) {
      console.error('Failed to trigger Jenkins build:', error)
      throw error
    }
  }

  const getJobStatusColor = (color) => {
    if (color.includes('blue') || color.includes('green')) return 'success'
    if (color.includes('red')) return 'failed'
    if (color.includes('yellow') || color.includes('orange')) return 'unstable'
    if (color.includes('grey') || color.includes('disabled')) return 'disabled'
    if (color.includes('aborted')) return 'aborted'
    return 'unknown'
  }

  const getJobStatusIcon = (color) => {
    if (color.includes('blue') || color.includes('green')) return '✅'
    if (color.includes('red')) return '❌'
    if (color.includes('yellow') || color.includes('orange')) return '⚠️'
    if (color.includes('grey') || color.includes('disabled')) return '⏸️'
    if (color.includes('aborted')) return '🛑'
    return '❓'
  }

  const formatDuration = (milliseconds) => {
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

  const formatTimestamp = (timestamp) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-dark p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">🚀</span>
              Jenkins CI/CD Dashboard
            </h1>
            <p className="text-slate-300 mt-1">Manage your Jenkins jobs, builds, and CI/CD pipeline</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white">
              <span className="mr-2">🕐</span>
              {currentTime.toLocaleTimeString()}
            </div>
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
              jenkinsConnectionStatus === 'connected' ? 'bg-green-900/30 text-green-300' :
              jenkinsConnectionStatus === 'checking' ? 'bg-blue-900/30 text-blue-300' :
              'bg-red-900/30 text-red-300'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                jenkinsConnectionStatus === 'connected' ? 'bg-green-400' :
                jenkinsConnectionStatus === 'checking' ? 'bg-blue-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              {jenkinsConnectionStatus === 'connected' ? 'Jenkins Connected' :
               jenkinsConnectionStatus === 'checking' ? 'Checking Connection' :
               'Jenkins Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="glass-card-dark p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Pipeline Statistics</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">{jenkinsJobs.length}</div>
            <div className="text-slate-300 text-sm">Total Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {jenkinsJobs.filter(job => job.color?.includes('blue') || job.color?.includes('green')).length}
            </div>
            <div className="text-slate-300 text-sm">Successful Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">
              {jenkinsJobs.filter(job => job.color?.includes('red')).length}
            </div>
            <div className="text-slate-300 text-sm">Failed Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{jenkinsQueue.length}</div>
            <div className="text-slate-300 text-sm">Queued Builds</div>
          </div>
        </div>
      </div>

      {/* Jenkins Jobs Section */}
      <div className="glass-card-dark p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">🚀 Jenkins Jobs</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadJenkinsData}
              disabled={loadingJenkinsJobs}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingJenkinsJobs ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Jenkins Jobs List */}
        <div className="space-y-4">
          {jenkinsConnectionStatus === 'disconnected' ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔌</div>
              <div className="text-slate-300 mb-2">Jenkins Connection Failed</div>
              <div className="text-sm text-slate-400 mb-4">
                Please check your Jenkins configuration in the backend environment variables
              </div>
              <button
                onClick={testJenkinsConnection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                🔄 Retry Connection
              </button>
            </div>
          ) : loadingJenkinsJobs ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">⏳</div>
              <div className="text-slate-300">Loading Jenkins jobs...</div>
            </div>
          ) : jenkinsJobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <div className="text-slate-300">No Jenkins jobs found</div>
              <div className="text-sm text-slate-400 mt-1">Create some jobs in your Jenkins instance</div>
            </div>
          ) : (
            <div className="space-y-3">
              {jenkinsJobs.map((job, index) => {
                const statusColor = getJobStatusColor(job.color)
                const statusIcon = getJobStatusIcon(job.color)
                const lastBuild = job.lastBuild
                const lastSuccessfulBuild = job.lastSuccessfulBuild
                const lastFailedBuild = job.lastFailedBuild
                
                return (
                  <div key={index} className="border border-slate-600 rounded-lg p-4 bg-slate-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🚀</span>
                        <div>
                          <div className="text-white font-medium">{job.name}</div>
                          <div className="text-sm text-slate-400">
                            {job.description || 'No description available'}
                          </div>
                          {lastBuild && (
                            <div className="text-xs text-slate-500 mt-1">
                              Last Build: #{lastBuild.number} • {formatTimestamp(lastBuild.timestamp)}
                              {lastBuild.duration && ` • Duration: ${formatDuration(lastBuild.duration)}`}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          statusColor === 'success' ? 'bg-green-900/30 text-green-300' :
                          statusColor === 'failed' ? 'bg-red-900/30 text-red-300' :
                          statusColor === 'unstable' ? 'bg-yellow-900/30 text-yellow-300' :
                          statusColor === 'disabled' ? 'bg-gray-900/30 text-gray-300' :
                          statusColor === 'aborted' ? 'bg-red-900/30 text-red-300' :
                          'bg-gray-900/30 text-gray-300'
                        }`}>
                          {statusIcon} {job.color || 'Unknown'}
                        </span>
                        
                        <button
                          onClick={async () => {
                            try {
                              await triggerJenkinsBuild(job.name)
                              // Show success message or update UI
                            } catch (error) {
                              console.error('Failed to trigger build:', error)
                              // Show error message
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          🚀 Trigger Build
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedJob(job)
                            setShowJenkinsDetails(true)
                          }}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors"
                        >
                          📊 Details
                        </button>
                      </div>
                    </div>

                    {/* Build History Summary */}
                    {lastBuild && (
                      <div className="mt-3 p-3 bg-slate-700/50 rounded">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Last Build</div>
                            <div className="text-white">
                              #{lastBuild.number} • {lastBuild.result || 'Running'}
                            </div>
                          </div>
                          {lastSuccessfulBuild && (
                            <div>
                              <div className="text-slate-400">Last Success</div>
                              <div className="text-green-300">
                                #{lastSuccessfulBuild.number} • {formatTimestamp(lastSuccessfulBuild.timestamp)}
                              </div>
                            </div>
                          )}
                          {lastFailedBuild && (
                            <div>
                              <div className="text-slate-400">Last Failure</div>
                              <div className="text-red-300">
                                #{lastFailedBuild.number} • {formatTimestamp(lastFailedBuild.timestamp)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Build Queue */}
        {jenkinsQueue.length > 0 && (
          <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-3">📋 Build Queue ({jenkinsQueue.length})</h3>
            <div className="space-y-2">
              {jenkinsQueue.map((queueItem, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                  <div className="flex items-center">
                    <span className="text-blue-400 mr-2">⏳</span>
                    <div className="text-white text-sm">
                      {queueItem.task?.name || 'Unknown Job'}
                    </div>
                  </div>
                  <div className="text-slate-400 text-xs">
                    Queued {formatTimestamp(queueItem.inQueueSince)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
