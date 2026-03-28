// Background service worker for handling API calls and storage

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = null;

// Load auth token from storage
chrome.storage.local.get(['authToken'], (result) => {
  authToken = result.authToken;
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case 'import_data':
      handleDataImport(request.data).then(sendResponse);
      break;
    case 'import_course':
      handleCourseImport(request.courseId, request.baseUrl).then(sendResponse);
      break;
    case 'set_auth':
      authToken = request.token;
      chrome.storage.local.set({ authToken: request.token });
      sendResponse({ success: true });
      break;
    case 'get_auth':
      sendResponse({ token: authToken });
      break;
  }
  return true; // Keep message channel open for async response
});

// Handle single page data import
async function handleDataImport(data) {
  try {
    if (!authToken) {
      return { success: false, error: 'Not authenticated. Please log in to Study Assistant first.' };
    }

    const response = await fetch(`${API_BASE_URL}/canvas-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
}

// Handle full course import
async function handleCourseImport(courseId, baseUrl) {
  try {
    if (!authToken) {
      return { success: false, error: 'Not authenticated' };
    }

    // Define pages to scrape for a course
    const pagesToScrape = [
      `/courses/${courseId}`,
      `/courses/${courseId}/assignments`,
      `/courses/${courseId}/syllabus`,
      `/courses/${courseId}/modules`,
      `/courses/${courseId}/files`,
      `/courses/${courseId}/announcements`,
      `/courses/${courseId}/grades`
    ];

    // Create a new tab for scraping
    const tab = await chrome.tabs.create({
      url: `${baseUrl}/courses/${courseId}`,
      active: false
    });

    // Track import progress
    const importResults = [];

    for (const path of pagesToScrape) {
      // Navigate to page
      await chrome.tabs.update(tab.id, { url: `${baseUrl}${path}` });
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract data from page
      const results = await chrome.tabs.sendMessage(tab.id, {
        action: 'extract_current_page'
      });
      
      importResults.push(results);
    }

    // Close the tab
    chrome.tabs.remove(tab.id);

    // Send all data to API
    const response = await fetch(`${API_BASE_URL}/canvas-import/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        courseId,
        imports: importResults
      })
    });

    if (response.ok) {
      return { success: true, message: 'Course imported successfully' };
    } else {
      return { success: false, error: 'Failed to import course' };
    }
  } catch (error) {
    console.error('Course import error:', error);
    return { success: false, error: error.message };
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Check if we're on a Canvas page
  if (tab.url.includes('.instructure.com')) {
    // Send message to content script to show import menu
    chrome.tabs.sendMessage(tab.id, { action: 'show_menu' });
  } else {
    // Open Study Assistant in new tab
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }
});