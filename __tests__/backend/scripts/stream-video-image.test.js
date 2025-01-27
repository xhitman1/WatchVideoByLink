const streamVideoImage = require("../../../backend/scripts/stream-video-image");
const dataVideos = require("../../../backend/scripts/data-videos");
const dataVideos_json_path = "__tests__/data/data-videos.test.json";
const { v4: uuidv4 } = require("uuid");

beforeAll(() => {    
    dataVideos.update_data_videos_path(dataVideos_json_path); 
    dataVideos.resetVideoData();
});

afterEach(() => {    
    dataVideos.resetVideoData();
}); 

const dataVideos_data = {
    "video": {
      "originalVideoSrc": "./media/video/video.mp4",
      "originalVideoType": "video/mp4",
      "path": "media/video/video.mp4",
      "videoType": "video/mp4",
      "download": "completed"
    },
    "compression" : {
      "path": "./media/video/video.webm",
      "videoType": "video/webm",
      "download": "completed"
    },
    "thumbnail": {
        "path": {
            "1": "media/video/folder/thumbnail001.jpg"
        },
      "download": "completed"
    }
};

describe("streamVideo", () =>  {    
    it("videoID not string", async () =>  {
        const streamImage = await streamVideoImage.streamVideo();
        expect(streamImage.message).toBe("videoID-not-string");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Invalid videoID", async () =>  {
        const fileName = uuidv4();
        const streamImage = await streamVideoImage.streamVideo(fileName);
        expect(streamImage.message).toBe("invalid-videoID");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Valid videoID, displayCompressedVideo not boolean", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamVideo(fileName);
        expect(streamImage.message).toBe("displayCompressedVideo-not-boolean");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Valid videoID, valid displayCompressedVideo, request undefined", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamVideo(fileName, false);
        expect(streamImage.message).toBe("request-undefined");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Valid videoID, valid displayCompressedVideo, defined request, response undefined", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamVideo(fileName, false, jest.fn());
        expect(streamImage.message).toBe("response-undefined");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Valid videoID, valid displayCompressedVideo false, defined request, defined response", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamVideo(fileName, false, jest.fn(), jest.fn());
        expect(streamImage.message).toBe("failed-to-stream-video");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Valid videoID, valid displayCompressedVideo true, defined request, defined response", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamVideo(fileName, true, jest.fn(), jest.fn());
        expect(streamImage.message).toBe("failed-to-stream-video");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });
}); 

describe("streamThumbnail", () =>  {  
    it("videoID not string", async () =>  {
        const streamImage = await streamVideoImage.streamThumbnail();
        expect(streamImage.message).toBe("videoID-not-string");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Invalid videoID", async () =>  {
        const fileName = uuidv4();
        const streamImage = await streamVideoImage.streamThumbnail(fileName);
        expect(streamImage.message).toBe("invalid-videoID");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Valid videoID, thumbnailID not string", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], {});
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject({});   

        const streamImage = await streamVideoImage.streamThumbnail(fileName);
        expect(streamImage.message).toBe("thumbnailID-not-number");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });

    it("Valid videoID, Invalid thumbnailID", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamThumbnail(fileName, 2020);
        expect(streamImage.message).toBe("invalid-thumbnailID");  
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);  
    });


    it("Valid videoID, Valid thumbnailID, response undefined", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamThumbnail(fileName, 1);
        expect(streamImage.message).toBe("response-undefined");
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);   
    });
    
    it("Valid videoID, Valid thumbnailID, Invalid response", async () =>  {
        const fileName = uuidv4();
        const updateVideoData = dataVideos.updateVideoData([fileName], dataVideos_data);
        expect(updateVideoData).toBe("updateVideoData");  
        const get_data = dataVideos.getVideoData([fileName]);
        expect(get_data).toMatchObject(dataVideos_data);   

        const streamImage = await streamVideoImage.streamThumbnail(fileName, 1, jest.fn());
        expect(streamImage.message).toBe("failed-to-stream-image");
        expect(streamImage.redirect).toBe("/");  
        expect(streamImage.status).toBe(404);   
    });
}); 