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
                sync: jasmine.createSpy('viewSpy'),
                play: jasmine.createSpy('play'),
                pause: jasmine.createSpy('pause')
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

            expect(a.orchestrator).not.toBe(undefined);

            expect(o.removeView(c)).toBe(2);
            expect(o.removeView(b)).toBe(1);
            expect(o.removeView(b)).toBe(1);
            expect(o.removeView(a)).toBe(0);

            expect(a.orchestrator).toBe(undefined);

        });

        it('delegates sync commands to managed views', function() {

            var a = getViewSpy(0);
            var b = getViewSpy(-3);
            var c = getViewSpy(5);
            var t = new Timeline([ a.model, b.model, c.model ]);
            var o = new Orchestrator(t);

            o.addView(a);
            o.addView(b);
            o.addView(c);

            o.syncAtGlobalSeconds(3, function() {}, undefined);

            expect(a.sync).toHaveBeenCalled();
            expect(b.sync).toHaveBeenCalled();
            expect(c.sync).toHaveBeenCalled();

            expect(a.sync.mostRecentCall.args[0]).toBe(3);
            expect(b.sync.mostRecentCall.args[0]).toBe(6);
            expect(c.sync.mostRecentCall.args[0]).toBe(-2);

            o.syncAtPrivateSeconds(1, function() {}, undefined, c.model);

            expect(a.sync.mostRecentCall.args[0]).toBe(6);
            expect(b.sync.mostRecentCall.args[0]).toBe(9);
            expect(c.sync.mostRecentCall.args[0]).toBe(1);

        });

        it('allows ignoring a specific view', function() {

            var a = getViewSpy(0);
            var b = getViewSpy(-3);
            var c = getViewSpy(5);
            var t = new Timeline([ a.model, b.model, c.model ]);
            var o = new Orchestrator(t);

            o.addView(a);
            o.addView(b);
            o.addView(c);

            o.syncAtGlobalSeconds(3, function() {}, b);

            expect(a.sync).toHaveBeenCalled();
            expect(b.sync).not.toHaveBeenCalled();
            expect(c.sync).toHaveBeenCalled();

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

            c.syncReady();

            expect(readySpy).toHaveBeenCalled();
            expect(readySpy.callCount).toBe(1);

            o.syncAtGlobalSeconds(0, readySpy, b); // test that it's enough that the non-ignored views reported back

            a.syncReady();
            c.syncReady();

            expect(readySpy.callCount).toBe(2);

        });

        // TODO: Test that one view invoking its ready() multiple times after a sync() won't cut it

        it('delegates play/pause commands to managed views', function() {

            var a = getViewSpy(0);
            var b = getViewSpy(-3);
            var c = getViewSpy(5);
            var t = new Timeline([ a.model, b.model, c.model ]);
            var o = new Orchestrator(t);

            o.addView(a);
            o.addView(b);
            o.addView(c);

            b.orchestrator.play(); // command from a View

            expect(a.play.callCount).toBe(1);
            expect(b.play).not.toHaveBeenCalled();
            expect(c.play.callCount).toBe(1);

            a.orchestrator.pause(); // command from a View

            expect(a.pause).not.toHaveBeenCalled();
            expect(b.pause.callCount).toBe(1);
            expect(c.pause.callCount).toBe(1);

            o.play(); // command externally

            expect(a.play.callCount).toBe(2);
            expect(b.play.callCount).toBe(1);
            expect(c.play.callCount).toBe(2);

            o.pause(); // command externally

            expect(a.pause.callCount).toBe(1);
            expect(b.pause.callCount).toBe(2);
            expect(c.pause.callCount).toBe(2);

        });

    });

});