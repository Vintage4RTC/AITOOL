Scenario: User Login
  Given I navigate to "https://example.com/login"
  When I fill "username" with "testuser@example.com"
  And I fill "password" with "password123"
  And I click button "Login"
  Then I should see "Welcome"
  And I should be on "https://example.com/dashboard"