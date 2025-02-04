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
let uploadedFileType = null; // Variable to store the file type
let rotationAngle = 0;
let currentStoryData = null;
let resizeFactor = 1;  // A factor to control resizing


// Function to handle media upload
function handleMediaUpload(event) {
    const file = event.target.files[0];
    const imageEditor = document.getElementById('imageEditor');
    const videoEditor = document.getElementById('videoEditor');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const videoSource = document.getElementById('videoSource');
    const previewContainer = document.getElementById('previewContainer');
    const cropButton = document.getElementById('cropImage');

    // Hide both editors initially
    imageEditor.style.display = 'none';
    videoEditor.style.display = 'none';

    // Hide preview initially
    imagePreview.style.display = 'none';
    videoPreview.style.display = 'none';

    // Hide editor section initially
    document.getElementById('editorSection').style.display = 'none';
    cropButton.style.display = 'in-line block'; // Hide crop button initially

    if (file) {
        const fileType = file.type;

        // Show the appropriate editor and preview based on file type
        if (fileType.startsWith('image/')) {
            imageEditor.style.display = 'block';
            const reader = new FileReader();
            reader.onload = function () {
                // Set the image preview source
                imagePreview.src = reader.result;
                imagePreview.style.display = 'block';

                 
                // Destroy previous Cropper instance (if exists)
                if (cropper) {
                    cropper.destroy();
                }
                // Disable cropping initially (cropper is not initialized yet)
                cropButton.style.display = 'block'; 

            };
            reader.readAsDataURL(file);
        } else if (fileType.startsWith('video/')) {
            videoEditor.style.display = 'block';
            const reader = new FileReader();
            reader.onload = function () {
                videoSource.src = reader.result;
                videoPreview.style.display = 'block';
                videoPreview.load();
            };
            reader.readAsDataURL(file);
        }
    }

    // Show the preview container once the media is selected
    previewContainer.style.display = 'block';
}



// Function to show the editor section when "Edit" button is clicked
function editStory() {
    // Display the editor section
    const editorSection = document.getElementById('editorSection');
    editorSection.style.display = 'block';

    // Ensure that the editor (image or video) is visible based on the file type
    const imageEditor = document.getElementById('imageEditor');
    const videoEditor = document.getElementById('videoEditor');

    if (imageEditor.style.display === 'block') {
        console.log("image read")
        imageEditor.style.display = 'block';
        videoEditor.style.display = 'none';
    } else if (videoEditor.style.display === 'block') {
        console.log("video read")
        videoEditor.style.display = 'block';
        imageEditor.style.display = 'none';
    }
}




// Placeholder functions for image/video actions (to be implemented later)
function rotateImage() {
    const imagePreview = document.getElementById('imagePreview');
    
    if (!imagePreview) return;

    // Increment rotation angle
    rotationAngle += 90;
    if (rotationAngle >= 360) rotationAngle = 0;  // Reset at full rotation

    // Apply the rotation to the image preview
    imagePreview.style.transform = `rotate(${rotationAngle}deg) scale(${resizeFactor})`;
    imagePreview.style.transition = 'transform 0.5s';  

    // Ensure the global data is updated correctly
    if (currentStoryData) {
        currentStoryData.rotationAngle = rotationAngle;
    }
}


// Function to show the image or video preview
function showPreview(file) {
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');
    const videoSource = document.getElementById('videoSource');

    // Reset previews
    imagePreview.style.display = 'none';
    videoPreview.style.display = 'none';

    // Ensure preview container follows 9:16 ratio
    previewContainer.style.display = 'block'; 
    previewContainer.style.width = '300px'; // Adjust as needed
    previewContainer.style.height = (300 * 16) / 9 + 'px'; // Maintain 9:16 ratio

    if (file.type.startsWith('image')) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
    } else if (file.type.startsWith('video')) {
        videoSource.src = URL.createObjectURL(file);
        videoPreview.load();
        videoPreview.style.display = 'block';
    }
}



