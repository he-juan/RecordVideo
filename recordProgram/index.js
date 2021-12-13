let audio = document.createElement("audio")
let container = document.getElementById("container")

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

let video_Area = document.getElementsByClassName("videoArea")[0]
let textContrainter = document.getElementsByClassName("textContrainter")[0]
let input = document.getElementsByClassName("input")[0]
let textBtn = document.getElementsByClassName("textBtn")[0]

// let mainVideo = document.getElementsByClassName("mainVideo")[0]
// let slidesVideo = document.getElementsByClassName("slidesVideo")[0]
/***************************************音视频录制元素*********************************************/
let mainVideo = document.createElement("video")
let slidesVideo = document.createElement('video')
let localVideo = document.createElement('video')
let vtcanvas = document.getElementsByClassName("videoToCanvas")[0]
let context = vtcanvas.getContext('2d')

let canvasRecord = document.getElementsByClassName("canvasRecord")[0]

/***********************开启、关闭视频、演示的标志*****/
let isOpenVideo = false
let isOpenShareScreen = false
let isMute = false
let isRecording = false
let isUploadVideo = false
let currentMic = null
let currentSpeaker = null
let currentCamera = null


/**************** 绘制canvas定时器********************/
let switchTimeout
let shareTimeout
let stopTimeout

/** ******************像素匹配位置*******************/
let setX
let setY
let setWidth
let setHeight

let sx
let sy
let rangeH
let rangeW
let text
let count

/*********************获取canvas匹配位置**********************/
let canvasX
let canvasY


areaVideoArea.addEventListener("click",function(){
    window.record.currentRecoderType = "areaVideo"
    toggleVideoBtn.disabled = true
    toggleShareBtn.disabled = false

    // Object.keys(localStreams).forEach(function (key) {
    //     let stream = localStreams[key]
    //     if (stream) {
    //         window.record.closeStream(stream)
    //     }
    // })
    getCategory({type: 'shareScreen'})
})
videoArea.addEventListener("click",function () {
    window.record.currentRecoderType = "video"

    toggleVideoBtn.disabled = false
    toggleShareBtn.disabled = false
    toggleMuteBtn.disabled = false

    // Object.keys(localStreams).forEach(function (key) {
    //     let stream = localStreams[key]
    //     if (stream) {
    //         window.record.closeStream(stream)
    //     }
    // })

    getCategory({type: 'main'})
})

