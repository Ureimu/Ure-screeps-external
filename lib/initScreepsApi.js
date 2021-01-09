const { ScreepsAPI } = require('screeps-api');
const { writeFile, readFile, readFileSync, open, writeFileSync, existsSync } = require("fs");
const prompt = require('prompt');

module.exports = {
    /**
     * 获取代码。
     *
     * @returns code module
     */
    getApi() {
        let token = readToken()
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
};

function readToken() {
    let token = "";
    const fileName = "token.dat"
    if (!existsSync(fileName)) {
        //创建文件
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
            writeFileSync(fileName, result.token);
            console.log("创建token数据文件成功");
            token = result.token
        });
    }
    let readFileInfo = readFileSync(fileName).toString();
    token = readFileInfo;
    // console.log(`token:${token}!`)
    return token;
}
