// Get the person identifier from the URL hash
let personId = null;
let links = [];
let editingIndex = -1;

function getPersonIdFromHash() {
    const hash = window.location.hash.toLowerCase();
    const match = hash.match(/^#(ben|gin|phil)$/);
    if (match) {
        return match[0].substring(1); // Remove the # from the hash
    }
    return null;
}

// Initialize person ID from hash
personId = getPersonIdFromHash();

// DOM Elements
let appContainer = document.querySelector('.container');
let linkContainer = document.getElementById('linkContainer');
let addLinkButton = document.getElementById('addLinkButton');
let linkModal = document.getElementById('linkModal');
let messageModal = document.getElementById('messageModal');
let confirmModal = document.getElementById('confirmModal');
let linkForm = document.getElementById('linkForm');
let modalTitle = document.getElementById('modalTitle');
let messageText = document.getElementById('messageText');
let resetButton = document.getElementById('resetButton');
let madeForYouButton = document.getElementById('madeForYouButton');

// Event Listeners
function initializeEventListeners() {
    addLinkButton?.addEventListener('click', () => openAddLinkModal());
    linkForm?.addEventListener('submit', handleLinkSubmit);
    resetButton?.addEventListener('click', () => showConfirmModal());
    madeForYouButton?.addEventListener('click', showThankYouMessage);

    document.querySelectorAll('.close-button, .cancel-button').forEach(button => {
        button.addEventListener('click', () => {
            linkModal.style.display = 'none';
            messageModal.style.display = 'none';
            confirmModal.style.display = 'none';
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            linkModal.style.display = 'none';
            messageModal.style.display = 'none';
            confirmModal.style.display = 'none';
        }
    });

    document.getElementById('confirmYes')?.addEventListener('click', resetToDefault);
    document.getElementById('confirmNo')?.addEventListener('click', () => {
        confirmModal.style.display = 'none';
    });
}

// Initialize the app based on current route
function initializeApp() {
    personId = getPersonIdFromHash();
    if (personId && PEOPLE_DATA[personId]) {
        showPersonData(personId);
    } else {
        showLandingPage();
    }
}

// Listen for hash changes
window.addEventListener('hashchange', initializeApp);

function showPersonData(personId) {
    const personData = PEOPLE_DATA[personId];
    links = JSON.parse(localStorage.getItem(`${personId}_links`)) || personData.defaultLinks;
    
    // Update the app container
    appContainer.innerHTML = `
        <header>
            <h1>Bookmark Bros 😎</h1>
            <div class="header-buttons">
                <button id="resetButton" class="action-button">Reset Links</button>
                <button id="madeForYouButton" class="action-button">I Made This For You</button>
            </div>
        </header>

        <main>
            <div id="linkContainer" class="link-container">
                <!-- Links will be dynamically added here -->
            </div>

            <button id="addLinkButton" class="add-link-button">
                Add New Link
            </button>
        </main>

        <!-- Modal for adding/editing links -->
        <div id="linkModal" class="modal">
            <div class="modal-content">
                <h2 id="modalTitle">Add New Link</h2>
                <form id="linkForm">
                    <input type="text" id="linkTitle" placeholder="Link Title" required>
                    <input type="url" id="linkUrl" placeholder="https://example.com" required>
                    <div class="modal-buttons">
                        <button type="submit">Save</button>
                        <button type="button" class="cancel-button">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Message Modal -->
        <div id="messageModal" class="modal">
            <div class="modal-content message-content">
                <button class="close-button">&times;</button>
                <div id="messageText"></div>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <div id="confirmModal" class="modal">
            <div class="modal-content">
                <h2>Are you sure?</h2>
                <p>This will reset all links to default values.</p>
                <div class="modal-buttons">
                    <button id="confirmYes">Yes, Reset</button>
                    <button id="confirmNo">Cancel</button>
                </div>
            </div>
        </div>
    `;

    // Re-get all DOM elements after updating HTML
    const newLinkContainer = document.getElementById('linkContainer');
    linkContainer = document.getElementById('linkContainer');
    addLinkButton = document.getElementById('addLinkButton');
    linkModal = document.getElementById('linkModal');
    messageModal = document.getElementById('messageModal');
    confirmModal = document.getElementById('confirmModal');
    linkForm = document.getElementById('linkForm');
    modalTitle = document.getElementById('modalTitle');
    messageText = document.getElementById('messageText');
    resetButton = document.getElementById('resetButton');
    madeForYouButton = document.getElementById('madeForYouButton');

    if (newLinkContainer) {
        renderLinks(newLinkContainer);
    }

    // Re-initialize event listeners
    initializeEventListeners();
}

function showLandingPage() {
    appContainer.innerHTML = `
        <div class="landing-container">
            <h1>👋 Hey there!</h1>
            <div class="landing-message">
                <p>You've found Bookmark Bros 😎, but we can't find your personalised bookmarks! 🤔</p>
                <p>This link manager was made specially for someone. If that's you, make sure you're using the correct URL!</p>
                <p style="font-style: italic; font-size: 0.9em;">But since all your custom bookmarks are stored in your localstorage and the quirky default ones are hardcoded...</p>
                <p><strong>Try these links:</strong></p>
                <ul style="list-style: none; padding: 0; margin-top: 1rem;">
                    <li><a href="#ben" style="color: var(--primary-color);">Ben's Bookmarks</a></li>
                    <li><a href="#gin" style="color: var(--primary-color);">Gin's Bookmarks</a></li>
                    <li><a href="#phil" style="color: var(--primary-color);">Phil's Bookmarks</a></li>
                </ul>
                <div class="landing-emoji">🔍</div>
                <p class="github-link">
                    Can't find yourself here? Think I should write you a special letter and make you some quirky default bookmarks?<br>
                    <a href="https://github.com/in03/bookmark-bros/issues" target="_blank">Write an issue here! 📝</a>
                </p>
            </div>
        </div>
    `;
}

// Functions
function renderLinks(container) {
    container.innerHTML = '';
    links.forEach((link, index) => {
        const linkElement = document.createElement('div');
        linkElement.className = 'link-item';
        linkElement.draggable = true;
        linkElement.dataset.index = index;
        
        linkElement.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', index);
            linkElement.classList.add('dragging');
        };
        
        linkElement.ondragend = () => {
            linkElement.classList.remove('dragging');
        };
        
        linkElement.ondragover = (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement && draggingElement !== linkElement) {
                linkElement.classList.add('drag-over');
            }
        };
        
        linkElement.ondragleave = () => {
            linkElement.classList.remove('drag-over');
        };
        
        linkElement.ondrop = (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            
            if (fromIndex !== toIndex) {
                const item = links[fromIndex];
                links.splice(fromIndex, 1);
                links.splice(toIndex, 0, item);
                saveLinks();
                renderLinks(container);
            }
            linkElement.classList.remove('drag-over');
        };
        
        linkElement.onclick = (e) => {
            if (!e.target.closest('.link-button')) {
                visitLink(link.url, link.title);
            }
        };
        
        linkElement.innerHTML = `
            <span class="link-title">
                <span class="drag-handle">⋮⋮</span>
                ${link.title}
            </span>
            <div class="link-actions">
                <button class="link-button edit-button" data-index="${index}">✏️</button>
                <button class="link-button delete-button" data-index="${index}">🗑️</button>
            </div>
        `;

        // Add event listeners for edit and delete buttons
        const editButton = linkElement.querySelector('.edit-button');
        const deleteButton = linkElement.querySelector('.delete-button');
        
        editButton.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            editLink(index);
        });
        
        deleteButton.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteLink(index);
        });

        container.appendChild(linkElement);
    });
}

