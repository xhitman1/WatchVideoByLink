"use strict";
const path = require("path");
const FileSystem = require("fs");
const stream = require("stream");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const ffmpeg = require("fluent-ffmpeg");
const youtubedl = require("youtube-dl");

let user_settings_path = "data/user-settings.json";
const user_settings = FileSystem.readFileSync(user_settings_path);
let userSettings = JSON.parse(user_settings);

let data_videos_path = "data/data-videos.json";
const data_videos  = FileSystem.readFileSync(data_videos_path);
let videoData = JSON.parse(data_videos);
 
let available_videos_path = "data/available-videos.json";
const available_videos  = FileSystem.readFileSync(available_videos_path);
let availableVideos = JSON.parse(available_videos);

let current_download_videos_path = "data/current-download-videos.json";
const current_download_videos = FileSystem.readFileSync(current_download_videos_path);
let currentDownloadVideos = JSON.parse(current_download_videos);

let ffprobe_path = "./ffprobe.exe";
let ffmpeg_path = "./ffmpeg.exe";
let untrunc_path = "untrunc.exe";
let working_video_path = "./media/working-video/video.mp4";

// updated user settings path
function update_user_settings_path(newPath){ 
  if (FileSystem.existsSync(newPath)) { 
    try {  
      if (path.extname(newPath) === ".json") {
        const user_settings = FileSystem.readFileSync(newPath);  
        userSettings = JSON.parse(user_settings);
        user_settings_path = newPath;
        return "userSettings updated";
      } else {
        return "input path not json"; 
      }   
    } catch (error) {  
      return error;
    }
  } else {
    return "invalid path";
  }
}

// updated data videos path
function update_data_videos_path(newPath){ 
  if (FileSystem.existsSync(newPath)) {
    try {
      if (path.extname(newPath) === ".json") {
        const data_videos  = FileSystem.readFileSync(newPath);
        videoData = JSON.parse(data_videos);
        data_videos_path = newPath;
        return "videoData updated";
      } else {
        return "input path not json"; 
      }
    } catch (error) {
      return error;
    }
  } else {
    return "invalid path";
  }
}

// updated available videos path
function update_available_videos_path(newPath){ 
  if (FileSystem.existsSync(newPath)) {
    try {
      if (path.extname(newPath) === ".json") {
        const available_videos  = FileSystem.readFileSync(newPath);
        availableVideos = JSON.parse(available_videos);  
        available_videos_path = newPath; 
        return "availableVideos updated";
      } else {
        return "input path not json"; 
      }
    } catch (error) {
      return error;
    }
  } else { 
    return "invalid path";
  }
}

// updated current download videos path
function update_current_download_videos_path(newPath){ 
  if (FileSystem.existsSync(newPath)) {
    try {
      if (path.extname(newPath) === ".json") {
        const current_download_videos = FileSystem.readFileSync(newPath);
        currentDownloadVideos = JSON.parse(current_download_videos);
        current_download_videos_path = newPath;
        return "currentDownloadVideos updated";
      } else {
        return "input path not json"; 
      }
    } catch (error) {
      return error;
    }
  } else {
    return "invalid path";
  }
}

// updated ffprobe path
function update_ffprobe_path(newPath){ 
  ffprobe_path = newPath;
  return ffprobe_path;
}

// updated ffmpeg path
function update_ffmpeg_path(newPath){ 
  ffmpeg_path = newPath;
  return ffmpeg_path;
}

// updated untrun path
function update_untrunc_path(newPath){ 
  untrunc_path = newPath;
  return untrunc_path;
}

// updated working video path
function update_working_video_path(newPath){ 
  working_video_path = newPath;
  return working_video_path;
}

// returns current video downloads
function getAllVideoData(){
  return videoData;
}

// return video data to its inital state
function resetVideoData(){
  videoData = {};
  const newVideoData = JSON.stringify(videoData, null, 2);
  FileSystem.writeFileSync(data_videos_path, newVideoData);
  return "resetVideoData";
}

// check if id provided is corresponding to videos
function findVideosByID(id){
  if (videoData[id] === undefined) { // if id is invalid
    return undefined;
  } else { // if valid return videos[id]
    return videoData[id];
  }
}

// updates video data by for provided id
function updateVideoDataByID(videoID, Data){
  videoData[videoID] = Data;
  const newVideoData = JSON.stringify(videoData, null, 2);
  FileSystem.writeFileSync(data_videos_path, newVideoData);
  return videoData[videoID];
}

// deletes video data by for provided id
function deleteVideoDataByID(videoID){ 
  if (findVideosByID(videoID) !== undefined) {
    delete videoData[videoID]; 
    const newVideoData = JSON.stringify(videoData, null, 2);
    FileSystem.writeFileSync(data_videos_path, newVideoData);
    return `Deleted ${videoID}`; 
  } else {
    return `${videoID} Unavaiable`; 
  }
}

// returns all availableVideos data
function getAllAvailableVideos(){
  return availableVideos;
}

// return available Videos to its inital state
function resetAvailableVideos(){
  availableVideos = {}; 
  const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
  FileSystem.writeFileSync(available_videos_path, newAvailableVideo);
  return "resetAvailableVideos";
}

// check if id provided is corresponding to available videos
function findAvailableVideosByID(id){
  if (availableVideos[id] === undefined) {  
    return undefined;
  } else { 
    return availableVideos[id];
  }
}

// updates available videos by for provided id
function updateAvailableVideosByID(videoID, Data){
  availableVideos[videoID] = Data;
  const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
  FileSystem.writeFileSync(available_videos_path, newAvailableVideo);
  return availableVideos[videoID];
}
 
// deletes available videos by for provided id
function deleteAvailableVideosByID(videoID){ 
  if (findAvailableVideosByID(videoID) !== undefined) {
    delete availableVideos[videoID]; 
    const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
    FileSystem.writeFileSync(available_videos_path, newAvailableVideo);
    return `Deleted ${videoID}`; 
  } else {
    return `${videoID} Unavaiable`; 
  }
}

// returns current video downloads
function currentDownloads(){
  return currentDownloadVideos;
}

// return current video downloads to its inital state
function resetCurrentDownloadVideos(){
  currentDownloadVideos = {};
  const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
  FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);
  return "resetCurrentDownloadVideos";
}

// check if id provided is corresponding to video download
function findCurrentDownloadByID(id){
  if (currentDownloadVideos[id] === undefined) { // if id is invalid
    return undefined;
  } else { // if valid return videos[id]
    return currentDownloadVideos[id];
  }
}

// deletes current video downloads by for provided id
function updateCurrentDownloadByID(videoID, Data){
  currentDownloadVideos[videoID] = Data;
  const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
  FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);
  return currentDownloadVideos[videoID];
}

// deletes video download data by for provided id
function deleteCurrentDownloadByID(videoID){  
  if (findCurrentDownloadByID(videoID) !== undefined) {
    delete currentDownloadVideos[videoID]; 
    const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
    FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);
    return `Deleted ${videoID}`;  
  } else {
    return `${videoID} Unavaiable`; 
  }
}

// Restore a damaged (truncated) mp4 provided a similar not broken video is available
function untrunc(fileName,fileType,newFilePath,path, fileName_original_ending, fileName_fixed_ending){
  if(FileSystem.existsSync(fileName_original_ending) == true){  
    exec(`${untrunc_path} ${working_video_path} ./media/video/${fileName}/${fileName}.mp4`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          downloadVideoAfterUntrunc(fileName,fileType,newFilePath,path, fileName_original_ending, fileName_fixed_ending);
          return;
      }
      console.log(`stdout: ${stdout}`);
    }); 
  } else if(FileSystem.existsSync(fileName_fixed_ending) == true){ 
    const renameFilePath = setInterval(function(){ 
      FileSystem.rename(fileName_fixed_ending, fileName_original_ending,  () => { 
        clearInterval(renameFilePath);
        // if (err) throw err; 
        exec(`${untrunc_path} ${working_video_path} ./media/video/${fileName}/${fileName}.mp4`, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              downloadVideoAfterUntrunc(fileName,fileType,newFilePath,path, fileName_original_ending, fileName_fixed_ending);
              return;
          }
          console.log(`stdout: ${stdout}`);
        }); 
      });
    }, 50);
  } else{ 
    deleteAllVideoData(fileName);       
  }
}

// Download video after Untrunc
function downloadVideoAfterUntrunc(fileName,fileType,newFilePath,path, fileName_original_ending, fileName_fixed_ending){
  ffmpeg.ffprobe(fileName_fixed_ending, (error, metadata) => {   
    // update currentDownloadVideos
    currentDownloadVideos[`${fileName}`] = {
      video : { 
        "download-status" : "Untrunc"
      },
      thumbnail : { 
        "download-status" : "waiting for video"
      } 
    };
    const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
    FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
    // check if fileName_fixed_ending video has finnished downloading by checking if metadata exits
    const checkIfMetadataExists = setInterval(function(){ 
      //code goes here that will be run every intrerval.    
      if(metadata !== "undefined"){ // video finnished restoring
        clearInterval(checkIfMetadataExists); // stop check if video finnished restoring  
        // move video file to deleted-videos folder
        // if video is active it will make the video not viewable if someone wants to view it 
        const renameBadVideoFile = setInterval(function(){ 
          FileSystem.rename(fileName_original_ending, `./media/video/${fileName}/delete_soon.mp4`, () => { 
            clearInterval(renameBadVideoFile); // stop interval
            if (FileSystem.existsSync(`./media/video/${fileName}/delete_soon.mp4`) == true) { 
              //file exists   
              const renameFixedVideoTillOrignialName = setInterval(function(){                        
                FileSystem.rename(fileName_fixed_ending, fileName_original_ending,  () => { 
                  clearInterval(renameFixedVideoTillOrignialName); // stop interval
                  if (FileSystem.existsSync(fileName_original_ending)) {
                    console.log(`\n rename ${fileName_fixed_ending} to ${fileName_original_ending} \n`);
                    /// encoding is complete, so callback or move on at this point
                    videoData[`${fileName}`] = {
                      video : {
                        originalVideoSrc : "unknown",
                        originalVideoType : "unknown",
                        path: newFilePath+fileName+fileType,
                        videoType : "video/mp4",
                        download : "completed",
                      },
                      thumbnail: {
                        path: {},
                        download: "starting"
                      }
                    };

                    const newData = JSON.stringify(videoData, null, 2);
                    FileSystem.writeFileSync(data_videos_path, newData);
                    
                    currentDownloadVideos[`${fileName}`] = {
                      video : { 
                        "download-status" : "completed"
                      },
                      thumbnail : { 
                        "download-status" : "starting thumbnail download"
                      } 
                    };
                    const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
                    FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  

                    console.log("Video Transcoding succeeded !"); 
                    createThumbnail(path, newFilePath, fileName); 
                  }

                  if(FileSystem.existsSync(`./media/video/${fileName}/delete_soon.mp4`) == true){
                    FileSystem.unlink(`./media/video/${fileName}/delete_soon.mp4`, (err) => {
                      if (err) throw err;
                      console.log(`\n unlinked media/video/${fileName}/delete_soon.mp4 video file \n`);
                    });
                  }

                  if(FileSystem.existsSync(`./media/video/${fileName}/${fileName}.mp4_fixed.mp4`) == true){
                    FileSystem.unlink(`./media/video/${fileName}/${fileName}.mp4_fixed.mp4`, (err) => {
                      if (err) throw err;
                      console.log(`\n unlinked media/video/${fileName}/${fileName}.mp4_fixed.mp4 video file \n`);
                    });
                  }
                });        
              }, 50);  
            } 
          });   
        }, 50);  
      }
    }, 50); 
  });
}

