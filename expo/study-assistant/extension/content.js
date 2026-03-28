// Content script that runs on Canvas pages
console.log('Study Assistant Canvas Connector loaded');

// Configuration
const API_ENDPOINT = 'http://localhost:3000/api/canvas-import';
const STORAGE_KEY = 'study_assistant_auth';

// Utility functions
function extractTextContent(selector) {
  const element = document.querySelector(selector);
  return element ? element.textContent.trim() : null;
}

function extractAllTextContent(selector) {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).map(el => el.textContent.trim());
}

// Extract course information from different Canvas pages
const extractors = {
  // Extract course info from course home page
  extractCourseInfo() {
    const courseName = extractTextContent('.ellipsible') || 
                      extractTextContent('h1.course-title') ||
                      extractTextContent('nav[aria-label="breadcrumb"] li:last-child span');
    
    const courseCode = extractTextContent('.course_code');
    const courseId = window.location.pathname.match(/\/courses\/(\d+)/)?.[1];
    
    return {
      id: courseId,
      name: courseName,
      code: courseCode,
      url: window.location.href
    };
  },

  // Extract assignment details
  extractAssignment() {
    const title = extractTextContent('h1.assignment-title') || 
                 extractTextContent('.title');
    
    const description = document.querySelector('.description.user_content')?.innerHTML || 
                       document.querySelector('.assignment-description')?.innerHTML;
    
    const dueDate = extractTextContent('.due_date_display') ||
                   extractTextContent('.assignment-due-date');
    
    const points = extractTextContent('.points-value') ||
                  extractTextContent('.assignment-points');
    
    const rubric = this.extractRubric();
    
    return {
      title,
      description,
      dueDate,
      points,
      rubric,
      url: window.location.href
    };
  },

  // Extract rubric if present
  extractRubric() {
    const rubricRows = document.querySelectorAll('.rubric_container .rubric_row');
    if (rubricRows.length === 0) return null;
    
    const rubric = [];
    rubricRows.forEach(row => {
      const criterion = extractTextContent('.description_header', row);
      const points = extractTextContent('.points_form', row);
      const ratings = Array.from(row.querySelectorAll('.rating-description')).map(r => ({
        points: extractTextContent('.points', r),
        description: extractTextContent('.description', r)
      }));
      
      if (criterion) {
        rubric.push({ criterion, points, ratings });
      }
    });
    
    return rubric.length > 0 ? rubric : null;
  },

  // Extract syllabus content
  extractSyllabus() {
    const syllabusContent = document.querySelector('#course_syllabus_body')?.innerHTML ||
                           document.querySelector('.syllabus')?.innerHTML;
    
    return {
      content: syllabusContent,
      url: window.location.href
    };
  },

  // Extract course files/materials
  extractFiles() {
    const files = [];
    const fileElements = document.querySelectorAll('.ef-item-row');
    
    fileElements.forEach(element => {
      const fileName = extractTextContent('.ef-name-col__text', element);
      const fileUrl = element.querySelector('a.ef-name-col__link')?.href;
      const fileSize = extractTextContent('.ef-size-col', element);
      const fileType = element.querySelector('.ef-name-col__text')?.getAttribute('title')?.split('.').pop();
      
      if (fileName && fileUrl) {
        files.push({
          name: fileName,
          url: fileUrl,
          size: fileSize,
          type: fileType
        });
      }
    });
    
    return files;
  },

  // Extract modules and their content
  extractModules() {
    const modules = [];
    const moduleElements = document.querySelectorAll('.context_module');
    
    moduleElements.forEach(moduleEl => {
      const moduleName = extractTextContent('.name', moduleEl);
      const items = [];
      
      moduleEl.querySelectorAll('.context_module_item').forEach(item => {
        const title = extractTextContent('.item_name', item);
        const type = item.className.match(/(\w+)_type/)?.[1];
        const url = item.querySelector('a.item_link')?.href;
        
        if (title) {
          items.push({ title, type, url });
        }
      });
      
      if (moduleName) {
        modules.push({
          name: moduleName,
          items
        });
      }
    });
    
    return modules;
  },

  // Extract announcements
  extractAnnouncements() {
    const announcements = [];
    const announcementElements = document.querySelectorAll('.announcements .discussion-topic') ||
                                 document.querySelectorAll('.announcement-list .discussion-topic');
    
    announcementElements.forEach(element => {
      const title = extractTextContent('.discussion-title', element);
      const content = element.querySelector('.message.user_content')?.innerHTML;
      const date = extractTextContent('.discussion-pubdate', element);
      
      if (title) {
        announcements.push({
          title,
          content,
          date
        });
      }
    });
    
    return announcements;
  },

  // Extract grades (student's own)
  extractGrades() {
    const grades = [];
    const gradeRows = document.querySelectorAll('#grades_summary .assignment_graded') ||
                     document.querySelectorAll('.grades_summary .student_assignment');
    
    gradeRows.forEach(row => {
      const assignmentName = extractTextContent('.title a', row) ||
                            extractTextContent('.assignment_title', row);
      const score = extractTextContent('.assignment_score .grade', row) ||
                   extractTextContent('.score_value', row);
      const possible = extractTextContent('.points_possible', row);
      
      if (assignmentName) {
        grades.push({
          assignment: assignmentName,
          score,
          possible,
          percentage: extractTextContent('.percentage', row)
        });
      }
    });
    
    return grades;
  }
};

