// Function to handle the image preview
function addStories() {
    console.log('Post story');
    const mediaInput = document.getElementById('mediaInput');
    const storyTitleInput = document.getElementById('storyTitle');
    const storyDescriptionInput = document.getElementById('storyDescription');
    const files = Array.from(mediaInput.files);
    const storyTitle = storyTitleInput.value.trim() || "Untitled Story";
    const storyDescription = storyDescriptionInput.value.trim() || "";
    console.log('Story description:', storyDescription);
    if (files.length === 0) {
        alert('Please select at least one image or video.');
        return;
    }
    if (isCroppingEnabled && !cropper) {
        console.log("Re-initializing cropper");
        enableCropping();
    }
    let previewContainer = document.getElementById('storyPreviewContainer');
    previewContainer.innerHTML = '';
    files.forEach((file, index) => {
        let previewElement;
        let fileType = file.type.startsWith('image/') ? 'image' : 'video';
        if (fileType === 'image') {
            previewElement = document.createElement('img');
            previewElement.src = URL.createObjectURL(file);
            previewElement.style.maxWidth = '100%';
            if (croppedImageData) {
                previewElement.src = croppedImageData;
                croppedImageData = null;
            }
        } else if (fileType === 'video') {
            previewElement = document.createElement('video');
            previewElement.src = URL.createObjectURL(file);
            previewElement.style.maxWidth = '100%';
            if (modifiedVideoUrl) {
                previewElement.src = modifiedVideoUrl;
            }
        }
        previewContainer.appendChild(previewElement);
    });
    document.getElementById('previewStoryTitle').textContent = storyTitle || "Untitled Story";
    document.getElementById('previewStoryDescription').textContent = storyDescription || "No description provided";
    const confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.style.display = 'flex';
    document.getElementById('confirmBtn').onclick = () => {
        console.log('Confirming the story upload');
        processFilesForUpload(storyTitle, storyDescription, files);
        closeConfirmationModal();
    };
    document.getElementById('cancelBtn').onclick = () => {
        console.log('Cancelling the story upload');
        closeConfirmationModal();
    };
}

