// Popup script for extension interface

let isAuthenticated = false;
let authToken = null;

// Check authentication status on load
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is authenticated
  chrome.runtime.sendMessage({ action: 'get_auth' }, (response) => {
    if (response?.token) {
      authToken = response.token;
      showMainContent();
    }
  });
  
  // Set up event listeners
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  document.getElementById('import-page').addEventListener('click', importCurrentPage);
  document.getElementById('import-course').addEventListener('click', importEntireCourse);
  document.getElementById('import-assignments').addEventListener('click', importAssignments);
  document.getElementById('import-syllabus').addEventListener('click', importSyllabus);
  document.getElementById('import-files').addEventListener('click', importFiles);
  document.getElementById('auto-sync').addEventListener('click', toggleAutoSync);
  document.getElementById('open-app').addEventListener('click', openApp);
  
  // Update stats if authenticated
  if (authToken) {
    updateStats();
  }
});

// Handle login
async function handleLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  try {
    // Authenticate with Study Assistant
    const response = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const data = await response.json();
      authToken = data.token;
      
      // Save token to background script
      chrome.runtime.sendMessage({
        action: 'set_auth',
        token: authToken
      });
      
      showMainContent();
      updateStats();
    } else {
      alert('Login failed. Please check your credentials.');
    }
  } catch (error) {
    alert('Connection error. Make sure Study Assistant is running.');
  }
}

// Show main content after authentication
function showMainContent() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
  document.getElementById('status').className = 'status connected';
  document.getElementById('status').textContent = '✅ Connected to Study Assistant';
}

// Import current page
async function importCurrentPage() {
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('.instructure.com')) {
    alert('Please navigate to a Canvas page first');
    return;
  }
  
  showLoading(true);
  
  // Send message to content script
  chrome.tabs.sendMessage(tab.id, { action: 'extract_current_page' }, (response) => {
    showLoading(false);
    if (response?.success) {
      showSuccess('Page imported successfully!');
      updateStats();
    } else {
      alert('Import failed. Please try again.');
    }
  });
}

// Import entire course
async function importEntireCourse() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('/courses/')) {
    alert('Please navigate to a Canvas course page first');
    return;
  }
  
  if (confirm('This will import all content from the current course. This may take a few minutes. Continue?')) {
    showLoading(true);
    
    // Extract course ID from URL
    const courseId = tab.url.match(/\/courses\/(\d+)/)?.[1];
    
    chrome.runtime.sendMessage({
      action: 'import_course',
      courseId: courseId,
      baseUrl: new URL(tab.url).origin
    }, (response) => {
      showLoading(false);
      if (response?.success) {
        showSuccess('Course imported successfully!');
        updateStats();
      } else {
        alert('Import failed: ' + (response?.error || 'Unknown error'));
      }
    });
  }
}

// Import specific content types
async function importAssignments() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('.instructure.com')) {
    alert('Please navigate to a Canvas course first');
    return;
  }
  
  // Navigate to assignments page
  const courseMatch = tab.url.match(/\/courses\/(\d+)/);
  if (courseMatch) {
    const assignmentsUrl = `${new URL(tab.url).origin}/courses/${courseMatch[1]}/assignments`;
    chrome.tabs.update(tab.id, { url: assignmentsUrl });
    
    // Wait for navigation then import
    setTimeout(() => {
      importCurrentPage();
    }, 2000);
  }
}

async function importSyllabus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('.instructure.com')) {
    alert('Please navigate to a Canvas course first');
    return;
  }
  
  const courseMatch = tab.url.match(/\/courses\/(\d+)/);
  if (courseMatch) {
    const syllabusUrl = `${new URL(tab.url).origin}/courses/${courseMatch[1]}/syllabus`;
    chrome.tabs.update(tab.id, { url: syllabusUrl });
    
    setTimeout(() => {
      importCurrentPage();
    }, 2000);
  }
}

async function importFiles() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('.instructure.com')) {
    alert('Please navigate to a Canvas course first');
    return;
  }
  
  const courseMatch = tab.url.match(/\/courses\/(\d+)/);
  if (courseMatch) {
    const filesUrl = `${new URL(tab.url).origin}/courses/${courseMatch[1]}/files`;
    chrome.tabs.update(tab.id, { url: filesUrl });
    
    setTimeout(() => {
      importCurrentPage();
    }, 2000);
  }
}

// Toggle auto-sync
function toggleAutoSync() {
  chrome.storage.local.get(['autoSync'], (result) => {
    const newState = !result.autoSync;
    chrome.storage.local.set({ autoSync: newState });
    
    const button = document.getElementById('auto-sync');
    if (newState) {
      button.textContent = '✅ Auto-Sync Enabled';
      button.classList.add('btn-success');
      button.classList.remove('btn-secondary');
    } else {
      button.textContent = '🔄 Enable Auto-Sync';
      button.classList.remove('btn-success');
      button.classList.add('btn-secondary');
    }
  });
}

// Open Study Assistant app
function openApp() {
  chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
}

// Update statistics
async function updateStats() {
  try {
    const response = await fetch('http://localhost:3000/api/stats', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.ok) {
      const stats = await response.json();
      document.getElementById('courses-count').textContent = stats.courses || 0;
      document.getElementById('materials-count').textContent = stats.materials || 0;
      document.getElementById('sync-count').textContent = stats.synced || 0;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}

// Show loading state
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  document.getElementById('main-content').style.display = show ? 'none' : 'block';
}

// Show success message
function showSuccess(message) {
  const status = document.getElementById('status');
  const originalText = status.textContent;
  status.textContent = '✅ ' + message;
  status.className = 'status connected';
  
  setTimeout(() => {
    status.textContent = originalText;
  }, 3000);
}