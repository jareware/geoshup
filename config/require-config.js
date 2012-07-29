var require = {
    paths: {
        jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery',
        moment: 'https://raw.github.com/timrwood/moment/1.6.2/moment',
        text: 'https://raw.github.com/requirejs/text/master/text',
        swfobject: 'http://ajax.googleapis.com/ajax/libs/swfobject/2.1/swfobject'
    },
    map: {
        '*': {
            'lib/jquery': 'jquery',
            'lib/moment': 'moment',
            'lib/swfobject': 'swfobject'
        }
    },
    shim: {
        'lib/underscore': {
            deps: [],
            exports: '_'
        },
        'lib/backbone': {
            deps: [ 'lib/underscore', 'lib/jquery' ],
            exports: 'Backbone'
        },
        'swfobject': {
            deps: [],
            exports: 'swfobject'
        }
    }
};