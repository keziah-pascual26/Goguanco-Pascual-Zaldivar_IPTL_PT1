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

function updateReactionCounts(storyIndex) {
    const counts = reactionCounts[storyIndex];

    // Update the reaction counts for the current story
    document.getElementById('likeCount').textContent = counts.like;
    document.getElementById('loveCount').textContent = counts.love;
    document.getElementById('hahaCount').textContent = counts.haha;
    document.getElementById('sadCount').textContent = counts.sad;
    document.getElementById('angryCount').textContent = counts.angry;
}

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