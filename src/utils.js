/* global namespace */

const Utils = {
    tmpl:
    `<div class="${namespace} ${namespace}_active" tabindex="1">
        <div class="${namespace}__box">
            <div class="${namespace}__current-text"></div>
            <div class="${namespace}__arrow"></div>
        </div>
        <div class="${namespace}__drop">
            <input class="${namespace}__search" type=и"text" tabindex="-1" />
            <ul class="${namespace}__options"></ul>
        </div>
    </div>`,

    doTmpl(tmpl) {
        let div = document.createElement('div');
        div.innerHTML = tmpl;
        return $(div.firstChild);
    },

    forEach(obj, callback, ctx) {
        for (let i = 0, ilen = obj.length; i < ilen; i++) {
            if (callback.call(ctx, obj[i], i) === false) {
                break;
            }
        }
    },

    each(obj, callback, ctx) {
        for (let i = 0, ilen = obj.length; i < ilen; i++) {
            if (callback.call(ctx, obj.eq(i), i) === false) {
                break;
            }
        }
    },

    toArray(nodeList) {
        let arr = [];

        Utils.forEach(nodeList, item => {
            arr.push(item);
        });

        return arr;
    },

    cacheObjects(el) {
        let selectCtx = el;
        let chosenCtx = Utils.doTmpl(Utils.tmpl);
        let options = Utils.toArray(selectCtx.get(0).getElementsByTagName('OPTION'));
        let index = selectCtx.get(0).selectedIndex;
        let select = {
            ctx: selectCtx,
            options: options,
            selected: $(options[index >= 0 ? index : 0])
        };
        let chosen = {
            ctx: chosenCtx,
            search: chosenCtx.find(`.${namespace}__search`),
            box: chosenCtx.find(`.${namespace}__box`),
            drop: chosenCtx.find(`.${namespace}__drop`),
            currentText: chosenCtx.find(`.${namespace}__current-text`),
            list: chosenCtx.find(`.${namespace}__options`),
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

    getListTmp(list, offset) {
        let tmp = '';

        Utils.forEach(list, item => {
            tmp += `<li class="${namespace}__item b-hidden" data-original-index="` + offset + '" data-index="' + offset + '">' + item.innerHTML + '</li>';
            offset++;
        });

        return tmp;
    },

    setParams(settings) {
        let params = {
            listOverflow: true
        };

        return $.extend(params, settings);
    }
};
