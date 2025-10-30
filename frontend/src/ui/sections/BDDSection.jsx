import React, { useState } from 'react'
import { api } from '../../api.js'
import Editor from '@monaco-editor/react'

export default function BDDSection() {
  const [bddText, setBddText] = useState(`Scenario: User Login
  Given I navigate to "https://example.com/login"
  When I fill "username" with "testuser@example.com"
  And I fill "password" with "password123"
  And I click button "Login"
  Then I should see "Welcome"
  And I should be on "https://example.com/dashboard"`)

  const [generatedCode, setGeneratedCode] = useState('')
  const [generating, setGenerating] = useState(false)
  const [testName, setTestName] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('lavinia')
  const [showCode, setShowCode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [conversionSummary, setConversionSummary] = useState(null)
  const [running, setRunning] = useState(false)
  const [testOutput, setTestOutput] = useState('')

  const products = [
    { id: 'lavinia', name: 'Lavinia', icon: '🎓' },
    { id: 'passage-prep', name: 'Passage Prep', icon: '📚' },
    { id: 'teaching-channel', name: 'Teaching Channel', icon: '🎬' }
  ]

  const handleGenerateCode = async () => {
    if (!bddText.trim()) {
      alert('Please enter BDD steps')
      return
    }

    setGenerating(true)
    setGeneratedCode('')
    setConversionSummary(null)

    try {
      console.log('🚀 Starting BDD conversion...', { bddText: bddText.substring(0, 100), testName, useAI: true })
      const result = await api.bddConvert({
        bddText,
        testName: testName || 'Generated Test',
        useAI: true
      })
      console.log('✅ BDD conversion result:', result)

      if (result.success) {
        setGeneratedCode(result.fullCode)
        setConversionSummary(result.metadata)
        setShowCode(true)
      } else {
        alert(`Failed to generate code: ${result.error}`)
      }
    } catch (error) {
      console.error('Generation error:', error)
      if (error.message.includes('Cannot connect to backend server')) {
        alert(`❌ Connection Error: ${error.message}\n\nPlease check:\n1. Backend is running on http://localhost:8787\n2. Check browser console for details`)
      } else {
        alert(`❌ Generation Error: ${error.message}`)
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveTest = async () => {
    if (!testName.trim()) {
      alert('Please enter a test name')
      return
    }

    if (!generatedCode.trim()) {
      alert('Please generate code first')
      return
    }

    setSaving(true)
    setSaveSuccess(false)

    try {
      const result = await api.bddSave({
        product: selectedProduct,
        testName: testName.trim(),
        bddText,
        playwrightCode: generatedCode
      })

      if (result.success) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        alert('✅ Test saved successfully!\n\nBoth BDD and Playwright versions saved.')
      } else {
        alert(`Failed to save: ${result.error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const bddExamples = [
    {
      name: 'Login Test',
      content: `Scenario: Successful User Login
  Given I navigate to "https://example.com/login"
  When I fill "username" with "test@example.com"
  And I fill "password" with "password123"
  And I click button "Login"
  Then I should see "Dashboard"
  And I should be on "https://example.com/dashboard"`
    },
    {
      name: 'Basic Auth Test',
      content: `Scenario: Login with Basic Authentication
  Given I set basic auth credentials "admin" and "password123"
  And I navigate to "https://example.com/protected"
  When I fill "username" with "test@example.com"
  And I fill "password" with "password123"
  And I click button "Login"
  Then I should see "Welcome"
  And I should be on "https://example.com/dashboard"`
    },
    {
      name: 'Form Submission',
      content: `Scenario: Contact Form Submission
  Given I navigate to "https://example.com/contact"
  When I fill "name" with "John Doe"
  And I fill "email" with "john@example.com"
  And I fill "message" with "Hello, this is a test"
  And I click button "Send"
  Then I should see "Message sent successfully"`
    },
    {
      name: 'Navigation Test',
      content: `Scenario: Navigate and Verify Menu Items
  Given I navigate to "https://example.com"
  When I click "About Us"
  Then I should see "Our Story"
  When I click "Products"
  Then I should see "Product Catalog"
  When I click "Contact"
  Then I should see "Get in Touch"`
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="glass-card-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ✍️ BDD Test Creator
              </h1>
              <p className="text-slate-300">
                Write tests in plain English (Given/When/Then) - We'll convert them to Playwright code
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">AI-Powered</div>
              <div className="text-2xl font-bold text-blue-400">GPT-4o</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6">
        
        {/* BDD Input Section */}
        <div className="glass-card-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              📝 Write Your Test in Plain English
            </h2>
            <div className="flex gap-2">
              <select
                value="example"
                onChange={(e) => {
                  const example = bddExamples.find(ex => ex.name === e.target.value)
                  if (example) setBddText(example.content)
                }}
                className="px-3 py-1 bg-slate-700 text-white rounded text-sm border border-slate-600"
              >
                <option value="example">Load Example...</option>
                {bddExamples.map(ex => (
                  <option key={ex.name} value={ex.name}>{ex.name}</option>
                ))}
              </select>
              <button
                onClick={() => setBddText(`Scenario: Environment-Specific Test
  Given I am testing in "staging"
  And I set basic auth credentials "admin" and "password123"
  And I navigate to "https://staging.example.com/login"
  When I fill "username" with "test@example.com"
  And I fill "password" with "password123"
  And I click button "Login"
  Then I should see "Welcome"
  And I should be on "https://staging.example.com/dashboard"`)}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-sm"
              >
                🌍 Environment + Auth
              </button>
              <button
                onClick={() => setBddText('')}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* BDD Syntax Guide */}
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded">
            <div className="text-sm text-blue-300 font-semibold mb-2">✨ BDD Syntax Guide:</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div><span className="text-green-400">Given</span> - Initial context/state</div>
              <div><span className="text-yellow-400">When</span> - Action performed</div>
              <div><span className="text-blue-400">Then</span> - Expected result</div>
              <div><span className="text-purple-400">And</span> - Additional steps</div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Example: <code className="text-cyan-300">Given I navigate to "URL"</code>, 
              <code className="text-cyan-300 ml-1">When I click "Button"</code>,
              <code className="text-cyan-300 ml-1">Then I should see "Text"</code>
            </div>
          </div>

          {/* BDD Text Area */}
          <textarea
            value={bddText}
            onChange={(e) => setBddText(e.target.value)}
            className="w-full h-64 bg-slate-800 text-white p-4 rounded border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none font-mono text-sm"
            placeholder="Scenario: Your Test Name
  Given I navigate to &quot;https://example.com&quot;
  When I click &quot;Login&quot;
  Then I should see &quot;Dashboard&quot;"
          />

          {/* Action Buttons */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleGenerateCode}
              disabled={generating || !bddText.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating Code...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Generate Playwright Code
                </>
              )}
            </button>

            {generatedCode && (
              <button
                onClick={() => setShowCode(!showCode)}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                {showCode ? '👁️ Hide Code' : '👁️ View Code'}
              </button>
            )}

            <div className="text-sm text-slate-400">
              {bddText.split('\n').filter(l => l.trim().match(/^(Given|When|Then|And|But)/i)).length} steps detected
            </div>
          </div>
        </div>

        {/* Conversion Summary */}
        {conversionSummary && (
          <div className="glass-card-dark p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-slate-300">
                <span className="text-green-400 font-semibold">{conversionSummary.totalScenarios}</span> scenarios
              </div>
              <div className="text-slate-300">
                <span className="text-blue-400 font-semibold">{conversionSummary.totalSteps}</span> steps
              </div>
              <div className="text-slate-300">
                Generated: <span className="text-cyan-400 font-semibold">{new Date(conversionSummary.generatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Generated Code Section */}
        {showCode && generatedCode && (
          <div className="glass-card-dark p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                🎯 Generated Playwright Code
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode)
                    alert('Code copied to clipboard!')
                  }}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <div className="border border-slate-600 rounded-lg overflow-hidden">
              <Editor
                height="400px"
                defaultLanguage="javascript"
                value={generatedCode}
                onChange={(value) => setGeneratedCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2
                }}
              />
            </div>

            {/* Save Section */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <h3 className="text-white font-semibold mb-3">💾 Save Test</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Test Name</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., LoginTest"
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveTest}
                  disabled={saving || !testName.trim() || !generatedCode.trim()}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Test
                    </>
                  )}
                </button>

                {saveSuccess && (
                  <div className="text-green-400 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Saved successfully!
                  </div>
                )}

                <div className="text-slate-500">|</div>

                <button
                  onClick={() => {
                    alert('After saving, find your test in the "Automation Scripts" section to run it!')
                  }}
                  disabled={!saveSuccess}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Go to Automation Scripts
                </button>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                💡 This will save both the BDD (.feature) and Playwright (.spec.js) versions
              </div>
            </div>
          </div>
        )}

        {/* BDD Cheat Sheet */}
        <div className="glass-card-dark p-6">
          <h3 className="text-lg font-bold text-white mb-4">📖 BDD Cheat Sheet</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Navigation Steps */}
            <div className="bg-slate-800/50 p-4 rounded">
              <div className="text-green-400 font-semibold mb-2">🧭 Navigation</div>
              <div className="space-y-1 text-sm text-slate-300 font-mono">
                <div>Given I navigate to "URL"</div>
                <div>Given I am on the login page</div>
                <div>When I reload the page</div>
                <div>When I go back</div>
              </div>
            </div>

            {/* Authentication Steps */}
            <div className="bg-slate-800/50 p-4 rounded">
              <div className="text-red-400 font-semibold mb-2">🔐 Authentication</div>
              <div className="space-y-1 text-sm text-slate-300 font-mono">
                <div>Given I set basic auth credentials "user" and "pass"</div>
                <div>Given I authenticate with basic auth using "admin" and "password"</div>
                <div>Given I navigate to "URL" with basic auth "user" and "pass"</div>
                <div>When I clear basic auth credentials</div>
              </div>
            </div>

            {/* Interaction Steps */}
            <div className="bg-slate-800/50 p-4 rounded">
              <div className="text-yellow-400 font-semibold mb-2">👆 Interaction</div>
              <div className="space-y-1 text-sm text-slate-300 font-mono">
                <div>When I click "Button Text"</div>
                <div>When I fill "field" with "value"</div>
                <div>When I enter "text" in "field"</div>
                <div>When I select "option" from "dropdown"</div>
              </div>
            </div>

            {/* Assertion Steps */}
            <div className="bg-slate-800/50 p-4 rounded">
              <div className="text-blue-400 font-semibold mb-2">✅ Assertions</div>
              <div className="space-y-1 text-sm text-slate-300 font-mono">
                <div>Then I should see "Text"</div>
                <div>Then I should be on "URL"</div>
                <div>Then "Element" should be visible</div>
                <div>Then I should not see "Text"</div>
              </div>
            </div>

            {/* Wait Steps */}
            <div className="bg-slate-800/50 p-4 rounded">
              <div className="text-purple-400 font-semibold mb-2">⏱️ Waits</div>
              <div className="space-y-1 text-sm text-slate-300 font-mono">
                <div>And I wait for "5" seconds</div>
                <div>And I wait for "Text" to appear</div>
                <div>And I wait for navigation</div>
              </div>
            </div>

            {/* Environment Steps */}
            <div className="bg-slate-800/50 p-4 rounded">
              <div className="text-cyan-400 font-semibold mb-2">🌍 Environment</div>
              <div className="space-y-1 text-sm text-slate-300 font-mono">
                <div>Given I am testing in "staging"</div>
                <div>Given I am testing in "production"</div>
                <div>Given I am testing in "development"</div>
                <div>When I switch to "test" environment</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded">
            <div className="text-sm text-cyan-300">
              <span className="font-semibold">💡 Pro Tip:</span> If a step doesn't match a pattern, 
              our AI (GPT-4o) will interpret it and generate the appropriate Playwright code!
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded">
            <div className="text-sm text-amber-300">
              <span className="font-semibold">🔐 Environment & Auth Guide:</span>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• <strong>Staging/Dev:</strong> Often requires basic auth - use "Given I set basic auth credentials"</li>
                <li>• <strong>Production:</strong> Usually no basic auth needed - skip auth steps</li>
                <li>• <strong>Local:</strong> May have different URLs - adjust navigation accordingly</li>
                <li>• <strong>Tip:</strong> Use environment variables for sensitive credentials in generated code</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

