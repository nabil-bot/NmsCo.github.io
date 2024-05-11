let videoCount = 0;
let players = []; // Array to store YouTube player instances

// Function to add a new video player
function addVideoPlayer(url, volume, speed) {
  const videosContainer = document.getElementById('videos-container');
  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('video-wrapper');
  const iframe = document.createElement('iframe');
  iframe.width = '580';
  iframe.height = '320';
  const videoID = getVideoId(url)
  iframe.src = `https://www.youtube.com/embed/${videoID}?autoplay=1&enablejsapi=1&mute=0`;
  iframe.frameborder = '0';
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  // Append the iframe to the video wrapper
  videoWrapper.appendChild(iframe);
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

  videoControlsWrapper.appendChild(removeButton);
  videoWrapper.appendChild(videoControlsWrapper);
  videosContainer.appendChild(videoWrapper);

  if (list==true) {
    initializeYouTubeAPI(iframe, volume, playlistId=getPlaylistId(url));
  } else {
    initializeYouTubeAPI(iframe, volume);
  }
}

function initializeYouTubeAPI(iframe, volume, playlistId = "") {
  if (playlistId == ""){
    const player = new YT.Player(iframe, {
      events: {
        'onReady': function (event) {
          event.target.setVolume(volume * 100); // Set volume (0-100)
          players.push(event.target); // Add player instance to the array
        }
      }
      });
  } 
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


// Function to add a new video
function addVideo() {
  const videoUrlInput = document.getElementById('video-url');
  const videoUrl = videoUrlInput.value.trim();

  if (!videoUrl) {
    alert('Please enter a video URL.');
    return;
  }
  const volume = 1; // Default volume
  const speed = 1; // Default playback speed

  addVideoPlayer(videoUrl, volume, speed);
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
  // Check for video ID first
  var regex = /\/watch\?v=([^&]+)/;
  var match = url.match(regex);
  // Return the captured group (video ID) if found, otherwise null
  if (match && match[1]) {
    return match[1];
  } 
  // for live video ===============
  var regex = /\/live\/([^?]+)/;
  var match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  } 
}

function getPlaylistId(url) {
  const regex = /\?si=([^&]+)/;
  const match = regex.exec(url);
  if (match && match[1]) {
    return match[1];
  } 
  return null;
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
