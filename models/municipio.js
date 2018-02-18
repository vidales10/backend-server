var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var municipioSchema = new Schema({
    nombre: { type: String, index: { unique: true }, required: [true, 'El nombre es necesario'], uppercase: true },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'municipios' });

municipioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Municipio', municipioSchema);