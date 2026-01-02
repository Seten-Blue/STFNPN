const Gasto = require('../models/gasto');

exports.obtenerGastos = async (req, res) => {
  try {
    const { fecha, mes, grupo, tipo } = req.query;
    let filtro = {};

    if (fecha) {
      const start = new Date(fecha);
      const end = new Date(fecha);
      end.setHours(23, 59, 59, 999);
      filtro.fecha = { $gte: start, $lte: end };
    }

    if (mes) {
      const [year, month] = mes.split('-');
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      filtro.fecha = { $gte: start, $lte: end };
    }

    if (grupo) filtro.grupo = grupo;

    if (tipo) filtro.tipo = tipo;

    const gastos = await Gasto.find(filtro);
    res.status(200).json({
      success: true,
      data: gastos,
      message: "Lista de gastos obtenidos"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los gastos',
      error: error.message
    });
  }
};

exports.agregarGasto = async (req, res) => {
  try {
    const { nombre, valor, fecha, categoria, descripcion, grupo, tipo } = req.body;
    if (!nombre || !valor || !fecha || !categoria || !tipo) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios (nombre, valor, fecha, categoria, tipo)'
      });
    }
    const nuevoGasto = new Gasto({ nombre, valor, fecha, categoria, descripcion, grupo, tipo });
    await nuevoGasto.save();
    res.status(201).json({
      success: true,
      data: nuevoGasto,
      message: 'Gasto agregado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar el gasto',
      error: error.message
    });
  }
};

exports.actualizarGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, valor, fecha, categoria, descripcion, grupo, tipo } = req.body;
    const actualizado = await Gasto.findByIdAndUpdate(
      id,
      { nombre, valor, fecha, categoria, descripcion, grupo, tipo },
      { new: true, runValidators: true }
    );
    if (!actualizado) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      data: actualizado,
      message: 'Gasto actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el gasto',
      error: error.message
    });
  }
};

exports.eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Gasto.findByIdAndDelete(id);
    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      message: `Gasto con id ${id} eliminado correctamente`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el gasto',
      error: error.message
    });
  }
};