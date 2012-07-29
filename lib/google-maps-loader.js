define({

    load: function(name, require, load, config) {

        var callback = 'maps_loader_' + new Date().getTime();

        window[callback] = function() {
            load(window.google);
        };

        require([ 'http://maps.googleapis.com/maps/api/js?key=' + name + '&sensor=false&callback=' + callback ]);

    }

});