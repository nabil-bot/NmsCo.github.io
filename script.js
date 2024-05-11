let videoCount = 0;
let players = []; // Array to store YouTube player instances

// Function to add a new video player
function addVideoPlayer(videoId, volume, speed) {
  const videosContainer = document.getElementById('videos-container');

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


  // Create volume container
const volumeContainer = document.createElement('div');
volumeContainer.classList.add('volume-container');

// Create speaker icon
const speakerIcon = document.createElement('i');
speakerIcon.classList.add('fas', 'fa-volume-up', 'volume-icon');


// Append speaker icon and volume slider to volume container
volumeContainer.appendChild(speakerIcon);

// Create volume slider
const volumeSlider = document.createElement('input');
volumeSlider.type = 'range';
volumeSlider.min = 0;
volumeSlider.max = 100;
volumeSlider.value = volume * 100;
volumeSlider.classList.add('slider');
volumeContainer.appendChild(volumeSlider);
// Append volume container to the video wrapper
videoWrapper.appendChild(volumeContainer);
  volumeSlider.addEventListener('input', function () {
    setVolume(videoWrapper, volumeSlider.value);
  });

  // Create video speed controls and remove button wrapper
  const videoControlsWrapper = document.createElement('div');
  videoControlsWrapper.classList.add('video-controls');

  // Create video speed controls
  const videoSpeedWrapper = document.createElement('div');
  videoSpeedWrapper.classList.add('video-speed-wrapper');

  const videoSpeedLabel = document.createElement('label');
  videoSpeedLabel.textContent = 'Video Speed:';
  videoSpeedLabel.classList.add('video-speed-label');
  videoSpeedWrapper.appendChild(videoSpeedLabel);

  const videoSpeedSelect = document.createElement('select');
  videoSpeedSelect.classList.add('video-speed-select');
  videoSpeedSelect.innerHTML = `
    <option value="0.25">0.25x</option>
    <option value="0.5">0.5x</option>
    <option value="1" selected>1x</option>
    <option value="1.25">1.25x</option>
    <option value="1.5">1.5x</option>
    <option value="2">2x</option>
  `;
  videoSpeedSelect.value = speed;
  videoSpeedSelect.addEventListener('change', function () {
    setSpeed(videoWrapper, videoSpeedSelect.value);
  });
  videoSpeedWrapper.appendChild(videoSpeedSelect);

  // Append video speed controls to the video controls wrapper
  videoControlsWrapper.appendChild(videoSpeedWrapper);

  // Create remove button
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.classList.add('remove-btn');
  removeButton.addEventListener('click', function () {
    removeVideo(videoWrapper);
  });

  // Append remove button to the video controls wrapper
  videoControlsWrapper.appendChild(removeButton);

  // Append the video controls wrapper to the video wrapper
  videoWrapper.appendChild(videoControlsWrapper);

  // Append the video wrapper to the videos container
  videosContainer.appendChild(videoWrapper);

  // Initialize the YouTube iframe API for the video
  initializeYouTubeAPI(iframe, volume);
}

// Function to initialize the YouTube iframe API for a video
// Function to initialize the YouTube iframe API for a video
function initializeYouTubeAPI(iframe, volume) {
  const player = new YT.Player(iframe, {
    events: {
      'onReady': function (event) {
        event.target.setVolume(volume * 100); // Set volume (0-100)
        players.push(event.target); // Add player instance to the array
      },
      'onStateChange': function (event) {
        if (event.data === YT.PlayerState.ENDED) {
          event.target.stopVideo();
        }
      }
    }
  });

  // Pause/Play video when visibility of the page changes
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      players.forEach(player => {
        // Check if the player's state is "playing"
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
          player.playVideo(); // Resume playback if the player was playing
        }
      });
    } 
    else {
      players.forEach(player => {
        // Check if the player's state is "playing"
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
          player.playVideo(); // Resume playback if the player was playing
        }
      });
    }
  });

}
function getVideoIdFromUrl(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
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
  const speed = 1; // Default playback speed
  const videoId = getVideoId(videoUrl);

  // Add the new video player
  addVideoPlayer(videoId, volume, speed);
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
  // Regular expression to match various YouTube URL formats
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);

  if (match && match[1]) {
    return match[1]; // Return the video ID
  } else {
    alert('Invalid YouTube URL.');
    return null;
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

// Function to set speed for a video
function setSpeed(videoWrapper, speed) {
  const iframe = videoWrapper.querySelector('iframe');
  const videoId = iframe.src.split('/').pop().split('?')[0]; // Extract video ID from iframe src

  // Retrieve the YouTube player instance by video ID
  const player = players.find(player => player.getVideoData().video_id === videoId);

  // Set the playback rate using the YouTube API
  if (player) {
    player.setPlaybackRate(parseFloat(speed));
  }
}

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

// Add event listener for "Add Video" button
document.getElementById('add-video-btn').addEventListener('click', addVideo);

// Add event listener for "Paste" button
document.getElementById('paste-btn').addEventListener('click', pasteFromClipboard);