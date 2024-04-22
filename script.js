let videoCount = 0;
let players = []; // Array to store YouTube player instances

// Function to add a new video player
function addVideoPlayer(videoId, volume) {
  const videosContainer = document.getElementById('videos-container');

  // Create a div for the video player
  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('video-wrapper');

  // Create an iframe for the YouTube video
  const iframe = document.createElement('iframe');
  iframe.width = '560';
  iframe.height = '315';
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=0`;
  iframe.frameborder = '0';
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;

  // Append the iframe to the video wrapper
  videoWrapper.appendChild(iframe);

  // Create a volume slider
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = 0;
  volumeSlider.max = 100;
  volumeSlider.value = volume * 100;
  volumeSlider.classList.add('slider');
  volumeSlider.addEventListener('input', function () {
    setVolume(videoWrapper, volumeSlider.value);
  });

  // Append the volume slider to the video wrapper
  videoWrapper.appendChild(volumeSlider);

  // Create a remove button
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', function () {
    removeVideo(videoWrapper);
  });

  // Append the remove button to the video wrapper
  videoWrapper.appendChild(removeButton);

  // Append the video wrapper to the videos container
  videosContainer.appendChild(videoWrapper);

  // Initialize the YouTube iframe API for the video
  initializeYouTubeAPI(iframe, volume);
}

// Function to initialize the YouTube iframe API for a video
function initializeYouTubeAPI(iframe, volume) {
  const player = new YT.Player(iframe, {
    events: {
      'onReady': function (event) {
        event.target.setVolume(volume * 100); // Set volume (0-100)
        players.push(event.target); // Add player instance to the array
      }
    }
  });
}

// Function to add a new video
function addVideo() {
  const videoUrlInput = document.getElementById('video-url');
  const videoUrl = videoUrlInput.value.trim();

  if (!videoUrl) {
    alert('Please enter a video URL.');
    return;
  }

  const volume = 0.5; // Default volume
  const videoId = getVideoId(videoUrl);

  // Add the new video player
  addVideoPlayer(videoId, volume);

  // Clear the input field
  videoUrlInput.value = '';
}

// Function to remove a video
function removeVideo(videoWrapper) {
  const iframe = videoWrapper.querySelector('iframe');
  const videoId = iframe.src.split('/').pop().split('?')[0]; // Extract video ID from iframe src

  // Remove the YouTube player instance from the array
  players = players.filter(player => player.getVideoData().video_id !== videoId);

  // Remove the video wrapper
  videoWrapper.remove();
}

// Function to extract video ID from YouTube URL
function getVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  } else {
    alert('Invalid YouTube URL.');
  }
}

// Function to set volume for a video
function setVolume(videoWrapper, volume) {
  const iframe = videoWrapper.querySelector('iframe');
  const videoId = iframe.src.split('/').pop().split('?')[0]; // Extract video ID from iframe src

  // Retrieve the YouTube player instance by video ID
  const player = players.find(player => player.getVideoData().video_id === videoId);

  // Set the volume using the YouTube API
  if (player) {
    player.setVolume(volume);
  }
}

// Add event listener for "Add Video" button
document.getElementById('add-video-btn').addEventListener('click', addVideo);



// Function to paste clipboard content into the input field
function pasteFromClipboard() {
  navigator.clipboard.readText()
    .then(text => {
      document.getElementById('video-url').value = text.trim();
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
}

// Add event listener for "Paste" button
document.getElementById('paste-btn').addEventListener('click', pasteFromClipboard);
