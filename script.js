let videoCount = 0;
let players = [];
const volume = 50;
const speed = 1;

async function addVideoPlayer(videoUrl, volume, speed, isPlaylist = false, playlistVideos=[], timeFrame=0, currentPlaylistIndex=0, customPlaylist = false) { //videoUrl could be playlist url
  if (isPlaylist){
    videoId = getVideoId(playlistVideos[currentPlaylistIndex]);
  }else{
    videoId = getVideoId(videoUrl);
  }

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

    var urlDic = getCookie("urlDic");
    if (urlDic !== null) {
      if (videoUrl in urlDic){
        urlDic[videoUrl]["volume"] = volumeSlider.value;
        setCookie("urlDic", urlDic, 10);
      } 
    }
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
    <option value="0.75">0.75x</option>
    <option value="1" selected>1x</option>
    <option value="1.1">1.1x</option>
    <option value="1.15">1.15x</option>
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
    

  
  function initializeYouTubeAPI(iframe, volume, timeFrame) {
    function createPlayer() {
      const player = new YT.Player(iframe, {
        events: {
          'onReady': function (event) {
            try {
              event.target.setVolume(volume);
              event.target.seekTo(timeFrame);
              if (players.indexOf(event.target) === -1) {
                players.push(event.target);
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
              } else if (event.data === YT.PlayerState.PAUSED){

                  var urlDic = getCookie("urlDic");
                  if (urlDic != null){
                    if (videoUrl in urlDic)

                      var floatNumber = player.getCurrentTime();
                      var intNumber = Math.floor(floatNumber);   
                      urlDic[videoUrl]["timeFrame"]=  intNumber;
                      setCookie("urlDic", urlDic, 10);
                      console.log(urlDic[videoUrl]["timeFrame"])
                  }
              }
            } catch (error) {
              console.error('Error during onStateChange event:', error);
            }
          }
        },
        'onPlaybackQualityChange': function (event) {
          // This function will be called when playback quality changes
          // alert(player.getPlaybackQuality());
          console.log(event.target.getPlaybackQuality());
        }
        ,
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
    

    if (customPlaylist){
      deleteCookie("customListDic")
      return
    }

    var urlDic = getCookie("urlDic");
    if (urlDic != null){
        if (videoUrl in urlDic){
          delete urlDic[videoUrl]
          if (Object.keys(urlDic).length == 0){
              deleteCookie("urlDic");
          }else{
              setCookie("urlDic", urlDic, 10);
          }
        }} 
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

    if (customPlaylist){
      let newDic = getCookie("customListDic")
      newDic["currentIndex"]=currentPlaylistIndex
      setCookie("customListDic",newDic , 10);
    }
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
    // if (players.indexOf(event.target) === -1) 
    if (customPlaylist){
      let newDic = getCookie("customListDic")
      newDic["currentIndex"]=currentPlaylistIndex
      setCookie("customListDic",newDic , 10);
    }
  }

  initializeYouTubeAPI(iframe, volume, timeFrame);

  if (customPlaylist)
    {
      return
    }
  
  try {
        var urlDic = getCookie("urlDic");
        if (urlDic != null){
          if (!(videoUrl in urlDic)){
            var urlProperties = {}
            urlProperties["timeFrame"] = timeFrame
            urlProperties["volume"] = volume
            urlDic[videoUrl] = urlProperties
            setCookie("urlDic", urlDic, 10);
          }
        } else{
          var urlDic = {};
          var urlProperties = {};
          urlProperties["volume"] = 1
          urlProperties["timeFrame"] = 0
          urlDic[videoUrl] = urlProperties
          setCookie("urlDic", urlDic, 10);
          urlDic = getCookie("urlDic");
        }
    } catch (error) {
        alert("An error occurred: " + error);
    }
}
async function addVideo() {
  const videoUrlInput = document.getElementById('video-url');
  let videoUrl = videoUrlInput.value.trim();
  await filterLink(videoUrl, 60,0)
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
  
}
function getVideoId(url) {
  var regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/;
  
  var match = url.match(regExp);

  if (match && match[1]) {
    return match[1];
  } else {
    regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    match = url.match(regExp);
    if (match && match[1]) {
      return match[1];
    } else {
      alert("Invalid url")
      return null;
    }
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
function setCookie(name, value, daysToExpire) {
  var expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysToExpire);
  var cookieValue = encodeURIComponent(name) + "=" + encodeURIComponent(JSON.stringify(value)) + "; expires=" + expirationDate.toUTCString() + "; path=/";
  document.cookie = cookieValue;
}
function getCookie(name) {
  var cookieName = encodeURIComponent(name) + "=";
  var cookieArray = document.cookie.split(';');
  for (var i = 0; i < cookieArray.length; i++) {
    var cookie = cookieArray[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      var cookieValue = cookie.substring(cookieName.length, cookie.length);
      try {
        return JSON.parse(decodeURIComponent(cookieValue));
      } catch (error) {
        // If parsing fails, return null since we expect a dictionary
        return null;
      }
    }
  }
  return null;
}
document.getElementById("global-play-pause").addEventListener("click", function() {
  var icon = document.getElementById("play-pause-icon");
  if (icon.classList.contains("fa-play")) {
    players.forEach(player => {player.playVideo();});
    icon.classList.remove("fa-play");
    icon.classList.add("fa-pause");
  } else {
    players.forEach(player => {player.pauseVideo();});
    icon.classList.remove("fa-pause");
    icon.classList.add("fa-play");
  }
});



const fileInput = document.getElementById('file-input');
async function addAudioPlayer(url, name, timeFrame=0, volume=0.8) {
  return new Promise((resolve, reject) => {
  const videosContainer = document.getElementById('videos-container');
  const audioContainer = document.createElement('div');
  audioContainer.classList.add('audio-container');
  const audioPlayer = document.createElement('audio');
  audioPlayer.src = url;
  audioPlayer.controls = false;
  const playPauseBtn = document.createElement('button');
  playPauseBtn.classList.add('audio-play-pause');
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  function handlePlay(){
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  }
  function handlePause(){
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
  function playPauseAudioPlayer(){
    if (!audioPlayer.paused){
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  }
  
  playPauseBtn.addEventListener('click', function(){
    playPauseAudioPlayer()
  }

  );

  const sliderContainer = document.createElement('div');
  sliderContainer.classList.add('slider-container');

  const timelineSlider = document.createElement('input');
  timelineSlider.classList.add('timeline-slider');
  timelineSlider.type = 'range';
  timelineSlider.min = '0';
  timelineSlider.value = '0';
  timelineSlider.step = '1';


  const forwardButton = document.createElement('button');
  forwardButton.textContent = '+10s';
  forwardButton.addEventListener('click', () => {
    audioPlayer.currentTime += 10;
  });

  const forward30Sec = document.createElement('button');
  forward30Sec.textContent = '+30s';
  forward30Sec.addEventListener('click', () => {
    audioPlayer.currentTime += 30;
  });

  const backward30Sec = document.createElement('button');
  backward30Sec.textContent = '-30s';
  backward30Sec.addEventListener('click', () => {
    audioPlayer.currentTime -= 30;
  });

  const backwardButton = document.createElement('button');
  backwardButton.textContent = '-10s';
  backwardButton.addEventListener('click', () => {
    audioPlayer.currentTime -= 10;
  });

  const speedSelect = document.createElement('select');
  [0.5, 0.75, 1, 1.15,1.25, 1.5, 1.75, 2].forEach(speed => {
    const option = document.createElement('option');
    option.value = speed;
    option.textContent = `${speed}x`;
    speedSelect.appendChild(option);
  });
  speedSelect.value = 1
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
  volumeSlider.step = 0.01;
  volumeSlider.value = volume;
  volumeSlider.classList.add('slider');
  volumeContainer.appendChild(volumeSlider);

  volumeSlider.addEventListener('input', () => {
    audioPlayer.volume = volumeSlider.value;
    var fileDic = getCookie("fileDic");
    if (fileDic !== null) {
      if (url in fileDic){
        let floatValue = parseFloat(volumeSlider.value); // Convert the value to a float
        let formattedValue = floatValue.toFixed(1); 
        fileDic[url]["volume"] = formattedValue;
        setCookie("fileDic", fileDic, 10);
      } 
    }
  });

  const currentTimeLabel = document.createElement('span');

  const durationLabel = document.createElement('span');
  durationLabel.textContent = '0:0'; // Initialize duration label

  
  // Helper function to format time in MM:SS format
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const formattedHours = hours > 0 ? `${hours < 10 ? '0' : ''}${hours}:` : '';
    const formattedMinutes = `${minutes < 10 ? '0' : ''}${minutes}`;
    const formattedSeconds = `${seconds < 10 ? '0' : ''}${seconds}`;

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
};
  audioPlayer.addEventListener('timeupdate', () => {
    currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
    timelineSlider.value = audioPlayer.currentTime; 
    timelineSlider.max = audioPlayer.duration;
    durationLabel.textContent = `${formatTime(audioPlayer.duration)}`;
    var fileDic = getCookie("fileDic");
    if (fileDic !== null) {
      if (url in fileDic){
        fileDic[url]["timeFrame"] = audioPlayer.currentTime;
        setCookie("fileDic", fileDic, 10);
      } 
    }
  }
);

  audioPlayer.addEventListener('loadedmetadata', () => {

  var fileDic = getCookie("fileDic");
  if (fileDic !== null && fileDic[url] !== undefined) {
      audioPlayer.currentTime = fileDic[url]["timeFrame"];
      audioPlayer.volume = fileDic[url]["volume"];
    }
  });
  audioPlayer.addEventListener('ended', () => {

    alert("audio stoped")
  });

  audioPlayer.addEventListener('error', (e) => {
    console.error('Failed to load audio:', e.message);
});
  timelineSlider.addEventListener('input', () => {
    audioPlayer.currentTime = timelineSlider.value;
  });
  audioPlayer.addEventListener('play', handlePlay);
  audioPlayer.addEventListener('pause', handlePause);
  const volumeControlerContainer = document.createElement('div');
  volumeControlerContainer.classList.add('volumeControlerContainer');
  const otherAudioControllersContainer = document.createElement('div');
  otherAudioControllersContainer.classList.add('otherAudioControllersContainer');
  sliderContainer.appendChild(timelineSlider);
  audioContainer.appendChild(sliderContainer);
  const audioControls = document.createElement('div');
  audioControls.classList.add('audio-controls');
  const timeLabelContainer = document.createElement('div');
  timeLabelContainer.classList.add('timelabelContainer');
  timeLabelContainer.appendChild(currentTimeLabel);
  timeLabelContainer.appendChild(durationLabel);
  sliderContainer.appendChild(timeLabelContainer)
  otherAudioControllersContainer.appendChild(playPauseBtn);
  otherAudioControllersContainer.appendChild(backwardButton);
  otherAudioControllersContainer.appendChild(forwardButton);
  otherAudioControllersContainer.appendChild(forward30Sec);
  otherAudioControllersContainer.appendChild(speedSelect);
  volumeControlerContainer.appendChild(volumeContainer);
  audioControls.appendChild(otherAudioControllersContainer);
  audioControls.appendChild(volumeControlerContainer);
  const audioFileLabel = document.createElement('label');
  audioFileLabel.textContent = name;
  audioFileLabel.classList.add('AudioFileName');
  const removeButton = document.createElement('button');
  removeButton.textContent = '❌';
  removeButton.classList.add('remove-btn');
  removeButton.addEventListener('click', function () {
    audioContainer.remove();
    fileInput.value = '';

    try {
      var fileDic = getCookie("fileDic");
      if (fileDic !== null) {
        if (url in fileDic) {
          delete fileDic[url]

          if (Object.keys(fileDic).length == 0){
            deleteCookie("fileDic");
          }else{
            setCookie("fileDic", fileDic, 10);
          }
        }
      }
  } catch (error) {
      alert("An error occurred: " + error);
  }
  });
  const removeContainer = document.createElement('div');
  removeContainer.classList.add('remove-container');
  removeContainer.appendChild(audioFileLabel)
  
  removeContainer.appendChild(removeButton)

  audioContainer.appendChild(audioPlayer);
  audioContainer.appendChild(audioControls);
  audioContainer.appendChild(removeContainer);
  videosContainer.appendChild(audioContainer);


  try {
    var fileDic = getCookie("fileDic");
    if (fileDic !== null) {
      if (!(url in fileDic)) {  
      var urlProperties = {}
      urlProperties["name"] = name
      urlProperties["timeFrame"] = timeFrame
      urlProperties["volume"] = volume
      fileDic[url] = urlProperties
      setCookie("fileDic", keepLastFiveElements(fileDic), 10);
      }
    } else{
      var fileDic = {};
      var urlProperties = {};
      urlProperties["name"] = name
      urlProperties["timeFrame"] = timeFrame
      urlProperties["volume"] = volume
      fileDic[url] = urlProperties
      setCookie("fileDic", fileDic, 10);
    }

  } catch (error) {
    alert("An error occurred: " + error);
  }
  resolve();
})
}


async function filterLink(videoUrl, volume, timeFrame) {
  return new Promise((resolve, reject) => {
    if (videoUrl.includes("&list=")) {
      getPlaylistVideos(videoUrl)
      .then(urls => {
        addVideoPlayer(videoUrl, volume, speed, true, urls, timeFrame); // No need to pass isPlaylist=true
        resolve();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while retrieving video URLs. Please check your playlist URL or network connection.');
        reject(error);
      });
    }else if (videoUrl.includes(",")){
      let splitedUrls = videoUrl.split(", ")
      addVideoPlayer(splitedUrls[0], volume, speed, true, splitedUrls, timeFrame,0, true); // No need to pass isPlaylist=true
      
      let customListDic = {}
      customListDic["urls"] = splitedUrls
      customListDic["currentIndex"] = 0
      customListDic["volume"] = 100


      setCookie("customListDic", customListDic, 10);
      

      resolve();
    }
    else {
      addVideoPlayer(videoUrl, volume, speed,false, [], timeFrame);
      resolve(); 
    }
  });
}
function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
fileInput.addEventListener('change', function(event) {
  const file = event.target.files[0];

  if (file) {
    const url = URL.createObjectURL(file);
    const name = file.name
      if (file.type.startsWith('audio/')) {
          

        let timeFrame = 0
        let volume = 0
        
        var fileDic = getCookie("fileDic");
        if (fileDic != null) {
          for (let savedUrl in fileDic){
            if (savedUrl == url || name == fileDic[savedUrl]["name"])
              timeFrame = fileDic[savedUrl]["timeFrame"];
              volume = fileDic[savedUrl]["volume"];
            // addAudioPlayer(url, fileDic[url]["name"], fileDic[url]["timeFrame"], fileDic[url]["volume"]);
          }
        }
        addAudioPlayer(url, name, timeFrame, volume);
      }
  }
});


function keepLastFiveElements(obj) {
  let entries = Object.entries(obj);
  if (entries.length > 5) {
      entries = entries.slice(-5);
  }
  return Object.fromEntries(entries);
}

async function initFunc() {
  try{
  var urlDic = getCookie("urlDic");
    if (urlDic !== null) {
      for (let url in urlDic) {
        try {
          await filterLink(url, urlDic[url]["volume"], urlDic[url]["timeFrame"]); 
        } catch (error) {
          console.log(error);
        }
      }
    };
    // var fileDic = getCookie("fileDic");
    // if (fileDic != null) {
    //   for (let url in fileDic){
    //     await addAudioPlayer(url, fileDic[url]["name"], fileDic[url]["timeFrame"], fileDic[url]["volume"]);

    //   }
    // }

    var customListDic = getCookie("customListDic");
    if (customListDic !== null) {
      addVideoPlayer(customListDic["urls"][customListDic["currentIndex"]], volume, speed, true, customListDic["urls"], 0, customListDic["currentIndex"], customPlaylist=true); // No need to pass isPlaylist=true
      
      // let customListDic = {}
      // customListDic["urls"] = splitedUrls
      // customListDic["currentIndex"] = 0
      // customListDic["volume"] = 100
      
    };
  }catch (error) {
    console.error('An error occurred during initialization:', error);
  }
}
initFunc().then(() => {
  console.log('Initialization completed.');
}).catch(error => {
  console.error('Initialization failed:', error);
});





  const Clipcheckbox = document.getElementById('trackCheckbox');
  const clipboardTextField = document.getElementById('clipboardTextField');
  let previousClipboard = '';

  Clipcheckbox.addEventListener('change', function() {
    if (this.checked) {
      // Clear clipboard and start tracking
     
alert("tracking");
 navigator.clipboard.writeText('').then(() => {
        previousClipboard = '';
        trackClipboard();
      });
    } else {
      // Stop tracking
      previousClipboard = '';
    }
  });

  function trackClipboard() {
    navigator.clipboard.readText().then(clipboard => {
      if (clipboard !== previousClipboard) {
        if (previousClipboard !== '') {
          // Add comma and space if previous clipboard is not empty
          clipboardTextField.value += ', ';
        }
        clipboardTextField.value += clipboard;
        previousClipboard = clipboard;
      }
      // Continue tracking
      setTimeout(trackClipboard, 1000);
    });
  }
