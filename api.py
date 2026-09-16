from __future__ import unicode_literals
import os
import re
import json
import frappe
from frappe.utils import (
    flt, cint, get_time, get_filter, add_to_date, cstr,
    get_timespan_date_range, nowdate, add_days, getdate,
    add_months, get_datetime
)
from frappe import _
from frappe.desk.reportview import get_filters_cond
from frappe.cache_manager import clear_user_cache


@frappe.whitelist()
def get_module_name_from_doctype(doc_name, current_module=""):
    """Return the workspace module for a given doctype."""
    if not doc_name:
        return None

    # Use parameterised queries to prevent SQL injection
    if current_module:
        list_of_dicts = frappe.db.sql("""
            SELECT w.`name` AS `module`,
                   (SELECT restrict_to_domain FROM `tabModule Def`
                    WHERE `name` = w.module) AS restrict_to_domain
            FROM tabWorkspace w
            INNER JOIN `tabWorkspace Link` l ON w.`name` = l.parent
            WHERE l.link_to = %s
              AND w.`name` = %s
        """, (doc_name, current_module), as_dict=True)
    else:
        list_of_dicts = frappe.db.sql("""
            SELECT w.`name` AS `module`,
                   (SELECT restrict_to_domain FROM `tabModule Def`
                    WHERE `name` = w.module) AS restrict_to_domain
            FROM tabWorkspace w
            INNER JOIN `tabWorkspace Link` l ON w.`name` = l.parent
            WHERE l.link_to = %s
        """, (doc_name,), as_dict=True)

    if list_of_dicts:
        return [{"module": list_of_dicts[0]["module"]}]

    # Fallback — search without module filter
    if current_module:
        list_of_dicts = frappe.db.sql("""
            SELECT w.`name` AS `module`,
                   (SELECT restrict_to_domain FROM `tabModule Def`
                    WHERE `name` = w.module) AS restrict_to_domain
            FROM tabWorkspace w
            INNER JOIN `tabWorkspace Link` l ON w.`name` = l.parent
            WHERE l.link_to = %s
        """, (doc_name,), as_dict=True)
        if list_of_dicts:
            return [{"module": list_of_dicts[0]["module"]}]

    return None


@frappe.whitelist()
def change_language(language):
    frappe.db.set_value("User", frappe.session.user, "language", language)
    clear()
    return True


@frappe.whitelist()
def get_current_language():
    return frappe.db.get_value("User", frappe.session.user, "language")


@frappe.whitelist()
def get_company_logo():
    logo_path = ""
    current_company = frappe.defaults.get_user_default("company")
    if current_company:
        logo_path = frappe.db.get_value("Company", current_company, "company_logo")
    return logo_path


@frappe.whitelist(allow_guest=True)
def get_theme_settings():
    """Return theme settings required by the frontend (login page + desk)."""
    slideshow_photos = []
    settings_list = {}

    settings = frappe.db.sql("""
        SELECT * FROM tabSingles WHERE doctype = 'Aura Theme Settings';
    """, as_dict=True)

    for setting in settings:
        settings_list[setting["field"]] = setting["value"]

    if settings_list.get("background_type") == "Slideshow":
        slideshow_photos = frappe.db.sql("""
            SELECT `photo` FROM `tabSlideshow Photos`
            WHERE `parent` = 'Aura Theme Settings';
        """, as_dict=True)

    return {
        "enable_background":          settings_list.get("enable_background", ""),
        "background_photo":           settings_list.get("background_photo", ""),
        "background_type":            settings_list.get("background_type", ""),
        "full_page_background":       settings_list.get("full_page_background", ""),
        "transparent_background":     settings_list.get("transparent_background", ""),
        "slideshow_photos":           slideshow_photos,
        "dark_view":                  settings_list.get("dark_view", ""),
        "theme_color":                settings_list.get("theme_color", ""),
        "custom_color":               settings_list.get("custom_color", ""),
        "open_workspace_on_mobile_menu": settings_list.get("open_workspace_on_mobile_menu", ""),
        "show_icon_label":            settings_list.get("show_icon_label", ""),
        "hide_icon_tooltip":          settings_list.get("hide_icon_tooltip", ""),
        "always_close_sub_menu":      settings_list.get("always_close_sub_menu", ""),
        "menu_opening_type":          settings_list.get("menu_opening_type", ""),
        "loading_image":              settings_list.get("loading_image", ""),
    }


@frappe.whitelist()
def update_theme_settings(**data):
    """Save theme color settings from the quick settings panel."""
    data = frappe._dict(data)
    doc = frappe.get_doc("Aura Theme Settings")
    if data.get("theme_color"):
        doc.theme_color = data.theme_color
    if data.get("custom_color") is not None:
        doc.custom_color = data.custom_color
    if data.get("apply_on_menu") is not None:
        doc.apply_on_menu = cint(data.apply_on_menu)
    if data.get("apply_on_dashboard") is not None:
        doc.apply_on_dashboard = cint(data.apply_on_dashboard)
    if data.get("apply_on_workspace") is not None:
        doc.apply_on_workspace = cint(data.apply_on_workspace)
    if data.get("apply_on_navbar") is not None:
        doc.apply_on_navbar = cint(data.apply_on_navbar)
    doc.save(ignore_permissions=True)
    return doc


@frappe.whitelist()
def update_menu_modules(modules):
    modules_list = json.loads(modules)
    for module in modules_list:
        if frappe.db.exists("Workspace", module["name"]):
            if module.get("_is_deleted") == "true":
                frappe.delete_doc("Workspace", module["name"], force=True)
            else:
                frappe.db.set_value("Workspace", module["name"], {
                    "title":       module["title"],
                    "label":       module["title"],
                    "icon":        module["icon"],
                    "sequence_id": int(module["sequence_id"])
                })
        else:
            if module.get("_is_new") == "true":
                workspace = frappe.new_doc("Workspace")
                workspace.title       = module["title"]
                workspace.icon        = module["icon"]
                workspace.content     = module.get("content", "")
                workspace.label       = module["label"]
                workspace.sequence_id = int(module["sequence_id"])
                workspace.for_user    = ""
                workspace.public      = 1
                workspace.save(ignore_permissions=True)
    return True


def clear():
    frappe.local.session_obj.update(force=True)
    frappe.local.db.commit()
    clear_user_cache(frappe.session.user)
    frappe.response["message"] = _("Cache Cleared")
