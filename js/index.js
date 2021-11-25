

// 关于视频录制按钮
let buffer
let tip = document.getElementById("tip")
let audioTip = document.getElementById("audioTip")
let audio = document.getElementsByClassName("audio")[0]
let contrainer = document.getElementById("contrainer")
let recordContrainer = document.getElementById("record")
let video = document.getElementById("video")
let shareVideo = document.getElementById("shareScreen")
let recordVideo = document.getElementById("recordVideo")
let recording = document.getElementsByClassName("recording")[0]
let recordButton = document.getElementsByClassName("recorded")[0]

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


window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

let canvas = document.getElementById("canvas")
let context = canvas.getContext('2d')

/**开启/关闭视频**/
let isOpenVideo = false
let isOpenShareScreen = false
let isMute = false
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

/**关于音频录制处理**/
let AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;  // 实例化音频对象
let audioCtx = new AudioContext()
/**左声道和右声道**/
let leftDataList = [],
    rightDataList = [];


// videoButton.addEventListener("click",toggleVideoButton)
// screenButton.addEventListener("click",toggleShareButton)
// setDeviceButton.addEventListener("click",setDeviced)

cameraSelect.addEventListener("mousemove", handleCamera)
micSelect.addEventListener("mousemove", handleMic)
speakerSelect.addEventListener("mousemove", handleSpeaker)

cameraSelect.addEventListener("mouseout", function(){
    audioOutput.style.display = "none"
    audioinput.style.display = "none"
})
micSelect.addEventListener("mouseleave", function(){
    cameraDeviced.style.display = "none"
    audioinput.style.display = "none"
})
speakerSelect.addEventListener("mouseout", function(){
    cameraDeviced.style.display = "none"
    audioOutput.style.display = "none"
})

audioButton.addEventListener("click",handleAudioRecord)

recordButton.addEventListener("click", stopVideoRecord)

isMuteButton.addEventListener("click",isHandleMute)

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


    let videoType = getVideoType(data)
    if(videoType === 'openVideoStopShare'){
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        console.warn("只有视频  只有视频openVideoStopShare")
        console.warn("video.videoWidth:",video.videoWidth)
        console.warn("video.videoHeight:",video.videoHeight)
        console.warn(" canvas.height:", rangeH)
        console.warn(" canvas.width  :", rangeW  )

        switchToCanvas(videoType, video, 0, 0, 0, 0, 0, 0, rangeW, rangeH,)
    }

    if(videoType === 'openVideoOpenShare'){
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        console.warn("两者皆有openVideoOpenShare")
        console.warn("video.videoWidth:",video.videoWidth)
        console.warn("video.videoHeight:",video.videoHeight)


        shareToCanvas(videoType, shareVideo,0, 0, 0, 0, 0, 0, canvas.width, canvas.height)
        switchToCanvas(videoType, video, 0, 0, video.videoWidth, video.videoHeight, setX, setY, setWidth, setHeight)
    }

    if(videoType === 'openShareOpenVideo'){
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        console.warn("两者都有openShareOpenVideo")
        console.warn("video.videoWidth:",video.videoWidth)
        console.warn("video.videoHeight:",video.videoHeight)


        shareToCanvas(videoType, shareVideo,0, 0, 0, 0, 0, 0, canvas.width, canvas.height)

        switchToCanvas(videoType, video, 0, 0, video.videoWidth, video.videoHeight, setX, setY, setWidth, setHeight)

    }

    if(videoType === 'openShareStopVideo'){
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        console.warn("只有共享openShareStopVideo")
        console.warn("video.videoWidth:",video.videoWidth)
        console.warn("video.videoHeight:",video.videoHeight)


        shareToCanvas(videoType, shareVideo,0, 0, 0, 0, 0, 0, canvas.width, canvas.height)
    }

    if(!videoType){
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
    // context.drawImage(video, x, y, width, height);

    shareTimeOut = window.requestAnimationFrame(() => {
        shareToCanvas(type,video, sx, sy, swidth, sheight, x, y, width, height);
    })

}

function switchToCanvas(type, video, sx, sy, swidth, sheight, x, y, width, height) {
    if (video.ended) {
        return;
    }

    canvas.style.display = 'block'
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
    if(data.type === 'video'){
        tip.style.display = "block";
        contrainer.style.opacity = "0.2";
        if(videoButton.textContent === '开启视频'){
            openVideo(data)
        }
        // else if(screenButton.textContent === '屏幕共享'){
        //     openShare(data)
        // }else if(isMuteButton.textContent === '非静音'){
        //
        // }
    }else{
        audioTip.style.display = 'block'
        contrainer.style.opacity = "0.2";
        // openAudio(data)
        handleDeviceds()
        // handleAudioRecord()
    }
}

