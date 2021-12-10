

function openAreaVideo(data){
    console.warn("openAreaVideo:"+ JSON.stringify(data, null, '    ') )
    if(!data){
        console.warn("openAreaVideo: invalid parameters")
    }
    let param ={}
    param.constraints = {
        audio: false ,
        video: {
            width: 720,   // 必须
            height: 360,  // 必须
            frameRate: 15,  // 可缺省，默认15fps
        }
    }
    param.callback = data.callback
    // function callback(event){
    //     if(event.codeType === 999){
    //         console.warn("get AreaVideo success")
    //         data && data.handleCallback({codeType: event.codeType, stream: event.stream})
    //     }else{
    //         console.warn("get AreaVideo failed")
    //         data && data.handleCallback({codeType: event.codeType})
    //     }
    // }
    window.record.openShare(param)
}

function stopAreaVideo(data){
    console.warn("stopAreaVideo:"+ JSON.stringify(data, null, '    ') )
    if(!data){
        console.warn("openAreaVideo: invalid parameters")
    }
    let param = data
    param.callback = data.callback
    // function callback(event){
    //     if(event.codeType === 999){
    //         console.warn("get AreaVideo success")
    //         data && data.handleCallback({codeType: event.codeType, stream: event.stream})
    //     }else{
    //         console.warn("get AreaVideo failed")
    //         data && data.handleCallback({codeType: event.codeType})
    //     }
    // }
    window.record.stopShare(param)
}


function openVideo(data){
    console.warn("openAreaVideo:"+ JSON.stringify(data, null, '    ') )
    if(!data ){
        console.warn("openAreaVideo: invalid parameters")
    }

    let param ={}
    param.constraints = {
        audio:  false,
        video: {
            width: 720,   // 必须
            height: 360,  // 必须
            frameRate: 15,  // 可缺省，默认15fps
            deviceId: data.deviceId  || ''
        }
    }
    param.callback = data.callback

    window.record.openVideo(data)
}

function stopVideo(data) {
    if(data.type === 'areaVideo') {
        data.callback = callback
        function callback(event) {
            if (event.codeType === 999) {
                isOpenVideo = false
                window.record.closeStream(localStream.main)
                localStream.main = null

                // window.cancelAnimationFrame(switchTimeOut)
                // context.clearRect(setX, setY, setWidth, setHeight)
                // draw()

            }
        }
        window.record.stopVideo(data)
    }
}















