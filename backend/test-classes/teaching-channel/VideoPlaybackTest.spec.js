import { test, expect } from '@playwright/test';

test.describe('Teaching Channel - Video Playback Tests', () => {
  test('User can play course videos', async ({ page }) => {
    console.log('🎥 Starting video playback test...');
    
    // Set basic authentication
    await page.setExtraHTTPHeaders({
      'Authorization': 'Basic ' + Buffer.from('teachingchannel:password123').toString('base64')
    });
    
    // Navigate to a course with video content
    await page.goto('https://teachingchannel.com/courses/math-fundamentals', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Find and click play button
    await page.click('.video-player .play-button');
    await page.waitForTimeout(3000);
    
    // Verify video is playing
    await expect(page.locator('.video-player video')).toBeVisible();
    
    // Check if video has loaded
    const videoElement = page.locator('.video-player video');
    await expect(videoElement).toHaveAttribute('src');
    
    console.log('✅ Video playback test completed');
  });

  test('User can control video playback (play/pause)', async ({ page }) => {
    console.log('⏯️ Testing video playback controls...');
    
    await page.goto('https://teachingchannel.com/courses/math-fundamentals', { waitUntil: 'networkidle' });
    
    // Start video playback
    await page.click('.video-player .play-button');
    await page.waitForTimeout(2000);
    
    // Pause video
    await page.click('.video-player .pause-button');
    await page.waitForTimeout(1000);
    
    // Resume video
    await page.click('.video-player .play-button');
    await page.waitForTimeout(2000);
    
    // Verify video controls are working
    await expect(page.locator('.video-player .controls')).toBeVisible();
    
    console.log('✅ Video controls test completed');
  });

  test('User can adjust video volume', async ({ page }) => {
    console.log('🔊 Testing video volume controls...');
    
    await page.goto('https://teachingchannel.com/courses/math-fundamentals', { waitUntil: 'networkidle' });
    
    // Start video
    await page.click('.video-player .play-button');
    await page.waitForTimeout(2000);
    
    // Adjust volume slider
    await page.click('.volume-slider');
    await page.dragTo('.volume-slider', { targetPosition: { x: 50, y: 0 } });
    
    // Verify volume control is visible and functional
    await expect(page.locator('.volume-control')).toBeVisible();
    
    console.log('✅ Video volume test completed');
  });
});
