var Widget = function( el, settings ) {
    var doc = $( document ),
        isOpen,
        isMouseleave = false,
        params = {},
        select = {},
        chosen = {},
        f = {};
    
    f = {
        init: function() {
            var nodes;

            params = Utils.setParams( settings );
            nodes  = Utils.cacheObjects( el );
            chosen = nodes.chosen;
            select = nodes.select;

            f.render( f.replaceItems() );
            f.selectInitialItem();
            f.closeWidget();
            f.bindEvents();
        },

        replaceItems: function() {
            var majors = select.options.slice( 0, params.majorsCount ),
                minors = select.options.slice( params.majorsCount );

            return { majors: majors, minors: minors };
        },

        render: function( data ) {
            chosen.majorsList.html( Utils.getListTmp( data.majors, 0 ) );
            chosen.minorsList.html( Utils.getListTmp( data.minors, data.majors.length ) );

            chosen.items = chosen.ctx.find( ".sindel__item" );

            chosen.box.attr( "tabindex", select.ctx.attr( "tabindex" ) );
            select.ctx.attr( "tabindex", -1 );
            chosen.search.attr( "placeholder", "или введите другой" );
            chosen.search.css( { width: chosen.drop.outerWidth() - 18 + "px" } );
            chosen.ctx.css( { width: select.ctx.outerWidth() + "px" } );
            select.ctx.addClass( "b-hidden" );

            if ( params.minorsListOverflow ) {
                chosen.minorsList.addClass( "sindel__minors_overflow" );
            }

            if ( !params.searchLimit ) {
                params.searchLimit = data.minors.length;
            }
        },

        selectInitialItem: function() {
            var res, value;

            if ( select.selected.length ) {
                value = select.selected.html();

                Utils.each( chosen.items, function( item, index ) {
                    if ( item.html() === value ) {
                        f.selectItem( item );
                        return false;
                    }
                });
            } else {
                f.selectByIndex( 0 );
            }
        },

        selectByIndex: function( index ) {
            f.selectItem( chosen.items.eq( index ) );
        },

        update: function() {
            var index = select.ctx.get( 0 ).selectedIndex;
            f.selectByIndex( index );
        },

        bindEvents: function() {
            chosen.search.on( "keydown", f.onSearchKeydown );
            chosen.search.on( "keyup",   f.onSearchKeyup );
            chosen.search.on( "blur",    f.onSearchBlur );
            chosen.ctx.on( "mouseover",  f.onItemMouseover );
            chosen.ctx.on( "mouseout",   f.onItemMouseout );
            chosen.ctx.on( "mouseenter", f.onCtxMouseenter );
            chosen.ctx.on( "mouseleave", f.onCtxMouseleave );
            chosen.ctx.on( "click",      f.onItemClick );
            chosen.box.on( "mousedown",  f.onBoxMousedown );
            chosen.box.on( "focus",      f.onBoxFocus );
        },

        onBoxFocus: function() {
            chosen.ctx.addClass( "sindel_focus" );
            chosen.search.focus();
        },

        onCtxMouseenter: function( e ) {
            isMouseleave = false;
        },

        onCtxMouseleave: function( e ) {
            isMouseleave = true;
            isOpen ? chosen.search.focus() : null;
        },

        onSearchKeydown: function( e ) {
            if ( ~[ 27, 38, 40, 13 ].indexOf( e.keyCode ) ) {
                if ( !isOpen ) {
                    chosen.ctx.removeClass( "sindel_focus" );
                    f.openWidget();
                    return;
                }
            }

            switch( e.keyCode ) {
                /* esc   */ case 27: f.onEscClose();        break;
                /* up    */ case 38: f.navigate( - 1 );     break;
                /* down  */ case 40: f.navigate(   1 );     break;
                /* enter */ case 13: f.selectItemByInter(); break;
            }
        },

        onEscClose: function() {
            f.closeWidget();
        },

        onSearchKeyup: function( e ) {
            switch( e.keyCode ) {
                case 27: case 38: case 40: case 13: break; default: f.findAndSelectMatches();
            }
        },

        onBoxMousedown: function( e ) {
            doc.unbind( "click.chosen" );
            chosen.ctx.removeClass( "sindel_focus" );
            f.displayDrop();

            doc.click( function( e ) {
                if ( isMouseleave ) {
                    doc.unbind( "click.chosen" );
                    chosen.ctx.removeClass( "sindel_focus" );
                    f.closeWidget();
                }
            });

            return false;
        },

        onSearchBlur: function( e ) {
            if ( isMouseleave ) {
                f.closeWidget();
            }

            chosen.ctx.removeClass( "sindel_focus" );
        },

        onItemClick: function( e ) {
            var item = $( e.target );

            if ( item.hasClass( "sindel__item" ) ) {
                chosen.ctx.addClass( "sindel_focus" );
                f.selectItem( item );
                f.closeWidget();
            }
        },

        onItemMouseover: function( e ) {
            var item = $( e.target );

            if ( !item.hasClass( "sindel__item" ) || item.hasClass( "b-hidden" ) ) {
                return false;
            }

            if ( !item.hasClass( "sindel__item_active" ) ) {
                f.unselect();
                chosen.hovered = item;
                item.addClass( "sindel__item_active" );
            }
        },

        onItemMouseout: function( e ) {
            if ( $( e.target ).hasClass( "sindel__item_active" ) ) {
                f.unselect();
            }
        },

        findAndSelectMatches: function() {
            chosen.minorsList.get( 0 ).scrollTop = 0;

            chosen.search.val() ? f.findSearchMatches() : f.showItems();

            if ( chosen.matches.length ) {
                f.onItemMouseover( { target: chosen.matches[ 0 ] } );
            } else {
                f.unselect();
            }
        },

        unselect: function() {
            chosen.selected.removeClass( "sindel__item_active" );
            chosen.hovered.removeClass( "sindel__item_active" );
        },

        getCurrentItem: function() {
            return chosen.hovered.hasClass( "sindel__item_active" )  ? chosen.hovered  :
                   chosen.selected.hasClass( "sindel__item_active" ) ? chosen.selected : null;
        },

        selectItemByInter: function() {
            var item = f.getCurrentItem();

            if ( item ) {
                f.onItemClick( { target: item.get( 0 ) } );
            }
        },

        getIndex: function( offset ) {
            var item = f.getCurrentItem();

            return item ?
                parseInt( item.attr( "data-index" ), 10 ) :
                parseInt( chosen.selected.attr( "data-index" ), 10 ) - 1;
        },

        navigate: function( offset ) {
            var index     = f.getIndex(),
                new_index = index + offset,
                length    = chosen.newItems.length, item;

            f.unselect();

            if ( new_index <= -1 ) {
                item = chosen.newItems.eq( length - 1 ).addClass( "sindel__item_active" );
            } else if ( new_index <= length - 1 ) {
                item = chosen.newItems.eq( new_index ).addClass( "sindel__item_active" );
            } else if ( new_index >= length ) {
                item = chosen.newItems.eq( 0 ).addClass( "sindel__item_active" );
            }

            f.scrollTo( item.get( 0 ) );
            chosen.hovered = item;
        },

        scrollTo: function( item ) {
            var list           = chosen.minorsList.get( 0 ),
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
        },

        findSearchMatches: function() {
            var value = chosen.search.val().toLocaleLowerCase(),
                arr   = chosen.items.slice( params.majorsCount ),
                i     = params.majorsCount, search_index, matches = [];

            chosen.newItems = chosen.items.slice( 0, params.majorsCount );

            Utils.each( arr, function( item, index ) {
                search_index = item.html().toLowerCase().search( value );

                if ( matches.length >= params.searchLimit || search_index === -1 ) {
                    item.removeAttr( "data-index" ).addClass( "b-hidden" );
                } else if ( search_index >= 0 ) {
                    matches.push( item.get( 0 ) );
                    item.removeClass( "b-hidden" ).attr( "data-index", i++ );
                }
            });

            chosen.matches   = matches;
            chosen.newItems = chosen.newItems.add( matches );
        },

        showItems: function() {
            Utils.each( chosen.items, function( item, index ) {
                if ( index < params.majorsCount + params.searchLimit ) {
                    item.removeClass( "b-hidden" ).attr( "data-index", index );
                } else {
                    item.removeAttr( "data-index" ).addClass( "b-hidden" );
                }
            });

            chosen.newItems = chosen.items.slice( 0, params.majorsCount + params.searchLimit );
            chosen.matches  = chosen.items.slice( params.majorsCount ).get();
        },

        displayDrop: function() {
            !isOpen ? f.openWidget() : f.closeWidget();
        },

        openWidget: function() {
            isOpen = true;
            chosen.ctx.removeClass( "sindel_focus" ).addClass( "sindel_active" );
            f.showItems();
            chosen.search.val( "" );
            chosen.search.focus();
            chosen.hovered.removeClass( "sindel__item_active" );
            chosen.selected = chosen.selected.hasClass( "b-hidden" ) ? chosen.items.eq( 0 ) : chosen.selected;
            chosen.selected.addClass( "sindel__item_active" );
            f.scrollTo( chosen.selected.get( 0 ) );
        },

        closeWidget: function() {
            isOpen = false;
            chosen.ctx.removeClass( "sindel_active" );
        },

        selectItem: function( item ) {
            f.unselect();
            chosen.selected = item.addClass( "sindel__item_active" );
            chosen.currentText.html( chosen.selected.html() );
            select.ctx.get( 0 ).selectedIndex = parseInt( chosen.selected.attr( "data-original-index" ), 10 );
        },

        destroy: function() {
            doc.off( "click.chosen" );
            select.ctx.removeClass( "b-hidden" );
            chosen.ctx.remove();
        }
    };

    f.init();

    return {
        destroy: f.destroy,
        update: f.update
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