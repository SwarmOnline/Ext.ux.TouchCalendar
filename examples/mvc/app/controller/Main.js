/**
 * TouchCalendar.controller.Main
 */
Ext.define('TouchCalendar.controller.Main', {

    extend: 'Ext.app.Controller',

	requires: [
		'Ext.ux.TouchCalendarEventsBase',
		'Ext.ux.TouchCalendarMonthEvents',
		'Ext.ux.TouchCalendarWeekEvents',
		'Ext.ux.TouchCalendarDayEvents',
		'Ext.ux.TouchCalendarEvents',

		'Ext.ux.TouchCalendarSimpleEvents',

		'Ext.ux.TouchCalendarView',
		'Ext.ux.TouchCalendar'
	],

    config: {
        views: [
			'MainTabPanel',
			'EventListPanel'
        ],

        refs: {
	        mainTabPanel        : 'MainTabPanel',
			simpleCalendar      : 'MainTabPanel #simpleCalendar',
	        eventListCalendar   : 'EventListPanel #calendarView',
	        eventList           : 'EventListPanel list'
        },

        control: {
	        simpleCalendar: {
				eventtap        : 'onEventTap',
				periodchange    : 'onPeriodChange',
				selectionchange : 'onSelectionChange'
			},

	        eventListCalendar: {
		        selectionchange : 'onEventListCalendarSelectionChange'
	        }
        }
    },

	/**
	 * Handler for the SimpleCalendar's 'eventtap' event.
	 * @method
	 * @private
	 * @param {TouchCalendar.model.Event} event The Event record that was tapped
	 */
	onEventTap: function(event){
		console.log('eventtap');
	},

	/**
	 * Handler for the SimpleCalendar's 'periodchange' event.
	 * @method
	 * @private
	 * @param {Ext.ux.TouchCalendarView} view The underlying Ext.ux.TouchCalendarView instance
	 * @param {Date} minDate The min date of the new period
	 * @param {Date} maxDate The max date of the new period
	 * @param {String} direction The direction the period change moved.
	 */
	onPeriodChange: function(view, minDate, maxDate, direction){
		console.log('periodchange');
	},

	/**
	 * Handler for the SimpleCalendar's 'selectionchange' event.
	 * @method
	 * @private
	 * @param {Ext.ux.TouchCalendarView} view The underlying Ext.ux.TouchCalendarView instance
	 * @param {Date} newDate The new date that has been selected
	 * @param {Date} oldDate The old date that was previously selected

	 */
	onSelectionChange: function(view, newDate, oldDate){
		console.log('selectionchange');
	},

	/**
	 * Handler for the EventListPanel Calendar's 'selectionchange' event.
	 * This is used to update the contents of the EventListPanel's list store's contents
	 * with the events that fall on that day.
	 * @method
	 * @private
	 * @param {Ext.ux.TouchCalendarView} view The underlying Ext.ux.TouchCalendarView instance
	 * @param {Date} newDate The new date that has been selected
	 * @param {Date} oldDate The old date that was previously selected
	 */
	onEventListCalendarSelectionChange: function(view, newDate, oldDate){
		console.log('selectionchange');

		var eventList   = this.getEventList(),
			calendar    = this.getEventListCalendar();

		// clear the filter on the EventStore so we're dealing with all the records
		calendar.eventStore.clearFilter();

		// filter the EventStore based on the selected date
		calendar.eventStore.filterBy(function(record){
			var startDate = Ext.Date.clearTime(record.get('start'), true).getTime(),
				endDate = Ext.Date.clearTime(record.get('end'), true).getTime();

			return (startDate <= newDate) && (endDate >= newDate);
		}, this);

		// remove all the items from the EventList's store
		eventList.getStore().removeAll();

		// add the filtered records from the EventStore to the EventListStore
		eventList.getStore().setData(calendar.eventStore.getRange());
	}

});