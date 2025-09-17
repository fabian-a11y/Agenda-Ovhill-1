# Agenda Ovhill - Sistema de Citas

Una aplicación web moderna para agendar citas con profesionales de la salud, diseñada con una interfaz intuitiva y responsiva.

## Características

### 🎯 Funcionalidades Principales

- **Selección de Profesionales**: Interfaz visual para elegir entre diferentes profesionales de la salud
- **Agendamiento por Fechas**: Calendario interactivo para seleccionar fechas disponibles
- **Selección de Horarios**: Sistema de slots de tiempo con disponibilidad en tiempo real
- **Proceso de Reserva**: Flujo de 3 pasos con barra de progreso
- **Validación de Formularios**: Validación en tiempo real de datos del usuario
- **Confirmación de Citas**: Modal de éxito con código de cita generado automáticamente

### 🎨 Diseño y UX

- **Diseño Moderno**: Interfaz con gradientes y efectos glassmorphism
- **Totalmente Responsivo**: Optimizado para desktop, tablet y móvil
- **Animaciones Suaves**: Transiciones y micro-interacciones mejoradas
- **Navegación Intuitiva**: Proceso guiado con indicadores visuales claros
- **Feedback Visual**: Estados activos, hover y selección claramente definidos

## Estructura del Proyecto

```
Agenda Ovhill-1/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos CSS y diseño responsivo
├── script.js           # Lógica JavaScript y funcionalidad
└── README.md           # Documentación del proyecto
```

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesibilidad
- **CSS3**: Flexbox, Grid, animaciones y diseño responsivo
- **JavaScript ES6+**: Clases, eventos, y manipulación del DOM
- **Font Awesome**: Iconos vectoriales
- **APIs Nativas**: Date, Form Validation, DOM Manipulation

## Instalación y Uso

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No se requiere servidor web (puede ejecutarse localmente)

### Ejecución

1. Abre el archivo `index.html` en tu navegador web
2. Sigue el proceso de 3 pasos para agendar una cita:
   - **Paso 1**: Selecciona un profesional
   - **Paso 2**: Elige fecha y hora disponible
   - **Paso 3**: Completa tus datos y confirma

## Flujo de Usuario

### 1. Selección de Profesional
- Visualización de tarjetas de profesionales con:
  - Foto/avatar
  - Nombre y especialidad
  - Calificación (estrellas)
  - Duración típica de consulta
- Selección visual con efecto hover y estado activo

### 2. Fecha y Hora
- Selector de fecha con restricción (mínimo día siguiente)
- Grid de horarios disponibles con:
  - Slots de 30 minutos
  - Indicadores de disponibilidad
  - Selección visual clara

### 3. Confirmación
- Resumen de la cita seleccionada
- Formulario de datos del usuario con validación:
  - Nombre completo (mínimo 2 caracteres)
  - Email (formato válido)
  - Teléfono (formato numérico)
  - Notas opcionales
- Botón de confirmación con generación de código de cita

## Características Técnicas

### JavaScript Class-Based Architecture
- Clase `AppointmentBooking` para manejar el estado
- Gestión de pasos y navegación
- Validación de formularios en tiempo real
- Generación de códigos de cita únicos

### CSS Features
- Sistema de grid y flexbox para layouts responsivos
- Variables CSS para consistencia de colores
- Animaciones y transiciones suaves
- Media queries para diferentes dispositivos

### Accesibilidad
- Estructura HTML semántica
- Navegación por teclado (Enter, Escape)
- Estados ARIA implícitos
- Contraste de colores adecuado

## Personalización

### Agregar Nuevos Profesionales

Edita el objeto `professionals` en `script.js`:

```javascript
this.professionals = {
    5: { 
        name: 'Dr. Nuevo Profesional', 
        specialty: 'Especialidad', 
        duration: '45 min' 
    }
};
```

### Modificar Horarios Disponibles

Edita el array `timeSlots` en el método `generateTimeSlots()`:

```javascript
const timeSlots = [
    '09:00', '09:30', '10:00', // ... agregar más horarios
];
```

### Personalizar Colores

Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #4caf50;
    /* ... más variables */
}
```

## Mejoras Futuras

- [ ] Integración con backend para persistencia de datos
- [ ] Sistema de autenticación de usuarios
- [ ] Notificaciones por email/SMS
- [ ] Calendario de disponibilidad real
- [ ] Sistema de pagos
- [ ] Historial de citas del usuario
- [ ] Cancelación y reprogramación de citas
- [ ] Integración con Google Calendar

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor contacta al equipo de desarrollo.

## Licencia

Este proyecto es para uso educativo y demostrativo.
