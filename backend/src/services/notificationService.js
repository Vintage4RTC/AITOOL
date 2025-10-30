import fetch from 'node-fetch'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

class NotificationService {
  constructor() {
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || ''
    this.gmailConfig = {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
    this.transporter = this.createEmailTransporter()
  }

  createEmailTransporter() {
    if (!this.gmailConfig.user || !this.gmailConfig.pass) {
      console.warn('⚠️ Gmail credentials not configured. Email notifications will be disabled.')
      return null
    }

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.gmailConfig.user,
        pass: this.gmailConfig.pass
      }
    })
  }

  async sendTestCompletionReport(testData) {
    const { product, testClass, status, reportUrl, executionTime, timestamp, logs } = testData
    
    try {
      // Send to both Slack and Gmail
      await Promise.all([
        this.sendSlackNotification(testData),
        this.sendGmailNotification(testData)
      ])
      
      console.log('✅ Test completion notifications sent successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to send notifications:', error.message)
      return { success: false, error: error.message }
    }
  }

  async sendSlackNotification(testData) {
    const { product, testClass, status, reportUrl, executionTime, timestamp, logs } = testData
    
    const statusEmoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️'
    const statusColor = status === 'passed' ? 'good' : status === 'failed' ? 'danger' : 'warning'
    
    const slackMessage = {
      text: `🧪 Automation Test Execution Complete`,
      attachments: [
        {
          color: statusColor,
          title: `${statusEmoji} Test Results: ${product}/${testClass}`,
          fields: [
            {
              title: 'Product',
              value: product,
              short: true
            },
            {
              title: 'Test Class',
              value: testClass,
              short: true
            },
            {
              title: 'Status',
              value: status.toUpperCase(),
              short: true
            },
            {
              title: 'Execution Time',
              value: executionTime || 'N/A',
              short: true
            },
            {
              title: 'Completed At',
              value: new Date(timestamp).toLocaleString(),
              short: false
            }
          ],
          actions: [
            {
              type: 'button',
              text: 'View Report',
              url: reportUrl || 'http://localhost:8787/test-classes/playwright-report/index.html'
            }
          ],
          footer: 'QA Testing Agent',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    }

    // Add recent logs if available
    if (logs && logs.length > 0) {
      const recentLogs = logs.slice(-5).join('\n')
      slackMessage.attachments.push({
        color: '#36a64f',
        title: 'Recent Execution Logs',
        text: `\`\`\`${recentLogs}\`\`\``,
        mrkdwn_in: ['text']
      })
    }

    if (!this.slackWebhookUrl) {
      console.warn('⚠️ Slack webhook not configured. Slack notifications will be skipped.')
      return
    }

    const response = await fetch(this.slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage)
    })

    if (!response.ok) {
      throw new Error(`Slack notification failed: ${response.status} ${response.statusText}`)
    }

    console.log('📱 Slack notification sent successfully')
  }

  async sendGmailNotification(testData) {
    if (!this.transporter) {
      console.log('📧 Email notifications disabled (no Gmail credentials)')
      return
    }

    const { product, testClass, status, reportUrl, executionTime, timestamp, logs } = testData
    
    const statusEmoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️'
    const recipientEmail = process.env.NOTIFICATION_EMAIL || this.gmailConfig.user
    
    const emailSubject = `${statusEmoji} Automation Test Complete: ${product}/${testClass}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .status { font-size: 24px; margin: 10px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .info-table td:first-child { font-weight: bold; width: 30%; background-color: #f8f9fa; }
          .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .logs { background-color: #f8f9fa; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 QA Testing Agent</h1>
            <div class="status">${statusEmoji} Test Execution Complete</div>
          </div>
          
          <table class="info-table">
            <tr><td>Product</td><td>${product}</td></tr>
            <tr><td>Test Class</td><td>${testClass}</td></tr>
            <tr><td>Status</td><td><strong>${status.toUpperCase()}</strong></td></tr>
            <tr><td>Execution Time</td><td>${executionTime || 'N/A'}</td></tr>
            <tr><td>Completed At</td><td>${new Date(timestamp).toLocaleString()}</td></tr>
          </table>
          
          ${reportUrl ? `<a href="${reportUrl}" class="button">View Detailed Report</a>` : ''}
          
          ${logs && logs.length > 0 ? `
            <h3>Recent Execution Logs</h3>
            <div class="logs">${logs.slice(-10).join('<br>')}</div>
          ` : ''}
          
          <div class="footer">
            <p>This is an automated notification from QA Testing Agent</p>
            <p>Report generated at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `"QA Testing Agent" <${this.gmailConfig.user}>`,
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml
    }

    const info = await this.transporter.sendMail(mailOptions)
    console.log('📧 Gmail notification sent successfully:', info.messageId)
  }

  async sendTestStartNotification(testData) {
    const { product, testClass, mode } = testData
    
    try {
      const slackMessage = {
        text: `🚀 Automation Test Started`,
        attachments: [
          {
            color: '#36a64f',
            title: `🧪 Starting Test: ${product}/${testClass}`,
            fields: [
              {
                title: 'Product',
                value: product,
                short: true
              },
              {
                title: 'Test Class',
                value: testClass,
                short: true
              },
              {
                title: 'Mode',
                value: mode,
                short: true
              },
              {
                title: 'Started At',
                value: new Date().toLocaleString(),
                short: true
              }
            ],
            footer: 'QA Testing Agent',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      }

      await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage)
      })

      console.log('📱 Test start notification sent to Slack')
    } catch (error) {
      console.error('❌ Failed to send test start notification:', error.message)
    }
  }
}

export default NotificationService
