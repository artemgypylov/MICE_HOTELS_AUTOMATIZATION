# Motive Design System

**Дизайн-система для веб-платформы конструктора MICE мероприятий**

---

## 📋 Содержание

1. [Концепция](#концепция)
2. [Цветовая палитра](#цветовая-палитра)
3. [Типографика](#типографика)
4. [Компоненты](#компоненты)
5. [Состояния](#состояния)
6. [Иконки](#иконки)
7. [Темы](#темы)
8. [Принципы использования](#принципы-использования)

---

## Концепция

**Motive** — современная, деловая и интуитивная дизайн-система для профессионалов event-индустрии.

### Основные принципы

- **Минимализм** — чистота и лаконичность
- **Равновесие** — гармоничное распределение элементов
- **Ясная иерархия** — очевидная структура контента
- **Удобная навигация** — интуитивный user flow
- **Уверенность** — профессиональный тон коммуникации

### Целевая аудитория

Event-менеджеры, координаторы мероприятий, B2B-клиенты, которые ценят:
- Скорость работы
- Точность данных
- Профессиональный интерфейс
- Надежность решений

---

## Цветовая палитра

### Primary — Soft Teal (Основной)

Спокойный корпоративный бирюзовый цвет, вызывающий доверие и профессионализм.

```css
--color-primary-50:  #f0fdfa  /* Lightest */
--color-primary-100: #ccfbf1
--color-primary-200: #99f6e4
--color-primary-300: #5eead4
--color-primary-400: #2dd4bf
--color-primary-500: #14b8a6
--color-primary-600: #0d9488  /* Main */
--color-primary-700: #0f766e
--color-primary-800: #115e59
--color-primary-900: #134e4a
--color-primary-950: #042f2e  /* Darkest */
```

**Использование:**
- Primary-600: Основные кнопки, активные состояния
- Primary-50-100: Фоны выделений, hover states
- Primary-700-900: Тексты на светлом фоне

### Neutral — Graphite Gray (Нейтральный)

Графитовая серая шкала для текстов, границ и поверхностей.

```css
--color-neutral-50:  #fafafa  /* Background light */
--color-neutral-100: #f4f4f5
--color-neutral-200: #e4e4e7  /* Borders */
--color-neutral-300: #d4d4d8
--color-neutral-400: #a1a1aa
--color-neutral-500: #71717a  /* Secondary text */
--color-neutral-600: #52525b
--color-neutral-700: #3f3f46
--color-neutral-800: #27272a
--color-neutral-900: #18181b  /* Primary text */
--color-neutral-950: #09090b  /* Background dark */
```

**Использование:**
- Neutral-900: Основной текст
- Neutral-500: Вторичный текст, подписи
- Neutral-200: Границы, разделители
- Neutral-50: Фон страницы

### Accent — Soft Blue (Акцентный)

Мягкий синий для дополнительных акцентов.

```css
--color-accent-50:  #f0f9ff
--color-accent-100: #e0f2fe
--color-accent-200: #bae6fd
--color-accent-300: #7dd3fc
--color-accent-400: #38bdf8
--color-accent-500: #0ea5e9  /* Main */
--color-accent-600: #0284c7
--color-accent-700: #0369a1
--color-accent-800: #075985
--color-accent-900: #0c4a6e
```

**Использование:**
- Информационные badges
- Иконки уведомлений
- Hover states для вторичных элементов

### Semantic Colors (Семантические цвета)

#### Success — Green
```css
--color-success-500: #22c55e  /* Подтверждение */
--color-success-600: #16a34a
```

#### Warning — Amber
```css
--color-warning-500: #f59e0b  /* Предупреждение */
--color-warning-600: #d97706
```

#### Error — Red
```css
--color-error-500: #ef4444  /* Ошибка */
--color-error-600: #dc2626
```

#### Info — Blue
```css
--color-info-500: #3b82f6  /* Информация */
--color-info-600: #2563eb
```

---

## Типографика

### Шрифт

**Inter** — гуманистический sans-serif с отличной читаемостью.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Характеристики:**
- OpenType features: cv02, cv03, cv04, cv11
- Anti-aliasing: субпиксельный
- Поддержка кириллицы

### Иерархия заголовков

| Элемент | Размер | Вес | Line Height | Использование |
|---------|--------|-----|-------------|---------------|
| **H1** | 36px (2.25rem) | 700 Bold | 1.25 | Главные заголовки страниц |
| **H2** | 30px (1.875rem) | 600 Semibold | 1.25 | Разделы страницы |
| **H3** | 24px (1.5rem) | 600 Semibold | 1.25 | Подразделы |
| **H4** | 20px (1.25rem) | 600 Semibold | 1.5 | Карточки, панели |
| **H5** | 18px (1.125rem) | 500 Medium | 1.5 | Мелкие заголовки |
| **H6** | 16px (1rem) | 500 Medium | 1.5 | Подзаголовки |

### Текст

| Тип | Размер | Вес | Line Height | Использование |
|-----|--------|-----|-------------|---------------|
| **Large** | 18px (1.125rem) | 400 Regular | 1.625 | Лиды, intro текст |
| **Body** | 16px (1rem) | 400 Regular | 1.5 | Основной текст |
| **Small** | 14px (0.875rem) | 400 Regular | 1.5 | Вторичный текст |
| **XSmall** | 12px (0.75rem) | 400 Regular | 1.5 | Подписи, метки |

### Веса шрифта

```css
--font-weight-normal: 400    /* Основной текст */
--font-weight-medium: 500    /* Выделение */
--font-weight-semibold: 600  /* Заголовки */
--font-weight-bold: 700      /* Главные заголовки */
```

---

## Компоненты

### Кнопки

#### Primary Button (Основная)
```jsx
<button className="bg-primary-600 text-white px-6 py-2.5 rounded-lg 
                   font-medium hover:bg-primary-700 
                   focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   transition-colors duration-150">
  Create Event
</button>
```

**Использование:** Главное действие на странице (Submit, Create, Confirm)

#### Secondary Button (Вторичная)
```jsx
<button className="bg-neutral-100 text-neutral-900 px-6 py-2.5 rounded-lg 
                   font-medium hover:bg-neutral-200
                   focus:ring-2 focus:ring-neutral-300
                   transition-colors duration-150">
  Cancel
</button>
```

**Использование:** Альтернативное действие, отмена

#### Tertiary Button (Третичная)
```jsx
<button className="text-primary-600 px-4 py-2 rounded-lg font-medium
                   hover:bg-primary-50 transition-colors duration-150">
  Learn More
</button>
```

**Использование:** Менее важные действия, ссылки

#### Ghost Button
```jsx
<button className="text-neutral-600 px-4 py-2 rounded-lg font-medium
                   hover:bg-neutral-100 transition-colors duration-150">
  Skip
</button>
```

### Поля ввода

#### Text Input
```jsx
<input 
  type="text"
  className="w-full px-4 py-2.5 rounded-lg border border-neutral-200
             bg-white text-neutral-900 placeholder:text-neutral-400
             focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
             transition-all duration-150"
  placeholder="Event name"
/>
```

#### With Label
```jsx
<div className="space-y-2">
  <label className="text-sm font-medium text-neutral-700">
    Event Name
  </label>
  <input type="text" className="..." />
</div>
```

#### With Error
```jsx
<div className="space-y-2">
  <input 
    type="text"
    className="... border-error-500 focus:border-error-500 focus:ring-error-500/20"
  />
  <p className="text-sm text-error-600">This field is required</p>
</div>
```

### Checkbox & Radio

#### Checkbox
```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input 
    type="checkbox"
    className="w-5 h-5 rounded border-neutral-300 text-primary-600
               focus:ring-2 focus:ring-primary-500"
  />
  <span className="text-sm text-neutral-700">I agree to terms</span>
</label>
```

### Карточки

#### Standard Card
```jsx
<div className="bg-white rounded-xl border border-neutral-200 
                shadow-sm hover:shadow-lg transition-shadow duration-200 p-6">
  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
    Conference Hall A
  </h3>
  <p className="text-neutral-600">
    Capacity: 200 people
  </p>
</div>
```

#### Interactive Card
```jsx
<div className="bg-white rounded-xl border-2 border-neutral-200 
                hover:border-primary-500 cursor-pointer
                transition-all duration-200 p-6
                hover:-translate-y-0.5 hover:shadow-lg">
  {/* Content */}
</div>
```

### Badges

#### Status Badge
```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                 text-xs font-medium bg-success-100 text-success-700">
  Confirmed
</span>
```

#### Count Badge
```jsx
<span className="inline-flex items-center justify-center 
                 w-5 h-5 rounded-full bg-primary-600 text-white text-xs">
  3
</span>
```

### Модальные окна

```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
  
  {/* Modal */}
  <div className="relative bg-white rounded-2xl shadow-xl 
                  max-w-md w-full p-6 animate-in">
    <h2 className="text-xl font-semibold text-neutral-900 mb-4">
      Confirm Action
    </h2>
    <p className="text-neutral-600 mb-6">
      Are you sure you want to proceed?
    </p>
    <div className="flex gap-3 justify-end">
      <button className="secondary-button">Cancel</button>
      <button className="primary-button">Confirm</button>
    </div>
  </div>
</div>
```

### Таблицы

```jsx
<div className="overflow-x-auto rounded-lg border border-neutral-200">
  <table className="w-full">
    <thead className="bg-neutral-50 border-b border-neutral-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium 
                       text-neutral-500 uppercase tracking-wider">
          Event
        </th>
        <th>Date</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-neutral-100">
      <tr className="hover:bg-neutral-50 transition-colors">
        <td className="px-6 py-4 text-sm text-neutral-900">
          Annual Conference 2024
        </td>
        <td>...</td>
        <td>...</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Состояния

### Интерактивные состояния

#### Hover
```css
/* Subtle elevation */
hover:shadow-lg hover:-translate-y-0.5

/* Background change */
hover:bg-primary-700

/* Border highlight */
hover:border-primary-500
```

#### Focus
```css
/* Ring focus */
focus:outline-none 
focus:ring-2 
focus:ring-primary-500 
focus:ring-offset-2

/* Border focus */
focus:border-primary-500
```

#### Active
```css
/* Pressed state */
active:scale-95 
active:bg-primary-800
```

#### Disabled
```css
/* Visual feedback */
disabled:opacity-50 
disabled:cursor-not-allowed
disabled:hover:bg-neutral-100
```

### Анимации

```css
/* Durations */
transition-fast: 150ms
transition-normal: 200ms
transition-slow: 300ms

/* Easing */
cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Иконки

### Стиль

- **Линейные** (stroke-based)
- Толщина линии: 1.5-2px
- Скругленные концы (rounded)
- Размеры: 16px, 20px, 24px

### Библиотека

**Lucide React** — минималистичные иконки в едином стиле

```jsx
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';

<Calendar className="w-5 h-5 text-neutral-600" />
```

### Основные иконки

| Категория | Иконки |
|-----------|--------|
| **Навигация** | Menu, ChevronRight, ArrowLeft, Home |
| **Действия** | Plus, Edit, Trash, Download, Upload |
| **События** | Calendar, Clock, MapPin, Users |
| **Бизнес** | Building2, Briefcase, TrendingUp, DollarSign |
| **Коммуникация** | Mail, Phone, MessageSquare |
| **Статус** | Check, X, AlertCircle, Info |

---

## Темы

### Светлая тема (по умолчанию)

**Философия:** Чистота, воздушность, профессионализм

```css
:root {
  --background: #fafafa;         /* Светло-серый фон */
  --foreground: #18181b;         /* Темный текст */
  --card: #ffffff;               /* Белые карточки */
  --border: #e4e4e7;            /* Светлые границы */
  --primary: #0d9488;           /* Бирюзовый акцент */
}
```

**Принципы:**
- Высокий контраст текста (WCAG AAA)
- Мягкие тени для глубины
- Нейтральный фон для снижения усталости глаз
- Яркие акценты на белом

**Использование:**
- Дневная работа
- Презентации
- Печать

### Темная тема

**Философия:** Фокус, комфорт, премиальность

```css
.dark {
  --background: #09090b;         /* Почти черный фон */
  --foreground: #fafafa;         /* Светлый текст */
  --card: #18181b;               /* Темные карточки */
  --border: #27272a;            /* Темные границы */
  --primary: #14b8a6;           /* Светлый бирюзовый */
}
```

**Принципы:**
- Контраст 15:1+ для комфорта
- Приглушенные цвета (снижение яркости на 10-15%)
- Использование elevation через subtle borders
- Избегать чистого черного (#000) и белого (#fff)

**Использование:**
- Ночная работа
- Длительные сессии
- OLED дисплеи

### Переключение тем

```jsx
// Theme Toggle Component
const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  return (
    <button onClick={toggleTheme} className="icon-btn">
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
};
```

---

## Принципы использования

### Spacing Scale

Используем систему 4px для консистентности:

```css
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
```

### Elevation (Глубина)

5 уровней shadow для иерархии:

1. **xs** — Subtle borders
2. **sm** — Hoverable cards
3. **md** — Elevated cards
4. **lg** — Modals, dropdowns
5. **xl** — Overlays, notifications

### Responsive Design

```css
/* Mobile First */
sm: 640px   /* Tablet */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* XL desktop */
```

### Accessibility

- **Контраст:** Минимум WCAG AA (4.5:1)
- **Focus states:** Всегда видимы
- **Keyboard navigation:** Полная поддержка
- **Screen readers:** Семантичная разметка
- **Touch targets:** Минимум 44x44px

### Performance

- **Font loading:** `font-display: swap`
- **Animations:** `prefers-reduced-motion`
- **Images:** Lazy loading
- **Critical CSS:** Inline для LCP

---

## Примеры использования

### Event Card
```jsx
<div className="bg-white rounded-xl border border-neutral-200 
                shadow-sm hover:shadow-lg transition-all duration-200 
                hover:-translate-y-0.5 p-6">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold text-neutral-900">
        Annual Tech Summit 2024
      </h3>
      <p className="text-sm text-neutral-500 mt-1">
        Conference · 500 attendees
      </p>
    </div>
    <span className="status-badge status-badge-success">
      Confirmed
    </span>
  </div>
  
  <div className="flex items-center gap-4 text-sm text-neutral-600">
    <div className="flex items-center gap-1.5">
      <Calendar className="w-4 h-4" />
      <span>Jun 15-17, 2024</span>
    </div>
    <div className="flex items-center gap-1.5">
      <MapPin className="w-4 h-4" />
      <span>Grand Hotel</span>
    </div>
  </div>
  
  <div className="flex gap-3 mt-6">
    <button className="flex-1 bg-primary-600 text-white px-4 py-2 
                       rounded-lg font-medium hover:bg-primary-700 
                       transition-colors">
      View Details
    </button>
    <button className="px-4 py-2 rounded-lg text-neutral-600 
                       hover:bg-neutral-100 transition-colors">
      <MoreHorizontal className="w-5 h-5" />
    </button>
  </div>
</div>
```

### Form Example
```jsx
<form className="space-y-6 max-w-md">
  {/* Input Group */}
  <div className="space-y-2">
    <label className="block text-sm font-medium text-neutral-700">
      Event Name *
    </label>
    <input 
      type="text"
      required
      className="w-full px-4 py-2.5 rounded-lg border border-neutral-200
                 bg-white text-neutral-900 placeholder:text-neutral-400
                 focus:border-primary-500 focus:ring-2 
                 focus:ring-primary-500/20 transition-all"
      placeholder="e.g. Annual Sales Conference"
    />
  </div>
  
  {/* Date Range */}
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        Start Date
      </label>
      <input type="date" className="..." />
    </div>
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">
        End Date
      </label>
      <input type="date" className="..." />
    </div>
  </div>
  
  {/* Submit */}
  <button type="submit" 
          className="w-full bg-primary-600 text-white px-6 py-3 
                     rounded-lg font-medium hover:bg-primary-700
                     focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                     transition-colors">
    Create Event
  </button>
</form>
```

---

## Дальнейшее развитие

### Roadmap

- [ ] Storybook документация компонентов
- [ ] Figma UI Kit с автоматической синхронизацией
- [ ] React компонентная библиотека
- [ ] Accessibility audit
- [ ] Performance benchmarks
- [ ] Mobile app guidelines
- [ ] Email templates
- [ ] Presentation kit

---

## Контакты

Для вопросов и предложений по дизайн-системе:
- Репозиторий: [GitHub](https://github.com/artemgypylov/MICE_HOTELS_AUTOMATIZATION)
- Документация: `/DESIGN_SYSTEM.md`

---

**Версия:** 1.0.0  
**Последнее обновление:** 2026-03-30  
**Статус:** Active Development
