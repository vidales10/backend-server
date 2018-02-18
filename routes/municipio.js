var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Municipio = require('../models/municipio');

// =======================================================
// obtener todos los municipios
// =======================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Municipio.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, municipios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando municipios',
                        errors: err
                    });
                }
                Municipio.count({}, (err, conteo) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error en el conteo de municipios',
                            errors: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        municipios: municipios,
                        total: conteo
                    });
                });
            });
});

// =======================================================
// Actualizar municipio
// =======================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Municipio.findById(id, (err, municipio) => {
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
                mensaje: 'El municipio con el id ' + id + ' no existe.',
                errors: { messaje: 'No existe un municipio con ese ID.' }
            });
        }
        var body = req.body;
        municipio.nombre = body.nombre;

        municipio.save((err, municipioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el municipio',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                municipio: municipioGuardado
            });
        });

    });
});

// =======================================================
// Crear un nuevo municipio
// =======================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var municipio = new Municipio({
        nombre: body.nombre,
        usuario: req.usuario._id,
        img: body.img
    });
    municipio.save((err, municipioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear municipio',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            municipio: municipioGuardado,
            usuariotoken: req.usuario
        });
    });
});

// =======================================================
// Borrar un municipio por el id
// =======================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Municipio.findByIdAndRemove(id, (err, municipioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar municipio',
                errors: err
            });
        }
        if (!municipioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un municipio con ese ID',
                errors: { messaje: 'No existe un municipio con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            municipio: municipioBorrado
        });
    });

});

module.exports = app;