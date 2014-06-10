ymaps.modules.define('transportMap.SchemeLayer', [
    'util.augment',
    'collection.Item',
    'transportMap.SchemeView',
], function (provide, augment, Item, SchemeView) {
    /**
     * Creates a layer with a scheme,
     * that should be added to the map.
     * Proxies events from a map to the SchemeView
     *
     * @constructor
     * @inherits ymaps.collection.Item
     *
     * @param {SchemeView} schemeView
     */
    function SchemeLayer(schemeView) {
        SchemeLayer.superclass.constructor.call(this);

        this._schemeView = schemeView;
    }
    augment(SchemeLayer, Item, {
        /**
         * Init function. Sets everything when a layer is added to the map
         *
         * @override ymaps.collection.Item
         */
        onAddToMap: function (map) {
            SchemeLayer.superclass.onAddToMap.call(this, map);

            this._pane = map.panes.get('ground');
            this._updateSchemePosition();

            this._pane.events.add(
                ['viewportchange', 'zoomchange', 'clientpixelschange'],
                this._updateSchemePosition,
                this
            );

            this._pane.getElement().appendChild(this._schemeView.getNode());
        },

        _updateSchemePosition: function () {
            this._schemeView.updatePosition(
                this._pane.toClientPixels([0, 0]),
                Math.pow(2, this._pane.getZoom())
            );
        },

        getSchemeView: function () {
            return this._schemeView;
        }
    });
    /**
     * Calculates zoom to fit the layer into the container
     *
     * @param {HTMLElement} containerNode
     *
     * @returns {Number}
     */
    SchemeLayer.getFitZoom = function (containerNode) {
        return Math.log(Math.min(
            containerNode.clientWidth / SchemeView.ZERO_ZOOM_SIZE,
            containerNode.clientHeight / SchemeView.ZERO_ZOOM_SIZE
        )) / Math.LN2;
    };

    provide(SchemeLayer);
});
