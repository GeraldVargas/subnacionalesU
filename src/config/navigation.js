import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    ShieldAlert, 
    Map, 
    Flag,
    BarChart3,
    Grid3x3,
    History
} from 'lucide-react';

export const MENU_ITEMS = [
    { 
      id: 'dashboard', 
      label: 'Dashboard General', 
      icon: LayoutDashboard, 
      path: '/dashboard',
      roles: ['Administrador del Sistema'],
      rolesId: [1]
    },
    { 
      id: 'usuarios', 
      label: 'Usuarios y Roles', 
      icon: Users, 
      path: '/dashboard/usuarios',
      roles: ['Administrador del Sistema'],
      rolesId: [1]
    },
    { 
      id: 'geografia', 
      label: 'Parámetros Geográficos', 
      icon: Map, 
      path: '/dashboard/geografia',
      roles: ['Administrador del Sistema'],
      rolesId: [1]
    },
    { 
      id: 'mesas', 
      label: 'Recintos y Mesas', 
      icon: Grid3x3, 
      path: '/dashboard/mesas',
      roles: ['Administrador del Sistema'],
      rolesId: [1]
    },
    { 
      id: 'partidos', 
      label: 'Frentes Políticos', 
      icon: Flag, 
      path: '/dashboard/partidos',
      roles: ['Administrador del Sistema'],
      rolesId: [1]
    },
    { 
      id: 'resultados', 
      label: 'Resultados en Vivo', 
      icon: BarChart3, 
      path: '/dashboard/resultados',
      roles: ['Administrador del Sistema', 'Operador'],
      rolesId: [1, 2]
    },
    { 
      id: 'transcripcion', 
      label: 'Digitalización de Actas', 
      icon: FileText, 
      path: '/dashboard/transcripcion',
      roles: ['Administrador del Sistema', 'Operador'],
      rolesId: [1, 2]
    },
    { 
      id: 'historial', 
      label: 'Historial de Actas', 
      icon: History, 
      path: '/dashboard/historial',
      roles: ['Administrador del Sistema', 'Operador'],
      rolesId: [1, 2]
    },
    { 
      id: 'asignar-delegado', 
      label: 'Asignar Delegado Mesa', 
      icon: Users, 
      path: '/dashboard/asignar-mesa',
      roles: ['Administrador del Sistema', 'Operador'],
      rolesId: [1, 2]
    },
    { 
      id: 'asignar-jefe', 
      label: 'Asignar Jefe Recinto', 
      icon: Users, 
      path: '/dashboard/asignar-recinto',
      roles: ['Administrador del Sistema', 'Operador'],
      rolesId: [1, 2]
    },
    { 
      id: 'mi-mesa', 
      label: 'Mi Mesa', 
      icon: LayoutDashboard, 
      path: '/dashboard/mi-mesa',
      roles: ['Delegado de Mesa'],
      rolesId: [3]
    },
    { 
      id: 'mi-recinto', 
      label: 'Mi Recinto', 
      icon: LayoutDashboard, 
      path: '/dashboard/mi-recinto',
      roles: ['Jefe de Recinto'],
      rolesId: [4]
    }
];