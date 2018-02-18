var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var subloteSchema = new Schema({
    codigo: { type: String, index: { unique: true }, required: [true, 'El código es necesario'] },
    nombre: { type: String, required: [true, 'El nombre es necesario'], uppercase: true },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    lote: { type: Schema.Types.ObjectId, ref: 'Lote' }
}, { collection: 'lotes' });

subloteSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Sublote', subloteSchema);