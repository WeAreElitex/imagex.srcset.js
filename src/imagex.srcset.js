/*! Imagex-Srcset - v0.0.1
 * Created by Elitex.
 */

(function (window, document, undefined) {
    'use strict';

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

    /**
     * Get image url
     *
     * @param {String} id Image id
     * @param {String} type Image type
     * @param {String} size Image Size
     * @returns {String}
     */
    function getUrl(id, type, size) {
        return url.replace(/\[id]/, id)
            .replace(/\[type]/, type)
            .replace(/\[size]/, size);
    }

    /**
     * Get srcset array
     *
     * @param {String} id Image id
     * @param {String} [type] Image type
     * @returns {Array}
     */
    function getSrcsetData(id, type) {
        var srcsetData = [];
        type = type || 'original';

        if (sizes[type]) {
            for (var size in sizes[type]) {
                srcsetData.push({
                    url: getUrl(id, type, size),
                    width: sizes.original[size][0] || Infinity,
                    height: sizes.original[size][1] || Infinity,
                    dpi: 1
                });
            }
        }

        return srcsetData;
    }

    /**
     * Get srcset
     *
     * @param {String} id Image id
     * @returns {string}
     */
    function getSrcset(id) {
        var srcsetData = getSrcsetData(id);
        var srcset = srcsetData.map(function (data) {
            return data.url + ' ' + data.width + 'w';
        });

        return srcset.join(', ');
    }

    /**
     * Set responsive image
     *
     * @param {Element} element
     */
    function setSrcset(element) {

        var imageId = element.getAttribute('data-srcset-id');

        if (element.tagName === 'IMG') {

            if ('srcset' in element) {
                element.setAttribute('srcset', getSrcset(imageId));
            } else {
                setSrc(element, getSrcsetData(imageId));
            }

        } else {
            setBackground(element, getSrcsetData(imageId));
        }


    }

    /**
     * Set responsive background
     *
     * @param {Element} element
     * @param {Array} data Srcset data
     */
    function setBackground(element, data) {
        updateBackground(element, data);
    }

    /**
     * Update background
     *
     * @param {Element} element
     * @param {Array} data
     */
    function updateBackground(element, data) {

        var closest = getBestCandidate(data);

        if (!closest || !closest.url) {
            console.log("No image found for %o", element);
            return;
        }

        element.style.backgroundImage = 'url(' + closest.url + ')';
    }

    /**
     * Set responsive image
     *
     * @param {Element} element
     * @param {Array} [data]
     */
    function setSrc(element, data) {

        data = data || parseSrcset(element.getAttribute('srcset'));

        if (data.length === 0) {
            console.log("Couldn't parse srcset data for %o", element);
            return;
        }

        updateSrc(element, data);
    }

    /**
     * Update image src
     *
     * @param {Element} img
     * @param {Array} data
     */
    function updateSrc(img, data) {

        var closest = getBestCandidate(data);

        if (!closest || !closest.url) {
            console.log("No src found for %o", img);
            return;
        }

        if (img.getAttribute('src') === closest.url) {
            return;
        }

        img.setAttribute('src', closest.url);

    }

    /**
     * Parse srcset
     *
     * @param {String} str
     * @returns {Array}
     */
    function parseSrcset(str) {
        var reInt = /^\d+$/;
        var numberIsNan = Number.isNaN || function (value) {
                return typeof value === 'number' && isNaN(value);
            };
        return str.split(',').map(function (el) {
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
    }

    /**
     * Get best image
     *
     * @param {Array} candidates
     * @returns {Object|*}
     */
    function getBestCandidate(candidates) {

        var images = candidates.slice(0),
            width = window.innerWidth || document.documentElement.clientWidth,
            height = window.innerHeight || document.documentElement.clientHeight,
            dpi = window.devicePixelRatio || 1,

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
            return a.width < width;
        });

        if (images.length === 0) {
            images = [largestWidth];
        }

        var largestHeight = getBestCandidate(function (a, b) {
            return a.height > b.height;
        });
        removeCandidate(function (a) {
            return a.height < height;
        });

        if (images.length === 0) {
            images = [largestHeight];
        }

        var largestPixelRatio = getBestCandidate(function (a, b) {
            return a.dpi > b.dpi;
        });
        removeCandidate(function (a) {
            return a.dpi < dpi;
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
    }

    /**
     * imagexSrcset
     *
     * @param {Element|Array} [elements]
     */
    function imagexSrcset(elements) {
        var colections;

        if (elements) {
            if (Array.isArray(elements)) {
                colections = elements;
            } else {
                colections = [elements];
            }
        } else {
            colections = document.querySelectorAll("[data-srcset-id]");
        }


        for (var i = 0; i < colections.length; i++) {
            setSrcset(colections[i]);
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
