/* global ymaps, describe, it, expect */
ymaps.modules.require(['TransportMap', 'vow']).spread(function (TransportMap, vow) {
    describe('Station module', function () {
        this.timeout(15000);
        it('should have "code" property', function () {
            return TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {
                transportMap.stations.each(function (station) {
                    expect(station).to.have.property('code');
                });

                transportMap.destroy();
            });
        });
        it('should have "title" property', function () {
            return TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {
                transportMap.stations.each(function (station) {
                    expect(station).to.have.property('title');
                });

                transportMap.destroy();
            });
        });
        it('should implement "getCoordinates"', function () {
            return TransportMap.create('moscow', document.body, {lang: 'ru'}).then(function (transportMap) {
                expect(transportMap.stations.get(0).getCoordinates).to.be.a('function');

                transportMap.destroy();
            });
        });
        it('"getCoordinates" should respect current city', function () {
            return TransportMap.create('kharkov', document.body, {lang: 'ru'}).then(function (transportMap) {
                return transportMap.stations.search('Ботанический').then(function (stations) {
                    return stations[0].getCoordinates().then(function (coord) {
                        expect(coord[0]).to.be.within(50, 51);
                        expect(coord[1]).to.be.within(36, 37);
                        transportMap.destroy();
                    });
                });

            });
        });
    });
});
