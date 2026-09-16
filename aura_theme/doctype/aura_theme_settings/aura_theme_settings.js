// Copyright (c) 2024, Yousef Ashraf and contributors
// License: MIT

frappe.ui.form.on('Aura Theme Settings', {
    refresh: function (frm) {
        // Make font family selector searchable with Chosen
        $('[data-fieldname="font_family"] select').chosen({ width: '50%' });

        // Show/hide custom color picker based on selection
        frm.trigger('theme_color');
    },

    theme_color: function (frm) {
        const is_custom = frm.doc.theme_color === 'Custom';
        frm.toggle_display('custom_color', is_custom);
    },

    after_save: function (frm) {
        // Apply the new color immediately to the page without full reload
        if (frm.doc.theme_color === 'Custom' && frm.doc.custom_color) {
            aura_theme.apply_custom_color(frm.doc.custom_color);
        } else if (frm.doc.theme_color && frm.doc.theme_color !== 'Custom') {
            document.body.setAttribute('data-theme-colorname', frm.doc.theme_color.toLowerCase());
        }
        // Clear Frappe cache so next page load picks up new settings
        setTimeout(() => frappe.ui.toolbar.clear_cache(), 500);
    }
});
