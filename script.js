let videoCount = 0;
let players = [];
let currentPlaylistIndex = 0;
let playlistVideos = [];

function addVideoPlayer(videoId, volume, speed, isPlaylist = false) {
  const videosContainer = document.getElementById('videos-container');
  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('video-wrapper');
  const iframe = document.createElement('iframe');
  iframe.width = '560';
  iframe.height = '315';
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=0`;
  iframe.frameborder = '0';
  iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  videoWrapper.appendChild(iframe);
  const volumeContainer = document.createElement('div');
  volumeContainer.classList.add('volume-container');
  const speakerIcon = document.createElement('i');
  speakerIcon.classList.add('fas', 'fa-volume-up', 'volume-icon');
  volumeContainer.appendChild(speakerIcon);
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = 0;
  volumeSlider.max = 100;
  volumeSlider.value = volume * 100;
  volumeSlider.classList.add('slider');
  volumeContainer.appendChild(volumeSlider);
  videoWrapper.appendChild(volumeContainer);
  volumeSlider.addEventListener('input', function () {
    setVolume(videoWrapper, volumeSlider.value);
  });
  const videoControlsWrapper = document.createElement('div');
  videoControlsWrapper.classList.add('video-controls');
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
  videoControlsWrapper.appendChild(videoSpeedWrapper);
  
  if (isPlaylist) {
    const previousButton = document.createElement('button');
    previousButton.textContent = '⏮';
    previousButton.classList.add('previous-btn');
    previousButton.addEventListener('click', function () {
      playPreviousVideoFromPlaylist();
    });
    videoControlsWrapper.appendChild(previousButton);

    const nextButton = document.createElement('button');
    nextButton.textContent = '⏭';
    nextButton.classList.add('next-btn');
    nextButton.addEventListener('click', function () {
      playNextVideoFromPlaylist();
    });
    videoControlsWrapper.appendChild(nextButton);
  }
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.classList.add('remove-btn');
  removeButton.addEventListener('click', function () {
    removeVideo(videoWrapper);
  });
  videoControlsWrapper.appendChild(removeButton);
  videoWrapper.appendChild(videoControlsWrapper);
  videosContainer.appendChild(videoWrapper);
  initializeYouTubeAPI(iframe, volume);
}

function initializeYouTubeAPI(iframe, volume) {
  const player = new YT.Player(iframe, {
    events: {
      'onReady': function (event) {
        event.target.setVolume(volume * 100);
        players.push(event.target);
      },
      'onStateChange': function (event) {
        if (event.data === YT.PlayerState.ENDED) {
          event.target.stopVideo();
          playNextVideoFromPlaylist();
        }
      }
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      players.forEach(player => {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
          player.playVideo();
        }
      });
    } else {
      players.forEach(player => {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
          player.playVideo();
        }
      });
    }
  });
}

function addVideo() {
  const volume = 0.7;
  const speed = 1;
  
  const videoUrlInput = document.getElementById('video-url');
  const videoUrl = videoUrlInput.value.trim();
  if (!videoUrl) {
    alert('Please enter a video URL.');
    return;
  }
  
  if (videoUrl.includes("&list=")){
    getPlaylistVideos(videoUrl)
    .then(urls => {
      playlistVideos = urls;
      alert(playlistVideos)
      playNextVideoFromPlaylist();
    })
    .catch(error => {
      // Handle errors here
      console.error('Error:', error);
      alert('An error occurred while retrieving video URLs. Please check your playlist URL or network connection.');
    });

  }else{
  const videoId = getVideoId(videoUrl);
  addVideoPlayer(videoId, volume, speed);
  }
  videoUrlInput.value = '';
}

async function getPlaylistVideos(playlistUrl) {
  const playlistId = new URL(playlistUrl).searchParams.get('list');
  if (!playlistId) {
    alert('Invalid playlist URL. Please enter a valid URL with the "list" parameter.');
    return;
  }
  try {
    const videoUrls = await fetchVideosFromPlaylist(playlistId);
    document.getElementById('videoUrls').value = videoUrls.join('\n');
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while retrieving video URLs. Please check your playlist URL or network connection.');
  }
}

async function fetchVideosFromPlaylist(playlistId) {
  const apiKey = 'AIzaSyDQkRgxuQ7i5-1UuYtuve8eZgAb1-XGe30';
  const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`);
  const data = await response.json();
  const videoUrls = [];
  for (const item of data.items) {
    if (item.kind === 'youtube#playlistItem') {
      const videoId = item.snippet.resourceId.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      videoUrls.push(videoUrl);
    }
  }
  return videoUrls;
}

function playNextVideoFromPlaylist() {
  if (playlistVideos.length === 0) {
    return;
  }
  currentPlaylistIndex = (currentPlaylistIndex + 1) % playlistVideos.length;
  const nextVideoUrl = playlistVideos[currentPlaylistIndex];
  const videoId = getVideoId(nextVideoUrl);
  const iframe = document.querySelector('.video-wrapper iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=0`;
}
function playPreviousVideoFromPlaylist() {
  if (playlistVideos.length === 0) {
    return;
  }
  currentPlaylistIndex = (currentPlaylistIndex - 1 + playlistVideos.length) % playlistVideos.length;
  const previousVideoUrl = playlistVideos[currentPlaylistIndex];
  const videoId = getVideoId(previousVideoUrl);
  const iframe = document.querySelector('.video-wrapper iframe');
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=0`;
}


function removeVideo(videoWrapper) {
  const iframe = videoWrapper.querySelector('iframe');
  const videoId = iframe.src.split('/').pop().split('?')[0];
  players = players.filter(player => player.getVideoData().video_id !== videoId);
  videoWrapper.remove();
}
function getVideoId(url) {
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);

  if (match && match[1]) {
    return match[1];
  } else {
    alert('Invalid YouTube URL.');
    return null;
  }
}
function setVolume(videoWrapper, volume) {
  const iframe = videoWrapper.querySelector('iframe');
  const videoId = iframe.src.split('/').pop().split('?')[0];
  const player = players.find(player => player.getVideoData().video_id === videoId);
  if (player) {
    player.setVolume(volume);
  }
}
function setSpeed(videoWrapper, speed) {
  const iframe = videoWrapper.querySelector('iframe');
  const videoId = iframe.src.split('/').pop().split('?')[0];
  const player = players.find(player => player.getVideoData().video_id === videoId);
  if (player) {
    player.setPlaybackRate(parseFloat(speed));
  }
}
function pasteFromClipboard() {
  navigator.clipboard.readText()
    .then(text => {
      document.getElementById('video-url').value = text.trim();
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
}
document.getElementById('add-video-btn').addEventListener('click', addVideo);
document.getElementById('paste-btn').addEventListener('click', pasteFromClipboard);
