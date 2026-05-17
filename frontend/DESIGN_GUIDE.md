# Motive Design System — Quick Guide

## 🎨 Цветовая палитра

### Primary (Teal) — Основной цвет
```
primary-600  #0d9488  Кнопки, ссылки
primary-50   #f0fdfa  Фоны
```

### Neutral (Gray) — Тексты и фоны
```
neutral-900  #18181b  Основной текст
neutral-600  #52525b  Вторичный текст
neutral-200  #e4e4e7  Borders
neutral-50   #fafafa  Page background
```

### Accent (Blue) — Дополнительный
```
accent-500   #0ea5e9  Info badges
```

### Semantic
```
success-500  #22c55e  ✓ Успех
warning-500  #f59e0b  ⚠ Предупреждение
error-500    #ef4444  ✗ Ошибка
info-500     #3b82f6  ℹ Информация
```

## 🔤 Типографика

**Шрифт:** Inter (400, 500, 600, 700)

**Заголовки:**
```jsx
<h1 className="text-4xl font-bold">         // 36px
<h2 className="text-3xl font-semibold">      // 30px
<h3 className="text-2xl font-semibold">      // 24px
<h4 className="text-xl font-semibold">       // 20px
```

**Текст:**
```jsx
<p className="text-base">                    // 16px
<span className="text-sm text-neutral-600">  // 14px
<small className="text-xs text-neutral-500"> // 12px
```

## 🔲 Компоненты

### Кнопки
```jsx
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="gradient">Gradient</Button>
```

### Поля ввода
```jsx
<Input placeholder="Event name" />
<Input type="email" />
<Input error={errors.name?.message} />
```

### Карточки
```jsx
<Card className="p-6">
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Badges
```jsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
```

## 🎭 Состояния

```jsx
// Hover
hover:bg-primary-700
hover:shadow-lg

// Focus
focus:ring-2 focus:ring-primary-500

// Disabled
disabled:opacity-50 disabled:cursor-not-allowed
```

## 📏 Spacing

Используем шкалу 4px:
```
p-2  = 8px
p-4  = 16px
p-6  = 24px
p-8  = 32px
p-12 = 48px
```

## 🌓 Темы

### Переключение темы
```jsx
// Добавить класс .dark к <html>
document.documentElement.classList.toggle('dark');
```

### Темные варианты
```jsx
<div className="bg-white dark:bg-neutral-900">
  <p className="text-neutral-900 dark:text-neutral-50">
    Text adapts to theme
  </p>
</div>
```

## ✨ Утилиты

```jsx
// Градиентный текст
<h1 className="gradient-text">Motive</h1>

// Стеклянный эффект
<div className="glass">...</div>

// Hover карточки
<div className="card-hover">...</div>

// Анимация появления
<div className="animate-in">...</div>
```

## 🎯 Примеры

### Event Card
```jsx
<Card className="p-6 hover:shadow-lg transition-shadow">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">Annual Conference</h3>
    <Badge className="bg-success-100 text-success-700">Confirmed</Badge>
  </div>
  <div className="flex items-center gap-4 text-sm text-neutral-600">
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      <span>Jun 15-17, 2024</span>
    </div>
  </div>
</Card>
```

### Form
```jsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label>Event Name</Label>
    <Input placeholder="e.g. Annual Sales Meeting" />
  </div>
  <Button type="submit" className="w-full">
    Create Event
  </Button>
</form>
```

## 📱 Responsive

```jsx
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-6
">
  {/* Responsive grid */}
</div>
```

**Breakpoints:**
- `sm`: 640px (tablet)
- `md`: 768px (tablet landscape)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

## 🔍 Иконки

Используем **Lucide React**:

```jsx
import { Calendar, Users, MapPin, Building2 } from 'lucide-react';

<Calendar className="w-5 h-5 text-neutral-600" />
```

**Размеры:**
- `w-4 h-4`: 16px (мелкие)
- `w-5 h-5`: 20px (стандарт)
- `w-6 h-6`: 24px (крупные)

## 🚀 Best Practices

1. **Используй semantic colors** для статусов
2. **Группируй spacing** в `space-y-*` для вертикальных отступов
3. **Минимизируй custom CSS** — используй Tailwind utilities
4. **Тестируй в темной теме** — всегда добавляй `dark:` варианты
5. **Accessibility первостепенна** — используй semantic HTML

## 📚 Ресурсы

- Полная документация: `/DESIGN_SYSTEM.md`
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev
- Inter Font: https://rsms.me/inter/
