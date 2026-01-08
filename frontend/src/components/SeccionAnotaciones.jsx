import { useState, useEffect } from 'react';
import { anotacionesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/SeccionAnotaciones.css';

function SeccionAnotaciones() {
  const { usuario } = useAuth();
  const [anotaciones, setAnotaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filtroCompletada, setFiltroCompletada] = useState('todas');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);

  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    categoria: 'personal',
    etiquetas: [],
    color: '#FFE082',
    prioridad: 'media',
    tieneRecordatorio: false,
    fechaRecordatorio: '',
    horaRecordatorio: '',
  });

  // Cargar anotaciones
  useEffect(() => {
    cargarAnotaciones();
    cargarEstadisticas();
  }, [filtroCompletada, filtroCategoria]);

  const cargarAnotaciones = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const filtros = {};
      if (filtroCompletada !== 'todas') {
        filtros.completada = filtroCompletada === 'completadas';
      }
      if (filtroCategoria !== 'todas') {
        filtros.categoria = filtroCategoria;
      }
      if (busqueda) {
        filtros.busqueda = busqueda;
      }

      const data = await anotacionesAPI.obtener(filtros);
      setAnotaciones(data.anotaciones || []);
    } catch (error) {
      console.error('Error al cargar anotaciones:', error);
      alert('Error al cargar anotaciones');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await anotacionesAPI.obtenerEstadisticas();
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEtiquetas = (e) => {
    const valor = e.target.value;
    if (e.key === 'Enter' && valor.trim()) {
      e.preventDefault();
      if (!formData.etiquetas.includes(valor.trim())) {
        setFormData(prev => ({
          ...prev,
          etiquetas: [...prev.etiquetas, valor.trim()]
        }));
      }
      e.target.value = '';
    }
  };

  const removerEtiqueta = (etiqueta) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter(e => e !== etiqueta)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.titulo || !formData.contenido) {
        alert('Por favor completa título y contenido');
        return;
      }

      if (editingId) {
        await anotacionesAPI.actualizar(editingId, formData);
      } else {
        await anotacionesAPI.crear(formData);
      }

      setFormData({
        titulo: '',
        contenido: '',
        categoria: 'personal',
        etiquetas: [],
        color: '#FFE082',
        prioridad: 'media',
        tieneRecordatorio: false,
        fechaRecordatorio: '',
        horaRecordatorio: '',
      });
      setEditingId(null);
      setShowForm(false);
      cargarAnotaciones();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al guardar anotación:', error);
      alert('Error al guardar anotación');
    }
  };

  const handleMarcarCompletada = async (id) => {
    try {
      await anotacionesAPI.marcarCompletada(id);
      cargarAnotaciones();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar anotación');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta anotación?')) return;
    try {
      await anotacionesAPI.eliminar(id);
      cargarAnotaciones();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar anotación');
    }
  };

  const handleEditar = (anotacion) => {
    setFormData({
      titulo: anotacion.titulo,
      contenido: anotacion.contenido,
      categoria: anotacion.categoria,
      etiquetas: anotacion.etiquetas,
      color: anotacion.color,
      prioridad: anotacion.prioridad,
      tieneRecordatorio: anotacion.tieneRecordatorio,
      fechaRecordatorio: anotacion.fechaRecordatorio?.split('T')[0] || '',
      horaRecordatorio: anotacion.horaRecordatorio || '',
    });
    setEditingId(anotacion._id);
    setShowForm(true);
  };

  const coloresDisponibles = ['#FFE082', '#FFCCBC', '#C8E6C9', '#B3E5FC', '#F8BBD0', '#E1BEE7', '#FFFACD'];

  const coloresPrioridad = {
    alta: '#FF6B6B',
    media: '#FFA500',
    baja: '#4CAF50'
  };

  return (
    <div className="seccion-anotaciones">
      <div className="header-anotaciones">
        <h2>📝 Anotaciones y Recordatorios</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              titulo: '',
              contenido: '',
              categoria: 'personal',
              etiquetas: [],
              color: '#FFE082',
              prioridad: 'media',
              tieneRecordatorio: false,
              fechaRecordatorio: '',
              horaRecordatorio: '',
            });
          }}
          className="btn-nueva-anotacion"
        >
          {showForm ? 'Cancelar' : '+ Nueva Anotación'}
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-anotaciones">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{estadisticas.totalAnotaciones}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Completadas</span>
            <span className="stat-value">{estadisticas.completadas}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{estadisticas.pendientes}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">% Completadas</span>
            <span className="stat-value">{estadisticas.tasaComplecion}%</span>
          </div>
          <div className="stat-card alert">
            <span className="stat-label">⚠️ Alta Prioridad</span>
            <span className="stat-value">{estadisticas.tareasAltaPrioridad}</span>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="formulario-anotacion">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                placeholder="Título de la anotación"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Contenido</label>
              <textarea
                name="contenido"
                value={formData.contenido}
                onChange={handleInputChange}
                placeholder="Escribe tu anotación aquí..."
                rows={5}
                maxLength={5000}
              />
              <small>{formData.contenido.length}/5000</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                >
                  <option value="personal">Personal</option>
                  <option value="financiera">Financiera</option>
                  <option value="tarea">Tarea</option>
                  <option value="recordatorio">Recordatorio</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Prioridad</label>
                <select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleInputChange}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {coloresDisponibles.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Etiquetas (presiona Enter para añadir)</label>
              <div className="etiquetas-container">
                {formData.etiquetas.map(etiqueta => (
                  <span key={etiqueta} className="etiqueta">
                    {etiqueta}
                    <button
                      type="button"
                      onClick={() => removerEtiqueta(etiqueta)}
                      className="btn-remover-etiqueta"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Añadir etiqueta"
                  onKeyDown={handleEtiquetas}
                  className="input-etiqueta"
                />
              </div>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="tieneRecordatorio"
                  checked={formData.tieneRecordatorio}
                  onChange={handleInputChange}
                />
                Crear recordatorio
              </label>
            </div>

            {formData.tieneRecordatorio && (
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Recordatorio</label>
                  <input
                    type="date"
                    name="fechaRecordatorio"
                    value={formData.fechaRecordatorio}
                    onChange={handleInputChange}
                    required={formData.tieneRecordatorio}
                  />
                </div>
                <div className="form-group">
                  <label>Hora Recordatorio</label>
                  <input
                    type="time"
                    name="horaRecordatorio"
                    value={formData.horaRecordatorio}
                    onChange={handleInputChange}
                    required={formData.tieneRecordatorio}
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-guardar">
                {editingId ? 'Actualizar' : 'Guardar'} Anotación
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-anotaciones">
        <div className="filtro">
          <label>Estado</label>
          <select
            value={filtroCompletada}
            onChange={(e) => {
              setFiltroCompletada(e.target.value);
            }}
          >
            <option value="todas">Todas</option>
            <option value="pendientes">Pendientes</option>
            <option value="completadas">Completadas</option>
          </select>
        </div>

        <div className="filtro">
          <label>Categoría</label>
          <select
            value={filtroCategoria}
            onChange={(e) => {
              setFiltroCategoria(e.target.value);
            }}
          >
            <option value="todas">Todas</option>
            <option value="personal">Personal</option>
            <option value="financiera">Financiera</option>
            <option value="tarea">Tarea</option>
            <option value="recordatorio">Recordatorio</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="filtro busqueda">
          <input
            type="text"
            placeholder="Buscar anotaciones..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') cargarAnotaciones();
            }}
          />
          <button onClick={cargarAnotaciones} className="btn-buscar">
            🔍
          </button>
        </div>
      </div>

      {/* Lista de anotaciones */}
      <div className="lista-anotaciones">
        {loading ? (
          <p className="loading">Cargando anotaciones...</p>
        ) : anotaciones.length === 0 ? (
          <p className="sin-anotaciones">No hay anotaciones para mostrar</p>
        ) : (
          anotaciones.map(anotacion => (
            <div
              key={anotacion._id}
              className={`anotacion-card ${anotacion.completada ? 'completada' : ''}`}
              style={{ borderLeftColor: anotacion.color, borderLeftWidth: '4px' }}
            >
              <div className="anotacion-header">
                <div className="anotacion-titulo">
                  <input
                    type="checkbox"
                    checked={anotacion.completada}
                    onChange={() => handleMarcarCompletada(anotacion._id)}
                    className="checkbox-anotacion"
                  />
                  <h3>{anotacion.titulo}</h3>
                  {anotacion.tieneRecordatorio && (
                    <span className="recordatorio-badge" title="Tiene recordatorio">🔔</span>
                  )}
                  <span className="prioridad-badge" style={{ backgroundColor: coloresPrioridad[anotacion.prioridad] }}>
                    {anotacion.prioridad}
                  </span>
                </div>
                <div className="anotacion-acciones">
                  <button
                    onClick={() => handleEditar(anotacion)}
                    className="btn-editar"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleEliminar(anotacion._id)}
                    className="btn-eliminar"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="anotacion-contenido">{anotacion.contenido}</p>

              <div className="anotacion-footer">
                <div className="anotacion-meta">
                  <span className="categoria-tag">{anotacion.categoria}</span>
                  {anotacion.etiquetas.length > 0 && (
                    <div className="etiquetas">
                      {anotacion.etiquetas.map(etiqueta => (
                        <span key={etiqueta} className="etiqueta-small">
                          #{etiqueta}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <small className="fecha-creacion">
                  {new Date(anotacion.fechaCreacion).toLocaleDateString()} {new Date(anotacion.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SeccionAnotaciones;
