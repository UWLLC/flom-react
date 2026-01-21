const Router = require('express-promise-router');
const passport = require('passport');
const fs = require('fs');
const { pipeline } = require('stream');

const router = new Router();

module.exports = router;

router.get('/check/:id', passport.authenticate ('jwt', { session: false }), async (req, res) => {
    const { id } = req.params;
    const checkdir = `public/audio/` + id;
    console.log("checking for dir: ", checkdir);
    res.setHeader('Content-Type', 'text/plain');
    if (fs.existsSync(checkdir)) {
        console.log("found!");
        res.sendStatus(200);
    }
    console.log("not found!");
    res.sendStatus(404);
});

// code adapted from https://dev.to/devin-rosario/how-to-nodejs-send-file-from-server-to-client-quickly-4267
router.get('/audio/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { id } = req.params;
    const filename = id + `.tar.gz`;
    const file = `/app/public/audio/` + filename;
    const stat = fs.statSync(file);

    // Set necessary headers for the client
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Length', stat.size);
    // This tells the browser to download the file instead of displaying it
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');

    // Create a read stream and pipe it to the response stream
    const readStream = fs.createReadStream(file);
    pipeline(readStream, res, err => {
        if (err) {
            console.error('Pipeline failed.', err);
        } else {
            console.log('Pipeline success.');
        }
    });
});