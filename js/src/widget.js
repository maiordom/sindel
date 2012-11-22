var Widget = function( el, settings ) {
    var doc = $( document ), is_open, is_mouseleave = false, params = {}, select = {}, chosen = {};

    function init() {
        var nodes;

        params = Utils.setParams( settings );
        nodes  = Utils.cacheObjects( el );
        chosen = nodes.chosen;
        select = nodes.select;

        render( replaceItems() );
        selectInitialItem();
        closeWidget();
        bindEvents();
    }

    function replaceItems() {
        var majors = select.options.slice( 0, params.majors_count ),
            minors = select.options.slice( params.majors_count );

        return { majors: majors, minors: minors };
    }

    function render( data ) {
        chosen.majors_list.html( Utils.getListTmp( data.majors, 0 ) );
        chosen.minors_list.html( Utils.getListTmp( data.minors, data.majors.length ) );

        chosen.items = chosen.ctx.find( ".b-chosen__item" );

        chosen.box.attr( "tabindex", select.ctx.attr( "tabindex" ) );
        select.ctx.attr( "tabindex", -1 );
        chosen.search.attr( "placeholder", "или введите другой" );
        chosen.search.css( { width: chosen.drop.outerWidth() - 18 + "px" } );
        chosen.ctx.css( { width: select.ctx.outerWidth() + "px" } );
        select.ctx.addClass( "b-hidden" );

        if ( params.minors_list_overflow ) {
            chosen.minors_list.addClass( "b-chosen__minors_overflow" );
        }

        if ( !params.search_limit ) {
            params.search_limit = data.minors.length;
        }
    }

    function selectInitialItem() {
        var res, value;

        if ( select.selected.length ) {
            value = select.selected.html();

            Utils.each( chosen.items, function( item, index ) {
                if ( item.html() === value ) {
                    selectItem( item );
                    return false;
                }
            });
        } else {
            selectByIndex( 0 );
        }
    }

    function selectByIndex( index ) {
        selectItem( chosen.items.eq( index ) );
    }

    function update() {
        var index = select.ctx.get( 0 ).selectedIndex;
        selectByIndex( index );
    }

    function bindEvents() {
        chosen.search.on( "keydown", onSearchKeydown );
        chosen.search.on( "keyup",   onSearchKeyup );
        chosen.search.on( "blur",    onSearchBlur );
        chosen.ctx.on( "mouseover",  onItemMouseover );
        chosen.ctx.on( "mouseout",   onItemMouseout );
        chosen.ctx.on( "mouseenter", onCtxMouseenter );
        chosen.ctx.on( "mouseleave", onCtxMouseleave );
        chosen.ctx.on( "click",      onItemClick );
        chosen.box.on( "mousedown",  onBoxMousedown );
        chosen.box.on( "focus",      onBoxFocus );
    }

    function onBoxFocus() {
        chosen.ctx.addClass( "b-chosen_focus" );
        chosen.search.focus();
    }

    function onCtxMouseenter( e ) {
        is_mouseleave = false;
    }

    function onCtxMouseleave( e ) {
        is_mouseleave = true;
        chosen.search.focus();
    }

    function onSearchKeydown( e ) {
        if ( ~[ 27, 38, 40, 13 ].indexOf( e.keyCode ) ) {
            if ( !is_open ) {
                chosen.ctx.removeClass( "b-chosen_focus" );
                openWidget();
                return;
            }
        }

        switch( e.keyCode ) {
            /* esc   */ case 27: onEscClose();        break;
            /* up    */ case 38: navigate( - 1 );     break;
            /* down  */ case 40: navigate(   1 );     break;
            /* enter */ case 13: selectItemByInter(); break;
        }
    }

    function onEscClose() {
        closeWidget();
    }

    function onSearchKeyup( e ) {
        switch( e.keyCode ) {
            case 27: case 38: case 40: case 13: break; default: findAndSelectMatches();
        }
    }

    function onBoxMousedown( e ) {
        doc.unbind( "click.chosen" );
        chosen.ctx.removeClass( "b-chosen_focus" );
        displayDrop();

        doc.click( function( e ) {
            if ( is_mouseleave ) {
                doc.unbind( "click.chosen" );
                chosen.ctx.removeClass( "b-chosen_focus" );
                closeWidget();
            }
        });

        return false;
    }

    function onSearchBlur( e ) {
        if ( is_mouseleave ) {
            closeWidget();
        }

        chosen.ctx.removeClass( "b-chosen_focus" );
    }

    function onItemClick( e ) {
        var item = $( e.target );

        if ( item.hasClass( "b-chosen__item" ) ) {
            chosen.ctx.addClass( "b-chosen_focus" );
            selectItem( item );
            closeWidget();
        }
    }

    function onItemMouseover( e ) {
        var item = $( e.target );

        if ( !item.hasClass( "b-chosen__item" ) || item.hasClass( "b-hidden" ) ) {
            return false;
        }

        if ( !item.hasClass( "b-chosen__item_active" ) ) {
            unselect();
            chosen.hovered = item;
            item.addClass( "b-chosen__item_active" );
        }
    }

    function onItemMouseout( e ) {
        if ( $( e.target ).hasClass( "b-chosen__item_active" ) ) {
            unselect();
        }
    }

    function findAndSelectMatches() {
        chosen.minors_list.get( 0 ).scrollTop = 0;

        chosen.search.val() ? findSearchMatches() : showItems();

        if ( chosen.matches.length ) {
            onItemMouseover( { target: chosen.matches[ 0 ] } );
        } else {
            unselect();
        }
    }

    function unselect() {
        chosen.selected.removeClass( "b-chosen__item_active" );
        chosen.hovered.removeClass( "b-chosen__item_active" );
    }

    function getCurrentItem() {
        return chosen.hovered.hasClass( "b-chosen__item_active" )  ? chosen.hovered  :
               chosen.selected.hasClass( "b-chosen__item_active" ) ? chosen.selected : null;
    }

    function selectItemByInter() {
        var item = getCurrentItem();

        if ( item ) {
            onItemClick( { target: item.get( 0 ) } );
        };
    }

    function getIndex( offset ) {
        var item = getCurrentItem();

        return item ?
            parseInt( item.attr( "data-index" ), 10 ) :
            parseInt( chosen.selected.attr( "data-index" ), 10 ) - 1;
    }

    function navigate( offset ) {
        var index     = getIndex(),
            new_index = index + offset,
            length    = chosen.new_items.length, item;

        unselect();

        if ( new_index <= -1 ) {
            item = chosen.new_items.eq( length - 1 ).addClass( "b-chosen__item_active" );
        } else if ( new_index <= length - 1 ) {
            item = chosen.new_items.eq( new_index ).addClass( "b-chosen__item_active" );
        } else if ( new_index >= length ) {
            item = chosen.new_items.eq( 0 ).addClass( "b-chosen__item_active" );
        }

        scrollTo( item.get( 0 ) );
        chosen.hovered = item;
    }

    function scrollTo( item ) {
        var list           = chosen.minors_list.get( 0 ),
            max_height     = list.offsetHeight,
            visible_top    = list.scrollTop,
            visible_bottom = max_height + visible_top,
            high_top       = item.offsetTop,
            high_bottom    = high_top + item.offsetHeight;

        if ( high_bottom >= visible_bottom ) {
            list.scrollTop = ( high_bottom - max_height ) > 0 ? high_bottom - max_height : 0;
        } else if ( high_top < visible_top ) {
            return list.scrollTop = high_top;
        }
    }

    function findSearchMatches() {
        var value = chosen.search.val().toLocaleLowerCase(),
            arr   = chosen.items.slice( params.majors_count ),
            i     = params.majors_count, search_index, matches = [];

        chosen.new_items = chosen.items.slice( 0, params.majors_count );

        Utils.each( arr, function( item, index ) {
            search_index = item.html().toLowerCase().search( value );

            if ( matches.length >= params.search_limit || search_index === -1 ) {
                item.removeAttr( "data-index" ).addClass( "b-hidden" );
            } else if ( search_index >= 0 ) {
                matches.push( item.get( 0 ) );
                item.removeClass( "b-hidden" ).attr( "data-index", i++ );
            }
        });

        chosen.matches   = matches;
        chosen.new_items = chosen.new_items.add( matches );
    }

    function showItems() {
        Utils.each( chosen.items, function( item, index ) {
            if ( index < params.majors_count + params.search_limit ) {
                item.removeClass( "b-hidden" ).attr( "data-index", index );
            } else {
                item.removeAttr( "data-index" ).addClass( "b-hidden" );
            }
        });

        chosen.new_items = chosen.items.slice( 0, params.majors_count + params.search_limit );
        chosen.matches   = chosen.items.slice( params.majors_count ).get();
    }

    function displayDrop() {
        !is_open ? openWidget() : closeWidget();
    }

    function openWidget() {
        is_open = true;
        chosen.ctx.removeClass( "b-chosen_focus" ).addClass( "b-chosen_active" );
        showItems();
        chosen.search.val( "" );
        chosen.search.focus();
        chosen.hovered.removeClass( "b-chosen__item_active" );
        chosen.selected = chosen.selected.hasClass( "b-hidden" ) ? chosen.items.eq( 0 ) : chosen.selected;
        chosen.selected.addClass( "b-chosen__item_active" );
        scrollTo( chosen.selected.get( 0 ) );
    }

    function closeWidget() {
        is_open = false;
        chosen.ctx.removeClass( "b-chosen_active" );
    }

    function selectItem( item ) {
        unselect();
        chosen.selected = item.addClass( "b-chosen__item_active" );
        chosen.current_text.html( chosen.selected.html() );
        select.ctx.get( 0 ).selectedIndex = parseInt( chosen.selected.attr( "data-original-index" ), 10 );
    }

    function destroy() {
        doc.off( "click.chosen" );
        select.ctx.removeClass( "b-hidden" );
        chosen.ctx.remove();
    };

    init();

    return {
        destroy: destroy,
        update: update
    };
};

$.fn.sindel = function( options ) {
    Utils.each( this, function( item ) {
        if ( item.data( "sindel" ) ) {
            console.log( "sindel already init: ", item, options );
        } else {
            item.data( "sindel", new Widget( item, options || {} ) );
        }
    });
};