audioArea.addEventListener("click",function () {
    window.record.currentRecoderType = "audio"

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


function changeMic(){
    const audioSource = audioInputSelect.value;
    currentMic = audioSource
    console.warn("currentSpeaker:",currentMic)

    if(localStreams.audio){
        switchlocalMic()
    }else{
        console.warn("only switch localMicDeviceId")
    }
}

function changeAudioDestination() {
    const audioDestination = audioOutputSelect.value;
    attachSinkId(audio, audioDestination);
    currentSpeaker = audioDestination
    console.warn("currentSpeaker:",currentSpeaker)
}

function changeCamera(){
    const camera = cameraSelect.value;
    currentCamera = camera
    console.warn("currentCamera:",currentCamera)

    if(localStreams.main){
        switchLcoalCamera()
    }else{
        console.warn("only switch localCamera")
    }
}

function switchlocalMic (){
    if (localStreams.audio) {
        stopCategory({type: 'audio'})
    }

    if(window.record.currentRecoderType === 'areaVideo' || window.record.currentRecoderType === 'video'){
        getCategory({type: 'audio'})
    }

}


function switchLcoalCamera(){
    if(window.record.currentRecoderType === 'areaVideo' || window.record.currentRecoderType === 'video'){
        stopCategory({type: 'main'})
        getCategory({type: 'main'})
    }
}

audioInputSelect.onchange = changeMic;
audioOutputSelect.onchange = changeAudioDestination
cameraSelect.onchange = changeCamera

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


function toggleMuteButton(data){
    if(muteBtn.textContent === '静音'){
        if(!localStreams.audio){
            getCategory(data)
        }else{
            data.mute = true
            data.stream = localStreams.audio
            data.callback = function(event){
                if(event.stream){
                    muteBtn.textContent = "非静音"
                }
            }
            window.record.streamMuteSwitch(data)

        }
    }else if(muteBtn.textContent === '非静音'){
        data.mute = false
        data.stream = localStreams.audio
        data.callback = function(event){
            if(event.stream){
                muteBtn.textContent = "静音"
            }
        }
        window.record.streamMuteSwitch(data)

    }
}

function localVideoButton(){
    /**开始上传视频**/
    if(localVideoBtn.textContent === '上传视频'){
         window.cancelAnimationFrame(switchTimeout)
         window.cancelAnimationFrame(shareTimeout)


        if(window.record.currentRecoderType === 'areaVideo'){
             if(localStreams.slides){
                stopCategory({type: 'shareScreen'})
                localStreams.slides = null
             }

             if(localStreams.audio){
                stopCategory({type: 'audio'})
                localStreams.audio = null
             }
        }else if(window.record.currentRecoderType === 'video'){
            if(localStreams.slides){
                stopCategory({type: 'shareScreen'})
                localStreams.slides = null
             }

             if(localStreams.main){
                stopCategory({type: 'main'})
                localStreams.slides = null
             }

             if(localStreams.audio){
                stopCategory({type: 'audio'})
                localStreams.audio = null
             }
        }
        videoInput.click();
    }
}

/************************************************共享本地文件*********************************************************/
// let localVideo = document.createElement("video")
let videoInput = document.createElement('input');
// let fileName = document.getElementById('fileName')
let file;
let fileURL;
let ifMediaChange = false;

videoInput.setAttribute('type', 'file');
videoInput.setAttribute('id', 'localVideoInput');
videoInput.setAttribute('style', 'visibility: hidden');
document.body.appendChild(videoInput);


shareVideo.oncanplay = async function(){
    if(isUploadVideo ){
        handleCanPlay({elem: shareVideo})
    }
   
}

localVideo.onloadedmetadata = function(){
    console.info("localVideo: "+ localVideo.videoWidth + " * " + localVideo.videoHeight)
    localVideo.width = localVideo.videoWidth
    localVideo.height = localVideo.videoHeight
    vtcanvas.width = localVideo.width
    vtcanvas.height = localVideo.height
    vtcanvas.style.display = 'inline-block'
    localVideo.play()
    localVideo.autoplay = true
    localVideo.loop = true
    localStreams.localVideo = localVideo.captureStream(60) 

    videoToCanvas(localVideo, vtcanvas, context, vtcanvas.width, vtcanvas.height)
}

function videoToCanvas(video,canvas,ctx,rangeW,rangeH){
    ctx.drawImage(video,  0, 0, rangeW, rangeH);
    canvas.style.border = "none";
    stopTimeout = requestAnimationFrame(() => {
        videoToCanvas(video,canvas,ctx,rangeW,rangeH);
    })
}


videoInput.addEventListener('change', function(){
    if(isUploadVideo === true){
        console.warn('LocalVideo is sharing now.')
        let ifChange = confirm('是否要切换演示媒体文件?');
        if(ifChange){
            console.warn('Slides stream is going to change!')
            ifMediaChange = true
        }else{
            this.value = "";  // clear input
            return
        }
    }

    if (videoInput.files) {
        try {
            file = videoInput.files[0];
            fileURL = window.record.getObjectURL(file);
            let fileType = file.type.split('/')[0];
            if(fileType === 'audio' || fileType === 'video'){
                if(window.record.currentRecoderType === 'areaVideo'){
                    shareVideo.controls = 'controls'
                    shareVideo.setAttribute('src', fileURL);
                }

                if(window.record.currentRecoderType === 'video'){
                    localVideo.controls = 'controls'
                    localVideo.setAttribute('src', fileURL);
                }
                
                // fileName.innerHTML = videoInput.files[0].name

                try {
                    if(window.record.currentRecoderType === 'areaVideo'){
                        isUploadVideo = true
                        shareVideo.play();
                    }else if(window.record.currentRecoderType === 'video'){
                        isUploadVideo = true
                        // localVideo.play();
                    }
                    
                }catch (e) {
                    console.warn(e)
                }
            }else{
                console.warn('only support upload video or audio, please try again！')
            }
        }catch (e) {
            console.warn(e)
        }
    }

})


function handleCanPlay(data){

    if(!data || !data.elem){
         console.warn("handle canPlay is invalid parameters")
         return
    }
     /**
     * 帧率localMediaframeRate
     * 最大值为 30
     * 考虑到mcu解码可能吃不消
     * ipvt一般设置为 5
     */
    if (fileURL) {
        if (isUploadVideo === true){
            console.warn('switch local sharing source')
                if(ifMediaChange){
                    let rect = document.getElementsByClassName('rect')[0]
                    if(rect){
                        rect.style.display = "none"
                    }
                    ctx.clearRect(0, 0, shareCanvas.width, shareCanvas.height)
                    window.cancelAnimationFrame(stopTimeout)
                }
        } else {
            function callback(data) {
                console.warn('local video share on call back: ', data)
                if (data.codeType === 999){
                    // shareScreenBtn.disabled = true
                    // shareScreenBtn.style.background = "#8c818a"
                    // stopShareLoVidBtn.disabled = false
                    // stopShareLoVidBtn.style.background = "#3789a4"
                    // localShareVideoMuteBtn.hidden = false
                    isUploadVideo = true

                    
                    console.warn("share local video success...")
                }else {
                    if(data.reason){
                        alert(data.reason)
                    }
                    console.warn("share local video failed: ", data)

                }
            }
            // let data = {
            //     type:'slides',
            //     captureElem:data.elem,
            //     shareType:'localVideo',
            //     callback:callback
            // }
            // window.record.openShare(data)
        }
    }
}

/**
 * 停止共享本地视频
 */
function stopShareLocalVideo() {
    if (isUploadVideo === true){
        function callback(data) {
            console.warn("stopShareLocalVideo: ", data)
            if (data.codeType === 999){
                videoInput.value = ""
                localShareVideoMuteBtn.hidden = true
                fileName.innerHTML = ''
                shareScreenBtn.disabled = ''
                shareScreenBtn.style.background = "#3789a4"
                stopShareLoVidBtn.disabled = true
                stopShareLoVidBtn.style.background = "#8c818a"
                localVideoEle.setAttribute('src', '')
                ifMediaChange = false
                gsRTC.MEDIA_STREAMS.LOCAL_VIDEO_SHARE_STREAM = null
                gsRTC.isUploadVideo = false
                console.warn("<span>stop share local video success...</span>")
            } else {
                if(data.reason){
                    alert(data.reason)
                }
                console.warn("share video call failed: ", data)
                writeToScreen("<span>stop present failed...</span>")
            }
        }
        gsRTC.stopShareScreen({
            isStopShareLoVideo: true,
            type: 'slides',
            callback: callback
        })
    }
}


/***************************************************区域录制添加文字********************************************************* */
function writeTextOnCanvas(ctx, lh, rw, text) {
    let lineheight = lh;

    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.font = "16px 微软雅黑";
    ctx.fillStyle = "#f00";

    function getTrueLength(str) { //获取字符串的真实长度（字节长度）
        let len = str.length,
            truelen = 0;
        for (let x = 0; x < len; x++) {
            if (str.charCodeAt(x) > 128) {
                truelen += 2;
            } else {
                truelen += 1;
            }
        }
        return truelen;
    }

    function cutString(str, leng) { //按字节长度截取字符串，返回substr截取位置
        let len = str.length,
            tlen = len,
            nlen = 0;
        for (let x = 0; x < len; x++) {
            if (str.charCodeAt(x) > 128) {
                if (nlen + 2 < leng) {
                    nlen += 2;
                } else {
                    tlen = x;
                    break;
                }
            } else {
                if (nlen + 1 < leng) {
                    nlen += 1;
                } else {
                    tlen = x;
                    break;
                }
            }
        }
        return tlen;
    }
    // ctx.fillText(text, canvasX, canvasY );
    /**************处理添加文字自动换行******************/
    for (let i = 1; getTrueLength(text) > 0; i++) {
        let tl = cutString(text, 40);
        // ctx.fillText(text.substr(0, tl).replace(/^\s+|\s+$/, ""), 10, i * lineheight + 50);
        ctx.fillText(text.substr(0, tl).replace(/^\s+|\s+$/, ""), canvasX, i * canvasY + 10);
        text = text.substr(tl);
    }
}

shareCanvas.addEventListener("mousedown",function(e){
    let inputHeight = e.pageX - container.offsetLeft ;
    let inputWidth = e.pageY - container.offsetTop ;
    console.warn("mouseDown position:", canvasX  + '  *  ' + canvasY)

    canvasX = e.offsetX
    canvasY = e.offsetY

    textContrainter.style.position = 'absolute'
    textContrainter.style.zIndex = '1000';
    textContrainter.style.left = inputHeight + 'px';
    textContrainter.style.top = inputWidth + 'px';
    textContrainter.style.width = '300px'
    textContrainter.style.height = '100px';
    textContrainter.style.display = 'block'
    input.style.width = '300px'
    input.style.height = '100px';
})

input.onkeyup = function(){
    text = input.value
    finish()
    // playCanvas(shareVideo, shareCanvas, ctx, sx, sy, rangeW, rangeH, canvasX, canvasY, input.value)
}

textBtn.onclick = function(){
    textContrainter.style.display = 'none'
    input.value = ''
    text = ' '
    finish()
}


// writeTextOnCanvas("mycanvas", 22, 40, document.getElementById("input").value);
// document.getElementById("input").onkeyup = function() {
//     writeTextOnCanvas("mycanvas", 22, 40, this.value);
// }


/**
 * 获取录制类型,
 * 类型 type：如areaVideo、 video 、 audio
 */

function getCategory(data){
    console.warn("start handle getCategory:", data)
    if(!record){
        console.warn('record is not initialized')
        return
    }

    if(!data || !data.type){
        console.warn('invalid parameters')
        return
    }

    if(!localStreams && !localStreams.main && !localStreams.slides && !localStreams.localVideo){
        console.warn('localStreams is  null')
        return
    }

    if(window.record.currentRecoderType === 'areaVideo' || window.record.currentRecoderType === 'video'){
        if(data.type === 'audio'){
            data.callback = function(event){
                if(event.codeType === 999){
                    console.warn("open audio success")
                    localStreams.audio = event.stream
                    muteBtn.textContent = "非静音"
                    let audio = document.createElement("audio")
                    audio.srcObject = localStreams.audio
                    audio.onloadedmetadata = function(){
                        audio.play()
                    }
                }else{
                    console.warn("open audio failed")
                }
            }
            data.deviceId = currentMic || devices.microphones[0].deviceId
            openAudio(data)
        }

    }


   if(window.record.currentRecoderType === 'areaVideo'){
       if(data.type === 'shareScreen' || data.type === 'localVideo'){
           data.callback = function(event){
               if(event.codeType === 999){
                   console.warn("open shareScreen success",event)

                   shareBtn.textContent = "关闭共享"
                   shareVideo.style.display = 'inline-block'
                   // shareCanvas.style.display = 'inline-block'
                   toggleShareBtn.textContent = "关闭共享"

                   video_Area.height = shareVideo.videoHeight
                   video_Area.width = shareVideo.videoWidth

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
   }else if(window.record.currentRecoderType === 'video'){
       if(data.type === 'main' || data.type === 'localVideo'){
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
           data.deviceId =  currentCamera || devices.cameras[0].deviceId
           openVideo(data)
       }else if(data.type === 'shareScreen'){
           data.callback = function(event){
               if(event.codeType === 999){
                   console.warn(" open shareScreen success: ", event)
                   shareBtn.textContent = "关闭共享"
                   isOpenShareScreen = true

                   vtcanvas.style.display = 'inline-block'
                   canvasRecord.style.display = "none"
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
           openShare(data)
       }
   }else if(window.record.currentRecoderType === 'audio'){

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
    if(window.record.currentRecoderType === 'areaVideo' || window.record.currentRecoderType === 'video'){
        if(data.type === 'audio'){
            if(localStreams.audio){
                data.callback = function(event){
                    if(event.codeType === 999){
                        console.warn("open audio success")
                    }else{
                        console.warn("open audio failed")
                    }
                }
                stopAudio(data)
            }
        }
    }

    if(window.record.currentRecoderType === 'areaVideo'){
        if(data.type === 'shareScreen' || data.type === 'localVideo'){
            if(localStreams.slides){
                data.callback = function(event){
                    if(event.codeType === 999){
                        console.warn("stop shareScreen success: " , event )
                        toggleShareBtn.textContent = "开启共享"
                        let rect = document.getElementsByClassName('rect')[0]
                        if(rect){
                            rect.style.display = "none"
                        }
                        ctx.clearRect(0, 0, shareCanvas.width, shareCanvas.height)
                        window.cancelAnimationFrame(stopTimeout)
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
        }
    }else if(window.record.currentRecoderType === 'video') {
        if(data.type === 'main' || data.type === 'localVideo'){
           if(localStreams.main){
               data.callback = function(event){
                   if(event.codeType === 999){
                       console.warn(" stop video success: ", event )
                       videoBtn.textContent = "开启视频"
                       isOpenVideo = false
                       window.cancelAnimationFrame(switchTimeout)
                       context.clearRect(setX, setY, setWidth, setHeight)
                       draw()

                   }else{
                       console.warn(" stop video failed")
                   }
               }
               stopVideo(data)
           }
        }else if(data.type === 'shareScreen'){
            if(localStreams.slides){
                data.callback = function(event){
                    if(event.codeType === 999){
                        console.warn(" open shareScreen success: ", event)
                        shareBtn.textContent = "开启共享"
                        isOpenShareScreen = false
                        window.cancelAnimationFrame(shareTimeout)
                        context.clearRect(setX, setY, setWidth, setHeight)
                        draw()
                    }else{
                        console.warn(" open shareScreen failed")
                    }
                }
                stopShare(data)
            }
        }
    }else if(window.record.currentRecoderType === 'audio'){

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
    window.cancelAnimationFrame(switchTimeout)
    window.cancelAnimationFrame(shareTimeout)

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

    shareTimeout = window.requestAnimationFrame(() => {
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

    switchTimeout = window.requestAnimationFrame(() => {
        switchToCanvas(type, video, sx, sy, swidth, sheight, x, y, width, height);
    })

}



// *********************************************区域录制获取区域阶段**************************************************************
// let shareCanvas = document.getElementsByClassName("shareCanvas")[0]
function finish() {
    if(window.record.currentRecoderType !== 'areaVideo'){
        console.warn("current recoderType is not areaVvideo")
        return
    }
    // if(text){
    //     window.cancelAnimationFrame(stopTimeout)
    // }
    window.cancelAnimationFrame(stopTimeout)
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
    shareCanvas.style.display = 'inline-block'
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
    playCanvas(shareVideo, shareCanvas, ctx, sx, sy, rangeW, rangeH, canvasX, canvasY, text);
}



/*
* video视频转换到canvas中
* */
function playCanvas(video,canvas,ctx,sx,sy,rangeW,rangeH, canvasX, canvasY, text){

    ctx.drawImage(video, sx, sy, rangeW, rangeH, 0, 0, canvas.width, canvas.height);
    canvas.style.border = "none";
    if(text ){
        writeTextOnCanvas(ctx, 22,40,text)
    }

    stopTimeout = requestAnimationFrame(() => {
        playCanvas(video, canvas, ctx, sx, sy, rangeW, rangeH, canvasX, canvasY, text);
    })
}


// *****************************************录制阶段*********************************************************

function beginRecord() {
    if (!record ) {
        console.warn('record is not initialized')
        return
    }
    if ( !(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo) ) {
        console.warn("localStream is null")
        return
    }
    console.warn("start record...")
    let mixStream = []
    let data = {}
    let canvasStream

    if(window.record.currentRecoderType === 'areaVideo'){
        canvasStream = shareCanvas.captureStream(60)
    }else if(window.record.currentRecoderType === 'video'){
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

    if (window.record.currentRecoderType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("begin Record success:",event)
                isRecording = true
                shareRecord.style.display = "inline-block"
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
    } else if (window.record.currentRecoderType === 'video') {
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
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)) {
        console.warn("localStream is null")
        return
    }
    console.warn("stop record...")

    let data = {}

    if (window.record.currentRecoderType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("stop record success:", event)
                ctx.clearRect(0, 0, shareCanvas.width, shareCanvas.height)
                ctx.clearRect(0, 0, shareCanvas.width, shareCanvas.height)
                let rect = document.getElementsByClassName('rect')[0]
                if(rect){
                    rect.style.display = "none"
                }
                ctx.clearRect(0, 0, shareCanvas.width, shareCanvas.height)
                window.cancelAnimationFrame(stopTimeout)
                shareVideo.style.display = 'none'
                shareCanvas.style.display = 'none'
                shareVideo.style.width = '0px'
                shareVideo.style.height = '0px'

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
                Object.keys(localStreams).forEach(function (key) {
                    if(key === 'audio'){
                        stopCategory({type: 'audio'})
                    }else if (key === 'main'){
                        stopCategory({type: 'main'})
                    }else if(key ==='localVideo'){
                        stopCategory({type: 'localVideo'})
                    } else if(key === 'slides'){
                        stopCategory({type: 'shareScreen'})
                    }
                    let stream = localStreams[key]
                    if (stream) {
                        window.record.closeStream(stream)
                        localStreams[key] = null
                    }
                })


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
        // window.record.videoMediaRecorder.stop()
    } else if (window.record.currentRecoderType === 'video') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("stop record success:", event)
                isRecording = false
                let buffer = event.stream.recordedBlobs
                canvasRecord.srcObject = event.stream.stream
                window.cancelAnimationFrame(switchTimeout)
                window.cancelAnimationFrame(shareTimeout)
                context.clearRect(0, 0, vtcanvas.width, vtcanvas.height)
                vtcanvas.style.display = 'none'

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

                Object.keys(localStreams).forEach(function (key) {
                    if(key === 'audio'){
                        stopCategory({type: 'audio'})
                    }else if (key === 'main'){
                        stopCategory({type: 'main'})
                    }else if(key ==='localVideo'){
                        stopCategory({type: 'localVideo'})
                    } else if(key === 'slides'){
                        stopCategory({type: 'shareScreen'})
                    }
                    let stream = localStreams[key]
                    if (stream) {
                        window.record.closeStream(stream)
                        localStreams[key] = null
                    }
                })

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
        // window.record.videoMediaRecorder.stop()
    }
}

function pauseRecord(){
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)) {
        console.warn("localStream is null")
        return
    }
    console.warn("pause record...")

    let data = {}

    if (window.record.currentRecoderType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("pause record success:", event)
                shareRecord.pause();
            } else {
                console.warn("pause record failed")
            }
        }
        // window.record.pauseVideoRecord(data)
        window.record.videoMediaRecorder.pause()
        shareRecord.pause();
    } else if (window.record.currentRecoderType === 'video') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("pause record success:", event)
                canvasRecord.pause();
            } else {
                console.warn("pause record failed")
            }
        }
        // window.record.pauseVideoRecord(data)
        window.record.videoMediaRecorder.pause()
        canvasRecord.pause();
    }
}


function resumeRecord(){
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)) {
        console.warn("localStream is null")
        return
    }
    console.warn("resume record...")

    let data = {}

    if (window.record.currentRecoderType === 'areaVideo') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("resume record success:", event)
                shareRecord.play();
            } else {
                console.warn("resume record failed")
            }
        }
        // window.record.resumeVideoRecord(data)
        window.record.videoMediaRecorder.resume()
        shareRecord.play()
    } else if (window.record.currentRecoderType === 'video') {
        data.callback = function (event) {
            if (event.codeType === 999) {
                console.warn("resume record success:", event)
                canvasRecord.play();
            } else {
                console.warn("resume record failed")
            }
        }
        // window.record.resumeVideoRecord(data)
        window.record.videoMediaRecorder.resume()
        canvasRecord.play()
    }
}


function download(){
    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)) {
        console.warn("localStream is null")
        return
    }

    let data = {}
    data.callback = function (event) {
        if (event.codeType === 999) {
            console.warn("download record success:", event)
        } else {
            console.warn("download record failed")
        }
    }
    if (window.record.currentRecoderType === 'areaVideo' || window.record.currentRecoderType === 'video') {
        window.record.videoDownload(data)
    } else if (window.record.currentRecoderType === 'audio') {

    }
}