// check for unfinnished video/thumbnail download when the application get started 
function cheackForAvailabeUnFinishedVideoDownloads(){  
  if(Object.keys(currentDownloads()).length !== 0){  // if there is available data in currentDownloads()
    Object.keys(currentDownloads()).forEach(function(fileName) { // for each currentDownloads get id as fileName 
      // assign download status variable if available with correct progress status
      let videoProgress, thumbnailProgress, compressionProgress;
      if (currentDownloadVideos[fileName]["video"]) {
        videoProgress = currentDownloadVideos[fileName]["video"]["download-status"];  
      } else {
        videoProgress = false;
      }
      if (currentDownloadVideos[fileName]["thumbnail"]) {
        thumbnailProgress = currentDownloadVideos[fileName]["thumbnail"]["download-status"];  
      } else {
        thumbnailProgress = false;
      } 
      if (currentDownloadVideos[fileName]["compression"]) {
        compressionProgress = currentDownloadVideos[fileName]["compression"]["download-status"];  
      } else {
        compressionProgress = false;
      } 

      // video should always be available else delete all
      // thumbnail only if video completed 
      // compression only if true 

      if (videoProgress) {
        // videoProgress true
        if (videoProgress == "completed") {
          // videoProgress completed         
          if (thumbnailProgress && compressionProgress) {
            // thumbnail && compression true
            if(!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg and ffprobe is  unavailable
              if (thumbnailProgress == "completed" && compressionProgress !== "completed") {   
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffmpeg and ffprobe unavailable";   
              } else if (thumbnailProgress !== "completed" && compressionProgress == "completed") {       
                currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg and ffprobe unavailable";  
              } else{       
                currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg and ffprobe unavailable";  
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffmpeg and ffprobe unavailable";   
              }  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(!FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg is  unavailable
              if (thumbnailProgress == "completed" && compressionProgress !== "completed") {   
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffmpeg unavailable"; 
              } else if (thumbnailProgress !== "completed" && compressionProgress == "completed") {       
                currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg unavailable";
              } else{       
                currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg unavailable"; 
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffmpeg unavailable";
              }  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);           
            } else if(!FileSystem.existsSync(ffprobe_path)){ //update ffprobe is  unavailable
              if (thumbnailProgress == "completed" && compressionProgress !== "completed") {   
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffprobe unavailable";  
              } else if (thumbnailProgress !== "completed" && compressionProgress == "completed") {       
                currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffprobe unavailable";  
              } else{       
                currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffprobe unavailable";  
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffprobe unavailable";  
              }  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(thumbnailProgress == "completed" && compressionProgress == "completed"){ // delete data (no longer needed)            
              delete currentDownloadVideos[`${fileName}`]; 
              const deleteCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, deleteCurrentDownloadVideos);  
            } else if(thumbnailProgress == "completed" && compressionProgress !== "completed"){ 
              // update thumbanil unfinnished & compression completed              
              currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "completed"; 
              currentDownloadVideos[fileName]["compression"]["download-status"] = "unfinished download"; 
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);   
            } else if(thumbnailProgress !== "completed" && compressionProgress == "completed"){ 
              // update thumbanil unfinnished & compression completed              
              currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "unfinished download"; 
              currentDownloadVideos[fileName]["compression"]["download-status"] = "completed"; 
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);   
            } else { // update thumbanil & compression is unfinnished              
              currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "unfinished download"; 
              currentDownloadVideos[fileName]["compression"]["download-status"] = "unfinished download"; 
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);   
            }
          } else if (thumbnailProgress && !compressionProgress) {
            // thumbnail true compression false 
            if(!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg and ffprobe is  unavailable
              currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg and ffprobe unavailable";  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(!FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg is  unavailable
              currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg unavailable";  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(!FileSystem.existsSync(ffprobe_path)){ //update ffprobe is  unavailable
              currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffprobe unavailable";  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(thumbnailProgress == "completed"){ // delete data (no longer needed)       
              delete currentDownloadVideos[`${fileName}`]; 
              const deleteCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, deleteCurrentDownloadVideos);  
            } else{ // update thumbanil is unfinnished
              currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "unfinished download";
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);   
            }
          } else if (!thumbnailProgress && compressionProgress) {
            // thumbnail false compression true 
            if(!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg and ffprobe is  unavailable
              if (compressionProgress == "completed") {    
                currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffmpeg and ffprobe unavailable"};
              } else{       
                currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffmpeg and ffprobe unavailable"};
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffmpeg and ffprobe unavailable";    
              }  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(!FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg is  unavailable
              if (compressionProgress == "completed") {    
                currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffmpeg unavailable"};
              } else{       
                currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffmpeg unavailable"};
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffmpeg unavailable";     
              }  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(!FileSystem.existsSync(ffprobe_path)){ //update ffprobe is  unavailable
              if (compressionProgress == "completed") {    
                currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffprobe unavailable"};
              } else{       
                currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffprobe unavailable"};
                currentDownloadVideos[fileName]["compression"]["download-status"] = "ffprobe unavailable";      
              }  
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(compressionProgress == "completed"){ // update thumbanil unfinnished 
              currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "unfinished download"};
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else { // update thumbanil & compression is unfinnished 
              currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "unfinished download"};
              currentDownloadVideos[fileName]["compression"]["download-status"] = "unfinished download";    
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            }
          } else {
            // thumbnail false compression false  
            if(!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg and ffprobe is  unavailable
              currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffmpeg and ffprobe unavailable"};
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(!FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg is  unavailable
              currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffmpeg unavailable"}; 
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else if(!FileSystem.existsSync(ffprobe_path)){ //update ffprobe is  unavailable
              currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "ffprobe unavailable"}; 
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
            } else{ // update thumbanil is unfinnished
              currentDownloadVideos[fileName]["thumbnail"] = {"download-status": "unfinished download"};
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);   
            } 
          }
        }  else if(currentDownloadVideos[fileName]["video"]["download-status"] == "starting stream download" ||
                  currentDownloadVideos[fileName]["video"]["download-status"] == "starting full video download" ||
                  currentDownloadVideos[fileName]["video"]["download-status"] == "starting trim video download" ||
                  currentDownloadVideos[fileName]["video"]["download-status"] == "starting uploaded video download" ||
                  currentDownloadVideos[fileName]["video"]["download-status"] == "0.00%"
                  ){ // if the video download hasn't started
                    deleteAllVideoData(fileName);          
          } else if(!FileSystem.existsSync(untrunc_path)){//update untrunc is unavailable
            currentDownloadVideos[fileName]["video"]["download-status"] = "untrunc unavailable";  
            const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
            FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
          } else if(!FileSystem.existsSync(working_video_path)){//update working_video_path is unavailable
            currentDownloadVideos[fileName]["video"]["download-status"] = "working video for untrunc is unavailable";  
            const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
            FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
          } else{ // update video is unfinnished
            currentDownloadVideos[fileName]["video"]["download-status"] = "unfinished download";
            const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
            FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
          }
      } else {
        deleteAllVideoData(fileName);    
      }
    });  
  }
}

// finnish download video/thumbnail (if not completed) when the application get started 
function completeUnfinnishedVideoDownload(fileName){ 
  const videoDetails = findCurrentDownloadByID(fileName);
  if (videoDetails == undefined) { 
    return "invalid current downloads id";
  } else {
    const filepath = "media/video/";
    const fileType = ".mp4";
    const newFilePath = `${filepath}${fileName}/`; 
    const path = newFilePath+fileName+fileType;
    let videoProgressCompleted, thumbnailProgressCompleted, compressionProgressCompleted;
    try { // if videoProgress exits and is complete return true else false
      if (currentDownloadVideos[fileName]["video"]["download-status"] == "completed") {
        videoProgressCompleted = true;
      } else {
        videoProgressCompleted = false;
      }
    } catch (error) {
      videoProgressCompleted = false;
    }
    try { // if thumbnailProgress exits and is complete return true else false
      if (currentDownloadVideos[fileName]["thumbnail"]["download-status"] == "completed") {
        thumbnailProgressCompleted = true;
      } else {
        thumbnailProgressCompleted = false;
      }
    } catch (error) {
      thumbnailProgressCompleted = false;
    }
    try { // if compressionProgress exits and is complete return true else false
      if (currentDownloadVideos[fileName]["compression"]["download-status"] == "completed") {
        compressionProgressCompleted = true;
      } else {
        compressionProgressCompleted = false;
      }
    } catch (error) {
      compressionProgressCompleted = false;
    }
    if(videoProgressCompleted){ // when video has already been finnished downloading 
      if(thumbnailProgressCompleted && compressionProgressCompleted){ // delete data (no longer needed)    
        // thumbnail true, compression true   
        delete currentDownloadVideos[`${fileName}`]; 
        const deleteCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
        FileSystem.writeFileSync(current_download_videos_path, deleteCurrentDownloadVideos);  
        return "download status: completed";
      } else if(!thumbnailProgressCompleted && compressionProgressCompleted){ // redownload thumbnails
        // thumbnail false, compression true
        createThumbnail(path, newFilePath, fileName); 
        return "redownload thumbnails";
      } else if(thumbnailProgressCompleted && !compressionProgressCompleted){ // redownload compression
        // thumbnail true, compression false
        compression_VP9(path, newFilePath, fileName); 
        return "redownload compression";
      } else{ 
        if (currentDownloadVideos[fileName]["compression"] == undefined) { // redownload thumbnails 
          // thumbnail false, compression undefined  
          createThumbnail(path, newFilePath, fileName); 
          return "redownload thumbnails";      
        } else { // redownload thumbnails & compression
          // thumbnail false, compression false  
          createThumbnail(path, newFilePath, fileName); 
          compression_VP9(path, newFilePath, fileName); 
          return "redownload thumbnails & compression";  
        } 
      }
    } else{  
      const fileName_path = `./media/video/${fileName}/${fileName}`,
      fileName_original_ending = `${fileName_path}.mp4`,
      fileName_fixed_ending = `${fileName_path}.mp4_fixed.mp4`;
      // untrunc broke video 
      untrunc(fileName,fileType,newFilePath,path, fileName_original_ending, fileName_fixed_ending);  
      return "untrunc broke video";
    }
  }
}

