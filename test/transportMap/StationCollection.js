ymaps.modules.require(['TransportMap', 'vow']).spread(function (TransportMap, vow) {
    // Utils
    function randomDecimal(min, max) {
        return min + Math.floor(Math.random() * (max - min));
    }
    function randomUniqueDecimals(minLength, maxLength, minValue, maxValue) {
        var array = [], runner, id;

        for (runner = randomDecimal(minLength, maxLength); runner; runner--) {
            id = randomDecimal(minValue, maxValue);
            if (array.indexOf(id) === -1) {
                array.push(id);
            }
        }

        return array;
    }

    describe('StationCollection module', function () {
        it('should implement "search"', function (done) {
            TransportMap.create('kiev', document.body, {lang: 'ru'}).then(function (transportMap) {
                expect(transportMap.stations).respondTo('search');

                transportMap.stations.search('пло').then(function (stations) {
                    expect(stations).to.be.an('array');
                    expect(stations.length).to.equal(2);

                    transportMap.destroy();
                    done();
                });
            });
        });
        it('should have an EventManager', function () {
            return TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {

                expect(transportMap.stations).to.have.a.property('events');
                expect(transportMap.stations.events).to.be.instanceOf(ymaps.event.Manager);

                transportMap.destroy();
            });
        });
        it('should fire "selectionchange" event on select', function (done) {
            TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {
                transportMap.stations.events.add('selectionchange', function (e) {
                    expect(e.get('type')).to.equal('select');

                    transportMap.destroy();
                    done();
                });
                transportMap.stations.select([1]);
            }).done();
        });
        it('should fire "selectionchange" event on deselect', function (done) {
            TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {
                transportMap.stations.select([4]);
                transportMap.stations.events.add('selectionchange', function (e) {
                    expect(e.get('type')).to.equal('deselect');

                    transportMap.destroy();
                    done();
                });
                transportMap.stations.deselect([4]);
            }).done();
        });
        it('should implement getSelection', function () {
            var initialSelection = randomUniqueDecimals(1, 10, 1, 10);

            return TransportMap.create(
                'moscow',
                document.body,
                {selection: initialSelection},
                {lang: 'ru'}
            ).then(function (transportMap) {
                expect(transportMap.stations).to.respondTo('getSelection');
                expect(transportMap.stations.getSelection()).to.equalAsSets(initialSelection);

                transportMap.destroy();
            });
        });
        it('should implement select', function () {
            return TransportMap.create('kharkov', document.body, {lang: 'ru'}).then(function (transportMap) {
                var selection = randomUniqueDecimals(1, 10, 1, 20);

                expect(transportMap.stations).to.respondTo('select');
                transportMap.stations.select(selection);
                expect(transportMap.stations.getSelection()).to.equalAsSets(selection);

                transportMap.destroy();
            });
        });
        it('should implement deselect', function () {
            var deselection = randomUniqueDecimals(1, 4, 1, 10);

            return TransportMap.create(
                'moscow',
                document.body, {selection: randomUniqueDecimals(1, 10, 1, 10)},
                {lang: 'ru'}
            ).then(function (transportMap) {
                expect(transportMap.stations).to.respondTo('deselect');

                transportMap.stations.deselect(deselection);
                expect(transportMap.stations.getSelection()).to.not.have.members(deselection);

                transportMap.destroy();
            });
        });
        it('"deselect" without arguments deselects all', function () {
            return TransportMap.create(
                'moscow',
                document.body,
                {selection: randomUniqueDecimals(1, 10, 1, 10)},
                {lang: 'ru'}
            ).then(function (transportMap) {
                transportMap.stations.deselect();
                expect(transportMap.stations.getSelection()).to.be.empty;

                transportMap.destroy();
            });
        });

        it('should implement "each"', function () {
            var initialSelection = randomUniqueDecimals(1, 10, 1, 10);

            return TransportMap.create(
                'moscow',
                document.body,
                {selection: initialSelection},
                {lang: 'ru'}
            ).then(function (transportMap) {
                expect(transportMap.stations).to.respondTo('each');

                transportMap.stations.each(function (station) {
                    expect(station).to.be.an('object');
                });

                transportMap.destroy();
            });
        });
        it('should implement "getIterator"', function () {
            return TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {
                expect(transportMap.stations).to.respondTo('getIterator');

                transportMap.destroy();
            });
        });
        it('should implement "filter"', function () {
            return TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {
                expect(transportMap.stations).to.respondTo('filter');

                transportMap.destroy();
            });
        });
    });
});
