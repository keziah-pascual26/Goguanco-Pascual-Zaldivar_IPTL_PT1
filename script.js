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

function handleMediaUpload(event) {
    const file = event.target.files[0]; // Get the uploaded file
    const imageEditor = document.getElementById('imageEditor');
    const videoEditor = document.getElementById('videoEditor');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const videoSource = document.getElementById('videoSource');
    
    // Hide both editors initially
    imageEditor.style.display = 'none';
    videoEditor.style.display = 'none';

    if (file) {
        const fileType = file.type;
        
        // Check if the uploaded file is an image
        if (fileType.startsWith('image/')) {
            imageEditor.style.display = 'block'; // Show the image editor
            const reader = new FileReader();
            reader.onload = function() {
                imagePreview.src = reader.result; // Set image preview source
            }
            reader.readAsDataURL(file);
        } 
        // Check if the uploaded file is a video
        else if (fileType.startsWith('video/')) {
            videoEditor.style.display = 'block'; // Show the video editor
            const reader = new FileReader();
            reader.onload = function() {
                videoSource.src = reader.result; // Set video preview source
                videoPreview.load(); // Reload the video element to display the preview
            }
            reader.readAsDataURL(file);
        }
    }
}

// Placeholder functions for image/video actions (to be implemented later)
function rotateImage() {
    console.log('Rotate image');
}

function cropImage() {
    console.log('Crop image');
}

function resizeImage() {
    console.log('Resize image');
}

function trimVideo() {
    console.log('Trim video');
}

function addStories() {
    console.log('Post story');
}



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

// Add Stories
function addStories() {
    const mediaInput = document.getElementById('mediaInput');
    const storyTitleInput = document.getElementById('storyTitle');
    const files = Array.from(mediaInput.files);
    const storyTitle = storyTitleInput.value.trim() || "Untitled Story";

    if (files.length === 0) {
        alert('Please select at least one image or video.');
        return;
    }

    files.forEach((file) => {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');
        const url = URL.createObjectURL(file);

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

        // Add story details to queue
        const storyData = {
            src: url,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            title: storyTitle
        };

        // Push story to queue
        storyQueue.push(storyData);

        // Attach click event to view the story
        storyElement.addEventListener('click', () => {
            currentStoryIndex = storyQueue.findIndex(item => item.src === url);
            showStory(currentStoryIndex);
        });

        storiesContainer.appendChild(storyElement);
    });

    // Reset form inputs
    storyTitleInput.value = '';
    mediaInput.value = '';

    createStoryIndicators();

    // Close modal after adding story
    closeCreateStoryModal();
}

// Show Story in Viewer function with different time limits for images and videos
function showStory(index) {
    if (index < 0 || index >= storyQueue.length) {
        closeStoryViewer();
        return;
    }

    const story = storyQueue[index];
    storyViewerContent.innerHTML = '';
    storyViewerTitle.textContent = story.title;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', closeStoryViewer);
    storyViewerContent.appendChild(closeButton);

    // Display story content (image or video)
    if (story.type === 'image') {
        const img = document.createElement('img');
        img.src = story.src;
        storyViewerContent.appendChild(img);
        updateProgressBar(5000, () => showStory(index + 1)); // 5 seconds for image
    } else if (story.type === 'video') {
        const video = document.createElement('video');
        video.src = story.src;
        video.autoplay = true;
        video.muted = false; // Ensure video has sound
        storyViewerContent.appendChild(video);

        // Ensure video plays for 15 seconds before switching story
        video.onloadedmetadata = () => {
            updateProgressBar(15000, () => {  // 15 seconds for video
                video.pause();
                video.currentTime = 0; // Reset video to the beginning
                showStory(index + 1);
            });
        };
    }

    createStoryIndicators();

    // Update indicator
    currentStoryIndex = index;
    updateActiveIndicator();
    storyViewer.classList.add('active');

    // Show navigation buttons
    document.getElementById('previousButton').style.display = 'block';
    document.getElementById('nextButton').style.display = 'block';
}

// Close Story Viewer
function closeStoryViewer() {
    clearTimeout(progressTimeout);
    storyViewer.classList.remove('active');
    storyViewerContent.innerHTML = '';
}

// Update Progress Bar function with dynamic time duration
function updateProgressBar(duration, callback) {
    if (!progressBar) return;

    progressBar.style.width = '0%';
    progressBar.style.transition = 'none';  // Disable transition initially for smooth transition

    // Set the transition for the width of the progress bar
    setTimeout(() => {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';
    }, 0); // Ensuring transition happens immediately after setup

    // After the specified duration, call the callback to switch to the next story
    progressTimeout = setTimeout(callback, duration);
}
// Story number indicators

let stories = [];  // Your stories data array

// This function will create story indicators based on the number of stories
function createStoryIndicators() {
    const indicatorsContainer = document.getElementById('story-indicators');
    indicatorsContainer.innerHTML = '';  // Clear existing indicators

    // Create an indicator for each story
    storyQueue.forEach((story, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('story-indicator');
        indicator.classList.add(index === 0 ? 'active' : 'inactive'); // Set the first one as active by default
        indicatorsContainer.appendChild(indicator);
    });
}

// This function will be called to update the active indicator as the story changes
function updateActiveIndicator() {
    const indicators = document.querySelectorAll('.story-indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentStoryIndex) {
            indicator.classList.remove('inactive');
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
            indicator.classList.add('inactive');
        }
    });
}

document.getElementById('previousButton').addEventListener('click', () => {
    showStory(currentStoryIndex - 1);
});

document.getElementById('nextButton').addEventListener('click', () => {
    showStory(currentStoryIndex + 1);
});

