/*
 * Aura Theme — Login Page JS
 */
(function($) {
    'use strict';

    frappe.call({
        type:   'POST',
        method: 'aura_theme.api.get_theme_settings',
        args:   {},
        callback: function(r) {
            if (!r || !r.message) return;
            var s = r.message;

            // Background
            if (s.full_page_background === '1') {
                $('.page_content').removeClass('min-background').addClass('full-background');
            } else {
                $('.page_content').removeClass('full-background').addClass('min-background');
            }

            // Transparent form
            if (s.transparent_background === '1' && s.enable_background === '1') {
                $('.page_content').addClass('widget-background-transparent');
            } else {
                $('.page_content').removeClass('widget-background-transparent');
            }

            // Background image / slideshow
            if (s.background_type === 'Single Photo' && s.enable_background === '1') {
                $('.page_content').css({ 'background-image': 'url("' + s.background_photo + '")' });
            } else if (s.background_type === 'Slideshow' && s.enable_background === '1') {
                var slides = '';
                if (s.slideshow_photos && s.slideshow_photos.length) {
                    s.slideshow_photos.forEach(function(p) {
                        slides += '<div class="login-page-slideshow-item"><img src="' + p.photo + '"></div>';
                    });
                }
                $('.page_content').append(
                    '<div class="login-page-slideshow-container">' +
                    '  <div class="owl-carousel">' + slides + '</div>' +
                    '</div>'
                );
                if ($.fn.owlCarousel) {
                    $('.login-page-slideshow-container .owl-carousel').owlCarousel({
                        loop:      true,
                        margin:    0,
                        nav:       false,
                        dots:      false,
                        autoplay:  true,
                        animateIn: 'fadeIn',
                        items:     1
                    });
                }
            }
        }
    });

})(jQuery);
