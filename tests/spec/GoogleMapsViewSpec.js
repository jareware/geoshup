define([
    'lib/backbone',
    'views/GoogleMaps'
], function(Backbone, GoogleMapsView) {

    describe('GoogleMapsView', function() {

        it('syncs correctly taking the offset into account', function() {

            var points = [
                [60.160411, 24.878477, 100, 50],
                [60.160411, 24.878477, 102, 50],
                [60.160411, 24.878477, 104, 50],
                [60.160411, 24.878477, 106, 50],
                [60.160411, 24.878477, 108, 50],
                [60.160411, 24.878477, 110, 50]
            ];

            var track = new Backbone.Model({
                offset: 0,
                points: points
            });

            var view = new GoogleMapsView({
                model: track
            });

            // Default, without any offsetting:

            expect(view.frameCursor).toBe(0);
            view.sync(0);
            expect(view.frameCursor).toBe(0);
            view.sync(4);
            expect(view.frameCursor).toBe(2);

            // With a positive offset:

            track.set({ offset: 3 });
            view.sync(3);
            expect(view.frameCursor).toBe(0);
            view.sync(5);
            expect(view.frameCursor).toBe(1);

            // Positive offset, hitting between frames:

            view.sync(4);
            expect(view.frameCursor).toBe(0);

        });

    });

});