var Utils = {
    tmpl: '' +
    '<div class="sindel sindel_active">' +
        '<a href="javascript:void(0)" class="sindel__box" tabindex="1">' +
            '<div class="sindel__current-text"></div>' +
            '<div class="sindel__arrow-wrapper">' +
                '<div class="sindel__arrow"></div>' +
            '</div>' +
        '</a>' +
        '<div class="sindel__drop">' +
            '<div class="sindel__drop-inner">' +
                '<ul class="sindel__majors"></ul>' +
                '<input class="sindel__search" type="text" tabindex="-1" />' +
                '<ul class="sindel__minors"></ul>' +
            '</div>' +
            '<div class="sindel__shadow">' +
                '<div class="sindel__corner sindel__corner_left"></div>' +
                '<div class="sindel__corner sindel__corner_right"></div>' +
                '<div class="sindel__corner sindel__shadow-bck "></div>' +
            '</div>' +
        '</div>' +
    '</div>',

    doTmpl: function( tmpl ) {
        var div = document.createElement( "div" );
        div.innerHTML = tmpl;
        return $( div.firstChild );
    },

    forEach: function( obj, callback ) {
        for ( var i = 0, ilen = obj.length; i < ilen; i++ )
            if ( callback.call( obj[ i ], obj[ i ], i ) === false ) { break; }
    },

    each: function( obj, callback ) {
        for ( var i = 0, ilen = obj.length; i < ilen; i++ )
            if ( callback.call( obj.eq( i ), obj.eq( i ), i ) === false ) { break; }
    },

    toArray: function( node_list ) {
        var arr = [];

        Utils.forEach( node_list, function( item, index ) {
            arr.push( item );
        });

        return arr;
    },

    cacheObjects: function( el ) {
        var select_ctx = el,
            chosen_ctx = Utils.doTmpl( Utils.tmpl ),
            options    = Utils.toArray( select_ctx.get( 0 ).getElementsByTagName( "OPTION" ) ),
            index      = select_ctx.get( 0 ).selectedIndex;

        var select = {
            ctx:      select_ctx,
            options:  options,
            selected: $( options[ index >= 0 ? index : 0 ] )
        };

        var chosen = {
            ctx:          chosen_ctx,
            search:       chosen_ctx.find( ".sindel__search" ),
            box:          chosen_ctx.find( ".sindel__box" ),
            drop:         chosen_ctx.find( ".sindel__drop" ),
            current_text: chosen_ctx.find( ".sindel__current-text" ),
            majors_list:  chosen_ctx.find( ".sindel__majors" ),
            minors_list:  chosen_ctx.find( ".sindel__minors" ),
            new_items:    $(),
            matches:      $(),
            items:        $(),
            selected:     $(),
            hovered:      $()
        };

        chosen_ctx.insertBefore( select_ctx[ 0 ] );

        return { select: select, chosen: chosen };
    },

    getListTmp: function( list, offset ) {
        var tmp = "";

        Utils.forEach( list, function( item, index ) {
            tmp += "<li class='sindel__item b-hidden' data-original-index='" + offset +"' data-index='" + offset + "'>" + item.innerHTML + "</li>";
            offset++;
        });

        return tmp;
    },

    setParams: function( settings ) {
        var params = {
            majors_count: 0,
            minors_list_overflow: true,
            search_limit: null
        };

        return $.extend( params, settings );
    }
};