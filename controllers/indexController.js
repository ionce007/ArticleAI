const crypto = require('crypto');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const Busboy = require('busboy');
const dotEnv = require('dotenv');
dotEnv.config();

async function getIndex(req, res, next) {
  res.render('index', { qrcode: `/img/qrcode.png`, msg: `successed`, code: 1 });
}
async function getLogin(req, res, next) {
  res.render('login', { qrcode: `/img/qrcode.png`, msg: `successed`, code: 1 });
}
async function listFiles(filePath) {
  const fs1 = require('fs').promises;
  try {
    const files = await fs1.readdir(filePath, { withFileTypes: true });
    for (const file of files) {
      console.log(file.isDirectory() ? 'Directory: ' : 'File: ', path.join(filePath, file.name));
    }
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}
function dateFormat(date) {
  /*
  var timestamp = stamp;
  if ((stamp + '').length < 13) timestamp = timestamp * 1000;
  var date = new Date(timestamp); // 时间戳转换成Date对象
  */
  var year = date.getFullYear(); // 获取年
  var month = date.getMonth() + 1; // 获取月（月份比实际小1，所以需要+1）
  var day = date.getDate(); // 获取日
  var hours = date.getHours(); // 获取小时
  var minutes = date.getMinutes(); // 获取分钟
  var seconds = date.getSeconds(); // 获取秒钟

  // 补零操作
  month = (month < 10 ? "0" : "") + month;
  day = (day < 10 ? "0" : "") + day;
  hours = (hours < 10 ? "0" : "") + hours;
  minutes = (minutes < 10 ? "0" : "") + minutes;
  seconds = (seconds < 10 ? "0" : "") + seconds;

  // 拼接成YYYY-MM-DD HH:MM:SS格式
  //return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return `${hours}:${minutes}:${seconds}`;
}
async function writeMessage(res, sseData, eventName = 'message', isDelay = false) {
  if (isDelay) await delay(500);
  var time = dateFormat(new Date());
  var json = { time: time, msg: sseData, event: eventName };
  res.write(`data: ${JSON.stringify(json)}\n\n`);
  res.flush();
}
async function waitForIframeImagesToLoad(page, frame) {
  await frame.waitForFunction(() => {
    let image = frame.$('img.qrcode')//, el => el.src);//document.querySelectorAll('img.qrcode');
    return image.complete
  });
}
async function saveDataURIAsImage(dataURI) {
  try {
    // 解码Base64数据
    const base64Data = dataURI.split(',')[1];
    let imgSuffix = dataURI.split(',')[0].replaceAll('data:image/', '').replaceAll(';base64', '');
    const buffer = Buffer.from(base64Data, 'base64');
    let qrcodeDir = path.join(__dirname, '..', 'public/img/qrcode');
    let filename = `qrcode-${Date.now()}.${imgSuffix}`;
    let fullname = `${qrcodeDir}\\${filename}`;
    console.log('fullname = ', fullname);
    // 保存图片到文件
    const file = fs.createWriteStream(fullname);
    file.write(new Buffer.from(base64Data, 'base64'));
    file.end();

    //fs.writeFileSync(filename, buffer);
    return filename;
  }
  catch (ex) {
    console.log('saveDataURIAsImage error：', ex.message)
    return "";
  }
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
async function getWeixinVideoCookiesSSE(req, res, next) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Headers': 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With',
    'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS'
  });
  let ret = {};
  let userInfo = undefined;
  let headers = undefined;
  let cookies = undefined;
  let qrImgSrc = undefined;
  let arrQrData = [];
  let status = 'normal'

  try {
    let sseData = '开始获取登录数据';
    await writeMessage(res, sseData, status);

    const url = 'https://channels.weixin.qq.com/login.html';// "http://www.foryet.net/wxvloginqr.html";//'https://channels.weixin.qq.com/platform/login-for-iframe?dark_mode=true&host_type=1';//
    sseData = '启动浏览器';
    await writeMessage(res, sseData, status);
    const browser = await puppeteer.launch({ headless: false,/* executablePath: chromePath,*/ defaultViewport: null, args: ['--start-maximized'] });

    sseData = '加载微信二维码页面';
    await writeMessage(res, sseData, status);
    const page = await browser.newPage();
    page.on('response', async response => {
      if (!qrImgSrc) sseData = '正在加载二维码页面';
      else if (arrQrData && arrQrData.length > 0 && arrQrData.length < arrQrData[0].total) sseData = '正在生成二维码';
      else if (!userInfo) sseData = '等待微信扫码';
      else if (!headers) sseData = '获取请求的headers';
      else sseData = '正在回传数据';
      await writeMessage(res, sseData, status);
      if (response.url().indexOf('/mmfinderassistant-bin/auth/auth_data') >= 0 && response.status() === 201) {
        try {
          userInfo = (!userInfo ? await response.json() : userInfo);
          sseData = '微信扫码成功，成功获取用户数据';
          await writeMessage(res, sseData, status);
        }
        catch (ex) {
          await writeMessage(res, ex.message, 'falied');
          await browser.close();
          res.end();
        }

      }
      if (response.url().indexOf('mmfinderassistant-bin/auth/auth_login_status') >= 0 && response.status() === 201) {
        let qrScanStatus = await response.json();
        if (qrScanStatus.data.status === 4) {
          sseData = '二维码已过期';
          await writeMessage(res, sseData, 'expired');
          await browser.close();
          res.end();
        }
        if (qrScanStatus.data.status === 5 && qrScanStatus.data.acctStatus === 1) {
          sseData = '已扫码，需在手机上进行确认';
          await writeMessage(res, sseData, 'scaned');
        }
        if (qrScanStatus.data.status === 1 && qrScanStatus.data.acctStatus === 1) {
          sseData = '扫码成功';
          await writeMessage(res, sseData, 'confirmed');
        }
      }
      if (response.url().indexOf('/mmfinderassistant-bin/live/get_live_permission_apply_status') >= 0 && response.status() === 201) {
        headers = response.request().headers();
        sseData = 'headers获取成功';
        await writeMessage(res, sseData, 'successed');
        if (cookies && userInfo && headers) {
          let ret = await saveLoginData(res, cookies, userInfo, headers);
          if (ret.code === 1) {
            sseData = '用户数据保存成功';
            await writeMessage(res, sseData, 'successed', true);
            let queue = await saveSyncVideoData(res, cookies, userInfo, headers);
          }
          else {
            sseData = '用户数据保存失败';
            await writeMessage(res, sseData, 'falied', true);
          }

          sseData = '关闭浏览器';
          await writeMessage(res, sseData, status, true);
          await browser.close();
          res.end();
        }
      }
    });
    page.on('request', async (req) => { });
    await page.goto(url);

    sseData = '等待二维码加载';
    await writeMessage(res, sseData, status);

    const targetFrameUrl = 'https://channels.weixin.qq.com/platform/login-for-iframe';
    const frame = page.frames().find(frame => frame.url().indexOf(targetFrameUrl) >= 0);
    const qrImg1 = await frame.waitForSelector('img.qrcode');
    sseData = '二维码加载完成';
    await writeMessage(res, sseData, status);

    sseData = '获取二维码图片';
    await writeMessage(res, sseData, status);
    qrImgSrc = await frame.$eval('img.qrcode', img => img.src);

    sseData = '准备发送二维码数据';
    await writeMessage(res, sseData, status);
    if (qrImgSrc.indexOf('data:image/') >= 0) {
      let chunkSize = 1024 * 2;
      let imgLength = qrImgSrc.length;
      let chunkTotal = Math.floor(imgLength / chunkSize) + (imgLength % chunkSize === 0 ? 0 : 1);
      arrQrData = [];
      for (var index = 0; index < chunkTotal; index++) {
        let start = index * chunkSize;
        let end = index * chunkSize + chunkSize;
        let imgData = qrImgSrc.slice(start, end);
        await writeMessage(res, imgData, `qrcode-${index + 1}`);
        arrQrData.push({ index: index, total: chunkTotal })
      }

      sseData = `二维码数据发送完成:${chunkTotal}`;
      await writeMessage(res, sseData, `qrcodeCompleted`);
    }
    else { await writeMessage(res, imgData, `qrcode-0`); }

    const newPagePromise = new Promise((x) => { browser.once('targetchanged', (target) => { return x(target.page()); }) });//创建newPagePromise对象
    const newPage = await newPagePromise;//声明一个newPage对象
    cookies = await newPage.cookies();
    let newUrl = await newPage.url();//获取新页面的链接

    //https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_data?_rid=67530663-e4bc433c
    //https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/auth/auth_110_report
    //const xhrRequest = await page.waitForRequest(request => request.url().indexOf('/cgi-bin/mmfinderassistant-bin/auth/auth_110_report') >= 0 && request.method() === 'POST');
  }
  catch (ex) {
    sseData = `程序出错,原因：${ex.message}}`;
    await writeMessage(res, sseData, status);
    ret = { code: -999, msg: ex.message, success: false }
    console.log('error = ', ex.message);
  }
  /*sseData = `会话结束`;
  await writeMessage(res, sseData, 'completed');
  res.end();*/
}
async function saveSyncVideoData(res, cookies, userInfo, headers) {
  let status = "normal";
  try {
    sseData = '整理队列数据，准备存档';
    await writeMessage(res, sseData, status, true);
    let requestData = { cookies: cookies, wxUser: userInfo.data.userAttr, finderUser: userInfo.data.finderUser, reqHeaders: headers }
    const reqData = Buffer.from(JSON.stringify(requestData)).toString('base64');
    let data = {
      uniqId: userInfo.data.finderUser.uniqId, wxName: userInfo.data.userAttr.nickname,vName: userInfo.data.finderUser.nickname,
      joinTime: Date.now(), requestData: reqData, status: 0, remark: '新增下载数据', doTime: 0
    };
    const postBaseUrl = process.env.WX_VIDEO_POST_URL || 'http://localhost:9901';
    const postUrl = `${postBaseUrl}/api/actions.aspx?action=user_video_queue`;
    const postHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
    sseData = '开始保存视频队列数据';
    await writeMessage(res, sseData, status, true);
    await fetch(postUrl, { method: 'POST', body: JSON.stringify(data), headers: postHeaders })
      .then((resSave) => resSave.json())
      .then(async (json) => {
        if (json.code === 1) {
          sseData = '队列数据保存成功';
          await writeMessage(res, sseData, status, true);
        }
        else {
          sseData = `队列数据保存失败,原因：${json.msg}}`;
          await writeMessage(res, sseData, status, true);
          console.log('ret.msg = ', ret.msg);
        }
        ret = json;
      })
      .catch(async (err) => {
        sseData = `提交队列数据失败,原因：${err.message}}`;
        await writeMessage(res, sseData, status, true);
        ret = { code: -2, data: [], msg: err.message, success: false };
        console.log('err = ', err.message);
      })
  }
  catch (ex) {
    sseData = `队列数据保存失败,原因：${err.message}}`;
    await writeMessage(res, sseData, status);
    ret = { code: -999, data: [], msg: ex.message, success: false };
    console.log('ex = ', ex.message);
  }
}
async function saveLoginData(res, cookies, userInfo, headers) {
  let status = "normal";
  try {
    sseData = '整理用户数据，准备存档';
    await writeMessage(res, sseData, status, true);
    let data = { cookies: cookies, wxUser: userInfo.data.userAttr, finderUser: userInfo.data.finderUser, reqHeaders: headers }
    let uniqId = data.finderUser.uniqId;
    let nickname = `${data.wxUser.nickname}；${data.finderUser.nickname}`;
    var tokenModel = {};//await AccessToken.findOne({ where: { supplier: uniqId }, raw: true });
    const base64Str = Buffer.from(JSON.stringify(data)).toString('base64');
    let expires = Math.floor(data.cookies[0].expires);
    let updatedAt = new Date();
    tokenModel = {
      supplier: uniqId, access_token: base64Str, expires_in: expires, refresh_token: 'wxvideo_login',
      scope: nickname, remark: '', createdAt: updatedAt, updatedAt: updatedAt
    };
    const postBaseUrl = process.env.WX_VIDEO_POST_URL || 'http://localhost:9901';
    const postUrl = `${postBaseUrl}/api/actions.aspx?action=wx_video_auth`;
    const postHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
    sseData = '开始保存数据';
    await writeMessage(res, sseData, status, true);
    await fetch(postUrl, { method: 'POST', body: JSON.stringify(tokenModel), headers: postHeaders })
      .then((resSave) => resSave.json())
      .then(async (json) => {
        if (json.code === 1) {
          sseData = '数据保存成功';
          await writeMessage(res, sseData, status, true);
        }
        else {
          sseData = `数据保存失败,原因：${json.msg}}`;
          await writeMessage(res, sseData, status, true);
          console.log('ret.msg = ', ret.msg);
        }
        ret = json;
      })
      .catch(async (err) => {
        sseData = `提交数据失败,原因：${err.message}}`;
        await writeMessage(res, sseData, status, true);
        ret = { code: -2, data: [], msg: err.message, success: false };
        console.log('err = ', err.message);
      })
  }
  catch (ex) {
    sseData = `用户数据保存失败,原因：${err.message}}`;
    await writeMessage(res, sseData, status);
    ret = { code: -999, data: [], msg: ex.message, success: false };
    console.log('ex = ', ex.message);
  }
  return ret;
  //let data = { cookies: cookies, wxUser: userInfo.data.userAttr, finderUser: userInfo.data.finderUser, reqHeaders: headers }
}

