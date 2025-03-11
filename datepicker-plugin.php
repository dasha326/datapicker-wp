<?php
/*
Plugin Name: Custom Datepicker
Description: Кастомный Datepicker на чистом JavaScript.
Version: 1.0
Author: Ваш имя
*/

// Добавляем шорткод
add_shortcode( 'custom_datepicker', 'custom_datepicker_shortcode' );

function custom_datepicker_shortcode( $atts ) {
    $atts = shortcode_atts(
        array(
            'datepicker_id' => 'datepicker',
            'input_id'      => 'datepicker-input',
        ),
        $atts,
        'custom_datepicker'
    );

    $datepicker_id = esc_attr( $atts['datepicker_id'] );
    $input_id      = esc_attr( $atts['input_id'] );


    // Подключаем CSS и JS файлы
    wp_enqueue_style( 'custom-datepicker-style', plugin_dir_url( __FILE__ ) . 'css/datepicker.css' );
    wp_enqueue_script( 'custom-datepicker-script', plugin_dir_url( __FILE__ ) . 'js/datepicker.js', array(), '1.0', true );

    // Передаем ID в JavaScript
    wp_localize_script( 'custom-datepicker-script', 'datepickerConfig', array(
        'datepickerId' => $datepicker_id,
        'inputId'      => $input_id,
    ));

    $output = '<div id="' . $datepicker_id . '" class="datepicker">';
    $output .= '  <input type="text" id="' . $input_id . '" class="datepicker-input" readonly placeholder="Выберите дату">';
    $output .= '<div class="datepicker-container"></div>';
    $output .= '</div>';

    return $output;
}

// Активация плагина (опционально, если нужно что-то сделать при активации)
register_activation_hook( __FILE__, 'custom_datepicker_activate' );
function custom_datepicker_activate() {
    // Код при активации плагина (например, создать опции)
}

// Деактивация плагина (опционально, если нужно что-то сделать при деактивации)
register_deactivation_hook( __FILE__, 'custom_datepicker_deactivate' );
function custom_datepicker_deactivate() {
    // Код при деактивации плагина (например, удалить опции)
}

?>