function processFilesForUpload(storyTitle, storyDescription, files) {
    files.forEach(async (file, index) => {
        const storyElement = document.createElement('div');
        storyElement.classList.add('story');
        storyElement.setAttribute('data-index', storyQueue.length);
        let url = URL.createObjectURL(file);
        let fileType = file.type.startsWith('image/') ? 'image' : 'video';
        if (fileType === 'video') {
            try {
                const shouldTrimVideo = document.getElementById('trimVideoCheckbox').checked;
                if (shouldTrimVideo) {
                    url = await trimAndRecordVideo();
                }
            } catch (error) {
                alert('Error trimming video: ' + error);
                return;
            }
        }
        let storyData = {
            src: url,
            type: fileType,
            title: storyTitle,
            description: storyDescription,
            rotation: rotationAngle,
            resizeFactor: resizeFactor,
            audio: audioUrl,
            isMuted: isMuted
        };
        if (fileType === 'image' && croppedImageData) {
            console.log("Cropping image...");
            storyData.src = croppedImageData;
            croppedImageData = null;
            console.log("Cropped image added to story");
        }
        if (fileType === 'image') {
            const img = document.createElement('img');
            img.src = storyData.src;
            img.style.transform = `rotate(${rotationAngle}deg) scale(${resizeFactor})`;
            storyElement.appendChild(img);
        } else if (fileType === 'video') {
            const video = document.createElement('video');
            video.src = storyData.src;
            video.controls = false;
            video.muted = isMuted;
            storyElement.appendChild(video);
        } else {
            alert('Unsupported file type.');
            return;
        }
        if (audioUrl) {
            const audio = document.createElement('audio');
            audio.src = audioUrl;
            audio.controls = false;
            audio.loop = true;
            audio.pause();
            storyElement.appendChild(audio);
            storyData.audioElement = audio;
        }
        storyQueue.push(storyData);
        reactionCounts[storyQueue.length - 1] = { like: 0, love: 0, haha: 0, sad: 0, angry: 0 };
        storyElement.addEventListener('click', () => {
            currentStoryIndex = storyQueue.findIndex(item => item.src === storyData.src);
            showStory(currentStoryIndex);
        });
        storiesContainer.appendChild(storyElement);
    });
    rotationAngle = 0;
    resizeFactor = 1;
    const previewImage = document.getElementById('imagePreview');
    if (previewImage) {
        previewImage.style.transform = 'rotate(0deg) scale(1)';
    }
    const storyTitleInput = document.getElementById('storyTitle');
    const storyDescriptionInput = document.getElementById('storyDescription');
    const mediaInput = document.getElementById('mediaInput');
    storyTitleInput.value = '';
    storyDescriptionInput.value = '';
    mediaInput.value = '';
    createStoryIndicators();
    closeCreateStoryModal();
    audioUrl = null;
    const audioPreview = document.querySelector('audio');
    if (audioPreview) {
        audioPreview.pause();
        audioPreview.currentTime = 0;
        audioPreview.remove();
    }
    const audioInput = document.getElementById('audioInput');
    if (audioInput) {
        audioInput.value = '';
    }
}

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
    closeButton.addEventListener('click', () => {
        stopAudioPlayback();
        closeStoryViewer();
    });
    storyViewerContent.appendChild(closeButton);
    const storyContainer = document.createElement('div');
    storyContainer.classList.add('story-container');
    stopAudioPlayback();
    if (story.type === 'image') {
        const img = document.createElement('img');
        img.src = story.src;
        img.style.transform = `rotate(${story.rotation}deg) scale(${story.resizeFactor})`;
        storyContainer.appendChild(img);
        if (story.audioElement) {
            currentAudio = story.audioElement;
            currentAudio.play().catch(error => console.error('Audio playback failed:', error));
            setTimeout(() => {
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }
            }, 5000);
        }
        updateProgressBar(5000, () => showStory(index + 1));
    } else if (story.type === 'video') {
        const video = document.createElement('video');
        video.src = story.src;
        video.autoplay = true;
        video.muted = isMuted;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        storyContainer.appendChild(video);
        video.onloadedmetadata = () => {
            let duration = Math.min(video.duration * 1000, 15000);
            updateProgressBar(duration, () => {
                stopAudioPlayback();
                video.pause();
                video.currentTime = 0;
                showStory(index + 1);
            });
            setTimeout(() => {
                if (!video.paused) {
                    stopAudioPlayback();
                    video.pause();
                    video.currentTime = 0;
                    showStory(index + 1);
                }
            }, duration);
        };
        currentVideo = video;
        if (story.audioElement) {
            currentAudio = story.audioElement;
            currentAudio.play().catch(error => console.error('Audio playback failed:', error));
            video.onloadedmetadata = () => {
                let duration = Math.min(video.duration * 1000, 15000);
                setTimeout(() => {
                    if (currentAudio) {
                        currentAudio.pause();
                        currentAudio.currentTime = 0;
                    }
                }, duration);
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
    if (!document.querySelector('.progress-bar')) {
        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('progress-bar-container');
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        progressBarContainer.appendChild(progressBar);
        storyViewerContent.appendChild(progressBarContainer);
    }
    
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
    if (story.description) {
        descriptionDisplay.innerHTML = `<p><strong>Caption:</strong> ${story.description}</p>`;
        descriptionDisplay.style.display = 'block';
    } else {
        descriptionDisplay.style.display = 'none';
    }
}

function closeStoryViewer() {
    clearTimeout(progressTimeout);
    storyViewer.classList.remove('active');
    storyViewerContent.innerHTML = '';
    toggleReactions(false);
    isStoryViewed = false;
}