/* global ymaps, mocha, describe, it, expect */
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
            return vow.all([
                TransportMap.create('kharkov', document.body, {lang: 'ru'}),
                TransportMap.create('moscow', document.body, {lang: 'ru'})
            ]).spread(function (transportMap1, transportMap2) {
                return vow.all([
                    transportMap1.stations.search('Ботанический'),
                    transportMap2.stations.search('Ботанический'),
                ]).spread(function (stations1, stations2) {
                    //two subsequent requests, non parallel
                    return stations1[0].getCoordinates().then(function (coord1) {
                        return stations2[0].getCoordinates().then(function (coord2) {
                            expect(coord1).to.not.deep.equal(coord2);
                            transportMap1.destroy();
                            transportMap2.destroy();
                        });
                    });
                });
            });
        });
    });
});
