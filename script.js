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
  
    // Set the volume
    iframe.volume = volume;
  
    // Append the iframe to the video wrapper
    videoWrapper.appendChild(iframe);
  
    // Append the video wrapper to the videos container
    videosContainer.appendChild(videoWrapper);
  }
  
  // Function to add a new video
  function addVideo(videoNumber) {
    const videoUrlInput = document.getElementById(`video-url${videoNumber}`);
    const volumeSlider = document.getElementById(`volume${videoNumber}`);
  
    const videoUrl = videoUrlInput.value.trim();
    const volume = volumeSlider.value / 100;
  
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
  
    videoFrames[videoNumber - 1].volume = volumeSlider.value / 100;
  }
  