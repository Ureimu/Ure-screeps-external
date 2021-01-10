const { ScreepsAPI } = require('screeps-api');
const { readFileSync, writeFileSync, existsSync } = require("fs");
const prompt = require('prompt');

module.exports = {
    /**
     * 获取代码。
     *
     * @returns code module
     */
    async getApi() {
        let token = await readToken()
        if (token === "") return "";
        const api = new ScreepsAPI({
            token: token, // add your token here
            protocol: 'https',
            hostname: 'screeps.com',
            port: 443,
            path: '/' // Do no include '/api', it will be added automatically
        });
        // console.log(token);
        return api
    },

    existsData,
};

function existsData(){
    const fileName = "screepsExternal.json"
    if (!existsSync(fileName)) return false;
    if (readFileSync(fileName).toString() === "") return false;
    return true;
}

async function readToken() {
    let token = "";
    const fileName = "screepsExternal.json"
    if (!existsSync(fileName)) {
        //创建文件
        token = await createFile(fileName);
    } else {
        let result = readFileSync(fileName).toString()
        let readFileInfo = result ? JSON.parse(result) : "";
        if (readFileInfo === "") token = await createFile(fileName);
        else token = readFileInfo.token;
    }
    // console.log(`token:${token}!`)
    return token;
}

async function createFile(fileName) {
    //创建文件

    let promise = new Promise(function (resolve) {
        writeFileSync(fileName, "");
        console.log("创建空token数据文件成功");
        console.log('请输入apiToken,只在本地保存');
        prompt.start();
        // ask user for the input
        prompt.get(['token'], (err, result) => {
            if (err) {
                throw err;
            }
            // print user details
            console.log("已完成输入");
            let writeData = JSON.stringify({ token: result.token, username: "", password: "" });
            writeFileSync(fileName, writeData);
            console.log("创建token数据文件成功");
            resolve(result.token)
        });
    });
    return promise;
}
