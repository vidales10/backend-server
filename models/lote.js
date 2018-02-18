var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var loteSchema = new Schema({
    codigo: { type: String, index: { unique: true }, required: [true, 'El código es necesario'] },
    nombre: { type: String, required: [true, 'El nombre es necesario'], uppercase: true },
    img: { type: String, required: false },
    ccrepresentante: { type: String, required: false },
    nombrerepresentante: { type: String, required: false, uppercase: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    municipio: { type: Schema.Types.ObjectId, ref: 'Municipio' }
}, { collection: 'lotes' });

loteSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Lote', loteSchema);