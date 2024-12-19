const crypto = require('crypto');
const { AIToken } = require('../models')
const api = require('../middlewares/aiapi')
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const dotEnv = require('dotenv');
dotEnv.config();

async function getAccessToken(req, res, net) {
  try {
    var token = await api.getBaiduAccesstoken();
    res.json({ code: -1, msg: '获取token成功!', token: token })
  }
  catch (e) {
    console.log('getAccessToken error: ', e);
    res.json({ code: -1, msg: e.message, token: null });
  }
}
async function chat4ernieSpeed128K(req, res, next) {
  const messages = { messages: [{ "role": "user", "content": "为什么中午气温比早上气温高呢？" }] }
  var chat = await api.ernieSpeed128KChat(messages);
  res.json(chat);
}

async function getIndex(req, res, next) {
  res.render('index', { qrcode: `/img/qrcode.png`, msg: `successed`, code: 1 });
}
async function getWeixinVideoCookies(req, res, next) {
  let ret = {};
  try {
    // 如果当前文件在项目内部的某个子目录中
    const rootDir = path.join(__dirname, '..');
    console.log('rootDir = ', rootDir); // 输出项目根目录的路径
    const dir = rootDir;//`/opt/render/.cache/puppeteer`;
    const chromePath = process.env.PPTR_CHROME_PATH;//|| '/opt/render/.cache/puppeteer/chrome/win64-131.0.6778.108/chrome-win64';
    try {
      //const dir1 = chromePath;//`/opt/render/project/src/chrome`;
      const files = await fs.readdir(chromePath, { withFileTypes: true });

      for (const file of files) {
        console.log(file.isDirectory() ? 'Directory: ' : 'File: ', path.join(chromePath, file.name));
      }
    } catch (err) {
      console.error('Error reading directory:', err);
    }

    const url = 'https://channels.weixin.qq.com/login.html';// "http://www.foryet.net/wxvloginqr.html";//
    //console.log('url = ', url);

    console.log('chromePath = ', chromePath);
    const browser = await puppeteer.launch({ headless: false, executablePath: chromePath, defaultViewport: null, args: ['--start-maximized'] });
    const page = await browser.newPage();
    await page.goto(url);
    //console.log('goto url = ', url);
    const newPagePromise = new Promise((x) => { browser.once('targetchanged', (target) => { return x(target.page()); }) });//创建newPagePromise对象

    const newPage = await newPagePromise;//声明一个newPage对象
    let cookies = await newPage.cookies();
    let newUrl = await newPage.url();//获取新页面的链接
    let finder_username = await page.evaluate(() => { return localStorage.getItem('finder_username'); });

    await page.goto(newUrl);
    //console.log('newUrl = ', newUrl);
    //https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_data?_rid=67530663-e4bc433c
    //https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_110_report
    //const xhrRequest = await page.waitForRequest(request => request.url().indexOf('/cgi-bin/mmfinderassistant-bin/auth/auth_110_report') >= 0 && request.method() === 'POST');
    const userRes = await page.waitForResponse(async (res) => {
      if (res.url().indexOf('/mmfinderassistant-bin/auth/auth_data') >= 0 && res.status() === 201) { return res; }
    });
    let userInfo = await userRes.json();

    const statusRes = await page.waitForResponse(async (res) => {
      if (res.url().indexOf('/mmfinderassistant-bin/live/get_live_permission_apply_status') >= 0 && res.status() === 201) { return res; }
    });
    let headers = statusRes.request().headers();

    await newPage.close();
    await browser.close();

    let data = { cookies: cookies, wxUser: userInfo.data.userAttr, finderUser: userInfo.data.finderUser, reqHeaders: headers }
    let uniqId = data.finderUser.uniqId;
    let nickname = data.wxUser.nickname;
    var tokenModel = {};//await AccessToken.findOne({ where: { supplier: uniqId }, raw: true });
    const base64Str = Buffer.from(JSON.stringify(data)).toString('base64');
    let expires = Math.floor(data.cookies[0].expires);
    let updatedAt = new Date();
    tokenModel = {
      supplier: uniqId, access_token: base64Str, expires_in: expires, refresh_token: 'wxvideo_login',
      scope: nickname, remark: '', createdAt: updatedAt, updatedAt: updatedAt
    };
    //console.log('data = ', data);
    const postBaseUrl = process.env.WX_VIDEO_POST_URL || 'http://localhost:9901/';
    const postUrl = `${postBaseUrl}/api/actions.aspx?action=wx_video_auth`;
    const postHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
    //console.log('tokenModel = ', tokenModel);
    //console.log('postUrl = ', postUrl);
    await fetch(postUrl, {
      method: 'POST',
      body: JSON.stringify(tokenModel),
      headers: postHeaders
    })
      .then((res) => res.json())
      .then((json) => { ret = json; console.log('json = ', json); })
      .catch(err => { ret = { code: -2, data: [], msg: err.message, success: false }; console.log('err = ', err); })
  }
  catch (ex) {
    ret = { code: -999, msg: ex.message, success: false }
    console.log('error = ', ex.message);
  }
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.json(ret);
}
module.exports = {
  getIndex,
  getAccessToken,
  chat4ernieSpeed128K,
  getWeixinVideoCookies
}
