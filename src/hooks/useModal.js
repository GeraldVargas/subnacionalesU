import { useState } from 'react';

/**
 * Hook personalizado para gestionar modales de confirmación
 *
 * @returns {Object} - Objeto con estado y funciones para el modal
 */
export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        tipo: 'info',
        titulo: '',
        mensaje: '',
        botonTexto: 'Aceptar'
    });

    /**
     * Mostrar modal con configuración personalizada
     *
     * @param {string} tipo - Tipo de modal: 'success' | 'error' | 'warning' | 'info'
     * @param {string} titulo - Título del modal
     * @param {string} mensaje - Mensaje del modal
     * @param {string} botonTexto - Texto del botón (opcional)
     */
    const mostrarModal = (tipo, titulo, mensaje, botonTexto = 'Aceptar') => {
        setModalConfig({
            tipo,
            titulo,
            mensaje,
            botonTexto
        });
        setIsOpen(true);
    };

    /**
     * Cerrar el modal
     */
    const cerrarModal = () => {
        setIsOpen(false);
    };

    /**
     * Mostrar modal de éxito
     */
    const mostrarExito = (titulo, mensaje) => {
        mostrarModal('success', titulo, mensaje);
    };

    /**
     * Mostrar modal de error
     */
    const mostrarError = (titulo, mensaje) => {
        mostrarModal('error', titulo, mensaje);
    };

    /**
     * Mostrar modal de advertencia
     */
    const mostrarAdvertencia = (titulo, mensaje) => {
        mostrarModal('warning', titulo, mensaje);
    };

    /**
     * Mostrar modal de información
     */
    const mostrarInfo = (titulo, mensaje) => {
        mostrarModal('info', titulo, mensaje);
    };

    return {
        isOpen,
        modalConfig,
        mostrarModal,
        cerrarModal,
        mostrarExito,
        mostrarError,
        mostrarAdvertencia,
        mostrarInfo
    };
};

export default useModal;
