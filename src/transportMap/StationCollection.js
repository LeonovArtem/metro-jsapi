ymaps.modules.define('transportMap.StationCollection', [
    'util.augment',
    'vow',
    'Collection',
    'transportMap.Station'
], function (provide, augment, vow, Collection, Station) {
    /**
     * Station manager.
     * Responsible for selection/deselection of stations
     *
     * Has an EventManager, which is a parent for all Stations' EventManagers
     *
     * @constructor
     * @inherits ymaps.Collection
     *
     * @param {SchemeView} schemeView
     * @param {Boolean} selectOnClick
     */
    function StationCollection(schemeView, selectOnClick) {
        StationCollection.superclass.constructor.call(this);

        var code, station,
            metadata = schemeView.getScheme().getStations();

        this._stationsMap = {};

        for (code in metadata) {
            station = new Station(metadata[code], schemeView);
            // event bubbling
            this._stationsMap[code] = station;
            this.add(station);
            station.events.setParent(this.events);
        }

        if (selectOnClick) {
            this.setSelectOnClick(true);
        }
    }
    augment(StationCollection, Collection, {
        /**
         * Controls weather stations should be selected/unselected by click
         *
         * @param {Boolean} value yes/no
         */
        setSelectOnClick: function (value) {
            var method = value ? 'add':'remove';

            this.each(function (station) {
                station.events[method]('click', this._onStationClick, station);
            }, this);
        },
        _onStationClick: function () {
            this[this.selected ? 'deselect':'select']();
        },
        /**
         * Selects stations by codes
         *
         * @param {Array<Number>|Number} codes
         */
        select: function (codes) {
            [].concat(codes).forEach(function (code) {
                this.getByCode(code).select();
            }, this);
        },
        /**
         * Deselects stations
         *
         * @param {Array<Number>|Number} [codes] By default all selected
         */
        deselect: function (codes) {
            codes = codes || this.getSelection();
            [].concat(codes).forEach(function (code) {
                this.getByCode(code).deselect();
            }, this);
        },
        /**
         * Returns codes of all selected stations
         *
         * @returns {Array<Number>}
         */
        getSelection: function () {
            var codes = [];
            this.each(function (station) {
                if (station.selected) {
                    codes.push(station.code);
                }
            });
            return codes;
        },
        getByCode: function (code) {
            return this._stationsMap[code];
        },
        /**
         * Search stations by words starting with the letters %request%
         *
         * @param {String} request
         *
         * @returns {ymaps.vow.Promise} Resolves to an array of stations
         */
        search: function (request) {
            return new vow.fulfill(this.filter(function (station) {
                return station.title.split(' ').some(function (token) {
                    return token.substr(0, request.length) === request;
                });
            }));
        }
    });

    provide(StationCollection);
});
