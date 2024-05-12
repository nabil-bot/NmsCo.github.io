let videoCount = 0;
let players = [];
// let currentPlaylistIndex = 0;
// let playlistVideos = [];


function addVideoPlayer(videoId, volume, speed, isPlaylist = false, playlistVideos=[]) {
  let currentPlaylistIndex=0
  const videosContainer = document.getElementById('videos-container');
  const videoWrapper = document.createElement('div');
  videoWrapper.classList.add('video-wrapper');
  const iframe = document.createElement('iframe');
  iframe.width = '580';
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
  volumeSlider.value = volume;
  volumeSlider.classList.add('slider');
  volumeContainer.appendChild(volumeSlider);
  videoWrapper.appendChild(volumeContainer);
  volumeSlider.addEventListener('input', function () {
    setVolume(videoWrapper, volumeSlider.value);
  });


  speakerIcon.addEventListener('click', function() {
    if (volumeSlider.value > 0){
      setVolume(videoWrapper, 0);
    }else if (volumeSlider.value == 0) {
      setVolume(videoWrapper, 50);
    }
    
  });

  const videoControlsWrapper = document.createElement('div');
  videoControlsWrapper.classList.add('video-controls');
  const videoSpeedWrapper = document.createElement('div');
  videoSpeedWrapper.classList.add('video-speed-wrapper');
  const videoSpeedLabel = document.createElement('label');
  videoSpeedLabel.textContent = 'Speed:';
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
      playPreviousVideoFromPlaylist(videoWrapper);
    });
    videoControlsWrapper.appendChild(previousButton);

    const nextButton = document.createElement('button');
    nextButton.textContent = '⏭';
    nextButton.classList.add('next-btn');
    nextButton.addEventListener('click', function () {
      playNextVideoFromPlaylist(videoWrapper);
    });
    videoControlsWrapper.appendChild(nextButton);

    previousButton.style.height = '26px';
    nextButton.style.height = '26px';
    previousButton.style.fontSize = '15px';
    nextButton.style.fontSize = '16px';

    var label = document.createElement('label');
    label.textContent = `${currentPlaylistIndex+1}/${playlistVideos.length}`;
    label.style.fontSize = '14px';
    videoControlsWrapper.appendChild(label);
  }

  const removeButton = document.createElement('button');
  removeButton.textContent = '❌';
  removeButton.classList.add('remove-btn');
  removeButton.addEventListener('click', function () {
    removeVideo(videoWrapper);
  });
  videoControlsWrapper.appendChild(removeButton);
  videoWrapper.appendChild(videoControlsWrapper);
  videosContainer.appendChild(videoWrapper);


  function playNextVideoFromPlaylist(videoWrapper) {
    if (playlistVideos.length === 0) {
      return;
    }

    currentPlaylistIndex = (currentPlaylistIndex + 1) % playlistVideos.length;

    label.textContent = `${currentPlaylistIndex+1}/${playlistVideos.length}`;
    const nextVideoUrl = playlistVideos[currentPlaylistIndex];
    const videoId = getVideoId(nextVideoUrl);
    // const currentVideoWrapper = document.querySelector('.video-wrapper');
    // const iframe = currentVideoWrapper.querySelector('iframe');
    const iframe = videoWrapper.querySelector('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=0`;
    const slider = videoWrapper.querySelector('.slider');
    initializeYouTubeAPI(iframe, slider.value);
  }
  function playPreviousVideoFromPlaylist(videoWrapper) {
    if (playlistVideos.length === 0) {
      return;
    }
    currentPlaylistIndex = (currentPlaylistIndex - 1 + playlistVideos.length) % playlistVideos.length;
    label.textContent = `${currentPlaylistIndex+1}/${playlistVideos.length}`;
    const previousVideoUrl = playlistVideos[currentPlaylistIndex];
    const videoId = getVideoId(previousVideoUrl);
    const iframe = videoWrapper.querySelector('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=0`;
    const slider = videoWrapper.querySelector('.slider');
    initializeYouTubeAPI(iframe, slider.value);
  }

  
  function initializeYouTubeAPI(iframe, volume) {
    // delete YT
    const player = new YT.Player(iframe, {
      events: {
        'onReady': function (event) {
          event.target.setVolume(volume);
          // players.push(event.target);

          if (players.indexOf(event) === -1) {
            players.push(event.target);
          }
        },
        'onStateChange': function (event) {
          if (event.data === YT.PlayerState.ENDED) {
            playNextVideoFromPlaylist(videoWrapper)
          }

        }
      }
    });
  }

  initializeYouTubeAPI(iframe, volume);
}

// function initializeYouTubeAPI(iframe, volume) {
//   const player = new YT.Player(iframe, {
//     events: {
//       'onReady': function (event) {
//         event.target.setVolume(volume);
//         players.push(event.target);
//       },
//       'onStateChange': function (event) {
//         if (event.data === YT.PlayerState.ENDED) {
//           playNextVideoFromPlaylist()
//         }

//       }
//     }
//   });
// }

function addVideo() {
  const volume = 50;
  const speed = 1;
  const videoUrlInput = document.getElementById('video-url');
  let videoUrl = videoUrlInput.value.trim();
  if (!videoUrl) {
    navigator.clipboard.readText()
    .then(text => {
      document.getElementById('video-url').value = text.trim();
      let videoUrl = text.trim();
      return
    })
    .catch(err => {
      console.error('Failed to read clipboard contents: ', err);
      alert('Please enter a video URL.');
      return;
    });
    
  }
  if (videoUrl.includes("&list=")){
    getPlaylistVideos(videoUrl)
    .then(urls => {

      // if (videoCount == 0){
      const videoId = getVideoId(urls[0]);
      addVideoPlayer(videoId, volume, speed, isPlaylist=true, urls);
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
function getPlaylistVideos(playlistUrl) {
  return new Promise((resolve, reject) => {
    const playlistId = new URL(playlistUrl).searchParams.get('list');
    if (!playlistId) {
      reject('Invalid playlist URL. Please enter a valid URL with the "list" parameter.');
      return;
    }
    fetchVideosFromPlaylist(playlistId)
      .then(videoUrls => {
        resolve(videoUrls);
      })
      .catch(error => {
        reject(error);
      });
  });
}
async function fetchVideosFromPlaylist(playlistId) {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=AIzaSyDQkRgxuQ7i5-1UuYtuve8eZgAb1-XGe30`);
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


// Pause/Play video when visibility of the page changes
document.addEventListener('visibilitychange', function () {

  var checkbox = document.getElementById('myCheckbox');
  if (checkbox.checked) {
  if (document.visibilityState === 'visible') {
    players.forEach(player => {
      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.playVideo(); // Resume playback if the player was playing
      }
    });
  } 
  else {
    players.forEach(player => {
      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.playVideo(); // Resume playback if the player was playing
      }
    });
  }
} 
});
