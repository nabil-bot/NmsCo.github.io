let videoCount = 0;
let players = [];
const volume = 50;
const speed = 1;
// let currentPlaylistIndex = 0;
// let playlistVideos = [];


async function addVideoPlayer(videoUrl, volume, speed, isPlaylist = false, playlistVideos=[]) { //videoUrl could be playlist url
  if (isPlaylist){
    videoId = getVideoId(playlistVideos[0]);
  }else{
    videoId = getVideoId(videoUrl);
  }
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
    removeVideo(videoWrapper, videoUrl);
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
    const iframe = videoWrapper.querySelector('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&mute=0`;
    const slider = videoWrapper.querySelector('.slider');
    initializeYouTubeAPI(iframe, slider.value);
    // alert("after init app")
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
  function createPlayer() {
    const player = new YT.Player(iframe, {
      events: {
        'onReady': function (event) {
          try {
            event.target.setVolume(volume);

            if (players.indexOf(event.target) === -1) {
              players.push(event.target);
              // console.log('Player initialized and added to players array');
            } else {
              console.log('Player already exists in players array');
            }
          } catch (error) {
            console.error('Error during onReady event:', error);
          }
        },
        'onStateChange': function (event) {
          try {
            if (event.data === YT.PlayerState.ENDED) {
              playNextVideoFromPlaylist(videoWrapper);
              // console.log('Video ended, playing next video from playlist');
            }
          } catch (error) {
            console.error('Error during onStateChange event:', error);
          }
        }
      },
      playerVars: {
        // Add additional parameters if needed
      }
    });

    // Optional: Check if the player instance is created successfully
    if (!player) {
      console.error('Failed to create YouTube player instance');
    } else {
      console.log('YouTube player instance created successfully');
    }
  }

  function waitForYouTubeAPI() {
    if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
      // console.log('YouTube IFrame API is not yet loaded. Waiting...');
      setTimeout(waitForYouTubeAPI, 100); // Retry after 100 milliseconds
    } else {
      createPlayer();
    }
  }
  waitForYouTubeAPI();
} // initializeYouTubeAPI function ends here
  initializeYouTubeAPI(iframe, volume);
  

  try {
        var URLs = getCookie("URLs");
        if (URLs != null){
          if (!URLs.includes(videoUrl)){
            URLs.push(videoUrl)
            setCookie("URLs", URLs, 10);
          }
        } else{
          setCookie("URLs", [videoUrl], 10);
        }

    } catch (error) {
        // This block will be executed when an error occurs
        alert("An error occurred: " + error);
    }
} // finissing of the addVideoPlayer function


async function addVideo() {
  
  const videoUrlInput = document.getElementById('video-url');
  let videoUrl = videoUrlInput.value.trim();

  await filterLink(videoUrl)
  videoUrlInput.value = '';
}


