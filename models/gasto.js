const mongoose = require('mongoose');

const GastoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  valor: { type: Number, required: true },
  fecha: { type: Date, required: true },
  categoria: { type: String, required: true },
  descripcion: { type: String },
  grupo: { type: String },
  tipo: { type: String, enum: ['gasto', 'ingreso'], required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gasto', GastoSchema);
