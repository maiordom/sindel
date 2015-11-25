const Utils = {
    tmpl:
    `<div class="${namespace} ${namespace}_active">
        <div class="${namespace}__box">
            <div class="${namespace}__current-text"></div>
            <div class="${namespace}__arrow"></div>
        </div>
        <div class="${namespace}__drop">
            <div class="${namespace}__drop-inner">
                <ul class="${namespace}__majors"></ul>
                <input class="${namespace}__search" type="text" tabindex="-1" />
                <ul class="${namespace}__minors"></ul>
            </div>
        </div>
    </div>`,

    doTmpl: function(tmpl) {
        let div = document.createElement('div');
        div.innerHTML = tmpl;
        return $(div.firstChild);
    },

    forEach: function(obj, callback, ctx) {
        for (let i = 0, ilen = obj.length; i < ilen; i++)
            if (callback.call(ctx, obj[i], i) === false) {
                break;
            }
    },

    each: function(obj, callback, ctx) {
        for (let i = 0, ilen = obj.length; i < ilen; i++)
            if (callback.call(ctx, obj.eq(i), i) === false) {
                break;
            }
    },

    toArray: function(nodeList) {
        let arr = [];

        Utils.forEach(nodeList, function(item, index) {
            arr.push(item);
        });

        return arr;
    },

    cacheObjects: function(el) {
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
            majorsList: chosenCtx.find(`.${namespace}__majors`),
            minorsList: chosenCtx.find(`.${namespace}__minors`),
            newItems: $(),
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

    getListTmp: function(list, offset) {
        let tmp = '';

        Utils.forEach(list, function(item, index) {
            tmp += `<li class="${namespace}__item b-hidden" data-original-index="` + offset + '" data-index="' + offset + '">' + item.innerHTML + '</li>';
            offset++;
        });

        return tmp;
    },

    setParams: function(settings) {
        let params = {
            majorsCount: 0,
            minorsListOverflow: true,
            searchLimit: null
        };

        return $.extend(params, settings);
    }
};
