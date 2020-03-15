const multer = require('multer'),
    validate = require('validate.js');

const upload = multer({ dest: 'uploads/', limits: { fileSize: 1048576 } }).single('image')
module.exports = verifyForm = (req, res, next) => {
    upload(req, res, err => {
        // console.log(err)
        if (err)
            res.status(500).send(err.message)
        else {
            try {
                let czyWymagane = Boolean(req.body.czyWymagane)
                let dobreOdpowiedzi = JSON.parse(req.body.dobreOdpowiedzi)
                let lokalizacjaDl = Number(req.body.lokalizacjaDl)
                let lokalizacjaSzer = Number(req.body.lokalizacjaSzer)
                let podpisObrazka = req.body.podpisObrazka
                let podtytul = req.body.podtytul
                let trescZadania = req.body.trescZadania
                let wprowadzenieDoZadania = req.body.wprowadzenieDoZadania
                let tytul = req.body.tytul
                let form = {
                    czyWymagane, dobreOdpowiedzi, lokalizacjaDl, lokalizacjaSzer,
                    podpisObrazka, podtytul, trescZadania, wprowadzenieDoZadania, tytul
                }

                let resValidate = validate(form, constraints, { format: "flat" })
                if (resValidate) {
                    res.status(422).send(resValidate)
                    return
                }

                res.locals.form = form
                next()
            } catch (error) {
                res.status(422).send('Wystąpił błąd z podanymi danymi')
            }

            // let urlZdjeciaDoZadania = imgLink ? imgLink : req.body.image

        }
    })
}

const stringType = {
    presence: {
        presence: true,
        message: "nie podano żadnej wartości"
    },
    type: {
        type: "string",
        message: "zły typ danych"
    },
}
const numberType = {
    presence: {
        presence: true,
        message: "nie podano żadnej wartości"
    },
    type: {
        type: "number",
        message: "zły typ danych"
    },
}

const constraints = {
    czyWymagane: {
        presence: {
            presence: true,
            message: "^Nie podano czy zadanie jest wymagane"
        },
        type: {
            type: "boolean",
            message: "zły typ danych"
        }
    },
    dobreOdpowiedzi: {
        presence: {
            presence: true,
            message: "^Nie podano żadnej dobrej odpowiedzi"
        },
        type: {
            type: "array",
            message: "zły typ danych"
        },
        length: {
            minimum: 1,
            message: "^Kazde zadanie musi mieć minimum 1 dobrą odpowiedź"
        }
    },
    // key: stringType,
    lokalizacjaDl: numberType,
    lokalizacjaSzer: numberType,
    podtytul: stringType,
    trescZadania: stringType,
    wprowadzenieDoZadania: stringType,
    tytul: stringType,
}
