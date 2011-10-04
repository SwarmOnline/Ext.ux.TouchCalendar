/**
 * @copyright 		(c) 2011, by SwarmOnline.com
 * @date      		2nd October 2011
 * @version   		0.1
 * @documentation	
 * @website	  		http://www.swarmonline.com
 */
/**
 * @class Ext.ux.CalendarSimpleEvents
 * @author Stuart Ashworth
 */
Ext.ux.CalendarSimpleEvents = Ext.extend(Ext.util.Observable, {
	
	/**
	 * @cfg {Date} dateField Name of the field which contains the Event's date
	 */
	dateField: 'start',
	
	/**
	 * @cfg {Boolean} multiEventDots True to display a dot for each event on a day. False to only show one dot regardless
	 * of how many events there are
	 */
	multiEventDots: false,
	
	/**
	 * @cfg {String} wrapperCls CSS class that is added to the event dots' wrapper element
	 */
	wrapperCls: 'simple-event-wrapper',
	
	/**
	 * @cfg {String} eventDotCls CSS class that is added to the event dot element itself. Used to provide
	 * the dots' styling
	 */
	eventDotCls: 'simple-event',
	
	/**
	 * @cfg {Ext.XTemplate} eventTpl Template used to create the Event markup. Template is merged with the records left
	 * following the filter
	 * 
	 */
	eventTpl: new Ext.XTemplate(
	'<span class="{wrapperCls}">',
		'<tpl for="events">',
			'<span class="{[parent.eventDotCls]}"></span>',
		'</tpl>',
	'</span>'),
	
	/**
	 * Function used to filter the store for each of the displayed dates
	 * @method
	 * @private
	 * @param {Object} record - current record
	 * @param {Object} id - ID of passed in record
	 * @param {Object} currentDate - date we are currently dealing while looping Calendar's dateCollection property
	 */
	filterFn: function(record, id, currentDate){
		return record.get(this.dateField).clearTime(true).getTime() === currentDate.clearTime(true).getTime();
	},
	
	init: function(calendar){
		
		this.calendar = calendar; // cache the parent calendar
		this.calendar.simpleEventsPlugin = this; // cache the plugin instance on the calendar itself
		
		this.wrapperCls = this.wrapperCls + (this.multiEventDots ? '-multi' : '');
		this.eventDotCls = this.eventDotCls + (this.multiEventDots ? '-multi' : '');
		
		this.calendar.showEvents = this.showEvents;
		this.calendar.hideEvents = this.hideEvents;
		this.calendar.removeEvents = this.removeEvents;
		
		// listen to the Calendar's 'refresh' event and render events when it fires
		this.calendar.on({
			refresh: this.renderEvents,
			initialrender: this.renderEvents,
			scope: this
		});
	},
	
	/**
	 * Function to execute when the Calendar is refreshed.
	 * It loops through the Calendar's current dateCollection and gets all Events
	 * for the current date and inserts the appropriate markup
	 * @method
	 * @private
	 * @return {void}
	 */
	renderEvents: function(){
		if (!this.disabled) {
			var dc = this.calendar.dateCollection;

			if (dc) {
				// loop through Calendar's current dateCollection
				dc.each(function(dateObj){
					var date = dateObj.date;
					
					var cell = this.calendar.getDateCell(date); // get the table cell for the current date
					var store = this.calendar.store;
					
					if (cell) {
						store.clearFilter();

						// if we only want to show a single dot per day then use findBy for better performance
						var matchIndex = store[this.multiEventDots ? 'filterBy' : 'findBy'](Ext.createDelegate(this.filterFn, this, [date], true));
						
						if ((!this.multiEventDots && matchIndex > -1) || (this.multiEventDots && store.getRange().length > 0)) {
							// append the event markup
							var t = this.eventTpl.append(cell, {
								events: (this.multiEventDots ? store.getRange() : ['event']),
								wrapperCls: this.wrapperCls,
								eventDotCls: this.eventDotCls
							}, true);
						}
					}
				}, this);
			}
		}
	},
	
	/**
	 * Hides all the event markers
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	hideEvents: function(){
		this.simpleEventsPlugin.disabled = true;
		
		this.body.select('span.' + this.wrapperCls).hide();
	},
	
	/**
	 * Shows all the event markers
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	showEvents: function(){
		this.simpleEventsPlugin.disabled = false;
		
		this.body.select('span.' + this.wrapperCls).show();
	},
	
	/**
	 * Removes all the event markers and their markup
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	removeEvents: function(){
		this.body.select('span.' + this.wrapperCls).remove();
	}	
});
