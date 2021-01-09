const { getApi } = require('./initScreepsApi')
const https = require('https');
const branchName = 'main';

module.exports = {
    /**
     * 获取代码。
     *
     * @returns {module}code module
     */
    getModules: async () => {
        const api = getApi();
        let codeData;
        await api.code.get(branchName).then(data => codeData = data.modules);
        return codeData
    },

    getRoomObjects: async (shardName, roomName) => {
        let promise = new Promise(function (resolve, reject) {
            const api = getApi();
            api.socket.connect();
            let counter = 0;
            let data = "";
            api.socket.subscribe(`room:${shardName}/${roomName}`, event => {
                if (counter < 1) {
                    data = event.data.objects;
                    counter++;
                } else {
                    api.socket.disconnect()
                    console.log(`data:${JSON.stringify(Object.keys(data).length)}`)
                    resolve(data);
                }
            });
        });
        return await promise;
    },

    getTerrainData: async (shardName, roomName) => {
        let promise = new Promise(function (resolve, reject) {
            let data = "";
            let req = https.request(`https://screeps.com/api/game/room-terrain?room=${roomName}&shard=${shardName}`, function (res) {
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                    data += chunk;
                    if (Number(res.headers['content-length']) === Object.keys(data).length) { console.log(Object.keys(data).length,"getTerrainData完成"); resolve(data.terrain) }
                });
            });
            req.on('error', function (e) {
                reject('problem with request: ' + e.message)
            });
            req.end();
        });
        return await promise;
    },
};
