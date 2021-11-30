

// 关于视频录制按钮
let buffer
let tip = document.getElementById("tip")
let audioTip = document.getElementById("audioTip")
let shareTip = document.getElementById("shareTip")
// let body = document.getElementsByTagName("body")
let audio = document.getElementsByClassName("audio")[0]
let contrainer = document.getElementById("contrainer")
let recordContrainer = document.getElementById("record")
let video = document.getElementById("video")
let shareVideo = document.getElementById("shareScreen")
let share_video = document.getElementsByClassName("share_video")[0]

let startMark = document.getElementsByClassName("startMark")[0]
let recordVideo = document.getElementById("recordVideo")
let recording = document.getElementsByClassName("recording")[0]
let recordButton = document.getElementsByClassName("recorded")[0]
let reRecordButton = document.getElementsByClassName("restartRecord")[0]


let audioButton = document.getElementsByClassName("audioButton")[0]
let videoButton = document.getElementsByClassName('videoAction')[0]
let screenButton = document.getElementsByClassName('share')[0]
let isMuteButton = document.getElementsByClassName('isMute')[0]
let setDeviceButton = document.getElementsByClassName("setDeviceButton")[0]
let selectDevice = document.getElementsByClassName('selectDevice')[0]

let audioinput = document.getElementsByClassName("audioinput")[0]
let audioOutput = document.getElementsByClassName("audioOutput")[0]
let cameraDeviced = document.getElementsByClassName("cameraDeviced")[0]

let cameraSelect = document.getElementsByClassName("camera")[0]
let micSelect = document.getElementsByClassName("mic")[0]
let speakerSelect = document.getElementsByClassName("speaker")[0]

// 关于音频录制按钮
let audioInSource = document.getElementsByClassName("audioInSource")[0]
let audioOutSource = document.getElementsByClassName("audioOutSource")[0]


window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

let canvas = document.getElementById("canvas")
let context = canvas.getContext('2d')


let share_canvas = document.getElementsByClassName("share_canvas")[0]
let ctx = share_canvas.getContext("2d")
let shareButton = document.getElementsByClassName("shareButton")[0]



/**开启/关闭视频**/
let isOpenVideo = false
let isOpenShareScreen = false
let isUnmute = false
let isRecord = false

/** 绘制canvas定时器**/
let  switchTimeOut
let  shareTimeOut

/** 像素匹配位置**/
let setX
let setY
let setWidth
let setHeight

let localStream ={
    audio: null,
    main: null,
    slides: null,
}

let devices = {
    cameras: null,
    microphones:null,
    speakers:null
}

/**关于获取是否成功***/
let isGetMic = false
let isGetSpeaker = false
let isGetCamera = false


cameraSelect.addEventListener("mouseout", function(){
    audioOutput.style.display = "none"
    audioinput.style.display = "none"
})
micSelect.addEventListener("mouseleave", function(){
    cameraDeviced.style.display = "none"
    // audioinput.style.display = "none"
})
speakerSelect.addEventListener("mouseout", function(){
    cameraDeviced.style.display = "none"
    // audioOutput.style.display = "none"
})


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

// *************************************************获取音视频阶段******************************************************************

