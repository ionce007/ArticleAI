const schedule = require('node-schedule');
const { v4: uuidv4 } = require('uuid');
const common = require('./common.js');

const pageSize = 20;
const baseUrl = 'http://www.foryet.net';// process.env.WX_VIDEO_POST_URL || 'http://localhost:9901';
const rid = common.generateRid();
const uuid = uuidv4();
const uuid2 = uuidv4();

async function getVideoUsers(pageIndex) {
    let ret = {};
    try {
        let postUrl = `${baseUrl}/api/actions.aspx?action=get_shipinhao_users&pageIndex=${pageIndex}&pageSize=${pageSize}`
        const res = await fetch(postUrl, { method: 'GET' })
        ret = await res.json();
        let total = ret.total;
        let totalPage = Math.floor(total / pageSize) + (total % pageSize === 0 ? 0 : 1);
        if (pageIndex === 1) userData = [];
        if (ret.data && ret.data.length > 0) Array.prototype.push.apply(userData, ret.data);
        if (pageIndex < totalPage) getVideoUsers(pageIndex++);
        else ret = { code: 1, data: userData, msg: '成功获取所有用户', success: true };
    }
    catch (ex) {
        console.log('getVideoUsers error：', ex.message);
        ret = { code: -999, data: [], msg: ex.message, success: false };
    }
    return ret;
}
async function getDownloadVideoQueue() {
    let ret = {};
    try {
        let url = `${baseUrl}/api/actions.aspx?action=download_video_queue`
        const res = await fetch(url, { method: 'GET' })
        ret = res.json();
    }
    catch (ex) {
        console.log('getDownloadVideoQueue error：', ex.message);
        ret = { code: -999, data: [], msg: ex.message, success: false };
    }
    return ret;
}
/*function generateRid() {
    const header = Math.floor(Date.now() / 1e3).toString(16);
    const tail = [...Array(8)].map(() => Math.floor(16 * Math.random()).toString(16)).join("");
    return `${header}-${tail}`
}*/
async function getCookies(loginData) {
    try {
        let cookieStr = '';
        if (typeof (loginData) === "string") loginData = JSON.parse(loginData);
        if (loginData.hasOwnProperty('cookies') && loginData.cookies && loginData.cookies.length > 0) {
            loginData.cookies.forEach(async (item, index) => { cookieStr += `${item.name}=${item.value};` })
        }
        return cookieStr.substring(0, cookieStr.length - 1);
    }
    catch (ex) {
        console.log('getCookies error：', ex.message);
        return "";
    }
}
async function checkLoginStatus(loginData) {
    let ret = {};
    let checkStatus = -1;
    try {
        if (typeof (loginData) === 'string') loginData = JSON.parse(loginData);
        let cookieStr = await getCookies(loginData);
        let headers = loginData.reqHeaders;
        headers.cookie = cookieStr;
        let body = {
            pluginSessionId: null, rawKeyBuff: null, reqScene: 7, scene: 7, timestamp: Date.now(),
            _log_finder_id: loginData.finderUser.finderUsername, _log_finder_uin: ''
        };
        let postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/get_auth_info?_rid=${rid}`;
        const res = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
        ret = await res.json();
        checkStatus = ret.errCode;
        const remarkObj = {
            status: ret.errCode === 0 ? 2 : -1, checkTime: common.dateFormat(new Date(), true),
            checkType: 'task', authType: ret.errCode !== 0 ? -1 : ret.data.authType
        }
        postUrl = `${baseUrl}/api/actions.aspx?action=vuser_login_status`
        const postHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const data = { uniqId: loginData.finderUser.uniqId, remark: remarkObj };
        const saveRet = await fetch(postUrl, { method: 'POST', body: JSON.stringify(data), headers: postHeaders })
        ret = await saveRet.json();
        ret.checkStatus = checkStatus;
        console.log(`保存用户 ${loginData.finderUser.nickname}(${loginData.finderUser.adminNickname}) 的在线状态`);
    }
    catch (ex) {
        console.log('checkLoginStatus error：', ex.message);
        ret = { code: -999, data: [], msg: ex.message, success: false, checkStatus: checkStatus };
    }
    return ret;
}

async function getScheduleRule() {
    /*let minutes = Array.from({ length: 61 }, (_, i) => i * 2).filter(num => num < 60);
    return minutes;*/
}
async function hepler_merlin_mmdata(loginData, status) {
    let ret = {}
    try {
        if (typeof (loginData) === 'string') loginData = JSON.parse(loginData);
        if (status !== 0) { return { code: -1, data: [], msg: '检测不在线', success: false }; }
        let cookieStr = await getCookies(loginData);
        let headers = loginData.reqHeaders;
        headers.cookie = cookieStr;
        let ticks = Date.now();
        let body = {
            "id": 23865,
            "data": {
                "12": "",
                "13": "",
                "14": "",
                "15": "",
                "16": "",
                "17": Math.floor(ticks/1000),
                "18": Math.floor(ticks / 1000),
                "19": 1,
                "20": "",
                "21": 2,
                "22": uuid,
                "23": "",
                "24": ticks,
                "25": "",
                "26": 0,
                "27": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
                "28": "{\"extra\":{\"user_identity\":1}}",
                "29": "",
                "30": "",
                "31": "Home",
                "32": "",
                "33": uuid2,
                "34": "",
                "35": "",
                "36": 1,
                "37": "{}",
                "38": "",
                "39": `{"heartbeat_second":${new Date().getMilliseconds()}}`,
                "40": "custom",
                "41": "{\"customType\":\"heartbeat_report\"}",
                "42": "{\"screenHeight\":738;\"screenWidth\":1366;\"clientHeight\":738;\"clientWidth\":1366}",
                "43": ""
            },
            "_log_finder_id": loginData.finderUser.finderUsername
        }
        let postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/helper/hepler_merlin_mmdata?_rid=${rid}`
        const res = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
        ret = await res.json();
        console.log(`用户 “${loginData.finderUser.nickname}(${loginData.finderUser.adminNickname})” 的心跳线状态 ${ret.errCode}, 说明：${ret.errMsg}`);
    }
    catch (ex) {
        console.log('hepler_merlin_mmdata error：', ex.message);
        ret = { code: -999, data: [], msg: ex.message, success: false };
    }
    return ret;
}
async function changeDownlaodQueueStatus(data) {
    try {
        const postUrl = `${baseUrl}/api/actions.aspx?action=proccess_queue_status`
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        const res = await fetch(postUrl, { method: 'POST', body: JSON.stringify(data), headers: headers });
        ret = res.json();
    }
    catch (ex) {
        console.log('changeDownlaodQueueStatus error：', ex.message);
        ret = { code: -999, msg: ex.message, success: false };
    }
    return ret;
}
async function saveUserContent(reqData, pageIndex = 1, userpageType = 11) {
    let ret = {};
    try {
        let postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/post/post_list?_rid=${rid}`;
        let cookieStr = await getCookies(reqData);
        let headers = reqData.reqHeaders;
        headers.cookie = cookieStr;
        let pageSize = 20;
        let body = {
            "pageSize": pageSize,
            "currentPage": pageIndex,
            "userpageType": userpageType,
            "timestamp": Date.now(),
            "_log_finder_uin": "",
            "_log_finder_id": reqData.finderUser.finderUsername,
            "rawKeyBuff": null,
            "pluginSessionId": null,
            "scene": 7,
            "reqScene": 7
        }
        let res = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
        ret = await res.json();
        let total = ret.data.totalCount;
        let totalPage = Math.floor(total / pageSize) + (total % pageSize > 0 ? 1 : 0);

        let postData = [];
        ret.data.list.forEach(async (item) => {
            let itemData = {
                vId: item.objectId, uniqId: reqData.finderUser.uniqId, nickname: reqData.finderUser.nickname, adminNickname: reqData.finderUser.adminNickname,
                project: '周生生', ptime: item.createTime, title: item.desc.description, action: 'task', userpageType: userpageType, contentData: item
            };
            postData.push(itemData);

        });

        postUrl = `${baseUrl}/api/actions.aspx?action=wxuser_content_todb`
        headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

        const base64Str = Buffer.from(JSON.stringify(postData)).toString('base64');
        res = await fetch(postUrl, { method: 'POST', body: base64Str, headers: headers });
        ret = await res.json();
        if (pageIndex < totalPage) await getUserContent(reqData, pageIndex++, userpageType);
    }
    catch (ex) {
        console.log('saveUserContent -> error = ', ex.message);
        ret = { code: -999, data: [], msg: ex.message, success: false };
    }
    return ret;
}
//https://www.bilibili.com/bangumi/play/ep813631?bsource=baidu_aladdin
async function checkUserOnline(queueItem) {
    try {
        let isOnline = false;
        let reqData;
        if (onlineUsers && onlineUsers.length > 0) {
            let online = onlineUsers.find(user => user.finderUser.uniqId === queueItem.uniqId);

            if (!online) { isOnline = false; reqData = null; }
            else {
                reqData = JSON.parse(Buffer.from(queueItem.requestData.replaceAll(' ', '+'), 'base64').toString());
                const statusRet = await checkLoginStatus(reqData);
                if (statusRet.code === 1 && statusRet.checkStatus === 0) isOnline = true;
            }
        }
        else {
            reqData = JSON.parse(Buffer.from(queueItem.requestData.replaceAll(' ', '+'), 'base64').toString());
            const statusRet = await checkLoginStatus(reqData);
            if (statusRet.code === 1 && statusRet.checkStatus === 0) isOnline = true;
        }
        return { online: isOnline, reqData: reqData };
    }
    catch (ex) {
        console.log('checkUserOnline error：', ex.message);
        return { online: false, reqData: null };
    }
}
async function downloadVideoData() {
    let ret = {};
    try {
        if (!downloadVideoQueue || downloadVideoQueue.length === 0) return { code: -2, data: [], msg: '队列没有数据', success: false }

        downloadVideoQueue.forEach(async (item, index) => {
            const checkRet = await checkUserOnline(item);
            let queueStatus = {};
            if (checkRet.online) {
                const reqData = typeof (checkRet.reqData) === "string" ? JSON.parse(checkRet.reqData) : checkRet.reqData;
                let pageIndex = 1;
                const finderUser = typeof (reqData.finderUser) === "string" ? JSON.parse(reqData.finderUser) : reqData.finderUser;
                queueStatus = { uniqId: finderUser.uniqId, status: 1, remark: '正在处理中' };
                ret = await changeDownlaodQueueStatus(queueStatus);
                ret = await saveUserContent(reqData, pageIndex, 11);//视频数据下载
                pageIndex = 1;
                ret = await saveUserContent(reqData, pageIndex, 10);//图文数据下载
                if (ret.code === 1) queueStatus = { uniqId: reqData.finderUser.uniqId, status: 2, remark: ret.msg };
                else queueStatus = { uniqId: reqData.finderUser.uniqId, status: -1, remark: ret.msg };
                ret = await changeDownlaodQueueStatus(queueStatus);
            }
            else {
                queueStatus = { uniqId: item.uniqId, status: -2, remark: '授权失效' };
                ret = await changeDownlaodQueueStatus(queueStatus);
            }
        })
    }
    catch (ex) {
        console.log('downloadVideoData error：', ex.message);
        ret = { code: -999, data: [], msg: ex.message, success: false };
    }
    return ret;
}
let userData = [];
let downloadVideoQueue = [];
let onlineUsers = [];

async function jobLoginStatusCheck() {
    //登录状态检测任务
    const statusCheckJobRule = new schedule.RecurrenceRule();
    statusCheckJobRule.second = [0, 20, 40];
    //2、每次计划执行中的事件。
    const statusCheckJob = schedule.scheduleJob('loginStatusCheckJob', statusCheckJobRule, async () => {
        try {
            console.log('2、statusCheckJob每次计划执行中的事件。')
            console.log('开始整理用户数据......')
            userData.forEach(async (user, index) => {
                if (typeof (user) === "string") user = JSON.parse(user);
                let loginData = JSON.parse(user.data);
                console.log(`开始检测用户 ${loginData.finderUser.nickname}（${loginData.finderUser.adminNickname}）的在线状态 ......`)
                const statusRet = await checkLoginStatus(loginData);
                let online = false;
                if (statusRet.code === 1 && statusRet.checkStatus === 0) {
                    let index = onlineUsers.findIndex(item => item.finderUser.uniqId === loginData.finderUser.uniqId);
                    if (index < 0) onlineUsers.push(loginData);
                    else onlineUsers[index] = loginData
                    online = true;
                }
                console.log(`用户 ${loginData.finderUser.nickname}（${loginData.finderUser.adminNickname}）的在线状态为 ${online ? '“在线”' : '“离线”'}`)
                await hepler_merlin_mmdata(loginData, statusRet.checkStatus);
            })
            //await downloadVideoData();
        }
        catch (ex) {
            console.log('2、statusCheckJob执行中出错：', ex.message);
        }
    });
    //1、每次计划执行前的事件。
    statusCheckJob.on("scheduled", async () => {
        try {
            console.log('1、statusCheckJob每次计划执行前的事件。time:', common.dateFormat(new Date(), false));
            console.log('开始获取所有用户......')
            await getVideoUsers(1);
            console.log(`获取用户完成，共计用户数 ${userData.length}`)
            console.log('开始获取内容下载队列...... ')
            const ret = await getDownloadVideoQueue();
            console.log(`内容下载队列获取完成，共计 ${ret.data.length} 条记录`)
            if (!downloadVideoQueue) downloadVideoQueue = [];
            if (ret.code === 1 && ret.data && ret.data.length > 0) {
                console.log('开始整理内容下载队列...... ')
                ret.data.forEach(async newItem => {
                    let index = downloadVideoQueue.findIndex(async item => item.uniqId === newItem.uniqId);
                    if (index < 0) downloadVideoQueue.push(newItem);
                    else downloadVideoQueue[index] = newItem;
                })
                console.log('内容下载队列整理完成');
            }
        }
        catch (ex) {
            console.log('1、statusCheckJob执行前出错:', ex.message);
        }
    });
    //3、每次计划执行后的事件。
    statusCheckJob.on("run", () => {
        console.log('3、statusCheckJob每次计划执行后的事件。')
    });
    //4、每次计划执行成功事件。
    statusCheckJob.on("success", () => {
        console.log('4、statusCheckJob每次计划执行成功事件。')
    });
    //计划执行出错事件
    statusCheckJob.on("error", (err) => {
        console.log(`statusCheckJob->[error][${new Date().toLocaleString()}]：${err.message}`);
    });
    statusCheckJob.on("canceled", () => {
        console.log("statusCheckJob计划取消!");
    })
}

async function jobSynchronousContentData() {
    const syncJobRule = new schedule.RecurrenceRule();
    syncJobRule.minute = new schedule.Range(0, 59, 2);
    const SyncContentDataJob = schedule.scheduleJob('syncContentDataJob', syncJobRule, async () => {
        console.log('2、SyncContentDataJob每次计划执行中的事件。')
        const ret = await downloadVideoData();
    });
    SyncContentDataJob.on("scheduled", async () => {
        console.log('1、SyncContentDataJob每次计划执行前的事件。time:', common.dateFormat(new Date(), false));
        const ret = await getDownloadVideoQueue();
        if (!downloadVideoQueue) downloadVideoQueue = [];
        if (ret.code === 1 && ret.data && ret.data.length > 0) {
            ret.data.forEach(async newItem => {
                let index = downloadVideoQueue.findIndex(async item => item.uniqId === newItem.uniqId);
                if (index < 0) downloadVideoQueue.push(newItem);
                else downloadVideoQueue[index] = newItem;
            })
        }
    });
    SyncContentDataJob.on("run", () => {
        console.log('3、SyncContentDataJob每次计划执行后的事件。')
    });
    //4、每次计划执行成功事件。
    SyncContentDataJob.on("success", () => {
        console.log('4、SyncContentDataJob每次计划执行成功事件。')
    });
    //计划执行出错事件
    SyncContentDataJob.on("error", (err) => {
        console.log(`SyncContentDataJob->[error][${new Date().toLocaleString()}]：${err.message}`);
    });
    SyncContentDataJob.on("canceled", () => {
        console.log("SyncContentDataJob计划取消!");
    });
}

async function runJobs() {
    const runjobs = !process.env.RUN_JOBS ? false : (process.env.RUN_JOBS.toLowerCase().trim() === 'true' ? true : false);
    if (!runjobs) return;
    jobLoginStatusCheck();
    jobSynchronousContentData();
}

(async () => {
    jobLoginStatusCheck();
    jobSynchronousContentData();
})();

module.exports = {
    runJobs
}