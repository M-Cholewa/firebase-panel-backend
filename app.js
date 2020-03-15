const express = require('express'),
    app = express(),
    port = parseInt(process.env.PORT, 10) || 8080,
    cookieParser = require('cookie-parser'),
    cors = require('cors'),
    securedRoutes = require('./routes/securedRoutes');

var corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//4 jsons
app.use(express.json())
//4 forms
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))
app.use(cookieParser())
app.use('/secure', securedRoutes)

app.listen(port, () => {
    console.log('listening on port ' + port)
})

app.post('/sessionLogin', (req, res) => {
    const idToken = req.body.idToken.toString();

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin.auth().createSessionCookie(idToken, { expiresIn })
        .then((sessionCookie) => {
            // Set cookie policy for session cookie.
            const options = { maxAge: expiresIn, httpOnly: true, secured: true };
            res.cookie('session', sessionCookie, options);
            res.end(JSON.stringify({ status: 'success' }));
        }, error => {
            res.status(401).send('UNAUTHORIZED REQUEST!');
        });
})

app.post('/sessionLogout', (req, res) => {
    res.clearCookie('session');
    res.redirect('/login');
});


