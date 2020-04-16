const express = require('express')
const router = express.Router();
const multer = require('multer')
const upload = multer({ dest: __dirname + '/../../uploads' });
//上传文件
router.post('/img', upload.single('file'), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/${file.filename}`
    res.send(file)
    // res.send("ok")
})
router.get('/img', async (req, res) => {
    res.send("ok")
})
module.exports = router