// if video videoId is valid then stream video
async function streamVideo(request, response, videoID, displayCompressedVideo){
  // check if videoid is valid
  const videoDetails = await findVideosByID(videoID);
  // if video dosent exist redirect to home page
  if (videoDetails == undefined) {
    response.status(404).redirect("/");
  } else { // if videoID is valid
    try {
      // variables
      let videoPath, videoType;
      if (displayCompressedVideo) { // update videoPath, videoType with compressed video details
        videoPath = videoDetails.compression.path; 
        videoType = videoDetails.compression.videoType; 
      } else { // update videoPath, videoType with original video details
        videoPath = videoDetails.video.path; 
        videoType = videoDetails.video.videoType; 
      }
      // getting the video file size
      const stat = FileSystem.statSync(videoPath);
      const fileSize = stat.size;
      // requests occur when a client asks the server for only a portion of the requested file.
      const range = request.headers.range;
      // send partial content of video file
      if (range) {
        // split up beginning and end of request range
        const parts = range.replace(/bytes=/, "").split("-");
        // beginning of the request range
        const start = parseInt(parts[0], 10);
        // end of the requested range
        const end = parts[1]
          ? parseInt(parts[1], 10) // if
          : fileSize-1; // else
        // when video start file size is greater or equal to video file Size
        // send 416 error
        if(start >= fileSize) {
          response.status(416).send("Requested range not satisfiable\n"+start+" >= "+fileSize);
          return;
        }
        // The size of the chunks
        const chunksize = (end-start)+1;
        // Creating the stream
        const file = FileSystem.createReadStream(videoPath, {start, end});
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type":  videoType,
        };
        // send newly made stream to the client
        response.writeHead(206, head);
        file.pipe(response);
      } else { // send whole video file
        const head = {
          "Content-Length": fileSize,
          "Content-Type":  videoType,
        };
        response.writeHead(200, head);
        FileSystem.createReadStream(videoPath).pipe(response);
      }
    } catch (e) { // if error redirect to home page
      response.status(404).redirect("/");
    }
  }
}

// streams available thumbnail images  provided by videoID and thumbnailID
async function streamThumbnail(request, response, videoID, thumbnailID) {
  const videoDetails = await findVideosByID(videoID);
  if (videoDetails == undefined) {
    response.status(404).redirect("/");
  }else {
    try {
      const path = videoDetails["thumbnail"]["path"][`${thumbnailID}`];
      const file = FileSystem.createReadStream(path); // or any other way to get a readable stream
      const ps = new stream.PassThrough(); // <---- this makes a trick with stream error handling
      stream.pipeline(
       file,
       ps, // <---- this makes a trick with stream error handling
       (err) => {
        if (err) {
          console.log(err); // No such file or any other kind of error
          return response.sendStatus(400);
        }
      });
      ps.pipe(response); // <---- this makes a trick with stream error handling
    } catch (e) {
      response.status(404).redirect("/");
    }
  }
}

// update video player volume settings
function updateVideoPlayerVolume(videoPlayerVolume, videoPlayerMuted) {
  if (!isNaN(videoPlayerVolume) && typeof videoPlayerMuted == "boolean") {
    userSettings["videoPlayer"].volume = videoPlayerVolume;
    userSettings["videoPlayer"].muted = videoPlayerMuted;
    const newUserSettings = JSON.stringify(userSettings, null, 2);
    FileSystem.writeFileSync(user_settings_path, newUserSettings);  
    return "updated-video-player-volume";
  } else if (!isNaN(videoPlayerVolume) && typeof videoPlayerMuted !== "boolean") {
    return "muted-invaid";
  } else if (isNaN(videoPlayerVolume) && typeof videoPlayerMuted == "boolean") {
    return "volume-invaid";
  } else {
    return "volume-muted-invaid";
  }
}

// update compress Video Download
function updateCompressVideoDownload(downloadType, bool) {
  try {
    if (userSettings["download"]["compression"][`${downloadType}`] == true ||
        userSettings["download"]["compression"][`${downloadType}`] == false
    ) {
      if (typeof bool == "boolean") {
        userSettings["download"]["compression"][`${downloadType}`] = bool;
        const newUserSettings = JSON.stringify(userSettings, null, 2);
        FileSystem.writeFileSync(user_settings_path, newUserSettings);
        return `compress video download ${downloadType} updated`;
      } else {       
        return "invalid bool";
      }
    } else {
      return "invalid download type";
    }
  } catch (error) {
    return "update failed";
  }
}

// get video player settings
function getVideoPlayerSettings() { 
  return userSettings["videoPlayer"];
}

// ends ffmpeg (finishes download video)
const stop = (command) => {
  return command.ffmpegProc.stdin.write("q");
};

// ends ffmpeg forcefully
const SIGKILL = (command) => {
  return command.kill("SIGKILL");
};

// check if original video src path exits
async function checkIfVideoSrcOriginalPathExits(videoSrc) {
  try {
    if (videoSrc.includes("/video/")) { // if videoSrc includes /video/, split src at /video/ and attempt to findVideosByID
      const videoDetails = await findVideosByID(videoSrc.split("/video/")[1]);
      if (videoDetails === undefined) { // videofile = inputted videos src
        return videoSrc;
      } else {
        if (videoDetails.video.path) { // original video path 
          return videoDetails.video.path;  
        } else { // videofile = inputted videos src 
          return videoSrc;
        } 
      }
    } else if (videoSrc.includes("/compressed/")) {
      const videoDetails = await findVideosByID(videoSrc.split("/compressed/")[1]);
      if (videoDetails === undefined) { // videofile = inputted videos src
        return videoSrc;
      } else {
        if (videoDetails.video.path) { // original video path 
          return videoDetails.video.path;
        } else { // videofile = inputted videos src 
          return videoSrc;
        } 
      }
    } else { // videofile = inputted videos src  
      return videoSrc;
    } 
  } catch (error) { // videofile = inputted videos src 
    return videoSrc;
  } 
}

// check if video compress true or false
function checkIfVideoCompress(downloadType) {
  try {
    if (userSettings["download"]["compression"][`${downloadType}`] == true ||
        userSettings["download"]["compression"][`${downloadType}`] == false
      ) {
      return userSettings.download.compression[`${downloadType}`]; 
    } else {
      return false; 
    }
  } catch (error) {
    return false; 
  }  
}

let fileNameID;
let stopVideoFileBool = false;
async function stopDownloadVideoStream(id) {
  const videoDetails = await findVideosByID(id);
  if (videoDetails !== undefined) {
    stopVideoFileBool = true;
    fileNameID = id; 
    return "stoped video stream download";
  } else {
    return "videoDetails dosnet exists";
  } 
}

