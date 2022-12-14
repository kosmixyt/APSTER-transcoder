const express = require("express");
const MGen = require("./Generate.m3u8");
const fs = require("fs-extra");
fs.removeSync("./hls/")
const child_process = require("child_process");
fs.mkdirSync("./hls/")
const Seg = require("./segment");
module.exports.hlstime = 10;
const app = express();
streams =  []
module.exports.streams = streams



app.use("/", express.static("./static/"))

app.get("/index.m3u8", async (req, res) => {

    data = await MGen.Manifest("./sample.mkv");
    res.download(data.index);
    streams.push(data);


})

app.get("/info", (req, res) => res.send(streams));



app.get("/hls/:uuid/segment/:offset/endseg", async (req, res) => {

   var offset = req.params.offset;
   var id = req.params.uuid;
    var stream = streams.find(e => e.uuid == id);
    if(!stream) return res.status(404).send("Stream not found");

    console.log("Requesting segment", offset, id, stream.uuid);

    var Segment = await Seg.Screate(stream, offset, id);
    // try{
    // console.log(fs.statSync("./hls/" + id + "_" + offset + ".ts").size, offset);}
    // catch(e){
        // console.log("failed get size");
    // }
    res.download("./hls/" + id + "_" + offset + ".ts");




})






app.listen(80)