

// let audioButton = document.getElementsByClassName("audioRecording")
// let videoButton = document.getElementsByClassName("videoRecording")
let stream
let buffer
let tip = document.getElementById("tip")
let contrainer = document.getElementById("contrainer")
let recordContrainer = document.getElementById("record")
let video = document.getElementById("video")
let shareVideo = document.getElementById("shareScreen")
let recordVideo = document.getElementById("recordVideo")
let recording = document.getElementsByClassName("recording")[0]
let recordButton = document.getElementsByClassName("recorded")[0]

let videoButton = document.getElementsByClassName('videoAction')[0]
let screenButton = document.getElementsByClassName('share')[0]
let isMuteButton = document.getElementsByClassName('isMute')[0]
let getDeviced = document.getElementsByClassName("getDeviced")[0]
let setDeviceds = document.getElementsByClassName('setDeviced')[0]

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

let isOpenVideo = false
let isOpenShareScreen = false
let isMute = false

let  switchTimeOut
let  shareTimeOut

let localStream ={
    audio: null,
    main: null,
    slides: null,
}

videoButton.addEventListener("click",toggleVideoButton)
screenButton.addEventListener("click",toggleShareButton)
getDeviced.addEventListener("click",setDeviced)
// cameraSelect.addEventListener("click",displayAudioInput)

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
    let rangeW = videoWidth * (700 / (offsetWidth -2));   //offsetWidth包括border、padding
    let rangeH = videoHeight * (350 / (offsetHeight -2));
    canvas.height = rangeH;
    canvas.width  = rangeW;

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

        switchToCanvas(videoType, video, 0, 0, video.videoWidth, video.videoHeight, 520, 260, 200, 100)

    }

    if(videoType === 'openShareOpenVideo'){
        window.cancelAnimationFrame(switchTimeOut)
        window.cancelAnimationFrame(shareTimeOut)
        context.clearRect(0, 0, canvas.width ,canvas.height)
        console.warn("两者都有openShareOpenVideo")
        console.warn("video.videoWidth:",video.videoWidth)
        console.warn("video.videoHeight:",video.videoHeight)


        shareToCanvas(videoType, shareVideo,0, 0, 0, 0, 0, 0, canvas.width, canvas.height)

        switchToCanvas(videoType, video, 0, 0, video.videoWidth, video.videoHeight, 520, 260, 200, 100)

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
    tip.style.display = "block";
    contrainer.style.opacity = "0.2";
    if(videoButton.textContent === '关闭视频'){
        openVideo(data)
        // getMedia(data)
    }
    // else if(screenButton.textContent === '屏幕共享'){
    //     openShare(data)
    // }else if(isMuteButton.textContent === '非静音'){
    //
    // }
}

function closePopUp () {
    tip.style.display = "none";
    contrainer.style.opacity = "1";
}

function closeButton(){
    recordContrainer.style.display = 'none';
    contrainer.style.opacity = "1";
}


function openVideo(data){
    if(data.type === 'video'){
        data.constraints = {
            audio: true,
            video: {
                width: 720,   // 必须
                height: 360,  // 必须
                frameRate: 15,  // 可缺省，默认15fps
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


function toggleVideoButton(){
    let data = {}
    if(videoButton.textContent === '开启视频'){
        if(localStream && localStream.main){
            console.warn("存在视频流")
        }else{
            openVideo({type: 'video'})
        }
    }else{
        data.callback = callback
        function callback(event){
            if(event.codeType === 999){
                isOpenVideo = false
                window.record.closeStream(localStream.main)
                localStream.main = null
                videoButton.textContent = '开启视频'

                window.cancelAnimationFrame(switchTimeOut)
                context.clearRect(520, 260, 200, 100)
                draw()

            }
        }
        window.record.stopVideo(data)
    }
}


function toggleShareButton(){
    let data = {}
    if(screenButton.textContent === '屏幕共享'){
       if(localStream && localStream.slides){
           console.warn("存在演示流")
       }else{
           openShare({type: 'shareScreen'})
       }
    }else{
        data.callback= callback
        function callback(event){
            if(event.codeType === 999){
                isOpenShareScreen = false
                window.record.closeStream(localStream.slides)
                localStream.slides = null
                screenButton.textContent = '屏幕共享'

                window.cancelAnimationFrame(shareTimeOut)
                context.clearRect(520, 260, 200, 100)
                draw()
            }
        }
        window.record.stopShare(data)
    }
}

function setDeviced(){
    setDeviceds.style.display = 'block'
    let data = {}
    data.callback = callback
    function callback(event){
        console.warn("event:",event)
        // debugger
        if(event.cameras){
            for(let i=0; i< event.cameras.length;i++){
                let option = document.createElement('option')
                let deviced = event.cameras[i]
                option.text = deviced.label || ''
                // cameraDeviced = event.cameras
                option.value = deviced.deviceId
                cameraDeviced.appendChild(option)
            }
        }
        if(event.microphones){
            for(let i=0; i< event.microphones.length;i++){
                let deviced = event.microphones[i]
                if(deviced.deviceId !== 'default' && deviced.deviceId !== 'communications'){
                    let option = document.createElement('option')
                    option.text = deviced.label || ''
                    // audioOutput = event.microphones
                    option.value = deviced.deviceId
                    audioOutput.appendChild(option)
                }
            }
        }
        if(event.speakers){
            for(let i=0; i< event.speakers.length;i++){
                let deviced = event.speakers[i]
                if(deviced.deviceId !== 'default' && deviced.deviceId !== 'communications'){
                    let option = document.createElement('option')
                    option.text = deviced.label || ''
                    // audioinput = event.speakers
                    option.value = deviced.deviceId
                    audioinput.appendChild(option)
                }
            }
        }else{
            console.log('Some other kind of source/device: ', event);
        }
    }
    window.record.enumDevices(data)
}

function beginRecord(data){
    tip.style.display = "none";
    contrainer.style.opacity = "0.2";
    recordContrainer.style.display = 'block'
    // recordContrainer.disabled = false

    data.stream = canvas.captureStream()
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
    data.callback = callback
    function callback(event){
        console.warn("event:",event)
        if(event.codeType === 999){
            buffer = event.recordedBlobs
            recordButton.disabled = true
            recordButton.style.backgroundColor = '#A2A2A2'

            /**停止录制后需要关闭流**/
            let tracks = recordVideo.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            // video.srcObject.getTracks().forEach(track => track.stop())
            // shareVideo.srcObject.getTracks().forEach(track => track.stop())

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
   recordButton.style.disabled = false
   recordButton.style.backgroundColor = "orangered "

}


// window.addEventListener("onload", function(){
//     console.warn("window onload...")
//     window.record = new Record()
// })

window.addEventListener('load', function () {
    let oReadyStateTimer = setInterval(function () {
            if (document.readyState === 'complete') {
                if (Record) {
                    clearInterval(oReadyStateTimer)
                    Record.prototype.preInit()
                }
            }
        },
        500)
})