/*! Imagex-Srcset - v0.0.2
 * Created by Elitex.
 */

(function (window, document, undefined) {
    'use strict';

    /**
     * SrcsetData
     */
    var SrcsetData = (function () {

        /* Images url */
        var url = 'http://d298edkwyoodbw.cloudfront.net/[id]/[type]/[size].jpg';

        /* All possible images */
        var sizes = {
            horizontal: {
                thumb: [240, 135], // [width, height]
                thumb2x: [480, 270],
                small: [720, 405],
                medium: [960, 540],
                big: [1200, 675],
                small2x: [1440, 810],
                medium2x: [1920, 1080],
                big2x: [2400, 1350]
            },
            extra: {
                thumb: [240, 120],
                thumb2x: [480, 240],
                small: [720, 360],
                medium: [960, 480],
                big: [1200, 600],
                small2x: [1440, 720],
                medium2x: [1920, 960],
                big2x: [2400, 1200]
            },
            square: {
                thumb: [60, 60],
                small: [90, 90],
                thumb2x: [120, 120],
                medium: [150, 150],
                small2x: [180, 180],
                big: [450, 450],
                medium2x: [720, 720],
                big2x: [960, 960]
            },
            vertical: {
                thumb: [75, 105],
                thumb2x: [150, 210],
                small: [225, 315],
                medium: [300, 420],
                small2x: [450, 630],
                medium2x: [600, 840],
                big: [750, 1050],
                big2x: [1500, 2100]
            },
            original: {
                thumb: [240, 0],
                thumb2x: [480, 0],
                small: [720, 0],
                medium: [960, 0],
                big: [1200, 0],
                small2x: [1440, 0],
                medium2x: [1920, 0],
                big2x: [2400, 0]
            }
        };


        function getWidth(fullScreen) {
            if (fullScreen) {
                return $window.innerWidth;
            }
            return +scope.width || element.prop('offsetWidth') || $window.innerWidth;
        }


        /**
         * SrcsetData
         *
         * @param {Element} element
         * @constructor
         */
        function SrcsetData(element) {
            this.element = element;
            this.id = element.getAttribute('data-srcset-id');
            this.type = this._getType();
        }

        /**
         * Get image url
         *
         * @param {String} size Image Size
         * @returns {String}
         */
        SrcsetData.prototype._getUrl = function (size) {
            var self = this;
            return url.replace(/\[id]/, self.id)
                .replace(/\[type]/, self.type)
                .replace(/\[size]/, size);
        };

        /**
         * Get image type
         *
         * @returns {String}
         */
        SrcsetData.prototype._getType = function () {
            var self = this;

            var viewport,
                ratio,
                type = self.element.getAttribute('data-srcset-type');

            if (type) {
                if (type === 'auto') {

                    viewport = new ViewPort();
                    ratio = viewport.width / viewport.height;

                    if (ratio > 1.3) {
                        return 'horizontal';
                    } else if (1 / ratio > 1.3) {
                        return 'vertical';
                    } else {
                        return 'square';
                    }

                } else if (sizes[type]) {
                    return type;
                }
            }

            return 'original';
        };

        /**
         * Get srcset array
         *
         * @returns {Array}
         */
        SrcsetData.prototype.getData = function () {
            var self = this;
            var srcsetData = [];

            if (sizes[self.type]) {
                for (var size in sizes[self.type]) {
                    srcsetData.push({
                        url: self._getUrl(size),
                        width: sizes[self.type][size][0] || Infinity,
                        height: sizes[self.type][size][1] || Infinity,
                        dpi: 1
                    });
                }
            }

            return srcsetData;
        };

        /**
         * Get srcset
         *
         * @returns {string}
         */
        SrcsetData.prototype.getSrcset = function () {
            var self = this;
            var srcsetData = self.getData();
            var srcset = srcsetData.map(function (data) {
                return data.url + ' ' + data.width + 'w';
            });

            return srcset.join(', ');
        };

        return SrcsetData;
    })();

    /**
     * ViewPort
     */
    var ViewPort = (function () {
        /**
         * ViewPort
         * @constructor
         */
        function ViewPort() {
            this.width = window.innerWidth || document.documentElement.clientWidth;
            this.height = window.innerHeight || document.documentElement.clientHeight;
            this.dpi = window.devicePixelRatio || 1;
        }

        return ViewPort;
    })();

    /**
     * SrcsetElement
     */
    var SrcsetElement = (function () {

        /**
         * SrcsetElement
         * @constructor
         */
        function SrcsetElement(element) {
            this.element = element;
            this.srcsetData = new SrcsetData(element);
            this.setSrcset();
        }

        /**
         * Set responsive image
         */
        SrcsetElement.prototype.setSrcset = function () {
            var self = this;

            if (self.element.tagName === 'IMG') {

                if ('srcset' in self.element) {
                    self.setSrcsetAttr();
                } else {
                    self.setSrc();
                }

            } else {
                self.setBackground();
            }

        };

        /**
         * Set srcset attribute
         */
        SrcsetElement.prototype.setSrcsetAttr = function () {
            var self = this;
            self.element.setAttribute('srcset', self.srcsetData.getSrcset());
        };

        /**
         * Set responsive background
         */
        SrcsetElement.prototype.setBackground = function () {
            var self = this;

            var closest = self.getBestCandidate();

            if (!closest || !closest.url) {
                console.log("No image found for %o", self.element);
                return;
            }

            self.element.style.backgroundImage = 'url(' + closest.url + ')';
        };

        /**
         * Set responsive image
         */
        SrcsetElement.prototype.setSrc = function () {
            var self = this;

            var closest = self.getBestCandidate();

            if (!closest || !closest.url) {
                console.log("No image found for %o", self.element);
                return;
            }

            if (self.element.getAttribute('src') === closest.url) {
                return;
            }

            self.element.setAttribute('src', closest.url);
        };

        /**
         * Parse srcset
         *
         * @param {String} [srcset]
         * @returns {Array}
         */
        SrcsetElement.prototype.parseSrcset = function (srcset) {
            var self = this;
            var reInt = /^\d+$/;
            var numberIsNan = Number.isNaN || function (value) {
                    return typeof value === 'number' && isNaN(value);
                };

            srcset = srcset || self.element.getAttribute('srcset');

            return srcset.split(',').map(function (el) {
                var ret = {
                    url: undefined,
                    width: Infinity,
                    height: Infinity,
                    dpi: 1
                };

                el.trim().split(/\s+/).forEach(function (el, i) {
                    if (i === 0) {
                        ret.url = el;
                        return el;
                    }

                    var value = el.substring(0, el.length - 1);
                    var postfix = el[el.length - 1];
                    var intVal = parseInt(value, 10);
                    var floatVal = parseFloat(value);

                    if (postfix === 'w' && reInt.test(value)) {
                        ret.width = intVal;
                    } else if (postfix === 'h' && reInt.test(value)) {
                        ret.height = intVal;
                    } else if (postfix === 'x' && !numberIsNan(floatVal)) {
                        ret.dpi = floatVal;
                    } else {
                        console.log('Invalid srcset descriptor: ' + el + '.');
                    }
                });

                return ret;
            });
        };

        /**
         * Get best image
         *
         * @returns {Object|*}
         */
        SrcsetElement.prototype.getBestCandidate = function () {
            var self = this;
            var candidates = self.srcsetData.getData();

            var images = candidates.slice(0),
                viewport = new ViewPort(),

                getBestCandidate = function (criteria) {
                    var i,
                        length = images.length,
                        best = images[0];

                    for (i = 0; i < length; i += 1) {

                        if (criteria(images[i], best)) {

                            best = images[i];
                        }
                    }

                    return best;
                },
                removeCandidate = function (criteria) {

                    var i, length = images.length;

                    for (i = length - 1; i >= 0; i -= 1) {

                        if (criteria(images[i])) {

                            images.splice(i, 1);
                        }
                    }
                };

            if (images.length === 0) {
                return null;
            }

            var largestWidth = getBestCandidate(function (a, b) {
                return a.width > b.width;
            });
            removeCandidate(function (a) {
                return a.width < viewport.width;
            });

            if (images.length === 0) {
                images = [largestWidth];
            }

            var largestHeight = getBestCandidate(function (a, b) {
                return a.height > b.height;
            });
            removeCandidate(function (a) {
                return a.height < viewport.height;
            });

            if (images.length === 0) {
                images = [largestHeight];
            }

            var largestPixelRatio = getBestCandidate(function (a, b) {
                return a.dpi > b.dpi;
            });
            removeCandidate(function (a) {
                return a.dpi < viewport.dpi;
            });

            if (images.length === 0) {
                images = [largestPixelRatio];
            }

            var smallestWidth = getBestCandidate(function (a, b) {
                return a.width < b.width;
            });
            removeCandidate(function (a) {
                return a.width > smallestWidth.width;
            });

            var smallestHeight = getBestCandidate(function (a, b) {
                return a.height < b.height;
            });
            removeCandidate(function (a) {
                return a.height > smallestHeight.height;
            });

            var smallestPixelRatio = getBestCandidate(function (a, b) {
                return a.dpi < b.dpi;
            });
            removeCandidate(function (a) {
                return a.dpi > smallestPixelRatio.dpi;
            });

            return images[0];
        };


        return SrcsetElement;
    })();

    /**
     * imagexSrcset
     *
     * @param {Element|Array<element>} [elements]
     */
    function imagexSrcset(elements) {
        var colections = [];

        if (elements) {
            if (elements.nodeType === 1) {
                colections = [elements];
            } else if (elements.length) {
                colections = elements;
            }
        } else {
            colections = document.querySelectorAll("[data-srcset-id]");
        }

        for (var i = 0; i < colections.length; i++) {
            new SrcsetElement(colections[i]);
        }

    }

    /**
     * EventListener
     *
     * @param {Element} obj
     * @param {String} evt
     * @param {Function} fn
     * @param {Boolean} [capture]
     */
    function on(obj, evt, fn, capture) {
        if (obj.addEventListener) {
            obj.addEventListener(evt, fn, capture || false);
        } else if (obj.attachEvent) {
            obj.attachEvent("on" + evt, fn);
        }
    }

    /**
     * Debounce
     *
     * @param {Function} func
     * @param {Number} wait
     * @returns {Function}
     */
    function debounce(func, wait) {
        var timeout, timestamp;
        var later = function () {
            var last = (new Date()) - timestamp;

            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                func();
            }
        };

        return function () {
            timestamp = new Date();

            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
        };
    }

    on(window, "resize", debounce(imagexSrcset, 50));

    /* expose imagexSrcset */
    window.imagexSrcset = imagexSrcset;

    /* expose imagexSrcset */
    if (typeof module === "object" && typeof module.exports === "object") {
        // CommonJS, just export
        module.exports = imagexSrcset;
    } else if (typeof define === "function" && define.amd) {
        // AMD support
        define("imagexSrcset", function () {
            return imagexSrcset;
        });
    }

})(window, document);
