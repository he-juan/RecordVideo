
/************************************正文左边按钮******************/
let videoBtn = document.getElementsByClassName("toggleVideoButton")[0]
let shareBtn = document.getElementsByClassName("toggleShareButton")[0]
let localVideoBtn = document.getElementsByClassName("localVideoButton")[0]
let muteBtn = document.getElementsByClassName("toggleMuteButton")[0]

/******************************正文中间按钮********************/
let areaVideoArea = document.getElementsByClassName("areaVideoBtn")[0]
let videoArea = document.getElementsByClassName("videoBtn")[0]
let audioArea = document.getElementsByClassName("audioBtn")[0]

/***************************正文右边按钮***********************/
let startRecordBtn = document.getElementsByClassName("startRecord")[0]
let pauseRecordBtn = document.getElementsByClassName("pauseRecord")[0]
let resumeRecordBtn = document.getElementsByClassName("resumeRecord")[0]
let stopRecordBtn = document.getElementsByClassName("stopRecord")[0]
let restartRecordBtn = document.getElementsByClassName("restartRecord")[0]
let downloadBtn = document.getElementsByClassName("download")[0]


/*****************************************区域录制元素************************************************/
let shareVideo = document.getElementsByClassName("shareVideo")[0]
let shareRecord = document.getElementsByClassName("shareRecord")[0]
let shareCanvas = document.getElementsByClassName("shareCanvas")[0]
let ctx = shareCanvas.getContext('2d')


// let mainVideo = document.getElementsByClassName("mainVideo")[0]
// let slidesVideo = document.getElementsByClassName("slidesVideo")[0]
/***************************************音视频录制元素*********************************************/
let mainVideo = document.createElement("video")
let slidesVideo = document.createElement('video')
let vtcanvas = document.getElementsByClassName("videoToCanvas")[0]
let context = vtcanvas.getContext('2d')

let canvasRecord = document.getElementsByClassName("canvasRecord")[0]

/***********************开启、关闭视频、演示的标志*****/
let isOpenVideo = false
let isOpenShareScreen = false
let isUnmute = false
let isRecording = true

/**************** 绘制canvas定时器********************/
let switchTimeOut
let shareTimeOut
let stopTimeout

/** ******************像素匹配位置*******************/
let setX
let setY
let setWidth
let setHeight



areaVideoArea.addEventListener("click",function(){
    window.record.currentRecodeType = "areaVideo"
    toggleVideoBtn.disabled = true
    toggleShareBtn.disabled = false

    Object.keys(localStreams).forEach(function (key) {
        let stream = localStreams[key]
        if (stream) {
            window.record.closeStream(stream)
        }
    })
    getCategory({type: 'shareScreen'})
})
videoArea.addEventListener("click",function () {
    window.record.currentRecodeType = "video"

    toggleVideoBtn.disabled = false
    toggleShareBtn.disabled = false
    toggleMuteBtn.disabled = false

    Object.keys(localStreams).forEach(function (key) {
        let stream = localStreams[key]
        if (stream) {
            window.record.closeStream(stream)
        }
    })

    getCategory({type: 'video'})
})

audioArea.addEventListener("click",function () {
    window.record.currentRecodeType = "audio"

    toggleVideoBtn.disabled = true
    toggleShareBtn.disabled = true

    Object.keys(localStreams).forEach(function (key) {
        let stream = localStreams[key]
        if (stream) {
            window.record.closeStream(stream)
        }
    })
})
// **************************正文左边按钮*****************

let toggleVideoBtn = document.getElementsByClassName("toggleVideoButton")[0]
let toggleShareBtn = document.getElementsByClassName("toggleShareButton")[0]
let toggleMuteBtn = document.getElementsByClassName("toggleMuteButton")[0]


let currentRecodeType = null     // 标记当前录制的类型

// ***************获取设备*****************
let devices ={
    cameras: [],
    microphones:[],
    speakers: []
}
let localStreams = {
    audio:null,
    main:null,
    slides: null,
    localVideo: null,
}
let audioInputSelect = document.querySelector('select#audioSource');
let audioOutputSelect = document.querySelector('select#audioOutput');
let cameraSelect = document.querySelector('select#camera')
let selectors = [audioInputSelect, audioOutputSelect, cameraSelect];