async function getWeixinVideoCookies(req, res, next) {
  let ret = {};
  try {
    // 如果当前文件在项目内部的某个子目录中
    const rootDir = path.join(__dirname, '..');
    console.log('rootDir = ', rootDir); // 输出项目根目录的路径
    const dir = rootDir;//`/opt/render/.cache/puppeteer`;
    //const chromePath = process.env.PPTR_CHROME_PATH;//|| '/opt/render/.cache/puppeteer/chrome/win64-131.0.6778.108/chrome-win64';
    const chromePath = "D:\\zwPython\\AI\\chrome-win64";// path.join(__dirname,'..', 'chrome');
    console.log('chromePath = ', chromePath);
    //listFiles(chromePath);

    const url = 'https://channels.weixin.qq.com/login.html';// "http://www.foryet.net/wxvloginqr.html";//
    //console.log('url = ', url);

    const browser = await puppeteer.launch({ headless: false,/* executablePath: chromePath,*/ defaultViewport: null, args: ['--start-maximized'] });
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
    const postBaseUrl = process.env.WX_VIDEO_POST_URL || 'http://localhost:9901';
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
async function uploadChrome(req, res, next) {
  let status = false;
  let message = 'ok';
  let newFile = {};
  try {
    const { file } = req;
    newFile = {
      description: req.body.description,
      filename: file.originalname,
      path: config.database,// '/' + file.filename,
      id: file.id
    };
    status = true;
  }
  catch (ex) {
    newFile = {};
    message = ex.message;
  }
  res.json({ status, message, file: newFile });
}
async function uploadFile(req, res, next) {
  const busboy = Busboy({ headers: req.headers });
  let fileSize = 0;
  let filePath = path.join(__dirname, '..', 'chrome');
  console.log('filePath = ', filePath)

  busboy.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
    console.log('filename = ', filename);
    const saveTo = `${path.join(__dirname, '..', 'chrome')}\\${filename.filename}`;
    console.log('saveTo = ', saveTo)
    fileStream.pipe(fs.createWriteStream(saveTo));

    fileStream.on('data', (data) => {
      fileSize += data.length;
      console.log('Received ' + fileSize + ' bytes of data.');
    });

    fileStream.on('end', () => {
      console.log('Upload of ' + filename.filename + ' complete.');
    });
  });
  busboy.on('finish', function () {
    res.send("文件上传成功");
  });
  return req.pipe(busboy);
}
async function uploadTest(req, res, next) {
  res.send(
    `<!DOCTYPE html>
      <html>
      <body>
        <form action="/api/wxvideo/upload" method="post" enctype="multipart/form-data">
          <h1>选择上传的文件</h1>  
          <input type="file" name="file">
          <input type="submit" value="上传">
        </form>
      </body>
      </html>`
  )
}
module.exports = {
  getIndex,
  getLogin,
  getWeixinVideoCookies,
  getWeixinVideoCookiesSSE,
  uploadChrome,
  uploadFile,
  uploadTest
}
