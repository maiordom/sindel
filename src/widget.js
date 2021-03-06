/* global namespace Utils */

class Widget {
    constructor(el, settings) {
        this.init(el, settings);

        return {
            destroy: this.destroy.bind(this),
            update: this.update.bind(this)
        };
    }

    init(el, settings) {
        this.doc = $(document);
        this.isOpen = null;
        this.isMouseleave = false;

        this.params = Utils.setParams(settings);
        let nodes = Utils.cacheObjects(el);
        this.chosen = nodes.chosen;
        this.select = nodes.select;

        this.render();
        this.selectInitialItem();
        this.closeWidget();
        this.bindEvents();
    }

    render() {
        this.chosen.list.html(Utils.getListTmp(this.select.options, 0));
        this.chosen.items = this.chosen.ctx.find(`.${namespace}__item`);

        this.select.ctx.attr('tabindex', -1);
        this.chosen.search.attr('placeholder', 'или введите другой');
        this.select.ctx.addClass('b-hidden');

        if (this.params.listOverflow) {
            this.chosen.list.addClass(`${namespace}__list_overflow`);
        }
    }

    selectInitialItem() {
        let value;

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
    }

    selectByIndex(index) {
        this.selectItem(this.chosen.items.eq(index));
    }

    update() {
        let index = this.select.ctx.get(0).selectedIndex;
        this.selectByIndex(index);
    }

