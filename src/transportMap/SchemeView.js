ymaps.modules.define('transportMap.SchemeView', [
    'util.extend'
], function (provide, extend) {
    /**
     * @see http://api.yandex.ru/maps/doc/jsapi/beta/ref/reference/projection.Cartesian.xml
     */
    var ZERO_ZOOM_SIZE = 256;

    /**
     * View on a scheme image.
     * Responsible for moving and scaling.
     *
     * @constructor
     *
     * @param {SVGElement} scheme Root node of a scheme image
     */
    function SchemeView(scheme) {
        this._scheme = scheme;
        this._selfSize = scheme.getSize();
        this._zeroZoomScale = Math.min(
            ZERO_ZOOM_SIZE / this._selfSize[0],
            ZERO_ZOOM_SIZE / this._selfSize[1]
        );

        this._offset = [
            Math.floor((ZERO_ZOOM_SIZE - this._selfSize[0] * this._zeroZoomScale) / 2),
            Math.floor((ZERO_ZOOM_SIZE - this._selfSize[1] * this._zeroZoomScale) / 2)
        ];

        this._node = document.createElement('ymaps');
        extend(this._node.style, {
            position: 'absolute',
            width: this._selfSize[0] + 'px',
            height: this._selfSize[1] + 'px',
        });

        this._schemeNode = scheme.createDom();
        this._schemeNode.setAttribute('width', '100%');
        this._schemeNode.setAttribute('height', '100%');
        this._schemeNode.setAttribute('viewBox', [0, 0, this._selfSize[0], this._selfSize[1]].join(' '));

        this._node.appendChild(this._schemeNode);
    }
    SchemeView.ZERO_ZOOM_SIZE = ZERO_ZOOM_SIZE;

    extend(SchemeView.prototype, {
        fadeOut: function () {
            this._schemeNode.getElementById('scheme-layer').style.opacity = '';
        },
        fadeIn: function () {
            this._schemeNode.getElementById('scheme-layer').style.opacity = 0.5;
        },
        /**
         * Move an image.
         * Relative to the initial position
         *
         * @param {Array} vector An array of dx and dy values
         */
        updatePosition: function (clientCenter, mapScale) {
            var scale = this._zeroZoomScale * mapScale,
                offset = [
                    this._offset[0] + clientCenter[0],
                    this._offset[1] + clientCenter[1]
                ],
                value = 'translate(' + offset[0] + 'px,' + offset[1] + 'px)';

            ['-webkit-', '-moz-', '-ms-', '-o-', ''].forEach(function (prefix) {
                this._node.style[prefix + 'transform-origin'] = '0px 0px';
                this._node.style[prefix + 'transform'] = value;
            }, this);

            extend(this._node.style, {
                width: this._selfSize[0] * scale + 'px',
                height: this._selfSize[1] * scale + 'px'
            });
        },
        /**
         * @returns {SVGElement}
         */
        getNode: function () {
            return this._node;
        },

        getScheme: function () {
            return this._scheme;
        },

        getSchemeNode: function () {
            return this._schemeNode;
        },

        toClientPixels: function (globalPixels, zoom) {
            var mapScale = Math.pow(2, zoom),
                zeroZoomPixels = [
                    globalPixels[0] / mapScale,
                    globalPixels[1] / mapScale
                ];

            return [
                zeroZoomPixels[0] / this._zeroZoomScale - this._offset[0],
                zeroZoomPixels[1] / this._zeroZoomScale - this._offset[1]
            ];
        },

        fromClientPixels: function (clientPixels, zoom) {
            var zeroZoomPixels = [
                    (clientPixels[0] + this._offset[0]) * this._zeroZoomScale,
                    (clientPixels[1] + this._offset[1]) * this._zeroZoomScale
                ],
                mapScale = Math.pow(2, zoom);

            return [
                zeroZoomPixels[0] * mapScale,
                zeroZoomPixels[1] * mapScale
            ];
        }
    });

    provide(SchemeView);
});
