/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


/**
 * 
 * @returns {i18n}
 */
function i18n() {

    /**
     * 
     * @param {DOMElement} element
     * @param {String} sentence
     */
    this.replace = function (element, sentence) {
        if (element) {
            element.innerHTML = sentence;
        }
    };

    /**
     * 
     * @returns {String} Language of the client browser
     */
    this.getLocale = function () {
        return navigator.language || "en";
    };

    /**
     * 
     * @param {String} locale
     */
    this.getLocaleFile = function (locale) {
        var self = this;
        var req = new XMLHttpRequest();
        req.open('GET', '/locales/' + locale + '.json', true);
        req.onreadystatechange = function (e) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    var data = req.responseText;
                    if (data || data !== "") {
                        self.translateHTML(JSON.parse(data));
                    } else {
                        self.getLocaleFile("en");
                    }
                } else {
                    self.getLocaleFile("en");
                }
            }
        };
        req.send(null);
    };

    /**
     * 
     * @param {Array} table
     */
    this.translateHTML = function (table) {
        var elements = document.querySelectorAll('*[data-i18n]');
        for (var i = 0, last = elements.length; i < last; i++) {
            var element = elements[i];
            var index = element.getAttribute("data-i18n");
            var sentence = table[index];
            if (sentence) {
                this.replace(element, sentence);
            } else {
                this.replace(element, index.toString());
            }
        }
    };
    
    this.switchLocale = function(){
        if (this.locale === "en") {
            this.locale = "fr";
        } else {
            this.locale = "en";
        }
        this.translate(this.locale);
    };

    /**
     * 
     * @param {String} locale
     * @returns {undefined}
     */
    this.translate = function (locale) {
        this.locale = this.getLocale();
        if (locale) {
            this.locale = locale;
        }
        this.getLocaleFile(this.locale);
    };

    return this;
}