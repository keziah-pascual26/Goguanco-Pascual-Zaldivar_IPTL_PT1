// Other functions and variables
let croppedImageData = null;
let modifiedVideoUrl = null;
let isCroppingEnabled = false;
let cropper = null;

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
    imageEditor.style.display = 'none';
    videoEditor.style.display = 'none';
    imagePreview.style.display = 'none';
    videoPreview.style.display = 'none';
    document.getElementById('editorSection').style.display = 'none';
    cropButton.style.display = 'in-line block';
    if (file) {
        const fileType = file.type;
        if (fileType.startsWith('image/')) {
            imageEditor.style.display = 'block';
            const reader = new FileReader();
            reader.onload = function () {
                imagePreview.src = reader.result;
                imagePreview.style.display = 'block';
                if (cropper) {
                    cropper.destroy();
                }
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
    previewContainer.style.display = 'block';
}

// Function to show the editor section when "Edit" button is clicked
function editStory() {
    const editorSection = document.getElementById('editorSection');
    editorSection.style.display = 'block';
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
    rotationAngle += 90;
    if (rotationAngle >= 360) rotationAngle = 0;
    imagePreview.style.transform = `rotate(${rotationAngle}deg) scale(${resizeFactor})`;
    imagePreview.style.transition = 'transform 0.5s';
    if (currentStoryData) {
        currentStoryData.rotationAngle = rotationAngle;
    }
}

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

// Resize function to resize the image
function resizeImage() {
    console.log('Resize image');
    const img = document.getElementById('imagePreview');
    if (img && img.style.display !== 'none') {
        resizeFactor = Math.min(Math.max(resizeFactor + 0.1, MIN_RESIZE), MAX_RESIZE);
        img.style.transition = 'transform 0.3s';
        img.style.transform = `scale(${resizeFactor})`;
    } else {
        console.log('No image found or image is hidden.');
    }
}

// Minimize Image (Reduce size)
function minimizeImage() {
    const img = document.getElementById('imagePreview');
    if (img && img.style.display !== 'none') {
        resizeFactor = Math.max(resizeFactor - 0.1, MIN_RESIZE);
        img.style.transition = 'transform 0.3s';
        img.style.transform = `scale(${resizeFactor})`;
    }
}

// Maximize Image (Increase size)
function maximizeImage() {
    const img = document.getElementById('imagePreview');
    if (img && img.style.display !== 'none') {
        resizeFactor = Math.min(Math.max(resizeFactor + 0.1, MIN_RESIZE), MAX_RESIZE);
        img.style.transition = 'transform 0.3s';
        img.style.transform = `scale(${resizeFactor})`;
    }
}

// Function to handle trimming the video
function trimAndRecordVideo() {
    return new Promise((resolve, reject) => {
        const videoElement = document.getElementById('videoPreview');
        const startTimeInput = document.getElementById('startTimeInput');
        const endTimeInput = document.getElementById('endTimeInput');
        const startTime = parseInt(startTimeInput.value);
        const endTime = parseInt(endTimeInput.value);
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
            if (videoElement.currentTime >= endTime - 0.1) {
                videoElement.pause();
                mediaRecorder.stop();
            }
        };
        mediaRecorder.onstop = function () {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);
            resolve(videoUrl);
        };
    });
}

// Function to handle audio upload
function handleAudioUpload(event) {
    const audioInput = event.target;
    const audioPreview = document.getElementById('audioPreview');
    if (audioInput.files && audioInput.files[0]) {
        const file = audioInput.files[0];
        if (file.type.startsWith('audio/')) {
            audioUrl = URL.createObjectURL(file);
            audioPreview.src = audioUrl;
            audioPreview.style.display = 'block';
        } else {
            alert('Please upload a valid audio file (mp3, wav, etc.).');
        }
    } else {
        audioPreview.style.display = 'none';
    }
}

// Function to toggle mute state
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

// Export the functions and variables
export { enableCropping, finalizeCropping, handleMediaUpload, editStory, croppedImageData, modifiedVideoUrl, isCroppingEnabled, cropper };