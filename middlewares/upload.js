const multer = require('multer');
const path = require('path');

exports.uploadFile = multer({
    storage: multer.diskStorage({
        destination: function (req, file, callback) {
            try {
                console.log('destination is run: ', Date.now());
                callback(null, './chrome');
            }
            catch (error) {
                console.log('uploadFile.multer.destination error：', error.message);
            }
        },
        filename: async function (req, file, callback) {
            try {
                callback(null, file.originalname)
            }
            catch (error) {
                console.log('uploadFile.multer.filename error：', error.message);
            }
        }
    })
});