// downloads live video stream
async function downloadVideoStream(req, res) {
  const command = new ffmpeg();
  const videofile = req.body.videoSrc;
  const compressVideoStream = checkIfVideoCompress("downloadVideoStream");
  const filepath = "media/video/";
  const fileName = uuidv4();
  const fileType = ".mp4";
  const newFilePath = `${filepath}${fileName}/`;
  const videoDetails = await findVideosByID(fileName);
  if (FileSystem.existsSync(ffprobe_path) && FileSystem.existsSync(ffmpeg_path)) { //files exists
    if (videoDetails == undefined) {
      if (!FileSystem.existsSync(`${filepath}${fileName}/`)){
          FileSystem.mkdirSync(`${filepath}${fileName}/`);
      }
      command.addInput(videofile)
        .on("start", function() {
          res.json(fileName);
          /// log something maybe
          videoData[`${fileName}`] = {
            video : {
              originalVideoSrc : req.body.videoSrc,
              originalVideoType : req.body.videoType,
              download : "starting stream download"
            }
          };

          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);
          
          if (compressVideoStream) { // addition of compress video data
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting stream download"
              },
              compression : { 
                "download-status" : "waiting for video"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          } else {
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting stream download"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          }
          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);    
        })
        .on("progress", function(data) {
          console.log("progress", data);

          if(videoData[`${fileName}`]["video"]["download"] !== "downloading"){
            videoData[`${fileName}`]["video"]["timemark"] = data.timemark; 
            videoData[`${fileName}`]["video"]["download"] = "downloading"; 
          } else {
            videoData[`${fileName}`]["video"]["timemark"] = data.timemark; 
          } 
          
          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);
          
          currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  data.timemark;  

          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);    
          
          if (stopVideoFileBool === true  && fileNameID == fileName) {
            try {
              stop(command);
              stopVideoFileBool = false;
            } catch (e) {
              stopVideoFileBool = false;
            }
          }
        })
        .on("end", function() {
          /// encoding is complete, so callback or move on at this point
          if (compressVideoStream) { // addition of compress video data
            videoData[`${fileName}`] = {
              video : {
                originalVideoSrc : req.body.videoSrc,
                originalVideoType : req.body.videoType,
                path: newFilePath+fileName+fileType,
                videoType : "video/mp4",
                download : "completed",
              },
              compression : {
                download: "starting"
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            };
          } else {
            videoData[`${fileName}`] = {
              video : {
                originalVideoSrc : req.body.videoSrc,
                originalVideoType : req.body.videoType,
                path: newFilePath+fileName+fileType,
                videoType : "video/mp4",
                download : "completed",
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            };
          }
          const newData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newData);
          
          currentDownloadVideos[`${fileName}`]["video"]["download-status"] = "completed";
          if (compressVideoStream) { // addition of compress video data
            currentDownloadVideos[`${fileName}`]["compression"]["download-status"] =  "starting video compression";    
          }
          currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] = "starting thumbnail download"; 

          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  

          console.log("Video Transcoding succeeded !");
          const path = newFilePath+fileName+fileType;
          if (compressVideoStream) { // compress video
            compression_VP9(path, newFilePath, fileName);
          }
          createThumbnail(path, newFilePath, fileName);
        })
        .on("error", function(error) {
          /// error handling
          console.log("[streamVideo.js-downloadVideoStream]", `Encoding Error: ${error.message}`);
          if (error.message === "Cannot find ffmpeg") {
            FileSystem.rmdir(`${newFilePath}`, { recursive: true }, (err) => {
              if (err) throw err;
              console.log(`\n removed ${newFilePath} dir \n`);
            });
            res.json("Cannot-find-ffmpeg");
          } else {
            // there could be diffrent types of errors that exists and some may contain content in the newly created path
            // due to the uncertainty of what errors may happen i have decided to not delete the newly created path untill further notice
            res.json("ffmpeg-failed");
          }
        })
        // .addInputOption('-i')
        .outputOptions(["-bsf:a aac_adtstoasc",  "-vsync 1", "-vcodec copy", "-c copy", "-crf 50"])
        // .outputOptions(['-c copy'])
        .output(`${newFilePath}${fileName}${fileType}`)
        .run();
      } else {
        // TODO: create new fileName and try again
        console.log("videoDetails already exists");
      }
  } else if (!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)) { //files dont exists
    console.log("Encoding Error: Cannot find ffmpeg and ffprobe in WatchVideoByLink directory");
    res.json("Cannot-find-ffmpeg-ffprobe");
  } else if (!FileSystem.existsSync(ffmpeg_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffmpeg in WatchVideoByLink directory");
    res.json("Cannot-find-ffmpeg");
  } else if (!FileSystem.existsSync(ffprobe_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffprobe in WatchVideoByLink directory");
    res.json("Cannot-find-ffprobe");
  }
}

// download full video
async function downloadVideo(req, res) {
  const command = new ffmpeg();
  const videoSrc = req.body.videoSrc;
  const videofile = await checkIfVideoSrcOriginalPathExits(videoSrc);
  const compressVideo = checkIfVideoCompress("downloadVideo");
  const filepath = "media/video/";
  const fileName = uuidv4();
  const fileType = ".mp4";
  const newFilePath = `${filepath}${fileName}/`;
  const videoDetails = await findVideosByID(fileName);
  if (FileSystem.existsSync(ffprobe_path) && FileSystem.existsSync(ffmpeg_path)) { //files exists
    if (videoDetails == undefined) {
      if (!FileSystem.existsSync(`${filepath}${fileName}/`)){
          FileSystem.mkdirSync(`${filepath}${fileName}/`);
      }
      command.addInput(videofile)
        .on("start", function() {
          res.json(fileName);
          videoData[`${fileName}`] = {
            video : {
              originalVideoSrc : req.body.videoSrc,
              originalVideoType : req.body.videoType,
              download : "starting full video download"
            }
          };
          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);

          if (compressVideo) { // addition of compress video data
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting full video download"
              },
              compression : { 
                "download-status" : "waiting for video"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          } else {
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting full video download"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          }
          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos); 

        })
        .on("progress", function(data) {
          console.log("progress", data);

          videoData[`${fileName}`]["video"]["download"] = data.percent; 

          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);

          if(data.percent < 0){ 
            currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  "0.00%";  
          }else{
            try {
              currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  `${data.percent.toFixed(2)}%`;  
            } catch (error) {
              currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  `${data.percent}%`;  
            }
          } 
          
          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos); 
        })
        .on("end", function() {
          /// encoding is complete, so callback or move on at this point
          if (compressVideo) { // addition of compress video data
            videoData[`${fileName}`] = {
              video: {
                originalVideoSrc : req.body.videoSrc,
                originalVideoType : req.body.videoType,
                path: newFilePath+fileName+fileType,
                videoType : "video/mp4",
                download : "completed",
              },
              compression : {
                download: "starting"
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            };
          } else {
            videoData[`${fileName}`] = {
              video: {
                originalVideoSrc : req.body.videoSrc,
                originalVideoType : req.body.videoType,
                path: newFilePath+fileName+fileType,
                videoType : "video/mp4",
                download : "completed",
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            }; 
          }
          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);

          currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  "completed";
          if (compressVideo) { // addition of compress video data
            currentDownloadVideos[`${fileName}`]["compression"]["download-status"] =  "starting video compression";                 
          }
          currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] =  "starting thumbnail download";    

          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  

          console.log("Video Transcoding succeeded !");
          const path = newFilePath+fileName+fileType;
          if (compressVideo) { // compress video
            compression_VP9(path, newFilePath, fileName);
          }
          createThumbnail(path, newFilePath, fileName);
        })
        .on("error", function(error) {
          /// error handling
          console.log("[streamVideo.js-downloadVideo]", `Encoding Error: ${error.message}`);
          if (error.message === "Cannot find ffmpeg") {
            FileSystem.rmdir(`${newFilePath}`, { recursive: true }, (err) => {
              if (err) throw err;
              console.log(`\n removed ${newFilePath} dir \n`);
            });
            res.json("Cannot-find-ffmpeg");
          } else {
            // there could be diffrent types of errors that exists and some may contain content in the newly created path
            // due to the uncertainty of what errors may happen i have decided to not delete the newly created path untill further notice
            res.json("ffmpeg-failed");
          }
        })
        .outputOptions(["-s hd720", "-bsf:a aac_adtstoasc",  "-vsync 1", "-vcodec copy", "-c copy", "-crf 50"])
        .output(`${newFilePath}${fileName}${fileType}`)
        .run();
      } else {
        // TODO: create new fileName and try again
        console.log("videoDetails already exists");
      }
  } else if (!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)) { //files dont exists
    console.log("Encoding Error: Cannot find ffmpeg and ffprobe in WatchVideoByLink directory");
    res.json("Cannot-find-ffmpeg-ffprobe");
  } else if (!FileSystem.existsSync(ffmpeg_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffmpeg in WatchVideoByLink directory");
    res.json("Cannot-find-ffmpeg");
  } else if (!FileSystem.existsSync(ffprobe_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffprobe in WatchVideoByLink directory");
    res.json("Cannot-find-ffprobe");
  }
}

// downlaod trimed video
async function trimVideo(req, res) {
  const command = new ffmpeg();
  const videoSrc = req.body.videoSrc;
  const videofile = await checkIfVideoSrcOriginalPathExits(videoSrc);
  const compressTrimedVideo = checkIfVideoCompress("trimVideo");
  const start = req.body.newStartTime;
  const end = req.body.newEndTime;
  const filepath = "media/video/";
  const fileName = uuidv4();
  const fileType = ".mp4";
  const newFilePath = `${filepath}${fileName}/`;
  const videoDetails = await findVideosByID(fileName);
  if (FileSystem.existsSync(ffprobe_path) && FileSystem.existsSync(ffmpeg_path)) { //files exists
    if (videoDetails == undefined) {
      if (!FileSystem.existsSync(`${filepath}${fileName}/`)){
          FileSystem.mkdirSync(`${filepath}${fileName}/`);
      }
      command.addInput(videofile)
        .on("start", function() {
          res.json(fileName);
          videoData[`${fileName}`] = {
            video:{
              originalVideoSrc : req.body.videoSrc,
              originalVideoType : req.body.videoType,
              newVideoStartTime: req.body.newStartTime,
              newVideoEndTime: req.body.newEndTime,
              download : "starting trim video download"
            }
          };

          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);
          
          if (compressTrimedVideo) { // addition of compress video data
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting trim video download"
              },
              compression : { 
                "download-status" : "waiting for video"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          } else {
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting trim video download"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          }
          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos); 
        
        })
        .on("progress", function(data) {
          console.log("progress", data);

          videoData[`${fileName}`]["video"]["download"] = data.percent; 
          
          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);

          if(data.percent < 0){ 
            currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  "0.00%";  
          }else{
            try {
              currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  `${data.percent.toFixed(2)}%`;   
            } catch (error) {
              currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  `${data.percent}%`;    
            }
          } 

          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);
        })
        .on("end", function() {
          if (compressTrimedVideo) { // addition of compress video data
            videoData[`${fileName}`] = {
              video: {
                originalVideoSrc: req.body.videoSrc,
                originalVideoType: req.body.videoType,
                newVideoStartTime: req.body.newStartTime,
                newVideoEndTime: req.body.newEndTime,
                path: newFilePath+fileName+fileType,
                videoType: "video/mp4",
                download: "completed"
              },
              compression : {
                download: "starting"
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            };
          } else {
            videoData[`${fileName}`] = {
              video: {
                originalVideoSrc: req.body.videoSrc,
                originalVideoType: req.body.videoType,
                newVideoStartTime: req.body.newStartTime,
                newVideoEndTime: req.body.newEndTime,
                path: newFilePath+fileName+fileType,
                videoType: "video/mp4",
                download: "completed"
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            };
          }
          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);
     
          currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  "completed";
          if (compressTrimedVideo) { // addition of compress video data
            currentDownloadVideos[`${fileName}`]["compression"]["download-status"] =  "starting video compression";  
          }        
          currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] =  "starting thumbnail download";

          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  

          console.log("Video Transcoding succeeded !");
          const path = newFilePath+fileName+fileType;
          if (compressTrimedVideo) { // compress video
            compression_VP9(path, newFilePath, fileName); 
          }
          createThumbnail(path, newFilePath, fileName);
        })
        .on("error", function(error) {
          /// error handling
          console.log("[streamVideo.js-trimVideo]", `Encoding Error: ${error.message}`);
          if (error.message === "Cannot find ffmpeg") {
            FileSystem.rmdir(`${newFilePath}`, { recursive: true }, (err) => {
              if (err) throw err;
              console.log(`\n removed ${newFilePath} dir \n`);
            });
            res.json("Cannot-find-ffmpeg");
          } else {
            // there could be diffrent types of errors that exists and some may contain content in the newly created path
            // due to the uncertainty of what errors may happen i have decided to not delete the newly created path untill further notice
            res.json("ffmpeg-failed");
          }
        })
        // .addInputOption("-y")
        .outputOptions([`-ss ${start}`, `-t ${(end-start)}`, "-vcodec copy", "-acodec copy"])
        .output(`${newFilePath}${fileName}${fileType}`)
        .run();
      } else {
        // TODO: create new fileName and try again
        console.log("videoDetails already exists");
      }
  } else if (!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)) { //files dont exists
    console.log("Encoding Error: Cannot find ffmpeg and ffprobe in WatchVideoByLink directory");
    res.json("Cannot-find-ffmpeg-ffprobe");
  } else if (!FileSystem.existsSync(ffmpeg_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffmpeg in WatchVideoByLink directory");
    res.json("Cannot-find-ffmpeg");
  } else if (!FileSystem.existsSync(ffprobe_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffprobe in WatchVideoByLink directory");
    res.json("Cannot-find-ffprobe");
  }
}

// creates images from provided video
async function createThumbnail(videofile, newFilePath, fileName) {
  const imageFileName = "thumbnail";
  const fileType = ".jpg";
  const numberOfImages = 8;
  let duration = 0;
  let numberOfCreatedScreenshots = 0;
  const videoDetails = await findVideosByID(fileName);
  if (FileSystem.existsSync(ffprobe_path) && FileSystem.existsSync(ffmpeg_path)) { //files exists
    if (videoDetails !== undefined) {
      ffmpeg.ffprobe(videofile, (error, metadata) => {
        try { // get video duration 
          duration = metadata.format.duration;
        } catch (error) { // duration = 0
          duration = 0;
        } 
        console.log(`${fileName} duration: ${duration}`);
        // if video duration greater then 0
        if (duration > 0) {
          const command = new ffmpeg();
            command.addInput(videofile)
              .on("start", () => {
                console.log("start createThumbnail");
              })
    
              .on("progress", (data) => {
                // update numberOfCreatedScreenshots
                numberOfCreatedScreenshots = data.frames; 
    
                if(data.percent < 0){ // if data.percent is less then 0 then show 0.00%
                  videoData[`${fileName}`]["thumbnail"].download =  0.00;
                  currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] =  "0.00%"; 
                }else{ //update data with with data.percent
                  try {
                    videoData[`${fileName}`]["thumbnail"].download =  data.percent;
                    currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] =  `${data.percent.toFixed(2)}%`;  
                  } catch (error) {
                    videoData[`${fileName}`]["thumbnail"].download =  data.percent;
                    currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] =  `${data.percent}%`;    
                  }
                }
                // update data to database
                const newVideoData = JSON.stringify(videoData, null, 2);
                FileSystem.writeFileSync(data_videos_path, newVideoData); 
    
                const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
                FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
    
                console.log("progress", data);
              })
              .on("end", () => {
                // encoding is complete
                for (let i = 0; i < numberOfCreatedScreenshots + 1; i++) {
                  if (i == 0){
                    try {
                      if (availableVideos[`${fileName}`]["info"]) {
                        availableVideos[`${fileName}`]["info"].thumbnailLink = {  
                        };
                      } else {
                        availableVideos[`${fileName}`] = {
                          info:{
                            title: fileName,
                            videoLink: {
                              src : `/video/${fileName}`,
                              type : "video/mp4"
                            },
                            thumbnailLink: {
                            }
                          }
                        }; 
                      }
                    } catch (error) {
                      availableVideos[`${fileName}`] = {
                        info:{
                          title: fileName,
                          videoLink: {
                            src : `/video/${fileName}`,
                            type : "video/mp4"
                          },
                          thumbnailLink: {
                          }
                        }
                      }; 
                    }
                  } else if (i < 10) {
                    videoData[`${fileName}`]["thumbnail"].path[i] = `${newFilePath}${fileName}-${imageFileName}00${i}${fileType}`;
                    availableVideos[`${fileName}`].info.thumbnailLink[i] = `/thumbnail/${fileName}/${i}`;
                  } else if (i < 100) {
                    videoData[`${fileName}`]["thumbnail"].path[i] = `${newFilePath}${fileName}-${imageFileName}0${i}${fileType}`;
                    availableVideos[`${fileName}`].info.thumbnailLink[i] = `/thumbnail/${fileName}/${i}`;
                  } else {
                    videoData[`${fileName}`]["thumbnail"].path[i] = `${newFilePath}${fileName}-${imageFileName}${i}${fileType}`;
                    availableVideos[`${fileName}`].info.thumbnailLink[i] = `/thumbnail/${fileName}/${i}`;
                  }
                  if (i == numberOfCreatedScreenshots) {
                    videoData[`${fileName}`]["thumbnail"].download = "completed";
                  }
                }

                const newVideoData = JSON.stringify(videoData, null, 2);
                FileSystem.writeFileSync(data_videos_path, newVideoData);

                const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
                FileSystem.writeFileSync(available_videos_path, newAvailableVideo);
                console.log("Image Thumbnails succeeded !");
                
                if(currentDownloadVideos[`${fileName}`]["compression"] === undefined || currentDownloadVideos[`${fileName}`]["compression"]["download-status"] === "completed") { 
                  delete currentDownloadVideos[`${fileName}`]; 
                } else  {  
                  currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] = "completed"; 
                } 
        
                const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
                FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);
    
              })
              .on("error", (error) => {
                  /// error handling
                  console.log(`Encoding Error: ${error.message}`);
              })
              .outputOptions([`-vf fps=${numberOfImages}/${duration}`])
              .output(`${newFilePath}${fileName}-${imageFileName}%03d${fileType}`)
              .run();
        } else { // duration less or equal to 0
          try { // delete data
            if (videoData[`${fileName}`] || currentDownloadVideos[`${fileName}`]) { // if videodata and currentDownloadVideos is avaiable 
              // delete all data
              deleteAllVideoData(fileName);
            } 
          } catch (error) { // an error has occurred
            console.log(error);
          } 
        }
      }); 
    } else { 
      return "videoDetails dosnet exists";
    }
  } else if(!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg and ffprobe is  unavailable
    currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg and ffprobe unavailable";  
    const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
    FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
  } else if(!FileSystem.existsSync(ffmpeg_path)){ //update ffmpeg is  unavailable
    currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffmpeg unavailable";  
    const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
    FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
  } else if(!FileSystem.existsSync(ffprobe_path)){ //update ffprobe is  unavailable
    currentDownloadVideos[fileName]["thumbnail"]["download-status"] = "ffprobe unavailable";  
    const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
    FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  
  }
}