// Max and min resize limits
const MAX_RESIZE = 2; // 200% size
const MIN_RESIZE = 0.5; // 50% size

// Resize function to resize the image
function resizeImage() {
    console.log('Resize image');
    
    const img = document.getElementById('imagePreview');
    
    if (img && img.style.display !== 'none') {
        // Ensure resizeFactor is within the limit
        resizeFactor = Math.min(Math.max(resizeFactor + 0.1, MIN_RESIZE), MAX_RESIZE);
        
        // Apply scale transformation to the image
        img.style.transition = 'transform 0.3s';  // Smooth transition
        img.style.transform = `scale(${resizeFactor})`;
    } else {
        console.log('No image found or image is hidden.');
    }
}

// Minimize Image (Reduce size)
function minimizeImage() {
    const img = document.getElementById('imagePreview');
    
    if (img && img.style.display !== 'none') {
        // Decrease resizeFactor and apply scaling transformation
        resizeFactor = Math.max(resizeFactor - 0.1, MIN_RESIZE);
        img.style.transition = 'transform 0.3s';  // Smooth transition
        img.style.transform = `scale(${resizeFactor})`;
    }
}

// Maximize Image (Increase size)
function maximizeImage() {
    const img = document.getElementById('imagePreview');
    
    if (img && img.style.display !== 'none') {
        // Increase resizeFactor and apply scaling transformation
        resizeFactor = Math.min(resizeFactor + 0.1, MAX_RESIZE);
        img.style.transition = 'transform 0.3s';  // Smooth transition
        img.style.transform = `scale(${resizeFactor})`;
    }
}

// Function to handle trimming the video
function trimAndRecordVideo() {
    return new Promise((resolve, reject) => {
        // Ensure everything is set up correctly and the video is trimmed
        const videoElement = document.getElementById('videoPreview');
        const startTimeInput = document.getElementById('startTimeInput');
        const endTimeInput = document.getElementById('endTimeInput');
        const startTime = parseInt(startTimeInput.value);
        const endTime = parseInt(endTimeInput.value);

        // Validate the start and end times
        if (isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
            reject('Invalid start or end time.');
            return;
        }

        const stream = videoElement.captureStream();
        if (stream.getTracks().length === 0) {
            reject('No valid audio or video tracks found.');
            return;
        }

        const mediaRecorder = new MediaRecorder(stream);
        let recordedChunks = [];
        
        mediaRecorder.ondataavailable = function(event) {
            recordedChunks.push(event.data);
        };

        mediaRecorder.start();

        videoElement.currentTime = startTime;
        videoElement.play();

        videoElement.ontimeupdate = function () {
            if (videoElement.currentTime >= endTime - 0.1) { // Slight buffer
                videoElement.pause();
                mediaRecorder.stop();
            }
        };

        mediaRecorder.onstop = function () {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);
            resolve(videoUrl);  // Resolve the Promise with the video URL
        };
    });
}


// Open Create Story Modal
function openCreateStoryModal() {
    // Show the modal and overlay
    document.getElementById('createStoryModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    
    // Reset the form inputs when opening the modal
    resetModalInputs();
}

// Function to reset modal inputs when opening the modal
function resetModalInputs() {
    document.getElementById('storyTitle').value = '';  
    document.getElementById('mediaInput').value = '';  
    document.getElementById('audioInput').value = '';  

    document.getElementById('previewContainer').style.display = 'none';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('videoPreview').style.display = 'none';
    document.getElementById('imageEditor').style.display = 'none';
    document.getElementById('videoEditor').style.display = 'none';
    document.getElementById('editorSection').style.display = 'none';
    document.getElementById('rotateImage').style.display = 'none';

    // Reset the rotation of the preview image
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.transform = 'rotate(0deg) scale(1)'; // Reset rotation and scale
    }

    // **RESET rotation and scaling globally**
    rotationAngle = 0;
    resizeFactor = 1;
}