function restartRecord(){

    if (!record) {
        console.warn('record is not initialized')
        return
    }
    if (!localStreams.audio || !localStreams.main || !localStreams.slides || !localStreams.localVideo) {
        console.warn("localStream is null")
        return
    }

    if(!(localStreams.audio || localStreams.main || localStreams.slides || localStreams.localVideo)){
        console.warn("This.localStreams has  been closed")
        Object.keys(localStreams).forEach(function (key) {
            let stream = localStreams[key]
            if (stream) {
                window.record.closeStream(stream)
            }
            localStreams.audio = null
            localStreams.main = null
            localStreams.localVideo = null
            localStreams.slides = null
        })
    }



    if (window.record.currentRecoderType === 'areaVideo' ) {
        shareVideo.style.display = "none"
        shareCanvas.style.display = 'none'
        shareRecord.style.display = 'none'
        let rect = document.getElementsByClassName('rect')[0]
        if(rect){
            rect.style.display = "none"
        }
        ctx.clearRect(0, 0, shareCanvas.width, shareCanvas.height)
        window.cancelAnimationFrame(stopTimeout)
    } else if (window.record.currentRecoderType === 'video') {
        vtcanvas.style.display = 'none'
        canvasRecord.style.display = "none"
    }else if(window.record.currentRecoderType === 'audio'){

    }
}




// *****************************************初始化阶段****************************************************

window.addEventListener('load', function () {
    if (Record) {
        Record.prototype.preInit()
    }
    window.record.currentRecoderType = currentRecodeType
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
