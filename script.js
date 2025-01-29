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

// Handle Media Upload
function handleMediaUpload(event) {
    const file = event.target.files[0];
    const imageEditor = document.getElementById('imageEditor');
    const videoEditor = document.getElementById('videoEditor');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const videoSource = document.getElementById('videoSource');
    
    imageEditor.style.display = 'none';
    videoEditor.style.display = 'none';

    if (file) {
        const fileType = file.type;
        
        if (fileType.startsWith('image/')) {
            imageEditor.style.display = 'block';
            const reader = new FileReader();
            reader.onload = function() {
                imagePreview.src = reader.result;
            }
            reader.readAsDataURL(file);
        } else if (fileType.startsWith('video/')) {
            videoEditor.style.display = 'block';
            const reader = new FileReader();
            reader.onload = function() {
                videoSource.src = reader.result;
                videoPreview.load();
            }
            reader.readAsDataURL(file);
        }
    }
}

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

    files.forEach((file, index) => {  // Add 'index' as a second argument here
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');
        storyElement.setAttribute('data-index', storyQueue.length);  // Add data-index to each story

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

let isStoryViewed = false; // Flag to check if a story is being viewed

// Initialize reaction counts
let reactionCounts = {}; // Global object to store reaction counts for each story

// Show Story in Viewer function with dynamic time limits for images and videos
function showStory(index) {
    if (index < 0 || index >= storyQueue.length) {
        closeStoryViewer();
        return;
    }

    const story = storyQueue[index];
    storyViewerContent.innerHTML = '';
    storyViewerTitle.textContent = story.title;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', closeStoryViewer);
    storyViewerContent.appendChild(closeButton);

    // Initialize reactionCounts for this story if not already set
    if (!reactionCounts[index]) {
        reactionCounts[index] = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };
    }

    // Set the flag to true as a story is being viewed
    isStoryViewed = true;

    // Enable reactions only when a story is being viewed
    toggleReactions(true);

    if (story.type === 'image') {
        const img = document.createElement('img');
        img.src = story.src;
        storyViewerContent.appendChild(img);
        updateProgressBar(5000, () => showStory(index + 1)); // Image duration set to 5 seconds
    } else if (story.type === 'video') {
        const video = document.createElement('video');
        video.src = story.src;
        video.autoplay = true;
        video.muted = false;
        video.controls = false;
        storyViewerContent.appendChild(video);

        video.onloadedmetadata = () => {
            video.play();
            const playDuration = Math.min(15000, video.duration * 1000); // Limit video duration to 15 seconds or the video's natural duration
            updateProgressBar(playDuration, () => {
                video.pause();
                video.currentTime = 0;
                showStory(index + 1);
            });
        };

        // Ensure the video will be stopped after 15 seconds
        setTimeout(() => {
            if (!video.paused) {
                video.pause();
                video.currentTime = 0;
                showStory(index + 1);
            }
        }, 15000); // 15 seconds limit for the video
    }

    createStoryIndicators();
    currentStoryIndex = index;
    updateActiveIndicator();
    storyViewer.classList.add('active');

    document.getElementById('previousButton').style.display = index > 0 ? 'block' : 'none';
    document.getElementById('nextButton').style.display = index < storyQueue.length - 1 ? 'block' : 'none';

    // Update reaction panel with current story's counts
    updateReactionCounts(index);
}

// Close Story Viewer
function closeStoryViewer() {
    clearTimeout(progressTimeout);
    storyViewer.classList.remove('active');
    storyViewerContent.innerHTML = '';
    // Disable reactions when no story is being viewed
    toggleReactions(false);
    isStoryViewed = false;
}

// Update Progress Bar function with dynamic time duration
function updateProgressBar(duration, callback) {
    if (!progressBar) return;

    clearTimeout(progressTimeout);
    progressBar.style.width = '0%';
    progressBar.style.transition = 'none';

    setTimeout(() => {
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';
    }, 50); // Small delay to ensure smooth transition

    progressTimeout = setTimeout(callback, duration);
}

// Story number indicators
let stories = [];

// This function will create story indicators based on the number of stories
function createStoryIndicators() {
    const indicatorsContainer = document.getElementById('story-indicators');
    indicatorsContainer.innerHTML = '';

    storyQueue.forEach((story, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('story-indicator');
        indicator.classList.add(index === 0 ? 'active' : 'inactive');
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
    showStory(currentStoryIndex - 1); // Go to previous story
});

document.getElementById('nextButton').addEventListener('click', () => {
    showStory(currentStoryIndex + 1); // Go to next story
});

//* Show/Hide Reactions Panel
function toggleReactions(show) {
    const reactionCounts = document.getElementById('reactionCounts');
    reactionCounts.style.display = show ? 'block' : 'none';
}

// Show/Hide Reaction Counts when "More" is clicked
document.getElementById('moreReactionsButton').addEventListener('click', function() {
    const reactionCountsDiv = document.getElementById('reactionCounts');
    
    // Toggle visibility of reaction counts
    if (reactionCountsDiv.style.display === 'none') {
        reactionCountsDiv.style.display = 'block'; // Show counts
        this.textContent = 'Less'; // Change button text to "Less"
    } else {
        reactionCountsDiv.style.display = 'none'; // Hide counts
        this.textContent = 'More'; // Change button text to "More"
    }
});

// Reaction Button Click Handler (Updated)
document.getElementById('storyViewerContent').addEventListener('click', function(event) {
    // Check if the clicked element is a reaction button
    if (event.target.classList.contains('reaction')) {
        const reactionType = event.target.getAttribute('data-reaction');
        const storyElement = event.target.closest('.story');
        const storyIndex = parseInt(storyElement.getAttribute('data-index'), 10); // Ensure correct index is used

        // Increment the corresponding reaction count for the current story
        if (!reactionCounts[storyIndex]) {
            // If reaction data doesn't exist yet, initialize it
            reactionCounts[storyIndex] = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };
        }
        reactionCounts[storyIndex][reactionType]++;

        // Update the displayed reaction counts
        updateReactionCounts(storyIndex);
    }
});

// Update the displayed reaction counts
function updateReactionCounts(storyIndex) {
    const counts = reactionCounts[storyIndex] || { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };

    document.getElementById('likeCount').textContent = counts.like;
    document.getElementById('loveCount').textContent = counts.love;
    document.getElementById('hahaCount').textContent = counts.haha;
    document.getElementById('sadCount').textContent = counts.sad;
    document.getElementById('angryCount').textContent = counts.angry;
}