// Close Create Story Modal
function closeCreateStoryModal() {
    resizeFactor = 1;  // Reset to the default size factor
    createStoryModal.style.display = 'none';
    overlay.style.display = 'none'; // Hide the overlay
    
}


// Event Listener for opening modal
createStoryButton.addEventListener('click', openCreateStoryModal);

// Close modal when overlay is clicked
overlay.addEventListener('click', closeCreateStoryModal);

// Handle the reaction button click event
document.querySelectorAll('.reaction').forEach(button => {
    button.addEventListener('click', function(event) {
        const reactionType = event.target.getAttribute('data-reaction');
        const storyIndex = currentStoryIndex; // Get current story index

        // If this is the first time reactions are added for this story, initialize them
        if (!reactionCounts[storyIndex]) {
            reactionCounts[storyIndex] = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };
        }

        // Increment the count for the reaction type
        reactionCounts[storyIndex][reactionType]++;

        // Update the UI with the new counts
        updateReactionCounts(storyIndex);
    });
});

// Function to handle the image preview


function addStories() {
    console.log('Preparing preview for stories');

    const mediaInput = document.getElementById('mediaInput');
    const storyTitleInput = document.getElementById('storyTitle');
    const storyDescriptionInput = document.getElementById('storyDescription');

    const files = Array.from(mediaInput.files);
    const storyTitle = storyTitleInput.value.trim() || "Untitled Story";
    const storyDescription = storyDescriptionInput.value.trim() || "";

    if (files.length === 0) {
        alert('Please select at least one image or video.');
        return;
    }

    const previewContainer = document.getElementById('storyPreview');
    previewContainer.innerHTML = ''; // Clear previous previews

    let storyPreviewData = [];

    files.forEach((file, index) => {
        let fileType = file.type.startsWith('image/') ? 'image' : 'video';
        let url = URL.createObjectURL(file);

        const storyPreviewElement = document.createElement('div');
        storyPreviewElement.classList.add('story-preview-item');

        let previewSrc = fileType === 'image' && croppedImageData ? croppedImageData : url;

        if (fileType === 'image') {
            const img = document.createElement('img');
            img.src = previewSrc; // Use cropped version if available
            img.style.maxWidth = '100%';
            img.style.transform = `rotate(${rotationAngle}deg) scale(${resizeFactor})`; // Apply rotation & resize
            storyPreviewElement.appendChild(img);
        } else if (fileType === 'video') {
            const video = document.createElement('video');
            video.src = url;
            video.controls = true;
            video.muted = isMuted; // Apply mute if needed
            storyPreviewElement.appendChild(video);
        }

        const titleElem = document.createElement('p');
        titleElem.textContent = `Title: ${storyTitle}`;
        const descElem = document.createElement('p');
        descElem.textContent = `Description: ${storyDescription}`;

        // Remove button for preview items
        const removeBtn = document.createElement('button');
        removeBtn.textContent = "Remove";
        removeBtn.onclick = () => {
            storyPreviewElement.remove();
            storyPreviewData.splice(index, 1); // Remove from preview data
        };

        storyPreviewElement.appendChild(titleElem);
        storyPreviewElement.appendChild(descElem);
        storyPreviewElement.appendChild(removeBtn);
        previewContainer.appendChild(storyPreviewElement);

        // Store preview data
        storyPreviewData.push({
            src: previewSrc,
            type: fileType,
            title: storyTitle,
            description: storyDescription,
            rotation: rotationAngle,
            resizeFactor: resizeFactor,
            audio: audioUrl,
            isMuted: isMuted
        });
    });

    // Show the preview modal
    document.getElementById('storyPreviewContainer').style.display = 'block';

    // Confirm upload
    document.getElementById('confirmUpload').onclick = () => {
        processStories(storyPreviewData);
        document.getElementById('storyPreviewContainer').style.display = 'none';
    };

    // Cancel upload
    document.getElementById('cancelUpload').onclick = () => {
        document.getElementById('storyPreviewContainer').style.display = 'none';
    };
}

