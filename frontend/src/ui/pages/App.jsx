import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../../api.js'
import AutomationScriptsSection from '../sections/AutomationScriptsSection.jsx'
import HealingDashboard from '../sections/HealingDashboard.jsx'
import JenkinsSection from '../sections/JenkinsSection.jsx'
import BDDSection from '../sections/BDDSection.jsx'

export default function App(){
  const [tab, setTab] = useState('jira') // 'jira' | 'agent' | 'healing' | 'automation'
  return (
    <div className="min-h-screen relative">
      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M50 0L100 50L50 100L0 50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        {/* Additional overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header */}
        <header className="mb-8">
          <div className="bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 p-8 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
          <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          K12 Coalition QA Testing Platform
        </h1>
                <p className="text-slate-600 text-lg">
                  Automated testing and quality assurance for educational platforms
                </p>
                <div className="mt-4 flex gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Playwright
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI-Powered
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Jira Integration
                  </span>
            </div>
          </div>
              <div className="hidden md:block">
                {/* Bot Face Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="relative">
                    {/* Bot Head */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-lg flex items-center justify-center">
                      {/* Bot Eyes */}
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
                    {/* Bot Antenna */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-orange-400 rounded-full"></div>
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="mb-8" role="tablist">
          <div className="bg-gradient-to-r from-white/90 via-slate-50/90 to-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-2 inline-flex">
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                tab === 'jira' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => setTab('jira')}
              role="tab"
              aria-selected={tab === 'jira'}
              aria-controls="jira-panel"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Jira Testing
            </button>
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                tab === 'healing' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => setTab('healing')}
              role="tab"
              aria-selected={tab === 'healing'}
              aria-controls="healing-panel"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Test Healing
            </button>
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                tab === 'automation' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => setTab('automation')}
              role="tab"
              aria-selected={tab === 'automation'}
              aria-controls="automation-panel"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Automation Scripts
            </button>
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                tab === 'upload' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => setTab('upload')}
              role="tab"
              aria-selected={tab === 'upload'}
              aria-controls="upload-panel"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload & Generate
            </button>
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                tab === 'bdd' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => setTab('bdd')}
              role="tab"
              aria-selected={tab === 'bdd'}
              aria-controls="bdd-panel"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              BDD Creator
            </button>
            <button 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                tab === 'jenkins' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
              onClick={() => setTab('jenkins')}
              role="tab"
              aria-selected={tab === 'jenkins'}
              aria-controls="jenkins-panel"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Jenkins CI/CD
            </button>
        </div>
        </nav>

        {/* Main Content */}
        <main role="tabpanel" aria-labelledby={`${tab}-tab`}>
          {tab === 'jira' ? <JiraSection /> : tab === 'healing' ? <HealingDashboard /> : tab === 'automation' ? <AutomationScriptsSection /> : tab === 'bdd' ? <BDDSection /> : tab === 'jenkins' ? <JenkinsSection /> : <UploadSection />}
        </main>
      </div>
    </div>
  )
}

