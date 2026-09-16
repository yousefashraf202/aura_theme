from . import __version__ as app_version

app_name        = "aura_theme"
app_title       = "Aura Theme"
app_publisher   = "Yousef Ashraf"
app_description = "Modern SaaS theme for Frappe and ERPNext V15"
app_email       = "yousefmohamed202@outlook.com"
app_license     = "mit"

# Favicon and splash shown on web pages
website_context = {
    "favicon":      "/assets/aura_theme/images/datavlue-new-icon-xs.png",
    "splash_image": "/assets/aura_theme/images/theme_splash_empty.jpg"
}

# ---- CSS loaded in Desk ----
app_include_css = [
    "/assets/aura_theme/plugins/animate.css/animate.min.css",
    "/assets/aura_theme/plugins/fontawesome/all.min.css",
    "/assets/aura_theme/plugins/tooltip/tooltip-theme-twipsy.css",
    "/assets/aura_theme/plugins/flat-icons/flaticon.css",
    "/assets/aura_theme/plugins/bootstrap4c-chosen/component-chosen.min.css",
    "/assets/aura_theme/plugins/simple-calendar/simple-calendar.css",
    "aura_theme.bundle.css",
]

# ---- JS loaded in Desk ----
app_include_js = [
    "/assets/aura_theme/plugins/vue/vue.min.js",
    "/assets/aura_theme/plugins/bootstrap4c-chosen/chosen.min.js",
    "/assets/aura_theme/plugins/nicescroll/nicescroll.js",
    "/assets/aura_theme/plugins/tooltip/tooltip.js",
    "/assets/aura_theme/plugins/jquery-fullscreen/jquery.fullscreen.min.js",
    "/assets/aura_theme/plugins/owl-carousel/owl.carousel.min.js",
    "/assets/aura_theme/plugins/simple-calendar/jquery.simple-calendar.js",
    "/assets/aura_theme/js/aura_theme.app.min.js",
]

# ---- Email brand image ----
email_brand_image = "assets/aura_theme/images/logo-v.png"

# ---- CSS/JS for web pages (login, etc.) ----
web_include_css = [
    "assets/aura_theme/plugins/fontawesome/all.min.css",
    "assets/aura_theme/plugins/owl-carousel/owl.carousel.min.css",
    "assets/aura_theme/css/login.css",
    "assets/aura_theme/css/aura-login.css",
]
web_include_js = [
    "/assets/aura_theme/js/aura_theme.web.min.js",
]
