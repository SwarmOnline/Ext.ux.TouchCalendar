// set up the Ext.Loader so it can find the Sencha Touch library files and the Ext.ux namespace files
Ext.Loader.setConfig({
    enabled: true,
	paths: {
		Ext         : '../../lib/sencha/src',
		'Ext.ux.'   : '../../lib/sencha/src/ux'
	}
});

// define the application
Ext.application({
    name: 'TouchCalendar',

	controllers: [
		'Main'
	],
    stores: [
        'Events'
    ],
	models: [
		'Event'
	],

    launch: function() {
	    console.log('App Launched');

	    // remove the loading indicator
	    Ext.destroy(Ext.select('#appLoadingIndicator').first());

	    // create and add the MainTabPanel to the Viewport
	    Ext.Viewport.add({
		    xtype: 'MainTabPanel'
	    })
    }
});
