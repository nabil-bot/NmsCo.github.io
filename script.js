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
          event.target.setVolume(volume); // Set volume (0-100)
        }
      }
    });
  }
  
  // Function to add a new video
  function addVideo(videoNumber) {
    const videoUrlInput = document.getElementById(`video-url${videoNumber}`);
    const volumeSlider = document.getElementById(`volume${videoNumber}`);
  
    const videoUrl = videoUrlInput.value.trim();
    const volume = volumeSlider.value; // Volume should be in the range of 0 to 100
  
    // Check if the input is empty
    if (videoUrl === '') {
      alert('Please enter a video URL.');
      return;
    }
  
    // Add the new video player
    addVideoPlayer(getVideoId(videoUrl), volume);
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
  function setVolume(videoNumber) {
    const volumeSlider = document.getElementById(`volume${videoNumber}`);
    const videoFrames = document.querySelectorAll('iframe');
  
    // Retrieve the YouTube player instance
    const player = videoFrames[videoNumber - 1].contentWindow;
  
    // Set the volume using the YouTube API
    player.postMessage(JSON.stringify({
      'event': 'command',
      'func': 'setVolume',
      'args': [volumeSlider.value]
    }), '*');
  }
  