// Detect what type of Canvas page we're on
function detectPageType() {
  const path = window.location.pathname;
  
  if (path.includes('/assignments/')) return 'assignment';
  if (path.includes('/syllabus')) return 'syllabus';
  if (path.includes('/files')) return 'files';
  if (path.includes('/modules')) return 'modules';
  if (path.includes('/announcements')) return 'announcements';
  if (path.includes('/grades')) return 'grades';
  if (path.includes('/courses/')) return 'course';
  
  return 'unknown';
}

// Add floating action button to Canvas pages
function addFloatingButton() {
  // Check if button already exists
  if (document.getElementById('study-assistant-fab')) return;
  
  const button = document.createElement('div');
  button.id = 'study-assistant-fab';
  button.innerHTML = `
    <div class="sa-fab-container">
      <button class="sa-fab-button" title="Send to Study Assistant">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </button>
      <div class="sa-fab-menu" style="display: none;">
        <button class="sa-menu-item" data-action="import-page">Import This Page</button>
        <button class="sa-menu-item" data-action="import-course">Import Entire Course</button>
        <button class="sa-menu-item" data-action="auto-sync">Enable Auto-Sync</button>
        <button class="sa-menu-item" data-action="settings">Settings</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(button);
  
  // Toggle menu on button click
  const fabButton = button.querySelector('.sa-fab-button');
  const fabMenu = button.querySelector('.sa-fab-menu');
  
  fabButton.addEventListener('click', () => {
    fabMenu.style.display = fabMenu.style.display === 'none' ? 'block' : 'none';
  });
  
  // Handle menu actions
  button.querySelectorAll('.sa-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      handleAction(action);
      fabMenu.style.display = 'none';
    });
  });
}

// Handle different actions
async function handleAction(action) {
  switch(action) {
    case 'import-page':
      await importCurrentPage();
      break;
    case 'import-course':
      await importEntireCourse();
      break;
    case 'auto-sync':
      toggleAutoSync();
      break;
    case 'settings':
      openSettings();
      break;
  }
}

// Import the current page data
async function importCurrentPage() {
  const pageType = detectPageType();
  let data = { pageType, timestamp: new Date().toISOString() };
  
  // Extract data based on page type
  switch(pageType) {
    case 'assignment':
      data.assignment = extractors.extractAssignment();
      break;
    case 'syllabus':
      data.syllabus = extractors.extractSyllabus();
      break;
    case 'files':
      data.files = extractors.extractFiles();
      break;
    case 'modules':
      data.modules = extractors.extractModules();
      break;
    case 'announcements':
      data.announcements = extractors.extractAnnouncements();
      break;
    case 'grades':
      data.grades = extractors.extractGrades();
      break;
    case 'course':
      data.course = extractors.extractCourseInfo();
      break;
  }
  
  // Add course context
  data.course = extractors.extractCourseInfo();
  
  // Send to background script
  chrome.runtime.sendMessage({
    action: 'import_data',
    data: data
  }, response => {
    if (response?.success) {
      showNotification('✅ Page imported successfully!');
    } else {
      showNotification('❌ Import failed. Check your connection.');
    }
  });
}

// Import entire course (navigate and extract all pages)
async function importEntireCourse() {
  const courseId = window.location.pathname.match(/\/courses\/(\d+)/)?.[1];
  if (!courseId) {
    showNotification('❌ Could not detect course ID');
    return;
  }
  
  showNotification('🔄 Starting course import... This may take a moment.');
  
  // Send course import request to background script
  chrome.runtime.sendMessage({
    action: 'import_course',
    courseId: courseId,
    baseUrl: window.location.origin
  });
}

// Show notification on the page
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'sa-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('sa-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize extension on Canvas pages
function initialize() {
  // Add floating button
  addFloatingButton();
  
  // Listen for navigation changes (Canvas is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => {
        addFloatingButton();
      }, 1000);
    }
  }).observe(document, { subtree: true, childList: true });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract_current_page') {
    importCurrentPage();
    sendResponse({ success: true });
  }
  return true;
});