#!/usr/bin/env node
const { sample } = require("./lib/sample");
const { getApi,existsData } = require('./lib/initScreepsApi')
const LayoutRoomName = "E17S44"
const LayoutShardName = "shard3"
let ifExistsData = existsData();
if (!ifExistsData) {
    getApi();
    return;
} else {
    sample(LayoutRoomName, LayoutShardName);
}