// ** Process and Add Stories After Confirmation **
function processStories(stories) {
    console.log('Uploading stories:', stories);

    const storiesContainer = document.getElementById('storiesContainer');

    stories.forEach((storyData, index) => {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');
        storyElement.setAttribute('data-index', storyQueue.length);

        // Append the image or video to the story element
        if (storyData.type === 'image') {
            const img = document.createElement('img');
            img.src = storyData.src; // Use edited version
            img.style.transform = `rotate(${storyData.rotation}deg) scale(${storyData.resizeFactor})`; 
            storyElement.appendChild(img);
        } else if (storyData.type === 'video') {
            const video = document.createElement('video');
            video.src = storyData.src;
            video.controls = false;
            video.muted = storyData.isMuted;
            storyElement.appendChild(video);
        }

        // Attach audio if available
        if (storyData.audio) {
            const audio = document.createElement('audio');
            audio.src = storyData.audio;
            audio.controls = false;
            audio.loop = true;
            storyElement.appendChild(audio);
        }

        // Add to queue
        storyQueue.push(storyData);
        reactionCounts[storyQueue.length - 1] = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };

        // Attach click event to view the story
        storyElement.addEventListener('click', () => {
            currentStoryIndex = storyQueue.findIndex(item => item.src === storyData.src);
            showStory(currentStoryIndex);
        });

        storiesContainer.appendChild(storyElement);
    });

    // Reset transformations
    rotationAngle = 0;
    resizeFactor = 1;

    // Reset preview
    const previewImage = document.getElementById('imagePreview');
    if (previewImage) {
        previewImage.style.transform = 'rotate(0deg) scale(1)';
    }

    // Clear input fields
    document.getElementById('storyTitle').value = '';
    document.getElementById('storyDescription').value = '';
    document.getElementById('mediaInput').value = '';

    // Reset audio
    audioUrl = null;
    const audioInput = document.getElementById('audioInput');
    if (audioInput) {
        audioInput.value = '';
    }

    createStoryIndicators();
    closeCreateStoryModal();
}







// Show Story in Viewer


// Reaction Button Click Handler
document.getElementById('storyViewerContent').addEventListener('click', function(event) {
    // Check if the clicked element is a reaction button
    if (event.target.classList.contains('reaction')) {
        const reactionType = event.target.getAttribute('data-reaction');
        
        // Find the story index dynamically from the story viewer
        const storyIndex = currentStoryIndex; // Directly use the currentStoryIndex

        if (!reactionCounts[storyIndex]) {
            // Initialize reaction counts if they don't exist yet
            reactionCounts[storyIndex] = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };
        }

        // Increment the corresponding reaction count for the current story
        reactionCounts[storyIndex][reactionType]++;

        // Update the displayed reaction counts for the current story
        updateReactionCounts(storyIndex);
    }
});

// Function to update the reaction counts in the UI
function updateReactionCounts(storyIndex) {
    const counts = reactionCounts[storyIndex];

    // Update the reaction counts for the current story
    document.getElementById('likeCount').textContent = counts.like;
    document.getElementById('loveCount').textContent = counts.love;
    document.getElementById('hahaCount').textContent = counts.haha;
    document.getElementById('sadCount').textContent = counts.sad;
    document.getElementById('angryCount').textContent = counts.angry;
}

let isStoryViewed = false; // Flag to check if a story is being viewed

// Initialize reaction counts
let reactionCounts = {}; // Global object to store reaction counts for each story

let currentAudio = null;  // Global variable to track the currently playing audio
let currentVideo = null;  // Global variable to track the currently playing video

