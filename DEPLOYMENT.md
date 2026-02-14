# Deployment Guide - Vercel + Railway

## 🚀 Быстрый старт

Этот гайд поможет вам задеплоить проект на Vercel (frontend) и Railway (backend).

## Part 1: Backend на Railway

### Шаг 1: Подготовка
1. Создайте аккаунт на [Railway.app](https://railway.app)
2. Установите Railway CLI (опционально):
```bash
npm i -g @railway/cli
```

### Шаг 2: Создание проекта
1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Авторизуйте GitHub и выберите ваш репозиторий
4. Railway автоматически определит Python приложение

### Шаг 3: Настройка
1. В разделе "Variables" добавьте:
   ```
   PORT=8000
   PYTHONUNBUFFERED=1
   ```

2. В разделе "Settings":
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`

3. Нажмите "Deploy"

### Шаг 4: Получение URL
После деплоя Railway предоставит вам URL типа:
```
https://your-project.up.railway.app
```

**Сохраните этот URL** - он понадобится для фронтенда!

## Part 2: Frontend на Vercel

### Шаг 1: Подготовка
1. Создайте аккаунт на [Vercel.com](https://vercel.com)
2. Установите Vercel CLI:
```bash
npm i -g vercel
```

### Шаг 2: Настройка Environment Variables
Создайте файл `.env.production`:
```bash
VITE_API_URL=https://your-project.up.railway.app
VITE_WS_URL=wss://your-project.up.railway.app
```

### Шаг 3: Деплой
Из корневой папки проекта:
```bash
vercel
```

Следуйте инструкциям CLI:
1. Set up and deploy? **Yes**
2. Which scope? **Выберите ваш аккаунт**
3. Link to existing project? **No**
4. What's your project's name? **jobcenter-kronach-3d**
5. In which directory is your code located? **./** (нажмите Enter)

### Шаг 4: Добавление Environment Variables
```bash
vercel env add VITE_API_URL
# Введите: https://your-project.up.railway.app

vercel env add VITE_WS_URL
# Введите: wss://your-project.up.railway.app
```

### Шаг 5: Production Deploy
```bash
vercel --prod
```

Готово! Ваше приложение будет доступно по адресу:
```
https://jobcenter-kronach-3d.vercel.app
```

## Обновление CORS в Backend

После получения Vercel URL, обновите `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://jobcenter-kronach-3d.vercel.app",  # ВАШ VERCEL URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Закоммитьте и запушьте изменения - Railway автоматически передеплоит.

## Проверка работы

### 1. Проверка Backend
```bash
curl https://your-project.up.railway.app/api/stats
```

Должен вернуть JSON со статистикой.

### 2. Проверка Frontend
Откройте ваш Vercel URL в браузере:
```
https://jobcenter-kronach-3d.vercel.app
```

### 3. Проверка WebSocket
В консоли браузера (F12) вы должны увидеть:
```
WebSocket connected
```

## Troubleshooting

### Backend не запускается
1. Проверьте логи в Railway dashboard
2. Убедитесь, что `requirements.txt` содержит все зависимости
3. Проверьте, что порт 8000 используется

### Frontend не может подключиться к API
1. Проверьте Environment Variables в Vercel
2. Убедитесь, что CORS настроен правильно
3. Проверьте, что backend URL доступен

### WebSocket ошибки
1. Убедитесь, что используете `wss://` (не `ws://`) для production
2. Проверьте, что backend поддерживает WebSocket соединения
3. Проверьте логи браузера и backend

## Мониторинг

### Railway
- Dashboard: https://railway.app/dashboard
- Логи: Раздел "Deployments" → "View Logs"
- Metrics: Раздел "Metrics"

### Vercel
- Dashboard: https://vercel.com/dashboard
- Логи: Project → Deployments → Logs
- Analytics: Project → Analytics

## Automatic Deployments

Оба сервиса настроены на автоматический деплой при push в main:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

Railway и Vercel автоматически:
1. Обнаружат изменения
2. Запустят сборку
3. Задеплоят новую версию

## Custom Domain (Опционально)

### Vercel
1. Project Settings → Domains
2. Add Domain → Введите ваш домен
3. Настройте DNS записи у вашего провайдера

### Railway
1. Project → Settings → Domains
2. Add Custom Domain
3. Настройте CNAME запись

## Стоимость

### Vercel
- Free tier: Достаточно для большинства проектов
- 100GB bandwidth
- Unlimited deployments

### Railway
- Free tier: $5 в месяц кредитов
- Затем $0.000231/GB-sec для RAM
- $0.000463/vCPU-sec

## Следующие шаги

1. ✅ Настройте CI/CD
2. ✅ Добавьте тесты
3. ✅ Настройте мониторинг ошибок (Sentry)
4. ✅ Добавьте analytics (Google Analytics)
5. ✅ Настройте backup базы данных

---

**Успехов с деплоем! 🚀**

Если возникнут вопросы - проверьте документацию:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