let fileNameID_Compression;
let stopCompressedVideoFileBool = false; 
// check if video compression is downloading
// if true then update stopCompressedVideoFileBool and fileNameID_Compression variable and return true
// else return false
async function stopCommpressedVideoDownload(fileNameID) { 
  try {
    const videoDetails = await findVideosByID(fileNameID);
    const currentDownloads = await findCurrentDownloadByID(fileNameID); 
    let videoDataCompressionProgress, currentDownloadCompressionProgress; 
    try {
      if (videoDetails["compression"]) {
        videoDataCompressionProgress = videoDetails["compression"]["download"];  
      } else {
        videoDataCompressionProgress = false;
      } 
    } catch (error) {
      videoDataCompressionProgress = false;
    }
    try {
      if (currentDownloads["compression"]) {
        currentDownloadCompressionProgress = currentDownloads["compression"]["download-status"];  
      } else {
        currentDownloadCompressionProgress = false;
      } 
    } catch (error) {
      currentDownloadCompressionProgress = false;
    }

    if (videoDataCompressionProgress) {
      if (videoDataCompressionProgress == "completed") {   
          return false; 
      } else if (currentDownloadCompressionProgress) {
        if (currentDownloadCompressionProgress == "completed"
        || currentDownloadCompressionProgress == "ffmpeg and ffprobe unavailable"
        || currentDownloadCompressionProgress == "ffmpeg unavailable"
        || currentDownloadCompressionProgress == "ffprobe unavailable"
        || currentDownloadCompressionProgress == "unfinished download") {
          return false;
        } else {
          stopCompressedVideoFileBool = true;
          fileNameID_Compression = fileNameID; 
          return true;
        }
      } else {
        stopCompressedVideoFileBool = true;
        fileNameID_Compression = fileNameID; 
        return true;
      }
    } else if (currentDownloadCompressionProgress) {
      if (currentDownloadCompressionProgress == "completed"
      || currentDownloadCompressionProgress == "ffmpeg and ffprobe unavailable"
      || currentDownloadCompressionProgress == "ffmpeg unavailable"
      || currentDownloadCompressionProgress == "ffprobe unavailable"
      || currentDownloadCompressionProgress == "unfinished download") {
        return false;
      } else {
        stopCompressedVideoFileBool = true;
        fileNameID_Compression = fileNameID; 
        return true;
      }
    } else {
      return false;
    } 
  } catch (error) {
    return false;
  }
}

