# Aura Theme — Desk page controller
# Based on Frappe's app.py, extended with Aura Theme Settings
# License: MIT

no_cache = 1

import json
import os
import re
import secrets

import frappe
import frappe.sessions
from frappe import _
from frappe.utils.jinja_globals import is_rtl

SCRIPT_TAG_PATTERN = re.compile(r"\<script[^<]*\</script\>")
CLOSING_SCRIPT_TAG_PATTERN = re.compile(r"</script\>")


def get_context(context):
    if frappe.session.user == "Guest":
        frappe.throw(_("Log in to access this page."), frappe.PermissionError)
    elif (
        frappe.db.get_value("User", frappe.session.user, "user_type", order_by=None)
        == "Website User"
    ):
        frappe.throw(_("You are not permitted to access this page."), frappe.PermissionError)

    hooks = frappe.get_hooks()
    try:
        boot = frappe.sessions.get()
    except Exception as e:
        boot = frappe._dict(status="failed", error=str(e))
        print(frappe.get_traceback())

    csrf_token = frappe.sessions.get_csrf_token()

    boot_json = frappe.as_json(boot, indent=None, separators=(",", ":"))
    boot_json = SCRIPT_TAG_PATTERN.sub("", boot_json)

    frappe.db.commit()

    # Load Aura Theme Settings from tabSingles
    theme_settings_list = {}
    theme_settings_rows = frappe.db.sql(
        "SELECT * FROM tabSingles WHERE doctype = 'Aura Theme Settings';",
        as_dict=True
    )
    for row in theme_settings_rows:
        theme_settings_list[row["field"]] = row["value"]

    boot_json = CLOSING_SCRIPT_TAG_PATTERN.sub("", boot_json)
    boot_json = json.dumps(boot_json)

    # Dark / Light
    desk_theme = frappe.db.get_value("User", frappe.session.user, "desk_theme")
    theme = "dark" if desk_theme == "Dark" else "light"

    # Resolve the active color
    theme_color_name = (theme_settings_list.get("theme_color") or "Blue")
    custom_color = theme_settings_list.get("custom_color") or ""
    is_custom_color = theme_color_name == "Custom"
    theme_color = theme_color_name.lower() if not is_custom_color else "custom"

    # CSS classes for color application on different sections
    theme_color_on_navbar = (
        "layout-navbar-color-style"
        if theme_settings_list.get("apply_on_navbar") == "1" else ""
    )
    apply_on_menu = (
        "layout-menu-color-style"
        if theme_settings_list.get("apply_on_menu") == "1" else ""
    )
    apply_on_dashboard = (
        "layout-dashboard-color-style"
        if theme_settings_list.get("apply_on_dashboard") == "1" else ""
    )
    apply_on_workspace = (
        "layout-workspace-color-style"
        if theme_settings_list.get("apply_on_workspace") == "1" else ""
    )

    include_icons = hooks.get("app_include_icons", [])
    frappe.local.preload_assets["icons"].extend(include_icons)

    context.update({
        "no_cache":                      1,
        "build_version":                 frappe.utils.get_build_version(),
        "build_version_dev":             secrets.randbits(50),
        "include_js":                    hooks["app_include_js"],
        "include_css":                   hooks["app_include_css"],
        "include_icons":                 include_icons,
        "layout_direction":              "rtl" if is_rtl() else "ltr",
        "lang":                          frappe.local.lang,
        "sounds":                        hooks["sounds"],
        "boot":                          boot if context.get("for_mobile") else boot_json,
        "desk_theme":                    boot.get("desk_theme") or "Light",
        "csrf_token":                    csrf_token,
        "google_analytics_id":           frappe.conf.get("google_analytics_id"),
        "google_analytics_anonymize_ip": frappe.conf.get("google_analytics_anonymize_ip"),
        "mixpanel_id":                   frappe.conf.get("mixpanel_id"),
        "theme_settings":                theme_settings_list,
        "theme_color":                   theme_color,
        "custom_color":                  custom_color,
        "is_custom_color":               is_custom_color,
        "theme_color_on_navbar":         theme_color_on_navbar,
        "apply_on_menu":                 apply_on_menu,
        "apply_on_dashboard":            apply_on_dashboard,
        "apply_on_workspace":            apply_on_workspace,
        "dark_theme":                    theme,
    })

    return context


@frappe.whitelist()
def get_desk_assets(build_version):
    """Get desk assets to be loaded for mobile app."""
    data = get_context({"for_mobile": True})
    assets = [{"type": "js", "data": ""}, {"type": "css", "data": ""}]

    if build_version != data["build_version"]:
        for path in data["include_js"]:
            if path.startswith("/assets/"):
                path = path.replace("/assets/", "assets/")
            try:
                with open(os.path.join(frappe.local.sites_path, path)) as f:
                    assets[0]["data"] += "\n" + frappe.safe_decode(f.read(), "utf-8")
            except OSError:
                pass

        for path in data["include_css"]:
            if path.startswith("/assets/"):
                path = path.replace("/assets/", "assets/")
            try:
                with open(os.path.join(frappe.local.sites_path, path)) as f:
                    assets[1]["data"] += "\n" + frappe.safe_decode(f.read(), "utf-8")
            except OSError:
                pass

    return {"build_version": data["build_version"], "boot": data["boot"], "assets": assets}