function closePopUp () {
    tip.style.display = "none";
    contrainer.style.opacity = "1";
    Object.keys(localStream).forEach(function (key) {
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
    Object.keys(localStream).forEach(function (key) {
        let stream = localStream[key]
        if (stream) {
            window.record.closeStream(stream)
            localStream[key] = null
        }
    })
}

function openAudio(data){
    // let data = {}
    data.type = 'audio'
    data.constraints = {
        audio: {deviceId: data && data.audio} || true,
    }
    data.callback = callback
    function callback(event){
        if(event.codeType === 999){
            console.warn("获取音频成功")
            localStream.audio = event.stream

            /**处理audioStream**/
            // audioRecord()

        }else{
            console.warn("获取音频失败")
        }
    }
    console.warn("openAudio_data:",data)
    window.record.openAudio(data)
}

function stopAudio(){
    window.record.stopAudio({callback:function(event){
        if(event.codeType === 999){
            console.warn("停止音频成功")
            audioButton.textContent = "开始录制"
        }else{
            console.warn("停止音频失败")
        }
    }})
}

function openVideo(data){
    if(data.type === 'video'){
        data.constraints = {
            audio: data.audio || true,
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
}

function openShare(data){
    if(data.type === 'shareScreen'){
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
            if(event.type === 'slides'){
                isOpenShareScreen = true
                localStream.slides = event.stream
                screenButton.textContent = '停止共享'
                shareVideo.srcObject = localStream.slides
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
        }
        window.record.openShare(data)
    }
}

function stopShare(){
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
                    audioOutput.appendChild(option)
                }
            }
        }
        isGetMic = true
    }
    audioOutput.style.display = "block"
    cameraDeviced.style.display = 'none'
    audioinput.style.display = "none"


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
                    audioinput.appendChild(option)
                }
            }
        }
        isGetSpeaker = true
    }
    audioinput.style.display = 'block'
    cameraDeviced.style.display = "none"
    audioOutput.style.display = "none"
}

function handleVideoLogic(data){
    setTimeout(function(){
        console.warn("handleVideoLogic:",data)
        if(data.type === 'audio'){
            if(localStream.audio){
                localStream.audio.getTracks().forEach(track => {track.stop()})
            }
            openAudio(data)
        }else{
            if(localStream.main){
                localStream.main.getTracks().forEach(track => {track.stop()})
            }
            openVideo(data)
        }
    },2500)
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
    console.warn("option:",option)
    audioinput.value = option[audioinput.selectedIndex].value  // selectedIndex代表的是你所选中项的index
    console.warn("value:", audioinput.value)
    selectDevice.style.display = 'none'
    audioinput.style.display = "none"
    let data = {type: 'video', audio: audioinput.value, deviceId: cameraDeviced.value}
    // openVideo(data)
    // handleVideoLogic({type: 'audio', audio:audioinput.value})
}

function getAudioOutput(){
    let option = audioOutput.options
    console.warn("option:",option)
    audioOutput.value = option[audioOutput.selectedIndex].value  // selectedIndex代表的是你所选中项的index
    console.warn("value:",audioOutput.value)
    selectDevice.style.display = 'none'
    audioOutput.style.display = "none"
    handleVideoLogic({type: 'audio', audio:audioOutput.value})
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
    if(isMuteButton.textContent === '非静音'){

    }
}

function getAudioSource(){
    let option = audioInSource.options
    audioInSource.value = option[audioInSource.selectedIndex].value
    let data ={
        audio:audioInSource.value
    }
    handleAudioRecord(data)
    // openAudio(data)
}

function getAudioOutSource(){
    let option = audioOutSource.options
    audioOutSource.value = option[audioOutSource.selectedIndex].value
}


// function handleOnAudioProcess(){
//
// }


function beginRecord(data){
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

    // let  audioCtx = new AudioContext();
    // let source = audioCtx.createBufferSource()
    // let track = audioCtx.createMediaStreamDestination()
    // data.stream = stream.addTrack(track.stream.getAudioTracks()[0])
    data.callback = callback
    function callback(event){
        console.warn("beginRecord:",event)
        if(event.codeType === 999){
            // let recordVideo = document.createElement('video')
            // middleStart.innerHtml = recordVideo
            // recordVideo.setAttribute("className",'recordVideo')
            recordVideo.srcObject = event.stream.stream
            recordVideo.onloadedmetadata = function(e) {
                recordVideo.play();
            };
        }else{
            console.warn("录制失败")
        }
    }
    window.record.videoRecord(data)
}

function stopVideoRecord(){
    let data = {}
    if(!isRecord){
        // let data = {}
        data.callback = callback
        function callback(event){
            console.warn("event:",event)
            isRecord = true
            if(event.codeType === 999){
                buffer = event.recordedBlobs
                recordButton.disabled = true
                recordButton.style.backgroundColor = '#A2A2A2'

                /**停止录制后需要关闭流**/
                let tracks = recordVideo.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                // stopVideo()
                // stopShare()
                // stopAudio()
                Object.keys(localStream).forEach(function (key) {
                    let stream = localStream[key]
                    if (stream) {
                        window.record.closeStream(stream)
                        localStream[key] = null
                    }
                })

                /***录制内容返回播放***/
                let blob = new Blob(event.Blobs, {'type': 'video/webm'});
                let url = window.URL.createObjectURL(blob);
                // if (data.type === 'video' || data.type === 'shareScreen' || data.type === "record") {
                    recordVideo.srcObject = null;
                // }
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
            // stopAudio()

            Object.keys(localStream).forEach(function (key) {
                let stream = localStream[key]
                if (stream) {
                    window.record.closeStream(stream)
                    localStream[key] = null
                }
            })

            /***录制内容返回播放***/
            let blob = new Blob(event.Blobs, {'type': 'audio/ogg'});
            let url = window.URL.createObjectURL(blob);
            // if (data.type === 'video' || data.type === 'shareScreen' || data.type === "record") {
            //     recordVideo.srcObject = null;
            // }
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
    tip.style.display = 'block'
    recordContrainer.style.display = 'none'
    // stopVideo()
    // stopShare()
    // stopAudio()
    Object.keys(localStream).forEach(function (key) {
        let stream = localStream[key]
        if (stream) {
            window.record.closeStream(stream)
            localStream[key] = null
        }
    })
    if(isRecord){
        isRecord = false
        recordButton.style.disabled = false
        recordButton.style.backgroundColor = "orangered "
        stopVideoRecord()
    }
    recordVideo.srcObject = null


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

window.addEventListener('load', function () {
    if (Record) {
        Record.prototype.preInit()
    }
    devicedsInfo()
})