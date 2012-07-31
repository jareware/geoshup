define([
    'utils/logger'
], function(logger) {

    describe('utils/logger', function() {

        var orig;

        beforeEach(function() {

            orig = logger.getTopLabelLength(); // initializations for previous tests may have affected the prefix length counter

            logger.setTopLabelLength(0);

        });

        afterEach(function() {

            logger.setTopLabelLength(orig);

        });

        it('pads log lines properly', function() {

            var log1 = logger.create('foo');
            var log2 = logger.create('barbaz');

            spyOn(window.console, 'log');

            log1('testing');
            log2('more', 123, 'testing');

            expect(window.console.log.toHaveBeenCalled);
            expect(window.console.log.argsForCall[0]).toEqual(['   [foo]', 'testing']);
            expect(window.console.log.argsForCall[1]).toEqual(['[barbaz]', 'more', 123, 'testing']);

        });

    });

});