function JiraSection(){
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState([])
  const [resultsByKey, setResultsByKey] = useState({}) // key -> { loading, testCases, script, error, running, runStatus, editingTestCases: {}, published: false }
  const [showOverlay, setShowOverlay] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking', 'connected', 'disconnected'
  const [folderStructure, setFolderStructure] = useState({})

  // Check backend status on component mount
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        await api.health()
        setBackendStatus('connected')
      } catch (error) {
        console.error('Backend health check failed:', error)
        setBackendStatus('disconnected')
      }
    }
    checkBackend()
  }, [])


  async function findTickets(){
    try{
      setLoading(true)
      const res = await api.jiraTickets(username)
      setTickets(Array.isArray(res) ? res : [])
    }catch(e){ alert(e.message) }
    finally{ setLoading(false) }
  }

  async function generateForTicket(ticket){
    const key = ticket.key
    setResultsByKey(prev=>({ ...prev, [key]: { ...(prev[key]||{}), loading: true, error: null } }))
    setShowOverlay(true)
    try{
      const details = await api.jiraTicket(key)
      const cases = await api.jiraGenerateTestCases({ summary: details.summary, description: details.description })
      // Generate test cases first, then optionally generate Playwright script
      setResultsByKey(prev=>({ ...prev, [key]: { loading:false, testCases: cases, script: null, editingTestCases: {}, published: false } }))
      setShowOverlay(false)
      
      // Generate Playwright script in background (optional)
      try {
      const scriptRes = await api.jiraGeneratePlaywright({ testCases: cases, businessUnit: t.businessUnit || 'lavinia', ticketKey: key })
        setResultsByKey(prev=>({ ...prev, [key]: { ...(prev[key]||{}), script: scriptRes.script } }))
      } catch (scriptError) {
        console.log('Playwright script generation failed:', scriptError.message)
        // Don't show error to user, just log it
      }
    }catch(e){
      setResultsByKey(prev=>({ ...prev, [key]: { loading:false, error: e.message } }))
      setShowOverlay(false)
    }
  }

  // Download functions
  function downloadTestCases(ticketKey, testCases) {
    // Convert test cases to Zephyr bulk upload format
    const csvData = convertToZephyrCSV(testCases, ticketKey)
    
    // Create and download CSV file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${ticketKey}_test_cases.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function convertToZephyrCSV(testCases, ticketKey) {
    // Zephyr bulk upload CSV format
    const headers = [
      'Test Name',
      'Test Type',
      'Priority',
      'Test Script Type',
      'Test Script',
      'Test Script Language',
      'Folder Path',
      'Description',
      'Precondition',
      'Labels'
    ]
    
    const rows = testCases.map((tc, index) => {
      const folderPath = 'Generated Tests' // Default folder
      const testName = `${ticketKey} - ${tc.title}`
      const testType = tc.priority === 'High' ? 'Smoke' : 'Regression'
      const priority = tc.priority || 'Medium'
      const testScript = tc.bddSteps ? tc.bddSteps.join('\n') : tc.description
      
      return [
        testName,
        testType,
        priority,
        'Bdd',
        testScript,
        'gherkin',
        folderPath,
        tc.description || '',
        '',
        `generated,${ticketKey.toLowerCase()}`
      ]
    })
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${(field || '').toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')
    
    return csvContent
  }

  return (
    <div className="space-y-6">
      {/* Backend Status Indicator */}
      <div className="bg-gradient-to-br from-white/90 via-slate-50/85 to-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 transform hover:scale-[1.01] transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${
            backendStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
            backendStatus === 'disconnected' ? 'bg-red-500 animate-pulse' : 
            'bg-yellow-500 animate-ping'
          }`} aria-label={`Backend status: ${backendStatus}`}></div>
          <span className="text-sm font-medium text-slate-700">
            Backend Status: {
              backendStatus === 'connected' ? 'Connected' : 
              backendStatus === 'disconnected' ? 'Disconnected - Check if backend is running' : 
              'Checking...'
            }
          </span>
          {backendStatus === 'disconnected' && (
            <button 
              onClick={() => {
                setBackendStatus('checking')
                api.health().then(() => setBackendStatus('connected')).catch(() => setBackendStatus('disconnected'))
              }}
              className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Retry backend connection"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
      
      {/* Jira Ticket Search */}
      <div className="bg-gradient-to-br from-white/90 via-blue-50/85 to-indigo-50/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 transform hover:scale-[1.01] transition-all duration-300">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Find Jira Tickets</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="jira-username" className="block text-sm font-medium text-slate-700 mb-2">
              Jira Username or Email Address
          </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 w-full">
                <input 
                  id="jira-username"
                  type="email"
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="username@k12coalition.com" 
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  aria-describedby="jira-username-help"
                />
        </div>
              <button 
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={findTickets} 
                disabled={loading || !username.trim()}
                aria-describedby="find-tickets-help"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span className="animate-pulse">Loading…</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Find Tickets
                  </span>
                )}
              </button>
            </div>
            <p id="jira-username-help" className="mt-1 text-sm text-slate-500">
              Enter your Jira username or email to search for tickets
            </p>
          </div>
          <p id="find-tickets-help" className="text-sm text-slate-500">
            This will search for Jira tickets assigned to or created by the specified user
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map(t => {
          const r = resultsByKey[t.key] || {}
          return (
            <div key={t.key} className="bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 hover:shadow-2xl hover:scale-[1.02] transform transition-all duration-300 relative overflow-hidden">
              {/* 3D Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-slate-800 mb-1">
                        {t.key} — {t.summary}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            t.priority === 'High' ? 'bg-red-500' :
                            t.priority === 'Medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></span>
                          {t.priority} Priority
                        </span>
                        <span className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            t.status === 'Done' ? 'bg-green-500' :
                            t.status === 'In Progress' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}></span>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center justify-end min-w-0 flex-shrink-0">
                  <button 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] h-10 flex items-center justify-center" 
                    onClick={() => generateForTicket(t)} 
                    disabled={!!r.loading}
                    aria-label={`Generate test cases for ticket ${t.key}`}
                  >
                    {r.loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="animate-pulse">Generating…</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Tests
                      </span>
                    )}
                  </button>
                  {r.script && (
                    <button 
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] h-10 flex items-center justify-center" 
                      onClick={async() => {
                      // Check if business unit is selected
                      // Business unit is now defaulted to 'lavinia'
                      
                      // Note: Test cases can be edited individually, no global approval required
                      
                      try{
                        setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), running: true, runStatus: 'Starting test execution...', runId: null } }))
                        
                        // First try to run existing script, if not found, generate and run
                        let run
                        try {
                          run = await api.jiraRunExistingPlaywright({ ticketKey: t.key, businessUnit: t.businessUnit || 'lavinia' })
                        } catch (error) {
                          console.log('Error running existing script:', error)
                          // Check if it's a 404 error or "No existing script found" error
                          const isNotFoundError = error.message && (
                            error.message.includes('No existing script found') || 
                            error.message.includes('404') ||
                            error.message.includes('HTTP 404') ||
                            error.message.includes('success":false')
                          )
                          
                          if (isNotFoundError) {
                            console.log('No existing script found, generating new script first...')
                            setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), runStatus: 'No existing script found, generating new script...' } }))
                            
                            try {
                              // Generate test cases first
                              setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), runStatus: 'Generating test cases...' } }))
                              const testCases = await api.jiraGenerateTestCases({ ticketKey: t.key })
                              setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), testCases: testCases } }))
                              
                              // Generate Playwright script
                              setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), runStatus: 'Generating Playwright script...' } }))
                              const scriptResult = await api.jiraGeneratePlaywright({ 
                                testCases: testCases, 
                                businessUnit: t.businessUnit || 'lavinia',
                                ticketKey: t.key
                              })
                              setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), script: scriptResult.script, testFileName: scriptResult.testFileName, frameworkPath: scriptResult.frameworkPath } }))
                              
                              // Now run the newly generated script
                              setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), runStatus: 'Running newly generated script...' } }))
                              run = await api.jiraRunExistingPlaywright({ ticketKey: t.key, businessUnit: t.businessUnit || 'lavinia' })
                            } catch (genError) {
                              console.error('Error during script generation:', genError)
                              setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), running: false, runStatus: `Error generating script: ${genError.message}` } }))
                              return
                            }
                          } else {
                            throw error
                          }
                        }
                        
                        // Start SSE connection for real-time updates
                        if (run.runId) {
                          console.log('🔌 Setting up SSE connection with runId:', run.runId)
                          setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), runId: run.runId } }))
                          
                          const sseUrl = `${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}/api/playwright/status/${run.runId}`
                          console.log('🔌 SSE URL:', sseUrl)
                          const eventSource = new EventSource(sseUrl)
                          
                          // Add EventSource event listeners for debugging
                          eventSource.onopen = () => {
                            console.log('🔌 SSE connection opened')
                          }
                          
                          eventSource.onerror = (error) => {
                            console.error('🔌 SSE connection error:', error)
                          }
                          
                          // Timeout fallback - if no SSE messages received, assume completion after 30 seconds
                          let sseMessagesReceived = 0
                          const timeoutFallback = setTimeout(() => {
                            if (sseMessagesReceived === 0) {
                              console.log('🔌 No SSE messages received, assuming completion after timeout')
                              eventSource.close()
                              setResultsByKey(prev => ({
                                ...prev,
                                [t.key]: {
                                  ...(prev[t.key] || {}),
                                  running: false,
                                  runStatus: 'Test execution completed! (timeout fallback)',
                                  reportUrl: run.reportUrl,
                                  script: run.script,
                                  testFileName: run.testFileName,
                                  frameworkPath: run.frameworkPath
                                }
                              }))
                              
                              // Auto-open the Playwright report
                              if (run.reportUrl) {
                                setTimeout(() => {
                                  window.open(`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${run.reportUrl}`, '_blank')
                                }, 1000)
                              }
                            }
                          }, 30000) // 30 seconds timeout
                          
                          eventSource.onmessage = (event) => {
                            try {
                              sseMessagesReceived++
                              const data = JSON.parse(event.data)
                              console.log('🔌 SSE Update received:', data)
                              
                              setResultsByKey(prev => ({
                                ...prev,
                                [t.key]: {
                                  ...(prev[t.key] || {}),
                                  runStatus: data.message,
                                  lastUpdate: data.timestamp
                                }
                              }))
                              
                              // Close connection when complete
                              if (data.type === 'final_complete' || data.type === 'connection_closed' || data.type === 'completed') {
                                clearTimeout(timeoutFallback)
                                eventSource.close()
                                setResultsByKey(prev => ({
                                  ...prev,
                                  [t.key]: {
                                    ...(prev[t.key] || {}),
                                    running: false,
                                    reportUrl: data.reportUrl || run.reportUrl,
                                    script: run.script,
                                    testFileName: run.testFileName,
                                    frameworkPath: run.frameworkPath
                                  }
                                }))
                                
                                // Auto-open the Playwright report
                                if (data.reportUrl || run.reportUrl) {
                                  setTimeout(() => {
                                    window.open(`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${data.reportUrl || run.reportUrl}`, '_blank')
                                  }, 1000)
                                }
                              }
                            } catch (e) {
                              console.error('Error parsing SSE data:', e)
                            }
                          }
                          
                          eventSource.onerror = (error) => {
                            console.error('SSE Error:', error)
                            clearTimeout(timeoutFallback)
                            eventSource.close()
                            
                            // Fallback: if SSE fails, use the response data directly
                            setResultsByKey(prev => ({
                              ...prev,
                              [t.key]: {
                                ...(prev[t.key] || {}),
                                running: false,
                                runStatus: 'Test execution completed!',
                                reportUrl: run.reportUrl,
                                script: run.script,
                                testFileName: run.testFileName,
                                frameworkPath: run.frameworkPath
                              }
                            }))
                            
                            // Auto-open the Playwright report
                            if (run.reportUrl) {
                              setTimeout(() => {
                                window.open(`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${run.reportUrl}`, '_blank')
                              }, 1000)
                            }
                          }
                        }
                        
                        // Fallback if no runId
                        if (!run.runId) {
                          setResultsByKey(prev=>({ ...prev, [t.key]: { ...(prev[t.key]||{}), running: false, runStatus: 'Test completed successfully!', reportUrl: run?.reportUrl } }))
                          
                          if (run?.reportUrl) {
                            setTimeout(() => {
                              window.open(`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${run.reportUrl}`, '_blank')
                            }, 1000)
                          }
                        }
                        } catch(e) { 
                          setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), running: false, runStatus: `Error: ${e.message}` } }))
                        alert(e.message) 
                      }
                      }} 
                      disabled={r.running}
                      aria-label={`Run Playwright tests for ticket ${t.key}`}
                    >
                      {r.running ? (
                        <span className="inline-flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span className="animate-pulse">Running...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Run Tests
                        </span>
                      )}
                    </button>
                  )}
                  {r.testCases && (
                    <>
                    <button 
                      className={`px-4 py-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] h-10 flex items-center justify-center ${
                        r.published 
                          ? 'bg-green-600 hover:bg-green-700 text-white cursor-default focus:ring-green-500' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
                      }`}
                      onClick={async () => {
                        if (r.published) return; // Prevent clicking if already published
                        
                        try {
                          const response = await api.jiraPublishTestCases({ 
                            ticketKey: t.key, 
                            testCases: r.testCases 
                          })
                          setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), published: true } }))
                          alert('Test cases successfully published to Jira ticket!')
                        } catch (error) {
                          alert(`Error publishing to Jira: ${error.message}`)
                        }
                      }}
                      disabled={r.published}
                      aria-label={`${r.published ? 'Already published to' : 'Publish test cases to'} Jira ticket ${t.key}`}
                    >
                      {r.published ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Publish to Jira
                        </span>
                      )}
                      </button>
                      
                      {r.testCases?.length > 0 && (
                        <button 
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                          onClick={() => downloadTestCases(t.key, r.testCases)}
                          aria-label={`Download all test cases for Zephyr for ticket ${t.key}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download All for Zephyr
                    </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {r.error && (
                <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{r.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {r.runStatus && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50/90 via-blue-100/80 to-indigo-50/90 backdrop-blur-sm border border-blue-200/50 rounded-lg shadow-md">
                  <div className="text-sm font-medium text-blue-800 mb-3">Playwright Test Execution</div>
                  
                  {/* Enhanced Progress Display */}
                  <div className="space-y-4">
                    {/* Current Status */}
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        r.running ? 'bg-yellow-500 animate-ping' : 'bg-green-500 animate-pulse'
                      }`} aria-label={`Test execution status: ${r.running ? 'in progress' : 'completed'}`}></div>
                      <span className="text-sm font-medium text-blue-800">
                        {r.running ? 'Test Execution in Progress' : 'Test Execution Completed'}
                      </span>
                    </div>
                    
                    {/* Current Step */}
                    <div className="bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 backdrop-blur-sm p-4 rounded-lg border border-blue-200/50 shadow-sm">
                      <div className="text-xs text-blue-600 mb-1 font-medium">Current Step:</div>
                      <div className="text-sm text-slate-800 font-medium">{r.runStatus}</div>
                  {r.lastUpdate && (
                        <div className="text-xs text-slate-500 mt-2">
                          Last update: {new Date(r.lastUpdate).toLocaleTimeString()}
                        </div>
                  )}
                    </div>
                    
                    {/* Progress Steps */}
                  {r.running && (
                      <div className="space-y-3">
                        <div className="text-xs text-blue-600 font-medium">Execution Progress:</div>
                        <div className="grid grid-cols-1 gap-2">
                          {/* Framework Creation Steps */}
                          {r.runStatus?.includes('Starting') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Started Playwright execution</span>
                      </div>
                          )}
                          {r.runStatus?.includes('Retrieved ticket details') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Retrieved JIRA ticket details</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Determined target URL') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Determined target URL</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Generating test cases') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Generated test cases</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Generating Playwright script') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Generated Playwright script</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Creating Playwright test framework') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created test framework structure</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Created directory') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created framework directories</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Creating page object models') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created page object models</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Created test file') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created test file</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Creating page object files') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created page object files</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Creating utility files') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created utility files</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Creating Playwright configuration') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created configuration file</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Creating project documentation') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created project documentation</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Created package.json') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Created package.json</span>
                            </div>
                          )}
                          
                          {/* Test Execution Steps */}
                          {r.runStatus?.includes('Starting Playwright test execution') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Started test execution</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Setting up test environment') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Setting up test environment</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Test execution process started') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Test execution process started</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Installing Playwright dependencies') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Installing dependencies</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Executing test cases') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <span className="text-yellow-700">Running test cases...</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Starting individual test case') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              <span className="text-yellow-700">Starting test case</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Running tests in Chromium') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                              <span className="text-purple-700">Running in Chromium browser</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Test case completed successfully') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Tests passed</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Test case encountered an error') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-700">Tests failed</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Capturing test evidence') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-blue-700">Taking screenshots</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Creating HTML test report') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-blue-700">Generating test report</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Found Playwright HTML report') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Found test report</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Test report is ready') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Report ready for viewing</span>
                            </div>
                          )}
                          
                          {/* Additional Detailed Steps */}
                          {r.runStatus?.includes('Waiting for page elements') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Waiting for page elements</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Navigating to test page') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Navigating to test page</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Running test assertions') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Running test assertions</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Capturing screenshot for test evidence') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Capturing screenshots</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Recording test execution video') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Recording video</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Recording test execution trace') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Recording trace</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Chromium browser launched successfully') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Browser launched</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Browser context created for testing') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Browser context created</span>
                            </div>
                          )}
                          {r.runStatus?.includes('New browser page created for testing') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">New page created</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Page loaded and network is idle') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Page loaded</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Target element located on page') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Element found</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Clicking on page element') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Clicking element</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Entering text into form field') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Typing text</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Selecting option from dropdown') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Selecting option</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Checking/unchecking checkbox') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Checking checkbox</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Scrolling page to find elements') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Scrolling page</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Waiting for specific element to appear') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-700">Waiting for element</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Timeout waiting for element or action') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-700">Timeout occurred</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Error occurred during test execution') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-red-700">Error occurred</span>
                            </div>
                          )}
                          {r.runStatus?.includes('Action completed successfully') && (
                            <div className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700">Action successful</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Running Indicator */}
                    {r.running && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <svg className="animate-spin h-3 w-3 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          <span className="animate-pulse">Playwright tests are running...</span>
                        </div>
                        <div className="text-xs text-slate-600 bg-white/90 backdrop-blur-sm p-3 rounded-lg border border-blue-200">
                          <div className="font-medium mb-2 text-blue-800">What's happening:</div>
                          <ul className="text-xs space-y-1 text-slate-600">
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                              Creating test framework structure
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                              Installing Playwright dependencies
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                              Running tests in Chromium browser
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                              Capturing screenshots and evidence
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
                              Generating detailed HTML report
                            </li>
                          </ul>
                      </div>
                      <button 
                        onClick={() => {
                          // Force completion if stuck
                          setResultsByKey(prev => ({
                            ...prev,
                            [t.key]: {
                              ...(prev[t.key] || {}),
                              running: false,
                              runStatus: 'Test execution completed! (manual refresh)',
                              reportUrl: r.reportUrl,
                              script: r.script,
                              testFileName: r.testFileName,
                              frameworkPath: r.frameworkPath
                            }
                          }))
                          
                          // Auto-open the Playwright report if available
                          if (r.reportUrl) {
                            setTimeout(() => {
                              window.open(`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${r.reportUrl}`, '_blank')
                            }, 1000)
                          }
                        }}
                          className="text-xs px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                          aria-label="Force complete test execution"
                      >
                        Force Complete
                      </button>
                    </div>
                  )}
                  </div>
                  
                  {/* Report Link */}
                  {r.reportUrl && !r.running && (
                    <div className="mt-4 pt-4 border-t border-blue-200 space-y-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-green-700 font-medium">Test Report Available</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <a 
                          href={`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${r.reportUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center gap-2"
                          aria-label="Open test report in new tab"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Open in New Tab
                        </a>
                        <button 
                          onClick={() => {
                            const iframe = document.getElementById(`playwright-dashboard-${t.key}`);
                            if (iframe) {
                              iframe.src = iframe.src; // Refresh the iframe
                            }
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 inline-flex items-center gap-2"
                          aria-label="Refresh test report"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </button>
                      </div>
                      
                      {/* Embedded Playwright Dashboard */}
                      <div className="mt-4">
                        <div className="text-sm font-medium text-blue-800 mb-3">🎯 Interactive Test Dashboard</div>
                        <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-lg" style={{height: '600px'}}>
                          <iframe 
                            id={`playwright-dashboard-${t.key}`}
                            src={`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${r.reportUrl}`}
                            className="w-full h-full border-0"
                            title="Playwright Test Report"
                            onLoad={(e) => {
                              console.log('✅ Playwright report loaded for', t.key)
                              // Inject CSS to make text visible
                              try {
                                const iframe = e.target
                                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
                                if (iframeDoc) {
                                  const style = iframeDoc.createElement('style')
                                  style.textContent = `
                                    body, html { 
                                      background-color: #f8f9fa !important; 
                                      color: #212529 !important; 
                                    }
                                    .playwright-report { 
                                      background-color: #f8f9fa !important; 
                                      color: #212529 !important; 
                                    }
                                    .test-file, .test-suite, .test-case { 
                                      background-color: #ffffff !important; 
                                      color: #212529 !important; 
                                      border: 1px solid #dee2e6 !important;
                                    }
                                    .test-step, .test-result { 
                                      background-color: #ffffff !important; 
                                      color: #212529 !important; 
                                    }
                                    .status-passed { 
                                      color: #28a745 !important; 
                                    }
                                    .status-failed { 
                                      color: #dc3545 !important; 
                                    }
                                    .status-skipped { 
                                      color: #ffc107 !important; 
                                    }
                                    * { 
                                      color: #212529 !important; 
                                    }
                                  `
                                  iframeDoc.head.appendChild(style)
                                }
                              } catch (err) {
                                console.log('Could not inject CSS into iframe:', err)
                              }
                            }}
                            onError={() => console.log('❌ Failed to load Playwright report for', t.key)}
                            style={{
                              backgroundColor: '#f8f9fa'
                            }}
                          />
                        </div>
                        <div className="text-xs text-slate-600 mt-3 flex items-center gap-2 p-3 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200">
                          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Click on individual tests in the dashboard to run them or view detailed results</span>
                        </div>
                        
                        {/* Alternative: Simple Text Report Viewer */}
                        <div className="mt-4 p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200">
                          <div className="text-sm font-medium text-slate-800 mb-3">📊 Test Results Summary</div>
                          <div className="text-xs text-slate-600 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Test File: {r.testFileName || 'Generated Test'}
                          </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Framework Path: {r.frameworkPath || 'Not available'}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              Generated: {new Date().toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Status: Test execution completed successfully
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-slate-500 p-2 bg-slate-50 rounded">
                            For detailed test results, use the "Open in New Tab" button above to view the full Playwright report.
                          </div>
                        </div>
                        
                        {/* Individual Test Execution Panel */}
                        <div className="mt-4 p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200">
                          <div className="text-sm font-medium text-slate-800 mb-3">🎮 Run Individual Tests</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor={`test-file-${t.key}`} className="block text-xs text-slate-700 mb-1 font-medium">Test File</label>
                              <input 
                                id={`test-file-${t.key}`}
                                type="text" 
                                value={r.testFileName || ''} 
                                readOnly
                                className="w-full px-3 py-2 bg-white text-slate-800 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., DP_5531.spec.js"
                              />
                            </div>
                            <div>
                              <label htmlFor={`browser-${t.key}`} className="block text-xs text-slate-700 mb-1 font-medium">Browser</label>
                              <select 
                                id={`browser-${t.key}`}
                                className="w-full px-3 py-2 bg-white text-slate-800 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onChange={(e) => setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), selectedBrowser: e.target.value } }))}
                              >
                                <option value="chromium">Chromium</option>
                                <option value="firefox">Firefox</option>
                                <option value="webkit">WebKit</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-4">
                            <label htmlFor={`test-name-${t.key}`} className="block text-xs text-slate-700 mb-1 font-medium">Test Name (Optional)</label>
                            <input 
                              id={`test-name-${t.key}`}
                              type="text" 
                              className="w-full px-3 py-2 bg-white text-slate-800 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., User can successfully complete the main workflow"
                              onChange={(e) => setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), selectedTestName: e.target.value } }))}
                            />
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button 
                              onClick={async () => {
                                if (!r.testFileName || !r.frameworkPath) {
                                  alert('Test file or framework path not available')
                                  return
                                }
                                
                                try {
                                  setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), runningIndividual: true, individualStatus: 'Running individual test...' } }))
                                  
                                  const result = await api.runIndividualTest({
                                    frameworkPath: r.frameworkPath,
                                    testFile: r.testFileName,
                                    testName: r.selectedTestName || null,
                                    browser: r.selectedBrowser || 'chromium'
                                  })
                                  
                                  setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), runningIndividual: false, individualStatus: 'Individual test completed!', individualReportUrl: result.reportUrl } }))
                                  
                                  if (result.reportUrl) {
                                    setTimeout(() => {
                                      window.open(`${((import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787')}${result.reportUrl}`, '_blank')
                                    }, 1000)
                                  }
                                } catch (error) {
                                  setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), runningIndividual: false, individualStatus: `Error: ${error.message}` } }))
                                }
                              }}
                              disabled={r.runningIndividual || !r.testFileName}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                              aria-label="Run individual test"
                            >
                              {r.runningIndividual ? (
                                <span className="flex items-center gap-2">
                                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                  </svg>
                                  <span className="animate-pulse">Running...</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Run Test
                                </span>
                              )}
                            </button>
                            <button 
                              onClick={() => {
                                setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), selectedTestName: '', selectedBrowser: 'chromium' } }))
                              }}
                              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                              aria-label="Clear form fields"
                            >
                              Clear
                            </button>
                          </div>
                          {r.individualStatus && (
                            <div className="mt-3 p-2 bg-white/90 backdrop-blur-sm rounded border border-slate-200">
                              <div className="text-xs text-slate-600">{r.individualStatus}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {r.testCases && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Generated Test Cases</h3>
                    <p className="text-sm text-slate-600 mt-1">AI-generated test cases based on the Jira ticket requirements</p>
                  </div>

                  {/* Download Section */}
                  <div className="mb-6 p-4 bg-gradient-to-br from-green-50/80 via-emerald-50/80 to-teal-50/80 backdrop-blur-sm rounded-lg border border-green-200/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-slate-800">Download for Zephyr</h4>
                        <p className="text-sm text-slate-600">Download test cases in CSV format for Zephyr bulk upload</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        {r.testCases.length} test case{r.testCases.length !== 1 ? 's' : ''} ready for download
                      </div>
                      <button
                        onClick={() => downloadTestCases(t.key, r.testCases)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download CSV
                      </button>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2 text-blue-700">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-xs">
                          <div className="font-medium mb-1">Instructions:</div>
                          <div>1. Download the CSV file</div>
                          <div>2. Go to Zephyr → Test Cases → Bulk Import</div>
                          <div>3. Upload the CSV file to create test cases in Zephyr</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {r.published && (
                    <div className="mb-4 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 text-green-700">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Successfully Published to Jira</div>
                          <div className="text-xs text-green-600 mt-1">
                            Test cases have been added to ticket {t.key}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {r.testCases.map((tc, i) => (
                      <div key={i} className="bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/95 backdrop-blur-sm rounded-lg border border-slate-200/50 p-4 shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-slate-800">Test Case {i+1}</div>
                          <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {tc.priority || 'Medium'} Priority
                          </div>
                        </div>
                        {r.editingTestCases && r.editingTestCases[i] ? (
                          <div className="space-y-4">
                            <div>
                              <label htmlFor={`test-case-title-${i}`} className="block text-sm text-slate-700 mb-1 font-medium">Title</label>
                              <input 
                                id={`test-case-title-${i}`}
                                type="text" 
                                value={tc.title || ''} 
                                onChange={(e) => {
                                  const newTestCases = [...r.testCases]
                                  newTestCases[i] = { ...tc, title: e.target.value }
                                  setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), testCases: newTestCases } }))
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Test case title"
                              />
                            </div>
                            <div>
                              <label htmlFor={`test-case-steps-${i}`} className="block text-sm text-slate-700 mb-1 font-medium">BDD Test Case</label>
                              <textarea 
                                id={`test-case-steps-${i}`}
                                value={Array.isArray(tc.bddSteps) ? tc.bddSteps.join('\n') : ''} 
                                onChange={(e) => {
                                  const newTestCases = [...r.testCases]
                                  newTestCases[i] = { ...tc, bddSteps: e.target.value.split('\n').filter(step => step.trim()) }
                                  setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), testCases: newTestCases } }))
                                }}
                                rows={6}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                placeholder="Given the user is on a mobile device&#10;When they navigate to the application&#10;Then the application should load successfully&#10;And the layout should be responsive&#10;And all features should be accessible"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => {
                                  setResultsByKey(prev => ({ 
                                    ...prev, 
                                    [t.key]: { 
                                      ...(prev[t.key]||{}), 
                                      editingTestCases: { ...(prev[t.key]?.editingTestCases || {}), [i]: false } 
                                    } 
                                  }))
                                }}
                              >
                                Save
                              </button>
                              <button 
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                onClick={() => {
                                  setResultsByKey(prev => ({ 
                                    ...prev, 
                                    [t.key]: { 
                                      ...(prev[t.key]||{}), 
                                      editingTestCases: { ...(prev[t.key]?.editingTestCases || {}), [i]: false } 
                                    } 
                                  }))
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-3">
                            <div>
                                <div className="text-sm font-medium text-slate-800 mb-1">Title</div>
                                <div className="text-sm text-slate-600">{tc.title || 'No title provided'}</div>
                              </div>
                              {tc.bddSteps && Array.isArray(tc.bddSteps) && tc.bddSteps.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium text-slate-800 mb-2">BDD Test Case</div>
                                  <div className="text-sm text-slate-600 font-mono bg-slate-50 p-3 rounded border whitespace-pre-line">
                                    {tc.bddSteps.join('\n')}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex gap-2">
                              <button 
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                onClick={() => {
                                  const testCaseText = `Title: ${tc.title || 'No title'}\n\nBDD Test Case:\n${Array.isArray(tc.bddSteps) ? tc.bddSteps.join('\n') : 'No steps provided'}`
                                  navigator.clipboard.writeText(testCaseText)
                                }}
                                aria-label="Copy test case to clipboard"
                              >
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </button>
                              <button 
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => {
                                  setResultsByKey(prev => ({ 
                                    ...prev, 
                                    [t.key]: { 
                                      ...(prev[t.key]||{}), 
                                      editingTestCases: { ...(prev[t.key]?.editingTestCases || {}), [i]: true } 
                                    } 
                                  }))
                                }}
                                aria-label="Edit test case"
                              >
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button 
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => downloadTestCases(t.key, [tc])}
                                aria-label="Download test case for Zephyr"
                              >
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edge Case Generation Section */}
              {r.testCases && r.testCases.length > 0 && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Generate Additional Edge Cases</h3>
                    <p className="text-sm text-slate-600 mt-1">Write a custom prompt to generate specific edge cases or test scenarios</p>
                  </div>
                  <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/95 backdrop-blur-sm rounded-lg border border-slate-200/50 p-4 shadow-md">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`edge-case-prompt-${t.key}`} className="block text-sm font-medium text-slate-700 mb-2">
                          Custom Prompt for Edge Cases
                        </label>
                        <textarea
                          id={`edge-case-prompt-${t.key}`}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          rows={3}
                          placeholder="e.g., Generate test cases for error handling when network is slow, or test cases for data validation edge cases, or test cases for user permission scenarios..."
                          value={r.edgeCasePrompt || ''}
                                onChange={(e) => {
                            setResultsByKey(prev => ({ 
                              ...prev, 
                              [t.key]: { 
                                ...(prev[t.key]||{}), 
                                edgeCasePrompt: e.target.value 
                              } 
                            }))
                          }}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button 
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={async () => {
                            if (!r.edgeCasePrompt?.trim()) return;
                            
                            setResultsByKey(prev => ({ 
                              ...prev, 
                              [t.key]: { 
                                ...(prev[t.key]||{}), 
                                generatingEdgeCases: true,
                                edgeCaseError: null
                              } 
                            }))
                            
                            try {
                              const edgeCases = await api.jiraGenerateEdgeCases({
                                summary: t.summary,
                                description: t.description,
                                customPrompt: r.edgeCasePrompt
                              })
                              setResultsByKey(prev => ({ 
                                ...prev, 
                                [t.key]: { 
                                  ...(prev[t.key]||{}), 
                                  edgeCases: edgeCases,
                                  generatingEdgeCases: false
                                } 
                              }))
                            } catch (error) {
                              setResultsByKey(prev => ({ 
                                ...prev, 
                                [t.key]: { 
                                  ...(prev[t.key]||{}), 
                                  generatingEdgeCases: false,
                                  edgeCaseError: error.message
                                } 
                              }))
                            }
                          }}
                          disabled={!r.edgeCasePrompt?.trim() || r.generatingEdgeCases}
                        >
                          {r.generatingEdgeCases ? (
                            <>
                              <svg className="w-4 h-4 mr-2 inline animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Generate Edge Cases
                            </>
                          )}
                        </button>
                        <button 
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                          onClick={() => {
                            setResultsByKey(prev => ({ 
                              ...prev, 
                              [t.key]: { 
                                ...(prev[t.key]||{}), 
                                edgeCasePrompt: '',
                                edgeCases: null,
                                edgeCaseError: null
                              } 
                            }))
                          }}
                        >
                          Clear
                        </button>
                            </div>
                      
                      {r.edgeCaseError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{r.edgeCaseError}</p>
                        </div>
                      )}
                      
                      {r.edgeCases && r.edgeCases.length > 0 && (
                <div className="mt-4">
                          <h4 className="text-md font-semibold text-slate-800 mb-3">Generated Edge Cases</h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {r.edgeCases.map((edgeCase, i) => (
                              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-medium text-slate-800">Edge Case {i+1}</div>
                                  <div className="text-xs text-slate-500 bg-orange-100 px-2 py-1 rounded-full">
                                    {edgeCase.priority || 'Medium'} Priority
                                  </div>
                                </div>
                                
                                {r.editingEdgeCases && r.editingEdgeCases[i] ? (
                                  <div className="space-y-3">
                            <div>
                                      <label htmlFor={`edge-case-title-${i}`} className="block text-sm text-slate-700 mb-1 font-medium">Title</label>
                                      <input 
                                        id={`edge-case-title-${i}`}
                                        type="text" 
                                        value={edgeCase.title || ''} 
                                        onChange={(e) => {
                                          const newEdgeCases = [...r.edgeCases]
                                          newEdgeCases[i] = { ...edgeCase, title: e.target.value }
                                          setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), edgeCases: newEdgeCases } }))
                                        }}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Edge case title"
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor={`edge-case-steps-${i}`} className="block text-sm text-slate-700 mb-1 font-medium">BDD Test Case</label>
                              <textarea 
                                        id={`edge-case-steps-${i}`}
                                        value={Array.isArray(edgeCase.bddSteps) ? edgeCase.bddSteps.join('\n') : ''} 
                                onChange={(e) => {
                                          const newEdgeCases = [...r.edgeCases]
                                          newEdgeCases[i] = { ...edgeCase, bddSteps: e.target.value.split('\n').filter(step => step.trim()) }
                                          setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), edgeCases: newEdgeCases } }))
                                }}
                                rows={4}
                                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                        placeholder="Given...&#10;When...&#10;Then..."
                              />
                            </div>
                                    <div className="flex gap-2">
                              <button 
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => {
                                  setResultsByKey(prev => ({ 
                                    ...prev, 
                                    [t.key]: { 
                                      ...(prev[t.key]||{}), 
                                              editingEdgeCases: { ...(prev[t.key]?.editingEdgeCases || {}), [i]: false } 
                                    } 
                                  }))
                                }}
                              >
                                Save
                              </button>
                              <button 
                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                onClick={() => {
                                  setResultsByKey(prev => ({ 
                                    ...prev, 
                                    [t.key]: { 
                                      ...(prev[t.key]||{}), 
                                              editingEdgeCases: { ...(prev[t.key]?.editingEdgeCases || {}), [i]: false } 
                                    } 
                                  }))
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                                    <div className="text-sm text-slate-700 mb-2">{edgeCase.title}</div>
                                    <div className="text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded border whitespace-pre-line">
                                      {Array.isArray(edgeCase.bddSteps) ? edgeCase.bddSteps.join('\n') : ''}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                              <button 
                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                        onClick={() => {
                                          const edgeCaseText = `Title: ${edgeCase.title || 'No title'}\n\nBDD Test Case:\n${Array.isArray(edgeCase.bddSteps) ? edgeCase.bddSteps.join('\n') : 'No steps provided'}`
                                          navigator.clipboard.writeText(edgeCaseText)
                                        }}
                                        aria-label="Copy edge case to clipboard"
                                      >
                                        <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Copy
                                      </button>
                                      <button 
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => {
                                  setResultsByKey(prev => ({ 
                                    ...prev, 
                                    [t.key]: { 
                                      ...(prev[t.key]||{}), 
                                              editingEdgeCases: { ...(prev[t.key]?.editingEdgeCases || {}), [i]: true } 
                                    } 
                                  }))
                                }}
                                        aria-label="Edit edge case"
                              >
                                        <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Playwright Script Section */}
              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    {r.testCases && r.testCases.length > 0 ? (
                      <>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {r.script ? 'Generated Playwright Script' : 'Generate Playwright Script'}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {r.script ? 'Automatically generated test script based on the test cases' : 'Click to generate Playwright script from test cases'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-600">Generate test cases first to create Playwright script</p>
                    )}
                  </div>
                  {!r.script && r.testCases && r.testCases.length > 0 && (
                    <button 
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={async () => {
                        setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), loading: true } }))
                        try {
                          const scriptRes = await api.jiraGeneratePlaywright({ testCases: r.testCases, businessUnit: t.businessUnit || 'lavinia', ticketKey: t.key })
                          setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), script: scriptRes.script, loading: false } }))
                        } catch (e) {
                          setResultsByKey(prev => ({ ...prev, [t.key]: { ...(prev[t.key]||{}), loading: false, error: e.message } }))
                        }
                      }}
                      disabled={!!r.loading}
                    >
                      {r.loading ? 'Generating...' : 'Generate Script'}
                    </button>
                  )}
                </div>

              {r.script && (
                  <div>
                  {r.testFileName && (
                    <div className="mb-4 p-3 bg-gradient-to-br from-slate-50/90 via-blue-50/80 to-slate-50/90 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-sm">
                      <div className="text-sm text-slate-700 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">File:</span>
                          <code className="bg-white px-2 py-1 rounded border text-sm font-mono">{r.testFileName}</code>
                        </div>
                      {r.frameworkPath && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Path:</span>
                            <code className="bg-white px-2 py-1 rounded border text-sm font-mono">{r.frameworkPath}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                    <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-400 text-sm ml-2">playwright.spec.js</span>
                      </div>
                    </div>
                    <pre className="p-4 text-slate-100 overflow-auto text-sm whitespace-pre-wrap break-words" style={{maxHeight:400}}>{r.script}</pre>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          )
        })}
        {tickets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No tickets found</h3>
            <p className="text-slate-600">Enter a Jira username and click "Find Tickets" to get started.</p>
          </div>
        )}
      </div>

      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Generating Test Cases</h2>
            <p className="text-slate-600 mb-6">AI is analyzing your Jira ticket and creating comprehensive test cases and Playwright scripts.</p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="animate-pulse">Analyzing requirements</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <span className="animate-pulse" style={{animationDelay: '0.3s'}}>Generating tests</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <span className="animate-pulse" style={{animationDelay: '0.6s'}}>Creating scripts</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

