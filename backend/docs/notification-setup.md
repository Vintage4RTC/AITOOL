# Notification Setup Guide

This guide explains how to configure Slack and Gmail notifications for automation test execution.

## Slack Configuration

### 1. Slack Webhook Setup
Set your Slack webhook URL via environment variables:
```
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ"
```

### 2. What Slack Notifications Include
- ✅ Test start notifications
- ✅ Test completion notifications with status
- ✅ Recent execution logs
- ✅ Direct link to test reports
- ✅ Execution time and timestamp

## Gmail Configuration

### 1. Gmail App Password Setup

To enable Gmail notifications, you need to set up an App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (custom name)"
   - Enter "QA Testing Agent" as the name
   - Copy the generated 16-character password

### 2. Environment Configuration

Configure via environment variables (recommended):

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ"
GMAIL_USER="your_gmail@gmail.com"
GMAIL_APP_PASSWORD="your_16_char_app_password"
NOTIFICATION_EMAIL="recipient@example.com"
```

### 3. What Gmail Notifications Include
- ✅ Rich HTML email with test results
- ✅ Test status with visual indicators
- ✅ Detailed test information table
- ✅ Recent execution logs
- ✅ Direct link to test reports
- ✅ Professional formatting

## Notification Triggers

### Test Start Notifications
- Sent when automation test execution begins
- Includes product, test class, and execution mode
- Sent to Slack only (to avoid email spam)

### Test Completion Notifications
- Sent when automation test execution completes
- Includes full test results and status
- Sent to both Slack and Gmail
- Includes recent logs and report links

## Testing Notifications

To test the notification system:

1. **Run an automation test** from the UI
2. **Check Slack channel** for start and completion messages
3. **Check Gmail** for completion notification email
4. **Verify links** work and point to correct reports

## Troubleshooting

### Slack Issues
- Verify webhook URL is correct
- Check Slack channel permissions
- Ensure webhook is not disabled

### Gmail Issues
- Verify Gmail credentials are correct
- Check App Password is valid (16 characters)
- Ensure 2FA is enabled on Gmail account
- Check spam folder for notifications

### Common Errors
```
❌ Gmail credentials not configured
```
**Solution**: Update `GMAIL_USER` and `GMAIL_APP_PASSWORD` in env.config.js

```
❌ Slack notification failed: 404
```
**Solution**: Verify Slack webhook URL is correct and active

## Security Notes

- Never commit Gmail App Passwords to version control
- Use environment variables for sensitive credentials
- Regularly rotate App Passwords for security
- Monitor notification logs for any issues