function showStory(index) {
    if (index < 0 || index >= storyQueue.length) {
        closeStoryViewer();
        return;
    }

    const story = storyQueue[index];
    storyViewerContent.innerHTML = ''; // Clear previous story content
    storyViewerTitle.textContent = story.title;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        stopAudioPlayback(); // Stop any playing audio when closing the story
        closeStoryViewer();
    });
    storyViewerContent.appendChild(closeButton);

    const storyContainer = document.createElement('div');
    storyContainer.classList.add('story-container');

    // Stop any previously playing audio or video
    stopAudioPlayback(); 

    // Handle image story
    if (story.type === 'image') {
        const img = document.createElement('img');
        img.src = story.src;
        img.style.transform = `rotate(${story.rotation}deg) scale(${story.resizeFactor})`;
        storyContainer.appendChild(img);

        if (story.audioElement) {
            currentAudio = story.audioElement;  // Store the new audio element
            currentAudio.play().catch(error => console.error('Audio playback failed:', error));

            setTimeout(() => {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
            }, 5000); // Stop the audio after 5 seconds
        }

        updateProgressBar(5000, () => showStory(index + 1)); 

    } 
    // Handle video story
    else if (story.type === 'video') {
        const video = document.createElement('video');
        video.src = story.src;
        video.autoplay = true;
        video.muted = isMuted; 
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        storyContainer.appendChild(video);
    
        video.onloadedmetadata = () => {
            let duration = Math.min(video.duration * 1000, 15000); // Use video duration but cap it at 15 seconds
    
            updateProgressBar(duration, () => {
                stopAudioPlayback(); // Stop audio when moving to next story
                video.pause();
                video.currentTime = 0;
                showStory(index + 1);
            });
    
            setTimeout(() => {
                if (!video.paused) {
                    stopAudioPlayback(); // Stop audio when moving to next story
                    video.pause();
                    video.currentTime = 0;
                    showStory(index + 1);
                }
            }, duration);
        };
    
        currentVideo = video;  // Store the video element
    
        if (story.audioElement) {
            currentAudio = story.audioElement;  // Store the new audio element for video
            currentAudio.play().catch(error => console.error('Audio playback failed:', error));
    
            video.onloadedmetadata = () => {
                let duration = Math.min(video.duration * 1000, 15000);
    
                setTimeout(() => {
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                    }
                }, duration); // Stop the audio after the determined duration
            };
        }
    }
    

    storyViewerContent.appendChild(storyContainer);

    if (!reactionCounts[index]) {
        reactionCounts[index] = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };
    }

    toggleReactions(true);
    updateReactionCounts(index);
    isStoryViewed = true;
    createStoryIndicators();
    currentStoryIndex = index;
    updateActiveIndicator();
    storyViewer.classList.add('active');

    document.getElementById('previousButton').style.display = index > 0 ? 'block' : 'none';
    document.getElementById('nextButton').style.display = index < storyQueue.length - 1 ? 'block' : 'none';

    // Create the progress bar if it doesn't exist
    if (!document.querySelector('.progress-bar')) {
        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('progress-bar-container');
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        progressBarContainer.appendChild(progressBar);
        storyViewerContent.appendChild(progressBarContainer);
    }

    // Function to stop any playing audio or video when the story viewer is closed or changed
    function stopAudioPlayback() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        if (currentVideo) {
            currentVideo.pause();
            currentVideo.currentTime = 0;
        }
    }

    // Check if the story has a description (caption) and display it
    if (story.description) {
        descriptionDisplay.innerHTML = `<p><strong>Caption:</strong> ${story.description}</p>`;
        descriptionDisplay.style.display = 'block';
    } else {
        descriptionDisplay.style.display = 'none';
    }
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
    showStory(currentStoryIndex - 1);
});

document.getElementById('nextButton').addEventListener('click', () => {
    showStory(currentStoryIndex + 1);
});

