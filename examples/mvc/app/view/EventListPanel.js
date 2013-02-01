/**
 * TouchCalendar.view.EventListPanel
 */
Ext.define('TouchCalendar.view.EventListPanel', {

    extend: 'Ext.Panel',

	requires: [
		'Ext.dataview.List',
		'Ext.layout.Fit'
	],

    alias: 'widget.EventListPanel',

    config: {
	    title   : 'Events List',
	    layout  : 'fit'
    },

    initialize: function(){
	    this.callParent(arguments);

	    this.setItems([{
		    xclass      : 'Ext.ux.TouchCalendarView',
		    itemId      : 'calendarView',
		    minDate     : Ext.Date.add((new Date()), Ext.Date.DAY, -40),
		    maxDate     : Ext.Date.add((new Date()), Ext.Date.DAY, 55),
		    viewMode    : 'month',
		    weekStart   : 0,
		    value       : new Date(),
		    eventStore  : Ext.getStore('Events'),

		    plugins     : [Ext.create('Ext.ux.TouchCalendarEvents', {
			    eventBarTpl: '{event} - {location}'
		    })]
	    }, {
		    docked      : 'bottom',
		    xtype       : 'list',
		    height      : 110,
		    itemTpl     : '{event} {location}',
		    store       : Ext.create('Ext.data.Store', {
			    model: 'TouchCalendar.model.Event',
			    data: []
		    })
	    }]);


    }

});