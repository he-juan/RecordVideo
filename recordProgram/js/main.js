

function openVideo(data){
    console.warn("openVideo:"+ JSON.stringify(data, null, '    ') )
    if(!data || !data.callback){
        console.warn("openAreaVideo: invalid parameters")
    }

    data.constraints = {
        audio:  false,
        video: {
            width: 720,   // 必须
            height: 360,  // 必须
            frameRate: 15,  // 可缺省，默认15fps
            deviceId: data.deviceId  || ''
        }
    }
    window.record.openVideo(data)
}

function stopVideo(data) {
    console.warn("stopVideo:"+ JSON.stringify(data, null, '    ') )
    if(!data || !data.callback){
        console.warn("openAreaVideo: invalid parameters")
    }
    window.record.stopVideo(data)
}

function openShare(data){
    console.warn("openAreaVideo:"+ JSON.stringify(data, null, '    ') )
    if(!data){
        console.warn("openAreaVideo: invalid parameters")
    }
    data.constraints = {
        audio: false ,
        video: {
            width: 720,   // 必须
            height: 360,  // 必须
            frameRate: 15,  // 可缺省，默认15fps
        }
    }
    window.record.openShare(data)
}

function stopShare(data){
    console.warn("stopAreaVideo:"+ JSON.stringify(data, null, '    ') )
    if(!data || !data.callback){
        console.warn("stopVideo: invalid parameters")
    }
    window.record.stopShare(data)
}

















