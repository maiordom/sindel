'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (root, $, undefined) {

    var namespace = 'sindel';

    /* global namespace */

    var Utils = {
        tmpl: '<div class="' + namespace + ' ' + namespace + '_active" tabindex="1">\n        <div class="' + namespace + '__box">\n            <div class="' + namespace + '__current-text"></div>\n            <div class="' + namespace + '__arrow"></div>\n        </div>\n        <div class="' + namespace + '__drop">\n            <div class="' + namespace + '__drop-inner">\n                <input class="' + namespace + '__search" type=и"text" tabindex="-1" />\n                <ul class="' + namespace + '__options"></ul>\n            </div>\n        </div>\n    </div>',

        doTmpl: function doTmpl(tmpl) {
            var div = document.createElement('div');
            div.innerHTML = tmpl;
            return $(div.firstChild);
        },

        forEach: function forEach(obj, callback, ctx) {
            for (var i = 0, ilen = obj.length; i < ilen; i++) {
                if (callback.call(ctx, obj[i], i) === false) {
                    break;
                }
            }
        },

        each: function each(obj, callback, ctx) {
            for (var i = 0, ilen = obj.length; i < ilen; i++) {
                if (callback.call(ctx, obj.eq(i), i) === false) {
                    break;
                }
            }
        },

        toArray: function toArray(nodeList) {
            var arr = [];

            Utils.forEach(nodeList, function (item, index) {
                arr.push(item);
            });

            return arr;
        },

        cacheObjects: function cacheObjects(el) {
            var selectCtx = el;
            var chosenCtx = Utils.doTmpl(Utils.tmpl);
            var options = Utils.toArray(selectCtx.get(0).getElementsByTagName('OPTION'));
            var index = selectCtx.get(0).selectedIndex;
            var select = {
                ctx: selectCtx,
                options: options,
                selected: $(options[index >= 0 ? index : 0])
            };
            var chosen = {
                ctx: chosenCtx,
                search: chosenCtx.find('.' + namespace + '__search'),
                box: chosenCtx.find('.' + namespace + '__box'),
                drop: chosenCtx.find('.' + namespace + '__drop'),
                currentText: chosenCtx.find('.' + namespace + '__current-text'),
                list: chosenCtx.find('.' + namespace + '__options'),
                matches: $(),
                items: $(),
                selected: $(),
                hovered: $()
            };

            chosenCtx.insertBefore(selectCtx[0]);
            chosenCtx.append(selectCtx[0]);

            return {
                select: select,
                chosen: chosen
            };
        },

        getListTmp: function getListTmp(list, offset) {
            var tmp = '';

            Utils.forEach(list, function (item, index) {
                tmp += '<li class="' + namespace + '__item b-hidden" data-original-index="' + offset + '" data-index="' + offset + '">' + item.innerHTML + '</li>';
                offset++;
            });

            return tmp;
        },

        setParams: function setParams(settings) {
            var params = {
                listOverflow: true
            };

            return $.extend(params, settings);
        }
    };

    /* global namespace Utils */

    var Widget = (function () {
        function Widget(el, settings) {
            _classCallCheck(this, Widget);

            this.init(el, settings);

            return {
                destroy: this.destroy.bind(this),
                update: this.update.bind(this)
            };
        }

        _createClass(Widget, [{
            key: 'init',
            value: function init(el, settings) {
                this.doc = $(document);
                this.isOpen = null;
                this.isMouseleave = false;

                this.params = Utils.setParams(settings);
                var nodes = Utils.cacheObjects(el);
                this.chosen = nodes.chosen;
                this.select = nodes.select;

                this.render();
                this.selectInitialItem();
                this.closeWidget();
                this.bindEvents();
            }
        }, {
            key: 'render',
            value: function render() {
                this.chosen.list.html(Utils.getListTmp(this.select.options, 0));
                this.chosen.items = this.chosen.ctx.find('.' + namespace + '__item');

                this.select.ctx.attr('tabindex', -1);
                this.chosen.search.attr('placeholder', 'или введите другой');
                this.select.ctx.addClass('b-hidden');

                if (this.params.listOverflow) {
                    this.chosen.list.addClass(namespace + '__list_overflow');
                }
            }
        }, {
            key: 'selectInitialItem',
            value: function selectInitialItem() {
                var value = void 0;

                if (this.select.selected.length) {
                    value = this.select.selected.html();

                    Utils.each(this.chosen.items, function (item, index) {
                        if (item.html() === value) {
                            this.selectItem(item);
                            return false;
                        }
                    }, this);
                } else {
                    this.selectByIndex(0);
                }
            }
        }, {
            key: 'selectByIndex',
            value: function selectByIndex(index) {
                this.selectItem(this.chosen.items.eq(index));
            }
        }, {
            key: 'update',
            value: function update() {
                var index = this.select.ctx.get(0).selectedIndex;
                this.selectByIndex(index);
            }
        }, {
            key: 'bindEvents',
            value: function bindEvents() {
                this.chosen.search.on('keydown', this.onSearchKeydown.bind(this));
                this.chosen.search.on('keyup', this.onSearchKeyup.bind(this));
                this.chosen.search.on('blur', this.onSearchBlur.bind(this));
                this.chosen.ctx.on('mouseover', this.onItemMouseover.bind(this));
                this.chosen.ctx.on('mouseout', this.onItemMouseout.bind(this));
                this.chosen.ctx.on('mouseenter', this.onCtxMouseenter.bind(this));
                this.chosen.ctx.on('mouseleave', this.onCtxMouseleave.bind(this));
                this.chosen.box.on('click', this.onBoxClick.bind(this));
                this.chosen.ctx.on('click', this.onItemClick.bind(this));
                this.chosen.box.on('mousedown', this.onBoxMousedown.bind(this));
                this.chosen.ctx.on('focus', this.onCtxFocus.bind(this));
                this.chosen.ctx.on('focusout', this.onCtxFocusout.bind(this));
            }
        }, {
            key: 'onCtxFocus',
            value: function onCtxFocus() {
                this.chosen.ctx.addClass(namespace + '_focus');
            }
        }, {
            key: 'onCtxFocusout',
            value: function onCtxFocusout() {
                this.chosen.ctx.removeClass(namespace + '_focus');
            }
        }, {
            key: 'onCtxMouseenter',
            value: function onCtxMouseenter() {
                this.isMouseleave = false;
                this.chosen.ctx.addClass(namespace + '_hover');
            }
        }, {
            key: 'onCtxMouseleave',
            value: function onCtxMouseleave() {
                this.isMouseleave = true;
                this.isOpen ? this.chosen.search.focus() : null;
                this.chosen.ctx.removeClass(namespace + '_hover');
            }
        }, {
            key: 'onSearchKeydown',
            value: function onSearchKeydown(e) {
                if (~[27, 38, 40, 13].indexOf(e.keyCode)) {
                    if (!this.isOpen) {
                        this.chosen.ctx.removeClass(namespace + '_focus');
                        this.openWidget();
                        return;
                    }
                }

                switch (e.keyCode) {
                    /* esc   */
                    case 27:
                        this.onEscClose();
                        break;
                    /* up    */
                    case 38:
                        this.navigate(-1);
                        break;
                    /* down  */
                    case 40:
                        this.navigate(1);
                        break;
                    /* enter */
                    case 13:
                        this.selectItemByInter();
                        break;
                }
            }
        }, {
            key: 'onEscClose',
            value: function onEscClose() {
                this.closeWidget();
            }
        }, {
            key: 'onSearchKeyup',
            value: function onSearchKeyup(e) {
                switch (e.keyCode) {
                    case 27:
                    case 38:
                    case 40:
                    case 13:
                        break;
                    default:
                        this.findAndSelectMatches();
                }
            }
        }, {
            key: 'onBoxMousedown',
            value: function onBoxMousedown() {
                this.chosen.ctx.removeClass(namespace + '_focus');
                this.chosen.ctx.addClass(namespace + '_pressed');
                this.doc.off('click.chosen');
                this.doc.on('click.chosen', this.onDocClick.bind(this));
                return false;
            }
        }, {
            key: 'onBoxClick',
            value: function onBoxClick(e) {
                if (this.isOpen) {
                    this.closeWidget();
                } else {
                    this.openWidget();
                }
            }
        }, {
            key: 'onDocClick',
            value: function onDocClick() {
                if (this.isMouseleave) {
                    this.doc.off('click.chosen');
                    this.chosen.ctx.removeClass(namespace + '_focus');
                    this.closeWidget();
                }

                this.chosen.ctx.removeClass(namespace + '_pressed');
            }
        }, {
            key: 'onSearchBlur',
            value: function onSearchBlur() {
                if (this.isMouseleave) {
                    this.closeWidget();
                }

                this.chosen.ctx.removeClass(namespace + '_focus');
            }
        }, {
            key: 'onItemClick',
            value: function onItemClick(e) {
                var item = $(e.target);

                if (item.hasClass(namespace + '__item')) {
                    this.selectItem(item);
                    this.closeWidget();
                    e.stopPropagation();
                }
            }
        }, {
            key: 'onItemMouseover',
            value: function onItemMouseover(e) {
                var item = $(e.target);

                if (!item.hasClass(namespace + '__item') || item.hasClass('b-hidden')) {
                    return false;
                }

                if (!item.hasClass(namespace + '__item_active')) {
                    this.unselect();
                    this.chosen.hovered = item;
                    item.addClass(namespace + '__item_active');
                }
            }
        }, {
            key: 'onItemMouseout',
            value: function onItemMouseout(e) {
                if ($(e.target).hasClass(namespace + '__item_active')) {
                    this.unselect();
                }
            }
        }, {
            key: 'findAndSelectMatches',
            value: function findAndSelectMatches() {
                this.chosen.list.get(0).scrollTop = 0;
                this.chosen.search.val() ? this.findSearchMatches() : this.showItems();

                if (this.chosen.matches.length) {
                    this.onItemMouseover({
                        target: this.chosen.matches[0]
                    });
                } else {
                    this.unselect();
                }
            }
        }, {
            key: 'unselect',
            value: function unselect() {
                this.chosen.selected.removeClass(namespace + '__item_active');
                this.chosen.hovered.removeClass(namespace + '__item_active');
            }
        }, {
            key: 'getCurrentItem',
            value: function getCurrentItem() {
                if (this.chosen.hovered.hasClass(namespace + '__item_active')) {
                    return this.chosen.hovered;
                } else if (this.chosen.selected.hasClass(namespace + '__item_active')) {
                    return this.chosen.selected;
                }

                return null;
            }
        }, {
            key: 'selectItemByInter',
            value: function selectItemByInter() {
                var item = this.getCurrentItem();

                if (item) {
                    this.onItemClick(new $.Event('click', {
                        target: item.get(0)
                    }));
                }
            }
        }, {
            key: 'getIndex',
            value: function getIndex(offset) {
                var item = this.getCurrentItem();

                if (item) {
                    return parseInt(item.attr('data-index'), 10);
                }

                return parseInt(this.chosen.selected.attr('data-index'), 10) - 1;
            }
        }, {
            key: 'navigate',
            value: function navigate(offset) {
                var index = this.getIndex();
                var newIndex = index + offset;
                var length = this.chosen.matches.length;
                var item = void 0;

                this.unselect();

                if (newIndex <= -1) {
                    item = this.chosen.matches.eq(length - 1).addClass(namespace + '__item_active');
                } else if (newIndex <= length - 1) {
                    item = this.chosen.matches.eq(newIndex).addClass(namespace + '__item_active');
                } else if (newIndex >= length) {
                    item = this.chosen.matches.eq(0).addClass(namespace + '__item_active');
                }

                this.scrollTo(item.get(0));
                this.chosen.hovered = item;
            }
        }, {
            key: 'scrollTo',
            value: function scrollTo(item) {
                var list = this.chosen.list.get(0);
                var maxHeight = list.offsetHeight;
                var visibleTop = list.scrollTop;
                var visibleBottom = maxHeight + visibleTop;
                var highTop = item.offsetTop;
                var highBottom = highTop + item.offsetHeight;

                if (highBottom >= visibleBottom) {
                    list.scrollTop = highBottom - maxHeight > 0 ? highBottom - maxHeight : 0;
                } else if (highTop < visibleTop) {
                    list.scrollTop = highTop;
                }
            }
        }, {
            key: 'findSearchMatches',
            value: function findSearchMatches() {
                var value = this.chosen.search.val().toLocaleLowerCase();
                var arr = this.chosen.items;
                var i = 0;
                var searchIndex = void 0;
                var matches = [];

                Utils.each(arr, function (item, index) {
                    searchIndex = item.html().toLowerCase().search(value);

                    if (searchIndex === -1) {
                        item.removeAttr('data-index').addClass('b-hidden');
                    } else if (searchIndex >= 0) {
                        matches.push(item.get(0));
                        item.removeClass('b-hidden').attr('data-index', i++);
                    }
                }, this);

                this.chosen.matches = $(matches);
            }
        }, {
            key: 'showItems',
            value: function showItems() {
                Utils.each(this.chosen.items, function (item, index) {
                    item.removeClass('b-hidden').attr('data-index', index);
                }, this);

                this.chosen.matches = this.chosen.items;
            }
        }, {
            key: 'openWidget',
            value: function openWidget() {
                this.isOpen = true;
                this.chosen.ctx.removeClass(namespace + '_focus').addClass(namespace + '_active');
                this.showItems();
                this.chosen.search.val('');
                this.chosen.search.focus();
                this.chosen.hovered.removeClass(namespace + '__item_active');
                this.chosen.selected = this.chosen.selected.hasClass('b-hidden') ? this.chosen.items.eq(0) : this.chosen.selected;
                this.chosen.selected.addClass(namespace + '__item_active');
                this.scrollTo(this.chosen.selected.get(0));
            }
        }, {
            key: 'closeWidget',
            value: function closeWidget() {
                this.isOpen = false;
                this.chosen.ctx.removeClass(namespace + '_active');
                this.chosen.ctx.removeClass(namespace + '_hover');
            }
        }, {
            key: 'selectItem',
            value: function selectItem(item) {
                this.unselect();
                this.chosen.selected.removeClass(namespace + '__item_selected');
                this.chosen.selected = item.addClass(namespace + '__item_selected');
                this.chosen.currentText.html(this.chosen.selected.html());
                this.select.ctx.get(0).selectedIndex = parseInt(this.chosen.selected.attr('data-original-index'), 10);
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                this.doc.off('click.chosen');
                this.select.ctx.removeClass('b-hidden');
                this.chosen.ctx.remove();
            }
        }]);

        return Widget;
    })();

    ;

    $.fn.sindel = function (options) {
        Utils.each(this, function (item) {
            if (item.data('' + namespace)) {
                console.log(namespace + ' already init: ', item, options);
            } else {
                item.data('' + namespace, new Widget(item, options || {}));
            }
        }, this);
    };
})(window, jQuery, undefined);