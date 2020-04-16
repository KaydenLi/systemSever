const express = require('express')
const router = express.Router();
const multer = require('multer')
// const assert = require('http-assert')

const uploadimg = multer({ dest: __dirname + '/../../uploads/img' });
const uploadobj = multer({ dest: __dirname + '/../../uploads/obj' });
const uploadmtl = multer({ dest: __dirname + '/../../uploads/mtl' });

//上传img文件
router.post('/img', uploadimg.single('file'), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/img/${file.filename}`
    res.send(file)
})
//上传obj文件
router.post('/obj', uploadobj.single('file'), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/obj/${file.filename}`
    res.send(file)
})
//上传mtl文件
router.post('/mtl', uploadmtl.single('file'), async (req, res) => {
    const file = req.file;
    file.url = `http://localhost:3000/uploads/mtl/${file.filename}`
    res.send(file)
})
module.exports = router