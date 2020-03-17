const express = require('express'),
    admin = require('firebase-admin'),
    router = express.Router(),
    verifyForm = require('../classes/formVerifier'),
    fs = require('fs'),
    { v1: uuidv1 } = require('uuid');


admin.initializeApp({
    credential: admin.credential.cert('./gterenowa-firebase-adminsdk-8j2eo-a35fd741f5.json'),
    databaseURL: "https://gterenowa.firebaseio.com"
});
const bucket = admin.storage().bucket('gterenowa.appspot.com')
const db = admin.database().ref('zadanie');
const verifyUser = (req, res, next) => {
    const sessionCookie = req.cookies.session || '';
    admin.auth().verifySessionCookie(
        sessionCookie, true)
        .then((decodedClaims) => {
            next()
        })
        .catch(error => {
            res.status(401).send('err credentials')
        });
}
router.use(verifyUser)

router.post('/message', (req, res) => {
    sendMessage(req.body.title, req.body.message)
        .then(response => {
            res.send('successfully send notif.. ' + response)
        })
        .catch(error => {
            res.send('error occurred' + error)
        })
})

router.post('/getDB', (req, res) => {
    db.on('value', function (snapshot) {
        res.status(200).send(snapshot.val())
        db.off("value");
    })
})

router.post('/submitForm', verifyForm, (req, res) => {
    let key = req.body.key
    if (key == null)
        key = uuidv1()
    let form = res.locals.form
    if (req.file) {
        if (req.file.mimetype.includes('image/')) {
            const options = {
                destination: "game_imgs/" + key + ".jpg",
                resumable: true,
                validation: 'crc32c',
                metadata: {
                    contentType: req.file.mimetype,
                }
            };
            bucket.upload('uploads/' + req.file.filename, options, function (err, file) {
                if (err)
                    res.status(422).send(err)
                else
                    file.makePublic().then(function (data) {
                        updateDB(key, form, file.metadata.mediaLink)
                            .then(response => {
                                res.status(200).send('Wysłano pomyślnie')
                            })
                            .catch(err => {
                                res.status(500).send('Błąd serwera')

                            })
                    });
                fs.unlink('uploads/' + req.file.filename, function (err) {
                    if (err) throw err;
                });
            });
        }
        else {
            res.status(422).send('Nieprawidlowy format. Musi byc obrazek')
        }
    } else {
        updateDB(key, form, req.body.image)
            .then(() => {
                res.status(200).send('Wysłano pomyślnie')
            })
            .catch(err => {
                res.status(500).send('Błąd serwera')
            })
    }
})

router.post('/removeTask', (req, res) => {
    let key = req.body.key
    admin.database().ref('zadanie/' + key).remove()
        .then(() => {
            res.status(200).send('usunieto')
        })
        .catch((err) => {
            res.status(500).send('błąd servera')
        })
})

router.post('/checkLogged', (req, res) => {
    res.status(200).send('logged in successfully')
})

const updateDB = (key, form, urlZdjeciaDoZadania) => {
    form = Object.assign({ urlZdjeciaDoZadania }, form)
    return admin.database().ref('zadanie/' + key).set(form);
}

const sendMessage = (title, message) => {
    let content = {
        data: {
            message: message,
            title: title
        },
        topic: 'graTerenowaNotificationsService'
    }
    return admin.messaging().send(content)
}

module.exports = router