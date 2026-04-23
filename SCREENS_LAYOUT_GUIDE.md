# 🎨 Гайд по верстке экранов и дизайн-элементам

**Для разработчика фронтенда**

---

## 📑 Содержание

1. [Основные компоненты UI](#основные-компоненты-ui)
2. [Сетка и отступы](#сетка-и-отступы)
3. [Типографика](#типографика)
4. [Цветовая палитра](#цветовая-палитра)
5. [Состояния компонентов](#состояния-компонентов)
6. [WEB экраны](#web-экраны)
7. [MOBILE экраны](#mobile-экраны)

---

## 🧩 Основные компоненты UI

### Button (Кнопка)

**Файл:** `frontend/src/components/ui/button.tsx`

#### Типы кнопок

```tsx
// Primary Button - основная действие
<Button variant="default" size="md">
  Основная кнопка
</Button>

// Secondary Button - вторичное действие
<Button variant="outline" size="md">
  Вторичная кнопка
</Button>

// Ghost Button - минимальная кнопка
<Button variant="ghost" size="md">
  Призрачная кнопка
</Button>

// Destructive Button - удаление/опасное действие
<Button variant="destructive" size="md">
  Опасное действие
</Button>
```

**Размеры:**
- `sm`: 32px (высота) - для компактных интерфейсов
- `md`: 40px (высота) - стандартный размер
- `lg`: 44px (высота) - для основных CTA

**Состояния:**
- Default (активное)
- Hover (наведение)
- Active (нажато)
- Disabled (неактивное)

---

### Card (Карточка)

**Файл:** `frontend/src/components/ui/card.tsx`

```tsx
<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание</CardDescription>
  </CardHeader>
  <CardContent>
    Содержимое
  </CardContent>
  <CardFooter>
    Подписей/кнопки
  </CardFooter>
</Card>
```

**Свойства:**
- Радиус: 8px (border-radius)
- Тень: 0 1px 3px rgba(0,0,0,0.1)
- Фон: white / neutral-50 (в тёмной теме)
- Padding: 16px (стандартный)

---

### Input (Поле ввода)

**Файл:** `frontend/src/components/ui/input.tsx`

```tsx
<Input
  type="text"
  placeholder="Введите текст"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Свойства:**
- Высота: 40px
- Raduis: 6px
- Border: 1px solid neutral-200
- Padding: 8px 12px
- Font size: 14px (base)

**Состояния:**
- Default (пусто)
- Focused (фокус): border-color primary-600, shadow
- Filled (заполнено)
- Error (ошибка): border-color red-500
- Disabled (отключено): opacity 0.5

---

### Select (Выпадающий список)

**Файл:** `frontend/src/components/ui/select.tsx`

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Выберите опцию" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Опция 1</SelectItem>
    <SelectItem value="opt2">Опция 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox (Чекбокс)

**Файл:** `frontend/src/components/ui/checkbox.tsx`

```tsx
<Checkbox
  id="terms"
  checked={checked}
  onCheckedChange={setChecked}
/>
<label htmlFor="terms">Я согласен</label>
```

**Размер:** 20x20px
**Цвет активного:** primary-600
**Радиус:** 4px

---

### Badge (Бейдж)

**Файл:** `frontend/src/components/ui/badge.tsx`

```tsx
<Badge variant="default">Активен</Badge>
<Badge variant="secondary">Ожидание</Badge>
<Badge variant="outline">Черновик</Badge>
<Badge variant="destructive">Отклонено</Badge>
```

---

### Avatar (Аватар)

**Файл:** `frontend/src/components/ui/avatar.tsx`

```tsx
<Avatar>
  <AvatarImage src="https://..." alt="@username" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

**Размеры:** 32px, 40px, 48px, 56px
**Радиус:** 50% (полностью круглый)

---

### Dialog (Модальное окно)

**Файл:** `frontend/src/components/ui/dialog.tsx`

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Открыть</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заголовок</DialogTitle>
      <DialogDescription>Описание</DialogDescription>
    </DialogHeader>
    {/* Содержимое */}
    <DialogFooter>
      <Button>Отмена</Button>
      <Button variant="default">Подтвердить</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Progress (Прогресс-бар)

**Файл:** `frontend/src/components/ui/progress.tsx`

```tsx
<Progress value={65} /> {/* 65% */}
```

---

## 📐 Сетка и отступы

### Система отступов (Spacing Scale)

```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
```

### Отступы контейнеров

```
- Page padding: 16px (мобиль) / 24px (планшет) / 32px (десктоп)
- Section padding: 24px
- Card padding: 16px
- Group gap: 16px
```

### Сетка колонок

- **Мобиль:** 1 колонна, 16px отступы по сторонам
- **Планшет:** 2-3 колонны, 24px отступы
- **Десктоп:** 4-6 колонн, 32px отступы максимум

---

## 📝 Типографика

### Шкала размеров шрифта

```
Base size: 16px

xs:  12px  (0.75rem)   - подписи, hints
sm:  14px  (0.875rem)  - вторичный текст
md:  16px  (1rem)      - основной текст
lg:  18px  (1.125rem)  - подзаголовки
xl:  20px  (1.25rem)   - заголовки уровня 3
2xl: 24px  (1.5rem)    - заголовки уровня 2
3xl: 30px  (1.875rem)  - заголовки уровня 1
4xl: 36px  (2.25rem)   - главный заголовок
```

### Шрифты

```
Font Family (primary): -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif

Weights:
- Regular: 400
- Medium:  500
- Semibold: 600
- Bold:    700
```

### Применение

**H1 (Главный заголовок)**
```tsx
font-size: 36px
font-weight: 700
line-height: 1.2
color: neutral-950
margin-bottom: 24px
```

**H2 (Заголовок раздела)**
```tsx
font-size: 24px
font-weight: 600
line-height: 1.3
color: neutral-900
margin-bottom: 16px
```

**H3 (Подзаголовок)**
```tsx
font-size: 18px
font-weight: 600
line-height: 1.4
color: neutral-800
```

**Body (Основной текст)**
```tsx
font-size: 16px
font-weight: 400
line-height: 1.5
color: neutral-700
```

**Caption (Подпись)**
```tsx
font-size: 12px
font-weight: 400
line-height: 1.4
color: neutral-500
```

---

## 🎨 Цветовая палитра

### Primary (Soft Teal)

```
Главный цвет системы

primary-50:   #f0fdfa   - очень светлый (фон выделения)
primary-100:  #ccfbf1   - светлый фон
primary-200:  #99f6e4   - фон hover
primary-300:  #5eead4   - светлый акцент
primary-400:  #2dd4bf   - акцент
primary-500:  #14b8a6   - полутон
primary-600:  #0d9488   - ОСНОВНОЙ (кнопки, ссылки)
primary-700:  #0f766e   - темный акцент
primary-800:  #115e59   - текст на светлом
primary-900:  #134e4a   - текст на светлом
primary-950:  #042f2e   - самый тёмный
```

**Использование:**
- Активные кнопки: primary-600
- Ссылки: primary-600
- Фон активного таба: primary-50
- Фон выделения: primary-100
- Ховер фон: primary-50

### Neutral (Graphite Gray)

```
Нейтральная серая шкала

neutral-50:   #fafafa   - фон страницы (светлая)
neutral-100:  #f4f4f5   - фон карточки, инпута
neutral-200:  #e4e4e7   - граница, разделитель
neutral-300:  #d4d4d8   - отключенный элемент
neutral-400:  #a1a1aa   - плейсхолдер
neutral-500:  #71717a   - вторичный текст
neutral-600:  #52525b   - третичный текст
neutral-700:  #3f3f46   - основной текст
neutral-800:  #27272a   - важный текст
neutral-900:  #18181b   - заголовки
neutral-950:  #09090b   - фон ночи (тёмная тема)
```

### Accent (Soft Blue)

```
Дополнительный акцент

accent-50:    #f0f9ff   - фон
accent-100:   #e0f2fe   - выделение
accent-200:   #bae6fd   - border
accent-300:   #7dd3fc   - основной
accent-400:   #38bdf8   - яркий
accent-500:   #0ea5e9   - интенсивный
accent-600:   #0284c7   - тёмный
```

### Семантические цвета

```
Success (Зелёный): #16a34a
Warning (Жёлтый): #ea8c00
Danger (Красный): #dc2626
Info (Голубой):   #0284c7
```

---

## 🔄 Состояния компонентов

### Button States

```
1. Default (Normal)
   - background: primary-600
   - color: white
   - cursor: pointer

2. Hover
   - background: primary-700
   - box-shadow: 0 4px 6px rgba(0,0,0,0.1)
   - transition: 150ms

3. Active (Нажато)
   - background: primary-800
   - transform: scale(0.98)

4. Focus (Клавиатура)
   - outline: 2px solid primary-600
   - outline-offset: 2px

5. Disabled
   - background: neutral-200
   - color: neutral-400
   - cursor: not-allowed
   - opacity: 0.5
```

### Input States

```
1. Default (Пусто)
   - border-color: neutral-200
   - background: white

2. Focused
   - border-color: primary-600
   - box-shadow: 0 0 0 3px primary-100
   - outline: none

3. Filled
   - border-color: neutral-300

4. Error
   - border-color: #dc2626
   - color: #991b1b

5. Disabled
   - background: neutral-100
   - color: neutral-400
   - cursor: not-allowed
```

### Card States

```
1. Default
   - background: white
   - border: 1px solid neutral-200
   - box-shadow: 0 1px 2px rgba(0,0,0,0.05)

2. Hover
   - box-shadow: 0 4px 6px rgba(0,0,0,0.1)
   - border-color: neutral-300

3. Active/Selected
   - border-color: primary-600
   - box-shadow: 0 0 0 2px primary-100
```

---

# 🖥️ WEB Экраны

## 1. Login Page (Страница входа)

**Файл:** `frontend/src/pages/LoginPage.tsx`

### Макет

```
┌─────────────────────────────────────────┐
│  MICE Hotels - Конструктор мероприятий  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    Вход в систему                 │  │
│  │    ─────────────────────────────   │  │
│  │                                   │  │
│  │  E-mail:                          │  │
│  │  [________________________]        │  │
│  │                                   │  │
│  │  Пароль:                          │  │
│  │  [________________________]        │  │
│  │                                   │  │
│  │  [ ] Запомнить меня               │  │
│  │                                   │  │
│  │  [Вход в систему]                 │  │
│  │                                   │  │
│  │  Нет аккаунта? Зарегистрируйтесь! │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Структура HTML

```tsx
<div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-center text-2xl">
        MICE Hotels
      </CardTitle>
      <CardDescription className="text-center">
        Конструктор мероприятий
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Form controls */}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember" checked={remember} />
        <Label htmlFor="remember" className="text-sm text-neutral-600">
          Запомнить меня
        </Label>
      </div>
    </CardContent>
    <CardFooter className="flex flex-col gap-3">
      <Button
        onClick={handleLogin}
        className="w-full"
        size="lg"
      >
        Вход в систему
      </Button>
      <p className="text-sm text-center text-neutral-600">
        Нет аккаунта?{' '}
        <Button
          variant="ghost"
          className="text-primary-600 p-0 h-auto"
        >
          Зарегистрируйтесь
        </Button>
      </p>
    </CardFooter>
  </Card>
</div>
```

### Отступы

- Page padding: 16px
- Card max-width: 448px (28rem)
- CardContent gap: 16px
- CardFooter gap: 12px

---

## 2. Register Page (Страница регистрации)

**Файл:** `frontend/src/pages/RegisterPage.tsx`

### Макет

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌───────────────────────────────────┐  │
│  │    Создание аккаунта              │  │
│  │    ─────────────────────────────   │  │
│  │                                   │  │
│  │  Имя:                             │  │
│  │  [________________________]        │  │
│  │                                   │  │
│  │  Фамилия:                         │  │
│  │  [________________________]        │  │
│  │                                   │  │
│  │  E-mail:                          │  │
│  │  [________________________]        │  │
│  │                                   │  │
│  │  Пароль:                          │  │
│  │  [________________________]        │  │
│  │  Требования: 8 символов           │  │
│  │                                   │  │
│  │  [Зарегистрироваться]              │  │
│  │                                   │  │
│  │  Уже есть аккаунт? Войти!         │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Особенности

- Валидация полей в реальном времени
- Indicator пароля (strength)
- Link на страницу входа

---

## 3. Home Page (Главное меню)

**Файл:** `frontend/src/pages/HomePage.tsx`

### Макет

```
┌──────────────────────────────────────────────────────┐
│ [☰] MICE Hotels          [Search]  [👤] [⚙️] [🔔]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Добро пожаловать, Иван!                            │
│  ────────────────────────                           │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ 📊 Активные  │  │ 📅 Планов    │  │ 💰 Сумма  │ │
│  │ мероприятия  │  │ на месяц      │  │ доходов   │ │
│  │              │  │               │  │           │ │
│  │ 12           │  │ 5             │  │ 125k ₽    │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  Последние мероприятия                              │
│  ─────────────────────────                          │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ корпоратив "Summer Party"                    │  │
│  │ 15 июня                  ▶ Подробнее         │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ свадьба Петров & Сидорова                    │  │
│  │ 22 июня                  ▶ Подробнее         │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  [+ Новое мероприятие]                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Структура

```tsx
<Layout>
  {/* Header */}
  <header className="flex items-center justify-between p-4 border-b border-neutral-200">
    <h1 className="text-2xl font-bold">MICE Hotels</h1>
    <div className="flex items-center gap-3">
      <SearchInput />
      <Avatar />
      <SettingsButton />
      <NotificationBell />
    </div>
  </header>

  {/* Welcome Section */}
  <section className="p-6 bg-gradient-to-r from-primary-50 to-accent-50">
    <h2 className="text-3xl font-bold mb-4">
      Добро пожаловать, {userName}!
    </h2>

    {/* Stats Cards */}
    <div className="grid grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-neutral-600 mb-2">
            📊 Активные мероприятия
          </div>
          <div className="text-3xl font-bold text-primary-600">12</div>
        </CardContent>
      </Card>
      {/* More stat cards */}
    </div>
  </section>

  {/* Recent Events */}
  <section className="p-6">
    <h3 className="text-xl font-semibold mb-4">
      Последние мероприятия
    </h3>
    <div className="space-y-3">
      {events.map(event => (
        <Card key={event.id} className="hover:shadow-md cursor-pointer">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{event.name}</h4>
              <p className="text-sm text-neutral-500">{event.date}</p>
            </div>
            <Button variant="ghost">▶ Подробнее</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>

  {/* CTA Button */}
  <section className="p-6 flex justify-center">
    <Button size="lg" className="gap-2">
      + Новое мероприятие
    </Button>
  </section>
</Layout>
```

---

## 4. Event Dashboard Page (Панель управления мероприятием)

**Файл:** `frontend/src/pages/EventDashboardPage.tsx`

### Макет

```
┌──────────────────────────────────────────────────────┐
│ [< Назад]  Корпоратив "Tech Summit 2024"   [⋯]     │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ [📋] [💰] [👥] [🏨] [🍽️] [📞]          │  │
│  │ Общее  Бюджет  Гости Отели Кейтринг Услуги  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ 📅 27 апреля │  │ 👥 150 чел   │  │ 💰 50k ₽  │ │
│  │ 14:00        │  │ 5 дней       │  │ Бюджет    │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  Составляющие мероприятия:                         │
│  ─────────────────────────────────                  │
│                                                      │
│  Отели (3)                        [Изменить]      │
│  ┌────────────────────────────────────────────┐   │
│  │ ✓ Marriott (20 комнат, $4200)              │   │
│  │ ✓ Hilton (15 комнат, $3150)                │   │
│  │ ✓ Holiday Inn (10 комнат, $1800)           │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  Кейтринг (2 вариантов)            [Изменить]     │
│  ┌────────────────────────────────────────────┐   │
│  │ ✓ Breakfast: 150 × $20 = $3000              │   │
│  │ ✓ Gala Dinner: 150 × $80 = $12000           │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  [📥 Экспорт] [🔗 Поделиться] [✓ Завершить ]      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Компоненты

- Tabs для быстрого переключения между разделами
- Summary cards с ключевой информацией
- List компоненты для отелей, услуг, кейтринга
- Action buttons

---

## 5. Event Detail Page (Подробная информация)

**Файл:** `frontend/src/pages/EventDetailPage.tsx`

### Структура

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Main content - 2/3 */}
  <div className="lg:col-span-2 space-y-6">
    <EditableEventHeader />
    <EventGeneralInfo />
    <EventLocations />
    <EventGuests />
  </div>

  {/* Sidebar - 1/3 */}
  <aside className="lg:col-span-1">
    <EventSummaryCard />
    <EventTimeline />
    <QuickActions />
  </aside>
</div>
```

---

## 6. Admin Dashboard Page

**Файл:** `frontend/src/pages/AdminDashboardPage.tsx`

### Макет

```
┌──────────────────────────────────────────────────────┐
│ [≡] Admin Panel           [👤] [⚙️]                │
├──┬───────────────────────────────────────────────────┤
│  │                                                   │
│ [≡]  • Общее                                         │
│  │  • Бронирования                                  │
│  │  • Расходы                                       │
│  │  • Отели                                         │
│  │  • Поставщики                                    │
│  │  • Пользователи                                  │
│  │  • Отчёты                                        │
│  │                                                   │
├──┴───────────────────────────────────────────────────┤
│                                                      │
│  Статистика системы                                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ 📊           │  │ 📈           │  │ 👥        │ │
│  │ Всего пользо-│  │ Доход за     │  │ Активные  │ │
│  │ вателей: 342 │  │ месяц: 2.5M  │  │ заказы:67 │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  Свежие заказы                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ #2401 | Петров И.И.    | $15k  | ✓ Активен  │  │
│  │ #2402 | Сидоров А.П.   | $8.5k | ⏳ Ожидание │  │
│  │ #2403 | Иванов В.С.    | $22k  | ✓ Активен  │  │
│  │ #2404 | Козлов М.Н.    | $5.2k | ⏸ Пауза    │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Боковая панель

```tsx
<aside className="w-64 bg-neutral-900 text-white p-4 fixed left-0 top-0 h-screen">
  <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 bg-primary-600 rounded-lg"></div>
    <h1 className="font-bold">Admin Panel</h1>
  </div>

  <nav className="space-y-2">
    <NavItem icon="📊" label="Общее" active />
    <NavItem icon="📋" label="Бронирования" />
    <NavItem icon="💰" label="Расходы" />
    <NavItem icon="🏨" label="Отели" />
    <NavItem icon="👥" label="Поставщики" />
    <NavItem icon="👤" label="Пользователи" />
    <NavItem icon="📈" label="Отчёты" />
  </nav>
</aside>
```

---

## 7. Admin Bookings Page (Управление бронированиями)

**Файл:** `frontend/src/pages/AdminBookingsPage.tsx`

### Макет

```
┌──────────────────────────────────────────────────────┐
│ Управление бронированиями                           │
│                                                      │
│ [Фильтр: ▼] [Сортировка: ▼] [Экспорт] [🔍 Поиск]  │
├──────────────────────────────────────────────────────┤
│ ID    │ Клиент      │ Дата   │ Сумма │ Статус      │
├──────────────────────────────────────────────────────┤
│ 2401  │ Петров И.И. │ 27.04 │ $15k │ ✓ Активна   │
│ 2402  │ Сидоров А.П│ 28.04 │ $8.5k│ ⏳ Ожидает   │
│ 2403  │ Иванов В.С. │ 30.04 │ $22k │ ✓ Активна   │
│ 2404  │ Козлов М.Н.│ 01.05 │ $5.2k│ ⏸ На паузе  │
│        (показано 4 из 127)                          │
├──────────────────────────────────────────────────────┤
│ [< Назад]  1  2  3  4  5  [Далее >]                │
└──────────────────────────────────────────────────────┘
```

### Таблица

```tsx
<Table>
  <TableHeader className="bg-neutral-100 border-b border-neutral-200">
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Клиент</TableHead>
      <TableHead>Дата</TableHead>
      <TableHead>Сумма</TableHead>
      <TableHead>Статус</TableHead>
      <TableHead>Действия</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {bookings.map(booking => (
      <TableRow key={booking.id} className="border-b hover:bg-neutral-50">
        <TableCell className="font-mono">{booking.id}</TableCell>
        <TableCell>{booking.clientName}</TableCell>
        <TableCell>{booking.date}</TableCell>
        <TableCell className="font-semibold">{booking.amount}</TableCell>
        <TableCell>
          <Badge variant={getStatusVariant(booking.status)}>
            {booking.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="sm">Редактировать</Button>
          <Button variant="ghost" size="sm">Удалить</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 8. Wizard Page (Пошаговый конструктор)

**Файл:** `frontend/src/pages/WizardPage.tsx`

### Макет

```
┌──────────────────────────────────────────────────────┐
│ Создание мероприятия - Шаг 2/5                       │
│                                                      │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│ │ ✓ Общее  │ │ Сейчас → │ │ Гости    │ │ Итого  │ │
│ └──────────┘ └──────────┘ └──────────┘ └─────────┘ │
│                                                      │
│  Бюджет и сроки                                     │
│  ────────────────                                    │
│                                                      │
│  Общий бюджет:                                       │
│  [_______________] ₽                                 │
│                                                      │
│  Размер группы:                                      │
│  [_______________] человек                          │
│                                                      │
│  Дата начала:                                        │
│  [2024-04-27 ▼]                                     │
│                                                      │
│  Количество дней:                                    │
│  [_____] [< >]                                       │
│                                                      │
│  ────────────────────────────────────────────       │
│  [Назад]                          [Далее]            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Progress Indicator

```tsx
<div className="flex items-center justify-between mb-8">
  {steps.map((step, idx) => (
    <div key={step.id} className="flex items-center flex-1">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        text-white font-semibold
        ${
          idx < currentStep ? 'bg-primary-600' :
          idx === currentStep ? 'bg-primary-600 ring-2 ring-primary-200' :
          'bg-neutral-200 text-neutral-700'
        }
      `}>
        {idx < currentStep ? '✓' : idx + 1}
      </div>
      {idx < steps.length - 1 && (
        <div className={`
          flex-1 h-1 mx-2
          ${idx < currentStep ? 'bg-primary-600' : 'bg-neutral-200'}
        `} />
      )}
    </div>
  ))}
</div>
```

### Navigation

```tsx
<div className="flex justify-between pt-6 border-t border-neutral-200">
  <Button
    variant="outline"
    onClick={handlePrevious}
    disabled={currentStep === 0}
  >
    ← Назад
  </Button>
  <Button
    onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
  >
    {currentStep === steps.length - 1 ? 'Завершить' : 'Далее →'}
  </Button>
</div>
```

---

# 📱 MOBILE Экраны

## 1. Login Screen (Мобиль)

**Файл:** `mobile/src/screens/LoginScreen.tsx`

### Макет

```
┌─────────────────────┐
│                     │
│  MICE Hotels        │
│                     │
│  Конструктор        │
│  мероприятий        │
│                     │
│  ┌───────────────┐  │
│  │ Email         │  │
│  │ [___________] │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Пароль        │  │
│  │ [___________] │  │
│  └───────────────┘  │
│                     │
│  [Вход]             │
│                     │
│  Регистрация →      │
│                     │
└─────────────────────┘
```

### Реактивный дизайн

```tsx
<SafeAreaView className="flex-1 bg-neutral-50">
  <ScrollView
    contentContainerStyle={{
      flexGrow: 1,
      justifyContent: 'center',
      padding: 16
    }}
  >
    {/* Logo */}
    <View className="items-center mb-8">
      <Text className="text-3xl font-bold text-primary-600 mb-2">
        MICE Hotels
      </Text>
      <Text className="text-gray-600">
        Конструктор мероприятий
      </Text>
    </View>

    {/* Form */}
    <View className="gap-4">
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </View>

    {/* Button */}
    <Button
      onPress={handleLogin}
      className="mt-6"
      size="lg"
    >
      Вход
    </Button>

    {/* Navigation */}
    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
      <Text className="text-center text-primary-600 mt-4">
        Регистрация →
      </Text>
    </TouchableOpacity>
  </ScrollView>
</SafeAreaView>
```

---

## 2. Home Screen (Мобиль)

**Файл:** `mobile/src/screens/HomeScreen.tsx`

### Макет

```
┌─────────────────────┐
│ [☰] MICE [🔔]      │
├─────────────────────┤
│                     │
│ Добро пожаловать!   │
│                     │
│ ┌─────────────────┐ │
│ │ 📊 12 активных  │ │
│ │ событий         │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 💰 Доход: 125k  │ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ Последние события   │
│                     │
│ ┌─────────────────┐ │
│ │ Корпоратив      │ │
│ │ 15 июня         │ │
│ │ ▶               │ │
│ └─────────────────┘ │
│                     │
│ [+ Новое событие]   │
│                     │
└─────────────────────┘
```

---

## 3. Hotels Screen (Мобиль)

**Файл:** `mobile/src/screens/HotelsScreen.tsx`

### Макет

```
┌─────────────────────┐
│ [< Отели            │
├─────────────────────┤
│                     │
│ [🔍 Поиск...]      │
│                     │
│ ┌─────────────────┐ │
│ │ ⭐⭐⭐⭐⭐       │ │
│ │ Marriott Moscow │ │
│ │ 120 ₽ - 280 ₽ │ │
│ │ ▶               │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ⭐⭐⭐⭐        │ │
│ │ Hilton Garden   │ │
│ │ 85 ₽ - 180 ₽   │ │
│ │ ▶               │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ ⭐⭐⭐          │ │
│ │ Holiday Inn     │ │
│ │ 60 ₽ - 140 ₽   │ │
│ │ ▶               │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

---

## 4. Hotel Detail Screen (Мобиль)

**Файл:** `mobile/src/screens/HotelDetailScreen.tsx`

### Макет

```
┌─────────────────────┐
│ [< Marriott Moscow  │ [♡]
├─────────────────────┤
│                     │
│ [Фото 1/6]          │
│                     │
│ Marriott Moscow     │
│ ⭐⭐⭐⭐⭐ (842)      │
│ М. Маяковская       │
│ 0.7 км от метро     │
│                     │
│ ┌─────────────────┐ │
│ │ От 120 ₽        │ │
│ │ 5-звездочный    │ │
│ │ 340 комнат      │ │
│ └─────────────────┘ │
│                     │
│ Описание            │
│ ─────────────────── │
│ Люксовый отель...   │
│                     │
│ Удобства            │
│ ─────────────────── │
│ ✓ Wi-Fi             │
│ ✓ Бассейн           │
│ ✓ Ресторан          │
│ ✓ Фитнес            │
│                     │
│ [Забронировать]     │
│                     │
└─────────────────────┘
```

---

## 5. Bookings Screen (Мобиль)

**Файл:** `mobile/src/screens/MyBookingsScreen.tsx`

### Макет

```
┌─────────────────────┐
│ Мои бронирования    │
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │ Активные: 2     │ │
│ │ Завершённые: 5  │ │
│ │ Отменённые: 1   │ │
│ └─────────────────┘ │
│                     │
│ АКТИВНЫЕ            │
│ ─────────────────── │
│                     │
│ ┌─────────────────┐ │
│ │ #2401           │ │
│ │ Гала-ужин       │ │
│ │ 27 апреля       │ │
│ │ $15,000         │ │
│ │ ✓ Подтверждено  │ │
│ │ ▶               │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ #2405           │ │
│ │ Конференция     │ │
│ │ 10 мая          │ │
│ │ $8,500          │ │
│ │ ⏳ Ожидание     │ │
│ │ ▶               │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

---

## 6. Register Screen (Мобиль)

**Файл:** `mobile/src/screens/RegisterScreen.tsx`

### Макет

```
┌─────────────────────┐
│ Регистрация         │
│                     │
│ ┌─────────────────┐ │
│ │ Имя             │ │
│ │ [___________]   │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Email           │ │
│ │ [___________]   │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Пароль          │ │
│ │ [___________]   │ │
│ │ 8+ символов     │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Повтор пароля   │ │
│ │ [___________]   │ │
│ └─────────────────┘ │
│                     │
│ [Зарегистрироваться]│
│                     │
│ Уже есть аккаунт?   │
│ Войти →             │
│                     │
└─────────────────────┘
```

---

# 🏗️ Layout компоненты

## Layout (WEB)

**Файл:** `frontend/src/components/layout/Layout.tsx`

### Структура

```tsx
<div className="flex h-screen bg-neutral-50">
  {/* Sidebar */}
  <Sidebar />

  {/* Main content */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header */}
    <Header />

    {/* Page content */}
    <main className="flex-1 overflow-auto p-6">
      {children}
    </main>
  </div>
</div>
```

### Responsive

```
Mobile (< 768px):
- No sidebar (hamburger menu)
- Header compact
- Full width content

Tablet (768px - 1024px):
- Sidebar toggle
- Adjusted padding
- 2-column layouts

Desktop (> 1024px):
- Fixed sidebar 256px
- Full header
- 3+ column layouts
```

---

## Admin Layout

**Файл:** `frontend/src/components/admin/AdminLayout.tsx`

### Структура

```tsx
<div className="flex h-screen bg-neutral-950">
  {/* Dark sidebar */}
  <aside className="w-64 bg-neutral-900 text-white border-r border-neutral-800">
    {/* Navigation items */}
  </aside>

  {/* Main */}
  <div className="flex-1 flex flex-col">
    {/* Admin header */}
    <header className="bg-white border-b border-neutral-200">
      {/* Admin top bar */}
    </header>

    {/* Content */}
    <main className="flex-1 overflow-auto bg-neutral-50">
      {children}
    </main>
  </div>
</div>
```

---

# 📋 Чек-лист для разработчика

## WEB компоненты
- [ ] Button с всеми вариантами (default, outline, ghost, destructive)
- [ ] Input с estados (default, focused, filled, error, disabled)
- [ ] Select dropdown без нативного браузерного
- [ ] Card компонент
- [ ] Badge компонент для статусов
- [ ] Avatar компонент
- [ ] Dialog/Modal компонент
- [ ] Progress bar компонент
- [ ] Checkbox компонент
- [ ] Table компонент

## Страницы WEB
- [ ] Login Page с валидацией
- [ ] Register Page с валидацией
- [ ] Home Page со статистикой
- [ ] Event Dashboard с табами
- [ ] Event Detail Page
- [ ] Admin Dashboard
- [ ] Admin Bookings с таблицей и пагинацией
- [ ] Wizard Page с progress

## Мобильные экраны
- [ ] Login Screen (React Native)
- [ ] Home Screen
- [ ] Hotels Screen со списком
- [ ] Hotel Detail Screen с картинками
- [ ] Bookings Screen
- [ ] Register Screen

## Стили и темы
- [ ] CSS переменные для цветов (primary, neutral, accent)
- [ ] Темная тема (dark mode)
- [ ] Адаптивные отступы
- [ ] Типографика (размеры шрифтов)
- [ ] Состояния компонентов (hover, active, disabled)
- [ ] Transition/Animation (150ms по умолчанию)

## Утилиты
- [ ] Responsive grid система
- [ ] Spacing utilities
- [ ] Shadow utilities
- [ ] Border radius utilities
- [ ] Text truncate utilities

---

# 🔗 Полезные ссылки

## Используемые библиотеки
- **UI Components**: shadcn/ui
- **Стили**: Tailwind CSS
- **Иконки**: Lucide React (для WEB) / React Native Icons
- **Формы**: React Hook Form
- **Навигация (Mobile)**: React Navigation
- **Анимации**: Framer Motion (Web) / React Native Animated

## Размеры экранов (Breakpoints)

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

## Документация

- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/
- React Native Docs: https://reactnative.dev/

---

**Создано для фронтенд-разработки проекта MICE Hotels**

Версия: 1.0
Дата обновления: 2026-04-07
