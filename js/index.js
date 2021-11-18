


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

audioButton.addEventListener("click",stopAudioRecord)

recordButton.addEventListener("click", stopRecord)

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

function openAudio(){
    let data = {}
    data.type = 'audio'
    data.constraints = {
        audio: data.audio || true,
        video: {
            width: 720,   // 必须
            height: 360,  // 必须
            frameRate: 15,  // 可缺省，默认15fps
            deviceId: data.deviceId  || ' '
        }
    }
    data.callback = callback
    function callback(event){
        if(event.codeType === 999){
            localStream.audio = event.stream
            audioButton.textContent = "停止"
            // audio.srcObject = localStream.audio
            // audio.onloadedmetadata =function(){
            //     audio.play()
            // }
            // audio.style.display ="block"
            //   audio.style.border = "red"
            /**处理audioStream**/
            handleOnAudioProcess()
        }else{
            console.warn("获取音频失败")
        }
    }
    window.record.openAudio(data)
}

function stopAudio(){
    let data={}
    window.record.stopAudio(data)
}

function openVideo(data){
    if(data.type === 'video'){
        data.constraints = {
            audio: data.audio || true,
            video: {
                width: 720,   // 必须
                height: 360,  // 必须
                frameRate: 15,  // 可缺省，默认15fps
                deviceId: data.deviceId  || ' '
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
            openVideo({type: 'video'})
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
    // isGetCamera = false
    // isGetMic = false
    // isGetSpeaker = false
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
                    // audioOutput = event.microphones
                    option.value = microphone.deviceId
                    audioOutput.appendChild(option)
                    audioOutput.style.display = 'block'
                }
            }
        }
        if(devices && devices.speakers){
            for(let i=0; i < devices.speakers.length;i++){
                let speaker = devices.speakers[i]
                if(speaker.deviceId !== 'default' && speaker.deviceId !== 'communications'){
                    let option = document.createElement('option')
                    option.text = speaker.label || ''
                    // audioinput = event.speakers
                    option.value = speaker.deviceId
                    audioinput.appendChild(option)
                    audioinput.style.display = 'block'
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
    openVideo(data)
}

function getAudioOutput(){
    let option = audioOutput.options
    console.warn("option:",option)
    audioOutput.value = option[audioOutput.selectedIndex].value  // selectedIndex代表的是你所选中项的index
    console.warn("value:",audioOutput.value)
    selectDevice.style.display = 'none'
    audioOutput.style.display = "none"
}

function getCamera(){
    let option = cameraDeviced.options
    console.warn("option:",option)
    cameraDeviced.value = option[cameraDeviced.selectedIndex].value  // selectedIndex代表的是你所选中项的index
    console.warn("value:",cameraDeviced.value)
    selectDevice.style.display = 'none'
    cameraDeviced.style.display = "none"

    let data = {type: 'video', deviceId: cameraDeviced.value}
    openVideo(data)
}

function isHandleMute(){
    if(isMuteButton.textContent === '非静音'){

    }
}

function handleOnAudioProcess(){
    let source = audioCtx.createMediaStreamSource(localStream.audio);
    console.warn("source：",source)
    // source.connect(audioCtx.destination)
    // 创建一个jsNode
    let jsNode = createJSNode(audioCtx);
    // 需要连到扬声器消费掉outputBuffer，process回调才能触发
    // 并且由于不给outputBuffer设置内容，所以扬声器不会播放出声音
    jsNode.connect(audioCtx.destination);
    jsNode.onaudioprocess = onAudioProcess;
    // 把mediaNode连接到jsNode
    source.connect(jsNode);

    audio.style.display = "block"
    // let scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
    // source.connect(scriptProcessor);
    // scriptProcessor.connect(audioCtx.destination);
    // scriptProcessor.addEventListener("audioprocess", function (audioEvent) {
    //     let buffer = audioEvent.inputBuffer.getChannelData(0);
    //     instant = Math.max(...buffer)
    // });
}

function createJSNode(audioCtx){
    const BUFFER_SIZE = 4096;
    const INPUT_CHANNEL_COUNT = 2;
    const OUTPUT_CHANNEL_COUNT = 2;
    // createJavaScriptNode已被废弃
    let creator = audioCtx.createScriptProcessor || audioCtx.createJavaScriptNode;
    creator = creator.bind(audioCtx);
    return creator(BUFFER_SIZE,
        INPUT_CHANNEL_COUNT, OUTPUT_CHANNEL_COUNT);
}

function onAudioProcess (event) {
    // console.log(event.inputBuffer);
    let audioBuffer = event.inputBuffer;
    let leftChannelData = audioBuffer.getChannelData(0),
        rightChannelData = audioBuffer.getChannelData(1);
    // 需要克隆一下
    leftDataList.push(leftChannelData.slice(0));
    rightDataList.push(rightChannelData.slice(0));
}

function mergeArray (list) {
    let length = list.length * list[0].length;
    let data = new Float32Array(length),
        offset = 0;
    for (let i = 0; i < list.length; i++) {
        data.set(list[i], offset);
        offset += list[i].length;
    }
    return data;
}
function playRecord (arrayBuffer) {
    let blob = new Blob([new Uint8Array(arrayBuffer)]);
    console.warn("blob：", blob)
    let blobUrl = URL.createObjectURL(blob);
    // document.querySelector('.audio-node').src = blobUrl;
    audio.src = blobUrl
    audio.onloadedmetadata = function(e){
        audio.play()
        audioButton.textContent = "开始"
    };

}

// 交叉合并左右声道的数据
function interleaveLeftAndRight (left, right) {
    let totalLength = left.length + right.length;
    let data = new Float32Array(totalLength);
    for (let i = 0; i < left.length; i++) {
        let k = i * 2;
        data[k] = left[i];
        data[k + 1] = right[i];
    }
    return data;
}

// function createWavFile (audioData) {
//     const WAV_HEAD_SIZE = 44;
//     let buffer = new ArrayBuffer(audioData.length * 2 + WAV_HEAD_SIZE),
//         // 需要用一个view来操控buffer
//         view = new DataView(buffer);
//     // 写入wav头部信息
//     // RIFF chunk descriptor/identifier
//     writeUTFBytes(view, 0, 'RIFF');
//     // RIFF chunk length
//     view.setUint32(4, 44 + audioData.length * 2, true);
//     // RIFF type
//     writeUTFBytes(view, 8, 'WAVE');
//     // format chunk identifier
//     // FMT sub-chunk
//     writeUTFBytes(view, 12, 'fmt ');
//     // format chunk length
//     view.setUint32(16, 16, true);
//     // sample format (raw)
//     view.setUint16(20, 1, true);
//     // stereo (2 channels)
//     view.setUint16(22, 2, true);
//     // sample rate
//     view.setUint32(24, 44100, true);
//     // byte rate (sample rate * block align)
//     view.setUint32(28, 44100 * 2, true);
//     // block align (channel count * bytes per sample)
//     view.setUint16(32, 2 * 2, true);
//     // bits per sample
//     view.setUint16(34, 16, true);
//     // data sub-chunk
//     // data chunk identifier
//     writeUTFBytes(view, 36, 'data');
//     // data chunk length
//     view.setUint32(40, audioData.length * 2, true);
// }
function writeUTFBytes (view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function createWavFile (audioData) {
    // 写入wav头部，代码同上
    // 写入PCM数据
    let length = audioData.length;
    let index = 44;
    let volume = 1;
    let buffer = new ArrayBuffer(audioData.length * 2 + index);
//         // 需要用一个view来操控buffer
    let view = new DataView(buffer);
    for (let i = 0; i < length; i++) {
        view.setInt16(index, audioData[i] * (0x7FFF * volume), true);
        index += 2;
    }
    return buffer;
}
function stopAudioRecord () {
    // 停止录音
    if(audioButton.textContent === '停止'){
        let leftData = mergeArray(leftDataList),
            rightData = mergeArray(rightDataList);
        let allData = interleaveLeftAndRight(leftData, rightData);
        let wavBuffer = createWavFile(allData);
        playRecord(wavBuffer);
    }else{
        openAudio({type: 'audio'})
    }
}

function beginRecord(data){
    tip.style.display = "none";
    contrainer.style.opacity = "0.2";
    recordContrainer.style.display = 'block'

    data.stream = canvas.captureStream(60)
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
    window.record.recording(data)
}

function stopRecord(data){
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
                stopVideo()
                stopShare()
                Object.keys(localStream).forEach(function (key) {
                    console.warn("key:",key )
                    let stream = localStream[key]
                    if (stream) {
                        window.record.closeStream(stream)
                        localStream[key] = null
                    }
                })

                /***录制内容返回播放***/
                let blob = new Blob(event.Blobs, {'type': 'video/webm'});
                let url = window.URL.createObjectURL(blob);
                if (data.type === 'video' || data.type === 'shareScreen') {
                    recordVideo.srcObject = null;
                }
                recordVideo.src = url;
                recordVideo.controls = true
                recordVideo.play();
                console.warn("停止录制成功")
            }else{
                console.warn("停止录制失败")
            }
        }
        window.record.stopRecording(data)
    }

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
    window.record.download(data)
}

function restartRecord(){
    tip.style.display = 'block'
    recordContrainer.style.display = 'none'
    if(isRecord){
        isRecord = false
        recordButton.style.disabled = false
        recordButton.style.backgroundColor = "orangered "
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