import fetch from 'node-fetch';

export class WireframeService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  async analyzeWireframe(imageBuffer) {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Convert image buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      const prompt = `You are an expert Product Manager and Business Analyst. Analyze this wireframe image in EXTREME DETAIL and generate comprehensive, production-ready documentation.

STEP 1: DETAILED ANALYSIS
Examine every aspect of the wireframe:
1. **UI Elements**: Every button, input field, dropdown, checkbox, radio button, link, icon, image, modal, tooltip
2. **Layout & Structure**: Navigation bars, sidebars, headers, footers, content areas, grids, cards
3. **User Flows**: How users navigate between screens, what actions trigger what responses
4. **Data Elements**: What data is displayed, collected, validated, stored
5. **Interactive Elements**: Forms, search bars, filters, sorting options, pagination
6. **Visual Hierarchy**: Primary actions, secondary actions, tertiary elements
7. **States**: Default state, hover state, active state, disabled state, error state, loading state
8. **Responsive Behavior**: How elements might adapt to different screen sizes

STEP 2: GENERATE COMPREHENSIVE USER STORIES (8-15 stories)

Each user story MUST include:
- **ID**: US-001, US-002, etc.
- **Title**: Clear, concise summary (max 10 words)
- **User Type**: Specific persona (e.g., "end user", "admin", "guest visitor", "premium subscriber")
- **Description**: Full user story in format: "As a [specific user type], I want to [specific action with context] so that [clear business value/benefit]"
- **Detailed Acceptance Criteria**: 3-5 specific, testable conditions in Given/When/Then format
- **Priority**: High/Medium/Low with justification
- **Story Points**: 1, 2, 3, 5, 8 (Fibonacci) with reasoning
- **Dependencies**: What must be completed first (if any)
- **Business Value**: Why this matters to the business/user

STEP 3: GENERATE DETAILED ACCEPTANCE CRITERIA (15-25 criteria)

Each acceptance criterion MUST include:
- **ID**: AC-001, AC-002, etc.
- **Related User Story**: Which US-xxx it belongs to
- **Title**: Clear, specific requirement
- **Description**: DETAILED explanation with context, including:
  - Exact behavior expected
  - Edge cases to consider
  - Error handling requirements
  - Validation rules (if applicable)
  - Performance expectations (if applicable)
- **Priority**: High/Medium/Low
- **Status**: Draft
- **Test Scenarios**: 2-3 specific test scenarios to verify this criterion

STEP 3: GENERATE COMPREHENSIVE REQUIREMENTS DOCUMENT

Include detailed sections for:
- **Technical Requirements**: Technology stack assumptions, API requirements, database needs, security requirements
- **Functional Requirements**: Core features, user interactions, data processing, integrations
- **Non-Functional Requirements**: Performance benchmarks, scalability needs, accessibility standards (WCAG 2.1), browser compatibility, security standards
- **UI/UX Requirements**: Design system, responsive breakpoints, animation guidelines, accessibility features
- **Data Requirements**: Data models, validation rules, storage requirements, data privacy considerations
- **Assumptions**: What we're assuming about the system, users, environment
- **Constraints**: Technical limitations, budget constraints, timeline considerations
- **Success Metrics**: KPIs to measure success, analytics requirements

CRITICAL INSTRUCTIONS:
- Be EXTREMELY detailed and specific
- Base everything on what's VISIBLE in the wireframe
- Make reasonable inferences about user flows and interactions
- Include realistic edge cases and error scenarios
- Assume this is for a production-ready application
- Write acceptance criteria that a developer can implement directly
- Write user stories that stakeholders can understand immediately

Return the response in the following JSON format:
{
  "userStories": [
    {
      "id": "US-001",
      "title": "User Story Title",
      "userType": "end user",
      "description": "As a [user type], I want to [action] so that [benefit]",
      "acceptanceCriteria": "Given [context] When [action] Then [outcome]. Given [context] When [action] Then [outcome]. Given [context] When [action] Then [outcome].",
      "priority": "High/Medium/Low",
      "priorityJustification": "Why this priority level",
      "storyPoints": "3",
      "storyPointsReasoning": "Why this estimate",
      "dependencies": "US-xxx, US-yyy or 'None'",
      "businessValue": "Specific business impact"
    }
  ],
  "acceptanceCriteria": [
    {
      "id": "AC-001",
      "relatedUserStory": "US-001",
      "title": "Acceptance Criteria Title",
      "description": "DETAILED explanation including: exact behavior expected, edge cases to consider, error handling requirements, validation rules, performance expectations",
      "priority": "High/Medium/Low",
      "status": "Draft",
      "testScenarios": [
        "Scenario 1: specific test case",
        "Scenario 2: edge case test",
        "Scenario 3: error handling test"
      ]
    }
  ],
  "requirements": {
    "technicalRequirements": "Detailed technical requirements section",
    "functionalRequirements": "Detailed functional requirements section",
    "nonFunctionalRequirements": "Performance, scalability, accessibility, security details",
    "uiUxRequirements": "Design system, responsive behavior, animations",
    "dataRequirements": "Data models, validation, storage, privacy",
    "assumptions": "System, user, and environment assumptions",
    "constraints": "Technical, budget, timeline limitations",
    "successMetrics": "KPIs and analytics requirements"
  }
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a senior Product Manager and Business Analyst with 15+ years of experience writing detailed, production-ready documentation. You specialize in analyzing wireframes and creating comprehensive user stories and acceptance criteria that developers can implement directly and stakeholders can understand immediately. You ALWAYS return valid, well-structured JSON format with extensive detail.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 8000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      // Try to parse JSON from the response
      let analysisResult;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        analysisResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse JSON from OpenAI response:', parseError);
        console.error('Raw response:', content);
        
        // Fallback: create a structured response from the raw text
        analysisResult = {
          userStories: this.extractUserStories(content),
          acceptanceCriteria: this.extractAcceptanceCriteria(content),
          testCases: [],
          requirements: this.extractRequirements(content)
        };
      }

      return {
        success: true,
        userStories: analysisResult.userStories || [],
        acceptanceCriteria: analysisResult.acceptanceCriteria || [],
        testCases: analysisResult.testCases || [],
        requirements: analysisResult.requirements || 'Requirements analysis completed',
        metadata: {
          totalUserStories: (analysisResult.userStories || []).length,
          totalAcceptanceCriteria: (analysisResult.acceptanceCriteria || []).length,
          totalTestCases: (analysisResult.testCases || []).length
        }
      };

    } catch (error) {
      console.error('Wireframe analysis error:', error);
      return {
        success: false,
        error: error.message,
        userStories: [],
        acceptanceCriteria: [],
        testCases: [],
        requirements: ''
      };
    }
  }

  // Fallback methods to extract structured data from raw text
  extractUserStories(content) {
    const stories = [];
    const lines = content.split('\n');
    let currentStory = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/US-\d+|User Story \d+/i)) {
        if (currentStory) stories.push(currentStory);
        currentStory = {
          id: line.match(/US-\d+/i)?.[0] || `US-${stories.length + 1}`,
          title: line,
          description: '',
          acceptanceCriteria: '',
          priority: 'Medium',
          storyPoints: '3'
        };
      } else if (currentStory && line.includes('As a')) {
        currentStory.description = line;
      } else if (currentStory && line.includes('Acceptance Criteria')) {
        currentStory.acceptanceCriteria = line;
      }
    }

    if (currentStory) stories.push(currentStory);
    return stories.slice(0, 8); // Limit to 8 stories
  }

  extractAcceptanceCriteria(content) {
    const criteria = [];
    const lines = content.split('\n');
    let currentCriteria = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/AC-\d+|Acceptance Criteria \d+/i)) {
        if (currentCriteria) criteria.push(currentCriteria);
        currentCriteria = {
          id: line.match(/AC-\d+/i)?.[0] || `AC-${criteria.length + 1}`,
          title: line,
          description: '',
          priority: 'Medium',
          status: 'Draft'
        };
      } else if (currentCriteria && line.length > 10) {
        currentCriteria.description = line;
      }
    }

    if (currentCriteria) criteria.push(currentCriteria);
    return criteria.slice(0, 12); // Limit to 12 criteria
  }


  extractRequirements(content) {
    const lines = content.split('\n');
    const requirementsStart = lines.findIndex(line => 
      line.toLowerCase().includes('requirements') || 
      line.toLowerCase().includes('technical requirements') ||
      line.toLowerCase().includes('functional requirements')
    );

    if (requirementsStart !== -1) {
      return lines.slice(requirementsStart).join('\n');
    }

    return 'Requirements analysis completed. Please review the generated user stories and acceptance criteria for detailed requirements.';
  }

  async generatePlaywrightScriptFromWireframe(analysisResult, businessUnit = 'lavinia') {
    try {
      const testCases = analysisResult.testCases || [];
      
      if (testCases.length === 0) {
        return {
          success: false,
          error: 'No test cases available to generate script'
        };
      }

      const prompt = `Generate a comprehensive Playwright test script based on the wireframe analysis and test cases.

Business Unit: ${businessUnit}
Test Cases: ${JSON.stringify(testCases, null, 2)}

Generate a complete Playwright test script that:
1. Uses proper authentication for ${businessUnit}
2. Implements all the test cases from the wireframe analysis
3. Includes proper waits and assertions
4. Uses realistic selectors based on the wireframe elements
5. Includes error handling and retry logic
6. Generates screenshots at key points

Use the appropriate base URL for ${businessUnit}:
- Lavinia: https://laviniagro1stg.wpengine.com/
- Passage Prep: https://passageprepstg.wpenginepowered.com/
- Teaching Channel: https://passageprepstg.wpenginepowered.com/

Generate ONLY the JavaScript code - no explanations or markdown formatting.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a Playwright expert. Generate complete, runnable test scripts based on wireframe analysis. Always return only JavaScript code without explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const script = result.choices[0].message.content;

      return {
        success: true,
        script: script.trim()
      };

    } catch (error) {
      console.error('Playwright script generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
