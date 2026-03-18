import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Modal de confirmación reutilizable para mensajes del sistema
 *
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Callback al cerrar el modal
 * @param {string} tipo - Tipo de mensaje: 'success' | 'error' | 'warning' | 'info'
 * @param {string} titulo - Título del mensaje
 * @param {string} mensaje - Contenido del mensaje
 * @param {string} botonTexto - Texto del botón (por defecto: "Aceptar")
 * @param {function} onConfirm - Callback opcional al confirmar (si no se provee, usa onClose)
 */
const ModalConfirmacion = ({
    isOpen,
    onClose,
    tipo = 'info',
    titulo,
    mensaje,
    botonTexto = 'Aceptar',
    onConfirm
}) => {
    // Cerrar modal con tecla Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Configuración de estilos según el tipo
    const tiposConfig = {
        success: {
            icono: CheckCircle,
            colorIcono: 'text-green-500',
            colorFondo: 'bg-green-50',
            colorBorde: 'border-green-200',
            colorBoton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        },
        error: {
            icono: XCircle,
            colorIcono: 'text-red-500',
            colorFondo: 'bg-red-50',
            colorBorde: 'border-red-200',
            colorBoton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        },
        warning: {
            icono: AlertTriangle,
            colorIcono: 'text-yellow-500',
            colorFondo: 'bg-yellow-50',
            colorBorde: 'border-yellow-200',
            colorBoton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        },
        info: {
            icono: Info,
            colorIcono: 'text-blue-500',
            colorFondo: 'bg-blue-50',
            colorBorde: 'border-blue-200',
            colorBoton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    };

    const config = tiposConfig[tipo] || tiposConfig.info;
    const IconoComponente = config.icono;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scaleIn"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-titulo"
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Contenido */}
                <div className="p-6">
                    {/* Icono */}
                    <div className={`mx-auto w-16 h-16 rounded-full ${config.colorFondo} ${config.colorBorde} border-2 flex items-center justify-center mb-4`}>
                        <IconoComponente className={`w-8 h-8 ${config.colorIcono}`} />
                    </div>

                    {/* Título */}
                    {titulo && (
                        <h3
                            id="modal-titulo"
                            className="text-xl font-bold text-gray-900 text-center mb-3"
                        >
                            {titulo}
                        </h3>
                    )}

                    {/* Mensaje */}
                    {mensaje && (
                        <p className="text-gray-600 text-center mb-6 leading-relaxed">
                            {mensaje}
                        </p>
                    )}

                    {/* Botón de acción */}
                    <button
                        onClick={handleConfirm}
                        className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.colorBoton}`}
                    >
                        {botonTexto}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;