function openAddLinkModal() {
    modalTitle.textContent = 'Add New Link';
    linkForm.reset();
    editingIndex = -1;
    linkModal.style.display = 'flex';
    document.getElementById('linkTitle').focus();
}

function editLink(index) {
    modalTitle.textContent = 'Edit Link';
    const link = links[index];
    document.getElementById('linkTitle').value = link.title;
    document.getElementById('linkUrl').value = link.url;
    editingIndex = index;
    linkModal.style.display = 'flex';
}

function deleteLink(index) {
    links.splice(index, 1);
    saveLinks();
    renderLinks(linkContainer);
}

function handleLinkSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;

    if (editingIndex === -1) {
        links.push({ title, url });
    } else {
        links[editingIndex] = { title, url };
    }

    saveLinks();
    renderLinks(linkContainer);
    linkModal.style.display = 'none';
}

function saveLinks() {
    localStorage.setItem(`${personId}_links`, JSON.stringify(links));
}

function showConfirmModal() {
    confirmModal.style.display = 'flex';
}

function resetToDefault() {
    links = [...PEOPLE_DATA[personId].defaultLinks];
    saveLinks();
    renderLinks(linkContainer);
    confirmModal.style.display = 'none';
}

function showThankYouMessage() {
    const messageContent = document.querySelector('.message-content');
    messageContent.classList.add('thank-you');
    messageContent.classList.remove('encouragement');
    const messageText = document.getElementById('messageText');
    messageText.innerHTML = PEOPLE_DATA[personId].letter.replace(/\n/g, '<br>');
    messageModal.style.display = 'flex';
}

async function visitLink(url, title) {
    // Get the modals after potential DOM updates
    const messageModal = document.getElementById('messageModal');
    const messageContent = document.querySelector('.message-content');
    const messageText = document.getElementById('messageText');

    // Show encouragement message with confetti
    messageContent.classList.add('encouragement');
    messageContent.classList.remove('thank-you');
    const message = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
    messageText.innerHTML = `<button class="close-button">&times;</button>${message}`;
    messageModal.style.display = 'flex';

    // Trigger confetti
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });

    // Wait 3 seconds before navigating
    await new Promise(resolve => setTimeout(resolve, 3000));
    messageModal.style.display = 'none';
    window.location.href = url;
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeEventListeners();
}); 