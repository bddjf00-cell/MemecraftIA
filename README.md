# MemeCraft Code

[![Version](https://img.shields.io/badge/version-1.0.23-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

**Asistente IA para programacion de sistemas, memoria, procesos, reversing, debugging y herramientas para juegos.**

13 modelos incluidos via NVIDIA NIM, sin suscripcion, sin limites. Interfaz Electron con chat streaming, selector visual de modelos, API personalizada y mas.

---

## 🚀 Descargar

| Version | Link |
|---------|------|
| **Portable** (.exe) | [Descargar](https://github.com/bddjf00-cell/MemecraftIA/releases/download/v1.0.23/MemeCraft-Code-1.0.23-portable.exe) |
| **Instalador** (.exe) | [Descargar](https://github.com/bddjf00-cell/MemecraftIA/releases/download/v1.0.23/MemeCraft-Code-1.0.23-Setup.exe) |
| **Pagina oficial** | [descargas.html](desktop/descargas.html) |

O visita la [pagina de releases](https://github.com/bddjf00-cell/MemecraftIA/releases) para versiones anteriores.

---

## 🤖 Modelos incluidos

| Modelo | Atajo | Tag |
|--------|-------|-----|
| Llama 3.1 8B ★ | Ctrl+1 | Flash |
| DeepSeek V4 Flash | Ctrl+= | Flash |
| DeepSeek V4 Pro | Ctrl+[ | Think |
| Llama 3.3 70B | Ctrl+2 | Pro |
| Qwen 3.5 397B | Ctrl+3 | Ultra |
| Nemotron Super 49B | Ctrl+4 | Think |
| Google Gemma 3 | Ctrl+5 | Flash |
| Llama 3.2 Vision | Ctrl+6 | Vision |
| Mixtral 8x7B | Ctrl+7 | MoE |
| MiniMax M2.7 | Ctrl+8 | Long |
| Poolside Laguna | Ctrl+9 | Code |
| GLM 5.2 | Ctrl+0 | Think |
| Kimi K2.6 | Ctrl+- | Kimi |

---

## ✨ Caracteristicas

- **13 modelos IA** via NVIDIA NIM gratuitos
- **Chat streaming** en tiempo real
- **Selector visual** de modelos con grid, logos y shortcuts
- **API personalizada** para cualquier proveedor OpenAI-compatible
- **Multi-modal** con Llama 3.2 Vision (soporte de imagenes)
- **3 modos de trabajo**: Programmer, Student, Ideas
- **Codigo COMPLETO** sin omisiones, con analisis detallado
- **Atajos de teclado** para cambiar de modelo al instante
- **Auto-actualizacion** via GitHub (version instalada)
- **Carga de archivos** y proyectos como contexto
- **Exportacion** a TXT y JSON

---

## 🛠️ Ejecutar desde codigo fuente

Requiere [Node.js](https://nodejs.org/) y npm.

```bash
# Clonar repositorio
git clone https://github.com/bddjf00-cell/MemecraftIA
cd MemecraftIA

# Instalar dependencias
cd desktop
npm install

# Ejecutar app Electron
npm start

# O ejecutar servidor web (alternativa)
node server.js
# Abre http://localhost:3000
```

### Construir instalador

```bash
cd desktop
npm run build:all     # Portable + Instalador
npm run build:portable # Solo portable
npm run build:installer # Solo instalador
```

---

## 🔑 API Key personalizada

Si las claves integradas se agotan, puedes usar tu propia API Key:

1. Ve a [build.nvidia.com](https://build.nvidia.com)
2. Crea una cuenta gratuita
3. Genera tu API Key (empieza con `nvapi-`)
4. Pegala en MemeCraft Code → boton 🔑 API Key

Tambien funciona con cualquier proveedor OpenAI-compatible (OpenAI, Groq, Together, etc).

---

## 📦 Estructura del proyecto

```
MemecraftIA/
├── desktop/               # App Electron
│   ├── index.html         # UI principal
│   ├── main.js            # Proceso principal Electron
│   ├── preload.js         # Bridge IPC
│   ├── package.json       # Dependencias y build config
│   ├── descargas.html     # Pagina oficial de descargas
│   ├── build-tmp/         # Build temporal
│   └── dist-installer/    # Builds generados
├── server.js              # Servidor Node.js (alternativa web)
├── index.html             # Version web standalone
└── Imagenes/
    └── Logo.png
```

---

## 📝 Licencia

MIT © MemeCraft
