// Get the button, modal, and overlay elements
const createStoryButton = document.getElementById('createStoryButton');
const createStoryModal = document.getElementById('createStoryModal');
const overlay = document.getElementById('overlay');
const storiesContainer = document.getElementById('storiesContainer');
const storyViewer = document.getElementById('storyViewer');
const storyViewerContent = document.getElementById('storyViewerContent');
const storyViewerTitle = document.getElementById('storyViewerTitle');
const progressBar = document.getElementById('progressBar');

let storyQueue = [];
let currentStoryIndex = 0;
let progressTimeout;

// Open Create Story Modal
function openCreateStoryModal() {
    createStoryModal.style.display = 'block';
    overlay.style.display = 'block'; // Show the overlay
}

// Close Create Story Modal
function closeCreateStoryModal() {
    createStoryModal.style.display = 'none';
    overlay.style.display = 'none'; // Hide the overlay
}

// Event Listener for opening modal
createStoryButton.addEventListener('click', openCreateStoryModal);

// Close modal when overlay is clicked
overlay.addEventListener('click', closeCreateStoryModal);

// Add stories function
function addStories() {
    const mediaInput = document.getElementById('mediaInput');
    const storyTitleInput = document.getElementById('storyTitle');
    const files = Array.from(mediaInput.files);
    const storyTitle = storyTitleInput.value.trim();

    if (files.length === 0) {
        alert('Please select at least one image or video.');
        return;
    }

    files.forEach((file) => {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');
        const url = URL.createObjectURL(file);
        const title = storyTitle || "Untitled Story";

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = url;
            storyElement.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = url;
            video.controls = false;
            storyElement.appendChild(video);
        } else {
            alert('Unsupported file type.');
            return;
        }

        storyElement.addEventListener('click', () => {
            storyQueue = Array.from(storiesContainer.children)
                .map(child => ({
                    src: child.querySelector('img, video').src,
                    type: child.querySelector('img') ? 'image' : 'video',
                    title: title
                }));

            currentStoryIndex = storyQueue.findIndex(item => item.src === url);
            showStory(currentStoryIndex);
        });

        storiesContainer.appendChild(storyElement);
    });

    storyTitleInput.value = '';
    mediaInput.value = '';
    closeCreateStoryModal(); // Close modal
}

// Show story function
function showStory(index) {
    if (index < 0 || index >= storyQueue.length) {
        storyViewer.classList.remove('active');
        clearTimeout(progressTimeout);
        return;
    }

    const story = storyQueue[index];
    storyViewerContent.innerHTML = ''; // Clear the content
    storyViewerTitle.textContent = story.title;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        const video = storyViewerContent.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        storyViewer.classList.remove('active');
        clearTimeout(progressTimeout);
    });
    storyViewerContent.appendChild(closeButton);

    if (story.type === 'image') {
        const img = document.createElement('img');
        img.src = story.src;
        storyViewerContent.appendChild(img);
        updateProgressBar(5000, () => showStory(index + 1)); // 5 seconds for image
    } else if (story.type === 'video') {
        const video = document.createElement('video');
        video.src = story.src;
        video.autoplay = true;
        video.muted = false;
        storyViewerContent.appendChild(video);

        video.onloadedmetadata = () => {
            updateProgressBar(15000, () => { // 15 seconds for video
                video.pause();
                video.currentTime = 0;
                showStory(index + 1);
            });
        };

        video.onerror = (error) => {
            console.error('Error loading video:', error);
        };
    }

    storyViewer.classList.add('active');
}

// Progress bar update
function updateProgressBar(duration, callback) {
    let startTime = Date.now();
    function update() {
        let elapsed = Date.now() - startTime;
        let progress = Math.min((elapsed / duration) * 100, 100);
        progressBar.style.width = progress + '%';
        if (elapsed >= duration) {
            clearTimeout(progressTimeout);
            callback();
        }
    }
    progressTimeout = setInterval(update, 50);
}
