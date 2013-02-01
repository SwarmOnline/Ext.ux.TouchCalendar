# Using Ext.ux.TouchCalendar with the MVC Pattern

This is a short introduction into integrating the Ext.ux.TouchCalendar in a Sencha Touch application using the MVC pattern.

## Including the Source
There are a couple of ways to get the source into your application, the first is using the individual source files and the dynamic loader; the second is to manual include the files in the index.html.

### Using the dynamic loader
To use the TouchCalendar with the dynamic loader we first need to copy the source files into the correct location. We recommend putting files under the "Ext.ux" namespace into the "src/ux/" folder within the Sencha Touch SDK folder.

Unfortunately, due to the naming convention used we will need to rename these files first. You must remove the "Ext.ux" prefix from each file after copying them into the "src/ux" folder.

Now the files are in the correct location we must add a new "path" to the Ext.Loader class' configuration. We do this by including the following code:

    Ext.Loader.setConfig({
        enabled: true,
		paths: {
			Ext         : 'path/to/sdk/src',
			'Ext.ux.'   : 'path/to/sdk/src/ux'
		}
	});
	
Now that the loader knows where it can find the files if they are requested we must include them in the app so that they are loaded. We do this by including them in the "requires" array of either the Application definition or in one of your Controllers. Either way the config will look something like this:

	requires: [
		'Ext.ux.TouchCalendarEventsBase',
		'Ext.ux.TouchCalendarMonthEvents',
		'Ext.ux.TouchCalendarWeekEvents',
		'Ext.ux.TouchCalendarDayEvents',
		'Ext.ux.TouchCalendarEvents',

		'Ext.ux.TouchCalendarSimpleEvents',

		'Ext.ux.TouchCalendarView',
		'Ext.ux.TouchCalendar'
	]
	
If you load your app now you should see appropriate requests being made for each of the scripts above.

### Including the source in the index.html
If you don't want to use the Ext.Loader then we can simply include each of the files in a regular script tag in the index.html. We can do this with either the minified and combined versions of the source or with each individual component file - either way works equally well!

## Including the CSS
There are a few CSS files that are required by the extension and you must ensure these are included for the calendar to look correct. The main extension (TouchCalendar and TouchCalendarView) has one mandatory CSS class ("Ext.ux.TouchCalendar.css" - found in the "resources/css" folder in the root project folder) and an optional "skin" CSS file which makes the calendar look a whole lot nicer than the original styling. This CSS file can be found at "resources/css/skin1.css".

If you are using the TouchCalendarEvents or TouchCalendarSimpleEvents plugins then you will need to include their respective CSS files (found at Ext.ux.TouchCalendarEvents/resources/css and Ext.ux.TouchCalendarSimpleEvents/resources/css respectively).

These files should be included within your index.html file as you would with any other CSS file.

## Working with the Calendar
Now that the source and CSS files are included in the project then it's just a case of using them in your app. You can create the components using their class names or with the xtypes provided. The following code will create a calendar component:

	var calendar = Ext.create('Ext.ux.TouchCalendar', {
    	xtype: 'calendar',
        viewConfig: {
        	viewMode: 'week',
        	weekStart: 1,
        	value: new Date()
       	}
	});