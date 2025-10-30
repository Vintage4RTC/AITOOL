/**
 * Central route exports
 * Import all route modules and export them for easy registration
 */

import automationRoutes from './automation.routes.js';
import jiraRoutes from './jira.routes.js';
import jenkinsRoutes from './jenkins.routes.js';

export {
  automationRoutes,
  jiraRoutes,
  jenkinsRoutes
};

