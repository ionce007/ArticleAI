const { v4: uuidv4 } = require('uuid');
const common = require('../middlewares/common.js');
const video = require('../middlewares/wxvideo.js');

const FingerPrintDeviceId = uuidv4().replace(/-/g, '');
async function showWelcome(req, res, next){
    res.render('vwelcome', { data: [], msg: `successed`, code: 1 });
}
let eventId = 1;
async function writeMessage(res, data, eventName = 'message', isDelay = false) {
    if (isDelay) await delay(1000);
    /*var json = { time: time, msg: sseData, event: eventName };
    res.write(`data: ${JSON.stringify(json)}\n\n`);*/
    let sseData = data;
    if (typeof (data) === 'object') sseData = JSON.stringify(data);
    const eventMessage = `id: ${eventId++}\nevent:${eventName}\ndata: ${sseData}\n\n`;
    res.write(eventMessage);
    res.flush();
}
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
async function wxvlogin(req, res, next) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Headers': 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS'
    });
    try {
        await writeMessage(res, { msg: '程序启动，开始获取登录token', data: {}, event: 'message' });
        const token = await video.get_login_token();
        console.log('token = ', token);
        await writeMessage(res, { msg: '完成token获取', data: token, event: 'getqrcode' });
        while (true) {
            await writeMessage(res, { msg: '等待微信扫码', data: {}, event: 'message' }, 'message');
            const loginStatus = await video.request_qrcode(token.data.token);
            console.log('loginStatus = ', loginStatus);
            if (loginStatus.errCode !== 0) {
                await writeMessage(res, { msg: `获取登录状态出错，原因：${loginStatus.errMsg}`, data: {}, event: 'falied' }, 'message', true);
                res.end();
                break;
            }
            else {
                const statusData = loginStatus.data;
                if (statusData.status === 1 && statusData.acctStatus === 1) {
                    await writeMessage(res, { msg: '扫码登录成功', data: {}, event: 'confirmed' }, 'message');
                    const cookie = loginStatus.cookie;
                    await writeMessage(res, { msg: '获取登录用户信息', data: {}, event: 'message' }, 'message');
                    const userData = await video.auth_data(cookie);

                    const headers = {
                        "Accept": "application/json, text/plain, */*",
                        "Accept-Language": "zh-CN,zh;q=0.9",
                        "Connection": "keep-alive",
                        "Content-Type": "application/json",
                        "Host": "channels.weixin.qq.com",
                        "Origin": "https://channels.weixin.qq.com",
                        "Referer": "https://channels.weixin.qq.com/platform/login",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors",
                        "Sec-Fetch-Site": "same-origin",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
                        "X-WECHAT-UIN": "0000000000",
                        "finger-print-device-id": FingerPrintDeviceId,
                        "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";=\"117\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\""
                    }
                    const saveLoginRet = await saveLoginData(res, cookie, userData, headers);
                    console.log('saveLoginRet = ', saveLoginRet);
                    if (saveLoginRet.code === 1) {
                        let queueRet = await saveSyncVideoData(res, cookie, userData, headers);
                        console.log('queueRet = ', queueRet);
                    }
                    await writeMessage(res, { msg: '本次会话结束', data: {}, event: 'finished' }, 'message');
                    res.end();
                    break;
                }
                else if (statusData.status == 5 && statusData.acctStatus == 1) {
                    await writeMessage(res, { msg: '已扫码，需在手机上进行确认', data: {}, event: 'scaned' }, 'message');
                }
                else if (statusData.status == 4) {
                    await writeMessage(res, { msg: '二维码已过期', data: {}, event: 'expired' }, 'message');
                    res.end();
                    break;
                }
            }

            await delay(1000);
        }
    }
    catch (ex) {

    }
}
async function saveSyncVideoData(res, cookie, userData, headers) {
    try {
        console.log('aaaaaaaaaaCCCCCCCCCCCC')
        await writeMessage(res, { msg: '整理队列数据，准备存档', data: {}, event: 'message' }, 'message');
        let requestData = { cookies: cookie, wxUser: userData.data.userAttr, finderUser: userData.data.finderUser, reqHeaders: headers }
        const reqData = Buffer.from(JSON.stringify(requestData)).toString('base64');
        let data = {
            uniqId: requestData.finderUser.uniqId, wxName: requestData.finderUser.adminNickname, vName: requestData.finderUser.nickname,
            joinTime: Date.now(), requestData: reqData, status: 0, remark: '新增下载数据', doTime: 0
        };
        console.log('aaaaaaaaaabbbb')
        const postBaseUrl = process.env.WX_VIDEO_POST_URL || 'http://localhost:9901';
        const postUrl = `${postBaseUrl}/api/actions.aspx?action=user_video_queue`;
        const postHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        await writeMessage(res, { msg: '开始保存视频队列数据', data: {}, event: 'message' }, 'message');
        await fetch(postUrl, { method: 'POST', body: JSON.stringify(data), headers: postHeaders })
            .then((resSave) => resSave.json())
            .then(async (json) => {
                if (json.code === 1) {
                    await writeMessage(res, { msg: '队列数据保存成功', data: {}, event: 'message' }, 'message');
                }
                else {
                    await writeMessage(res, { msg: `队列数据保存失败,原因：${json.msg}`, data: {}, event: 'message' }, 'message');
                    console.log('ret.msg = ', ret.msg);
                }
                ret = json;
            })
            .catch(async (err) => {
                await writeMessage(res, { msg: `提交队列数据失败,原因：${err.message}`, data: {}, event: 'message' }, 'message');
                ret = { code: -2, data: [], msg: err.message, success: false };
                console.log('err = ', err.message);
            })
    }
    catch (ex) {
        await writeMessage(res, { msg: `队列数据保存程序出错,原因：${ex.message}`, data: {}, event: 'message' }, 'message');
        ret = { code: -999, data: [], msg: ex.message, success: false };
        console.log('ex = ', ex.message);
    }
    return ret;
}
async function saveLoginData(res, cookies, userInfo, headers) {
    try {
        await writeMessage(res, { msg: '整理用户数据，准备存档', data: {}, event: 'message' }, 'message');
        let data = { cookies: cookies, wxUser: userInfo.data.userAttr, finderUser: userInfo.data.finderUser, reqHeaders: headers }
        let uniqId = data.finderUser.uniqId;
        let nickname = `${data.wxUser.nickname}；${data.finderUser.nickname}`;
        var tokenModel = {};
        const base64Str = Buffer.from(JSON.stringify(data)).toString('base64');
        //let expires = Math.floor(data.cookies[0].expires);
        let date = new Date();
        let expires = Math.floor(date.setFullYear(date.getFullYear() + 1) / 1000);
        let updatedAt = new Date();
        tokenModel = {
            supplier: uniqId, access_token: base64Str, expires_in: expires, refresh_token: 'wxvideo_login',
            scope: nickname, remark: '', createdAt: updatedAt, updatedAt: updatedAt
        };
        const postBaseUrl = process.env.WX_VIDEO_POST_URL || 'http://localhost:9901';
        const postUrl = `${postBaseUrl}/api/actions.aspx?action=wx_video_auth`;
        const postHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        await writeMessage(res, { msg: '开始保存数据', data: {}, event: 'message' }, 'message');
        await fetch(postUrl, { method: 'POST', body: JSON.stringify(tokenModel), headers: postHeaders })
            .then((resSave) => resSave.json())
            .then(async (json) => {
                if (json.code === 1) {
                    await writeMessage(res, { msg: '用户数据保存成功', data: {}, event: 'message' }, 'message');
                }
                else {
                    await writeMessage(res, { msg: `用户数据保存失败,原因：${json.msg}`, data: {}, event: 'message' }, 'message');
                    console.log('ret.msg = ', ret.msg);
                }
                ret = json;
            })
            .catch(async (err) => {
                await writeMessage(res, { msg: `提交用户数据失败,原因：${err.message}`, data: {}, event: 'message' }, 'message');
                ret = { code: -2, data: [], msg: err.message, success: false };
                console.log('err = ', err.message);
            })
    }
    catch (ex) {
        await writeMessage(res, { msg: `用户数据程序运行出错,原因：${ex.message}`, data: {}, event: 'message' }, 'message');
        ret = { code: -999, data: [], msg: ex.message, success: false };
        console.log('ex = ', ex.message);
    }
    return ret;
}
async function getLogin(req, res, next) {
    res.render('vlogin', { qrcode: `/img/qrcode.png`, msg: `successed`, code: 1 });
}
async function hepler_merlin_mmdata(req, res, next) {
    const ret = await video.hepler_merlin_mmdata();
    res.json(ret);
}
async function helper_mmdata(req, res, next) {
    const ret = await video.helper_mmdata();
    res.json(ret);
}
async function get_login_token(req, res, next) {
    const ret = await video.get_login_token();
    res.json(ret);
}
async function request_qrcode(token) {
    //const tokenObj = await video.get_login_token();
    const ret = await video.request_qrcode(token);
    res.json(ret);
}
async function auth_data() {
    const ret = await video.auth_data();
    res.json(ret);
}
async function helper_upload_params(req, res, next) {
    const finderUsername = 'v2_060000231003b20faec8c7e4881bc3d3cc0cef3db0779b3fea900c131517c8e714188a0e0162@finder';
    const ret = await video.helper_upload_params(finderUsername);
    res.json(ret);
}
module.exports = {
    getLogin,
    showWelcome,
    wxvlogin,
    hepler_merlin_mmdata,
    helper_mmdata,
    get_login_token,
    request_qrcode,
    auth_data,
    helper_upload_params,
}