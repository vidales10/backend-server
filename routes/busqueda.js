var express = require('express');
var Municipio = require('../models/municipio');
var Lote = require('../models/lote');
var Usuario = require('../models/usuario');

var app = express();

// =======================================================
// Busqueda por coleccion
// =======================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');
    var promesa;
    switch (tabla) {
        case 'municipio':
            promesa = buscarMunicipios(busqueda, regex);
            break;
        case 'lote':
            promesa = buscarLotes(busqueda, regex);
            break;
        case 'usuario':
            promesa = buscarUsuario(busqueda, regex);
            break;

        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no valida' }
            });
    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});


// =======================================================
// Busqueda general
// =======================================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');
    Promise.all(
            [buscarMunicipios(busqueda, regex), buscarLotes(busqueda, regex), buscarUsuario(busqueda, regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                municipios: respuestas[0],
                lotes: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarMunicipios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Municipio.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, municipios) => {
                if (err) {
                    reject('Error al cargar municipios');
                } else {
                    resolve(municipios);
                }
            });
    });
}

function buscarLotes(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Lote.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('municipio')
            .exec((err, lotes) => {
                if (err) {
                    reject('Error al cargar lotes');
                } else {
                    resolve(lotes);
                }
            });
    });
}

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios');
                } else {
                    resolve(usuarios);
                }
            });
    });
}
module.exports = app;