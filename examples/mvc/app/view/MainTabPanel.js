/**
 * TouchCalendar.view.MainTabPanel
 */
Ext.define('TouchCalendar.view.MainTabPanel', {

    extend: 'Ext.tab.Panel',
    
    alias: 'widget.MainTabPanel',
    
    config: {
    
    },
    
    initialize: function(){
        this.callParent(arguments);

	    this.setItems([{
		    xtype: 'calendar',
		    title: 'Calendar',
		    itemId: 'simpleCalendar',
		    viewMode: 'month',

		    value: new Date(),
		    enableEventBars: {
			    eventHeight: 'auto',
			    eventBarTpl: '<div>{event}</div>'
		    },
		    viewConfig: {
			    weekStart: 0,
			    eventStore: Ext.getStore('Events'),
			    timeSlotDateTpls: {
				    day: '<span class="hour">{date:date("g")}</span><span class="am-pm">{date:date("A")}</span>'
			    }
		    }
	    }, {
		    xtype: 'EventListPanel'
	    }]);
    
    }

});