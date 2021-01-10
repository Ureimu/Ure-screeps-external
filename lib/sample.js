const _ = require('lodash');
const { ScreepsServer, TerrainMatrix } = require('screeps-server-mockup');
let moduleSetting = require("./initSetting");

function getRoomObjectWithoutBase(roomObject) {
    let newRoomObject = _.cloneDeep(roomObject);
    delete newRoomObject.x
    delete newRoomObject.y
    delete newRoomObject.room
    delete newRoomObject.type
    delete newRoomObject._id
    return newRoomObject
}

// Initialize server
module.exports = {
    sample: async (LayoutRoomName, LayoutShardName) => {
        const terrainData = await moduleSetting.getTerrainData(LayoutShardName, LayoutRoomName);
        const roomObjects = await moduleSetting.getRoomObjects(LayoutShardName, LayoutRoomName);
        const modules = await moduleSetting.getModules();
        console.log(JSON.stringify(Object.keys(modules)))
        let roomObjectsList = [];
        for (let objId in roomObjects) {
            const roomObject = roomObjects[objId];
            roomObjectsList.push(roomObject)
            console.log(JSON.stringify(roomObject));
        }
        // Prepare the terrain for a new room
        const terrain = new TerrainMatrix();
        terrainData.forEach(({ x, y, type }) => { console.log({ x, y, type }); terrain.set(x, y, type) })
        // _.each(terrainData, ({ x, y, type }) => {console.log({ x, y, type }); terrain.set(x, y, type)});
        console.log(`getTerrainData Finished`)
        let posList = [];
        for (let x = 5; x < 45; x++) {
            for (let y = 5; y < 45; y++) {
                // console.log(terrain.get(x, y));
                if (terrain.get(x, y) === "plain") {
                    posList.push([x, y]);
                }
            }
        }
        for (let spawnPos of posList) {
            const server = new ScreepsServer();
            await server.world.reset(); // reset world but add invaders and source keepers users
            await server.start();

            let serverRoomName = "W1N1"
            // get roomObject
            roomObjectsList.map((roomObject) => {
                const roomObjectWithoutBase = getRoomObjectWithoutBase(roomObject);
                // console.log(JSON.stringify(roomObject))
                return server.world.addRoomObject(serverRoomName, roomObject.type, Number(roomObject.x), Number(roomObject.y), roomObjectWithoutBase)
            })

            // Create a new LayoutRoom with terrain and basic objects
            await server.world.addRoom(serverRoomName);
            await server.world.setTerrain(serverRoomName, terrain);
            await Promise.all(roomObjectsList);
            // await server.world.addRoomObject(serverRoomName, "controller", 10, 10, { level: 1 });

            // Add a bot in W0N1
            const bot = await server.world.addBot({ username: 'bot', room: serverRoomName, x: spawnPos[0], y: spawnPos[1], modules: modules });

            // Print console logs every tick
            // bot.on('console', (logs, results, userid, username) => {
            //     _.each(logs, line => console.log(`[console|${username}]`, line));
            //     _.each(results, line => console.log(`[console|${username}]`, line));
            // });

            // Start server and run several ticks
            await server.tick();
            await bot.console(`runLayout("${serverRoomName}");`);// 这里调用你的布局函数
            for (let i = 0; i < 1; i++) {
                await server.tick();
                _.each(await bot.newNotifications, ({ message }) => console.log('[notification]', message));
                const memory = JSON.parse(await bot.memory);
                // console.log('[tick]', await server.world.gameTime);
                // console.log("[memory.errors.errorCount]", JSON.stringify(memory.errors && memory.errors.errorCount));
                // console.log("[memory.errors]", memory.errors && memory.errors.errorList.toString());
                // 下面写你的布局完成判断
                if (memory.rooms && memory.rooms[serverRoomName] && memory.rooms[serverRoomName].constructionSchedule 
                    && memory.rooms[serverRoomName].constructionSchedule.gridLayout && memory.rooms[serverRoomName].constructionSchedule.gridLayout.layout) {
                    let wallNum = memory.rooms[serverRoomName].constructionSchedule.gridLayout.layout.constructedWall.wall.posStrList.length
                    let rampartNum = memory.rooms[serverRoomName].constructionSchedule.gridLayout.layout.rampart.rampart.posStrList.length
                    console.log(spawnPos, wallNum + rampartNum)
                    break;
                } else {
                    console.log(spawnPos,"Invalid")
                }
            }

            // Stop server and disconnect storage
            server.stop();
        }
        process.exit(); // required as there is no way to properly shutdown storage :(
    }
}
