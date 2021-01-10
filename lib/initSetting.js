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
        const api = await getApi();
        let codeData;
        await api.code.get(branchName).then(data => codeData = data.modules);
        return codeData
    },

    getRoomObjects: async (shardName, roomName) => {
        let url = `https://screeps.com/api/game/room-objects?room=${roomName}&shard=${shardName}`;
        let data = JSON.parse(await getData(url));
        return data.objects;
    },

    getTerrainData: async (shardName, roomName) => {
        let url = `https://screeps.com/api/game/room-terrain?room=${roomName}&shard=${shardName}`;
        let data = JSON.parse(await getData(url));
        return data.terrain;
    },

    getData: getData
};

async function getData(url) {
    let promise = new Promise(function (resolve, reject) {
        let data = "";
        let req = https.request(url, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
                if (Number(res.headers['content-length']) === data.length) { console.log(data.length,"getData完成"); resolve(data) }
            });
        });
        req.on('error', function (e) {
            reject('problem with request: ' + e.message)
        });
        req.end();
    });
    return promise;
}
