const schedule = require('node-schedule');
const { v4: uuidv4 } = require('uuid');
const common = require('./common.js');

const pageSize = 20;
const baseUrl = process.env.WX_VIDEO_POST_URL || 'http://localhost:9901';

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
    let cookieStr = '';
    if (loginData.hasOwnProperty('cookies') && loginData.cookies && loginData.cookies.length > 0) {
        loginData.cookies.forEach(async (item, index) => { cookieStr += `${item.name}=${item.value};` })
    }
    return cookieStr.substring(0, cookieStr.length - 1);
}
async function checkLoginStatus(loginData) {
    let ret = {};
    let checkStatus = -1;
    try {
        let cookieStr = await getCookies(loginData);
        let headers = loginData.reqHeaders;
        headers.cookie = cookieStr;
        let body = {
            pluginSessionId: null, rawKeyBuff: null, reqScene: 7, scene: 7, timestamp: Date.now(),
            _log_finder_id: loginData.finderUser.finderUsername, _log_finder_uin: ''
        };
        let postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/get_auth_info?_rid=${common.generateRid()}`;
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
    }
    catch (ex) {
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
                "17": Math.floor(ticks / 1000),
                "18": Math.floor(ticks / 1000),
                "19": 1,
                "20": "",
                "21": 2,
                "22": uuidv4(),
                "23": "",
                "24": ticks,
                "25": "",
                "26": 0,
                "27": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
                "28": "",
                "29": "",
                "30": "",
                "31": "Home",
                "32": "",
                "33": uuidv4(),
                "34": "",
                "35": "",
                "36": 1,
                "37": "{}",
                "38": "",
                "39": `{\"heartbeat_second\":${new Date().getMilliseconds()}}`,
                "40": "custom",
                "41": "{\"customType\":\"heartbeat_report\"}",
                "42": "{\"screenHeight\":738;\"screenWidth\":1366;\"clientHeight\":738;\"clientWidth\":1366}",
                "43": ""
            },
            "_log_finder_id": loginData.finderUser.finderUsername
        }
        let postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/helper/hepler_merlin_mmdata?_rid=${common.generateRid()}`
        const res = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
        ret = await res.json();
    }
    catch (ex) {
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
        ret = { code: -999, msg: ex.message, success: false };
    }
    return ret;
}
async function saveUserContent(reqData, pageIndex = 1, userpageType = 11) {
    let ret = {};
    try {
        let postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/post/post_list?_rid=${common.generateRid()}`;
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
                vId: item.objectId, uniqId: reqData.finderUser.uniqId,nickname:reqData.finderUser.nickname,adminNickname:reqData.finderUser.adminNickname,
                project: '周生生', ptime: item.createTime,title: item.desc.description, action: 'task', userpageType: userpageType, contentData: item
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
async function checkUserOnline(queueItem){
    let isOnline = false;
    let reqData;
    if(onlineUsers && onlineUsers.length > 0 ){
        let online = onlineUsers.find(user => user.finderUser.uniqId === queueItem.uniqId);
        
        if(!online){ isOnline = true; reqData = online;}
        else {
            reqData = JSON.parse(Buffer.from(queueItem.requestData.replaceAll(' ', '+'), 'base64').toString());
            const statusRet = await checkLoginStatus(reqData);
            if (statusRet.code === 1 && statusRet.checkStatus === 0) isOnline = true;
        }
    }
    else{
        reqData = JSON.parse(Buffer.from(queueItem.requestData.replaceAll(' ', '+'), 'base64').toString());
        const statusRet = await checkLoginStatus(reqData);
        if (statusRet.code === 1 && statusRet.checkStatus === 0) isOnline = true;
    }
    return {online: isOnline, reqData: reqData};
}
async function downloadVideoData() {
    let ret = {};
    try {
        console.log('downloadVideoData -> downloadVideoQueue = ',downloadVideoQueue);
        if (!downloadVideoQueue || downloadVideoQueue.length === 0) return { code: -2, data: [], msg: '队列没有数据', success: false }

        downloadVideoQueue.forEach(async (item, index) => {
            const checkRet = await checkUserOnline(item);
            let queueStatus = {};
            if (checkRet.online) {
                const reqData = checkRet.reqData;
                let pageIndex = 1;
                queueStatus = { uniqId: reqData.finderUser.uniqId, status: 1, remark: '正在处理中' };
                ret = await changeDownlaodQueueStatus(queueStatus);
                ret = await saveUserContent(reqData, pageIndex, 11);//视频数据下载
                console.log('saveUserContent->ret = ', ret);
                pageIndex = 1;
                ret = await saveUserContent(reqData, pageIndex, 10);//图文数据下载
                if (ret.code === 1) queueStatus = { uniqId: reqData.finderUser.uniqId, status: 2, remark: ret.msg };
                else queueStatus = { uniqId: reqData.finderUser.uniqId, status: -1, remark: ret.msg };
                ret = await changeDownlaodQueueStatus(queueStatus);
            }
            else{
                console.log('item = ', item);
                queueStatus = { uniqId: item.uniqId, status: -2, remark: '授权失效' };
                ret = await changeDownlaodQueueStatus(queueStatus);
            }
        })
    }
    catch (ex) {
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
        console.log('2、statusCheckJob每次计划执行中的事件。')
        userData.forEach(async (user, index) => {
            let loginData = user.data;//JSON.parse(Buffer.from(user.access_token.replaceAll(' ', '+'), 'base64').toString());
            const statusRet = await checkLoginStatus(loginData);
            if (statusRet.code === 1 && statusRet.checkStatus === 0) {
                let index = onlineUsers.findIndex(item => item.finderUser.uniqId === loginData.finderUser.uniqId);
                if (index < 0) onlineUsers.push(loginData);
                else onlineUsers[index] = loginData
            }
            await hepler_merlin_mmdata(loginData, statusRet.checkStatus);
        })
        //await downloadVideoData();
    });
    //1、每次计划执行前的事件。
    statusCheckJob.on("scheduled", async () => {
        console.log('1、statusCheckJob每次计划执行前的事件。time:', common.dateFormat(new Date(), false));
        await getVideoUsers(1);
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

async function jobSynchronousContentData(){
    const syncJobRule = new schedule.RecurrenceRule();
    syncJobRule.minute = new schedule.Range(0, 59, 2);
    const SyncContentDataJob = schedule.scheduleJob('syncContentDataJob', syncJobRule, async () => {
        console.log('2、SyncContentDataJob每次计划执行中的事件。')
        const ret = await downloadVideoData();
        console.log('downloadVideoData->ret = ', ret);
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

async function runJobs(){
    const runjobs = !process.env.RUN_JOBS ? false : (process.env.RUN_JOBS.toLowerCase().trim() ==='true' ? true : false);
    if(!runjobs) return;
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