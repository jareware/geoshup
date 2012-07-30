define([
    'lib/backbone',
    'models/Timeline'
], function(Backbone, Timeline) {

    describe('models/Timeline', function() {

        it('translates global/private seconds properly', function() {

            var a, b, c;

            var timeline = new Timeline([
                a = new Backbone.Model({ offset:  0 }),
                b = new Backbone.Model({ offset: -3 }),
                c = new Backbone.Model({ offset:  5 })
            ]);

            expect(timeline.globalToPrivate( 0, a)).toBe(0);
            expect(timeline.globalToPrivate(-3, a)).toBe(-3);
            expect(timeline.globalToPrivate( 2, a)).toBe(2);

            expect(timeline.globalToPrivate( 0, b)).toBe(3);
            expect(timeline.globalToPrivate(-3, b)).toBe(0);
            expect(timeline.globalToPrivate( 2, b)).toBe(5);

            expect(timeline.globalToPrivate(-1, c)).toBe(-6);
            expect(timeline.globalToPrivate( 3, c)).toBe(-2);
            expect(timeline.globalToPrivate( 7, c)).toBe(2);

            expect(timeline.privateToGlobal( 0, a)).toBe(0);
            expect(timeline.privateToGlobal(-2, a)).toBe(-2);

            expect(timeline.privateToGlobal(2, b)).toBe(-1);
            expect(timeline.privateToGlobal(5, b)).toBe(2);

            expect(timeline.privateToGlobal(-3, c)).toBe(2);
            expect(timeline.privateToGlobal( 1, c)).toBe(6);

        });

    });

});