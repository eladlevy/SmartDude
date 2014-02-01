requirejs.config({
    baseUrl: '/scripts/',
    urlArgs: 'bust=' + (new Date()).getTime(),  //Remove for prod
    paths: {
        'jquery': 'libs/jquery.2.0.3',
        'domReady': 'libs/domReady',
        'underscore': 'libs/shim-underscore',
        'backbone-original': 'libs/shim-backbone.1.0.0',
        'Handlebars': 'libs/shim-handlebars',
        'easyXDM': 'libs/shim-easyXDM.min',
        'text': 'libs/text.2.0.5',
        'jquery-cookie': 'libs/jquery.cookie',
        'hbars': 'libs/hbars',
        'backbone': 'libs/shim-backbone.1.0.0',
        'nprogress': 'libs/nprogress/nprogress',
        'bootstrap': 'libs/bootstrap.min',
        'bootstrapSwitch': 'libs/bootstrapSwitch.min',
        'jquery-mobile': 'libs/jquery.mobile-1.4.0.min'

    },
    shim: {
        'jquery-cookie': ['jquery'],
        'jquery-nicescroll': ['jquery'],
        'jquery-placeholder': ['jquery'],
        'jquery-dropdown': ['jquery'],
        'jquery-readmore' : ['jquery'],
        'nprogress': {
            deps: ['libs/jquery.2.0.3'],
            exports: 'NProgress'
        }
    }
});


