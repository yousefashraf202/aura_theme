# Aura Theme

**Modern SaaS theme for Frappe and ERPNext V15**

By [Yousef Ashraf](https://github.com/yousefashraf202)

---

## Features

- 🎨 **7 color presets** — Blue, Green, Red, Orange, Yellow, Pink, Violet
- 🖌️ **Custom color picker** — hex input, RGB sliders, and eyedropper (Chrome 95+)
- 🌙 **Dark / Light mode** — one-click toggle in navbar
- 📐 **Full Width mode** — collapse sidebar and expand content area
- ⚡ **Quick Theme Customizer** — navbar panel for instant changes
- 🌐 **EN / AR language switcher** — with RTL support
- 🔍 **Enhanced search bar** — keyboard shortcut Ctrl+K
- 🖼️ **Login page customization** — logo, background photo, slideshow
- 🔤 **50+ Google Font options**
- ✅ **Frappe/ERPNext 15** compatible

---

## Installation

```bash
cd ~/frappe-bench
bench get-app https://github.com/yousefashraf202/aura_theme
bench --site your-site.localhost install-app aura_theme
bench --site your-site.localhost build
bench --site your-site.localhost migrate
```

---

## Theme Settings

Go to **Aura Theme Settings** in your desk to configure:

- Primary color (preset or custom)
- Font family
- Login page logo and background
- Sidebar behavior
- Dark / Light default
- Apply color to Navbar / Sidebar / Workspace / Dashboard

---

## Navbar Quick Settings

The navbar includes four new buttons (right side):

| Icon | Function |
|------|----------|
| 🔍 Search | Enhanced search bar (Ctrl+K) |
| ☰ Toggle | Collapse / expand sidebar |
| 🌙 Dark Mode | Toggle dark/light instantly |
| 🎨 Customizer | Open quick theme panel |

---

## Custom Color

In the Theme Customizer panel or in **Aura Theme Settings**:

1. Select **Custom** from the color preset list
2. Use the **color wheel**, **hex input**, **RGB sliders**, or **eyedropper**
3. Click **Apply Color**, then **Save Settings**

---

## License

MIT
