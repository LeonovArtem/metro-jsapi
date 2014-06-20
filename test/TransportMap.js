/* global ymaps, mocha, describe, it, expect */
ymaps.modules.require(['TransportMap', 'vow']).spread(function (TransportMap, vow) {
    describe('TransportMap module', function () {
        var mapContainer = document.createElement('div');
        mapContainer.id = 'mapContainer';
        mapContainer.style.width = '512px';
        mapContainer.style.height = '512px';
        document.body.appendChild(mapContainer);

        describe('TransportMap creation', function () {
            it('should implement factory method - "create"', function () {
                expect(TransportMap.create).to.be.a('function');
            });

            it('city alias should be supported', function () {
                return vow.all([
                    TransportMap.create('moscow', mapContainer, {lang: 'ru'}),
                    TransportMap.create('minsk', mapContainer, {lang: 'ru'})
                ]).spread(function (transportMap1, transportMap2) {
                    expect(transportMap1.getSchemeId()).not.to.equal(transportMap2.getSchemeId());

                    transportMap1.destroy();
                    transportMap2.destroy();
                });
            });

            it('should expose ymap instance', function () {
                return TransportMap.create('kiev', 'mapContainer', {lang: 'ru'}).then(function (transportMap) {
                    expect(transportMap).to.respondTo('getMap');
                    expect(transportMap.getMap()).to.be.instanceOf(ymaps.Map);
                    transportMap.destroy();
                });
            });

            it('should accept container id', function () {
                return TransportMap.create('moscow', 'mapContainer', {lang: 'ru'}).then(function (transportMap) {
                    expect(mapContainer.firstChild).to.be.an('object');
                    transportMap.destroy();
                });
            });
            it('should accept container element', function () {
                return TransportMap.create('moscow', mapContainer, {lang: 'ru'}).then(function (transportMap) {
                    expect(mapContainer.firstChild).to.be.an('object');
                    transportMap.destroy();
                });
            });
            it('should center scheme by default', function () {
                return TransportMap.create('moscow', mapContainer, {lang: 'ru'}).then(function (transportMap) {
                    expect(transportMap.getCenter).to.be.an('function');
                    expect(transportMap.getCenter()).to.deep.equal([0, 0]);
                    transportMap.destroy();
                });
            });
            it('should accept center coordinates', function () {
                var point = [0.1, 0.1];

                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {center: point},
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    var center = transportMap.getCenter();

                    expect(transportMap.getCenter).to.be.an('function');
                    expect(center[0]).to.be.closeTo(point[0], point[0] / 10000);
                    expect(center[1]).to.be.closeTo(point[1], point[1] / 10000);
                    transportMap.destroy();
                });
            });
            it('should accept fractional zoom', function () {
                var initialZoom = 1.3;

                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {zoom: initialZoom},
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap.getZoom).to.be.an('function');
                    expect(transportMap.getZoom()).to.equal(initialZoom);
                    transportMap.destroy();
                });
            });
            it('should fit container if a zoom ommited', function () {
                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap.getZoom).to.be.an('function');
                    // container is 512x512 and a tile without zoom is 256x256
                    // so zoom must equal "1" o fit it
                    expect(transportMap.getZoom()).to.equal(1);
                    transportMap.destroy();
                });
            });

            it('should have an EventManager', function () {
                return TransportMap.create(
                    'moscow',
                    mapContainer, {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap).to.have.a.property('events');
                    expect(transportMap.events).to.be.instanceOf(ymaps.event.Manager);

                    transportMap.destroy();
                });
            });
            it('should fire "shadechange" on shade', function (done) {
                TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    transportMap.events.add('shadechange', function (e) {
                        expect(e.get('type')).to.equal('shade');

                        transportMap.destroy();
                        done();
                    });
                    transportMap.shade();
                }).done();
            });
            it('should fire "shadechange" on unshade', function (done) {
                TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    transportMap.events.add('shadechange', function (e) {
                        expect(e.get('type')).to.equal('unshade');

                        transportMap.destroy();
                        done();
                    });
                    transportMap.unshade();
                }).done();
            });
            it('should fire "shadechange" on unshade', function (done) {
                TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    transportMap.events.add('shadechange', function (e) {
                        expect(e.get('type')).to.equal('unshade');

                        transportMap.destroy();
                        done();
                    });
                    transportMap.unshade();
                }).done();
            });
            it('should support "shadeOnSelect" option', function (done) {
                TransportMap.create('moscow', mapContainer, {
                    lang: 'ru',
                    shadeOnSelect: true
                }).then(function (transportMap) {
                    transportMap.events.add('shadechange', function (e) {
                        expect(e.get('type')).to.equal('shade');

                        transportMap.destroy();
                        done();
                    });
                    transportMap.stations.get(0).select();
                }).done();
            });
            it('should fire "boundschange" on zoom change', function () {
                var newZoom = 3;

                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    transportMap.events.add('boundschange', function (e) {
                        expect(e.get('newZoom')).to.deep.equal(newZoom);

                        transportMap.destroy();
                    });
                    transportMap.setZoom(newZoom);
                }).done();
            });
            it('should handle detached container', function (done) {
                var initialZoom = 2.5,
                    mapContainer = document.createElement('div');

                mapContainer.style.width = '512px';
                mapContainer.id = 'test';
                mapContainer.style.height = '512px';

                TransportMap.create(
                    'spb',
                    mapContainer,
                    {zoom: initialZoom},
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap.getZoom()).to.equal(initialZoom);
                    done();
                    transportMap.destroy();
                });
                document.body.appendChild(mapContainer);
            });
        });

        describe('TransportMap instance', function () {
            it('should implement getCenter', function () {
                var point = [0.1, 0.1];

                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {center: point},
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    var center = transportMap.getCenter(point);
                    expect(center[0]).to.be.closeTo(point[0], point[0] / 10000);
                    expect(center[1]).to.be.closeTo(point[1], point[1] / 10000);
                    transportMap.destroy();
                });
            });

            it('should implement setCenter', function () {
                var point = [0.1, 0.1];

                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap.setCenter(point)).to.be.an.instanceof(ymaps.vow.Promise);

                    transportMap.setCenter(point).then(function () {
                        expect(transportMap.getCenter()).to.deep.equal(point);
                    });
                    transportMap.destroy();
                });
            });

            it('should implement getZoom', function () {
                var initialZoom = 2.5;

                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {zoom: initialZoom},
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap.getZoom()).to.equal(initialZoom);
                    transportMap.destroy();
                });
            });

            it('should implement setZoom', function () {
                var zoom = 2;

                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap.setZoom(zoom)).to.be.an.instanceof(ymaps.vow.Promise);
                    transportMap.setZoom(zoom).then(function () {
                        expect(transportMap.getZoom()).to.equal(zoom);
                    });

                    transportMap.destroy();
                });
            });

            it('should have "stations" property', function () {
                return TransportMap.create(
                    'moscow',
                    mapContainer,
                    {lang: 'ru'}
                ).then(function (transportMap) {
                    expect(transportMap).to.have.a.property('stations');
                    expect(transportMap.stations).to.be.an('object');

                    transportMap.destroy();
                });
            });
        });
    });
});