    bindEvents() {
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

    onCtxFocus() {
        this.chosen.ctx.addClass(`${namespace}_focus`);
    }

    onCtxFocusout() {
        this.chosen.ctx.removeClass(`${namespace}_focus`);
    }

    onCtxMouseenter() {
        this.isMouseleave = false;
        this.chosen.ctx.addClass(`${namespace}_hover`);
    }

    onCtxMouseleave() {
        this.isMouseleave = true;
        this.isOpen ? this.chosen.search.focus() : null;
        this.chosen.ctx.removeClass(`${namespace}_hover`);
    }

    onSearchKeydown(e) {
        if (~[27, 38, 40, 13].indexOf(e.keyCode)) {
            if (!this.isOpen) {
                this.chosen.ctx.removeClass(`${namespace}_focus`);
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

    onEscClose() {
        this.closeWidget();
    }

    onSearchKeyup(e) {
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

    onBoxMousedown() {
        this.chosen.ctx.removeClass(`${namespace}_focus`);
        this.chosen.ctx.addClass(`${namespace}_pressed`);
        this.doc.off('click.chosen');
        this.doc.on('click.chosen', this.onDocClick.bind(this));
        return false;
    }

    onBoxClick(e) {
        if (this.isOpen) {
            this.closeWidget();
        } else {
            this.openWidget();
        }
    }

    onDocClick() {
        if (this.isMouseleave) {
            this.doc.off('click.chosen');
            this.chosen.ctx.removeClass(`${namespace}_focus`);
            this.closeWidget();
        }

        this.chosen.ctx.removeClass(`${namespace}_pressed`);
    }

    onSearchBlur() {
        if (this.isMouseleave) {
            this.closeWidget();
        }

        this.chosen.ctx.removeClass(`${namespace}_focus`);
    }

    onItemClick(e) {
        let item = $(e.target);

        if (item.hasClass(`${namespace}__item`)) {
            this.selectItem(item);
            this.closeWidget();
            e.stopPropagation();
        }
    }

    onItemMouseover(e) {
        let item = $(e.target);

        if (!item.hasClass(`${namespace}__item`) || item.hasClass('b-hidden')) {
            return false;
        }

        if (!item.hasClass(`${namespace}__item_active`)) {
            this.unselect();
            this.chosen.hovered = item;
            item.addClass(`${namespace}__item_active`);
        }
    }

    onItemMouseout(e) {
        if ($(e.target).hasClass(`${namespace}__item_active`)) {
            this.unselect();
        }
    }

    findAndSelectMatches() {
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

    unselect() {
        this.chosen.selected.removeClass(`${namespace}__item_active`);
        this.chosen.hovered.removeClass(`${namespace}__item_active`);
    }

    getCurrentItem() {
        if (this.chosen.hovered.hasClass(`${namespace}__item_active`)) {
            return this.chosen.hovered;
        } else if (this.chosen.selected.hasClass(`${namespace}__item_active`)) {
            return this.chosen.selected;
        }

        return null;
    }

    selectItemByInter() {
        let item = this.getCurrentItem();

        if (item) {
            this.onItemClick(new $.Event('click', {
                target: item.get(0)
            }));
        }
    }

    getIndex(offset) {
        let item = this.getCurrentItem();

        if (item) {
            return parseInt(item.attr('data-index'), 10);
        }

        return parseInt(this.chosen.selected.attr('data-index'), 10) - 1;
    }

    navigate(offset) {
        let index = this.getIndex();
        let newIndex = index + offset;
        let length = this.chosen.matches.length;
        let item;

        this.unselect();

        if (newIndex <= -1) {
            item = this.chosen.matches.eq(length - 1).addClass(`${namespace}__item_active`);
        } else if (newIndex <= length - 1) {
            item = this.chosen.matches.eq(newIndex).addClass(`${namespace}__item_active`);
        } else if (newIndex >= length) {
            item = this.chosen.matches.eq(0).addClass(`${namespace}__item_active`);
        }

        this.scrollTo(item.get(0));
        this.chosen.hovered = item;
    }

    scrollTo(item) {
        let list = this.chosen.list.get(0);
        let maxHeight = list.offsetHeight;
        let visibleTop = list.scrollTop;
        let visibleBottom = maxHeight + visibleTop;
        let highTop = item.offsetTop;
        let highBottom = highTop + item.offsetHeight;

        if (highBottom >= visibleBottom) {
            list.scrollTop = (highBottom - maxHeight) > 0 ? highBottom - maxHeight : 0;
        } else if (highTop < visibleTop) {
            list.scrollTop = highTop;
        }
    }

    findSearchMatches() {
        let value = this.chosen.search.val().toLocaleLowerCase();
        let arr = this.chosen.items;
        let i = 0;
        let searchIndex;
        let matches = [];

        Utils.each(arr, function(item, index) {
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

    showItems() {
        Utils.each(this.chosen.items, function(item, index) {
            item.removeClass('b-hidden').attr('data-index', index);
        }, this);

        this.chosen.matches = this.chosen.items;
    }

    openWidget() {
        this.isOpen = true;
        this.chosen.ctx.removeClass(`${namespace}_focus`).addClass(`${namespace}_active`);
        this.showItems();
        this.chosen.search.val('');
        this.chosen.search.focus();
        this.chosen.hovered.removeClass(`${namespace}__item_active`);
        this.chosen.selected = this.chosen.selected.hasClass('b-hidden') ? this.chosen.items.eq(0) : this.chosen.selected;
        this.chosen.selected.addClass(`${namespace}__item_active`);
        this.scrollTo(this.chosen.selected.get(0));
    }

    closeWidget() {
        this.isOpen = false;
        this.chosen.ctx.removeClass(`${namespace}_active`);
        this.chosen.ctx.removeClass(`${namespace}_hover`);
    }

    selectItem(item) {
        this.unselect();
        this.chosen.selected.removeClass(`${namespace}__item_selected`);
        this.chosen.selected = item.addClass(`${namespace}__item_selected`);
        this.chosen.currentText.html(this.chosen.selected.html());
        this.select.ctx.get(0).selectedIndex = parseInt(this.chosen.selected.attr('data-original-index'), 10);
    }

    destroy() {
        this.doc.off('click.chosen');
        this.select.ctx.removeClass('b-hidden');
        this.chosen.ctx.remove();
    }
};

$.fn.sindel = function(options) {
    Utils.each(this, function(item) {
        if (item.data(`${namespace}`)) {
            console.log(`${namespace} already init: `, item, options);
        } else {
            item.data(`${namespace}`, new Widget(item, options || {}));
        }
    }, this);
};
