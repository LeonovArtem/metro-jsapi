/**
 * @example
 * ymaps.modules.load(['TransportMap']).then(function (TransportMap) {
 *     TransportMap.create('moscow', 'map_container_id').then(function (map) {
 *         // Do something valuable
 *     });
 * });
 */
ymaps.modules.define('TransportMap', [
    'util.extend',
    'transportMap.Scheme',
    'transportMap.SchemeView',
    'transportMap.SchemeLayer',
    'transportMap.StationCollection',
    'transportMap.AnnotationCollection',
    'event.Manager',
    'projection.Cartesian',
    'Map'
], function (provide, extend,
    Scheme, SchemeView, SchemeLayer,
    StationCollection, AnnotationCollection,
    EventManager, CartesianProjection, Map) {
    /**
     * TransportMap creates a map and inserts SchemeLayer into it.
     *
     * Has an EventManager, which is a parent for all Events on the map & stations
     *
     * Exposes "StationCollection" via "stations" property
     *
     * Note: constructor returns a promise, not an instanceof TransportMap
     *
     * @constructor
     *
     * @param {String} city (e.g. 'minsk', 'moscow')
     * @param {String|Element} container
     * @param {Object} [state]
     * @param {Array<Number>} [state.center] geo point
     * @param {Boolean} [state.shaded] Boolean flag to shade or not a map
     * @param {Array<Number>} [state.selection] List of selected station codes
     * @param {Object} options
     * @param {Number} options.lang
     * @param {Number} [options.maxZoom = 3]
     * @param {Number} [options.minZoom = 0]
     * @param {Boolean} [options.shadeOnSelect = false]  Shade the map on stations select
     * @param {Boolean} [options.selectOnClick = true] Selects stations by click
     * @param {String} [options.path = 'node_modules/metro-data/'] A path to the metro-data
     */
    function TransportMap(city, container, state, options) {
        this._schemeId = this._schemeIdByCity[city] || city;

        if (typeof container === 'string') {
            this._container = document.getElementById(container);
        } else {
            // support jQuery
            this._container = container[0] || container;
        }

        if (!options) {
            options = state;
            state = null;
        }
        this._initStateAndOptions(state, options);

        //NOTE promise is returned from constructor
        return this._loadScheme().then(this._onSchemeLoad.bind(this));
    }


    TransportMap.create = function (city, container, state, options) {
        return new TransportMap(city, container, state, options);
    };

    extend(TransportMap.prototype, {
        _initStateAndOptions: function (state, options) {
            this._options = extend({
                path: 'node_modules/metro-data/',
                shadeOnSelect: false,
                selectOnClick: true,
                minZoom: 0,
                maxZoom: 3
            }, options);
            this._state = extend({
                shaded: false,
                center: [0, 0],
                selection: []
            }, state);

            if (!this._state.hasOwnProperty('zoom')) {
                this._state.zoom = SchemeLayer.getFitZoom(this._container);
            }
            if (!this._state.hasOwnProperty('zoom')) {
                this._state.zoom = SchemeLayer.getFitZoom(this._container);
            }
        },
        _loadScheme: function () {
            return Scheme.create([
                this._options.path,
                this._schemeId, '.', this._options.lang, '.svg'
            ].join(''));
        },
        _onSchemeLoad: function (scheme) {
            return this._createMap().then(function (map) {
                this._scheme = scheme;
                this._schemeView = new SchemeView(scheme);

                this._map = map;
                this._map.layers.add(new SchemeLayer(this._schemeView));

                this.stations = new StationCollection(this._schemeView, this._options.selectOnClick);
                this._map.geoObjects.add(this.stations);
                this.stations.select(this._state.selection);

                this.annotations = new AnnotationCollection(this);

                // Event manager added
                this.events = new EventManager();
                // Enable event bubbling
                this._map.events.setParent(this.events);

                if (this._options.shadeOnSelect) {
                    this.stations.events.add('selectionchange', function () {
                        var selectedLength = this.stations.getSelection().length;

                        if (selectedLength === 1) {
                            this.shade();
                        } else if (selectedLength === 0) {
                            this.unshade();
                        }
                    }, this);
                }
                if (this._state.shaded) {
                    this.shade();
                }

                return this;
            }.bind(this));
        },
        _createMap: function () {
            var deferred = new ymaps.vow.Deferred(),
                map = new Map(
                    this._container,
                    {
                        controls: [],
                        center: this._state.center,
                        zoom: this._state.zoom,
                        type: null
                    },
                    {
                        minZoom: this._options.minZoom,
                        maxZoom: this._options.maxZoom,
                        autoFitToViewport: 'always',
                        avoidFractionalZoom: false,
                        projection: new CartesianProjection([
                            [-1, -1],
                            [1, 1]
                        ])
                    }
                );


                // NOTE Station class relies on a "getBBox",
                // so we must resolve container is attached and visible

                // If container is hidden, then wait untill it becomes visible
                if (this._container.clientWidth && this._container.clientHeight) {
                    deferred.resolve(map);
                } else {
                    map.events.once('sizechange', function () {
                        if (!Number.isFinite(this._state.zoom)) {
                            map.setZoom(SchemeLayer.getFitZoom(this._container));
                        }
                        deferred.resolve(map);
                    }.bind(this));
                }

            return deferred.promise();
        },
        /**
         * Fades in the map without an animation
         */
        shade: function () {
            this._schemeView.fadeIn();
            this.events.fire('shadechange', {type: 'shade', target: this});
        },
        /**
         * Fades out the map without an animation
         */
        unshade: function () {
            this._schemeView.fadeOut();
            this.events.fire('shadechange', {type: 'unshade', target: this});
        },
        /**
         * Returns coordinates of a center in abstract scheme coordinates
         *
         * @returns {Array<Number>}
         */
        getCenter: function () {
            return this._map.getCenter();
        },
        /**
         * Sets coordinates of center.
         * Changing of a center position is async
         *
         * @see http://api.yandex.ru/maps/doc/jsapi/beta/ref/reference/Map.xml#setCenter
         *
         * @param {Array<Number>} center
         * @param {Number} [zoom]
         * @param {Object} [options]
         *
         * @returns {vow.Promise}
         */
        setCenter: function () {
            return this._map.setCenter.apply(this._map, arguments);
        },
        /**
         * Get a current map zoom
         *
         * @returns {Number}
         */
        getZoom: function () {
            return this._map.getZoom();
        },
        /**
         * Sets new zoom
         *
         * @see http://api.yandex.ru/maps/doc/jsapi/beta/ref/reference/Map.xml#setZoom
         *
         * @param {Number} zoom
         * @param {Object} [options]
         *
         * @returns {vow.Promise}
         */
        setZoom: function () {
            return this._map.setZoom.apply(this._map, arguments);
        },
        /**
         * @returns {Number}
         */
        getSchemeId: function () {
            return this._schemeId;
        },
        _schemeIdByCity: {
            moscow: 1,
            spb: 2,
            kiev: 8,
            kharkov: 9,
            minsk: 13
        },
        /**
         * Get current map instance.
         * Can be used for adding controls
         *
         * @returns ymaps.Map
         */
        getMap: function () {
            return this._map;
        },
        destroy: function () {
            this._map.destroy();
        }
    });

    provide(TransportMap);
});
