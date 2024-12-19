const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const request = require('sync-request');
const config = require('../config/config');
const { AIToken } = require('../models');

/*********************   百度API  **********************/
async function baiduAccessTokenFromDB() {
    let ret;
    try {
        let token = await AIToken.findOne({ where: { module: 'ernie-Speed-128K' } }, { raw: true });
        return token
    }
    catch (e) {
        console.log('baiduAccessTokenFromDB error: ', e);
        return null;
    }
}

async function isExpires(token) {
    try {
        if (!token) return true;
        var expireTime = token.updatedAt;
        var lastTime = new Date(expireTime.setSeconds(token.expires_in));
        return new Date() > lastTime;
    }
    catch (e) {
        console.log('isExpires error: ', e);
        return true;
    }
}

async function getBaiduAccesstoken() {
    try {
        let token = await baiduAccessTokenFromDB();
        if (token && !isExpires(token)) return token;
        
        var reqUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.QIANFAN.WXBOT_APPKEY}&client_secret=${config.QIANFAN.WXBOT_SECRETKEY}`
        var header = { 'Content-Type': 'application/json' };
        var ret = request("POST", reqUrl, header);
        var newToken = JSON.parse(ret.getBody('utf8'));
        var dateTime = (new Date()).toDateString('yyyy-MM-dd HH:mm:ss.SSS');
        if (!token) {
            newToken.module = 'ernie-Speed-128K';
            newToken.updatedAt = dateTime;
            newToken.createdAt = dateTime;
            await AIToken.create(newToken);
        }
        else if (isExpires(token)) {
            await AIToken.update(
                { access_token: newToken.access_token, refresh_token: newToken.refresh_token, expires_in: newToken.expires_in, scope: newToken.scope, updatedAt: dateTime },
                { where: { module: 'ernie-Speed-128K' } }
            );
        }
        return newToken;
    }
    catch (e) {
        console.log('getBaiduAccesstoken error: ', e);
        return null;
    }
}
async function ernieSpeed128KChat(messages){
    try{
        var token = await getBaiduAccesstoken();
        if(!token) return {code: -1, msg: '无法获取 access_token ！', data: null };
        var reqUrl = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-speed-128k?access_token=${token.access_token}`
        headers = { 'Content-Type': 'application/json'}
        const ret = request('POST', reqUrl, { headers: headers, body: JSON.stringify(messages) });
        const result = ret.getBody('utf8');
        return {code: 1, msg: 'successed', data: result };
    }
    catch(e){
        console.log('ernieSpeed128KChat error: ', e);
        if(!token) return {code: -999, msg: e.message, data: null };
    }
}


/*********************   百度API结束  *****************/

module.exports = {
    getBaiduAccesstoken,
    ernieSpeed128KChat,
};