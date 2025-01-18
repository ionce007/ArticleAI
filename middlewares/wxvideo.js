const { v4: uuidv4 } = require('uuid');
const common = require('../middlewares/common.js');
const  cookie_Parser  = require('cookie-parser');

const FingerPrintDeviceId = uuidv4().replace(/-/g, '');
const uuid = uuidv4();
const uuid2 = uuidv4();

async function hepler_merlin_mmdata(){
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "https://channels.weixin.qq.com",
        "Referer": "https://channels.weixin.qq.com/platform/login-for-iframe?dark_mode=true&host_type=1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\""
    }
    const timestamp10 = common.generate_timestamp(10);
    const timestamp13 = common.generate_timestamp(13);
    const body = {
        "id": 23865,
        "data": {
            "12": "",
            "13": "",
            "14": "",
            "15": "",
            "16": "",
            "17": timestamp10,
            "18": timestamp10,
            "19": 1,
            "20": "",
            "21": 2,
            "22": uuid,
            "23": "",
            "24": timestamp13,
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
            "39": `{"heartbeat_second":${}}`,
            "40": "custom",
            "41": "{\"customType\":\"heartbeat_report\"}",
            "42": "{\"screenHeight\":1032;\"screenWidth\":1920;\"clientHeight\":0;\"clientWidth\":0}",
            "43": ""
        },
        "_log_finder_id": ""
    }
    let postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/helper/hepler_merlin_mmdata?_rid=${common.generateRid()}`
    const response = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
    const ret = await response.json();
    return ret;
}
async function helper_mmdata(){
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "https://channels.weixin.qq.com",
        "Referer": "https://channels.weixin.qq.com/platform/login-for-iframe?dark_mode=true&host_type=1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";=\"117\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\""
    }
    const body = {
        "id": 21307,
        "data": {
            "13": "",
            "14": "",
            "15": "",
            "17": "null",
            "19": None,
            "20": None,
            "21": common.generate_timestamp(13),
            "22": common.generate_timestamp(13)
        },
        "addFinderUinBy": 16
    }
    const postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/helper/helper_mmdata?_rid=${common.generateRid()}`
    const response = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
    const ret = await response.json();
    return ret;
}
async function get_login_token(){
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "https://channels.weixin.qq.com",
        "Referer": "https://channels.weixin.qq.com/platform/login-for-iframe?dark_mode=true&host_type=1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "X-WECHAT-UIN": "0000000000",
        "finger-print-device-id": FingerPrintDeviceId,//uid,
        "sec-ch-ua": '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"'
    }
    const body = {
        "timestamp": common.generate_timestamp(13),  
        "_log_finder_uin": "",
        "_log_finder_id": "",
        "rawKeyBuff": null,
        "pluginSessionId": null,
        "scene": 7,
        "reqScene": 7
    }
    const postUrl = "https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_login_code"
    const response = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
    const ret = await response.json();
    return ret;
}
async function cookieStr2JSON(cookieStr){
    const updatedCookieString = cookieStr.replace(/(Expires=[^;]*GMT)/g, match => { return match.replace(/,/g, '，');});
    const arrCookie = updatedCookieString.split(',');
    if(!arrCookie || arrCookie.length === 0 ) return [];
    let ret = [];
    const cookieProperty = ["domain","path","expires","max-age","size","httponly","secure","samesite","priority"];
    arrCookie.forEach(  (item) => {
        const arrItem = item.split(';');
        arrItem.forEach( (subItem) => {
            const arrSubItem = subItem.split('=');
            if(cookieProperty.indexOf(arrSubItem[0].toLowerCase().trim()) < 0 ){
                ret.push({name: arrSubItem[0].trim(), value: arrSubItem[1].trim()});
            }
        })
    })
    return ret;
}
async function request_qrcode(token){
    try{
        const postUrl = `https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_login_status?token=${token}&timestamp=${common.generate_timestamp(13)}&_log_finder_uin=&_log_finder_id=&scene=7&reqScene=7`
        const headers = {
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "Origin": "https://channels.weixin.qq.com",
            "Referer": "https://channels.weixin.qq.com/platform/login-for-iframe?dark_mode=true&host_type=1",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            "X-WECHAT-UIN": "0000000000",
            "finger-print-device-id": FingerPrintDeviceId,
            "sec-ch-ua": '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        }
        const response = await fetch(postUrl, { method: 'POST', headers: headers });
        const ret = await response.json();
        if(ret.data.status === 1  && ret.data.acctStatus === 1) {
            const cookieStr = response.headers.get('set-cookie');
            const cookies = await cookieStr2JSON(cookieStr);
            ret.cookie = cookies;
        }
        return ret;
    }
    catch(ex){
        console.log('error = ', ex.message);
        return null;
    }
}
async function auth_data(cookie) {
    let cookieStr = ''
    if(typeof(cookie) === 'string') cookieStr = cookie;
    if(typeof(cookie) === 'object') cookieStr = cookie.map(item=>{return `${item.name}=${item.value};`}).join('');
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en-GB-oxendict;q=0.9,en;q=0.8,zh;q=0.7,zh-CN;q=0.6",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Host": "channels.weixin.qq.com",
        "Origin": "https://channels.weixin.qq.com",
        "Referer": "https://channels.weixin.qq.com/platform",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "X-WECHAT-UIN": "0000000000",
        "finger-print-device-id": FingerPrintDeviceId,
        "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";=\"117\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "cookie": cookieStr
    }
    body = {
        "timestamp": common.generate_timestamp(13),
        "_log_finder_uin": "",
        "_log_finder_id": "",
        "rawKeyBuff": null,
        "pluginSessionId": null,
        "scene": 7,
        "reqScene": 7
    }
    const postUrl = "https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_data";
    const response = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
    const ret = await response.json();
    return ret;
}
async function helper_upload_params(finderUsername){
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Connection": "keep-alive",
        "Content-Type": "application/json",
        "Origin": "https://channels.weixin.qq.com",
        "Referer": "https://channels.weixin.qq.com/platform/login",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "X-WECHAT-UIN": "0000000000",
        "finger-print-device-id": FingerPrintDeviceId,
        "sec-ch-ua": "\"Google Chrome\";v=\"117\", \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"117\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "cookie":"sessionid=BgAA960SfB4VwllI1FUrU9jlVBGOU%2FKdpYFPado8IWti6C%2FVBDf0Y5eW1jl%2F9vb5HhZL5hF0kCYvnEruzhHzc7ymmiEcZJIAEO27littHPci;wxuin=3108414054"
    }
    //const finderUsername = 'v2_060000231003b20faec8c7e4881bc3d3cc0cef3db0779b3fea900c131517c8e714188a0e0162@finder';
    const body = {
        "timestamp": common.generate_timestamp(13),
        "_log_finder_uin": "",
        "_log_finder_id": finderUsername,
        "rawKeyBuff": null,
        "pluginSessionId": null,
        "scene": 7,
        "reqScene": 7
    }
    const postUrl = "https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/helper/helper_upload_params";
    const response = await fetch(postUrl, { method: 'POST', body: JSON.stringify(body), headers: headers });
    ret = await response.json();
    return ret;
}
module.exports = {
    hepler_merlin_mmdata,
    helper_mmdata,
    get_login_token,
    request_qrcode,
    auth_data,
    helper_upload_params,
}