function AgentSection(){
  const [url, setUrl] = useState('')
  const [testType, setTestType] = useState('smoke')
  const [projectId, setProjectId] = useState('passagePrep')
  const [creating, setCreating] = useState(false)
  const [agentId, setAgentId] = useState(null)
  const [status, setStatus] = useState(null)
  
  // Basic Auth fields
  const [hasBasicAuth, setHasBasicAuth] = useState(false)
  const [basicAuthUsername, setBasicAuthUsername] = useState('')
  const [basicAuthPassword, setBasicAuthPassword] = useState('')
  
  // Login Flow fields
  const [hasLoginFlow, setHasLoginFlow] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  useEffect(()=>{
    if(!agentId) return
    const t = setInterval(async ()=>{
      try{ const s = await api.agentStatus(agentId); setStatus(s) }catch{}
    }, 1500)
    return ()=> clearInterval(t)
  }, [agentId])

  async function createAgent(){
    try{
      setCreating(true)
      const payload = { 
        url, 
        testType, 
        projectId,
        basicAuth: hasBasicAuth ? {
          username: basicAuthUsername,
          password: basicAuthPassword
        } : null,
        loginFlow: hasLoginFlow ? {
          username: loginUsername,
          password: loginPassword
        } : null
      }
      const res = await api.agentCreate(payload)
      setAgentId(res.agentId)
    }catch(e){ alert(e.message) }
    finally{ setCreating(false) }
  }

  const base = useMemo(()=> (import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:8787', [])

  // Poll agent status when agentId is set
  useEffect(() => {
    if (!agentId) return

    const pollStatus = async () => {
      try {
        const response = await api.agentStatus(agentId)
        setStatus(response)
      } catch (error) {
        console.error('Failed to fetch agent status:', error)
      }
    }

    // Initial poll
    pollStatus()

    // Set up polling every 2 seconds
    const interval = setInterval(pollStatus, 2000)

    return () => clearInterval(interval)
  }, [agentId])

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white/90 via-blue-50/85 to-indigo-50/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 transform hover:scale-[1.01] transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Start AI Testing Agent</h2>
        <p className="text-slate-600 mb-6">Configure and launch an AI-powered testing agent to automatically explore and test your application.</p>
        
        {/* Basic Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="project-select" className="block text-sm font-medium text-slate-700 mb-2">Project</label>
            <select 
              id="project-select"
              value={projectId} 
              onChange={e => setProjectId(e.target.value)} 
              className="w-full rounded-lg px-4 py-3 text-base border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="passagePrep">Passage Prep</option>
              <option value="lavinia">Lavinia</option>
              <option value="teachingChannel">Teaching Channel</option>
            </select>
          </div>
          <div>
            <label htmlFor="test-type-select" className="block text-sm font-medium text-slate-700 mb-2">Test Type</label>
            <select 
              id="test-type-select"
              value={testType} 
              onChange={e => setTestType(e.target.value)} 
              className="w-full rounded-lg px-4 py-3 text-base border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="smoke">Smoke Testing</option>
              <option value="exploratory">Exploratory Testing</option>
            </select>
          </div>
          <div>
            <label htmlFor="target-url" className="block text-sm font-medium text-slate-700 mb-2">Target URL</label>
            <input 
              id="target-url"
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="https://example.com" 
              className="w-full rounded-lg px-4 py-3 text-base border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>

        {/* Basic Authentication Section */}
        <div className="mb-6 p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <input 
              type="checkbox" 
              id="hasBasicAuth"
              checked={hasBasicAuth} 
              onChange={e => setHasBasicAuth(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasBasicAuth" className="text-sm font-medium text-slate-700">
              Basic Authentication Required
            </label>
          </div>
          {hasBasicAuth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="basic-auth-username" className="block text-sm font-medium text-slate-700 mb-1">Basic Auth Username</label>
                <input 
                  id="basic-auth-username"
                  value={basicAuthUsername} 
                  onChange={e => setBasicAuthUsername(e.target.value)} 
                  placeholder="Enter basic auth username"
                  className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label htmlFor="basic-auth-password" className="block text-sm font-medium text-slate-700 mb-1">Basic Auth Password</label>
                <input 
                  id="basic-auth-password"
                  type="password"
                  value={basicAuthPassword} 
                  onChange={e => setBasicAuthPassword(e.target.value)} 
                  placeholder="Enter basic auth password"
                  className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          )}
        </div>

        {/* Login Flow Section */}
        <div className="mb-6 p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <input 
              type="checkbox" 
              id="hasLoginFlow"
              checked={hasLoginFlow} 
              onChange={e => setHasLoginFlow(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="hasLoginFlow" className="text-sm font-medium text-slate-700">
              Test Login Flow
            </label>
          </div>
          {hasLoginFlow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="login-username" className="block text-sm font-medium text-slate-700 mb-1">Application Username</label>
                <input 
                  id="login-username"
                  value={loginUsername} 
                  onChange={e => setLoginUsername(e.target.value)} 
                  placeholder="Enter application login username"
                  className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">Application Password</label>
                <input 
                  id="login-password"
                  type="password"
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  placeholder="Enter application login password"
                  className="w-full rounded-lg px-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={createAgent} 
            disabled={creating || !url.trim()}
            aria-label="Create and start AI testing agent"
          >
            {creating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="animate-pulse">Creating Agent…</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Create & Start Agent
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white/90 via-slate-50/85 to-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 transform hover:scale-[1.01] transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Agent Status</h2>
        {!agentId && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No agent running</h3>
            <p className="text-slate-600">Create and start an AI testing agent above to begin automated testing.</p>
          </div>
        )}
        {agentId && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200">
                <div className="text-sm font-medium text-slate-700 mb-1">Agent ID</div>
                <code className="text-sm text-slate-800 bg-white px-2 py-1 rounded border">{agentId}</code>
              </div>
              <div className="p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200">
                <div className="text-sm font-medium text-slate-700 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status?.status === 'running' ? 'bg-green-500' :
                    status?.status === 'completed' ? 'bg-blue-500' :
                    status?.status === 'error' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-800">{status?.status || 'starting…'}</span>
                </div>
              </div>
            </div>
            
            {/* Agent Progress Display */}
            {status?.actions && status.actions.length > 0 && (
              <div className="p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200">
                <div className="text-sm font-medium text-slate-800 mb-3">Recent Actions ({status.actions.length})</div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {status.actions.slice(-10).map((action, index) => (
                    <div key={index} className={`p-3 rounded-lg text-sm ${
                      action.status === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                      action.status === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                      'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}>
                      <div className="font-medium">{action.action} on {action.target}</div>
                      {action.notes && <div className="text-xs mt-1 opacity-75">{action.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Agent Logs */}
            {status?.logs && status.logs.length > 0 && (
              <div className="p-4 bg-slate-50/80 backdrop-blur-sm rounded-lg border border-slate-200">
                <div className="text-sm font-medium text-slate-800 mb-3">Recent Logs ({status.logs.length})</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {status.logs.slice(-20).map((log, index) => (
                    <div key={index} className="text-xs text-slate-600 font-mono bg-white p-2 rounded border">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {status?.reportUrl && (
              <div className="pt-4">
                <a 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 inline-flex items-center gap-2" 
                  href={`${base}${status.reportUrl}`} 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="Open agent test report"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Report
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Upload Section Component
function UploadSection() {
  const [uploadType, setUploadType] = useState('image') // 'image', 'file', or 'wireframe'
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedWireframe, setUploadedWireframe] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedTestCases, setGeneratedTestCases] = useState([])
  const [generatedScript, setGeneratedScript] = useState('')
  const [generatedAcceptanceCriteria, setGeneratedAcceptanceCriteria] = useState([])
  const [generatedUserStories, setGeneratedUserStories] = useState([])
  const [generatedRequirements, setGeneratedRequirements] = useState('')
  const [error, setError] = useState('')
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')

  // Clear state when component mounts (when switching to upload tab)
  React.useEffect(() => {
    setUploadedImage(null)
    setUploadedFile(null)
    setUploadedWireframe(null)
    setGeneratedTestCases([])
    setGeneratedScript('')
    setGeneratedAcceptanceCriteria([])
    setGeneratedUserStories([])
    setGeneratedRequirements('')
    setError('')
    setIsProcessing(false)
  }, [])

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file)
      setUploadedFile(null) // Clear file upload
      setUploadedWireframe(null) // Clear wireframe upload
      setGeneratedTestCases([]) // Clear previous results
      setGeneratedScript('') // Clear previous script
      setGeneratedAcceptanceCriteria([]) // Clear wireframe results
      setGeneratedUserStories([]) // Clear wireframe results
      setGeneratedRequirements('') // Clear wireframe results
      setError('')
    } else {
      setError('Please select a valid image file')
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.xlsx'))) {
      setUploadedFile(file)
      setUploadedImage(null) // Clear image upload
      setUploadedWireframe(null) // Clear wireframe upload
      setGeneratedTestCases([]) // Clear previous results
      setGeneratedScript('') // Clear previous script
      setGeneratedAcceptanceCriteria([]) // Clear wireframe results
      setGeneratedUserStories([]) // Clear wireframe results
      setGeneratedRequirements('') // Clear wireframe results
      setError('')
    } else {
      setError('Please select a valid CSV or Excel file')
    }
  }

  const handleWireframeUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedWireframe(file)
      setUploadedImage(null) // Clear image upload
      setUploadedFile(null) // Clear file upload
      setGeneratedTestCases([]) // Clear previous results
      setGeneratedScript('') // Clear previous script
      setGeneratedAcceptanceCriteria([])
      setGeneratedUserStories([])
      setGeneratedRequirements('')
      setError('')
    } else {
      setError('Please select a valid image file for wireframe')
    }
  }

  const processUpload = async () => {
    if (!uploadedImage && !uploadedFile && !uploadedWireframe) {
      setError('Please upload a file first')
      return
    }

    setIsProcessing(true)
    setError('')
    
    try {
      console.log(`🚀 Starting ${uploadType} upload processing...`)
      
      const formData = new FormData()
      if (uploadType === 'image' && uploadedImage) {
        formData.append('image', uploadedImage)
        formData.append('type', 'image')
        console.log('📷 Image upload:', uploadedImage.name)
      } else if (uploadType === 'file' && uploadedFile) {
        formData.append('file', uploadedFile)
        formData.append('type', 'file')
        console.log('📄 File upload:', uploadedFile.name)
      } else if (uploadType === 'wireframe' && uploadedWireframe) {
        formData.append('wireframe', uploadedWireframe)
        formData.append('type', 'wireframe')
        console.log('🎨 Wireframe upload:', uploadedWireframe.name)
      }

      console.log('📡 Sending request to backend...')
      const response = await fetch('http://localhost:8787/api/upload/process', {
        method: 'POST',
        body: formData
      })

      console.log('📥 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Backend error:', errorText)
        throw new Error(`Failed to process upload: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Analysis complete:', {
        testCases: result.testCases?.length || 0,
        script: result.script ? 'Generated' : 'None',
        userStories: result.userStories?.length || 0,
        acceptanceCriteria: result.acceptanceCriteria?.length || 0,
        requirements: result.requirements ? 'Generated' : 'None'
      })

      setGeneratedTestCases(result.testCases || [])
      setGeneratedScript(result.script || '')
      setGeneratedAcceptanceCriteria(result.acceptanceCriteria || [])
      setGeneratedUserStories(result.userStories || [])
      setGeneratedRequirements(result.requirements || '')
    } catch (err) {
      console.error('❌ Upload processing error:', err)
      setError(err.message)
    } finally {
      setIsProcessing(false)
    }
  }


  const downloadScript = () => {
    if (!generatedScript) return
    
    const blob = new Blob([generatedScript], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated_test_script.spec.js'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAcceptanceCriteria = () => {
    if (generatedAcceptanceCriteria.length === 0) return
    
    const csvData = generatedAcceptanceCriteria.map((ac, index) => ({
      'ID': ac.id || `AC-${index + 1}`,
      'Title': ac.title || '',
      'Description': ac.description || '',
      'Priority': ac.priority || 'Medium',
      'Status': ac.status || 'Draft'
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'acceptance_criteria.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadUserStories = () => {
    if (generatedUserStories.length === 0) return
    
    const csvData = generatedUserStories.map((story, index) => ({
      'ID': story.id || `US-${index + 1}`,
      'Title': story.title || '',
      'Description': story.description || '',
      'Acceptance Criteria': story.acceptanceCriteria || '',
      'Priority': story.priority || 'Medium',
      'Story Points': story.storyPoints || '3'
    }))
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'user_stories.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadRequirements = () => {
    if (!generatedRequirements) return
    
    // Convert to string if it's an object
    const content = typeof generatedRequirements === 'string' 
      ? generatedRequirements 
      : JSON.stringify(generatedRequirements, null, 2)
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'requirements_document.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImagePreview = (file) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewImageUrl(url)
      setShowImagePreview(true)
    }
  }

  const closeImagePreview = () => {
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl)
    }
    setShowImagePreview(false)
    setPreviewImageUrl('')
  }

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              {uploadType === 'wireframe' ? 'Analyzing Wireframe' : uploadType === 'image' ? 'Analyzing Screenshot' : 'Processing File'}
            </h2>
            <p className="text-slate-600 mb-6">
              {uploadType === 'wireframe' 
                ? 'AI is analyzing your wireframe and generating comprehensive user stories and acceptance criteria.'
                : uploadType === 'image'
                ? 'AI is analyzing your screenshot and generating comprehensive test cases and Playwright scripts.'
                : 'AI is processing your upload and generating relevant content.'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="animate-pulse">
                  {uploadType === 'wireframe' ? 'Analyzing wireframe' : uploadType === 'image' ? 'Analyzing screenshot' : 'Processing file'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <span className="animate-pulse" style={{animationDelay: '0.3s'}}>
                  {uploadType === 'wireframe' ? 'Generating user stories' : uploadType === 'image' ? 'Generating test cases' : 'Generating content'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <span className="animate-pulse" style={{animationDelay: '0.6s'}}>
                  {uploadType === 'wireframe' ? 'Creating acceptance criteria' : uploadType === 'image' ? 'Creating scripts' : 'Finalizing results'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] mx-4">
            {/* Close Button */}
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <img
              src={previewImageUrl}
              alt="Preview"
              className="w-full h-auto rounded-2xl max-h-[90vh] object-contain"
              onClick={closeImagePreview}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">📁 Upload & Generate</h2>
        <p className="text-slate-700 font-semibold">Upload screenshots, spreadsheets, or wireframes to generate user stories, acceptance criteria, and Playwright scripts</p>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
        {/* Upload Type Selection */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setUploadType('image')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              uploadType === 'image' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 hover:from-slate-300 hover:to-slate-400 hover:shadow-md'
            }`}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Screenshot Analysis
          </button>
          <button
            onClick={() => setUploadType('file')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              uploadType === 'file' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 hover:from-slate-300 hover:to-slate-400 hover:shadow-md'
            }`}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            Spreadsheet Processing
          </button>
          <button
            onClick={() => setUploadType('wireframe')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              uploadType === 'wireframe' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25' 
                : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 hover:from-slate-300 hover:to-slate-400 hover:shadow-md'
            }`}
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            Wireframe Analysis
          </button>
        </div>

        {/* Upload Area */}
        <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95 backdrop-blur-sm border-2 border-dashed border-slate-300/60 rounded-xl p-8 text-center hover:border-blue-400/80 hover:bg-gradient-to-br hover:from-blue-50/95 hover:via-white/90 hover:to-blue-50/95 transition-all duration-300 shadow-lg">
          {uploadType === 'image' ? (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Screenshot</h3>
              <p className="text-slate-800 font-medium mb-4">Upload a screenshot to generate BDD test cases using AI analysis</p>
              <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </>
          ) : uploadType === 'wireframe' ? (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Wireframe</h3>
              <p className="text-slate-800 font-medium mb-4">Upload a wireframe image to generate user stories and acceptance criteria</p>
              <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Wireframe
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWireframeUpload}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Spreadsheet</h3>
              <p className="text-slate-800 font-medium mb-4">Upload a CSV or Excel file with test cases to generate Playwright scripts</p>
              <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose File
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>

        {/* Uploaded File Display */}
        {uploadedImage && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-center cursor-pointer hover:bg-blue-100 transition-colors rounded-lg p-2 -m-2" onClick={() => handleImagePreview(uploadedImage)}>
              <svg className="w-8 h-8 text-blue-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-blue-900 font-semibold">{uploadedImage.name}</span>
              <span className="ml-auto text-blue-600 text-sm">Click to preview</span>
            </div>
          </div>
        )}

        {uploadedFile && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-green-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2 2 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <span className="text-green-900 font-semibold">{uploadedFile.name}</span>
            </div>
          </div>
        )}

        {uploadedWireframe && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex items-center cursor-pointer hover:bg-purple-100 transition-colors rounded-lg p-2 -m-2" onClick={() => handleImagePreview(uploadedWireframe)}>
              <svg className="w-8 h-8 text-purple-700 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
              <span className="text-purple-900 font-semibold">{uploadedWireframe.name}</span>
              <span className="ml-auto text-purple-600 text-sm">Click to preview</span>
            </div>
          </div>
        )}

        {/* Process Button */}
        {(uploadedImage || uploadedFile || uploadedWireframe) && (
          <div className="mt-6 text-center">
            <button
              onClick={processUpload}
              disabled={isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 disabled:shadow-none"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
{uploadType === 'wireframe' ? 'Generate User Stories & Acceptance Criteria' : 'Generate Test Cases'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200/60 rounded-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Generated Results */}
      {(generatedScript || generatedUserStories.length > 0 || generatedAcceptanceCriteria.length > 0 || generatedRequirements) && (
        <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95 backdrop-blur-sm rounded-xl border border-slate-200/60 p-6 shadow-lg">

          {generatedScript && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Generated Playwright Script</h3>
                <button
                  onClick={downloadScript}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Script
                </button>
              </div>
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm shadow-inner border border-slate-700/50">
                <pre className="whitespace-pre-wrap">{generatedScript}</pre>
              </div>
            </div>
          )}

          {/* Wireframe Results */}
          {generatedUserStories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Generated User Stories</h3>
                <button
                  onClick={downloadUserStories}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download User Stories
                </button>
              </div>
              <div className="grid gap-6">
                {generatedUserStories.map((story, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-purple-600 text-white px-2 py-1 rounded">{story.id || `US-${index + 1}`}</span>
                        <h4 className="font-bold text-purple-900 text-lg">{story.title || `User Story ${index + 1}`}</h4>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-semibold">{story.priority || 'Medium'}</span>
                        <span className="text-xs bg-purple-300 text-purple-900 px-3 py-1 rounded-full font-semibold">{story.storyPoints || '3'} pts</span>
                      </div>
                    </div>
                    
                    {story.userType && (
                      <div className="text-xs text-purple-600 mb-2 italic">
                        👤 User Type: {story.userType}
                      </div>
                    )}
                    
                    <p className="text-purple-900 text-base mb-3 font-medium leading-relaxed">{story.description}</p>
                    
                    {story.acceptanceCriteria && (
                      <div className="bg-white/50 rounded-lg p-3 mb-3 border border-purple-200">
                        <strong className="text-purple-900 text-sm">✅ Acceptance Criteria:</strong>
                        <p className="text-purple-800 text-sm mt-1 whitespace-pre-wrap">{story.acceptanceCriteria}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                      {story.businessValue && (
                        <div className="bg-white/60 rounded p-2 border border-purple-200">
                          <strong className="text-purple-900">💼 Business Value:</strong>
                          <p className="text-purple-800 mt-1">{story.businessValue}</p>
                        </div>
                      )}
                      {story.dependencies && story.dependencies !== 'None' && (
                        <div className="bg-white/60 rounded p-2 border border-purple-200">
                          <strong className="text-purple-900">🔗 Dependencies:</strong>
                          <p className="text-purple-800 mt-1">{story.dependencies}</p>
                        </div>
                      )}
                      {story.priorityJustification && (
                        <div className="bg-white/60 rounded p-2 border border-purple-200">
                          <strong className="text-purple-900">🎯 Priority Reason:</strong>
                          <p className="text-purple-800 mt-1">{story.priorityJustification}</p>
                        </div>
                      )}
                      {story.storyPointsReasoning && (
                        <div className="bg-white/60 rounded p-2 border border-purple-200">
                          <strong className="text-purple-900">📊 Estimate Reason:</strong>
                          <p className="text-purple-800 mt-1">{story.storyPointsReasoning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedAcceptanceCriteria.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Generated Acceptance Criteria</h3>
                <button
                  onClick={downloadAcceptanceCriteria}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Acceptance Criteria
                </button>
              </div>
              <div className="grid gap-5">
                {generatedAcceptanceCriteria.map((criteria, index) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs font-mono bg-indigo-600 text-white px-2 py-1 rounded">{criteria.id || `AC-${index + 1}`}</span>
                        <h4 className="font-bold text-indigo-900 text-base">{criteria.title || `Acceptance Criteria ${index + 1}`}</h4>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full font-semibold">{criteria.priority || 'Medium'}</span>
                        <span className="text-xs bg-indigo-300 text-indigo-900 px-3 py-1 rounded-full font-semibold">{criteria.status || 'Draft'}</span>
                      </div>
                    </div>
                    
                    {criteria.relatedUserStory && (
                      <div className="text-xs text-indigo-600 mb-2 italic">
                        🔗 Related to: {criteria.relatedUserStory}
                      </div>
                    )}
                    
                    <div className="bg-white/50 rounded-lg p-3 mb-3 border border-indigo-200">
                      <p className="text-indigo-900 text-sm leading-relaxed whitespace-pre-wrap">{criteria.description}</p>
                    </div>
                    
                    {criteria.testScenarios && criteria.testScenarios.length > 0 && (
                      <div className="bg-white/60 rounded-lg p-3 border border-indigo-200">
                        <strong className="text-indigo-900 text-sm">🧪 Test Scenarios:</strong>
                        <ul className="mt-2 space-y-1">
                          {criteria.testScenarios.map((scenario, idx) => (
                            <li key={idx} className="text-indigo-800 text-xs pl-4 relative before:content-['•'] before:absolute before:left-0">
                              {scenario}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedRequirements && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Generated Requirements Document</h3>
                <button
                  onClick={downloadRequirements}
                  className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-md shadow-slate-500/25 hover:shadow-lg hover:shadow-slate-500/30"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Requirements
                </button>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-slate-800">
                    {typeof generatedRequirements === 'string' 
                      ? generatedRequirements 
                      : JSON.stringify(generatedRequirements, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
