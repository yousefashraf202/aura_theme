/*
 * Aura Theme — Main Desk JavaScript
 * Author: Yousef Ashraf
 * Built on DataValue Theme 15 foundation
 */

(function ($) {
    'use strict';

    /* ================================================================
       NAMESPACE
    ================================================================ */
    window.aura_theme = window.aura_theme || {};

    /* ================================================================
       UTILITY — hex <-> rgb conversions
    ================================================================ */
    aura_theme.hex_to_rgb = function (hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(function (c) { return c + c; }).join('');
        }
        const num = parseInt(hex, 16);
        return {
            r: (num >> 16) & 255,
            g: (num >> 8)  & 255,
            b: num         & 255
        };
    };

    aura_theme.rgb_to_hex = function (r, g, b) {
        return '#' + [r, g, b].map(function (x) {
            return Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0');
        }).join('');
    };

    /* ================================================================
       APPLY CUSTOM COLOR — injects CSS variables at runtime
    ================================================================ */
    aura_theme.apply_custom_color = function (hex) {
        if (!hex || !hex.match(/^#[0-9a-fA-F]{6}$/)) return;

        const style_id = 'aura-custom-color-vars';
        let el = document.getElementById(style_id);
        if (!el) {
            el = document.createElement('style');
            el.id = style_id;
            document.head.appendChild(el);
        }
        el.textContent = `
            html body {
                --aura-custom-color: ${hex};
                --brand-color: ${hex};
                --primary: ${hex};
                --primary-hover: ${hex};
                --primary-color: ${hex};
                --btn-primary: ${hex};
                --border-primary: ${hex};
                --invert-neutral: ${hex};
                --blue: ${hex};
            }
        `;

        // Update data attributes
        document.body.setAttribute('data-custom-color', hex);
        document.body.setAttribute('data-theme-colorname', 'custom');

        // Sync sliders and inputs inside the customizer
        const rgb = aura_theme.hex_to_rgb(hex);
        aura_theme.sync_color_controls(hex, rgb);

        window.aura_state = window.aura_state || {};
        window.aura_state.custom_color = hex;
        window.aura_state.is_custom    = true;
    };

    /* Sync all color controls to a given hex and rgb */
    aura_theme.sync_color_controls = function (hex, rgb) {
        const pick   = document.getElementById('aura-color-picker-input');
        const hexIn  = document.getElementById('aura-hex-input');
        const rSlide = document.getElementById('aura-r-slider');
        const gSlide = document.getElementById('aura-g-slider');
        const bSlide = document.getElementById('aura-b-slider');
        const rVal   = document.getElementById('aura-r-value');
        const gVal   = document.getElementById('aura-g-value');
        const bVal   = document.getElementById('aura-b-value');

        if (!rgb) rgb = aura_theme.hex_to_rgb(hex);

        if (pick)   pick.value   = hex;
        if (hexIn)  hexIn.value  = hex;
        if (rSlide) rSlide.value = rgb.r; if (rVal) rVal.value = rgb.r;
        if (gSlide) gSlide.value = rgb.g; if (gVal) gVal.value = rgb.g;
        if (bSlide) bSlide.value = rgb.b; if (bVal) bVal.value = rgb.b;
    };

    /* ================================================================
       DARK MODE
    ================================================================ */
    aura_theme.set_dark_mode = function (enable) {
        const html  = document.documentElement;
        const body  = document.body;
        const mode  = enable ? 'dark' : 'light';

        html.setAttribute('data-theme', mode);
        html.setAttribute('data-theme-mode', mode);
        html.setAttribute('data-aura-theme', mode);
        body.classList.toggle('aura-theme-dark', enable);
        body.classList.toggle('aura-theme-light', !enable);
        body.classList.toggle('aura-dark-style', enable);

        // Persist via Frappe user preference
        frappe.call({
            method: 'frappe.client.set_value',
            args: {
                doctype:   'User',
                name:      frappe.session.user,
                fieldname: 'desk_theme',
                value:     enable ? 'Dark' : 'Light'
            }
        });

        window.aura_state = window.aura_state || {};
        window.aura_state.dark_theme = mode;
    };

    /* ================================================================
       FULL WIDTH (hide sidebar)
    ================================================================ */
    aura_theme.toggle_full_width = function () {
        const btn = document.querySelector('.btn-toggle-main-menu');
        const is_hidden = document.body.classList.contains('hide-main-menu');
        document.body.classList.toggle('hide-main-menu', !is_hidden);
        if (btn) btn.classList.toggle('menu-shown', is_hidden);
    };

    /* ================================================================
       CUSTOMIZER PANEL
    ================================================================ */
    aura_theme.open_customizer = function () {
        const panel = document.getElementById('aura-customizer-panel');
        if (!panel) return;
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    };

    aura_theme.close_customizer = function () {
        const panel = document.getElementById('aura-customizer-panel');
        if (panel) panel.style.display = 'none';
    };

    aura_theme.save_customizer_settings = function () {
        const is_custom = (window.aura_state || {}).is_custom;
        const custom_color = (window.aura_state || {}).custom_color || '';

        const navbar_cb    = document.getElementById('aura-apply-navbar');
        const menu_cb      = document.getElementById('aura-apply-menu');
        const ws_cb        = document.getElementById('aura-apply-workspace');
        const dash_cb      = document.getElementById('aura-apply-dashboard');

        const payload = {
            theme_color:      is_custom ? 'Custom' : (window.aura_state || {}).theme_color || 'Blue',
            custom_color:     custom_color,
            apply_on_navbar:  navbar_cb && navbar_cb.checked ? '1' : '0',
            apply_on_menu:    menu_cb    && menu_cb.checked    ? '1' : '0',
            apply_on_workspace: ws_cb   && ws_cb.checked       ? '1' : '0',
            apply_on_dashboard: dash_cb && dash_cb.checked     ? '1' : '0'
        };

        frappe.call({
            method: 'aura_theme.api.update_theme_settings',
            args:   payload,
            callback: function (r) {
                frappe.show_alert({ message: __('Settings saved'), indicator: 'green' });
                // Apply color classes to body immediately
                const body = document.body;
                body.classList.toggle('layout-navbar-color-style',   payload.apply_on_navbar    === '1');
                body.classList.toggle('layout-menu-color-style',     payload.apply_on_menu      === '1');
                body.classList.toggle('layout-workspace-color-style',payload.apply_on_workspace === '1');
                body.classList.toggle('layout-dashboard-color-style',payload.apply_on_dashboard === '1');
            }
        });
    };

    /* ================================================================
       SIDEBAR niceScroll
    ================================================================ */
    function sidebar_niceScroll() {
        $('.side-menu .side-menu-icons > ul, .side-menu .side-menu-items > ul.dropdown-list')
            .niceScroll({
                cursorcolor: 'rgba(0,0,0,0.35)',
                cursorborder: '0px',
                cursorwidth: '3px'
            });
    }

    /* ================================================================
       FRAPPE AUTH stub (used by Vue VMs)
    ================================================================ */
    frappe.auth = {};

    /* ================================================================
       DOCUMENT READY
    ================================================================ */
    $(document).ready(function () {

        /* ---- Enhanced Search Bar ---- */
        $(this).on('click', '.aura-navbar .aura-search-trigger', function (e) {
            e.preventDefault();
            const $bar = $('.aura-navbar .aura-search-wrapper');
            $bar.toggleClass('aura-search-expanded');
            if ($bar.hasClass('aura-search-expanded')) {
                $bar.find('.aura-search-input').trigger('focus');
            }
        });

        $(this).on('click', '.aura-navbar .aura-search-close', function (e) {
            e.preventDefault();
            $('.aura-navbar .aura-search-wrapper').removeClass('aura-search-expanded');
        });

        $(document).on('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const $bar = $('.aura-navbar .aura-search-wrapper');
                $bar.addClass('aura-search-expanded');
                $bar.find('.aura-search-input').trigger('focus');
            }
            if (e.key === 'Escape') {
                $('.aura-navbar .aura-search-wrapper').removeClass('aura-search-expanded');
                aura_theme.close_customizer();
            }
        });

        /* ---- Mobile Menu ---- */
        $(this).on('click', '.aura-navbar .btn-open-mobile-menu', function (e) {
            e.preventDefault();
            const showing = $(this).hasClass('show-menu');
            $(this).toggleClass('show-menu', !showing)
                   .find('i').toggleClass('fa-bars', showing).toggleClass('fa-times', !showing);
            $('.side-menu, .side-mobile-menu').toggle(!showing);
        });

        /* ---- Overlay close on page-change ---- */
        $(this).on('page-change', function () {
            $('.aura-app-theme').removeClass('show-overlay');
        });

        /* ---- Tooltip init ---- */
        $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' });
        $('[data-toggle="tipsy"]').tipsy({ fade: true, gravity: 'w' });

        /* ---- Sidebar icon click ---- */
        $(this).on('click', '.side-menu .side-menu-icons > ul > li > a', function () {
            $(this).parents('ul').find('>li').removeClass('active');
            $(this).parent().addClass('active');
        });

        /* ---- Files icon ---- */
        $(this).on('click', '.aura-navbar .files-icon', function (e) {
            e.preventDefault();
            frappe.set_route('List', 'File');
        });

        /* ---- Full Screen (legacy support) ---- */
        $(this).on('click', '.aura-navbar .full-screen-icon', function (e) {
            e.preventDefault();
            $('body').fullscreen();
            if ($.fullscreen.isFullScreen()) {
                $('i', this).removeClass('fa-compress').addClass('fa-expand');
                $.fullscreen.exit();
            } else {
                $('i', this).removeClass('fa-expand').addClass('fa-compress');
            }
        });

        /* ---- Language change ---- */
        $(this).on('click', '#header-navbar-change-lang .dropdown-item', function (e) {
            e.preventDefault();
            const $this    = $(this);
            const language = $this.data('lang');
            const selected_flag = $this.find('.aura-lang-flag').attr('class');
            $('#header-navbar-change-lang .dropdown-lang-link')
                .html(`<span class="${selected_flag}"></span> ${language}`);
            frappe.call({
                method:   'aura_theme.api.change_language',
                args:     { language: language.toLowerCase() },
                callback: function () {
                    localStorage.setItem('active_lang', language);
                    frappe.ui.toolbar.clear_cache();
                }
            });
        });

        /* ---- Sidebar sub-menu accordion ---- */
        $(this).on(
            'click',
            '.side-menu .side-menu-items > ul.dropdown-list > li > a, .side-menu ul.mobile-modules-menu-list > li > a',
            function () {
                if ($(this).parent().hasClass('active')) {
                    $(this).parent().toggleClass('hide-sub-menu');
                    if ($(this).parent().hasClass('hide-sub-menu')) {
                        $(this).parent().find('>ul').slideUp();
                    } else {
                        $(this).parent().find('>ul').slideDown();
                    }
                } else {
                    $('.side-menu .side-menu-items > ul.dropdown-list > li, .side-menu ul.mobile-modules-menu-list > li')
                        .removeClass('hide-sub-menu active').find('>ul').slideUp();
                    $(this).parent().removeClass('hide-sub-menu').addClass('active');
                    $(this).parent().find('>ul').slideDown();
                }
                setTimeout(function () {
                    $('.side-menu .side-menu-items > ul.dropdown-list').getNiceScroll().resize();
                }, 500);
            }
        );

        /* ---- Animated icon hover ---- */
        $(this).on('mouseover', '.animated-tada', function () {
            $('.animated-icon', this).addClass('animated tada');
        }).on('mouseout', function () {
            $('.animated-icon', this).removeClass('animated tada');
        });

        /* ---- Toggle main menu (collapse sidebar) ---- */
        $(this).on('mouseover', '.btn-toggle-main-menu', function () {
            const is_shown = $(this).hasClass('menu-shown');
            $('>i.far', this)
                .removeClass('fa-bars fa-chevron-double-right fa-chevron-double-left')
                .addClass(is_shown ? 'fa-chevron-double-left' : 'fa-chevron-double-right');
        }).on('mouseout', '.btn-toggle-main-menu', function () {
            $('>i.far', this)
                .removeClass('fa-chevron-double-left fa-chevron-double-right')
                .addClass('fa-bars');
        });

        $(this).on('click', '.btn-toggle-main-menu', function () {
            const is_shown = $(this).hasClass('menu-shown');
            $(this).toggleClass('menu-shown', !is_shown);
            $('body').toggleClass('hide-main-menu', is_shown);
        });

        /* ---- Navbar: Toggle Full Width button ---- */
        $(this).on('click', '#aura-toggle-fullwidth', function (e) {
            e.preventDefault();
            aura_theme.toggle_full_width();
            $(this).toggleClass('active');
        });

        /* ---- Navbar: Dark Mode toggle ---- */
        $(this).on('click', '#aura-dark-mode-btn', function (e) {
            e.preventDefault();
            const currently_dark = document.documentElement.getAttribute('data-theme') === 'dark';
            aura_theme.set_dark_mode(!currently_dark);
            $(this).find('i').toggleClass('fa-moon', currently_dark).toggleClass('fa-sun', !currently_dark);
        });

        /* ---- Navbar: Theme Customizer toggle ---- */
        $(this).on('click', '#aura-customizer-btn', function (e) {
            e.preventDefault();
            aura_theme.open_customizer();
        });

        /* ---- Customizer panel close ---- */
        $(document).on('click', '#aura-customizer-close', function () {
            aura_theme.close_customizer();
        });

        /* ---- Customizer: Color swatch click ---- */
        $(document).on('click', '.aura-color-swatch', function () {
            const color_name = $(this).data('color');
            // Remove custom state
            window.aura_state = window.aura_state || {};
            window.aura_state.theme_color = color_name;
            window.aura_state.is_custom   = false;
            window.aura_state.custom_color = '';

            // Remove all old color classes, apply new one
            const body = document.body;
            body.className = body.className.replace(/\baura-\w+-style\b/g, '');
            body.classList.add('aura-' + color_name + '-style');
            body.setAttribute('data-theme-colorname', color_name);

            // Remove custom color CSS vars
            const custom_el = document.getElementById('aura-custom-color-vars');
            if (custom_el) custom_el.textContent = '';

            // Highlight active swatch
            $('.aura-color-swatch').removeClass('active');
            $(this).addClass('active');
        });

        /* ---- Customizer: color picker input change ---- */
        $(document).on('input change', '#aura-color-picker-input', function () {
            const hex = $(this).val();
            aura_theme.apply_custom_color(hex);
        });

        /* ---- Customizer: hex text input ---- */
        $(document).on('input', '#aura-hex-input', function () {
            let hex = $(this).val().trim();
            if (!hex.startsWith('#')) hex = '#' + hex;
            if (hex.match(/^#[0-9a-fA-F]{6}$/)) {
                aura_theme.apply_custom_color(hex);
            }
        });

        /* ---- Customizer: RGB sliders ---- */
        function update_from_rgb() {
            const r   = parseInt($('#aura-r-slider').val());
            const g   = parseInt($('#aura-g-slider').val());
            const b   = parseInt($('#aura-b-slider').val());
            const hex = aura_theme.rgb_to_hex(r, g, b);
            // Only update picker + hex, not sliders (to avoid loop)
            const pick  = document.getElementById('aura-color-picker-input');
            const hexIn = document.getElementById('aura-hex-input');
            if (pick)  pick.value  = hex;
            if (hexIn) hexIn.value = hex;
            $('#aura-r-value').val(r);
            $('#aura-g-value').val(g);
            $('#aura-b-value').val(b);
            aura_theme.apply_custom_color(hex);
        }

        $(document).on('input', '#aura-r-slider, #aura-g-slider, #aura-b-slider', update_from_rgb);

        $(document).on('input', '#aura-r-value', function () {
            $('#aura-r-slider').val($(this).val()); update_from_rgb();
        });
        $(document).on('input', '#aura-g-value', function () {
            $('#aura-g-slider').val($(this).val()); update_from_rgb();
        });
        $(document).on('input', '#aura-b-value', function () {
            $('#aura-b-slider').val($(this).val()); update_from_rgb();
        });

        /* ---- Customizer: Eyedropper ---- */
        $(document).on('click', '#aura-eyedropper-btn', async function () {
            if (!window.EyeDropper) {
                frappe.show_alert({
                    message: __('Eyedropper is not supported in this browser. Please use Chrome 95+.'),
                    indicator: 'orange'
                });
                return;
            }
            try {
                const dropper = new EyeDropper();
                const result  = await dropper.open();
                const hex     = result.sRGBHex;
                aura_theme.apply_custom_color(hex);
                window.aura_state = window.aura_state || {};
                window.aura_state.custom_color = hex;
                window.aura_state.is_custom    = true;
            } catch (e) {
                // User cancelled — do nothing
            }
        });

        /* ---- Customizer: Apply Custom Color button ---- */
        $(document).on('click', '#aura-apply-custom-color', function () {
            const hex = ($('#aura-hex-input').val() || '').trim();
            if (hex.match(/^#[0-9a-fA-F]{6}$/)) {
                aura_theme.apply_custom_color(hex);
                window.aura_state = window.aura_state || {};
                window.aura_state.custom_color = hex;
                window.aura_state.is_custom    = true;
                frappe.show_alert({ message: __('Color applied'), indicator: 'blue' });
            } else {
                frappe.show_alert({ message: __('Enter a valid hex color e.g. #2490ef'), indicator: 'red' });
            }
        });

        /* ---- Customizer: Dark Mode toggle (inside panel) ---- */
        $(document).on('change', '#aura-dark-mode-toggle', function () {
            aura_theme.set_dark_mode($(this).is(':checked'));
            // Sync the navbar icon
            const dark = $(this).is(':checked');
            $('#aura-dark-mode-btn i')
                .toggleClass('fa-moon', !dark)
                .toggleClass('fa-sun', dark);
        });

        /* ---- Customizer: Save button ---- */
        $(document).on('click', '#aura-customizer-save', function () {
            aura_theme.save_customizer_settings();
        });

        /* ---- Customizer: Full Settings button ---- */
        $(document).on('click', '#aura-open-full-settings', function () {
            frappe.set_route('Form', 'Aura Theme Settings');
            aura_theme.close_customizer();
        });

        /* ---- Modules menu toggle ---- */
        $(this).on('click', '.btn-open-modules', function () {
            const active = $(this).hasClass('active');
            $(this).toggleClass('active', !active)
                   .find('i').toggleClass('flaticon-menu', !active).toggleClass('fal fa-times', active);
            $('.modules-menu').toggle(300);
        });

        /* ---- Form sidebar section collapse ---- */
        $(document).on(
            'click',
            '.list-sidebar .sidebar-section > li.sidebar-label, .form-sidebar > .sidebar-menu > li.sidebar-label',
            function () {
                $(this).parent().toggleClass('hide-content');
            }
        );

    }); // end document.ready

    /* ================================================================
       PAGE CHANGE
    ================================================================ */
    $(document).on('page-change', function () {
        $('.btn-open-modules').removeClass('active').find('i').removeClass().addClass('flaticon-menu');
        $('.modules-menu').fadeOut();
        if (window.innerWidth <= 820) {
            $('.aura-navbar .aura-search-wrapper').removeClass('aura-search-expanded');
            $('.aura-navbar .btn-open-mobile-menu')
                .removeClass('show-menu').find('i').addClass('fa-bars').removeClass('fa-times');
            $('.side-menu, .side-mobile-menu').hide();
        }
    });

    /* ================================================================
       APP LOADED — Mount Vue components
    ================================================================ */
    $(document).on('app-loaded', function () {

        if (frappe.is_app_loaded) return;

        /* --- Logo VM --- */
        new Vue({
            el: '#aura-app-logo',
            delimiters: ['[[', ']]'],
            data: {
                logo_path:  '',
                logo_class: '',
                user:       {}
            },
            methods: {
                get_company_logo: function () {
                    const self = this;
                    const is_dark = $('html').attr('data-theme-mode') === 'dark';
                    const fallback = is_dark
                        ? '/assets/aura_theme/images/datavalue-new-logo-light.svg'
                        : '/assets/aura_theme/images/datavalue-new-logo.svg';

                    frappe.call({
                        type:   'POST',
                        method: 'aura_theme.api.get_company_logo',
                        args:   {},
                        callback: function (response) {
                            if (response.message && response.message.length) {
                                self.logo_path  = response.message;
                                self.logo_class = 'has-company-logo';
                            } else {
                                self.logo_class = '';
                                self.logo_path  = fallback;
                            }
                        }
                    });
                }
            },
            mounted: function () {
                const is_dark = $('html').attr('data-theme-mode') === 'dark';
                const fallback = is_dark
                    ? '/assets/aura_theme/images/datavalue-new-logo-light.svg'
                    : '/assets/aura_theme/images/datavalue-new-logo.svg';

                if (frappe.theme_settings && frappe.theme_settings.theme_logo) {
                    this.logo_path  = frappe.theme_settings.theme_logo;
                    this.logo_class = 'has-company-logo';
                } else {
                    this.logo_class = '';
                    this.logo_path  = fallback;
                }
            },
            created: function () {
                this.user = frappe.get_cookies();
            }
        });

        /* --- User VM --- */
        new Vue({
            el: '#header-navbar-user',
            delimiters: ['[[', ']]'],
            data: { user: {}, user_type: '' },
            created: function () {
                const self = this;
                this.user  = frappe.get_cookies();
                frappe.db.get_value('User', this.user.user_id, 'user_type', function (response) {
                    if (self.user.user_id === 'Administrator') {
                        self.user_type = __('Administrator');
                    } else {
                        self.user_type = response.user_type ? __(response.user_type) : __('User');
                    }
                    frappe.auth['user']            = self.user;
                    frappe.auth['user'].user_type  = self.user_type;
                    frappe.auth['user'].user_roles = frappe.user_roles;
                });
            }
        });

        /* --- Language VM --- */
        new Vue({
            el: '#header-navbar-change-lang',
            delimiters: ['[[', ']]'],
            data: {
                hide_language_icon: $('body').data('hide-language-icon'),
                lang_list: {
                    EN: { label: 'EN', flag: 'aura-lang-flag lang-en' },
                    AR: { label: 'AR', flag: 'aura-lang-flag lang-ar' }
                },
                active_lang: 'EN'
            },
            methods: {
                get_current_language: function () {
                    const self = this;
                    frappe.call({
                        method: 'aura_theme.api.get_current_language',
                        args:   {},
                        callback: function (response) {
                            if (response && response.message) {
                                self.active_lang = response.message.toUpperCase();
                            } else {
                                self.active_lang = localStorage.getItem('active_lang') || 'EN';
                            }
                        }
                    });
                }
            },
            created: function () {
                this.get_current_language();
            }
        });

        /* --- Initialise dark mode navbar icon state --- */
        const currently_dark = document.documentElement.getAttribute('data-theme') === 'dark';
        $('#aura-dark-mode-btn i')
            .toggleClass('fa-moon', !currently_dark)
            .toggleClass('fa-sun', currently_dark);

        /* --- Init customizer color from current state --- */
        const state = window.aura_state || {};
        if (state.is_custom && state.custom_color) {
            aura_theme.sync_color_controls(state.custom_color);
        }

    }); // end app-loaded

})(jQuery);
