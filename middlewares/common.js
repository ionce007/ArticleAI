const { execSync } = require('child_process');
const os = require('os');

function getLinuxDistro() {
    try {
        // 尝试使用 lsb_release 命令
        const lsbRelease = execSync('lsb_release -a').toString();
        console.log('lsbRelease = ', lsbRelease);
        if (lsbRelease.includes('Ubuntu')) {
            return 'Ubuntu';
        } else if (lsbRelease.includes('Debian')) {
            return 'Debian';
        } else if (lsbRelease.includes('Fedora')) {
            return 'Fedora';
        } else if (lsbRelease.includes('openSUSE')) {
            return 'openSUSE';
        }
    } catch (e) {
        // lsb_release 命令可能不存在，尝试其他方法
        if (os.platform() === 'linux') {
            // 检查发行版特定的文件
            if (fs.existsSync('/etc/debian_version')) {
                return 'Debian';
            } else if (fs.existsSync('/etc/lsb-release') && fs.readFileSync('/etc/lsb-release').includes('Ubuntu')) {
                return 'Ubuntu';
            } else if (fs.existsSync('/etc/fedora-release')) {
                return 'Fedora';
            } else if (fs.existsSync('/etc/SuSE-release') || fs.existsSync('/etc/os-release') && fs.readFileSync('/etc/os-release').includes('openSUSE')) {
                return 'openSUSE';
            }
        }
    }
    return 'Unknown';
}
function dateFormat(date, hasYMD) {
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
    if(hasYMD) return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return `${hours}:${minutes}:${seconds}`;
  }
  function generateRid() {
    const header = Math.floor(Date.now() / 1e3).toString(16);
    const tail = [...Array(8)].map(() => Math.floor(16 * Math.random()).toString(16)).join("");
    return `${header}-${tail}`
}
module.exports = {
    getLinuxDistro,
    dateFormat,
    generateRid
};