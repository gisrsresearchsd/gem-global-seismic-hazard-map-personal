// Modal functionality for displaying notes

let modal = null;

// Create modal if it doesn't already exist
function createModal() {
  if (modal) {
    return modal;
  }

  modal = document.getElementById("noteModal");

  if (modal) {
    return modal;
  }

  const modalHtml = `
    <div id="noteModal" class="note-modal" style="display: none;">
      <div class="note-modal-content">
        <div class="note-modal-header">
          <h2 id="noteModalTitle">Note</h2>
          <button class="note-modal-close">&times;</button>
        </div>
        <div class="note-modal-body" id="noteModalBody">
          <div style="text-align: center; padding: 40px;">
            Loading...
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);

  modal = document.getElementById("noteModal");
  return modal;
}

// Close modal
function closeModal() {
  if (!modal) return;
  modal.style.display = "none";
}

// Initialize modal event listeners
function initModalEvents() {
  modal = createModal();

  if (!modal) return;

  const closeBtn = modal.querySelector(".note-modal-close");

  // Close on X button
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });
}

// Set modal body state
function setModalBodyState(message, type = "default") {
  const modalBody = document.getElementById("noteModalBody");

  if (!modalBody) return;

  const className =
    type === "error" ? "note-modal-state error" : "note-modal-state";

  modalBody.innerHTML = `
    <div class="${className}">
      ${message}
    </div>
  `;
}

// Load note content into modal
async function openNoteModalFunction(noteNumber) {
  modal = createModal();

  if (!modal.hasAttribute("data-initialized")) {
    initModalEvents();
    modal.setAttribute("data-initialized", "true");
  }

  const modalTitle = document.getElementById("noteModalTitle");

  const modalBody = document.getElementById("noteModalBody");

  // Show loading state
  setModalBodyState("📖 Loading note content...");

  modal.style.display = "block";

  try {
    const noteFileName = noteNumber.toLowerCase().replace(/\s+/g, "");

    const notePath = `${import.meta.env.BASE_URL}notes/${noteFileName}.html`;

    const response = await fetch(notePath);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const parser = new DOMParser();

    const doc = parser.parseFromString(html, "text/html");

    const content = doc.querySelector(".note-container");

    if (!content) {
      setModalBodyState("❌ Failed to load note content", "error");
      return;
    }

    // Set note title
    const noteTitle = doc.querySelector("title");

    modalTitle.textContent = noteTitle
      ? noteTitle.textContent
      : `Note ${noteNumber}`;

    // Remove navigation if present
    const contentClone = content.cloneNode(true);

    const backButton = contentClone.querySelector(".back-button");

    if (backButton) {
      backButton.remove();
    }

    modalBody.innerHTML = contentClone.innerHTML;
  } catch (error) {
    console.error("Failed to load note:", error);

    setModalBodyState("❌ Error loading note. Please try again.", "error");
  }
}
// Close modal programmatically
function closeNoteModalFunction() {
  closeModal();
}

// Global access for HTML-triggered notes
window.openNoteModal = openNoteModalFunction;

window.closeNoteModal = closeNoteModalFunction;

// Auto-create modal when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createModal);
} else {
  createModal();
}

// Module exports
export {
  openNoteModalFunction as openNoteModal,
  closeNoteModalFunction as closeNoteModal,
};
