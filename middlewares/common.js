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
module.exports = {
    getLinuxDistro
};