// *************设置设备*********************

/**
 * 获取设备列表
 * @param deviceInfos
 */
function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    const values = selectors.map(select => select.value);
    selectors.forEach(select => {
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
    });
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
            audioInputSelect.appendChild(option);
            devices.microphones.push(deviceInfo)
        } else if (deviceInfo.kind === 'audiooutput') {
            option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
            audioOutputSelect.appendChild(option);
            devices.speakers.push(deviceInfo)
        } else if (deviceInfo.kind === 'videoinput'){
            option.text = deviceInfo.label || `camera ${audioOutputSelect.length + 1}`;
            cameraSelect.appendChild(option);
            devices.cameras.push(deviceInfo)
        } else {
            console.log('Some other kind of source/device: ', deviceInfo);
        }
    }

    console.warn("devices:",devices)
    selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
            select.value = values[selectorIndex];
        }
    });
}

function handleError(error) {
    let errorMessage
    if(error.message && error.name){
        errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
    }else {
        errorMessage = error
    }

    console.warn(errorMessage);
}
/**
 * 获取音频流
 */
function getAudioStream(){
    if (localAudioStream) {
        localAudioStream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioInputSelect.value;
    const constraints = {
        audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
        video: false
    };

    navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
}


function handleSuccess(stream) {
    const audioTracks = stream.getAudioTracks();
    console.log('Got stream with constraints:', constraints);
    console.log('Using audio device: ' + audioTracks[0].label);
    if(getBrowserDetail().browser === 'firefox'){
        audioTracks[0].onended = function () {
            console.warn('track on ended');
        }
    }else {
        stream.oninactive = function() {
            console.log('Stream ended');
        };
    }

    localAudioStream = stream; // make variable available to browser console
    audioEle.srcObject = stream;

    setupNewTrack(stream)
}

function handleError(error) {
    let errorMessage
    if(error.message && error.name){
        errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
    }else {
        errorMessage = error
    }

    console.warn(errorMessage);
}

function changeAudioDestination() {
    const audioDestination = audioOutputSelect.value;
    attachSinkId(audioEle, audioDestination);
}

audioInputSelect.onchange = getAudioStream;
audioOutputSelect.onchange = changeAudioDestination

/******************************************************************************************************************/

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
            .then(() => {
                console.log(`Success, audio output device attached: ${sinkId}`);
            })
            .catch(error => {
                let errorMessage = error;
                if (error.name === 'SecurityError') {
                    errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
                }
                console.error(errorMessage);
                // Jump back to first output device in the list as it's the default.
                audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

/******************************************************************************************************************/

// Attach audio output device to video element using device/sink ID.
function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
            .then(() => {
                console.log(`Success, audio output device attached: ${sinkId}`);
            })
            .catch(error => {
                let errorMessage = error;
                if (error.name === 'SecurityError') {
                    errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
                }
                console.error(errorMessage);
                // Jump back to first output device in the list as it's the default.
                audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

/********************************处理不同类型获取页面逻辑(录制视频、录制音频、区域录制)**********************************************/

//获取页面的每个按钮
let btns = document.getElementsByClassName("btn")　　　　　//获取内容盒子
let contents = document.getElementsByClassName("midContent")

//遍历每个按钮为其添加点击事件
for(let i=0;i < btns.length;i++){
    btns[i].index = i;
    btns[i].onclick = function(){　　　　　　　　　　//对当前点击的按钮赋予active类名及显示当前按钮对应的内容
        for(let j=0;j<btns.length;j++){
            btns[j].className = btns[j].className.replace(' active', '').trim();
            contents[j].className = contents[j].className.replace(' show', '').trim();
        }
        this.className = this.className + ' active';
        contents[this.index].className = contents[this.index].className + ' show';
    };

    if(btns[i].textContent === '区域录制'){
        currentRecodeType = 'areaVideo'
    }else if(btns[i].textContent === '视频录制'){
        currentRecodeType = 'video'
    }else if(btns[i].textContent === '音频录制'){
        currentRecodeType = 'audio'
    }

}



function toggleShareButton(data){
    if(shareBtn.textContent === '开启共享'){
        getCategory(data)
    }else if(shareBtn.textContent === '关闭共享'){
        stopCategory(data)
    }
}


function toggleVideoButton(data){
    console.warn("button toggle")
    if(videoBtn.textContent === '开启视频'){
        getCategory(data)
    }else if(videoBtn.textContent === '关闭视频'){
        stopCategory(data)
    }
}

/**
 * 获取录制类型,
 * 类型 type：如areaVideo、 video 、 audio
 */

function getCategory(data){
    console.warn("start handle getCategory")
    if(!record){
        console.warn('record is not initialized')
        return
    }

    if(!data || !data.type){
        console.warn('invalid parameters')
        return
    }

    if(!localStreams && !localStreams.audio && !localStreams.main && !localStreams.slides && !localStreams.localVideo){
        console.warn('localStreams is  null')
        return
    }
   if(window.record.currentRecodeType === 'areaVideo'){
       if(data.type === 'shareScreen' || data.type === 'localVideo'){
           data.callback = function(event){
               if(event.codeType === 999){
                   console.warn("open shareScreen success",event)

                   shareBtn.textContent = "关闭共享"
                   shareVideo.style.display = 'inline-block'
                   shareCanvas.style.display = 'inline-block'
                   toggleShareBtn.textContent = "关闭共享"

                   toggleShareBtn.style.backgroundColor = "skyBlue"
                   localVideoBtn.style.backgroundColor = "skyBlue"
                   toggleVideoBtn.style.backgroundColor = "#8c818a"

                   localStreams.slides = event.stream
                   shareVideo.srcObject = localStreams.slides
                   shareVideo.onloadedmetadata = function(){
                       shareVideo.play()
                   }

               }else{
                   console.warn("open shareScreen failed")
               }
           }
           openShare(data)
       }
   }else if(window.record.currentRecodeType === 'video'){
       if(data.type === 'video' || data.type === 'localVideo'){
           data.callback = function(event){
               if(event.codeType === 999){
                   console.warn(" open video success:" , event)
                   videoBtn.textContent = "关闭视频"
                   isOpenVideo = true

                   vtcanvas.style.display = 'inline-block'
                   canvasRecord.style.display = "none"
                   toggleShareBtn.style.backgroundColor = "skyblue"
                   localVideoBtn.style.backgroundColor = "skyblue"
                   toggleVideoBtn.style.backgroundColor = "skyblue"

                   // document.body.appendChild(mainVideo);
                   // mainVideo.style.marginLeft = "280px";
                   // mainVideo.style.marginTop = "10px"
                   // mainVideo.style.display = "inline-block"
                   localStreams.main = event.stream
                   mainVideo.srcObject = localStreams.main
                   mainVideo.onloadedmetadata = function(){
                       console.info("mainVideo: "+ mainVideo.videoWidth + " * " + mainVideo.videoHeight)
                       mainVideo.width = mainVideo.videoWidth
                       mainVideo.height = mainVideo.videoHeight
                       mainVideo.play()
                       if(isOpenShareScreen){
                           draw({openShare:true})
                       }else{
                           draw()
                       }
                   }
               }else{
                   console.warn(" open video failed")
               }
           }
           data.deviceId = devices.cameras[0].deviceId
           openVideo(data)
       }else if(data.type === 'shareScreen'){
           data.callback = function(event){
               if(event.codeType === 999){
                   console.warn(" open shareScreen success: ", event)
                   shareBtn.textContent = "关闭共享"
                   isOpenShareScreen = true

                   toggleShareBtn.style.backgroundColor = "skyBlue"
                   localVideoBtn.style.backgroundColor = "skyBlue"
                   toggleVideoBtn.style.backgroundColor = "skyBlue"

                   // document.body.appendChild(slidesVideo);
                   // slidesVideo.style.marginLeft = "480px";
                   // slidesVideo.style.marginTop = "80px"
                   // slidesVideo.style.display = "inline-block"

                   localStreams.slides = event.stream
                   slidesVideo.srcObject = localStreams.slides
                   slidesVideo.onloadedmetadata = function(){
                       console.info("slidesVideo: "+ slidesVideo.videoWidth + " * " + slidesVideo.videoHeight)
                       slidesVideo.width = slidesVideo.videoWidth
                       slidesVideo.height = slidesVideo.videoHeight
                       slidesVideo.play()
                       if(isOpenVideo){
                           draw({openVideo:true})
                       }else{
                           draw()
                       }
                   }
               }else{
                   console.warn(" open shareScreen failed")
               }
           }
           data.deviceId = devices.cameras[0].deviceId
           openShare(data)
       }
   }
}


function stopCategory(data){
    console.warn("stop handle getCategory")
    if(!record){
        console.warn('record is not initialized')
        return
    }

    if(!data || !data.type){
        console.warn('invalid parameters')
        return
    }

    if(!localStreams && (!localStreams.audio || !localStreams.main || !localStreams.slides  ||!localStreams.localVideo)){
        console.warn('localStreams is  not null')
        return
    }
    if(window.record.currentRecodeType === 'areaVideo'){
        if(data.type === 'shareScreen' || data.type === 'localVideo'){
            let data={}
            data.callback = function(event){
                if(event.codeType === 999){
                    console.warn("stop shareScreen success: " , event )
                    toggleShareBtn.textContent = "开启共享"
                    if(localStreams && localStreams.slides){
                        window.record.closeStream(localStreams.slides)

                    }
                    localStreams.slides = null
                    shareVideo.style.display = 'none'
                    shareCanvas.style.display = 'none'
                }else{
                    console.warn("stop shareScreen failed")
                }
            }
            stopShare(data)
        }
    }else if(window.record.currentRecodeType === 'video') {
        if(data.type === 'video' || data.type === 'localVideo'){
            data.callback = function(event){
                if(event.codeType === 999){
                    console.warn(" stop video success: ", event )
                    videoBtn.textContent = "开启视频"
                    isOpenVideo = false
                    window.cancelAnimationFrame(switchTimeOut)
                    context.clearRect(setX, setY, setWidth, setHeight)
                    draw()

                }else{
                    console.warn(" stop video failed")
                }
            }
            stopVideo(data)
        }else if(data.type === 'shareScreen'){
            data.callback = function(event){
                if(event.codeType === 999){
                    console.warn(" open shareScreen success: ", event)
                    shareBtn.textContent = "开启共享"
                    isOpenShareScreen = false
                    window.cancelAnimationFrame(shareTimeOut)
                    context.clearRect(setX, setY, setWidth, setHeight)
                    draw()
                }else{
                    console.warn(" open shareScreen failed")
                }
            }
            stopShare(data)
        }
    }
}



// *************************************************音视频录制canvas 获取画面内容******************************************************************

function getVideoType(data){
    let videoType = null
    if(isOpenVideo ){
        if(isOpenShareScreen){
            if(data && data.openShare){
                videoType = 'openShareOpenVideo'
            }else{
                videoType = 'openVideoOpenShare'
            }
        }else{
            videoType = 'openVideoStopShare'
        }
    }else if(isOpenShareScreen){
        if(isOpenVideo){
            if(data && data.openVideo){
                videoType = 'openVideoOpenShare'
            }else{
                videoType = 'openShareOpenVideo'
            }
        }else{
            videoType = 'openShareStopVideo'
        }
    }
    if(videoType){
        console.warn("videoType is " , videoType)
    }else{
        console.warn("videoType is null")
    }
    return videoType
}

function draw(data){
    /*处理canvas绘制video像素模糊问题*/
    let videoType = getVideoType(data)
    window.cancelAnimationFrame(switchTimeOut)
    window.cancelAnimationFrame(shareTimeOut)

    // let videoHeight = mainVideo.videoHeight ||slidesVideo.videoHeight;
    // let videoWidth = mainVideo.videoWidth || slidesVideo.videoWidth;
    // let offsetWidth = mainVideo.offsetWidth ||slidesVideo.offsetWidth
    // let offsetHeight = mainVideo.offsetHeight ||slidesVideo.offsetHeight
    // let rangeW = videoWidth * (720 / (offsetWidth -2));   //offsetWidth包括border、padding
    // let rangeH = videoHeight * (360 / (offsetHeight -2));
    // vtcanvas.height = rangeH;
    // vtcanvas.width  = rangeW;


    let rangeH = mainVideo.videoHeight ||slidesVideo.videoHeight;
    let rangeW = mainVideo.videoWidth || slidesVideo.videoWidth;
    vtcanvas.height = rangeH;
    vtcanvas.width  = rangeW;

    console.warn("video.videoWidth:",mainVideo.videoWidth)
    console.warn("video.videoHeight:",mainVideo.videoHeight)
    // console.warn("offsetWidth:",offsetWidth)
    // console.warn("offsetHeight:",offsetHeight)
    console.warn(" canvas.height:", rangeH)
    console.warn(" canvas.width  :", rangeW  )

    setX = rangeW * 3/4;
    setY = rangeH * 3/4;
    setWidth = rangeW * 1/4;
    setHeight = rangeH * 1/4

    if(videoType === 'openVideoStopShare'){
        console.warn("只有视频  只有视频openVideoStopShare")
        context.clearRect(0, 0, vtcanvas.width ,vtcanvas.height)
        switchToCanvas(videoType, mainVideo, 0, 0, 0, 0, 0, 0, rangeW, rangeH,)
    }

    if(videoType === 'openVideoOpenShare'){
        console.warn("两者皆有openVideoOpenShare")
        context.clearRect(0, 0, vtcanvas.width ,vtcanvas.height)
        shareToCanvas(videoType, slidesVideo,0, 0, 0, 0, 0, 0, vtcanvas.width, vtcanvas.height)
        switchToCanvas(videoType, mainVideo, 0, 0, mainVideo.videoWidth, mainVideo.videoHeight, setX, setY, setWidth, setHeight)
    }

    if(videoType === 'openShareOpenVideo'){
        console.warn("两者都有openShareOpenVideo")
        context.clearRect(0, 0, vtcanvas.width ,vtcanvas.height)
        shareToCanvas(videoType, slidesVideo,0, 0, 0, 0, 0, 0, vtcanvas.width, vtcanvas.height)
        switchToCanvas(videoType, mainVideo, 0, 0, mainVideo.videoWidth, mainVideo.videoHeight, setX, setY, setWidth, setHeight)
    }

    if(videoType === 'openShareStopVideo'){
        console.warn("只有共享openShareStopVideo")
        context.clearRect(0, 0, vtcanvas.width ,vtcanvas.height)

        shareToCanvas(videoType, slidesVideo,0, 0, 0, 0, 0, 0, vtcanvas.width, vtcanvas.height)
    }

    if(!videoType){
        console.warn("清除canvas")
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.fillStyle = "white"
        context.fillRect(0, 0, vtcanvas.width, vtcanvas.height)
    }

}

function shareToCanvas(type, video, sx, sy, swidth, sheight, x, y, width, height){
    if (video.ended) {
        return;
    }
    context.globalCompositeOperation="source-over";

    if(type === 'openShareOpenVideo' || type === 'openVideoOpenShare' || type === 'openShareStopVideo'){
        context.drawImage(video, x, y, width, height);

    }else if(type === 'openVideoStopShare'){
        context.drawImage(video, sx, sy, swidth, sheight, x, y, width, height);
    }

    shareTimeOut = window.requestAnimationFrame(() => {
        shareToCanvas(type,video, sx, sy, swidth, sheight, x, y, width, height);
    })
    // video.style.display = "none"
    // shareVideo.style.display = "none"
}

function switchToCanvas(type, video, sx, sy, swidth, sheight, x, y, width, height) {
    if (video.ended) {
        return;
    }
    context.globalCompositeOperation="source-over";
    if( type === 'openShareStopVideo' || type === 'openVideoOpenShare' || type === 'openShareOpenVideo'  ){
        context.drawImage(video, sx, sy, swidth, sheight, x, y, width, height);
    }else if(type === 'openVideoStopShare'){
        context.drawImage(video, x, y, width, height)
    }

    switchTimeOut = window.requestAnimationFrame(() => {
        switchToCanvas(type, video, sx, sy, swidth, sheight, x, y, width, height);
    })


}



// *********************************************区域录制获取区域阶段**************************************************************
// let shareCanvas = document.getElementsByClassName("shareCanvas")[0]
function finish() {

    var videoHeight = shareVideo.videoHeight;
    var videoWidth = shareVideo.videoWidth;
    shareVideo.width = videoWidth
    shareVideo.height = videoHeight

    width = Math.abs(window.endPositionX - window.startPositionX);
    height = Math.abs( window.endPositionY - window.startPositionY);
    let rangeW = videoWidth * (width / shareVideo.offsetWidth);
    let rangeH = videoHeight * (height / shareVideo.offsetHeight);
    console.warn("rangeW:",rangeW)
    console.warn("rangeH:",rangeH)
    shareCanvas.height = rangeH ;
    shareCanvas.width  = rangeW ;
    // shareTip_bottom.width = rangeW
    // shareTip_bottom.height = rangeH


    let sx = window.startPositionX
    let sy = window.startPositionY


    ctx.clearRect(0, 0, videoWidth, videoHeight);
    console.log(" start finish")
    console.warn("sx:",sx)
    console.warn("sy:",sy)
    console.warn("rangeW:",rangeW)
    console.warn("rangeH:",rangeH)
    playCanvas(shareVideo,shareCanvas, ctx,sx,sy,rangeW,rangeH);
}



/*
* video视频转换到canvas中
* */
function playCanvas(video,canvas,ctx,sx,sy,rangeW,rangeH){

    // data = div.value;
    // data1 = text.value;
    // console.log("data:",data);
    // console.log("data1:",data1);
    // var tw1 = ctx.measureText(data1).width;
    // var tw = ctx.measureText(data).width;
    ctx.drawImage(video, sx, sy, rangeW, rangeH, 0, 0, canvas.width, canvas.height);
    canvas.style.border = "none";
    ctx.fillStyle = "#05a0ff";
    ctx.font = "italic 30px 黑体";
    ctx.textBaseline = 'middle';//更改字号后，必须重置对齐方式，否则居中麻烦。设置文本的垂直对齐方式
    ctx.textAlign = 'center';


    stopTimeout = requestAnimationFrame(() => {
        playCanvas(video,canvas,ctx,sx,sy,rangeW,rangeH);
    })
}


// *****************************************录制阶段*********************************************************

function beginRecord() {
    console.warn("start record...")
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if ( !(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo) ) {
        console.warn("localStream is null")
        return
    }
    let mixStream = []
    let data = {}
    let canvasStream

    if(window.record.currentRecodeType === 'areaVideo'){
        canvasStream = shareCanvas.captureStream(60)
    }else if(window.record.currentRecodeType === 'video'){
        canvasStream = vtcanvas.captureStream(60)
    }
    let canvasTrack = canvasStream.getTracks()[0]
    if (canvasTrack) {
        mixStream.push(canvasTrack)
    }
    if (localStreams.audio) {
        let audioTrack = localStreams.audio.getTracks()[0]
        mixStream.push(audioTrack)
    }
    data.stream = new MediaStream(mixStream)
    console.warn("RecordStream:", data.stream)

    if (window.record.currentRecodeType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("begin Record success:",event)
                isRecording = true
                shareRecord.width = shareCanvas.width ;
                shareRecord.height = shareCanvas.height;
                shareRecord.srcObject = event.stream.stream
                shareRecord.onloadedmetadata = function (e) {
                    shareRecord.play();
                };
            }else{
                console.warn("begin Record failed")
            }
        }
        window.record.videoRecord(data)
    } else if (window.record.currentRecodeType === 'video') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("begin Record success:",event)
                isRecording = true
                canvasRecord.style.display = 'inline-block'
                canvasRecord.width = vtcanvas.width;
                canvasRecord.height = vtcanvas.height;
                canvasRecord.srcObject = event.stream.stream
                canvasRecord.onloadedmetadata = function (e) {
                    canvasRecord.play();
                };
            }else{
                console.warn("begin Record failed")
            }
        }
        window.record.videoRecord(data)
    }
}


