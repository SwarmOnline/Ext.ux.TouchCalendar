# Ext.ux.Calendar

Ext.ux.Calendar is an extension, and set of related plugins, for the Sencha Touch framework that allows easy integration of a calendar component into 
applications.

## Demos

[Ext.ux.Calendar Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.Calendar.html)

[Ext.ux.CalendarSimpleEvents Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.CalendarSimpleEvents.html)

[Ext.ux.CalendarEvents Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.CalendarEvents.html)

[Calendar with Linked List Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/simple-events-list.html)

## Ext.ux.Calendar

The main extension is contained in the root folder of the repository and can be included in your project (along with its CSS file located within 
the resources/css folder) and will give you a basic calendar view (either showing a month or a week) that can be configured with various options.

![Ext.ux.Calendar Screenshot](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/Ext.ux.Calendar-ss.png)

[Ext.ux.Calendar Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.Calendar.html)

## Ext.ux.CalendarSimpleEvents

This plugin can be added to an Ext.ux.Calendar instance to allow a store to be bound to the calendar so events can be shown in a similar style to the iPhone
does with a dot added to each day to represent the presence of an event.

![Ext.ux.CalendarSimpleEvents Screenshot](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/Ext.ux.CalendarSimpleEvents-ss.png)

[Ext.ux.CalendarSimpleEvents Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.CalendarSimpleEvents.html)

## Ext.ux.CalendarEvents

This plugin also allows a store to be bound to the Ext.ux.Calendar and will display the store's events as bars spanning its relevant days. 

![Ext.ux.CalendarEvents Screenshot](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/Ext.ux.CalendarEvents-ss.png)

[Ext.ux.CalendarEvents Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.CalendarEvents.html)

## Usage

### Ext.ux.Calendar

Include the extension's JS file and related CSS file in your HTML page.

    <link rel="stylesheet" type="text/css" href="resources/css/Ext.ux.Calendar.css" media="all"/>
    <script src="Ext.ux.Calendar.js" type="text/javascript" language="JavaScript"></script>
    
In your onReady function instantiate an Ext.ux.Calendar instance passing in any configuration options you want it to 
have. The extension extends the Ext.Panel class so can accept any of its configuration options too. There are no 
mandatory config options so a simple ``fullscreen: true`` is enough to get it showing.

    Ext.setup({
        onReady: function(){
  	                    
            var calendar = new Ext.ux.Calendar({
                fullscreen: true,
                mode: 'month',
                value: new Date()
            });
		
        }
    });
    
### Ext.ux.CalendarSimpleEvents

This plugin requires its own source JS and CSS to be included (within the Ext.ux.CalendarSimpleEvents folder) as well 
as the main extension's code.

    <script src="Ext.ux.CalendarSimpleEvents.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="resources/css/Ext.ux.CalendarSimpleEvents.css" media="all"/>
    
The next step is to create an ``Ext.data.Store`` with event data that we can bind to the calendar.

    Ext.regModel('Event', {
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
    });

    var eventStore = new Ext.data.Store({
        model: 'Event',
        data: [{
            event: 'Sencha Con',
            location: 'Austin, Texas',
            start: new Date(2011, 9, 23),
            end: new Date(2011, 9, 26)
        }]
    });
    
We can now instantiate the Ext.ux.CalendarSimpleEvents plugin within the main calendar's ``plugins`` configuration. We
also pass a ``store`` config option to the Ext.ux.Calendar.

    var calendar = new Ext.ux.Calendar({
        fullscreen: true,
        value: new Date(),
        
        store: eventStore,        
        plugins: [new Ext.ux.CalendarSimpleEvents()]
    });

### Ext.ux.CalendarEvents

Once again the plugins files must be included in your HTML file and a store created as we have done in the instructions 
above.

We can then instantiate the Ext.ux.CalendarEvents plugin and supply it with a simple ``Ext.XTemplate`` which will be 
used to render the contents of each Event's bar.

    var calendar = new Ext.ux.Calendar({
       fullscreen: true,
       value: new Date(),
       store: eventStore,
	
       plugins: [new Ext.ux.CalendarEvents({
           eventBarTpl: new Ext.XTemplate('{event} - {location}')
       })]
    });



