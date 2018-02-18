var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Lote = require('../models/lote');
var Municipio = require('../models/municipio');

// =======================================================
// obtener todos los lotes
// =======================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Lote.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('municipio')
        .exec(
            (err, lotes) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando los lotes',
                        errors: err
                    });
                }
                Lote.count({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error en el conteo de lotes',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        lotes: lotes,
                        total: conteo
                    });
                });
            });
});

// =======================================================
// Actualizar lote
// =======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Lote.findById(id, (err, lote) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar lote',
                errors: err
            });
        }
        if (!lote) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El lote con el id ' + id + ' no existe.',
                errors: { messaje: 'No existe un lote con ese ID.' }
            });
        }
        var body = req.body;
        lote.codigo = body.codigo;
        lote.nombre = body.nombre;
        lote.nombrerepresentante = body.nombrerepresentante;
        lote.ccrepresentante = body.ccrepresentante;
        lote.municipio = body.municipio;

        lote.save((err, loteGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el lote',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                lote: loteGuardado
            });
        });

    });
});

// =======================================================
// Crear un nuevo lote
// =======================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    if (!body.municipio) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error debe seleccionar un municipio',
        });
    }

    Municipio.findById(body.municipio, (err, municipio) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar municipio',
                errors: err
            });
        }
        if (!municipio) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El municipio con el id ' + body.municipio + ' no existe.',
                errors: { messaje: 'No existe un municipio con ese ID.' }
            });
        }
        var lote = new Lote({
            codigo: body.codigo,
            nombre: body.nombre,
            ccrepresentante: body.ccrepresentante,
            nombrerepresentante: body.nombrerepresentante,
            img: body.img,
            usuario: req.usuario._id,
            municipio: municipio._id
        });
        lote.save((err, loteGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear lote',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                lote: loteGuardado,
                usuariotoken: req.usuario,
                municipio: municipio
            });
        });
    });


});

// =======================================================
// Borrar un lote por el id
// =======================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Lote.findByIdAndRemove(id, (err, loteBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar lote',
                errors: err
            });
        }
        if (!loteBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un lote con ese ID',
                errors: { messaje: 'No existe un lote con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            lote: loteBorrado
        });
    });

});

module.exports = app;