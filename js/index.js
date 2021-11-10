

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


let isOpenVideo = false
let isOpenShareScreen = false
let isMute = false
// let cameraSelect
// let micSelect
// let speakerSelect

let localStream ={
    audio: null,
    main: null,
    slides: null,
}


videoButton.addEventListener("click",toggleVideoButton)
screenButton.addEventListener("click",toggleShareButton)
getDeviced.addEventListener("click",setDeviced)
// cameraSelect.addEventListener("click",displayAudioInput)

function displayAudioInput(){

}

function getArea(data){
    tip.style.display = "block";
    contrainer.style.opacity = "0.2";
    if(videoButton.textContent === '关闭视频'){
        // isStopVideo = false
        getMedia(data)
    }else if(isStopShareScreen.textContent === '屏幕共享'){
        // isStopShareScreen = false
        getMedia(data)
    }else if(isMuteButton.textContent === '非静音'){
        // isMute = false
        getMedia(data)
    }
}

function closePopUp () {
    tip.style.display = "none";
    contrainer.style.opacity = "1";
}

function closeButton(){
    recordContrainer.style.display = 'none';
    contrainer.style.opacity = "1";
}


function getMedia(data) {

    data.callback = callback
    if(data.type === 'audio'){
        data.constraints = {audio:true, video:false }
    }else if(data.type === 'video'){
        data.constraints = {
            audio: true,
                video: {
                width: 720,   // 必须
                    height: 360,  // 必须
                    frameRate: 15,  // 可缺省，默认15fps
            }
        }
        window.record.openVideo(data)
    }else if(data.type === 'shareScreen'){
        data.constraints = {
            audio: false ,
                video: {
                width: 1920,   // 必须
                    height: 1080,  // 必须
                    frameRate: 15,  // 可缺省，默认15fps
            }
        }
        window.record.openShare(data)
    }


    function callback(event){
        console.warn("Video:",event)
        if(event.codeType === 999){

            if(event.type === 'main'){
               isOpenVideo = true
                localStream.main = event.stream
            }

            if(event.type === 'slides'){
                isOpenShareScreen = true
                localStream.slides = event.stream
            }

            if(isOpenVideo){
                if(isOpenShareScreen){
                    if(videoButton.textContent === '开启视频'){
                        console.warn("开启视频**************************")
                        videoButton.textContent = '关闭视频'

                        video.style.width = '100px';
                        video.style.height = '50px';
                        video.style.zIndex = '999';
                        video.style.position = "absolute"
                        video.style.left = '600px';
                        video.style.top = '300px';
                        isOpenVideo = true

                        video.style.display = 'block'
                        video.srcObject = localStream.main
                        video.onloadedmetadata = function(e) {
                            video.play();
                        };
                    }


                    if(screenButton.textContent === '屏幕共享'){
                        console.warn("屏幕共享**********************")
                        screenButton.textContent = '停止共享'
                        isOpenShareScreen = true
                        shareVideo.style.width = '100%';
                        shareVideo.style.height = '350px';
                        shareVideo.style.marginTop = '0px';
                        shareVideo.style.zIndex = '-1';
                        shareVideo.style.position = 'static';

                        shareVideo.srcObject = localStream.slides
                        shareVideo.onloadedmetadata = function(e){
                            shareVideo.play()
                        }
                    }

                }else{

                    if(videoButton.textContent === '关闭视频'){
                        isOpenVideo = false
                        isOpenShareScreen = false
                        video.style.display = 'block'
                        video.srcObject = localStream.main
                        video.onloadedmetadata = function(e) {
                            video.play();
                        };
                    }

                    if(videoButton.textContent === '开启视频'){
                        isOpenVideo = true
                        isOpenShareScreen = false

                        video.style.display = 'block'
                        video.style.width = '100%';
                        video.style.height = '350px';
                        video.style.marginTop = '0px';

                        video.srcObject = localStream.main
                        video.onloadedmetadata = function(e) {
                            video.play();
                        };
                    }
                }
            }

            if(isOpenShareScreen){
                if(isOpenVideo){
                    console.warn("222222222222222222222*********** 开视频和共享")
                    video.style.width = '100px';
                    video.style.height = '50px';
                    video.style.zIndex = '999';
                    video.style.position = "absolute"
                    video.style.left = '600px';
                    video.style.top = '300px';


                    shareVideo.style.width = '100%';
                    shareVideo.style.height = '350px';
                    shareVideo.style.marginTop = '0px';
                    shareVideo.style.zIndex = '-1';
                    shareVideo.style.display = 'block'
                    shareVideo.style.position = 'static';
                    shareVideo.srcObject = localStream.slides
                    shareVideo.onloadedmetadata = function(e){
                        shareVideo.play()
                    }

                }else{
                    console.warn("22222222222****************************开启共享")
                    if(videoButton.textContent === '关闭视频'){
                        console.warn("开启视频**************************")
                        isOpenVideo = true
                        isOpenShareScreen = true
                        video.style.width = '100px';
                        video.style.height = '50px';
                        video.style.zIndex = '999';
                        video.style.position = "absolute"
                        video.style.left = '600px';
                        video.style.top = '300px';

                        video.style.display = 'block'

                        shareVideo.style.display = 'block'
                        shareVideo.style.position = "static"
                        screenButton.textContent = '停止共享'
                        shareVideo.srcObject = localStream.slides
                        shareVideo.onloadedmetadata = function(e) {
                            shareVideo.play();
                        };
                    }

                    if(videoButton.textContent === '开启视频' &&  screenButton.textContent ==='屏幕共享'){
                        isOpenVideo = false
                        isOpenShareScreen = true
                        screenButton.textContent = '停止共享'

                        shareVideo.style.display = 'block'
                        shareVideo.style.position = "static"
                        shareVideo.style.width = '100%';
                        shareVideo.style.height = '350px';
                        shareVideo.style.marginTop = '0px';
                        shareVideo.srcObject = localStream.slides
                    }
                }
            }

        }else{
            console.warn("失败")
        }
    }
}


function toggleVideoButton(){
    let data = {}
    if(videoButton.textContent === '开启视频'){
        if(localStream && localStream.main){
            console.warn("存在视频流")
        }else{
            getMedia({type: 'video'})
        }
    }else{
        data.callback = callback
        function callback(event){
            if(event.codeType === 999){
                isOpenVideo = false
                window.record.closeStream(localStream.main)
                localStream.main = null
                video.style.display = 'none'
                videoButton.textContent = '开启视频'
                video.style.position = 'static';
                shareVideo.style.position = 'absolute';
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
           getMedia({type: 'shareScreen'})
       }
    }else{
        data.callback= callback
        function callback(event){
            if(event.codeType === 999){
                isOpenShareScreen = false
                window.record.closeStream(localStream.slides)
                localStream.slides = null
                shareVideo.style.display = 'none'
                shareVideo.style.position = 'absolute';
                screenButton.textContent = '屏幕共享'

               if(isOpenVideo){
                   video.style.width = '100%';
                   video.style.height = '350px';
                   video.style.marginTop = '0px';
                   video.style.position = 'static';
               }else{
                   // video.style.position = 'absolute'
               }
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
    console.warn("stream:",stream)
    if(localStream.slides){
        data.stream = localStream.slides
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
                console.warn("失败")
            }
        }
        window.record.recording(data)
    }
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