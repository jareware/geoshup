define([ 'lib/runner.js' ], function(runner) {

    define('lib/google-maps', [], {});
    define('swfobject', [], {});

    require([
        'spec/models/Timeline',
        'spec/models/tracks/GPX',
        'spec/models/tracks/YouTube',
        'spec/views/GoogleMaps',
        'spec/views/YouTube',
        'spec/controllers/Orchestrator'
    ], runner);

});