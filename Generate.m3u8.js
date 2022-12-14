const child_process = require("child_process");
const fs = require("fs");
const main = require("./transcoder")
const { v4: uuid} = require("uuid")


async function Manifest(filename) {

    ffdata = await getFFinfo(filename);
    videoDuration = parseFloat((ffdata.streams.find((e) => e.duration)).duration);
    
    Streamuuid = "9f23ee3c-c918-404b-830c-d8d8de6ff5d9";
    m3u8_data = `#EXTM3U\r#EXT-X-VERSION:3\r#EXT-X-PLAYLIST-TYPE:VOD\r#EXT-X-TARGETDURATION:${main.hlstime + 1}`
    vd = 0;

    for(e = 0; videoDuration !== vd; e++ )
    {
    
    if((vd + main.hlstime) > videoDuration)
    {

    m3u8_data = m3u8_data + `\r#EXTINF:${(videoDuration - vd).toFixed(3)},\r/hls/${Streamuuid}/segment/${e}/endseg`
    // console.log(vd, hlstime, durate, e)
    videoDuration = vd
    
    
    }else
    {

        m3u8_data = m3u8_data + `\r#EXTINF:${main.hlstime.toFixed(3)},\r/hls/${Streamuuid}/segment/${e}/endseg`
        vd = vd + main.hlstime;
    }
    
        
    }
    m3u8_data += "\r#EXT-X-ENDLIST"
    if(fs.existsSync("./manifest/" + Streamuuid + `_.m3u8`)) fs.unlinkSync("./manifest/" + Streamuuid + `_.m3u8`);
    fs.writeFileSync("./manifest/" + Streamuuid + `_.m3u8`, m3u8_data)
    return { index : "./manifest/" + Streamuuid + "_.m3u8", filename, uuid : Streamuuid, ffmpeg : { running : false}, videoInfo : ffdata};



    

}



function getFFinfo(filename)
{

return new Promise((resolve, rejects) => {
    var duration = child_process.spawn("./ffprobe.exe", ["-i", filename, "-v", "error", "-show_streams", "-of", "json"]);

    durate = "";

    duration.stdout.on("data", (data) => {

        durate += data.toString();


    })

    duration.stderr.on("data", (data) => {

        throw new Error("Failed get Video Duration");

    })

    duration.on("exit", (code) => {

        resolve(JSON.parse(durate));

    });
})

}
module.exports = {
    Manifest

}