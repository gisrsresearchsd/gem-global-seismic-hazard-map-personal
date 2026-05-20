// src/utils/noteModal.js
// Modal functionality for displaying notes

let modal = null;

// Create modal HTML if it doesn't exist
function createModal() {
  // Check if modal already exists
  if (document.getElementById('noteModal')) {
    return document.getElementById('noteModal');
  }

  // Create modal container
  const modalHtml = `
    <div id="noteModal" class="note-modal" style="display: none;">
      <div class="note-modal-content">
        <div class="note-modal-header">
          <h2 id="noteModalTitle">Note</h2>
          <button class="note-modal-close">&times;</button>
        </div>
        <div class="note-modal-body" id="noteModalBody">
          <div style="text-align: center; padding: 40px;">Loading...</div>
        </div>
      </div>
    </div>
  `;

  // Append to body
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  return document.getElementById('noteModal');
}

// Initialize modal event listeners
function initModalEvents() {
  const modal = document.getElementById('noteModal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.note-modal-close');
  
  // Close on X button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });
}

// Load note content into modal
async function openNoteModalFunction(noteNumber) {
  // Create modal if it doesn't exist
  const modal = createModal();
  
  // Initialize events if not already done
  if (!modal.hasAttribute('data-initialized')) {
    initModalEvents();
    modal.setAttribute('data-initialized', 'true');
  }

  const modalTitle = document.getElementById('noteModalTitle');
  const modalBody = document.getElementById('noteModalBody');
  
  // Show loading state
  modalBody.innerHTML = '<div style="text-align: center; padding: 40px;">📖 Loading note content...</div>';
  modal.style.display = 'block';

  try {
  const noteFileName = noteNumber.toLowerCase().replace(' ', '');

  const notePath =
    `${import.meta.env.BASE_URL}notes/${noteFileName}.html`;

  const response = await fetch(notePath);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
    
    // Parse HTML and extract content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = doc.querySelector('.note-container');
    
    if (content) {
      // Set title from the note's title tag
      const noteTitle = doc.querySelector('title');
      modalTitle.textContent = noteTitle ? noteTitle.textContent : `Note ${noteNumber}`;
      
      // Clone content and remove back button if present
      const contentClone = content.cloneNode(true);
      const backButton = contentClone.querySelector('.back-button');
      if (backButton) backButton.remove();
      
      modalBody.innerHTML = contentClone.innerHTML;
    } else {
      modalBody.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">❌ Failed to load note content</div>';
    }
  } catch (error) {
    console.error('Failed to load note:', error);
    modalBody.innerHTML = '<div style="text-align: center; padding: 40px; color: #ef4444;">❌ Error loading note. Please try again.</div>';
  }
}

// Close modal programmatically
function closeNoteModalFunction() {
  const modal = document.getElementById('noteModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// IMPORTANT: Attach to window object so it can be called from HTML
window.openNoteModal = openNoteModalFunction;
window.closeNoteModal = closeNoteModalFunction;

// Auto-create modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    createModal();
  });
} else {
  createModal();
}

// Export for module usage (optional)
export { openNoteModalFunction as openNoteModal, closeNoteModalFunction as closeNoteModal };