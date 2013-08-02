# Ext.ux.TouchCalendar

### This is the Sencha Touch 2 compatible version of the component. For the Sencha Touch 1.1 version please see the [ST1](https://github.com/SwarmOnline/Ext.ux.TouchCalendar/tree/ST1) branch.

Ext.ux.TouchCalendar is an extension, and set of related plugins, for the Sencha Touch framework that allows easy integration of a calendar component into 
applications.

## Demos

[Ext.ux.TouchCalendar Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)

[Ext.ux.TouchCalendarView Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarView.html)

[Ext.ux.TouchCalendarSimpleEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarSimpleEvents.html)

[Ext.ux.TouchCalendarSimpleEvents Demo 2](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarSimpleEvents-2.html)

[Ext.ux.TouchCalendarEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarEvents.html)

[Ext.ux.TouchCalendarEvents Demo 2](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarEvents-2.html)

[Calendar with Linked List Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/simple-events-list.html)

[Calendar with Linked List Demo 2](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/events-list.html)

## Ext.ux.TouchCalendarView

The main extension is contained in the root folder of the repository and can be included in your project (along with its CSS file located within 
the resources/css folder) and will give you a basic calendar view (either showing a month, week or day) that can be configured with various options.

![Ext.ux.TouchCalendarView Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarView-month-ss.png)
![Ext.ux.TouchCalendarView Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarView-week-ss.png)
![Ext.ux.TouchCalendarView Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarView-day-ss.png)

[Ext.ux.TouchCalendarView Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)

## Ext.ux.TouchCalendar

This extension wraps the Ext.ux.TouchCalendarView in a Ext.Carousel component and allows the calendar to respond to swipe
gestures to switch the displayed period. It works by creating 3 Ext.ux.TouchCalendarViews and dynamically creating/removing
views as the user moves back/forward through time. 

![Ext.ux.TouchCalendar Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendar-month-ss.png)

[Ext.ux.TouchCalendar Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)


## Ext.ux.TouchCalendarSimpleEvents

This plugin can be added to an Ext.ux.TouchCalendar instance to allow a store to be bound to the calendar so events can be shown in a similar style to the iPhone
does with a dot added to each day to represent the presence of an event.

![Ext.ux.TouchCalendarSimpleEvents Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarSimpleEvents-month-ss.png)

[Ext.ux.TouchCalendarSimpleEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarSimpleEvents.html)

## Ext.ux.TouchCalendarEvents

This plugin also allows a store to be bound to the Ext.ux.TouchCalendar and will display the store's events as bars spanning its relevant days. 

![Ext.ux.TouchCalendarEvents Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarEvents-month-ss.png)

[Ext.ux.TouchCalendarEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarEvents.html)

## Usage

### Ext.ux.TouchCalendarView

Include the extension's JS file and related CSS file in your HTML page.

    <link rel="stylesheet" type="text/css" href="resources/css/Ext.ux.TouchCalendarView.css" media="all"/>
    <script src="Ext.ux.TouchCalendarView.js" type="text/javascript" language="JavaScript"></script>
    
In your onReady function instantiate an Ext.ux.TouchCalendarView instance passing in any configuration options you want it to 
have.

    Ext.setup({
        onReady: function(){
  	                    
            var calendarView = Ext.create('Ext.ux.TouchCalendarView', {
                viewMode: 'day',
                weekStart: 1,
                value: new Date()
            });
            
            var panel = Ext.create('Ext.Panel', {
                fullscreen: true,
                layout: 'fit',
                items: [calendarView]
        	});
		
        }
    });

### Ext.ux.TouchCalendar

This extension requires its own source JS to be included as well as the Ext.ux.TouchCalendarView's code.

    <script src="Ext.ux.TouchCalendar.js" type="text/javascript" language="JavaScript"></script>
    
In your onReady function instantiate an Ext.ux.TouchCalendar instance passing in any configuration options you want it to 
have. You can specify a viewConfig option which will be used to configure the underlying Ext.ux.TouchCalendarView instances
and accepts any options that that component can.

    Ext.setup({
        onReady: function(){
  	                    
				var calendar = Ext.create('Ext.ux.TouchCalendar', {
					fullscreen: true,
					viewConfig: {
						viewMode: 'month',
						weekStart: 1,
						value: new Date()
					}
                });
        }
    });
    
### Ext.ux.TouchCalendarSimpleEvents

This plugin requires its own source JS and CSS to be included (within the Ext.ux.TouchCalendarSimpleEvents folder) as well 
as the main extension's code.

    <script src="Ext.ux.TouchCalendarSimpleEvents.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="resources/css/Ext.ux.TouchCalendarSimpleEvents.css" media="all"/>
    
