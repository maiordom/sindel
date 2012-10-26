<?php
$lib_path = "src/";
$lib_name = "src/" . "sindel.js";

createBundle( Array( "utils.js", "widget.js" ), $lib_path, $lib_name );

function createBundle( $files, $path, $bundle )
{
    $file_str = "";

    for ( $i = 0, $ilen = count( $files ); $i < $ilen; $i++ )
    {
        $file_str .= file_get_contents( $path . $files[ $i ]  ) . "\r\n\r\n";
    }

    $file_str = preg_replace( "/window/", "global", $file_str );

    $file_handle = fopen( $bundle, "w+" );
    fwrite( $file_handle, "(function( $, global )\r\n{\r\n" );
    fwrite( $file_handle, $file_str );
    fwrite( $file_handle, "})( jQuery, window );" );
    fclose( $file_handle );
}

$URI = $_SERVER[ "REQUEST_URI" ];

header( "HTTP/1.0 200 OK" );
header( "Content-Type: application/javascript" );
echo readfile( "src/sindel.js" );