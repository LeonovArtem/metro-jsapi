/* global ymaps, mocha, describe, it, expect */
ymaps.modules.require(['transportMap.Scheme', 'vow']).spread(function (Scheme, vow) {
    describe('Scheme module', function () {
        var MOSCOW_SVG_SRC = 'node_modules/metro-data/1.ru.svg';
        it('should have a factory', function () {
            return Scheme.create(MOSCOW_SVG_SRC).then(function (scheme) {
                expect(scheme).to.be.instanceof(Scheme);
            });
        });
        it('should return a size', function () {
            return Scheme.create(MOSCOW_SVG_SRC).then(function (scheme) {
                expect(scheme.getSize()).to.be.an('array');
            });
        });
        it('should return stations', function () {
            return Scheme.create(MOSCOW_SVG_SRC).then(function (scheme) {
                expect(scheme.getStations()).to.be.not.empty;
            });
        });
        it('should return a label info', function () {
            return Scheme.create(MOSCOW_SVG_SRC).then(function (scheme) {
                expect(scheme.getLabel(1)).to.be.an('object');
            });
        });
    });
});
