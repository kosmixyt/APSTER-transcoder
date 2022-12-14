const child_process = require("child_process");
const main = require("./transcoder")
var ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('./ffmpeg.exe');
ffmpeg.setFfprobePath("./ffprobe.exe");
const  EventEmitter = require("events");


getGood = (data) => {
    var tLines = data.toString().split('\n');
    var progress = {};
    for (var i = 0; i < tLines.length; i++) {
        var item = tLines[i].split('=');
        if (typeof item[0] != 'undefined' && typeof item[1] != 'undefined') {
            progress[item[0]] = item[1];
        }
    }
    return progress;
}


async function killinstance(item)
{
// on attend que le segment soit bien gen comme il faut

    console.log(item.ffmpeg)
    item.ffmpeg.instance.kill();
    item.ffmpeg = {
        running: false
    };
}
async function Screate(item, offset, id) {

    if (item.ffmpeg.running) {



        
        if (parseInt(item.ffmpeg.progress.offset) > parseInt(offset)) {
            console.log("kill ffmpeg because it is too bas ahead")
            await killinstance(item);
            return (await InstanceFFMpeg(item, offset, id));

        }else{
            console.log("Not killing", item.ffmpeg.progress.offset, offset, item.ffmpeg.progress.offset > offset, typeof(item.ffmpeg.progress.offset), typeof(offset))
        }

        if (((item.ffmpeg.progress.offset * main.hlstime) + item.ffmpeg.progress.timemark + 30) < offset * main.hlstime) {
            console.log("Killing instance because it is too haut behind", item.ffmpeg.progress.offset, offset)


            await killinstance(item);
          (await InstanceFFMpeg(item, offset, id));
          return (await waitGoodSegment(item, offset, id));
        }
        return (await waitGoodSegment(item, offset, id));


        {

        }

    } else {

        (await InstanceFFMpeg(item, offset, id));
        return (await waitGoodSegment(item, offset, id));

    }





}

function waitGoodSegment(item, offset, id) {
    return new Promise((resolve, rejects) => {

        // setTimeout(() => {



        // }, 100)

        item.ffmpeg.pevent.on("data", function HandleProgressPevent(progress){

            // if ((((item.ffmpeg.progress.offset * main.hlstime) - 10) + item.ffmpeg.progress.timemark + main.hlstime) > offset * main.hlstime) {
            //     console.log("Resolve");
            //     resolve();
            // }
            // if(progress.offset > )
            // console.log(progress, main.hlstime);
            

            if ((((progress.offset * main.hlstime) - 1.5 * main.hlstime) + progress.timemark) > ((offset * main.hlstime) > 0 ? (offset * main.hlstime) : main.hlstime) ) {
               
                
                // console.log("Resolving");
               item.ffmpeg.pevent.removeListener("data", HandleProgressPevent);
                resolve();
            }


        })
    })

}



function InstanceFFMpeg(item, offset, id) {
    return new Promise((resolve, rejects) => {


        item.ffmpeg.running = true;
        item.ffmpeg.pevent = new EventEmitter();
        item.ffmpeg.progress = {
            offset
        };

        item.ffmpeg.instance = ffmpeg("./sample.mkv").inputOption("-ss " + offset * main.hlstime).inputOption("-sn")
        .inputOptions(["-copyts"])
            .audioCodec("libmp3lame")
            .videoCodec("h264_nvenc")
            .outputOptions("-f", "hls")
            .outputOptions("-start_number", offset)
            .outputOptions("-hls_time", main.hlstime)
            .outputOptions(["-force_key_frames expr:gte(t,n_forced*2)"
            // , "-hls_flags ./hls/temp/"
            ])
            .output("./hls/" + item.uuid + "_.ts")
            .on("start", (commandLine) => {
                console.log("FFmpeg running", commandLine);
                resolve();

            })
            
            
            
            item.ffmpeg.instance.on("progress", (progress) => {





                var cof = item.ffmpeg.progress.offset;
                progress.timemark = timestamp_to_sec(progress.timemark);
                item.ffmpeg.progress = progress;
                item.ffmpeg.progress.offset = cof;

                item.ffmpeg.pevent.emit("data", item.ffmpeg.progress);



            })

            item.ffmpeg.instance.on("stderr", (stderrLine) => {
                // console.log(stderrLine.toString());
            })
            item.ffmpeg.instance.on("error", (err) => {
                console.log("[SIGKILL] FFMPEG");
            })
            item.ffmpeg.instance.run();

    })
}


function timestamp_to_sec(timemark)
{
   var time =  timemark.split(":");
   var mult = [ 3600, 60, 1];
   var timeins = 0;
   for(i = 0; i < time.length; i++)
   {

    timeins += parseFloat(time[i]) * mult[i];

   }
   return timeins

}
module.exports = {
    Screate
}