const record = function (r) {
    r.start();
    setTimeout(function () {
        r.stop();
    }, 1000);
}

function splitToNChunks(array, n) {
    let result = [];
    let m = Math.max(...array);
    for (let i = n; i > 0; i--) {
        let range = array.splice(0, Math.ceil(array.length / i));
        result.push(Math.max(...(range.map((x)=>Math.abs(x))))/m);
    }
    return result;
}

const isjump = (data,i)=>(data[i]>0.35 && data[i-1]<=0.3);

const analyze = function(data) {
    let result = [];
    console.log("start analasis");
    let last;
    for (let i = 1; i < data.length; i++) {
        if (isjump(data,i)){
            if (last){
                result.push(i-last);
            }
            last = i;
        }
    }
    result = result.sort();
    let median = result[Math.floor(result.length/2)];
    
    let validSum = 0;
    let validCount = 0;
    result.forEach((x)=>{
        if (Math.abs(Math.log(median/x))<Math.log(1.05)) {
            validCount++;
            validSum += x;
        }
    });
    return validCount>=5 ? (60/(validSum/validCount/data.length)/3) : "not enough data";
}


const graph = function(data) {
    let c = document.getElementById("myCanvas");
    let ctx = c.getContext("2d");
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.clearRect(0, 0, c.width, c.height);
    
    for (let i = 0; i < data.length; i++) {
        let pos = c.width/data.length * i;
        if (isjump(data,i)) {
            ctx.fillStyle = "rgb(255, 0, 0)";
            ctx.fillRect(pos, 0, 3, c.height);
        } else {
            ctx.fillStyle = "rgb(0, 0, 255)";
            ctx.fillRect(pos, c.height-(data[i]*100), 1, (data[i]*100));
        }
        
    }
}


navigator.mediaDevices.getUserMedia({audio:true}).then(function (stream){
    const mediaRecorder = new MediaRecorder(stream);
    const audioContext = new AudioContext();
    mediaRecorder.ondataavailable = function (blob){
        blob.data.arrayBuffer().then((ab)=>{
            audioContext.decodeAudioData(ab).then((audiobuffer)=>{
                const channeldata = audiobuffer.getChannelData(0);
                const processed = splitToNChunks([...channeldata],2000);
                document.getElementById("text").innerHTML = analyze(processed);
                graph(processed);
            });
        });
        record(mediaRecorder);
    };
    record(mediaRecorder);
})