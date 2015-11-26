'use strict';

const webdriver = require('webdriverio');
const expect = require('chai').expect;
const URL = 'http://localhost:3001/demo';
const unicodeChars = require('webdriverio/lib/utils/unicodeChars');

let options = {
    desiredCapabilities: {
        browserName: 'chrome'
    }
};

let client;

describe('Функциональные тесты для Sindel', function() {
    beforeEach(function() {
        client = webdriver.remote(options);

        client.addCommand('closeSelect', function() {
            return client.click('body')
                .waitUntil(function() {
                    return this.execute(function() {
                        return parseInt($('.sinde:first-child .sindel__drop').css('left'), 10) !== 0;
                    });
                }, 3000);
        });

        client.addCommand('openSelect', function() {
            return client
                .url(URL)
                .waitForVisible('.sindel:first-child', 3000)
                .click('.sindel:first-child')
                .waitUntil(function() {
                    return this.execute(function() {
                        return parseInt($('.sindel:first-child .sindel__drop').css('left'), 10) === 0;
                    });
                }, 3000);
        });

        return client.init();
    });

    afterEach(function() {
        return client.end();
    });

    it('При клике на контрол открывается список', function() {
        return client.openSelect()
            .then(function(res) {
                expect(res.value).to.be.true;
            })
            .closeSelect()
            .then(function (res) {
                expect(res.value).to.be.true;
            });
    });

    it('При вводе текста в поисквой строке находится совпадение', function() {
        return client.openSelect()
            .setValue('.sindel:first-child .sindel__search', 'Москва')
            .getText('.sindel:first-child .sindel__item:first-child')
            .then(function (text) {
                expect(text).to.equal('Москва');
            })
            .closeSelect()
            .then(function (res) {
                expect(res.value).to.be.true;
            });
    });

    it('При клике на элемент списка селект меняет свое значение', function() {
        return client.openSelect()
            .click('.sindel:first-child .sindel__item:first-child')
            .getText('.sindel:first-child .sindel__current-text')
            .then(function (text) {
                expect(text).to.equal('Москва');
            })
            .closeSelect()
            .then(function(res) {
                expect(res.value).to.be.true;
            });
    });

    it('Работает навигация стрелками', function() {
        var selectedItemValue;

        return client.openSelect()
            .keys(unicodeChars.Arrow_Down)
            .execute(function() {
                selectedItemValue = $('.sindel:eq(0) .sindel__item_active').text();
            })
            .keys(unicodeChars.Enter)
            .getText('.sindel:first-child .sindel__current-text')
            .then(function(res) {
                expect(res.value).to.equal(selectedItemValue);
            });
    });
});