The next step is to create an ``Ext.data.Store`` with event data that we can bind to the calendar.

    Ext.define("Event", {
        extend: "Ext.data.Model",
        config: {
            fields: [{
                name: 'event',
                type: 'string'
            }, {
                name: 'location',
                type: 'string'
            }, {
                name: 'start',
                type: 'date',
                dateFormat: 'c'
            }, {
                name: 'end',
                type: 'date',
                dateFormat: 'c'
            }]
        }
    });

    var eventStore = Ext.create('Ext.data.Store', {
        model: 'Event',
        data: [{
            event: 'Sencha Con',
            location: 'Austin, Texas',
            start: new Date(2011, 9, 23),
            end: new Date(2011, 9, 26)
        }]
    });
    
We can now instantiate the Ext.ux.TouchCalendarSimpleEvents plugin within the main calendar's ``plugins`` configuration. We
also pass a ``store`` config option to the Ext.ux.TouchCalendar.

    var calendarView = Ext.create('Ext.ux.TouchCalendarView', {
        value: new Date(),
        
        store: eventStore,        
        plugins: [Ext.create('Ext.ux.TouchCalendarSimpleEvents')]
    });

### Ext.ux.TouchCalendarEvents

Once again the plugins files must be included in your HTML file and a store created as we have done in the instructions 
above.

We can then instantiate the Ext.ux.TouchCalendarEvents plugin and supply it with a simple ``Ext.XTemplate`` which will be 
used to render the contents of each Event's bar.

    var calendarView = Ext.create('Ext.ux.TouchCalendarView', {
       value: new Date(),
       store: eventStore,
	
       plugins: [Ext.create('Ext.ux.TouchCalendarEvents', {
           eventBarTpl: new Ext.XTemplate('{event} - {location}')
       })]
    });

## Localisation

The Ext.ux.TouchCalendar can be easily localised to display month and day names in any language.

Unfortunately there are no locale files included with ST1 but we can borrow them from the Ext JS 3 package (available here http://www.sencha.com/products/extjs3/download/ext-js-3.4.0/). If you download this package and navigate to the src/locale folder you should file numerous translations.

If you open up the locale file you want you should see the Date translations near the top. If you copy and paste these into your application (or include them in any current locale file you have) before your application launches you should see the Ext.ux.TouchCalendar display in your chosen language.

The overrides you will require look something like the code below:

    Date.shortMonthNames = [
       "Janv",
       "Févr",
       "Mars",
       "Avr",
       "Mai",
       "Juin",
       "Juil",
       "Août",
       "Sept",
       "Oct",
       "Nov",
       "Déc"
    ];

    Date.getShortMonthName = function(month) {
      return Date.shortMonthNames[month];
    };

    Date.monthNames = [
       "Janvier",
       "Février",
       "Mars",
       "Avril",
       "Mai",
       "Juin",
       "Juillet",
       "Août",
       "Septembre",
       "Octobre",
       "Novembre",
       "Décembre"
    ];

    Date.monthNumbers = {
      "Janvier" : 0,
      "Février" : 1,
      "Mars" : 2,
      "Avril" : 3,
      "Mai" : 4,
      "Juin" : 5,
      "Juillet" : 6,
      "Août" : 7,
      "Septembre" : 8,
      "Octobre" : 9,
      "Novembre" : 10,
      "Décembre" : 11
    };

    Date.getMonthNumber = function(name) {
      return Date.monthNumbers[Ext.util.Format.capitalize(name)];
    };

    Date.dayNames = [
       "Dimanche",
       "Lundi",
       "Mardi",
       "Mercredi",
       "Jeudi",
       "Vendredi",
       "Samedi"
    ];

    Date.getShortDayName = function(day) {
      return Date.dayNames[day].substring(0, 3);
    };

    Date.parseCodes.S.s = "(?:er)";

    Ext.override(Date, {
        getSuffix : function() {
            return (this.getDate() == 1) ? "er" : "";
        }
    });

## Known Issues

There are a few known issues that will be ironed out after the first release, namely:

* When using the Ext.ux.TouchCalendar the setValue logic isn't complete for dealing with selections across the 3 views.

## Acknowledgements

I'd like to put out a thank you to the following people for their help:

- @megous for his [sencha-touch-ux-datepicker](https://github.com/megous/sencha-touch-ux-datepicker) extension which this extension originally grew from.

- [Cian Clarke](https://github.com/cianclarke) for his contributions to the Sencha Touch 2 upgrade - great work!