function getPlaylistVideos(playlistUrl) {
  return new Promise((resolve, reject) => {
    const playlistId = new URL(playlistUrl).searchParams.get('list');
    if (!playlistId) {
      reject('Invalid playlist URL. Please enter a valid URL with the "list" parameter.');
      return;}
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
function removeVideo(videoWrapper, videoUrl) {
  const iframe = videoWrapper.querySelector('iframe');
  const videoId = iframe.src.split('/').pop().split('?')[0];
  players = players.filter(player => player.getVideoData().video_id !== videoId);
  videoWrapper.remove();
  try {
      var URLs = getCookie("URLs");
      if (URLs !== null) {
        if (URLs.includes(videoUrl)) {
          const indexOfVideoUrl = URLs.indexOf(videoUrl);  // Store index for clarity
          URLs.splice(indexOfVideoUrl, 1); // Remove the element at the found index
          setCookie("URLs", URLs, 10); // Assuming setCookie takes value, expiry, path
        } else {
          alert(videoUrl + " is not found in URLs");
        }
      }
  } catch (error) {
      // This block will be executed when an error occurs
      alert("An error occurred: " + error);
  }
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

// Check if cookies are enabled
function areCookiesEnabled() {
  var cookieEnabled = navigator.cookieEnabled;
  if (!cookieEnabled) {
      document.cookie = "testcookie";
      cookieEnabled = document.cookie.indexOf("testcookie") !== -1;
  }
  return cookieEnabled;
}

// Function to set a cookie
function setCookie(name, value, daysToExpire) {
  var expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysToExpire);
  var cookieValue = encodeURIComponent(name) + "=" + encodeURIComponent(JSON.stringify(value)) + "; expires=" + expirationDate.toUTCString() + "; path=/";
  document.cookie = cookieValue;
}

// Function to get a cookie by name
function getCookie(name) {
  var cookieName = encodeURIComponent(name) + "=";
  var cookieArray = document.cookie.split(';');
  for (var i = 0; i < cookieArray.length; i++) {
      var cookie = cookieArray[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
          var cookieValue = cookie.substring(cookieName.length, cookie.length);
          try {
              // Try parsing the cookie value as JSON
              var parsedValue = JSON.parse(decodeURIComponent(cookieValue));
              // Check if the parsed value is an array
              if (Array.isArray(parsedValue)) {
                  return parsedValue; // Return the parsed array
              } else {
                  return [parsedValue]; // Return a new array with the parsed value as its only element
              }
          } catch (error) {
              // If parsing fails, return the cookie value as is
              return decodeURIComponent(cookieValue);
          }
      }
  }
  return null;
}



document.getElementById("global-play-pause").addEventListener("click", function() {
  var icon = document.getElementById("play-pause-icon");
  if (icon.classList.contains("fa-play")) {
    // Play functionality
    players.forEach(player => {player.playVideo();});
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  } else {
    // Pause functionality
    players.forEach(player => {player.pauseVideo();});
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
  }
});



async function filterLink(videoUrl) {
  return new Promise((resolve, reject) => {
    if (videoUrl.includes("&list=")) {
      getPlaylistVideos(videoUrl)
      .then(urls => {
        addVideoPlayer(videoUrl, volume, speed, true, urls); // No need to pass isPlaylist=true
        resolve(); // Resolve the promise when processing is finished
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while retrieving video URLs. Please check your playlist URL or network connection.');
        reject(error); // Reject the promise if an error occurs
      });
    } else {
      addVideoPlayer(videoUrl, volume, speed);
      resolve(); // Resolve the promise when processing is finished
    }
  });
}


async function initFunc() {
  var URLs = getCookie("URLs");
  if (URLs != null) {
    for (const URL of URLs) {
      try {
        await filterLink(URL); // Await the completion of filterLink before moving to the next iteration
        setTimeout(() => {
          console.log("Waited 4 seconds!");
        }, 2000);
      } catch (error) {
        console.error('Error processing URL:', error);
      }
    }
  }
}


initFunc()


const fileInput = document.getElementById('file-input');

// function addAudioPlayer(url){
//   const audioPlayer = document.createElement('audio');
//   const videosContainer = document.getElementById('videos-container');
//   const videoWrapper = document.createElement('div');
//   videoWrapper.classList.add('video-wrapper');
//   // audioPlayer.style.display = 'block';
//   audioPlayer.src = url;
//   // audioPlayer.setAttribute('controls', '');
//   audioPlayer.play();
//   videoWrapper.appendChild(audioPlayer)

//   const volumeContainer = document.createElement('div');
//   volumeContainer.classList.add('volume-container');
//   const speakerIcon = document.createElement('i');
//   speakerIcon.classList.add('fas', 'fa-volume-up', 'volume-icon');
//   volumeContainer.appendChild(speakerIcon);
//   const volumeSlider = document.createElement('input');
//   volumeSlider.type = 'range';
//   volumeSlider.min = 0;
//   volumeSlider.max = 1;
//   volumeSlider.value = 0.8;
//   volumeSlider.step = 0.01
//   volumeSlider.classList.add('slider');
//   volumeContainer.appendChild(volumeSlider);
//   videoWrapper.appendChild(volumeContainer);
//   volumeSlider.addEventListener('input', function () {
//     audioPlayer.volume = volumeSlider.value;
//   });
//   const videoControlsWrapper = document.createElement('div');
//   videoControlsWrapper.classList.add('video-controls');
//   const removeButton = document.createElement('button');
//   removeButton.textContent = '❌';
//   removeButton.classList.add('remove-btn');
//   removeButton.addEventListener('click', function () {
//     videoWrapper.remove();
//     fileInput.value = '';
//   });
//   videoControlsWrapper.appendChild(volumeContainer)
//   videoControlsWrapper.appendChild(removeButton);
//   videoWrapper.appendChild(videoControlsWrapper)
//   videosContainer.appendChild(videoWrapper)
// }
function addAudioPlayer(url) {
  const audioPlayer = document.createElement('audio');
  audioPlayer.src = url;
  audioPlayer.controls = false; // Disable default controls

  // Create custom controls
  const playPauseBtn = document.createElement('button');
  playPauseBtn.textContent = '⏵';
  let isPlaying = false;
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      audioPlayer.pause();
      playPauseBtn.textContent = '⏵';
    } else {
      audioPlayer.play();
      playPauseBtn.textContent = '⏸';
    }
    isPlaying = !isPlaying;
  });

  const timelineSlider = document.createElement('input');
  timelineSlider.type = 'range';
  timelineSlider.min = '0';
  timelineSlider.value = '0';
  timelineSlider.step = '1';

  timelineSlider.addEventListener('input', () => {
    audioPlayer.currentTime = timelineSlider.value;
  });

  const forwardButton = document.createElement('button');
  forwardButton.textContent = '+10s';
  forwardButton.addEventListener('click', () => {
    audioPlayer.currentTime += 10;
  });

  const backwardButton = document.createElement('button');
  backwardButton.textContent = '-10s';
  backwardButton.addEventListener('click', () => {
    audioPlayer.currentTime -= 10;
  });

  const speedSelect = document.createElement('select');
  [0.5, 1, 1.5, 2].forEach(speed => {
    const option = document.createElement('option');
    option.value = speed;
    option.textContent = `${speed}x`;
    speedSelect.appendChild(option);
  });
  speedSelect.addEventListener('change', () => {
    audioPlayer.playbackRate = speedSelect.value;
  });

  const volumeContainer = document.createElement('div');
  volumeContainer.classList.add('volume-container');
  const speakerIcon = document.createElement('i');
  speakerIcon.classList.add('fas', 'fa-volume-up', 'volume-icon');
  volumeContainer.appendChild(speakerIcon);
  const volumeSlider = document.createElement('input');
  volumeSlider.type = 'range';
  volumeSlider.min = 0;
  volumeSlider.max = 1;
  volumeSlider.value = 0.8;
  volumeSlider.step = 0.01;
  volumeSlider.classList.add('slider');
  volumeContainer.appendChild(volumeSlider);
  volumeSlider.addEventListener('input', () => {
    audioPlayer.volume = volumeSlider.value;
  });

  const currentTimeLabel = document.createElement('span');

  const durationLabel = document.createElement('span');
  durationLabel.textContent = '/ 00:00'; // Initialize duration label

  const fileNameLabel = document.createElement('span');
  fileNameLabel.textContent = 'File: ' + url.split('/').pop(); // Extract filename from URL

  // Helper function to format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Update current time label, timeline slider, and duration label
  audioPlayer.addEventListener('timeupdate', () => {
    currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
    timelineSlider.value = audioPlayer.currentTime; // Update slider value with current time
    timelineSlider.max = audioPlayer.duration; // Update slider max value with audio duration
    durationLabel.textContent = `/ ${formatTime(audioPlayer.duration)}`;
  });

  const audioControls = document.createElement('div');
  audioControls.classList.add('audio-controls');
  audioControls.appendChild(playPauseBtn);
  audioControls.appendChild(timelineSlider);
  audioControls.appendChild(backwardButton);
  audioControls.appendChild(forwardButton);
  audioControls.appendChild(speedSelect);
  audioControls.appendChild(volumeContainer);
  audioControls.appendChild(currentTimeLabel);
  audioControls.appendChild(durationLabel);
  audioControls.appendChild(fileNameLabel);

  const audioContainer = document.createElement('div');
  audioContainer.classList.add('audio-container');
  audioContainer.appendChild(audioPlayer);
  audioContainer.appendChild(audioControls);

  const videosContainer = document.getElementById('videos-container');
  videosContainer.appendChild(audioContainer);
}





fileInput.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith('audio/')) {
          addAudioPlayer(url)
      }
  }
});


const volumeSlider = document.getElementById('volumeSlider');

        // Set the initial volume to match the slider
        audioPlayer.volume = volumeSlider.value;

        // Update the audio volume when the slider value changes
        volumeSlider.addEventListener('input', (event) => {
            audioPlayer.volume = event.target.value;
        });