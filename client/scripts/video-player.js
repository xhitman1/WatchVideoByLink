import * as basic from "../scripts/basics.js";
import * as videoButton from "../scripts/video-payer-buttons.js";
import * as trimVideo from "../scripts/download-trimed-video.js";
import * as downloadVideo from "../scripts/download-video.js";
import * as downloadStream from "../scripts/download-stream.js";

// assign video src and type to video id
export async function showVideo(videoSrc, videoType, videoLinkFromUrl) {
  // fetch video settings
  const videoPlayerSettings = await getVideoPlayerSettings(); 
  // update info
  document.title = "Watching Video By Provided Link - WatchVideoByLink"; 
  document.body.classList = "watching-video-body";
  basic.websiteContentContainer().classList = "watching-video-websiteContentContainer";
  // create video player
  const videoPlayer = basic.createElement(basic.websiteContentContainer(), "video-js", {
    classList : "vjs-default-skin vjs-big-play-centered", 
    id : "video"
  });
  videoPlayer.style.width = "100vw";
  videoPlayer.style.height = "100vh";
  const Button = videojs.getComponent("Button"); // eslint-disable-line
  if (videoType == "application/x-mpegURL") {
    const player = videojs(videoPlayer, {  // eslint-disable-line
      controls: true,
      autoplay: true,
      preload: "auto",
      html5: {
        vhs: {
          overrideNative: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false 
      }
    });  

    // change icon from vjs-icon-cog to vjs-icon-hd - needs to be implemented better
    const httpSourceSelectorIconChange = document.createElement("style");
    httpSourceSelectorIconChange.innerHTML = ".vjs-icon-cog:before { content: \"\\f114\"; font-size: 16px; }";
    document.head.appendChild(httpSourceSelectorIconChange);

    const qualityLevels = player.qualityLevels(); 
    // disable quality levels with less one qualityLevel options
    qualityLevels.on("addqualitylevel", function(event) {
      let qualityLevel = event.qualityLevel; 
      if(qualityLevels.levels_.length <= 1){ 
        // dont show httpSourceSelector
        qualityLevel.enabled = false;
      } else{  
        // show httpSourceSelector
        player.httpSourceSelector();
        qualityLevel.enabled = true;
      } 
    });

    let hlsVideoSrc; 
    try { 
      // check if desired chunklist is in videoSrc
      if(videoSrc.substr(videoSrc.length - 4) == "m3u8"){ 
        // get chunklist
        const chunklist = videoSrc.substring( 
          videoSrc.lastIndexOf("/") + 1, 
          videoSrc.lastIndexOf(".m3u8")
        );   
        // if chunklist contains chunklist 
        if(chunklist.includes("chunklist")){ 
          // hls video src == new video src
          hlsVideoSrc = videoSrc.slice(0,videoSrc.lastIndexOf("/")+1) + "playlist" + ".m3u8";
          // replace url from orignial video src to new video src
          history.replaceState(null, "", `?t=${videoType}?v=${hlsVideoSrc}`);
        } else{ // orignial video src = hls video src
          hlsVideoSrc = videoSrc;
        } 
      } else{ // orignial video src = hls video src
        hlsVideoSrc = videoSrc;  
      }
    } catch (error) { // if error orignial video src = hls video src
      hlsVideoSrc = videoSrc;  
    } 
    
    // video hotkeys
    // eslint-disable-next-line no-undef
    videojs(videoPlayer).ready(function() {
      this.hotkeys({
        volumeStep: 0.05,
        seekStep: false,
        enableModifiersForNumbers: false,
        // just in case seekStep is active, return undefined
        forwardKey: function() {
          // override forwardKey to not trigger when pressed
          return undefined;
        },
        rewindKey: function() { 
          // override rewindKey to not trigger when pressed
          return undefined;
        }
      });
    });

    // record stream
    const StopRecButton = downloadStream.stopRecStreamButton(player, Button);
    const RecButton = downloadStream.RecStreamButton(player, Button, StopRecButton, videoSrc, videoType);

    videojs.registerComponent("RecButton", RecButton);  // eslint-disable-line
    player.getChild("controlBar").addChild("RecButton", {}, 1);

    const topControls = videoButton.topPageControlBarContainer(player);
    videoButton.backToHomePageButton(topControls, videoLinkFromUrl); //  closes player
    player.play(); // play video on load
    player.muted(videoPlayerSettings.muted); // set mute video settings on load
    player.volume(videoPlayerSettings.volume);  // set volume video settings on load
    document.getElementById("video_html5_api").onvolumechange = () => {  // update global video player volume/mute settings
      updateVideoPlayerVolume(player.volume(), player.muted()); 
    };
    player.src({  // video type and src
      type: videoType,
      src: hlsVideoSrc
    });
    // hide time from live video player
    const style = document.createElement("style");
    style.innerHTML = `
      .video-js .vjs-time-control{display:none;}
      .video-js .vjs-remaining-time{display: none;}
    `;
    document.head.appendChild(style);
  } else if ( videoType == "application/dash+xml" ) {
    const player = videojs(videoPlayer, {  // eslint-disable-line
      controls: true,
      autoplay: true,
      preload: "auto"
    });

    // video hotkeys
    // eslint-disable-next-line no-undef
    videojs(videoPlayer).ready(function() {
      this.hotkeys({
        volumeStep: 0.05,
        seekStep: 5,
        enableModifiersForNumbers: false
      });
    });

    const topControls = videoButton.topPageControlBarContainer(player);
    videoButton.backToHomePageButton(topControls, videoLinkFromUrl); //  closes player
    player.play(); // play video on load
    player.muted(videoPlayerSettings.muted); // set mute video settings on load
    player.volume(videoPlayerSettings.volume);  // set volume video settings on load
    document.getElementById("video_html5_api").onvolumechange = () => {  // update global video player volume/mute settings
      updateVideoPlayerVolume(player.volume(), player.muted()); 
    };
    player.src({  // video type and src
      type: videoType,
      src: videoSrc
    });
  } else { 
    const player = videojs(videoPlayer, {  // eslint-disable-line
      "playbackRates":[0.25,0.5, 1, 1.25, 1.5, 2],
      controls: true,
      techOrder: [ "chromecast", "html5" ],
      plugins: {
        chromecast: {
          addButtonToControlBar: typeof videoPlayerSettings.chromecast === "boolean" ? videoPlayerSettings.chromecast : false
        },
        seekButtons: {
          forward: basic.isNum(videoPlayerSettings.seekForward) ? videoPlayerSettings.seekForward : 30,
          back: basic.isNum(videoPlayerSettings.seekBackward) ? videoPlayerSettings.seekBackward : 5
        }
      }
    });
    
    // video hotkeys
    // eslint-disable-next-line no-undef
    videojs(videoPlayer).ready(function() {
      this.hotkeys({
        volumeStep: 0.05,
        seekStep: 5,
        enableModifiersForNumbers: false
      });
    });

    const topControls = videoButton.topPageControlBarContainer(player);
    
    //  closes player
    videoButton.backToHomePageButton(topControls, videoLinkFromUrl);

    // download video 
    const downloadVideoContainer = basic.createElement(topControls, "section", {
      classList : "vjs-downloadVideo-container"
    });
    const downloadVideoButton = basic.createElement(downloadVideoContainer, "button", {
      classList : "vjs-downloadVideo fa fa-download vjs-control vjs-button", 
      id : "downloadVideoButton",
      title : "Download Video"
    });
    const downloadVideoMenu = basic.createElement(downloadVideoContainer, "section", {
      classList : "vjs-menu vjs-downloadVideo-menu",
      style : "display : none;" 
    });
    const downloadVideoMenuContent = basic.createElement(downloadVideoMenu, "section", {
      classList : "vjs-menu-content"
    });

    downloadVideo.downloadVideoButton(downloadVideoMenuContent, videoSrc, videoType);
    trimVideo.createTrimVideo(player, downloadVideoContainer, downloadVideoMenu,downloadVideoButton, downloadVideoMenuContent, videoSrc, videoType);

    downloadVideoContainer.onmouseover = function(){
      document.getElementById("downloadVideoButton").focus();
      downloadVideoMenu.style.display = "block";
      document.getElementById("downloadVideoButton").onclick = document.getElementById("downloadVideoButton").blur();
    };
    downloadVideoContainer.onmouseout = function(){
      document.getElementById("downloadVideoButton").blur();
      downloadVideoMenu.style.display = "none";
    };

    player.play(); // play video on load
    player.muted(typeof videoPlayerSettings.muted === "boolean" ? videoPlayerSettings.muted : false); // set mute video settings on load
    player.volume(basic.isNum(videoPlayerSettings.volume) ? videoPlayerSettings.volume : 1); // set volume video settings on load 
    document.getElementById("video_html5_api").onvolumechange = () => { // update global video player volume/mute settings
      updateVideoPlayerVolume(player.volume(), player.muted()); 
    };  
    player.src({  // video type and src
      type: videoType,
      src: videoSrc
    });
  }
}

// get video player settings
export async function getVideoPlayerSettings() {
  const response = await fetch("../getVideoPlayerSettings");
  return response.ok ? await response.json() : {
    volume: 1.0,
    muted: false,
    chromecast: false
  };
}

// update video player volume settings
export async function updateVideoPlayerVolume(volume, muted) {
  if (!basic.isNum(volume)) return "volume-invalid";
  if (typeof muted !== "boolean") return "mute-invalid";
  const payload = { 
    updatedVideoPlayerVolume : volume,
    updatedVideoPlayerMuted : muted
  };
  const response = await fetch("../updateVideoPlayerVolume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok ? await response.json() : "Fetch Request Failed";
}
