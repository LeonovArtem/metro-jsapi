ymaps.modules.define('transportMap.Annotation', [
    'util.extend',
    'util.augment',
    'geometry.Point',
    'Placemark',
    'layout.storage',
    'templateLayoutFactory'
], function (provide, extend, augment, PointGeometry, Placemark, layoutStorage, layoutFactory) {
    function Annotation(position, properties, options) {
        Annotation.superclass.constructor.call(
            this,
            position,
            extend({
                arrowColor: this._getArrowColor(properties.iconColor),
                textColor: this._getTextColor(properties.iconColor)
            }, properties),
            extend({
                iconLayout: 'transportMap#annotation'
            }, options)
        );

    }
    augment(Annotation, Placemark, {
        /**
         * Fetch R G B A values from any CSS color units: hex, rgba, hsl etc
         *
         * @param {String} color
         *
         * @returns {Array} rgba values
         */
        _getRGBA: function (color) {
            var canvas;

            if (!this._ctx) {
                canvas = document.createElement('canvas');
                canvas.width = canvas.height = 1;
                this._ctx = canvas.getContext('2d');
            }

            this._ctx.clearRect(0, 0, 1, 1);
            this._ctx.fillStyle = color;
            this._ctx.fillRect(0, 0, 1, 1);

            return Array.prototype.slice.apply(this._ctx.getImageData(0, 0, 1, 1).data);
        },
        /**
         * 10% darker arrow color, then base color
         */
        _getArrowColor: function (color) {
            var rgba = this._getRGBA(color).map(function (color) {
                return Math.floor(color * 0.9);
            });
            rgba[3] = 1;

            return 'rgba(' + rgba + ')';
        },
        /**
         * White or black, depending on the base color
         *
         * @param {Array} rgb color
         *
         * @returns {String} css color
         */
        _getTextColor: function (color) {
            var rgba = this._getRGBA(color),
                blackColor = 'rgba(0, 0, 0, 0.9)',
                whiteColor = 'white';

            return (rgba[0] + rgba[1] + rgba[2]) / 3 > 128 ? blackColor:whiteColor;
        }
    });

    /**
     * Build inlined style from css properties map
     *
     * @param {Object} style
     *
     * @returns {String}
     */
    function getInlineStyle(style) {
        var propName, tokens = [];

        for (propName in style) {
            if (style.hasOwnProperty(propName)) {
                tokens.push(propName + ':' + style[propName]);
            }
        }
        return tokens.join(';');
    }

    var annotationStyle = {
            'overflow': 'hidden',
            'position': 'absolute',
            'left': '{{ options.offset.0|default:"-71" }}px',
            'top': '{{ options.offset.1|default:"-108" }}px',
            'height': '110px'
        },
        contentStyle = {
            'color': '{{ properties.textColor|default:"black"}}',
            'font-family': 'Arial,Helvetica,sans-serif',
            'background': '{{ properties.iconColor|default:"white" }}',
            'white-space': 'nowrap',
            'display': 'block',
            'padding': '10px'
        },
        arrowStyle = ['-moz-', '-webkit-', '-o-', '-ms-', ''].reduce(function (map, prefix) {
            map[prefix + 'transform'] = 'rotate(45deg) skewX(75deg)';
            return map;
        }, {
            'position': 'absolute',
            'content': '',
            'width': '100px',
            'height': '100px',
            'background-color': '{{ properties.arrowColor|default:"white" }}',
            'left': '-110px',
            'top': '-143px',
            'z-index': -1
        });

    layoutStorage.add('transportMap#annotation', layoutFactory.createClass(
        '<ymaps class="ymaps-tm-annotation" style="' + getInlineStyle(annotationStyle) + '">' +
            '<ymaps class="ymaps-tm-annotation-content" style="' + getInlineStyle(contentStyle) + '">{{ properties.iconContent }}</ymaps>' +
            '<ymaps class="ymaps-tm-annotation-arrow" style="' + getInlineStyle(arrowStyle) + '"></ymaps>' +
        '</ymaps>', {}
    ));

    provide(Annotation);
});