function draw(data){
    /*处理canvas绘制video像素模糊问题*/
    let videoHeight = video.videoHeight ||shareVideo.videoHeight;
    let videoWidth = video.videoWidth || shareVideo.videoWidth;
    let offsetWidth = video.offsetWidth ||shareVideo.offsetWidth
    let offsetHeight = video.offsetHeight ||shareVideo.offsetHeight
    let rangeW = videoWidth * (720 / (offsetWidth -2));   //offsetWidth包括border、padding
    let rangeH = videoHeight * (360 / (offsetHeight -2));
    canvas.height = rangeH;
    canvas.width  = rangeW;

    setX = rangeW * 3/4;
    setY = rangeH * 3/4;
    setWidth = rangeW * 1/4;
    setHeight = rangeH * 1/4

    console.warn("video.videoWidth:",video.videoWidth)
    console.warn("video.videoHeight:",video.videoHeight)
    console.warn(" canvas.height:", rangeH)
    console.warn(" canvas.width  :", rangeW  )

    let videoType = getVideoType(data)
    if(videoType === 'openVideoStopShare'){
        console.warn("只有视频  只有视频openVideoStopShare")
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        switchToCanvas(videoType, video, 0, 0, 0, 0, 0, 0, rangeW, rangeH,)
    }

    if(videoType === 'openVideoOpenShare'){
        console.warn("两者皆有openVideoOpenShare")
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        shareToCanvas(videoType, shareVideo,0, 0, 0, 0, 0, 0, canvas.width, canvas.height)
        switchToCanvas(videoType, video, 0, 0, video.videoWidth, video.videoHeight, setX, setY, setWidth, setHeight)
    }

    if(videoType === 'openShareOpenVideo'){
        console.warn("两者都有openShareOpenVideo")
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        shareToCanvas(videoType, shareVideo,0, 0, 0, 0, 0, 0, canvas.width, canvas.height)
        switchToCanvas(videoType, video, 0, 0, video.videoWidth, video.videoHeight, setX, setY, setWidth, setHeight)
    }

    if(videoType === 'openShareStopVideo'){
        console.warn("只有共享openShareStopVideo")
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)

        shareToCanvas(videoType, shareVideo,0, 0, 0, 0, 0, 0, canvas.width, canvas.height)
    }

    if(!videoType){
        console.warn("清除canvas")
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
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

function getArea(data){
    if(data.recodeType === 'audio' ){
        audioTip.style.display = 'block'
        contrainer.style.opacity = "0.2";
        // openAudio(data)
        handleDeviceds()
        // handleAudioRecord()
    } else if(data.recodeType === 'video' ){

        tip.style.display = "block";
        contrainer.style.opacity = "0.2";
        if(videoButton.textContent === '开启视频'){
            openVideo(data)
        }

        if(isMuteButton.textContent === '非静音'){
            let param = {audio: devices.microphones[0].deviceId}
            console.warn("param:",param)
            openAudio(param)
        }
    }else{
        console.warn("区域录制")
        shareTip.style.display = "block"
        // tip.style.display = "block";
        // body.style.opacity = "0.2"
        contrainer.style.opacity = "0";
        openShare(data)
    }
}

function closePopUp () {
    tip.style.display = "none";
    contrainer.style.opacity = "1";
    Object.keys(localStream).forEach(function (key) {
        if(key === 'audio'){
            stopAudio()
        }else if (key === 'main'){
            stopVideo()
        }else if(key === 'slides'){
            stopShare()
        }
        let stream = localStream[key]
        if (stream) {
            window.record.closeStream(stream)
            localStream[key] = null
        }
    })

}

function closeButton(){
    recordContrainer.style.display = 'none';
    contrainer.style.opacity = "1";
    if(recordVideo.srcObject){
        let tracks = recordVideo.srcObject.getTracks();
        tracks.forEach(track => {track.stop()});
        recordVideo.src = null;
        recordVideo.controls = false
    }

    Object.keys(localStream).forEach(function (key) {
        if(key === 'audio'){
            stopAudio()
        }else if (key === 'main'){
            stopVideo()
        }else if(key === 'slides'){
            stopShare()
        }
        let stream = localStream[key]
        if (stream) {
            window.record.closeStream(stream)
            localStream[key] = null
        }
    })

}

function openAudio(data){
    if(!localStream  || ! localStream.audio){
        data.type = 'audio'
        data.constraints = {
            audio: {deviceId: data && data.audio} || true,
        }
        data.callback = callback
        function callback(event){
            if(event.codeType === 999){
                console.warn("获取音频成功:",event)
                localStream.audio = event.stream
                isUnmute = true
                isMuteButton.textContent = '静音'

                /**处理audioStream**/
                // audioRecord()

            }else{
                console.warn("获取音频失败")
            }
        }
        console.warn("openAudio_data:",data)
        window.record.openAudio(data)
    }else {
        console.warn("已经存在流")
    }
}

function stopAudio(){
    if(localStream.audio){
        console.warn ("开始停止音频流")
        window.record.stopAudio({callback:function(event){
                if(event.codeType === 999){
                    console.warn("停止音频成功")
                    isMuteButton.textContent = '非静音'
                    isUnmute = false
                    localStream.audio = null

                    audioButton.textContent = "开始录制"
                }else{
                    console.warn("停止音频失败")
                }
            }})
    }else{
        console.warn("没有音频流")
    }
}

function openVideo(data){
    if(!localStream  || !localStream.main){
        data.constraints = {
            audio: data.audio || false,
            video: {
                width: 720,   // 必须
                height: 360,  // 必须
                frameRate: 15,  // 可缺省，默认15fps
                // deviceId: data.deviceId  || ''
            }
        }

        data.callback = callback
        function callback(event){
            if(event.codeType === 999){
                console.warn("开启视频成功")
                if(event.type === 'main'){
                    isOpenVideo = true
                    localStream.main = event.stream
                    videoButton.textContent = '关闭视频'
                    video.srcObject = localStream.main
                    video.onloadedmetadata = function(e) {
                        video.play();
                    };
                    video.addEventListener("play",function(){
                        console.warn("video.videoWidth111:",video.videoWidth)
                        console.warn("video.videoHeight111:",video.videoHeight)
                        if(isOpenShareScreen){
                            draw({openShare:true})
                        }else{
                            draw()
                        }
                    })

                }
            }else{
                console.warn("开启视频失败")
            }
        }
        window.record.openVideo(data)
    }
}

function stopVideo(){
    if(localStream.main){
        console.warn("开始停止视频")
        let data = {}
        data.callback = callback
        function callback(event){
            if(event.codeType === 999){
                isOpenVideo = false
                window.record.closeStream(localStream.main)
                localStream.main = null
                videoButton.textContent = '开启视频'

                window.cancelAnimationFrame(switchTimeOut)
                context.clearRect(setX, setY, setWidth, setHeight)
                draw()

            }
        }
        window.record.stopVideo(data)
    }else{
        console.warn("没有视频流")
    }
}

function openShare(data){
    if(!localStream  || !localStream.slides){
        data.callback = callback
        data.constraints = {
            audio: false ,
            video: {
                width: 1920,   // 必须
                height: 1080,  // 必须
                frameRate: 15,  // 可缺省，默认15fps
            }
        }
        function callback(event){
            if(event.codeType === 999){
                localStream.slides = event.stream
                if(data.recodeType === 'video' || data.type === 'shareScreen'){
                    if(event.type === 'slides'){
                        isOpenShareScreen = true
                        shareVideo.srcObject = localStream.slides
                        screenButton.textContent = '停止共享'
                        shareVideo.onloadedmetadata = function(e){
                            shareVideo.play()
                        };
                        shareVideo.addEventListener('play',function(){
                            if(isOpenVideo){
                                draw({openVideo:true})
                            }else{
                                draw()
                            }
                        })
                    }
                }else if(data.recodeType === 'regionalVideo'){
                    share_video.srcObject = localStream.slides
                    share_video.onloadedmetadata = function(){
                        share_video.play()
                    }
                    shareButton.textContent = "关闭共享"
                }
            }else{
                console.warn("开启演示失败")
            }

        }
        window.record.openShare(data)
    }
}

function stopShare(data){
    if(localStream.slides){
        console.warn("开始停止演示流")
        if(!data){
            let data = {}
            data.callback= callback
            function callback(event){
                if(event.codeType === 999){
                    isOpenShareScreen = false
                    window.record.closeStream(localStream.slides)
                    localStream.slides = null
                    screenButton.textContent = '屏幕共享'

                    window.cancelAnimationFrame(shareTimeOut)
                    context.clearRect(setX, setY, setWidth, setHeight)
                    draw()
                }
            }
            window.record.stopShare(data)
        }else {
            data.callback  = callback
            function callback(event){
                if(event.codeType === 999){
                    isOpenShareScreen = false
                    window.record.closeStream(localStream.slides)
                    localStream.slides = null
                    shareButton.textContent = '开启共享'
                    context.clearRect(setX, setY, setWidth, setHeight)
                }
            }
            window.record.stopShare(data)
        }

    }else{
        console.warn("没有演示流")
    }
}

function toggleVideoButton(){

    if(videoButton.textContent === '开启视频'){
        if(localStream && localStream.main){
            console.warn("存在视频流")
        }else{
            // openVideo({type: 'video'})
            handleVideoLogic({type: 'video'})
        }
    }else{
        stopVideo()
    }
}

function toggleShareButton(){
    if(screenButton.textContent === '屏幕共享'){
        if(localStream && localStream.slides){
            console.warn("存在演示流")
        }else{
            openShare({type: 'shareScreen'})
        }
    }else{
        stopShare()
    }
}


function setDeviced(){
    selectDevice.style.display = 'block'
}

// ********************************************获取设备阶段********************************************************
function handleCamera(){

    if(!isGetCamera){
        if(devices && devices.cameras){
            for(let i=0; i< devices.cameras.length;i++){
                let option = document.createElement('option')
                let camera = devices.cameras[i]
                option.text = camera.label || ''
                option.value = camera.deviceId
                cameraDeviced.appendChild(option)
            }
        }
        isGetCamera = true
    }
    cameraDeviced.style.display = 'block'
    audioOutput.style.display = "none"
    audioinput.style.display = "none"
}

function handleMic(){
    if(!isGetMic){
        if(devices && devices.microphones){
            for(let i=0; i< devices.microphones.length;i++){
                let microphone = devices.microphones[i]
                if(microphone.deviceId !== 'default' && microphone.deviceId !== 'communications'){
                    let option = document.createElement('option')
                    option.text = microphone.label || ''
                    option.value = microphone.deviceId
                    audioinput.appendChild(option)
                }
            }
        }
        isGetMic = true
    }
    audioinput.style.display = "block"
    cameraDeviced.style.display = 'none'
    audioOutput.style.display = "none"
}

function handleSpeaker(){
    if(!isGetSpeaker){
        if(devices && devices.speakers){
            for(let i=0; i < devices.speakers.length;i++){
                let speaker = devices.speakers[i]
                if(speaker.deviceId !== 'default' && speaker.deviceId !== 'communications'){
                    let option = document.createElement('option')
                    option.text = speaker.label || ''
                    option.value = speaker.deviceId
                    audioOutput.appendChild(option)
                }
            }
        }
        isGetSpeaker = true
    }
    audioOutput.style.display = 'block'
    cameraDeviced.style.display = "none"
    audioinput.style.display = "none"
}

function handleVideoLogic(data){
    console.warn("handleVideoLogic:",data)
    if(data.type === 'audio'){
        if(localStream.audio){
            stopAudio()
            localStream.audio = null
        }
        openAudio(data)
    }else{
        if(localStream.main){
            stopVideo()
            localStream.main = null
        }
        openVideo(data)
    }
}

function handleShareLogic(){
    if(localStream && localStream.slides){
        stopShare({recodeType: 'regionalVideo'})

    }else{
        openShare({recodeType: 'regionalVideo'})
    }
}

function handleDeviceds(){
    if(devices){
        if(devices && devices.cameras){
            for(let i=0; i< devices.cameras.length;i++){
                let option = document.createElement('option')
                let camera = devices.cameras[i]
                option.text = camera.label || ''
                // cameraDeviced = event.cameras
                option.value = camera.deviceId
                cameraDeviced.appendChild(option)
                cameraDeviced.style.display = 'block'
            }
        }

        if(devices && devices.microphones){
            for(let i=0; i< devices.microphones.length;i++){
                let microphone = devices.microphones[i]
                if(microphone.deviceId !== 'default' && microphone.deviceId !== 'communications'){
                    let option = document.createElement('option')
                    option.text = microphone.label || ''
                    option.value = microphone.deviceId
                    // audioOutput.appendChild(option)
                    // audioOutput.style.display = 'block'
                    // 针对音频录制设备
                    audioInSource.appendChild(option)
                }
            }
        }
        if(devices && devices.speakers){
            for(let i=0; i < devices.speakers.length;i++){
                let speaker = devices.speakers[i]
                if(speaker.deviceId !== 'default' && speaker.deviceId !== 'communications'){
                    let option = document.createElement('option')
                    option.text = speaker.label || ''
                    option.value = speaker.deviceId
                    // audioinput.appendChild(option)
                    // audioinput.style.display = 'block'
                    // 针对音频录制设备
                    audioOutSource.appendChild(option)
                }
            }
        }

    }else{
        console.warn("获取设备失败")
    }
}

function getAudioInput(){
    let option =  audioinput.options
    audioinput.value = option[audioinput.selectedIndex].value  // selectedIndex代表的是你所选中项的index
    selectDevice.style.display = 'none'
    audioinput.style.display = "none"
    let data = {type: 'video', audio: audioinput.value, deviceId: cameraDeviced.value}
    // openVideo(data)
    handleVideoLogic({type: 'audio', audio:audioinput.value})
}

function getAudioOutput(){
    let option = audioOutput.options
    audioOutput.value = option[audioOutput.selectedIndex].value  // selectedIndex代表的是你所选中项的index
    selectDevice.style.display = 'none'
    audioOutput.style.display = "none"
    // handleVideoLogic({type: 'audio', audio:audioOutput.value})
}

function getCamera(){
    let option = cameraDeviced.options
    console.warn("option:",option)
    cameraDeviced.value = option[cameraDeviced.selectedIndex].value  // selectedIndex代表的是你所选中项的index
    console.warn("value:",cameraDeviced.value)
    selectDevice.style.display = 'none'
    cameraDeviced.style.display = "none"

    let data = {type: 'video', deviceId: cameraDeviced.value}
    // openVideo(data)
    handleVideoLogic(data)
}

function isHandleMute(){
    if(!localStream || !localStream.audio){
        console.warn("当前不存在音频流")
        return
    }

    let data = {stream: localStream.audio, type: 'audio', mute: false}
    data.callback = function(event){
        if(!event || !event.stream){
            console.warn("mute / unmute  failed")
            return
        }

        let enable = event.stream.getTracks()[0].enabled
        if(enable){
            console.warn("现在处于 非静音 状态")
            isMuteButton.textContent = "静音"
            isUnmute = true
        }else{
            console.warn("现在处于 静音 状态")
            isMuteButton.textContent = "非静音"
            isUnmute = false
        }
    }
    if(isMuteButton.textContent === '非静音'){
        if(!isUnmute){
            data.mute = false
            window.record.streamMuteSwitch(data)
        }
    }else if(isMuteButton.textContent === '静音'){
        if(isUnmute){
            data.mute = true
            window.record.streamMuteSwitch(data)
        }
    }
}

function getAudioSource(){
    let option = audioInSource.options
    audioInSource.value = option[audioInSource.selectedIndex].value
    let data ={
        audio:audioInSource.value
    }
    handleAudioRecord(data)
}

function getAudioOutSource(){
    let option = audioOutSource.options
    audioOutSource.value = option[audioOutSource.selectedIndex].value
}



// ********************************************录制下载阶段********************************************
function beginRecord(data){
    if(localStream && (localStream.main || localStream.slides)){
        tip.style.display = "none";
        contrainer.style.opacity = "0.2";
        recordContrainer.style.display = 'block'
        let saveStream = []
        let canvasStream = canvas.captureStream(60)
        let canvasTrack =  canvasStream.getTracks()[0]
        if(canvasTrack){
            saveStream.push(canvasTrack)
        }
        if(localStream.audio){
            let micTrack = localStream.audio.getTracks()[0]
            saveStream.push(micTrack)
        }

        data.stream = new MediaStream(saveStream)
        console.warn("canvasRecordStream:",data.stream)

        data.callback = callback
        function callback(event){
            console.warn("beginRecord:",event)
            if(event.codeType === 999){
                isRecord = true
                recordVideo.srcObject = event.stream.stream
                recordVideo.onloadedmetadata = function(e) {
                    recordVideo.play();
                };
            }else{
                console.warn("录制失败")
            }
        }
        window.record.videoRecord(data)
    }else{
        console.warn("当前没有视频流或演示流")
    }
}

function stopVideoRecord(){
    let data = {}
    if(isRecord){
        data.callback = callback
        function callback(event){
            console.warn("event:",event)
            reRecordButton.style.display = 'block'
            startMark.textContent = "停止录制"
            isRecord = false
            if(event.codeType === 999){
                buffer = event.recordedBlobs
                recordButton.disabled = true
                recordButton.style.backgroundColor = '#A2A2A2'

                /**停止录制后需要关闭流**/
                let tracks = recordVideo.srcObject.getTracks();
                tracks.forEach(track => {track.stop()});
                Object.keys(localStream).forEach(function (key) {
                    if(key === 'audio'){
                        stopAudio()
                    }else if (key === 'main'){
                        stopVideo()
                    }else if(key === 'slides'){
                        stopShare()
                    }
                    let stream = localStream[key]
                    if (stream) {
                        window.record.closeStream(stream)
                        localStream[key] = null
                    }
                })

                /***录制内容返回播放***/
                let blob = new Blob(event.Blobs, {'type': 'video/webm'});
                let url = window.URL.createObjectURL(blob);
                recordVideo.srcObject = null;
                recordVideo.src = url;
                recordVideo.controls = true
                recordVideo.play();
                console.warn("停止录制成功")
            }else{
                console.warn("停止录制失败")
            }
        }
        window.record.stopVideoRecord(data)
    }

}
function handleAudioRecord(data){
    if(audioButton.textContent === '开始录制'){
        console.warn("音频录制  音频录制开始")
        openAudio(data);
        // audioRecord()
    }else{
        stopAudioRecord()
    }
}

function audioRecord(){
    let data = {}
    data.callback = callback
    data.stream = localStream.audio
    function callback(event){
        if(event.codeType === 999){
            console.warn("音频录制成功")
            audioButton.textContent = '停止录制'
            // audio.srcObject = event.stream.stream
            // audio.onloadedmetadata = function(e) {
            //     console.warn("111111")
            //     audio.play();
            // };
        }else{
            console.warn("音频录制失败")
        }
    }
    console.warn("data:",data)
    window.record.audioRecord(data)
}


function stopAudioRecord(){
    let data ={}
    data.callback = callback
    function callback(event){
        console.warn("event:",event)
        if(event.codeType === 999){
            console.warn("停止音频录制成功")
            audioButton.textContent = '开始录制'
            /***录制后关闭流**/


            Object.keys(localStream).forEach(function (key) {
                let stream = localStream[key]
                if (stream) {
                    stopAudio()
                    window.record.closeStream(stream)
                    localStream[key] = null
                }
            })

            /***录制内容返回播放***/
            let blob = new Blob(event.Blobs, {'type': 'audio/ogg'});
            let url = window.URL.createObjectURL(blob);
            audio.src = url;
            audio.controls = true
        }else{
            console.warn("停止音频录制失败")
        }
    }
    window.record.stopAudioRecord(data)
}

function download(data){

    data.callback = callback
    function callback(event){
        if(event.codeType === 999){
            console.warn("下载成功")
        }else{
            console.warn("下载失败")
        }
    }
    if(data.type === 'video'){
        window.record.videoDownload(data)
    }else{
        window.record.audioDownload(data)
    }
}

function restartRecord(){
    console.warn("点击重新录制事件...")
    tip.style.display = 'block'
    recordContrainer.style.display = 'none'
    reRecordButton.style.display = "none"
    startMark.textContent = "开始录制"
    if(!isRecord){
        console.warn("未录制 未录制 未录制")
        recordButton.disabled = false
        recordButton.style.backgroundColor = "orangered "
        recordVideo.src = null;
        recordVideo.controls = false
    }else{
        console.warn("录制中...")
        stopVideoRecord()
    }
    getArea({recodeType: 'video'})

}


function devicedsInfo(){
    window.record.enumDevices({callback:function(event){
            if(event){
                console.warn("成功获取设备")
                if(event.cameras){
                    devices.cameras = event.cameras
                }
                if(event.microphones){
                    devices.microphones = event.microphones
                }
                if(event.speakers){
                    devices.speakers = event.speakers
                }
            }else{
                console.warn("获取设备失败")
            }
        }})
}



// *********************************************区域录制获取区域阶段**************************************************************
function finish() {

    // let position = getElementViewPosition(share_video)
    // console.warn("ll:",position)


    var videoHeight = share_video.videoHeight;
    var videoWidth = share_video.videoWidth;

    width = Math.abs(window.endPositionX - window.startPositionX);
    height = Math.abs( window.endPositionY - window.startPositionY);
    rangeW = videoWidth * (width / share_video.offsetWidth);
    rangeH = videoHeight * (height / share_video.offsetHeight);
    console.warn("rangeW:",rangeW)
    console.warn("rangeH:",rangeH)
    share_canvas.height = rangeH ;
    share_canvas.width  = rangeW ;


    sx = (window.startPositionX-window.startLeftX) ;
    sy = (window.startPositionY-window.startTopY);


    ctx.clearRect(0, 0, videoWidth, videoHeight);
    console.log(" start finish")
    playCanvas(share_video,ctx,sx,sy,rangeW,rangeH);

}

function getElementViewPosition(element){
    //计算x坐标
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    console.warn("actualLeft :",actualLeft )
    console.warn("currentLeft:",current)
    while (current !== null){
        actualLeft +=  (current.offsetLeft+current.clientLeft);
        current = current.offsetParent;
    }
    if (document.compatMode == "BackCompat"){
        var elementScrollLeft=document.body.scrollLeft;
    } else {
        var elementScrollLeft=document.documentElement.scrollLeft;
    }
    var left = actualLeft - elementScrollLeft;
    //计算y坐标
    var actualTop = element.offsetTop;
    var current = element.offsetParent;
    console.warn("currentRight:",current)
    while (current !== null){
        actualTop += (current.offsetTop+current.clientTop);
        current = current.offsetParent;
    }
    if (document.compatMode == "BackCompat"){
        var elementScrollTop=document.body.scrollTop;
    } else {
        var elementScrollTop=document.documentElement.scrollTop;
    }
    var right = actualTop-elementScrollTop;
    //返回结果
    return {x: left, y: right}
}




/*
* video视频转换到canvas中
* */
function playCanvas(video,ctx,sx,sy,rangeW,rangeH){

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



    // var ftop =  mousedowny ;
    // var fleft =  mousedownx;
    // ctx.fillText(data,fleft,ftop);

    // var fftop = canvas.height/2+120;
    // var ffleft = canvas.width/2;
    // ctx.fillText("追逐",150,140);
    // ctx.fillText(data1,ffleft,fftop);

    requestAnimationFrame(() => {
        playCanvas(video,ctx,sx,sy,rangeW,rangeH);
    })
}


// *****************************************初始化阶段****************************************************

window.addEventListener('load', function () {
    if (Record) {
        Record.prototype.preInit()
    }
    devicedsInfo()
})

$(document).ready(function(){
    $('.shareTip_middle').frameSelection({
        mask:true,
        callback:function(){
            console.log('rendering!!!');
        },
        done:function(result){
            console.log('rendering done',result);
        }
    }) ;
})