function stopRecord() {
    console.warn("stop record...")
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)) {
        console.warn("localStream is null")
        return
    }
    let data = {}

    if (window.record.currentRecodeType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("stop record success:", event)
                isRecording = false
                let buffer = event.stream.recordedBlobs
                shareRecord.srcObject = event.stream.stream
                // share_startRecord.disabled = false
                // share_stopRecord.disabled = true
                // share_pauseRecord.disabled = true
                // share_resumeRecord.disabled = true
                // share_download.disabled = false

                /**停止录制后需要关闭流**/
                let tracks = shareRecord.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop()
                });
                // Object.keys(localStream).forEach(function (key) {
                //     if(key === 'audio'){
                //         stopAudio()
                //     }else if (key === 'main'){
                //         stopVideo()
                //     }else if(key === 'slides'){
                //         stopShare()
                //     }
                //     let stream = localStream[key]
                //     if (stream) {
                //         window.record.closeStream(stream)
                //         localStream[key] = null
                //     }
                // })

                /***录制内容返回播放***/
                let blob = new Blob(buffer, {'type': 'video/webm'});
                let url = window.URL.createObjectURL(blob);
                shareRecord.controls = true
                shareRecord.srcObject = null;
                shareRecord.src = url;
                shareRecord.play();
            } else {
                console.warn("stop record failed")
            }
        }
        window.record.stopVideoRecord(data)
    } else if (window.record.currentRecodeType === 'video') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("stop record success:", event)
                isRecording = false
                let buffer = event.stream.recordedBlobs
                canvasRecord.srcObject = event.stream.stream
                // share_startRecord.disabled = false
                // share_stopRecord.disabled = true
                // share_pauseRecord.disabled = true
                // share_resumeRecord.disabled = true
                // share_download.disabled = false

                /**停止录制后需要关闭流**/
                let tracks = canvasRecord.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop()
                });
                // Object.keys(localStream).forEach(function (key) {
                //     if(key === 'audio'){
                //         stopAudio()
                //     }else if (key === 'main'){
                //         stopVideo()
                //     }else if(key === 'slides'){
                //         stopShare()
                //     }
                //     let stream = localStream[key]
                //     if (stream) {
                //         window.record.closeStream(stream)
                //         localStream[key] = null
                //     }
                // })

                /***录制内容返回播放***/
                let blob = new Blob(buffer, {'type': 'video/webm'});
                let url = window.URL.createObjectURL(blob);
                canvasRecord.controls = true
                canvasRecord.srcObject = null;
                canvasRecord.src = url;
                canvasRecord.play();
            } else {
                console.warn("stop record failed")
            }
        }
        window.record.stopVideoRecord(data)
    }
}

function pauseRecord(){
    console.warn("pause record...")
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)) {
        console.warn("localStream is null")
        return
    }
    let data = {}

    if (window.record.currentRecodeType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("pause record success:", event)
                shareRecord.pause();
            } else {
                console.warn("pause record failed")
            }
        }
        window.record.pauseVideoRecord(data)
    } else if (window.record.currentRecodeType === 'video') {

    }
}


function resumeRecord(){
    console.warn("resume record...")
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)) {
        console.warn("localStream is null")
        return
    }
    let data = {}

    if (window.record.currentRecodeType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("resume record success:", event)
                shareRecord.play();
            } else {
                console.warn("resume record failed")
            }
        }
        window.record.resumeVideoRecord(data)
    } else if (window.record.currentRecodeType === 'video') {

    }
}




// *****************************************初始化阶段****************************************************

window.addEventListener('load', function () {
    if (Record) {
        Record.prototype.preInit()
    }
    window.record.currentRecodeType = currentRecodeType
    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
})

$(document).ready(function(){
    $('.videoArea').frameSelection({
        mask:true,
        callback:function(){
            console.log('rendering!!!');
        },
        done:function(result){
            console.log('rendering done',result);
        }
    }) ;
})