// VP9 video compression - make video size smaller
async function compression_VP9(videofile, newFilePath, fileName) {
  const command = new ffmpeg();
  const fileType = ".webm";
  let duration = 0;
  const videoDetails = await findVideosByID(fileName);
  if (FileSystem.existsSync(ffprobe_path) && FileSystem.existsSync(ffmpeg_path)) { //files exists 
    if (videoDetails !== undefined) {
      ffmpeg.ffprobe(videofile, (error, metadata) => {
        try { // get video duration 
          duration = metadata.format.duration;
        } catch (error) { // duration = 0
          duration = 0;
        } 
        console.log(`${fileName} duration: ${duration}`);
        // if video duration greater then 0
        if (duration > 0) {
          command.addInput(videofile)
            .on("start", function() {
              console.log(`${fileName} compression-download-status: starting`);
            })
            .on("progress", function(data) { 
              videoData[`${fileName}`]["compression"]["download"] = data.percent;       
              const newVideoData = JSON.stringify(videoData, null, 2);
              FileSystem.writeFileSync(data_videos_path, newVideoData);

              if(data.percent < 0){
                currentDownloadVideos[`${fileName}`]["compression"]["download-status"] = "0.00%";    
                console.log(`${fileName} compression-download-status: 0.00%`);
              } else if(data.percent == "undefined"){
                currentDownloadVideos[`${fileName}`]["compression"]["download-status"] = `${data.percent}%`;    
                console.log(`${fileName} compression-download-status: ${data.percent}%`);
              } else{
                try { 
                  currentDownloadVideos[`${fileName}`]["compression"]["download-status"] = `${data.percent.toFixed(2)}%`; 
                  console.log(`${fileName} compression-download-status: ${data.percent.toFixed(2)}%`);
                } catch (error) {
                  currentDownloadVideos[`${fileName}`]["compression"]["download-status"] = `${data.percent}%`; 
                  console.log(`${fileName} compression-download-status: ${data.percent}%`);
                }
              }  

              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);

              // stop video compression
              if (stopCompressedVideoFileBool === true  && fileNameID_Compression == fileName) {
                try {
                  SIGKILL(command);
                  stopCompressedVideoFileBool = false; 
                } catch (e) {
                  stopCompressedVideoFileBool = false; 
                }
              }
            })
            .on("end", function() {
              /// encoding is complete
              console.log(`${fileName} compression-download-status: complete`); 
              try {
                if (availableVideos[`${fileName}`]["info"]) {
                  availableVideos[`${fileName}`]["info"]["videoLink"].compressdSrc = `/compressed/${fileName}`;  
                  availableVideos[`${fileName}`]["info"]["videoLink"].compressedType = "video/webm";
                } else{
                  availableVideos[`${fileName}`] = {
                    info:{
                      title: fileName,
                      videoLink: {
                        src : `/video/${fileName}`,
                        type : "video/mp4",
                        compressdSrc : `/compressed/${fileName}`,
                        compressedType : "video/webm"
                      }
                    }
                  };
                }              
              } catch (error) {
                availableVideos[`${fileName}`] = {
                  info:{
                    title: fileName,
                    videoLink: {
                      src : `/video/${fileName}`,
                      type : "video/mp4",
                      compressdSrc : `/compressed/${fileName}`,
                      compressedType : "video/webm"
                    }
                  }
                };
              } 
              const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
              FileSystem.writeFileSync(available_videos_path, newAvailableVideo);
          
              videoData[`${fileName}`]["compression"] = { 
                path: newFilePath+fileName+fileType,
                videoType: "video/webm",
                download: "completed"
              };           
              const newVideoData = JSON.stringify(videoData, null, 2);
              FileSystem.writeFileSync(data_videos_path, newVideoData);

              if(currentDownloadVideos[`${fileName}`]["thumbnail"] === undefined || currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] === "completed") { 
                delete currentDownloadVideos[`${fileName}`]; 
              } else  {  
                currentDownloadVideos[`${fileName}`]["compression"]["download-status"] = "completed"; 
              }            
              const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
              FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);
            })
            .on("error", function(error) {
              /// error handling
              if (error.message === "ffmpeg was killed with signal SIGKILL") {
                if (videoData[`${fileName}`]["compression"]) {              
                  videoData[`${fileName}`]["compression"]["download"] = "ffmpeg was killed with signal SIGKILL";   
                  const newVideoData = JSON.stringify(videoData, null, 2);
                  FileSystem.writeFileSync(data_videos_path, newVideoData);
                }  
                if (currentDownloadVideos[`${fileName}`]["compression"]) {         
                  currentDownloadVideos[`${fileName}`]["compression"]["download-status"] = "ffmpeg was killed with signal SIGKILL"; 
                  const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
                  FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);
                } 
              }
            })
            // https://developers.google.com/media/vp9/settings/vod/
            .outputOptions(["-c:v libvpx-vp9", "-crf 32", "-b:v 2000k"])
            .output(`${newFilePath}${fileName}${fileType}`)
            .run(); 
        } else { 
          try { // duration less or equal to 0
            if (videoData[`${fileName}`] || currentDownloadVideos[`${fileName}`]) { // if videodata and currentDownloadVideos is avaiable 
              // delete all data
              deleteAllVideoData(fileName);
            } 
          } catch (error) { // an error has occurred
            console.log(error); 
          } 
        }
      }); 
    } else {  
      return "videoDetails dosnet exists";
    } 
  } else if (!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)) { //files dont exists
    console.log("Encoding Error: Cannot find ffmpeg and ffprobe in WatchVideoByLink directory"); 
  } else if (!FileSystem.existsSync(ffmpeg_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffmpeg in WatchVideoByLink directory"); 
  } else if (!FileSystem.existsSync(ffprobe_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffprobe in WatchVideoByLink directory"); 
  }
}

// set timeout for a set amount of time in ms
function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

// check if video compression is downloading before data deletion 
async function checkIfCompressedVideoIsDownloadingBeforeVideoDataDeletion(videoID, folderIDPath) {
  // stop video compression
  const stopCommpressedVideoDownloadBool = await stopCommpressedVideoDownload(videoID); 
  if (stopCommpressedVideoDownloadBool) { 
    await checkCompressedVideoDownloadStatus(videoID);
    return deleteAllVideoData(videoID, folderIDPath); 
  } else { // compressed video isn't downloading 
    return deleteAllVideoData(videoID, folderIDPath); 
  }
}

// try untill compressed video gets killed with signal SIGKILL or finnishes download 
async function checkCompressedVideoDownloadStatus(videoID) {
  try {
    if (videoData[videoID]["compression"]) {
      if (videoData[videoID]["compression"]["download"] == "completed" 
      || videoData[videoID]["compression"]["download"] == "ffmpeg was killed with signal SIGKILL") {  
        return "start deletion"; 
      } else if(currentDownloadVideos[videoID]["compression"]){
        if (currentDownloadVideos[videoID]["compression"]["download-status"] == "completed"
        || currentDownloadVideos[fileNameID]["compression"]["download-status"] == "ffmpeg was killed with signal SIGKILL") {  
          return "start deletion";    
        } 
      } else {  
        await sleep(200);
        return checkCompressedVideoDownloadStatus(videoID); 
      }
    } else { // stop interval and start data deletion
      return "start deletion"; 
    }
  } catch (error) { 
    await sleep(200);
    return checkCompressedVideoDownloadStatus(videoID); 
  } 
}

// deletes all video id data
function deleteAllVideoData(fileName, folderIDPath) {
  try {   
    if (fileName.includes("folder-")) {  
      if (
        (folderIDPath === undefined || folderIDPath.length === 0)
        && availableVideos.hasOwnProperty(fileName)) // eslint-disable-line
      { 
        const availableVideosFolderIDPath = "";  
        deleteAllFolderData(availableVideosFolderIDPath.concat("availableVideos[\"",fileName,"\"].content"), fileName, fileName); 
      } else {  
        const availableVideosFolderIDPath = folderPathString(folderIDPath); 
        deleteAllFolderData(availableVideosFolderIDPath.concat("[\"",fileName,"\"].content"), fileName, fileName);
      }    
    } else { 
      // delete currentDownloadVideos by id if exist 
      deleteSpecifiedCurrentDownloadVideosData(fileName);
      // delete videoData by id if exist 
      deleteSpecifiedVideoData(fileName); 
      // delete availableVideos by id if exist  
      deleteSpecifiedAvailableVideosData(fileName, folderIDPath);
      // delete specified video by id if exist  
      deleteSpecifiedVideo(fileName); 
    }
    return `deleted-${fileName}-permanently`;
  } catch (error) {
    return `failed-to-delete-${fileName}-permanently`;
  }
}

// delete all folder content plus selected folder
// 1. If folder is detected go in, Delete all video data found 
// 2. if folder is empty delete folder and go up one folder, if folder contained folders repeat 1 
// 3. stop when current folder id reached starting folder id
function deleteAllFolderData(availableVideosFolderIDPath, currentFolderID, startingFolderID) {  
  if (Object.keys(eval(availableVideosFolderIDPath)).length == 0) {
    const newAvailableVideosFolderPath = availableVideosFolderIDPath.replace(`["${currentFolderID}"].content`, "");  
    const insideFolderID = eval(newAvailableVideosFolderPath)[currentFolderID].info["inside-folder"]; 
    deleteSpecifiedAvailableVideosDataByCustomPath(currentFolderID, newAvailableVideosFolderPath); 
    if (currentFolderID !== startingFolderID && insideFolderID !== "folder-main" &&  Object.keys(eval(newAvailableVideosFolderPath)).length == 0) {
      deleteAllFolderData(newAvailableVideosFolderPath, insideFolderID, startingFolderID); 
    } 
  } else {
    Object.keys(eval(availableVideosFolderIDPath)).forEach(function(fileName, i, array) {
      if (fileName.includes("folder-")) {
        deleteAllFolderData(availableVideosFolderIDPath.concat("[\"",fileName,"\"].content"), fileName, startingFolderID); 
      } else { 
        // delete specified video by id from availableVideos
        deleteSpecifiedAvailableVideosDataByCustomPath(fileName, availableVideosFolderIDPath); 
        // delete currentDownloadVideos by id if exist 
        deleteSpecifiedCurrentDownloadVideosData(fileName);
        // delete videoData by id if exist 
        deleteSpecifiedVideoData(fileName); 
        // delete specified video by id if exist  
        deleteSpecifiedVideo(fileName); 
      }
      if (i == array.length - 1) {
        try {
          if (Object.keys(eval(availableVideosFolderIDPath)).length == 0) {    
            const newPath = availableVideosFolderIDPath.replace(`["${currentFolderID}"].content`, "");
            const insideFolderID = eval(newPath)[currentFolderID].info["inside-folder"]; 
            deleteSpecifiedAvailableVideosDataByCustomPath(currentFolderID, newPath); 
            if (currentFolderID !== startingFolderID && insideFolderID !== "folder-main" &&  Object.keys(eval(newPath)).length == 0) { 
              deleteAllFolderData(newPath, insideFolderID, startingFolderID); 
            } 
          } 
        } catch (error) {
          return error;
        }
      }
    });
  }
}
 
// delete currentDownloadVideos by id if exist
function deleteSpecifiedCurrentDownloadVideosData(fileName) {
  if(currentDownloadVideos.hasOwnProperty(fileName)){  // eslint-disable-line
    delete currentDownloadVideos[`${fileName}`]; 
    const deleteCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
    FileSystem.writeFileSync(current_download_videos_path, deleteCurrentDownloadVideos);
  }
}

// delete videoData by id if exist
function deleteSpecifiedVideoData(fileName) {   
  if (videoData.hasOwnProperty(fileName)) { // eslint-disable-line
    delete videoData[`${fileName}`]; 
    const deleteVideoData = JSON.stringify(videoData, null, 2);
    FileSystem.writeFileSync(data_videos_path, deleteVideoData);
  }  
}

// delete availableVideos from server if exist  
function deleteSpecifiedAvailableVideosData(fileName, folderIDPath, availableVideosFolderIDPath) {  
  try { 
    if (availableVideosFolderIDPath !== undefined) {
      delete eval(availableVideosFolderIDPath)[fileName]; 
      const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
      FileSystem.writeFileSync(available_videos_path, newAvailableVideo); 
    } else if (folderIDPath === undefined || folderIDPath.length === 0) { 
      if (availableVideos.hasOwnProperty(fileName)) { // eslint-disable-line
        delete availableVideos[fileName]; 
        const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
        FileSystem.writeFileSync(available_videos_path, newAvailableVideo); 
      } 
    } else {  
      const availableVideosFolderIDPath = folderPathString(folderIDPath);   
      delete eval(availableVideosFolderIDPath)[fileName];  
      const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
      FileSystem.writeFileSync(available_videos_path, newAvailableVideo); 
    }   
  } catch (error) {
    if (availableVideos.hasOwnProperty(fileName)) { // eslint-disable-line
      delete availableVideos[fileName]; 
      const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
      FileSystem.writeFileSync(available_videos_path, newAvailableVideo); 
    } 
  }
}

// delete specified video by id from availableVideos
function deleteSpecifiedAvailableVideosDataByCustomPath(fileName, availableVideosFolderIDPath) {  
  delete eval(availableVideosFolderIDPath)[fileName]; 
  const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
  FileSystem.writeFileSync(available_videos_path, newAvailableVideo); 
}

// delete specified video from server if exist  
function deleteSpecifiedVideo(fileName) {  
  // check if folder exists
  if(FileSystem.existsSync(`./media/video/${fileName}`)){ 
    FileSystem.readdir(`./media/video/${fileName}`, (err, files) => {
      if (err) throw err;
      if (!files.length) {
        // directory empty, delete folder
        FileSystem.rmdir(`./media/video/${fileName}`, (err) => {
          if (err) throw err; 
          return `video-id-${fileName}-data-permanently-deleted`;
        });
      } else {
        // folder not empty
        FileSystem.readdir(`./media/video/${fileName}`, (err, files) => {
          if (err) throw err;
          let completedCount = 0;
          for (const file of files) {
            completedCount += 1;
            FileSystem.rename(`./media/video/${fileName}/${file}`, `media/deleted-videos/deleted-${file}`, (err) => {
              if (err) throw err;
              // delete the video
              FileSystem.unlink(`media/deleted-videos/deleted-${file}`, (err) => {
                if (err) throw err;
                if (files.length == completedCount) { // if file length is same as completedCount then delete folder
                  // reset completedCount
                  completedCount = 0;
                  // delete folder
                  FileSystem.rmdir(`./media/video/${fileName}`, (err) => {
                    if (err) throw err;  
                    return `video-id-${fileName}-data-permanently-deleted`;
                  });
                }
              });
            });
          }
        });
      }
    });
  } else{ // folder dosent exit 
    return `video-id-${fileName}-data-permanently-deleted`;
  }
}

// using youtube-dl it converts url link to video type and video src
async function getVideoLinkFromUrl(req, res) {
  try {
    const url = req.body.url;
    // Optional arguments passed to youtube-dl.
    const options = ["--skip-download"];
    youtubedl.getInfo(url, options, function(err, info) {
     // info.protocol
     // protocol: https or http == video/mp4
     // protocol: http_dash_segments == application/dash+xml
     // protocol: m3u8 == application/x-mpegURL
     let videoFileFormat, videoUrlLink;
     if (info !== undefined) {
       if (info.protocol == "https" || info.protocol == "http") {
         videoUrlLink = info.url;
         videoFileFormat = "video/mp4";
       } else if (info.protocol == "m3u8") {
         videoUrlLink = info.url;
         videoFileFormat = "application/x-mpegURL";
       } else if (info.protocol == "http_dash_segments") {
         videoUrlLink = info.url;
         videoFileFormat = "application/dash+xml";
       } else {
         videoUrlLink = "not-supported";
         videoFileFormat = "not-supported";
       }
     } else {
       videoUrlLink = "not-supported";
       videoFileFormat = "not-supported";
     }
     const videoDataFromUrl = {
       input_url_link: url,
       video_url: videoUrlLink,
       video_file_format: videoFileFormat
     };
     if (videoUrlLink !== "not-supported" || videoFileFormat !== "not-supported") {
       res.json(videoDataFromUrl);
     } else {
       res.json("failed-get-video-url-from-provided-url");
     }
    });
  } catch (e) {
    res.json("failed-get-video-url-from-provided-url");
  }
}

// get available video details by folder path
function folderPathString(folderIDPath) {
  let folderPathString = "";
  for (let i = 0; i < folderIDPath.length; i++) {  
    if (i === 0) {
      folderPathString = folderPathString.concat("availableVideos[\"",folderIDPath[i],"\"].content");
    } else {
      folderPathString = folderPathString.concat("[\"",folderIDPath[i],"\"].content");
    } 
  }  
  return folderPathString;
}

// create Folder at availableVideos
function createFolder(folderIDPath, folderTitle) { 
  const newfolderID = `folder-${uuidv4()}`;  
  if (folderIDPath === undefined || folderIDPath.length == 0) { 
    availableVideos[newfolderID] = {
      "info": {
        "title": folderTitle, 
        "inside-folder": "folder-main"
      },
      "content": {}
    };    
  }else { 
    const availableVideosFolderIDPath = folderPathString(folderIDPath);  
    eval(availableVideosFolderIDPath)[newfolderID] = {
      "info": {
        "title": folderTitle, 
        "inside-folder": folderIDPath[[folderIDPath.length - 1] ]
      },
      "content": {}
    }; 
  }  
  const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
  FileSystem.writeFileSync(available_videos_path, newAvailableVideo); 
  return {
    "folderID": newfolderID,
    "availableVideos": availableVideos
  };
}

// input selected element id out of folder element at availableVideos
function inputSelectedIDOutOfFolderID(selectedID, folderID, folderIDPath) {  
  const fromFolderID = [...folderIDPath];
  const tooFolderID = [...folderIDPath];
  if (folderID == "folder-main") {
    tooFolderID.length = 0;
  } else {
    const fodlerIDIndex = tooFolderID.indexOf(folderID); 
    tooFolderID.splice(fodlerIDIndex+1, 9e9);  
    tooFolderID.length = fodlerIDIndex+1; 
  }  
  if (tooFolderID === undefined || tooFolderID.length == 0) {  
    const availableVideosFromFolderIDPath = folderPathString(fromFolderID);   
    availableVideos[selectedID] = eval(availableVideosFromFolderIDPath)[selectedID]; 
    delete eval(availableVideosFromFolderIDPath)[selectedID]; 
    if (selectedID.includes("folder-")) { 
      availableVideos[selectedID].info["inside-folder"] = folderID; 
    }   
  }else {     
    const availableVideosFromFolderIDPath = folderPathString(fromFolderID);  
    const availableVideosTooFolderIDPath = folderPathString(tooFolderID); 
    eval(availableVideosTooFolderIDPath)[selectedID] = eval(availableVideosFromFolderIDPath)[selectedID]; 
    delete eval(availableVideosFromFolderIDPath)[selectedID]; 
    if (selectedID.includes("folder-")) { 
      eval(availableVideosTooFolderIDPath)[selectedID].info["inside-folder"] = folderID; 
    }  
  } 
  const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
  FileSystem.writeFileSync(available_videos_path, newAvailableVideo);
  return availableVideos;
}

// input selected element into folder element at availableVideos
function inputSelectedIDIntoFolderID(selectedID, folderID, folderIDPath) {   
  if (folderIDPath === undefined || folderIDPath.length == 0) { 
    availableVideos[folderID].content[`${selectedID}`] = availableVideos[selectedID];
    delete availableVideos[selectedID]; 
    if (selectedID.includes("folder-")) {
      availableVideos[folderID].content[`${selectedID}`].info["inside-folder"] = folderID;
    }    
  }else {  
    const availableVideosFolderIDPath = folderPathString(folderIDPath);
    eval(availableVideosFolderIDPath)[folderID].content[selectedID] = eval(availableVideosFolderIDPath)[selectedID]; 
    delete eval(availableVideosFolderIDPath)[selectedID]; 
    if (selectedID.includes("folder-")) {
      eval(availableVideosFolderIDPath)[folderID].content[selectedID].info["inside-folder"] = folderID;
    }    
  } 
  const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
  FileSystem.writeFileSync(available_videos_path, newAvailableVideo);
  return availableVideos;
}

// update selected available video details orientation
async function updateRearangedAvailableVideoDetails(selectedID, targetID, folderIDPath) {     
  if (folderIDPath === undefined || folderIDPath.length == 0) { 
    const selectedIDIndex = Object.keys(availableVideos).indexOf(selectedID); 
    const targetIDIndex = Object.keys(availableVideos).indexOf(targetID);  
    // turn availableVideos into an array
    const availableVideosArray = Object.entries(availableVideos);    
    // remove `selectedIDIndex` item and store it
    const removedItem = availableVideosArray.splice(selectedIDIndex, 1)[0];
    // insert stored item into position `targetIDIndex`
    availableVideosArray.splice(targetIDIndex, 0, removedItem);
    // turn availableVideosArray back into an object
    availableVideos = Object.fromEntries(availableVideosArray);    
  }else { 
    const availableVideosFolderIDPath = folderPathString(folderIDPath); 
    const selectedIDIndex = Object.keys(eval(availableVideosFolderIDPath)).indexOf(selectedID); 
    const targetIDIndex = Object.keys(eval(availableVideosFolderIDPath)).indexOf(targetID);  
    // turn availableVideos into an array
    const availableVideosArray = Object.entries(eval(availableVideosFolderIDPath));    
    // remove `selectedIDIndex` item and store it
    const removedItem = availableVideosArray.splice(selectedIDIndex, 1)[0];
    // insert stored item into position `targetIDIndex`
    availableVideosArray.splice(targetIDIndex, 0, removedItem);
    // turn availableVideosArray back into an object  
    eval(availableVideosFolderIDPath.slice(0, -8)).content = Object.fromEntries(availableVideosArray);  
  }  
  const newAvailableVideo = JSON.stringify(availableVideos, null, 2);
  FileSystem.writeFileSync(available_videos_path, newAvailableVideo);  
  return {
    "message": "availableVideos updated successfully",
    "availableVideos": availableVideos
  };
}

// change title of video  
async function changeVideoTitle(videoID, newVideoTitle, folderIDPath) { 
  if (folderIDPath === undefined || folderIDPath.length === 0) { 
    // check if videoid is valid
    const videoDetails = await findAvailableVideosByID(videoID);
    // if video dosent exist redirect to home page
    if (videoDetails !== undefined && 
      newVideoTitle !== undefined &&
      typeof newVideoTitle == "string") { 
      try { 
        availableVideos[videoID]["info"]["title"] = newVideoTitle;  
        const newAvailableVideos = JSON.stringify(availableVideos, null, 2);
        FileSystem.writeFileSync(available_videos_path, newAvailableVideos);  
        return {
          "message": "video-title-changed",
          "availableVideos": availableVideos
        };
      } catch (e) { 
        return {
          "message": "failed-to-change-video-title"
        };  
      }
    } else  { 
      return {
        "message": "failed-to-change-video-title"
      };  
    }
  } else {  
    const availableVideosFolderIDPath = folderPathString(folderIDPath);    
    eval(availableVideosFolderIDPath)[videoID]["info"]["title"] = newVideoTitle;  
    const newAvailableVideos = JSON.stringify(availableVideos, null, 2);
    FileSystem.writeFileSync(available_videos_path, newAvailableVideos);   
    return {
      "message": "video-title-changed",
      "availableVideos": availableVideos
    };
  } 
}

// upload video file to ./media/video then downoald file
function uploadVideoFile(req, res) {
  if(req.files) {
    const file = req.files.file;
    const filename = uuidv4();
    const fileMimeType = req.files.file.mimetype; 
    if(req.files.file.truncated){  // file size greater then limit
      res.json("video-size-over-size-limit"); 
    } else { // file size smaller then limit
      file.mv(`./media/video/${filename}.mp4`, function(err){
        if (err) { 
          res.send("error-has-accured");
        } else { 
          downloadUploadedVideo(`./media/video/${filename}.mp4`, filename, fileMimeType, res);
        }
      });
    }
  }
}

// download full video
async function downloadUploadedVideo(videofile, fileName, fileMimeType, res) {
  const command = new ffmpeg(); 
  const compressUploadedVideo = checkIfVideoCompress("downloadUploadedVideo");
  const filepath = "media/video/"; 
  const fileType = ".mp4";
  const newFilePath = `${filepath}${fileName}/`;
  const path = newFilePath+fileName+fileType; 
  const videoDetails = await findVideosByID(fileName);
  if (FileSystem.existsSync(ffprobe_path) && FileSystem.existsSync(ffmpeg_path)) { //files exists
    if (videoDetails == undefined) {
      if (!FileSystem.existsSync(`${filepath}${fileName}/`)){
          FileSystem.mkdirSync(`${filepath}${fileName}/`);
      }
      command.addInput(videofile)
        .on("start", function() {  
          res.json("downloading-uploaded-video");
          videoData[`${fileName}`] = {
            video:{
              originalVideoSrc : "unknown",
              originalVideoType : fileMimeType,
              download : "starting uploaded video download"
            }
          };
          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);
          
          if (compressUploadedVideo) { // addition of compress video data
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting uploaded video download"
              },
              compression : { 
                "download-status" : "waiting for video"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          } else {
            currentDownloadVideos[`${fileName}`] = {
              video : { 
                "download-status" : "starting uploaded video download"
              },
              thumbnail : { 
                "download-status" : "waiting for video"
              } 
            };
          }
          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos); 

        })
        .on("progress", function(data) { 
          console.log("progress", data);

          videoData[`${fileName}`]["video"]["download"] = data.percent; 

          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);

          if(data.percent < 0){ 
            currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  "0.00%";  
          }else{
            try {
              currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  `${data.percent.toFixed(2)}%`;  
            } catch (error) {
              currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  `${data.percent}%`;  
            }
          }           
          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos); 
        })
        .on("end", function() { 
          /// encoding is complete, so callback or move on at this point
          if (compressUploadedVideo) { // addition of compress video data
            videoData[`${fileName}`] = {
              video: {
                originalVideoSrc : videofile,
                originalVideoType: fileMimeType,
                path: newFilePath+fileName+fileType,
                videoType : "video/mp4",
                download : "completed",
              },
              compression : {
                download: "starting"
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            };
          } else {
            videoData[`${fileName}`] = {
              video: {
                originalVideoSrc : videofile,
                originalVideoType: fileMimeType,
                path: newFilePath+fileName+fileType,
                videoType : "video/mp4",
                download : "completed",
              },
              thumbnail: {
                path: {},
                download: "starting"
              }
            }; 
          }
          const newVideoData = JSON.stringify(videoData, null, 2);
          FileSystem.writeFileSync(data_videos_path, newVideoData);

          currentDownloadVideos[`${fileName}`]["video"]["download-status"] =  "completed";
          if (compressUploadedVideo) { // addition of compress video data
            currentDownloadVideos[`${fileName}`]["compression"]["download-status"] =  "starting video compression";                 
          }
          currentDownloadVideos[`${fileName}`]["thumbnail"]["download-status"] =  "starting thumbnail download";   

          const newCurrentDownloadVideos = JSON.stringify(currentDownloadVideos, null, 2);
          FileSystem.writeFileSync(current_download_videos_path, newCurrentDownloadVideos);  

          console.log("Video Transcoding succeeded !");
          if (compressUploadedVideo) { // compress video
            compression_VP9(path, newFilePath, fileName);
          }
          createThumbnail(path, newFilePath, fileName); 

          if (FileSystem.existsSync(videofile)) { 
            // move video file to deleted-videos folder
            // if video is active it will make the video not viewable if someone wants to view it
            FileSystem.rename(videofile, `media/deleted-videos/deleted-${fileName}.mp4`,  (err) => {
              if (err) throw err;  
              console.log("moved video thats going to be deleted");
              //  delete the video
              FileSystem.unlink(`media/deleted-videos/deleted-${fileName}.mp4`, (err) => {
                if (err) throw err;
                console.log("deleted video");
              });  
            });
          } 
        })
        .on("error", function(error) {
          /// error handling
          console.log("[streamVideo.js-downloadUploadedVideo]", `Encoding Error: ${error.message}`);
          if (error.message === "Cannot find ffmpeg") {
            // delete original video if exists
            if (FileSystem.existsSync(videofile)) { 
              // move video file to deleted-videos folder
              // if video is active it will make the video not viewable if someone wants to view it
              FileSystem.rename(videofile, `media/deleted-videos/deleted-${fileName}.mp4`,  (err) => {
                if (err) throw err;  
                console.log("moved video thats going to be deleted");
                //  delete the video
                FileSystem.unlink(`media/deleted-videos/deleted-${fileName}.mp4`, (err) => {
                  if (err) throw err;
                  console.log("deleted video");
                });  
              });
            }
            // delete created folder
            FileSystem.rmdir(`${newFilePath}`, { recursive: true }, (err) => {
              if (err) throw err;
              console.log(`\n removed ${newFilePath} dir \n`);
            });
            res.json("Cannot-find-ffmpeg");
          } else {
            // delete original video if exists
            if (FileSystem.existsSync(videofile)) { 
              // move video file to deleted-videos folder
              // if video is active it will make the video not viewable if someone wants to view it
              FileSystem.rename(videofile, `media/deleted-videos/deleted-${fileName}.mp4`,  (err) => {
                if (err) throw err;  
                console.log("moved video thats going to be deleted");
                //  delete the video
                FileSystem.unlink(`media/deleted-videos/deleted-${fileName}.mp4`, (err) => {
                  if (err) throw err;
                  console.log("deleted video");
                });  
              });
            }
            // there could be diffrent types of errors that exists and some may contain content in the newly created path
            // due to the uncertainty of what errors may happen i have decided to not delete the newly created path untill further notice
            res.json("ffmpeg-failed");
          }
        })
        .outputOptions(["-s hd720", "-bsf:a aac_adtstoasc",  "-vsync 1", "-vcodec copy", "-c copy", "-crf 50"])
        .output(`${newFilePath}${fileName}${fileType}`)
        .run();
      } else { 
        console.log("videoDetails already exists");
      }   
  } else if (!FileSystem.existsSync(ffprobe_path) && !FileSystem.existsSync(ffmpeg_path)) { //files dont exists
    console.log("Encoding Error: Cannot find ffmpeg and ffprobe in WatchVideoByLink directory");
    if (FileSystem.existsSync(videofile)) { 
      // move video file to deleted-videos folder
      // if video is active it will make the video not viewable if someone wants to view it
      FileSystem.rename(videofile, `media/deleted-videos/deleted-${fileName}.mp4`,  (err) => {
        if (err) throw err;  
        console.log("moved video thats going to be deleted");
        //  delete the video
        FileSystem.unlink(`media/deleted-videos/deleted-${fileName}.mp4`, (err) => {
          if (err) throw err;
          console.log("deleted video");
        });  
      });
    } 
    res.json("Cannot-find-ffmpeg-ffprobe");
  } else if (!FileSystem.existsSync(ffmpeg_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffmpeg in WatchVideoByLink directory");
    if (FileSystem.existsSync(videofile)) { 
      // move video file to deleted-videos folder
      // if video is active it will make the video not viewable if someone wants to view it
      FileSystem.rename(videofile, `media/deleted-videos/deleted-${fileName}.mp4`,  (err) => {
        if (err) throw err;  
        console.log("moved video thats going to be deleted");
        //  delete the video
        FileSystem.unlink(`media/deleted-videos/deleted-${fileName}.mp4`, (err) => {
          if (err) throw err;
          console.log("deleted video");
        });  
      });
    } 
    res.json("Cannot-find-ffmpeg");
  } else if (!FileSystem.existsSync(ffprobe_path)) { //file dosent exists
    console.log("Encoding Error: Cannot find ffprobe in WatchVideoByLink directory");
    if (FileSystem.existsSync(videofile)) { 
      // move video file to deleted-videos folder
      // if video is active it will make the video not viewable if someone wants to view it
      FileSystem.rename(videofile, `media/deleted-videos/deleted-${fileName}.mp4`,  (err) => {
        if (err) throw err;  
        console.log("moved video thats going to be deleted");
        //  delete the video
        FileSystem.unlink(`media/deleted-videos/deleted-${fileName}.mp4`, (err) => {
          if (err) throw err;
          console.log("deleted video");
        });  
      });
    } 
    res.json("Cannot-find-ffprobe");
  }
}

