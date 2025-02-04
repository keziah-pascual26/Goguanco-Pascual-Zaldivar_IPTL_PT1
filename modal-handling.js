function openCreateStoryModal() {
    document.getElementById('createStoryModal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    resetModalInputs();
    console.log("modal-handling.js: openCreateStoryModal() triggered.");
}

function closeCreateStoryModal() {
    document.getElementById('createStoryModal').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

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
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.transform = 'rotate(0deg) scale(1)';
    }
}

export { openCreateStoryModal, closeCreateStoryModal, resetModalInputs };
