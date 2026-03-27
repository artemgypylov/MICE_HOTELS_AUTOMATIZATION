# AGENTS.md

## Project Overview

B2B web-платформа для создания event-предложений отелей MICE-сегмента. 
Пользователи проходят 5-шаговый визард и получают смету с ценами.

## Project Structure

```
MICE_HOTELS_AUTOMATIZATION/
├── backend/          # Express + TypeScript + Prisma API
│   ├── src/
│   │   ├── routes/   # REST endpoints
│   │   ├── middleware/
│   │   └── utils/
│   └── prisma/       # Схема БД и миграции
├── frontend/         # React 18 + TypeScript + MUI
│   └── src/
│       ├── components/wizard/steps/  # Шаги визарда Step1-Step5
│       ├── pages/
│       ├── services/
│       └── types/
├── mobile/           # React Native + Expo (iOS/Android)
│   └── src/
│       ├── screens/
│       ├── navigation/
│       └── services/
└── docker-compose.yml
```

## Commands

```bash
# Быстрый старт всего проекта
docker-compose up

# Backend
cd backend && npm run dev              # Запуск dev-сервера (порт 3000)
cd backend && npm run lint && npm run build  # Проверка перед коммитом
cd backend && npx prisma migrate dev   # Применить миграции
cd backend && npm run prisma:seed      # Наполнить БД тестовыми данными

# Frontend  
cd frontend && npm run dev             # Запуск dev-сервера (порт 5173)
cd frontend && npm run lint && npm run build  # Проверка перед коммитом

# Mobile
cd mobile && npm start                 # Запуск Expo (сканируй QR)
```

## Conventions

### Backend
- Используй Prisma ORM для всех запросов к БД, не пиши сырой SQL
- Валидация через Zod — переиспользуй схемы между backend и frontend
- JWT-аутентификация: токены в Authorization header, не в cookies
- Все цены храни как DECIMAL, не используй FLOAT
- Новые роуты добавляй в соответствующий файл `src/routes/*.routes.ts`

### Frontend
- UI-компоненты только из Material-UI (MUI), не добавляй другие UI-библиотеки
- Серверное состояние через TanStack Query (useQuery, useMutation)
- Формы через React Hook Form + Zod
- Новые компоненты визарда — в `components/wizard/steps/`
- Используй date-fns для работы с датами

### Mobile
- React Native с Expo — не используй eject без обсуждения
- Навигация через React Navigation
- Переиспользуй types из `src/types/` — держи синхронизированными с backend

### Общие
- TypeScript strict mode во всех проектах
- Именование: camelCase для переменных/функций, PascalCase для компонентов/типов
- API endpoints: `/api/resource` (множественное число: `/api/hotels`, `/api/bookings`)

## Boundaries

### MUST DO
- Обновляй AGENTS.md при изменении структуры проекта
- Запускай lint перед коммитом в каждом изменённом пакете
- При добавлении полей в БД создавай миграцию через `prisma migrate dev`
- Пиши типы — не используй `any`

### ASK FIRST
- Добавление новых npm-зависимостей — обсуди с пользователем
- Изменение структуры БД — покажи план миграции
- Изменение API-контрактов — проверь совместимость с фронтендами

### MUST NOT
- Не коммить секреты и .env файлы
- Не создавай .styl/.sass файлы — используй CSS-in-JS через MUI sx prop
- Не пиши бизнес-логику в компонентах — выноси в hooks/services
- Не меняй package.json версии библиотек без необходимости
