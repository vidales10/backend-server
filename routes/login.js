var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

var GoogleAuth = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

// =======================================================
// Autenticcion con google
// =======================================================
app.post('/google', (req, res) => {
    var token = req.body.token || '';
    var client = new GoogleAuth.OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');
    client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID },
        function(err, login) {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Token no valido',
                    errors: err
                });
            }

            var payload = login.getPayload();
            var userid = payload['sub'];

            Usuario.findOne({ email: payload.email }, (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar usuario - login',
                        errors: err
                    });
                }
                if (usuario) {
                    if (!usuario.google) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Debe usar su autenticación normal'
                        });
                    } else {
                        //crear un token
                        usuario.password = ':)';
                        var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas expira token
                        res.status(200).json({
                            ok: true,
                            mensaje: 'Login post correcto',
                            usuario: usuario,
                            token: token,
                            id: usuario.id
                        });
                    }
                } else { // Si el usuario no existe se crea
                    var usuario = new Usuario();
                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;
                    usuario.save((err, usuarioDB) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al crear usuario - Google',
                                errors: err
                            });
                        }
                        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas expira token
                        res.status(200).json({
                            ok: true,
                            mensaje: 'Login google correcto',
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB.id
                        });
                    });
                }
            });
        }
    );
});


// =======================================================
// Autenticación normal
// =======================================================
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: { message: 'Credenciales incorrectas' }
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: { message: 'Credenciales incorrectas' }
            });
        }
        //crear un token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas expira token
        res.status(200).json({
            ok: true,
            mensaje: 'Login post correcto',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    });

});

module.exports = app;