module.exports = { // export modules
  update_user_settings_path,
  update_data_videos_path,
  update_available_videos_path,
  update_current_download_videos_path,
  streamVideo,
  updateVideoPlayerVolume,
  updateCompressVideoDownload,
  checkIfVideoSrcOriginalPathExits,
  checkIfVideoCompress,
  stopCommpressedVideoDownload,
  stopDownloadVideoStream,
  downloadVideoStream,
  downloadVideo,
  trimVideo,
  updateVideoDataByID,
  deleteVideoDataByID,
  findVideosByID,
  resetVideoData,
  getAllVideoData,
  getAllAvailableVideos,
  resetAvailableVideos,
  findAvailableVideosByID,
  updateAvailableVideosByID,
  deleteAvailableVideosByID,
  update_ffprobe_path,
  update_ffmpeg_path, 
  update_untrunc_path,
  update_working_video_path,
  streamThumbnail,
  deleteAllVideoData,
  checkIfCompressedVideoIsDownloadingBeforeVideoDataDeletion,
  getVideoLinkFromUrl,
  getVideoPlayerSettings,
  currentDownloads,
  resetCurrentDownloadVideos,
  findCurrentDownloadByID,
  updateCurrentDownloadByID,
  deleteCurrentDownloadByID,
  cheackForAvailabeUnFinishedVideoDownloads,
  completeUnfinnishedVideoDownload,
  createFolder,
  inputSelectedIDOutOfFolderID,
  inputSelectedIDIntoFolderID,
  updateRearangedAvailableVideoDetails,
  changeVideoTitle,
  uploadVideoFile
};
