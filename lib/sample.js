const _ = require('lodash');
const { ScreepsServer, TerrainMatrix } = require('screeps-server-mockup');
let moduleSetting = require("./initSetting");

function getRoomObjectWithoutBase(roomObject) {
    let newRoomObject = roomObject;
    delete newRoomObject.x
    delete newRoomObject.y
    delete newRoomObject.room
    delete newRoomObject.type
    delete newRoomObject._id
    return newRoomObject
}

// Initialize server
module.exports = {
    sample: async (LayoutRoomName, LayoutShardName, spawnPos) => {
        const server = new ScreepsServer();
        const { db, env } = server.common.storage;
        await server.world.reset(); // reset world but add invaders and source keepers users

        // Prepare the terrain for a new room
        let terrainData = await moduleSetting.getTerrainData(LayoutShardName, LayoutRoomName)
        const terrain = new TerrainMatrix();
        _.each(terrainData, ({ x, y, type }) => terrain.set(x, y, type));
        console.log(`getTerrainData Finished`)

        // get roomObject
        const roomObjects = await moduleSetting.getRoomObjects(LayoutShardName, LayoutRoomName);

        let serverRoomName = "W0N1"
        // Create a new LayoutRoom with terrain and basic objects
        await server.world.addRoom(serverRoomName);
        await server.world.setTerrain(serverRoomName, terrain);
        let roomObjectsList = [];
        for (let objId in roomObjects) {
            const roomObject = roomObjects[objId];
            roomObjectsList.push(roomObject)
            console.log(JSON.stringify(roomObject));
        }
        roomObjectsList.map((roomObject) => {
            const roomObjectWithoutBase = getRoomObjectWithoutBase(roomObject);
            return server.world.addRoomObject(serverRoomName, roomObject.type, Number(roomObject.x), Number(roomObject.y), roomObjectWithoutBase)
        })
        Promise.all(roomObjectsList);
        // await server.world.addRoomObject(LayoutRoomName, "controller", 10, 10, { level: 1 });

        // Add a bot in W0N1
        const modules = await moduleSetting.getModules();
        console.log(JSON.stringify(Object.keys(modules)))
        const bot = await server.world.addBot({ username: 'bot', room: serverRoomName, x: spawnPos.x, y: spawnPos.y, modules: modules });

        // Print console logs every tick
        bot.on('console', (logs, results, userid, username) => {
            _.each(logs, line => console.log(`[console|${username}]`, line));
            _.each(results, line => console.log(`[console|${username}]`, line));
        });

        // Start server and run several ticks
        await server.start();
        await server.tick();
        await bot.console(`runLayout(${serverRoomName});`);
        for (let i = 0; i < 2; i++) {
            await server.tick();
            _.each(await bot.newNotifications, ({ message }) => console.log('[notification]', message));
            const memory = await bot.memory;
            console.log('[tick]', await server.world.gameTime);
            console.log("[memory.errors.errorCount]", JSON.stringify(memory.errors && memory.errors.errorCount));
            console.log("[memory.errors]", memory.errors && memory.errors.errorList.toString());
            if (memory.rooms && memory.rooms[serverRoomName] && memory.rooms[serverRoomName].constructionSchedule && memory.rooms[serverRoomName].constructionSchedule.layout) {
                break;
            }
        }

        // Stop server and disconnect storage
        server.stop();
        process.exit(); // required as there is no way to properly shutdown storage :(
    }
}
