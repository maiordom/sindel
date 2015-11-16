var Widget = function(el, settings) {
    this.init(el, settings);

    return {
        destroy: this.destroy.bind(this),
        update: this.update.bind(this)
    };
};

Widget.prototype = {
    init: function(el, settings) {
        var nodes;

        this.doc = $(document);
        this.isOpen = null;
        this.isMouseleave = false;
        this.params = {};
        this.select = {};
        this.chosen = {};

        this.params = Utils.setParams(settings);
        nodes = Utils.cacheObjects(el);
        this.chosen = nodes.chosen;
        this.select = nodes.select;

        this.render(this.replaceItems());
        this.selectInitialItem();
        this.closeWidget();
        this.bindEvents();
    },

    replaceItems: function() {
        var majors = this.select.options.slice(0, this.params.majorsCount),
            minors = this.select.options.slice(this.params.majorsCount);

        return {
            majors: majors,
            minors: minors
        };
    },

    render: function(data) {
        this.chosen.majorsList.html(Utils.getListTmp(data.majors, 0));
        this.chosen.minorsList.html(Utils.getListTmp(data.minors, data.majors.length));

        this.chosen.items = this.chosen.ctx.find('.sindel__item');

        this.chosen.box.attr('tabindex', this.select.ctx.attr('tabindex'));
        this.select.ctx.attr('tabindex', -1);
        this.chosen.search.attr('placeholder', 'или введите другой');
        this.chosen.search.css({
            width: this.chosen.drop.outerWidth() - 18 + 'px'
        });
        this.chosen.ctx.css({
            width: this.select.ctx.outerWidth() + 'px'
        });
        this.select.ctx.addClass('b-hidden');

        if (this.params.minorsListOverflow) {
            this.chosen.minorsList.addClass('sindel__minors_overflow');
        }

        if (!this.params.searchLimit) {
            this.params.searchLimit = data.minors.length;
        }
    },

    selectInitialItem: function() {
        var res, value;

        if (this.select.selected.length) {
            value = this.select.selected.html();

            Utils.each(this.chosen.items, function(item, index) {
                if (item.html() === value) {
                    this.selectItem(item);
                    return false;
                }
            }, this);
        } else {
            this.selectByIndex(0);
        }
    },

    selectByIndex: function(index) {
        this.selectItem(this.chosen.items.eq(index));
    },

    update: function() {
        var index = this.select.ctx.get(0).selectedIndex;
        this.selectByIndex(index);
    },

    bindEvents: function() {
        this.chosen.search.on('keydown', this.onSearchKeydown.bind(this));
        this.chosen.search.on('keyup', this.onSearchKeyup.bind(this));
        this.chosen.search.on('blur', this.onSearchBlur.bind(this));
        this.chosen.ctx.on('mouseover', this.onItemMouseover.bind(this));
        this.chosen.ctx.on('mouseout', this.onItemMouseout.bind(this));
        this.chosen.ctx.on('mouseenter', this.onCtxMouseenter.bind(this));
        this.chosen.ctx.on('mouseleave', this.onCtxMouseleave.bind(this));
        this.chosen.ctx.on('click', this.onItemClick.bind(this));
        this.chosen.box.on('mousedown', this.onBoxMousedown.bind(this));
        this.chosen.box.on('focus', this.onBoxFocus.bind(this));
    },

    onBoxFocus: function() {
        this.chosen.ctx.addClass('sindel_focus');
        this.chosen.search.focus();
    },

    onCtxMouseenter: function(e) {
        this.isMouseleave = false;
    },

    onCtxMouseleave: function(e) {
        this.isMouseleave = true;
        this.isOpen ? this.chosen.search.focus() : null;
    },

    onSearchKeydown: function(e) {
        if (~[27, 38, 40, 13].indexOf(e.keyCode)) {
            if (!this.isOpen) {
                this.chosen.ctx.removeClass('sindel_focus');
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
    },

    onEscClose: function() {
        this.closeWidget();
    },

    onSearchKeyup: function(e) {
        switch (e.keyCode) {
            case 27:
            case 38:
            case 40:
            case 13:
                break;
            default:
                this.findAndSelectMatches();
        }
    },

    onBoxMousedown: function(e) {
        this.doc.unbind('click.chosen');
        this.chosen.ctx.removeClass('sindel_focus');
        this.displayDrop();
        this.doc.click(this.onDocClick.bind(this));
        return false;
    },

    onDocClick: function() {
        if (this.isMouseleave) {
            this.doc.unbind('click.chosen');
            this.chosen.ctx.removeClass('sindel_focus');
            this.closeWidget();
        }
    },

    onSearchBlur: function(e) {
        if (this.isMouseleave) {
            this.closeWidget();
        }

        this.chosen.ctx.removeClass('sindel_focus');
    },

    onItemClick: function(e) {
        var item = $(e.target);

        if (item.hasClass('sindel__item')) {
            this.chosen.ctx.addClass('sindel_focus');
            this.selectItem(item);
            this.closeWidget();
        }
    },

    onItemMouseover: function(e) {
        var item = $(e.target);

        if (!item.hasClass('sindel__item') || item.hasClass('b-hidden')) {
            return false;
        }

        if (!item.hasClass('sindel__item_active')) {
            this.unselect();
            this.chosen.hovered = item;
            item.addClass('sindel__item_active');
        }
    },

    onItemMouseout: function(e) {
        if ($(e.target).hasClass('sindel__item_active')) {
            this.unselect();
        }
    },

    findAndSelectMatches: function() {
        this.chosen.minorsList.get(0).scrollTop = 0;

        this.chosen.search.val() ? this.findSearchMatches() : this.showItems();

        if (this.chosen.matches.length) {
            this.onItemMouseover({
                target: this.chosen.matches[0]
            });
        } else {
            this.unselect();
        }
    },

    unselect: function() {
        this.chosen.selected.removeClass('sindel__item_active');
        this.chosen.hovered.removeClass('sindel__item_active');
    },

    getCurrentItem: function() {
        return this.chosen.hovered.hasClass('sindel__item_active') ? this.chosen.hovered :
            this.chosen.selected.hasClass('sindel__item_active') ? this.chosen.selected : null;
    },

    selectItemByInter: function() {
        var item = this.getCurrentItem();

        if (item) {
            this.onItemClick({
                target: item.get(0)
            });
        }
    },

    getIndex: function(offset) {
        var item = this.getCurrentItem();

        return item ?
            parseInt(item.attr('data-index'), 10) :
            parseInt(this.chosen.selected.attr('data-index'), 10) - 1;
    },

    navigate: function(offset) {
        var index = this.getIndex(),
            new_index = index + offset,
            length = this.chosen.newItems.length,
            item;

        this.unselect();

        if (new_index <= -1) {
            item = this.chosen.newItems.eq(length - 1).addClass('sindel__item_active');
        } else if (new_index <= length - 1) {
            item = this.chosen.newItems.eq(new_index).addClass('sindel__item_active');
        } else if (new_index >= length) {
            item = this.chosen.newItems.eq(0).addClass('sindel__item_active');
        }

        this.scrollTo(item.get(0));
        this.chosen.hovered = item;
    },

    scrollTo: function(item) {
        var list = this.chosen.minorsList.get(0),
            max_height = list.offsetHeight,
            visible_top = list.scrollTop,
            visible_bottom = max_height + visible_top,
            high_top = item.offsetTop,
            high_bottom = high_top + item.offsetHeight;

        if (high_bottom >= visible_bottom) {
            list.scrollTop = (high_bottom - max_height) > 0 ? high_bottom - max_height : 0;
        } else if (high_top < visible_top) {
            return list.scrollTop = high_top;
        }
    },

    findSearchMatches: function() {
        var value = this.chosen.search.val().toLocaleLowerCase(),
            arr = this.chosen.items.slice(this.params.majorsCount),
            i = this.params.majorsCount,
            search_index, matches = [];

        this.chosen.newItems = this.chosen.items.slice(0, this.params.majorsCount);

        Utils.each(arr, function(item, index) {
            search_index = item.html().toLowerCase().search(value);

            if (matches.length >= this.params.searchLimit || search_index === -1) {
                item.removeAttr('data-index').addClass('b-hidden');
            } else if (search_index >= 0) {
                matches.push(item.get(0));
                item.removeClass('b-hidden').attr('data-index', i++);
            }
        }, this);

        this.chosen.matches = matches;
        this.chosen.newItems = this.chosen.newItems.add(matches);
    },

    showItems: function() {
        Utils.each(this.chosen.items, function(item, index) {
            if (index < this.params.majorsCount + this.params.searchLimit) {
                item.removeClass('b-hidden').attr('data-index', index);
            } else {
                item.removeAttr('data-index').addClass('b-hidden');
            }
        }, this);

        this.chosen.newItems = this.chosen.items.slice(0, this.params.majorsCount + this.params.searchLimit);
        this.chosen.matches = this.chosen.items.slice(this.params.majorsCount).get();
    },

    displayDrop: function() {
        !this.isOpen ? this.openWidget() : this.closeWidget();
    },

    openWidget: function() {
        this.isOpen = true;
        this.chosen.ctx.removeClass('sindel_focus').addClass('sindel_active');
        this.showItems();
        this.chosen.search.val('');
        this.chosen.search.focus();
        this.chosen.hovered.removeClass('sindel__item_active');
        this.chosen.selected = this.chosen.selected.hasClass('b-hidden') ? this.chosen.items.eq(0) : this.chosen.selected;
        this.chosen.selected.addClass('sindel__item_active');
        this.scrollTo(this.chosen.selected.get(0));
    },

    closeWidget: function() {
        this.isOpen = false;
        this.chosen.ctx.removeClass('sindel_active');
    },

    selectItem: function(item) {
        this.unselect();
        this.chosen.selected = item.addClass('sindel__item_active');
        this.chosen.currentText.html(this.chosen.selected.html());
        this.select.ctx.get(0).selectedIndex = parseInt(this.chosen.selected.attr('data-original-index'), 10);
    },

    destroy: function() {
        this.doc.off('click.chosen');
        this.select.ctx.removeClass('b-hidden');
        this.chosen.ctx.remove();
    }
};

$.fn.sindel = function(options) {
    Utils.each(this, function(item) {
        if (item.data('sindel')) {
            console.log('sindel already init: ', item, options);
        } else {
            item.data('sindel', new Widget(item, options || {}));
        }
    }, this);
};