// Toggle visibility of the reaction buttons
function toggleReactions(visible) {
    const reactionsPanel = document.getElementById('reactionPanel');
    reactionsPanel.style.display = visible ? 'block' : 'none';
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

// Update the displayed reaction counts for the current story
function updateReactionCounts(storyIndex) {
    const counts = reactionCounts[storyIndex] || { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };

    // Update the HTML elements for each reaction type
    document.getElementById('likeCount').textContent = counts.like;
    document.getElementById('loveCount').textContent = counts.love;
    document.getElementById('hahaCount').textContent = counts.haha;
    document.getElementById('sadCount').textContent = counts.sad;
    document.getElementById('angryCount').textContent = counts.angry;
}


document.getElementById('audioInput').addEventListener('change', handleAudioUpload);

function handleAudioUpload(event) {
    const audioInput = event.target;
    const audioPreview = document.getElementById('audioPreview');

    // Check if a file is selected
    if (audioInput.files && audioInput.files[0]) {
        const file = audioInput.files[0];

        // Check if the file is an audio file (optional additional validation)
        if (file.type.startsWith('audio/')) {
            // Create a URL for the selected file
            const audioUrl = URL.createObjectURL(file);

            // Set the audio source to the file URL
            audioPreview.src = audioUrl;
            
            // Show the audio player
            audioPreview.style.display = 'block';
        } else {
            alert('Please upload a valid audio file (mp3, wav, etc.).');
        }
    } else {
        // Hide the audio player if no file is selected
        audioPreview.style.display = 'none';
    }
}

document.getElementById('audioInput').addEventListener('change', handleAudioUpload);

let audioUrl = null;

function handleAudioUpload(event) {
    const audioInput = event.target;
    const audioPreview = document.getElementById('audioPreview');

    // Check if a file is selected
    if (audioInput.files && audioInput.files[0]) {
        const file = audioInput.files[0];

        // Check if the file is an audio file
        if (file.type.startsWith('audio/')) {
            // Create a URL for the selected file
            audioUrl = URL.createObjectURL(file);

            // Set the audio source to the file URL
            audioPreview.src = audioUrl;

            // Show the audio player
            audioPreview.style.display = 'block';
        } else {
            alert('Please upload a valid audio file (mp3, wav, etc.).');
        }
    } else {
        // Hide the audio player if no file is selected
        audioPreview.style.display = 'none';
    }
}

// Global variable to track mute state
let isMuted = false;

function toggleMute() {
    const muteButton = document.getElementById('muteButton');

    // Toggle the mute state globally
    isMuted = !isMuted;

    // Update the preview video (if exists)
    const previewVideo = document.getElementById('videoPreview');
    if (previewVideo) {
        previewVideo.muted = isMuted;
    }

    // Update all videos inside stories
    document.querySelectorAll('video').forEach(video => {
        video.muted = isMuted;
    });

    // Update button text based on mute state
    muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
}

document.addEventListener('keydown', function(event) {
    if (!isStoryViewed) return;  // Prevent actions if story is not viewed

    switch(event.key) {
        // Handle Right Arrow key - Show next story
        case 'ArrowRight':
            if (currentStoryIndex < storyQueue.length - 1) showStory(currentStoryIndex + 1);
            break;
        
        // Handle Left Arrow key - Show previous story
        case 'ArrowLeft':
            if (currentStoryIndex > 0) showStory(currentStoryIndex - 1);
            break;
        
        // Handle Spacebar - Play/Pause video
        case ' ':
            case 'Spacebar':
                event.preventDefault(); // Prevent default spacebar behavior (scrolling)
                const video = document.querySelector('#storyViewerContent video');
                if (video) {
                    // Toggle play/pause
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
                break;
        
        // Handle Enter key - View the current story
        case 'Enter':
            showStory(currentStoryIndex);
            break;

        // Handle Home key - Jump to the first story
        case 'Home':
            showStory(0);
            break;

        // Handle End key - Jump to the last story
        case 'End':
            showStory(storyQueue.length - 1);
            break;

        // Handle PageDown key - Show the next 5 stories
        case 'PageDown':
            showStory(currentStoryIndex + 5);
            break;

        // Handle PageUp key - Show the previous 5 stories
        case 'PageUp':
            showStory(currentStoryIndex - 5);
            break;

        // Handle F1 key - Show help message
        case 'F1':
            alert('Help: Use arrow keys to navigate, Enter to view a story.');
            break;

        // Handle M key - Mute/Unmute video
        case 'm':
            case 'M':
                const videoMute = document.querySelector('#storyViewerContent video');
                if (videoMute) {
                    // Toggle mute
                    videoMute.muted = !videoMute.muted;
                }
                break;

        // Handle Escape key (ESC) - Close story viewer
        case 'Escape':
            closeStoryViewer();
            break;
    }
});

function updateCharCount() {
        let textArea = document.getElementById("storyDescription");
        let charCount = document.getElementById("charCount");
        let remaining = 100 - textArea.value.length;
        charCount.textContent = remaining + " characters remaining";
    }


// Function to save the story with the description
function saveStory() {
    const title = document.getElementById('storyTitle').value.trim();

    if (!title) {
        alert('Please fill in the title!');
        return;
    }

    console.log('Title:', title);

    const story = {
        title: title,
        media: []
    };

    alert('Story saved successfully!');
    closeCreateStoryModal();
}



document.addEventListener('DOMContentLoaded', function() {
    const title = document.getElementById('storyTitle').value.trim();
    console.log('Title:', title);  // Check the value when the DOM is ready
});

let isCroppingEnabled = false;  // Tracks whether cropping is enabled or not
let cropper = null; // Declare the cropper variable globally

// Function to enable cropping and initialize the Cropper.js instance
function enableCropping() {
    const imagePreview = document.getElementById('imagePreview');
    const cropButton = document.getElementById('cropImage');

    // Check if the image preview exists and isn't already cropped
    if (imagePreview && !cropper) {
        // Wait for the image to load if it's not already loaded
        if (imagePreview.complete) {
            // Image is already loaded, initialize cropper immediately
            initializeCropper(imagePreview);
        } else {
            // Image is still loading, wait for it to load first
            imagePreview.onload = () => {
                initializeCropper(imagePreview);
            };
        }
    }

    // Toggle crop button text based on cropping state
    cropButton.textContent = isCroppingEnabled ? 'Enable Cropping' : 'Done Cropping';
    isCroppingEnabled = !isCroppingEnabled;  // Toggle the cropping state
}

// Function to initialize the cropper
function initializeCropper(imagePreview) {
    if (cropper) {
        // Destroy the previous cropper instance before initializing a new one
        cropper.destroy();
    }

    // Initialize the new cropper for the new image
    cropper = new Cropper(imagePreview, {
        aspectRatio: NaN, // Allow free cropping (no fixed aspect ratio)
        viewMode: 2, // Limits cropping area
        autoCropArea: 0.8, // Starts with 80% of image area
        movable: true, // Allows image movement
        zoomable: true, // Allows zooming in and out
        rotatable: true, // Allows image rotation
        scalable: true // Allows scaling of the image
    });


    // Log the initialization process to the console
    console.log("Cropper Initialized");

    // Ensure crop button is visible and not hidden
    document.getElementById('cropImage').style.display = 'inline-block'; // Make sure it's visible
}


let croppedImageData = null;  // Global variable to hold the cropped image data

function finalizeCropping() {
    console.log("finalizeCropping()");

    const imagePreview = document.getElementById('imagePreview');
    const cropButton = document.getElementById('cropImage');

    if (isCroppingEnabled && cropper) {
        // Get cropped image and update the preview
        const canvas = cropper.getCroppedCanvas();
        if (canvas) {
            croppedImageData = canvas.toDataURL();  // Store cropped image in the global variable
            imagePreview.src = croppedImageData;  // Update the preview image with the cropped version
            cropper.destroy();  // Destroy cropper after cropping
            cropper = null;  // Reset cropper instance
        }
    }

    // Change the button text and disable cropping functionality
    cropButton.textContent = 'Enable Cropping';  // Set text back to "Enable Cropping"
    isCroppingEnabled = false;  // Disable cropping
}


// Attach event listener to the "Crop Image" button
document.getElementById('cropImage').addEventListener('click', () => {
    if (isCroppingEnabled) {
        finalizeCropping();  // Finalize cropping and reset state when "Done Cropping" is clicked
    } else {
        enableCropping();  // Enable cropping and show cropper
        
    }
});

// Function to reset cropping state when a new story/image is uploaded
function resetCroppingState() {
    console.log("resetCroppingState()")
    // Reset the button text to "Enable Cropping"
    document.getElementById('cropImage').textContent = 'Enable Cropping';
    isCroppingEnabled = false; // Ensure cropping is disabled initially
    if (cropper) {
        cropper.destroy();  // Destroy the cropper instance if it's active
        cropper = null;  // Reset cropper instance
    }
}

// Post Template (Dynamically Added)
function submitPost() {
    const caption = document.getElementById('postCaption').value;
    const mediaInput = document.getElementById('postImage');
    const mediaFile = mediaInput.files[0];

    if (!caption && !mediaFile) {
        alert("Please add a caption or a media file!");
        return;
    }

    const postContainer = document.createElement('div');
    postContainer.classList.add('user-post');

    if (mediaFile) {
        const mediaType = mediaFile.type.split('/')[0]; // "image" or "video"
        if (mediaType === 'image') {
            const image = document.createElement('img');
            image.src = URL.createObjectURL(mediaFile);
            image.classList.add('post-media');
            postContainer.appendChild(image);
        } else if (mediaType === 'video') {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(mediaFile);
            video.classList.add('post-media');
            video.controls = true;
            postContainer.appendChild(video);
        } else {
            alert("Unsupported file format. Please upload an image or video.");
            return;
        }
    }

    if (caption) {
        const captionElement = document.createElement('p');
        captionElement.textContent = caption;
        postContainer.appendChild(captionElement);
    }

    // Reactions - Fixed Event Listeners!
    const reactions = document.createElement('div');
    reactions.classList.add('post-reactions');
    reactions.innerHTML = `
        <button class="reaction-btn" data-type="like">👍</button>
        <button class="reaction-btn" data-type="love">❤️</button>
        <button class="reaction-btn" data-type="haha">😂</button>
        <button class="reaction-btn" data-type="sad">😢</button>
        <button class="reaction-btn" data-type="angry">😡</button>
        <button class="share-btn">📤 Share</button>
    `;
    postContainer.appendChild(reactions);

    // Comments Section
    const commentSection = document.createElement('div');
    commentSection.classList.add('post-comments');
    commentSection.innerHTML = `
        <input type="text" placeholder="Write a comment..." class="comment-input">
        <button class="comment-btn">Comment</button>
        <div class="comment-list"></div>
    `;
    postContainer.appendChild(commentSection);

    document.getElementById('userPosts').prepend(postContainer);
    document.getElementById('postCaption').value = '';
    mediaInput.value = '';

    // Add event listeners to the new post
    postContainer.querySelectorAll('.reaction-btn').forEach(button => {
        button.addEventListener('click', () => react(button));
    });

    postContainer.querySelector('.share-btn').addEventListener('click', () => sharePost());
    postContainer.querySelector('.comment-btn').addEventListener('click', function () {
        addComment(this);
    });
}

// Reactions function (now works!)
function react(button) {
    const reactionType = button.getAttribute('data-type');
    alert(`You reacted with ${reactionType}!`);
}

// Add a comment
function addComment(button) {
    const input = button.previousElementSibling;
    if (!input.value) return;

    const comment = document.createElement('p');
    comment.textContent = input.value;
    button.nextElementSibling.appendChild(comment);
    input.value = '';
}

// Share function
function sharePost() {
    alert("Post shared!");
}


function startChat(userName) {
    document.getElementById('chatUserName').innerText = userName;
    document.getElementById('chatPanel').style.display = 'block';
}

function closeChat() {
    document.getElementById('chatPanel').style.display = 'none';
}

function sendMessage() {
    const message = document.getElementById('chatInput').value;
    if (message.trim() !== '') {
        const chatBox = document.getElementById('chatMessages');
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        chatBox.appendChild(newMessage);
        document.getElementById('chatInput').value = '';
    }
}