var express = require('express');
var fileUpload = require('express-fileupload');
var Usuario = require('../models/usuario');
var Municipio = require('../models/municipio');
var Lote = require('../models/lote');
var fs = require('fs');
var app = express();

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var id = req.params.id;
    var tipo = req.params.tipo;
    // Tipos de coleccion
    var tiposValidos = ['municipios', 'lotes', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no valida',
            errors: { message: 'Debe seleccionar una colección valida: ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extensiones aceptamos
    var extensionesValidas = ['png', 'gif', 'jpg', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo.toLowerCase()) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida',
            errors: { message: 'Debe seleccionar una imagen con una extensión valida: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nombreArchivo, res);

    });
});


function subirPorTipo(tipo, id, nombreArchivo, res) {
    if ('usuarios' === tipo) {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover archivo',
                    errors: err
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); // elimina la imagen anterior
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if ('municipios' === tipo) {
        Municipio.findById(id, (err, municipio) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover archivo',
                    errors: err
                });
            }
            if (!municipio) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Municipio no existe',
                    errors: { message: 'Municipio no existe' }
                });
            }
            var pathViejo = './uploads/municipios/' + municipio.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); // elimina la imagen anterior
            }
            municipio.img = nombreArchivo;
            municipio.save((err, municipioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de municipio actualizada',
                    municipio: municipioActualizado
                });
            });
        });
    }
    if ('lotes' === tipo) {
        Lote.findById(id, (err, lote) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al mover archivo',
                    errors: err
                });
            }
            if (!lote) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Lote no existe',
                    errors: { message: 'Lote no existe' }
                });
            }
            var pathViejo = './uploads/lotes/' + lote.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo); // elimina la imagen anterior
            }
            lote.img = nombreArchivo;
            lote.save((err, loteActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de lote actualizada',
                    lote: loteActualizado
                });
            });
        });
    }
}
module.exports = app;