define([
    'lib/moment',
    'utils/logger'
], function(moment, logger) {

    describe('utils/logger', function() {

        var orig;

        beforeEach(function() {

            orig = logger.getTopLabelLength(); // initializations for previous tests may have affected the prefix length counter

            logger.setTopLabelLength(0);

            spyOn(moment.fn, 'format').andCallFake(function() {
                return '12:34';
            });

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
            expect(window.console.log.argsForCall[0]).toEqual(['12:34    [foo]', 'testing']);
            expect(window.console.log.argsForCall[1]).toEqual(['12:34 [barbaz]', 'more', 123, 'testing']);

        });

        it('logs hashes nicely', function() {

            var log = logger.create('foo');

            spyOn(window.console, 'log');

            log.hash({
                foo: 'bar',
                baz: 123
            });

            expect(window.console.log).toHaveBeenCalled();
            expect(window.console.log.argsForCall[0]).toEqual(['12:34 [foo]', 'foo:', 'bar', ', ', 'baz:', 123]);

        });

    });

});