define([
    'lib/underscore',
    'lib/backbone',
    'models/Timeline',
    'controllers/Orchestrator'
], function(_, Backbone, Timeline, Orchestrator) {

    "use strict";

    describe('controllers/Orchestrator', function() {

        function getViewSpy(offset) {
            return {
                model: new Backbone.Model({
                    offset: offset
                }),
                sync: jasmine.createSpy('viewSpy')
            };
        }

        it('allows adding and removing views, ingoring duplicates', function() {

            var o = new Orchestrator();
            var a = new Backbone.View();
            var b = new Backbone.View();
            var c = new Backbone.View();

            expect(o.addView(a)).toBe(1);
            expect(o.addView(a)).toBe(1);
            expect(o.addView(b)).toBe(2);
            expect(o.removeView(c)).toBe(2);
            expect(o.removeView(b)).toBe(1);
            expect(o.removeView(b)).toBe(1);
            expect(o.removeView(a)).toBe(0);

        });

        it('delegates sync commands to contained views', function() {

            var a = getViewSpy(0);
            var b = getViewSpy(-3);
            var c = getViewSpy(5);
            var t = new Timeline([ a.model, b.model, c.model ]);
            var o = new Orchestrator(t);

            o.addView(a);
            o.addView(b);
            o.addView(c);

            o.syncAtGlobalSeconds(3, function() {});

            expect(a.sync).toHaveBeenCalled();
            expect(b.sync).toHaveBeenCalled();
            expect(c.sync).toHaveBeenCalled();

            expect(a.sync.mostRecentCall.args[0]).toBe(3);
            expect(b.sync.mostRecentCall.args[0]).toBe(6);
            expect(c.sync.mostRecentCall.args[0]).toBe(-2);

            o.syncAtPrivateSeconds(1, c.model, function() {});

            expect(a.sync.mostRecentCall.args[0]).toBe(6);
            expect(b.sync.mostRecentCall.args[0]).toBe(9);
            expect(c.sync.mostRecentCall.args[0]).toBe(1);

        });

        it('waits to get a ready() from all views before invoking its own ready()', function() {

            var a = getViewSpy(0);
            var b = getViewSpy(-3);
            var c = getViewSpy(5);
            var t = new Timeline([ a.model, b.model, c.model ]);
            var o = new Orchestrator(t);

            o.addView(a);
            o.addView(b);
            o.addView(c);

            _.each([ a, b, c ], function(i) {
                i.sync.andCallFake(function(atGlobalSeconds, ready) {
                    i.syncReady = ready;
                });
            });

            var readySpy = jasmine.createSpy('readySpy');

            o.syncAtGlobalSeconds(0, readySpy);

            expect(readySpy).not.toHaveBeenCalled();

            a.syncReady();
            b.syncReady();

            expect(readySpy).not.toHaveBeenCalled();

            b.syncReady();

            expect(readySpy).toHaveBeenCalled();
            expect(readySpy.callCount).toBe(1);

        });

    });

});