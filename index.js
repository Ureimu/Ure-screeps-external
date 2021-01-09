#!/usr/bin/env node
const { sample } = require("./lib/sample");
const { getApi } = require('./lib/initScreepsApi')

const LayoutRoomName = "E12S45"
const LayoutShardName = "shard3"

console.log('first util');
let api = getApi();
if(api === ""){
    return;
}else{
    sample(LayoutRoomName,LayoutShardName,{x:25,y:25});
}
