# JobCenter Kronach 3D - Профессиональное Веб-Приложение

Современное 3D веб-приложение для JobCenter Kronach с использованием React Three Fiber, FastAPI и WebSockets для real-time обновлений.

## 🎯 Особенности

- **🎨 Интерактивная 3D среда** - Полностью интерактивная 3D сцена с модулями для различных разделов
- **⚡ Real-time обновления** - WebSocket соединение для живых обновлений статистики и уведомлений
- **📱 Адаптивный дизайн** - Оптимизация для desktop и mobile устройств
- **🚀 Высокая производительность** - Автоматическое определение производительности устройства и адаптация
- **🔄 API интеграция** - Полная интеграция с FastAPI backend
- **💾 State Management** - Zustand для управления состоянием
- **🎭 Анимации** - Framer Motion для плавных UI переходов

## 📁 Структура проекта

```
jobcenter-3d/
├── src/
│   ├── components/
│   │   ├── Scene/
│   │   │   ├── Scene.jsx
│   │   │   ├── FloatingModule.jsx
│   │   │   ├── Particles.jsx
│   │   │   ├── CentralSphere.jsx
│   │   │   └── CentralRing.jsx
│   │   ├── Jobs/
│   │   │   └── JobsPanel.jsx
│   │   └── UI/
│   ├── hooks/
│   │   ├── useStore.js         # Zustand store
│   │   └── useWebSocket.js     # WebSocket hooks
│   ├── api/
│   │   └── index.js            # API services
│   ├── config/
│   │   └── index.js            # Configuration
│   ├── assets/
│   │   ├── models/             # 3D models (GLB/GLTF)
│   │   ├── textures/           # Textures
│   │   └── hdr/                # HDR environments
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/
│   ├── main.py                 # FastAPI application
│   └── requirements.txt
├── public/
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Установка и запуск

### Требования

- Node.js 18+ и npm
- Python 3.9+
- Git

### 1. Клонирование репозитория

```bash
git clone https://github.com/yourusername/jobcenter-kronach-3d.git
cd jobcenter-kronach-3d
```

### 2. Frontend Setup

```bash
# Установка зависимостей
npm install

# Создание .env файла
echo "VITE_API_URL=http://localhost:8000" > .env
echo "VITE_WS_URL=ws://localhost:8000" >> .env

# Запуск dev сервера
npm run dev
```

Frontend будет доступен на `http://localhost:3000`

### 3. Backend Setup

```bash
# Перейти в папку backend
cd backend

# Создать виртуальное окружение
python -m venv venv

# Активировать виртуальное окружение
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
python main.py
```

Backend API будет доступен на `http://localhost:8000`

API документация: `http://localhost:8000/docs`

## 🔧 Конфигурация

### Performance Levels

Приложение автоматически определяет производительность устройства и применяет соответствующие настройки:

- **LOW**: Mobile устройства, слабые ПК (50 частиц, упрощенные материалы)
- **MEDIUM**: Средние ПК (75 частиц, базовые эффекты)
- **HIGH**: Мощные ПК (100 частиц, все эффекты включены)

### API Endpoints

```javascript
// Jobs
GET    /api/jobs              - Получить все вакансии
GET    /api/jobs/{id}         - Получить вакансию по ID
GET    /api/jobs/search?q=    - Поиск вакансий
POST   /api/jobs/{id}/apply   - Подать заявку

// Stats
GET    /api/stats             - Получить статистику

// Leads
POST   /api/leads             - Создать лид

// WebSockets
WS     /ws/stats              - Real-time статистика
WS     /ws/leads              - Real-time уведомления о лидах
```

## 📦 Сборка для production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

Собранные файлы будут в папке `dist/`

## 🌐 Деплой

### Vercel (Frontend)

1. Создайте аккаунт на [Vercel](https://vercel.com)
2. Установите Vercel CLI:
```bash
npm i -g vercel
```

3. Деплой:
```bash
vercel
```

4. Добавьте environment variables в Vercel dashboard:
   - `VITE_API_URL` - URL вашего backend API
   - `VITE_WS_URL` - URL вашего WebSocket сервера

### Railway/Render (Backend)

#### Railway:
1. Создайте аккаунт на [Railway](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий
4. Railway автоматически определит Python приложение
5. Добавьте переменную `PORT=8000`

#### Render:
1. Создайте аккаунт на [Render](https://render.com)
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && python main.py`

## 🎨 Создание 3D моделей в Blender

### Экспорт для Web

1. Создайте модель в Blender
2. File → Export → glTF 2.0 (.glb/.gltf)
3. Настройки экспорта:
   - Format: glTF Binary (.glb)
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers, UVs, Normals
   - Compression: Draco (для меньшего размера)

4. Поместите файл в `src/assets/models/`

### Использование в проекте

```jsx
import { useGLTF } from '@react-three/drei';

function CustomModel() {
  const { scene } = useGLTF('/models/your-model.glb');
  return <primitive object={scene} />;
}
```

## 🖼️ HDR Окружения

Скачайте HDR панорамы:
- [Poly Haven](https://polyhaven.com/hdris) - Бесплатные HDR
- [HDRI Haven](https://hdrihaven.com/) - Качественные HDR

Использование:
```jsx
import { Environment } from '@react-three/drei';

<Environment files="/hdr/your-environment.hdr" />
```

## 🔍 Оптимизация

### Текстуры
- Используйте сжатые форматы (WebP, KTX2)
- Размеры степени двойки (512, 1024, 2048)
- Используйте мипмапы

### Модели
- Оптимизируйте полигоны (используйте Decimate modifier)
- Объединяйте мелкие объекты
- Используйте Level of Detail (LOD)
- Draco сжатие для glTF

### Performance Tips
```jsx
// Lazy loading
const Model = lazy(() => import('./Model'));

// Memoization
const MemoizedComponent = memo(Component);

// useCallback для функций
const handleClick = useCallback(() => {}, []);
```

## 🧪 Тестирование

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub
```

## 🐛 Troubleshooting

### CORS ошибки
Убедитесь, что в `backend/main.py` добавлен ваш frontend URL в `allow_origins`

### WebSocket не подключается
Проверьте, что backend запущен и WS URL правильный в `.env`

### 3D модели не загружаются
- Проверьте путь к файлу
- Убедитесь, что файл в правильном формате (glb/gltf)
- Проверьте console на ошибки

### Низкая производительность
- Уменьшите количество полигонов
- Отключите тяжелые эффекты на слабых устройствах
- Используйте `frameloop="demand"` вместо постоянного рендеринга

## 📚 Ресурсы

- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Docs](https://threejs.org/docs/)
- [Drei Components](https://github.com/pmndrs/drei)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Vercel Docs](https://vercel.com/docs)

## 📄 Лицензия

MIT License

## 👨‍💻 Автор

Maksym - [GitHub](https://github.com/yourusername)

---

**Дата создания**: 14 февраля 2026  
**Версия**: 1.0.0  
**Для презентации**: 25 февраля 2026, Frau Waurig-Schneider
