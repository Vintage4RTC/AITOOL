import React, { useState, useEffect } from 'react'
import { api } from '../../api.js'
import Editor from '@monaco-editor/react'

export default function AutomationScriptsSection() {
  const [selectedProduct, setSelectedProduct] = useState('lavinia')
  const [testCases, setTestCases] = useState({})
  const [loadingTestCases, setLoadingTestCases] = useState(false)
  const [wsConnection, setWsConnection] = useState(null)
  
  // Individual test execution state
  const [executionLogs, setExecutionLogs] = useState({})
  const [executionStatus, setExecutionStatus] = useState({})
  const [activeExecutions, setActiveExecutions] = useState(new Set())
  
  // Add Test Class Modal State
  const [showAddTestModal, setShowAddTestModal] = useState(false)
  const [selectedProductForNewTest, setSelectedProductForNewTest] = useState('lavinia')
  const [newTestName, setNewTestName] = useState('')
  const [newTestCode, setNewTestCode] = useState('')
  const [savingTest, setSavingTest] = useState(false)
  const [saveError, setSaveError] = useState('')
  
  // Edit Test Class Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState('')
  const [editingTestName, setEditingTestName] = useState('')
  const [editingTestCode, setEditingTestCode] = useState('')
  const [loadingTestCode, setLoadingTestCode] = useState(false)
  const [updatingTest, setUpdatingTest] = useState(false)
  const [updateError, setUpdateError] = useState('')
  
  // Run Mode Selection Modal State
  const [showRunModeModal, setShowRunModeModal] = useState(false)
  const [selectedTestToRun, setSelectedTestToRun] = useState({ product: '', testClass: '' })
  const [runMode, setRunMode] = useState('headless')
  const [runBrowser, setRunBrowser] = useState('chromium')
  
  // Filter and Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All Types')
  const [filterStatus, setFilterStatus] = useState('All Statuses')
  const [selectedTests, setSelectedTests] = useState(new Set())
  const [selectMultipleMode, setSelectMultipleMode] = useState(false)
  
  // Test Navigation State
  const [showTestDropdown, setShowTestDropdown] = useState(false)
  const [selectedTestForNavigation, setSelectedTestForNavigation] = useState('')

  const products = [
    { id: 'lavinia', name: 'Lavinia', icon: '⚙️', color: 'purple' },
    { id: 'passage-prep', name: 'Passage Prep', icon: '🎯', color: 'green' },
    { id: 'teaching-channel', name: 'Teaching Channel', icon: '📚', color: 'blue' }
  ]

  // Fetch all test cases for a product
  const fetchTestCases = async (product) => {
    try {
      setLoadingTestCases(true)
      const response = await api.getProductTestCases(product)
      if (response.success) {
        setTestCases(prev => ({ ...prev, [product]: response.testCases }))
      }
    } catch (error) {
      console.error(`Error fetching test cases for ${product}:`, error)
    } finally {
      setLoadingTestCases(false)
    }
  }

  // Run individual test case
  const runIndividualTestCase = async (product, testClass, testId, mode = 'headless') => {
    const testKey = `${product}-${testClass}-${testId}`
    
    console.log(`🎭 Starting individual test execution: ${testKey} in ${mode} mode`)
    console.log(`📝 Parameters:`, { product, testClass, testId, mode })
    
    try {
      setActiveExecutions(prev => new Set([...prev, testKey]))
      setExecutionStatus(prev => ({ ...prev, [testKey]: { status: 'starting' } }))
      setExecutionLogs(prev => ({ ...prev, [testKey]: [] }))

      const response = await api.runIndividualTestCaseStreaming({
        product,
        testClass,
        testId,
        mode,
        browser: 'chromium'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = line.slice(6).trim()
              console.log('📡 Raw SSE data:', jsonData)
              const data = JSON.parse(jsonData)
              console.log('📡 Parsed SSE data:', data)
              handleStreamEvent(testKey, data)
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Raw line:', line)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to start execution:', error)
      setExecutionStatus(prev => ({ 
        ...prev, 
        [testKey]: { status: 'error', message: error.message } 
      }))
      setActiveExecutions(prev => {
        const newSet = new Set(prev)
        newSet.delete(testKey)
        return newSet
      })
    }
  }

  // Handle streaming events for individual test execution
  const handleStreamEvent = (testKey, data) => {
    const { type, runId, message, level, status, reportUrl } = data
    
    console.log(`📡 Stream event for ${testKey}:`, data)

    switch (type) {
      case 'connected':
        setExecutionStatus(prev => ({ 
          ...prev, 
          [testKey]: { status: 'connected', runId } 
        }))
        break

      case 'test_started':
        setExecutionStatus(prev => ({ 
          ...prev, 
          [testKey]: { status: 'running', runId, message } 
        }))
        break

      case 'headless_mode':
        setExecutionLogs(prev => ({
          ...prev,
          [testKey]: [...(prev[testKey] || []), { 
            message: `👻 ${message}`, 
            level: 'info', 
            timestamp: Date.now() 
          }]
        }))
        break

      case 'test_running':
        setExecutionStatus(prev => ({ 
          ...prev, 
          [testKey]: { ...prev[testKey], status: 'running', message } 
        }))
        break

      case 'log':
        setExecutionLogs(prev => ({
          ...prev,
          [testKey]: [...(prev[testKey] || []), { message, level, timestamp: Date.now() }]
        }))
        break

      case 'test_completed':
        setExecutionStatus(prev => ({ 
          ...prev, 
          [testKey]: { ...prev[testKey], status: 'completed', testStatus: status } 
        }))
        break

        case 'step_completed':
          // Handle real-time step completion with screenshots
          setExecutionStatus(prev => ({
            ...prev,
            [testKey]: {
              ...prev[testKey],
              steps: prev[testKey]?.steps || [],
              stepScreenshots: prev[testKey]?.stepScreenshots || []
            }
          }))
          
          // Add the completed step to the steps array
          setExecutionStatus(prev => ({
            ...prev,
            [testKey]: {
              ...prev[testKey],
              steps: [...(prev[testKey]?.steps || []), {
                stepNumber: data.stepNumber,
                title: data.stepTitle,
                status: data.status,
                duration: data.duration,
                timestamp: data.timestamp
              }],
              stepScreenshots: [...(prev[testKey]?.stepScreenshots || []), {
                stepNumber: data.stepNumber,
                screenshotUrl: `http://localhost:8787${data.screenshotUrl}`,
                timestamp: data.timestamp
              }]
            }
          }))
          break

        case 'test_finished':
          setExecutionStatus(prev => ({ 
            ...prev, 
            [testKey]: { 
              ...prev[testKey], 
              status: 'finished', 
              success: data.success,
              reportUrl: reportUrl ? `http://localhost:8787${reportUrl}` : null,
              exitCode: data.exitCode,
              screenshots: data.screenshots || [],
              videos: data.videos || [],
              testSteps: data.testSteps || []
            } 
          }))
          setActiveExecutions(prev => {
            const newSet = new Set(prev)
            newSet.delete(testKey)
            return newSet
          })
          break

      case 'error':
        setExecutionStatus(prev => ({ 
          ...prev, 
          [testKey]: { status: 'error', message } 
        }))
        setActiveExecutions(prev => {
          const newSet = new Set(prev)
          newSet.delete(testKey)
          return newSet
        })
        break
    }
  }

  // Stop execution
  const stopExecution = (testKey) => {
    setActiveExecutions(prev => {
      const newSet = new Set(prev)
      newSet.delete(testKey)
      return newSet
    })
    setExecutionStatus(prev => ({ 
      ...prev, 
      [testKey]: { 
        status: 'stopped', 
        message: 'Execution stopped by user' 
      } 
    }))
  }

  // Setup WebSocket connection
  useEffect(() => {
    const wsUrl = `ws://localhost:8787/ws`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('🔌 WebSocket connected for test case updates')
      setWsConnection(ws)
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'test-classes-changed' || data.type === 'test-class-added' || data.type === 'test-class-updated') {
          console.log('🔄 Test files changed, refreshing test cases...')
          // Refresh test cases for all products
          products.forEach(product => fetchTestCases(product.id))
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
      }
    }
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected')
      setWsConnection(null)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // Load test cases for all products on mount
  useEffect(() => {
    products.forEach(product => fetchTestCases(product.id))
  }, [])

  // Load test cases when selected product changes
  useEffect(() => {
    fetchTestCases(selectedProduct)
  }, [selectedProduct])

  // Filter test cases based on search term, type, and status
  const filterTestCases = (testCases) => {
    return testCases.map(fileInfo => ({
      ...fileInfo,
      testCases: fileInfo.testCases.filter(testCase => {
        const testKey = `${selectedProduct}-${fileInfo.testClass}-${testCase.id}`
        const testStatus = executionStatus[testKey]?.testStatus || testCase.status
        
        // Search filter
        const matchesSearch = searchTerm === '' || 
          testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testCase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testCase.description.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Type filter
        const matchesType = filterType === 'All Types' || testCase.type === filterType.toLowerCase()
        
        // Status filter
        const matchesStatus = filterStatus === 'All Statuses' || 
          (filterStatus === 'Not Run' && testStatus === 'not_run') ||
          (filterStatus === 'Passed' && testStatus === 'passed') ||
          (filterStatus === 'Failed' && testStatus === 'failed')
        
        return matchesSearch && matchesType && matchesStatus
      })
    })).filter(fileInfo => fileInfo.testCases.length > 0)
  }

  // Get test cases for current product
  const currentTestCases = testCases[selectedProduct] || []
  const filteredTestCases = filterTestCases(currentTestCases)
  const totalTestCases = filteredTestCases.reduce((sum, file) => sum + file.testCases.length, 0)

  // Get all test cases for navigation dropdown
  const getAllTestCasesForNavigation = () => {
    const allTests = []
    Object.entries(testCases).forEach(([productId, productTestCases]) => {
      const product = products.find(p => p.id === productId)
      productTestCases.forEach(fileInfo => {
        fileInfo.testCases.forEach(testCase => {
          allTests.push({
            id: `${productId}-${fileInfo.testClass}-${testCase.id}`,
            displayName: `${product?.icon} ${product?.name} → ${fileInfo.testClass} → ${testCase.title}`,
            productId,
            testClass: fileInfo.testClass,
            testId: testCase.id,
            product: product?.name || productId
          })
        })
      })
    })
    return allTests
  }

  const allTestCasesForNavigation = getAllTestCasesForNavigation()

  // Filter and search handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value)
  const handleTypeFilterChange = (e) => setFilterType(e.target.value)
  const handleStatusFilterChange = (e) => setFilterStatus(e.target.value)
  
  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('All Types')
    setFilterStatus('All Statuses')
  }

  // Handle test navigation
  const handleTestNavigation = (testId) => {
    const test = allTestCasesForNavigation.find(t => t.id === testId)
    if (test) {
      setSelectedProduct(test.productId)
      setSelectedTestForNavigation(testId)
      setShowTestDropdown(false)
      
      // Clear filters to show the selected test
      clearFilters()
      
      // Scroll to the test case after a short delay to allow rendering
      setTimeout(() => {
        const element = document.querySelector(`[data-test-id="${test.testId}"]`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
          }, 3000)
        }
      }, 500)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTestDropdown && !event.target.closest('.test-dropdown')) {
        setShowTestDropdown(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTestDropdown])
  
  const toggleSelectMultiple = () => {
    setSelectMultipleMode(!selectMultipleMode)
    if (selectMultipleMode) {
      setSelectedTests(new Set())
    }
  }
  
  const toggleTestSelection = (testKey) => {
    if (!selectMultipleMode) return
    
    setSelectedTests(prev => {
      const newSet = new Set(prev)
      if (newSet.has(testKey)) {
        newSet.delete(testKey)
        console.log('❌ Deselected test:', testKey)
      } else {
        newSet.add(testKey)
        console.log('✅ Selected test:', testKey)
      }
      console.log('📋 Current selection:', Array.from(newSet))
      return newSet
    })
  }

  // Handle running selected test cases
  const handleRunSelected = async () => {
    if (selectedTests.size === 0) return
    
    // Show modal for mode selection first
    setSelectedTestToRun({ 
      product: 'bulk', 
      testClass: 'bulk', 
      testId: 'bulk',
      selectedTests: Array.from(selectedTests)
    })
    setShowRunModeModal(true)
  }

  // Handle exporting selected test cases
  const handleExportSelected = () => {
    if (selectedTests.size === 0) return
    
    // Create CSV content
    const csvContent = [
      ['Test ID', 'Test Title', 'Product', 'Test Class', 'Type', 'Priority', 'Status'].join(','),
      ...Array.from(selectedTests).map(testKey => {
        const [product, testClass, testId] = testKey.split('-')
        const testCase = testCases[product]?.find(file => file.testClass === testClass)?.testCases?.find(test => test.id === testId)
        const testStatus = executionStatus[testKey]?.testStatus || testCase?.status || 'not_run'
        
        return [
          testId,
          `"${testCase?.title || ''}"`,
          product,
          testClass,
          testCase?.type || '',
          testCase?.priority || '',
          testStatus
        ].join(',')
      })
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selected-test-cases-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">🧪 Test Cases Dashboard</h2>
            <p className="text-slate-600">View and execute individual test cases like testRigor</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-slate-500">Total Test Cases</div>
              <div className="text-2xl font-bold text-slate-800">{totalTestCases}</div>
            </div>
            
            {/* Test Navigation Dropdown */}
            <div className="relative test-dropdown">
              <button
                onClick={() => setShowTestDropdown(!showTestDropdown)}
                className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Navigate Tests
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showTestDropdown && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">All Test Cases</h3>
                      <button
                        onClick={() => setShowTestDropdown(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {allTestCasesForNavigation.length} test cases available
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {allTestCasesForNavigation.length > 0 ? (
                      allTestCasesForNavigation.map((test) => (
                        <button
                          key={test.id}
                          onClick={() => handleTestNavigation(test.id)}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 focus:outline-none focus:bg-slate-50"
                        >
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {test.displayName}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {test.product} • {test.testClass}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-slate-500 text-sm">
                        No test cases available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setShowAddTestModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Test Class
            </button>
          </div>
        </div>
        
        {/* Product Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => {
            const productTestCases = testCases[product.id] || []
            const productTotal = productTestCases.reduce((sum, file) => sum + file.testCases.length, 0)
            
            return (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedProduct === product.id
                    ? `border-${product.color}-500 bg-${product.color}-50`
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{product.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold text-slate-800">{product.name}</div>
                    <div className="text-sm text-slate-500">
                      {productTotal} test cases
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Test Cases List - testRigor Style */}
      <div className="bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {products.find(p => p.id === selectedProduct)?.name} Test Cases
            </h3>
            <p className="text-slate-600">Individual test cases with execution status and controls</p>
          </div>
          {loadingTestCases && (
            <div className="flex items-center text-blue-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading test cases...
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by test case name or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select 
              value={filterType}
              onChange={handleTypeFilterChange}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Types</option>
              <option>Smoke</option>
              <option>Regression</option>
              <option>Integration</option>
            </select>
            <select 
              value={filterStatus}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Statuses</option>
              <option>Not Run</option>
              <option>Passed</option>
              <option>Failed</option>
            </select>
            <button 
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-slate-600">
            {totalTestCases} results
          </div>
          <button 
            onClick={toggleSelectMultiple}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              selectMultipleMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {selectMultipleMode ? 'Exit Selection' : 'Select multiple'}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectMultipleMode && selectedTests.size > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-800">
                  {selectedTests.size} test case{selectedTests.size !== 1 ? 's' : ''} selected
                </span>
                <button 
                  onClick={() => setSelectedTests(new Set())}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleRunSelected}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Run Selected
                </button>
                <button 
                  onClick={handleExportSelected}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Export Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Cases Display - testRigor Style */}
        <div className="space-y-6">
          {filteredTestCases.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">No test cases found</h3>
              <p className="text-slate-500">No test cases available for {products.find(p => p.id === selectedProduct)?.name}</p>
            </div>
          ) : (
            filteredTestCases.map((fileInfo) => (
              <div key={fileInfo.fileName} className="space-y-4">
                {/* Test Class Header */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h4 className="font-semibold text-slate-800">{fileInfo.testClass}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {fileInfo.testCases.length} tests
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Run All
                      </button>
                      <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Individual Test Case Cards */}
                <div className="grid gap-4">
                  {fileInfo.testCases.map((testCase, index) => {
                    const testKey = `${selectedProduct}-${fileInfo.testClass}-${testCase.id}`
                    const isActive = activeExecutions.has(testKey)
                    const status = executionStatus[testKey]?.status || 'not_run'
                    const testStatus = executionStatus[testKey]?.testStatus || testCase.status
                    const executionTime = executionStatus[testKey]?.executionTime
                    const createdDate = new Date().toLocaleDateString()
                    const lastModified = new Date().toLocaleDateString()
                    
                    return (
                      <div key={testCase.id} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow" data-test-id={testCase.id}>
                        {/* Test Case Card Header */}
                        <div className="p-4 border-b border-slate-100">
                          <div className="flex items-start justify-between mb-3">
                            {/* Test Name and Edit Icon */}
                            <div className="flex items-center space-x-2">
                              <h5 className="font-semibold text-slate-900 text-lg">{testCase.title}</h5>
                              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Status Badge - Large and Prominent */}
                            <div className="flex items-center space-x-2">
                              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                testStatus === 'passed' ? 'bg-green-100 text-green-800' :
                                testStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                isActive ? 'bg-blue-100 text-blue-800' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {isActive ? 'Running' : testStatus === 'passed' ? 'Passed' : testStatus === 'failed' ? 'Failed' : 'Not Run'}
                              </span>
                              {executionTime && (
                                <span className="text-sm text-slate-500">
                                  {executionTime}
                                </span>
                              )}
                              <button className="text-slate-400 hover:text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Labels/Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              testCase.type === 'smoke' ? 'bg-green-100 text-green-800' :
                              testCase.type === 'regression' ? 'bg-blue-100 text-blue-800' :
                              testCase.type === 'integration' ? 'bg-purple-100 text-purple-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {testCase.type}
                            </span>
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              testCase.priority === 'high' ? 'bg-red-100 text-red-800' :
                              testCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {testCase.priority}
                            </span>
                            <span className="px-3 py-1 text-xs rounded-full font-medium bg-slate-100 text-slate-800">
                              Automated
                            </span>
                          </div>
                          
                          {/* Steps Preview */}
                          <div className="text-sm text-slate-600 mb-3">
                            <strong>Steps:</strong> {testCase.steps.slice(0, 2).join(' • ')}
                            {testCase.steps.length > 2 && ' • ...'}
                          </div>
                          
                          {/* Videos and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m8 0V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
                                </svg>
                                <span>Videos</span>
                              </button>
                              
                              <div className="text-sm text-slate-600">
                                <strong>Product:</strong> {fileInfo.testClass}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedTestToRun({ 
                                    product: selectedProduct, 
                                    testClass: fileInfo.testClass, 
                                    testId: testCase.id 
                                  })
                                  setShowRunModeModal(true)
                                }}
                                disabled={isActive}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  isActive 
                                    ? 'bg-orange-100 text-orange-700 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <svg className="w-4 h-4 mr-2 inline animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Running...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m8 0V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
                                    </svg>
                                    Run
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={() => {
                                  setEditingProduct(selectedProduct)
                                  setEditingTestName(fileInfo.testClass)
                                  setEditingTestCode('')
                                  setLoadingTestCode(true)
                                  setShowEditModal(true)
                                  
                                  api.getTestClass(selectedProduct, fileInfo.testClass)
                                    .then(response => {
                                      if (response.success) {
                                        setEditingTestCode(response.content)
                                      } else {
                                        setUpdateError('Failed to load test class content')
                                      }
                                    })
                                    .catch(error => {
                                      console.error('Error loading test class:', error)
                                      setUpdateError('Failed to load test class content')
                                    })
                                    .finally(() => {
                                      setLoadingTestCode(false)
                                    })
                                }}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                                title="Edit Test Class"
                              >
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              
                              <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                                <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Test Case Details - Expanded View */}
                        <div className="p-4 bg-slate-50">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">Created on:</span> {createdDate} by Faraz Khan
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">Last modified:</span> {lastModified} by Faraz Khan
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">UUID:</span> {testCase.id}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">Product:</span> {products.find(p => p.id === selectedProduct)?.name}
                            </div>
                          </div>
                          
                          {/* Action Buttons Row */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <button className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors">
                              Quick edit
                            </button>
                            <button className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors">
                              Edit test case
                            </button>
                            <button className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors">
                              Re-test
                            </button>
                            <button className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors">
                              Use AI to complete
                            </button>
                            <button className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors">
                              Debug
                            </button>
                            <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                              Copy
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <button className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors">
                              Delete
                            </button>
                            <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                              View Steps
                            </button>
                            <label className="flex items-center space-x-2 text-sm text-slate-600">
                              <input type="checkbox" className="rounded" />
                              <span>Disable re-testing of this test case</span>
                            </label>
                          </div>
                        </div>

                        {/* Inline Logs for this test case */}
                        {(isActive || (executionLogs[testKey] && executionLogs[testKey].length > 0)) && (
                          <div className="p-4 bg-slate-50 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-sm font-semibold text-slate-700">Live Execution Logs</h5>
                              <button 
                                onClick={() => stopExecution(testKey)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                              >
                                Stop
                              </button>
                            </div>
                            <div className="bg-slate-900 rounded p-3 max-h-48 overflow-y-auto">
                              <div className="text-green-400 font-mono text-xs">
                                {executionLogs[testKey] && executionLogs[testKey].length > 0 ? (
                                  executionLogs[testKey].slice(-15).map((log, index) => (
                                    <div key={index} className={`mb-1 ${
                                      log.level === 'error' ? 'text-red-400' : 
                                      log.level === 'success' ? 'text-green-400' : 
                                      log.level === 'info' ? 'text-blue-400' :
                                      'text-white'
                                    }`}>
                                      <span className="text-slate-500 text-xs">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                      </span>
                                      <span className="ml-2">{log.message}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-yellow-400">
                                    <span className="text-slate-500 text-xs">
                                      {new Date().toLocaleTimeString()}
                                    </span>
                                    <span className="ml-2">Waiting for logs...</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Inline Report Button and Screenshots for this test case */}
                        {executionStatus[testKey]?.status === 'finished' && (
                          <div className="p-4 bg-green-50 border-t border-green-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h5 className="text-sm font-semibold text-green-800">Test Execution Complete</h5>
                                <p className="text-xs text-green-600">
                                  {executionStatus[testKey]?.success ? '✅ Test Passed' : '❌ Test Failed'}
                                </p>
                              </div>
                              {executionStatus[testKey]?.reportUrl && (
                                <a
                                  href={executionStatus[testKey].reportUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  View Report
                                </a>
                              )}
                            </div>
                            
                            {/* Screenshots Gallery */}
        {/* Real-time Step Screenshots (like testRigor) */}
        {executionStatus[testKey]?.stepScreenshots && executionStatus[testKey].stepScreenshots.length > 0 && (
          <div className="mt-4">
            <h6 className="text-sm font-semibold text-slate-700 mb-3">Real-time Step Execution</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {executionStatus[testKey].stepScreenshots.map((stepScreenshot, index) => {
                const step = executionStatus[testKey].steps?.find(s => s.stepNumber === stepScreenshot.stepNumber)
                
                return (
                  <div key={index} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-slate-100 rounded-lg mb-2 overflow-hidden relative">
                      <img
                        src={stepScreenshot.screenshotUrl}
                        alt={`Step ${stepScreenshot.stepNumber} screenshot`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(stepScreenshot.screenshotUrl, '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-slate-400" style={{display: 'none'}}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      {/* Step number badge */}
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Step {stepScreenshot.stepNumber}
                      </div>
                      {/* Status indicator */}
                      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        step?.status === 'passed' ? 'bg-green-500' :
                        step?.status === 'failed' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></div>
                    </div>
                    {step && (
                      <div className="text-xs text-slate-600">
                        <div className="font-medium text-slate-800 truncate" title={step.title}>
                          {step.title}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            step.status === 'passed' ? 'bg-green-100 text-green-800' :
                            step.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {step.status === 'passed' ? '✓ Passed' : 
                             step.status === 'failed' ? '✗ Failed' : 
                             '⏳ Running'}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {step.duration}ms
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {executionStatus[testKey]?.videos && executionStatus[testKey].videos.length > 0 && (
          <div className="mt-4">
            <h6 className="text-sm font-semibold text-slate-700 mb-3">Test Execution Videos</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {executionStatus[testKey].videos.map((video, index) => {
                const videoUrl = `http://localhost:8787/test-results/${video.split('/').pop()}`
                
                return (
                  <div key={index} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                    <div className="aspect-video bg-slate-100 rounded-lg mb-2 overflow-hidden">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-slate-400" style={{display: 'none'}}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div className="font-medium">Test Execution Video {index + 1}</div>
                      <div className="text-slate-500 truncate" title={video.split('/').pop()}>
                        {video.split('/').pop()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legacy Step-by-Step Screenshots */}
        {executionStatus[testKey]?.screenshots && executionStatus[testKey].screenshots.length > 0 && (
          <div className="mt-4">
            <h6 className="text-sm font-semibold text-slate-700 mb-3">Legacy Step Screenshots</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {executionStatus[testKey].screenshots.map((screenshot, index) => {
                const step = executionStatus[testKey].testSteps?.[index]
                const screenshotUrl = `http://localhost:8787/screenshots/${screenshot.split('/').pop()}`
                
                return (
                  <div key={index} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                    <div className="aspect-video bg-slate-100 rounded-lg mb-2 overflow-hidden">
                      <img
                        src={screenshotUrl}
                        alt={`Step ${index + 1} screenshot`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(screenshotUrl, '_blank')}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-slate-400" style={{display: 'none'}}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    {step && (
                      <div className="text-xs text-slate-600">
                        <div className="font-medium">Step {index + 1}</div>
                        <div className="text-slate-500 truncate" title={step.title}>
                          {step.title}
                        </div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs mt-1 ${
                          step.status === 'passed' ? 'bg-green-100 text-green-800' :
                          step.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {step.status === 'passed' ? '✓ Passed' : 
                           step.status === 'failed' ? '✗ Failed' : 
                           '⏳ Running'}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Test Class Modal */}
      {showAddTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Add New Test Class</h3>
              <button
                onClick={() => setShowAddTestModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Product</label>
                <select
                  value={selectedProductForNewTest}
                  onChange={(e) => setSelectedProductForNewTest(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.icon} {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Test Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Test Class Name</label>
                <input
                  type="text"
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="e.g., MyNewTest"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Name should be valid JavaScript identifier (no spaces, special chars)</p>
              </div>
              
              {/* Test Code */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Playwright Test Code</label>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <Editor
                    height="400px"
                    defaultLanguage="javascript"
                    value={newTestCode}
                    onChange={(value) => setNewTestCode(value || '')}
                    theme="vs-dark"
                    placeholder="// Paste your Playwright test code here
import { test, expect } from '@playwright/test';

test('your test name', async ({ page }) => {
  // Your test code here
});"
                    options={{
                      fontSize: 14,
                      lineNumbers: 'on',
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      folding: true,
                      foldingStrategy: 'indentation',
                      showFoldingControls: 'always',
                      bracketPairColorization: { enabled: true },
                      guides: {
                        bracketPairs: true,
                        indentation: true
                      },
                      suggest: {
                        showKeywords: true,
                        showSnippets: true,
                        showFunctions: true,
                        showConstructors: true,
                        showFields: true,
                        showVariables: true,
                        showClasses: true,
                        showStructs: true,
                        showInterfaces: true,
                        showModules: true,
                        showProperties: true,
                        showEvents: true,
                        showOperators: true,
                        showUnits: true,
                        showValues: true,
                        showConstants: true,
                        showEnums: true,
                        showEnumMembers: true,
                        showColors: true,
                        showFiles: true,
                        showReferences: true,
                        showFolders: true,
                        showTypeParameters: true,
                        showIssues: true,
                        showUsers: true,
                        showWords: true
                      },
                      quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: true
                      },
                      parameterHints: {
                        enabled: true
                      },
                      hover: {
                        enabled: true
                      },
                      formatOnPaste: true,
                      formatOnType: true
                    }}
                    beforeMount={(monaco) => {
                      // Add Playwright-specific snippets and completions
                      monaco.languages.registerCompletionItemProvider('javascript', {
                        provideCompletionItems: (model, position) => {
                          const suggestions = [
                            {
                              label: 'test',
                              kind: monaco.languages.CompletionItemKind.Function,
                              insertText: 'test(\'${1:test name}\', async ({ page }) => {\n\t${2:// test code}\n});',
                              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                              documentation: 'Playwright test function'
                            },
                            {
                              label: 'expect',
                              kind: monaco.languages.CompletionItemKind.Function,
                              insertText: 'expect(${1:locator}).${2:toBeVisible()}',
                              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                              documentation: 'Playwright assertion'
                            },
                            {
                              label: 'page.goto',
                              kind: monaco.languages.CompletionItemKind.Method,
                              insertText: 'await page.goto(\'${1:url}\');',
                              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                              documentation: 'Navigate to a URL'
                            },
                            {
                              label: 'page.click',
                              kind: monaco.languages.CompletionItemKind.Method,
                              insertText: 'await page.click(\'${1:selector}\');',
                              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                              documentation: 'Click an element'
                            },
                            {
                              label: 'page.fill',
                              kind: monaco.languages.CompletionItemKind.Method,
                              insertText: 'await page.fill(\'${1:selector}\', \'${2:value}\');',
                              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                              documentation: 'Fill an input field'
                            },
                            {
                              label: 'page.waitForSelector',
                              kind: monaco.languages.CompletionItemKind.Method,
                              insertText: 'await page.waitForSelector(\'${1:selector}\');',
                              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                              documentation: 'Wait for an element to appear'
                            }
                          ];
                          return { suggestions };
                        }
                      });
                    }}
                  />
                </div>
              </div>
              
              {/* Error Message */}
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddTestModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newTestName.trim()) {
                    setSaveError('Test class name is required')
                    return
                  }
                  if (!newTestCode.trim()) {
                    setSaveError('Test code is required')
                    return
                  }
                  
                  setSavingTest(true)
                  setSaveError('')
                  
                  try {
                    const response = await api.saveTestClass({
                      product: selectedProductForNewTest,
                      testName: newTestName.trim(),
                      testCode: newTestCode.trim()
                    })
                    
                    if (response.success) {
                      setShowAddTestModal(false)
                      setNewTestName('')
                      setNewTestCode('')
                      // Refresh test cases
                      fetchTestCases(selectedProductForNewTest)
                    } else {
                      setSaveError(response.error || 'Failed to save test class')
                    }
                  } catch (error) {
                    setSaveError('Failed to save test class: ' + error.message)
                  } finally {
                    setSavingTest(false)
                  }
                }}
                disabled={savingTest}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {savingTest ? 'Saving...' : 'Save Test Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Mode Selection Modal */}
      {showRunModeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Select Run Mode</h3>
              <button
                onClick={() => setShowRunModeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-4">
                {selectedTestToRun.testId === 'bulk' ? (
                  <>Choose how you want to run <strong>{selectedTestToRun.selectedTests.length} selected test cases</strong></>
                ) : (
                  <>Choose how you want to run: <strong>{selectedTestToRun.testId}</strong></>
                )}
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="runMode"
                    value="headless"
                    checked={runMode === 'headless'}
                    onChange={(e) => setRunMode(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-800">Headless Mode</div>
                    <div className="text-sm text-slate-600">Run in background with logs displayed</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="runMode"
                    value="headed"
                    checked={runMode === 'headed'}
                    onChange={(e) => setRunMode(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-slate-800">Headed Mode</div>
                    <div className="text-sm text-slate-600">Open browser window to watch execution</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRunModeModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Close modal immediately
                  setShowRunModeModal(false)
                  
                  if (selectedTestToRun.testId === 'bulk') {
                    // Run multiple test cases
                    console.log('🚀 Running bulk execution for tests:', selectedTestToRun.selectedTests)
                    
                    // Run tests asynchronously without waiting
                    selectedTestToRun.selectedTests.forEach(testKey => {
                      console.log('🔧 Parsing test key:', testKey)
                      const parts = testKey.split('-')
                      if (parts.length >= 3) {
                        const product = parts[0]
                        const testClass = parts[1]
                        const testId = parts.slice(2).join('-') // Handle test IDs with hyphens
                        console.log('▶️ Running test:', { product, testClass, testId, runMode })
                        
                        // Run without await to not block modal closing
                        runIndividualTestCase(product, testClass, testId, runMode).catch(error => {
                          console.error('❌ Error running test:', testKey, error)
                        })
                      } else {
                        console.error('❌ Invalid test key format:', testKey)
                      }
                    })
                    
                    setSelectedTests(new Set()) // Clear selection after running
                    setSelectMultipleMode(false) // Exit selection mode
                  } else {
                    // Run single test case
                    runIndividualTestCase(
                      selectedTestToRun.product, 
                      selectedTestToRun.testClass, 
                      selectedTestToRun.testId, 
                      runMode
                    )
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {selectedTestToRun.testId === 'bulk' ? 'Run Selected Tests' : 'Run Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Test Class Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Edit Test Class</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Test Class Info */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                    <div className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800">
                      {products.find(p => p.id === editingProduct)?.icon} {products.find(p => p.id === editingProduct)?.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Test Class</label>
                    <div className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono">
                      {editingTestName}.spec.js
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Test Code Editor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Playwright Test Code</label>
                {loadingTestCode ? (
                  <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-slate-600">Loading test class content...</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <Editor
                      height="500px"
                      defaultLanguage="javascript"
                      value={editingTestCode}
                      onChange={(value) => setEditingTestCode(value || '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        lineNumbers: 'on',
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        folding: true,
                        foldingStrategy: 'indentation',
                        showFoldingControls: 'always',
                        bracketPairColorization: { enabled: true },
                        guides: {
                          bracketPairs: true,
                          indentation: true
                        },
                        suggest: {
                          showKeywords: true,
                          showSnippets: true,
                          showFunctions: true,
                          showConstructors: true,
                          showFields: true,
                          showVariables: true,
                          showClasses: true,
                          showStructs: true,
                          showInterfaces: true,
                          showModules: true,
                          showProperties: true,
                          showEvents: true,
                          showOperators: true,
                          showUnits: true,
                          showValues: true,
                          showConstants: true,
                          showEnums: true,
                          showEnumMembers: true,
                          showColors: true,
                          showFiles: true,
                          showReferences: true,
                          showFolders: true,
                          showTypeParameters: true,
                          showIssues: true,
                          showUsers: true,
                          showWords: true
                        },
                        quickSuggestions: {
                          other: true,
                          comments: false,
                          strings: true
                        },
                        parameterHints: {
                          enabled: true
                        },
                        hover: {
                          enabled: true
                        },
                        formatOnPaste: true,
                        formatOnType: true
                      }}
                      beforeMount={(monaco) => {
                        // Add Playwright-specific snippets and completions
                        monaco.languages.registerCompletionItemProvider('javascript', {
                          provideCompletionItems: (model, position) => {
                            const suggestions = [
                              {
                                label: 'test',
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: 'test(\'${1:test name}\', async ({ page }) => {\n\t${2:// test code}\n});',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Playwright test function'
                              },
                              {
                                label: 'expect',
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: 'expect(${1:locator}).${2:toBeVisible()}',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Playwright assertion'
                              },
                              {
                                label: 'page.goto',
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: 'await page.goto(\'${1:url}\');',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Navigate to a URL'
                              },
                              {
                                label: 'page.click',
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: 'await page.click(\'${1:selector}\');',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Click an element'
                              },
                              {
                                label: 'page.fill',
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: 'await page.fill(\'${1:selector}\', \'${2:value}\');',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Fill an input field'
                              },
                              {
                                label: 'page.waitForSelector',
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: 'await page.waitForSelector(\'${1:selector}\');',
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                                documentation: 'Wait for an element to appear'
                              }
                            ];
                            return { suggestions };
                          }
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Error Message */}
              {updateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{updateError}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingTestCode.trim()) {
                    setUpdateError('Test code is required')
                    return
                  }
                  
                  setUpdatingTest(true)
                  setUpdateError('')
                  
                  try {
                    const response = await api.updateTestClass({
                      product: editingProduct,
                      testName: editingTestName,
                      testCode: editingTestCode.trim()
                    })
                    
                    if (response.success) {
                      setShowEditModal(false)
                      // Refresh test cases for the edited product
                      fetchTestCases(editingProduct)
                    } else {
                      setUpdateError(response.error || 'Failed to update test class')
                    }
                  } catch (error) {
                    setUpdateError('Failed to update test class: ' + error.message)
                  } finally {
                    setUpdatingTest(false)
                  }
                }}
                disabled={updatingTest || loadingTestCode}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {updatingTest ? 'Updating...' : 'Update Test Class'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
