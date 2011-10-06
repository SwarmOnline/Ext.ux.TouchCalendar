/*!
 * Ext.ux.Calendar
 */
Ext.ns('Ext.ux');

/**
 * @copyright 		(c) 2011, by SwarmOnline.com
 * @date      		2nd October 2011
 * @version   		0.1
 * @documentation	
 * @website	  		http://www.swarmonline.com
*/
/**
 * @class Ext.ux.Calendar
 * @author Stuart Ashworth
 * 
 * A simple Calendar extension that can be integrated into any Sencha Touch application.
 * 
 * ![Ext.ux.Calendar Screenshot](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/Ext.ux.Calendar-ss.png)
 * 
 * # Simple Usage
 *     var calendar = new Ext.ux.Calendar({
           fullscreen: true,
           mode: 'month',
           weekStart: 1,
           value: new Date()
       });
 *    
 * # Demo
 * [Ext.ux.Calendar Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.Calendar.html)
 */
Ext.ux.Calendar = Ext.extend(Ext.Panel, {

	cls: 'ux-calendar',
	autoHeight: true,
	
	/**
	 * @cfg {Date} value Initially selected date.
	 */
	value: new Date(),
	
	/**
	 * @cfg {Number} weekStart Starting day of the week. (0 = Sunday, 1 = Monday ... etc)
	 */
	weekStart: 1,
	
	/**
	 * @cfg {Date} minDate Minimum date allowed to be shown/selected.
	 */
	minDate: null,
	
	/**
	 * @cfg {Date} maxDate Maximum date allowed to be shown/selected.
	 */
	maxDate: null,
	
	/**
	 * @cfg {Boolean} fullHeight True to have the calendar fill the height of the Panel
	 */
	fullHeight: true,
	
	/**
	 * @cfg {Boolean} moveToMonthOnDateTap True to have the calendar switch month if the user
	 * taps a date that is part of the next/previous month.
	 */
	moveToMonthOnDateTap: false,
	
	/**
	 * @cfg {String} todayCls CSS class added to the today's date cell 
	 */
	todayCls: 'today',
	
	/**
	 * @cfg {String} selectedCls CSS class added to the date cell that is currently selected 
	 */
	selectedCls: 'selected',
	
	/**
	 * @cfg {String} unselectableCls CSS class added to any date cells that are unselectable
	 */
	unselectableCls: 'unselectable',
	
	/**
	 * @cfg {String} prevMonthCls CSS class added to any date cells that are part of the previous month
	 */
	prevMonthCls: 'prev-month',
	
	/**
	 * @cfg {String} nextMonthCls CSS class added to any date cells that are part of the next month
	 */
	nextMonthCls: 'next-month',
	
	/**
	 * @cfg {String} weekendCls CSS class added to any date cells that are on the weekend
	 */
	weekendCls: 'weekend',
	
	/**
	 * @cfg {String} prevPeriodCls CSS class added to the previous period navigation cell in the calendar's header
	 */
	prevPeriodCls: 'goto-prev',
	
	/**
	 * @cfg {String} nextPeriodCls CSS class added to the next period navigation cells in the calendar's header
	 */
	nextPeriodCls: 'goto-next',
	
	/**
	 * Object containing common functions to be passed to XTemplate for internal use
	 * @property {Object} commonTemplateFunctions
	 * @private
	 */
	commonTemplateFunctions: {
		
		/**
		 * Gets the classes that should be applied to the current day's cell
		 * @method
		 * @private
		 * @param {Object} values 
		 * @return {String}
		 */
		getClasses: function(values){
			var classes = [];
			
			if(values.selected){
				classes.push(this.me.selectedCls);
			}
			if(values.unselectable){
				classes.push(this.me.unselectableCls);
			}
			if(values.prevMonth){
				classes.push(this.me.prevMonthCls);
			}
			if(values.nextMonth){
				classes.push(this.me.nextMonthCls);
			}
			if(values.weekend){
				classes.push(this.me.weekendCls);
			}
			if(values.today){
				classes.push(this.me.todayCls);
			}
			
			return classes.join(' ');
		},
		
		/**
		 * Returns true if the specific index is at the end of the row
		 * Used to determine if a row terminating tag is needed
		 * @method
		 * @private
		 * @param {Number} currentIndex
		 * @return {Number}
		 */
		isEndOfRow: function(currentIndex){
			return (currentIndex % 7) === 0 && (currentIndex > 0)
		},
		
		/**
		 * Returns true if the specific index is at the current mode's period
		 * Used to determine if another row opening tag is needed
		 * @param {Number} currentIndex
		 * @method
		 * @private
		 * @return {Number}
		 */
		isEndOfPeriod: function(currentIndex){
			return currentIndex === this.me.totalDays[this.me.mode](this.me.value);
		},
		
		/**
		 * Gets an array containing the first 7 dates to be used in headings
		 * @method
		 * @private
		 * @param {Object} values
		 * @return {Date[]}
		 */
		getDaysArray: function(values){
			var daysArray = [],
				i;
			
			for(i = 0; i < 7; i++){
				daysArray.push(values.dates[i])	
			}
			
			return daysArray;
		},
		
		/**
		 * Gets the class to be added to the header cells
		 * @method
		 * @private
		 * @param {Number} currentIndex
		 * @return {Boolean}
		 */
		getHeaderClass: function(currentIndex){
			return currentIndex === 1 ? this.me.prevPeriodCls : currentIndex === 7 ? this.me.nextPeriodCls : '';
		}
	},
	

	/**
	 * Instantiate a new calendar
	 * @method
	 */
	constructor: function(config) {
	
		this.tpl = new Ext.XTemplate(
		'<table class="{[this.me.mode]}">',		
			'<thead>',
				'<tr>',
					'<tpl for="this.getDaysArray(values)">',
						'<th class="{[this.getHeaderClass(xindex)]}">',
							'<tpl if="xindex === 4">',
								'<span>{[parent.currentDate.format("F")]} {[parent.currentDate.format("Y")]}</span>',
							'</tpl>',
							'{date:date("D")}',
						'</th>',
					'</tpl>',
				'</tr>',
			'</thead>',
		
			'<tbody>',
				'<tr>',
				'<tpl for="dates">',
				
					'<td class="day {[this.getClasses(values)]}" datetime="{[this.me.getDateAttribute(values.date)]}">',
						'{date:date("j")}',
					'</td>',
					
					'<tpl if="this.isEndOfRow(xindex)">',
						'</tr>',
						'<tpl if="!this.isEndOfPeriod(xindex)">',
							'<tr>',
						'</tpl>',
					'</tpl>',
				
				'</tpl>',
				'</tr>',
			'</tbody>',
		'</table>', Ext.apply(this.commonTemplateFunctions, {me: this}));

		Ext.apply(this, config || {});

		this.addEvents(
		
			/**
			 * @event refresh Fires when the Calendar's view is regenerated
			 * @param {Ext.ux.Calendar} this 
			 */
			'refresh',
			
			/**
			 * @event initialrender Fires when the Calendar's view is first rendered
			 * @param {Ext.ux.Calendar} this
			 */
			'initialrender',
			
			/**
			 * @event selectionchange Fires when the Calendar's selected date is changed
			 * @param {Ext.ux.Calendar} this
			 * @param {Date} previousValue Previously selected date
			 * @param {Date} newValue Newly selected date
			 */
			'selectionchange',
			
			/**
			 * @event periodchange Fires when the calendar changes to a different date period (i.e. switch using the arrows)
			 * @param {Ext.ux.Calendar} this
			 * @param {Date} minDate New view's minimum date
			 * @param {Date} maxDate New view's maximum date
			 * @param {string} direction Direction that the view moved ('forward' or 'back')
			 */
			'periodchange'
		
		);

		Ext.ux.Calendar.superclass.constructor.call(this, config);

		this.minDate = this.minDate ? this.minDate.clearTime(true) : null;
		this.maxDate = this.maxDate ? this.maxDate.clearTime(true) : null;
	},
	
	initComponent: function(){
		
		Ext.apply(this, {
						
			totalDays: {
				month: function(date){
					var firstDate = date.getFirstDateOfMonth();
					
					return this.isWeekend(firstDate) ? 42 : 35;
				},
				week: function(date){
					return 7;
				}
			},
			
			modeStartFns: {
				month: this.getMonthStartDate,
				week: this.getWeekStartDate
			},
			
			modeDeltaFns: {
				month: this.getMonthDeltaDate,
				week: this.getWeekDeltaDate
			}
		});
		
		Ext.ux.Calendar.superclass.initComponent.call(this);
		
		this.previousValue = this.value;
		
		this.on('afterrender', Ext.createDelegate(this.refresh, this, [true], false), this);
	},

	onRender: function(ct, position) {
		Ext.ux.Calendar.superclass.onRender.apply(this, arguments);

		this.body.on({
			click: this.onDayTap,
			scope: this,
			delegate: 'td'
		});
		
		this.body.on({
			click: this.onTableHeaderTap,
			scope: this,
			delegate: 'th'
		});
	},
	
	/**
	 * Changes the Calendar's mode
	 * @method
	 * @param {String} mode Valid values are 'month' and 'week'
	 * @return {void}
	 */
	setMode: function(mode){
		this.mode = mode;
		
		this.refresh();
	},
	
	/**
	 * Updates the Calendar's table's height to match the wrapping Panel if
	 * fullHeight is set to true
	 * @method
	 * @private
	 * @return {void}
	 */
	syncHeight: function(){
		if(this.fullHeight){
			this.body.down('table').setHeight(this.body.getHeight());
		}
	},

	/**
	 * Refreshes the Calendar focussed around the date in "this.value".
	 * Fires the 'refresh' event
	 * @method
	 * @return {void}
	 */
	refresh: function(initialRender) {
		this.currentDate = this.currentDate || this.value || new Date();
		
		this.dateCollection = this.getDateCollection(this.currentDate.getDate(), this.currentDate.getMonth(), this.currentDate.getFullYear());
		
		this.update({
			currentDate: this.currentDate,
			dates: this.dateCollection.items
		});
		// will force repaint() on iPod Touch 4G
		this.body.getHeight();

		this.syncHeight();
		
		this.dateCellEls = this.body.select('td.day');
		
		if (initialRender) {
			this.fireEvent('initialrender', this);
		}
		else {
			this.fireEvent('refresh', this);
		}
	},
	
	/**
	 * Handler for a tap on a day's cell
	 * @method
	 * @private
	 * @param {Object} e
	 * @param {Object} el
	 * @return {void}
	 */
	onDayTap: function(e, el){
		el = Ext.fly(el);
	
		if (!el.hasCls(this.unselectableCls)) {
			this.setValue(this.getCellDate(el));
		}
	},
	
	/**
	 * Handler for a tap on the table header
	 * @method
	 * @private
	 * @param {Object} e
	 * @param {Object} el
	 * @return {void}
	 */
	onTableHeaderTap: function(e, el){
		el = Ext.fly(el);

		if (el.hasCls(this.prevPeriodCls) || el.hasCls(this.nextPeriodCls)) {
			this.refreshDelta(el.hasCls(this.prevPeriodCls) ? -1 : 1);
		}
	},
	
	/**
	 * Set selected date.
	 * @method
	 * @param {Date} v Date to select.
	 * @return {void}
	 */
	setValue: function(v) {
		if (!this.isSameDay(this.value, v)) {
			this.previousValue = this.value;
			
			if (Ext.isDate(v)) {
				this.value = v;
			}
			else {
				this.value = null;
			}
			
			if (this.value) {
				this.currentDate = this.value;
				this.selectDate(this.value);
			}
		}
	},
	
	/**
	 * Adds the selected class to the specified date's cell. If it isn't in the current view
	 * then the calendar will be refreshed to move the date into view.
	 * @method
	 * @param {Object} date
	 * @return {void}
	 */
	selectDate: function(date) {
		var selectionChanged = false; // flag to store whether a date was selected on the current page
		
		this.removeSelectedCell();
		
		this.body.select('td').each(function(td) {
			var clickedDate = this.getCellDate(td);
			if (((!td.hasCls(this.prevMonthCls) && !td.hasCls(this.nextMonthCls)) || !this.moveToMonthOnDateTap) && this.isSameDay(date, clickedDate)) {
				td.addCls(this.selectedCls);
					
				if((this.value && this.previousValue) && !this.isSameDay(this.value, this.previousValue)){
					this.fireEvent('selectionchange', this, this.previousValue, this.value);	
				}
				
				selectionChanged = true;
			}
		}, this);
		
		// if no date was selected then it 
		// isn't in this month and so we must refresh the view completely
		if(!selectionChanged){
			this.refresh();
		}
	},
	
	/**
	 * Refreshes the calendar moving it forward (delta = 1) or backward (delta = -1)
	 * @method
	 * @param {Number} delta - integer representing direction (1 = forward, =1 = backward)
	 * @return {void}
	 */
	refreshDelta: function(delta) {
		var v = this.currentDate || new Date();

		var newDate = this.modeDeltaFns[this.mode](v, delta);

		// don't move if we've reached the min/max dates
		if (this.isOutsideMinMax(newDate)) {
			return;
		}

		this.currentDate = newDate;
		this.refresh();
		
		var minMaxDate = this.getPeriodMinMaxDate();
		
		this.fireEvent('periodchange', this, minMaxDate.min.date, minMaxDate.max.date, (delta > 0 ? 'forward' : 'back'));
	},
	
	/**
	 * Returns the current view's minimum and maximum date collection objects
	 * @method
	 * @private
	 * @return {Object} Object in the format {min: {}, max: {}}
	 */
	getPeriodMinMaxDate: function(){
		return {
			min: this.dateCollection.first(),
			max: this.dateCollection.last()
		};
	},
	
	/**
	 * Returns true or false depending on whether the view that is currently on display is outside or inside the min/max dates set
	 * @method
	 * @private
	 * @param {Date} date A date within the current period, generally the selected date
	 * @return {Boolean}
	 */
	isOutsideMinMax: function(date){
		var outside = false;
		
		if(this.mode === 'month'){
			outside = ((this.minDate && date.getLastDateOfMonth() < this.minDate) || (this.maxDate && date.getFirstDateOfMonth() > this.maxDate));
		} else {
			outside = ((this.minDate && this.getWeekEndDate(date.getDate(), date.getMonth(), date.getFullYear()) < this.minDate) || (this.maxDate && this.getWeekStartDate(date.getDate(), date.getMonth(), date.getFullYear()) > this.maxDate));
		}
		
		return outside;
	},
	
	/**
	 * Removes the selectedCls from any cells that have it
	 * @method
	 * @return {void}
	 */
	removeSelectedCell: function() {
		this.body.select('.' + this.selectedCls).removeCls(this.selectedCls);
	},
	
	/**
	 * Builds a collection of dates that need to be rendered in the current configuration
	 * @method
	 * @private
	 * @param {Number} day
	 * @param {Number} month
	 * @param {Number} year
	 * @return {Ext.util.MixedCollection} Mixed Collection of Objects with configuration for each date cell
	 */
	getDateCollection: function(day, month, year){
		var dateCollection = new Ext.util.MixedCollection(), // collection to store all the dates to be rendered
			unselectable = true, // variable used to indicate whether a day is allowed to be selected
			baseDate = new Date(year, month, day), // date to use as base
		
			iterDate = Ext.createDelegate(this.modeStartFns[this.mode], this)(day, month, year), // date current mode will start at
			totalDays = Ext.createDelegate(this.totalDays[this.mode], this)(baseDate); // total days to be rendered in current mode
		
		// create dates based on startDate and number of days to render
		for(var i = 0; i < totalDays; i++){
			
			// increment the date by one day (except on first run)
			iterDate = new Date(iterDate.getFullYear(), iterDate.getMonth(), iterDate.getDate() + (i===0?0:1));
			
			unselectable = (this.minDate && iterDate < this.minDate) || (this.maxDate && iterDate > this.maxDate);
			
			// add to the collection
			dateCollection.add({
				today: this.isSameDay(iterDate, new Date()),
				unselectable: unselectable,
				selected: this.isSameDay(iterDate, this.value) && !unselectable,
				prevMonth: (iterDate.getMonth() < baseDate.getMonth()),
				nextMonth: (iterDate.getMonth() > baseDate.getMonth()),
				weekend: this.isWeekend(iterDate),
				date: iterDate
			});
		}
		
		return dateCollection;
	},
	
	/**
	 * Returns the first day that should be visible for a month view (may not be in the same month)
	 * Gets the first day of the week that the 1st of the month falls on.
	 * @method
	 * @private
	 * @param {Number} day
	 * @param {Number} month - 0 based month representation (0 = Jan, 11 = Dec)
	 * @param {Number} year
	 * @return {Date}
	 */
	getMonthStartDate: function(day, month, year){
		return this.getWeekStartDate(1, month, year);
	},
	
	/**
	 * Returns the first day of the week based on the specified date.
	 * @method
	 * @private
	 * @param {Number} day
	 * @param {Number} month - 0 based month representation (0 = Jan, 11 = Dec)
	 * @param {Number} year
	 * @return {Date}
	 */
	getWeekStartDate: function(day, month, year){
		var currentDate = new Date(year, month, day);
		var dayOffset = currentDate.getDay() - this.weekStart;
		dayOffset = dayOffset < 0 ? 6 : dayOffset;
		
		return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-0-dayOffset);
	},
	
	/**
	 * Returns the last day of the week based on the specified date.
	 * @method
	 * @private
	 * @param {Number} day
	 * @param {Number} month - 0 based month representation (0 = Jan, 11 = Dec)
	 * @param {Number} year
	 * @return {Date}
	 */
	getWeekEndDate: function(day, month, year){
		var currentDate = new Date(year, month, day);
		var dayOffset = currentDate.getDay() - this.weekStart;
		dayOffset = dayOffset < 0 ? 6 : dayOffset;
		
		return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()+0+dayOffset);
	},
	
	/**
	 * Returns a new date based on the date passed and the delta value for MONTH view.
	 * @method
	 * @private
	 * @param {Date} date
	 * @param {Number} delta
	 * @return {Date}
	 */
	getMonthDeltaDate: function(date, delta){
		var newMonth = date.getMonth() + delta,
			newDate = new Date(date.getFullYear(), newMonth, 1);
		
		newDate.setDate(newDate.getDaysInMonth() < date.getDate() ? newDate.getDaysInMonth() : date.getDate());
		
		return newDate;
	},
	
	/**
	 * Returns a new date based on the date passed and the delta value for WEEK view.
	 * @method
	 * @private
	 * @param {Date} date
	 * @param {Number} delta
	 * @return {Date}
	 */
	getWeekDeltaDate: function(date, delta){
		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (delta * 7));
	},
	
	/**
	 * Returns true if the two dates are the same date (ignores time)
	 * @method
	 * @private
	 * @param {Object} date1
	 * @param {Object} date2
	 * @return {Boolean}
	 */
	isSameDay: function(date1, date2){
		return date1.clearTime(true).getTime() === date2.clearTime(true).getTime();
	},
	/**
	 * Returns true if the specified date is a Saturday/Sunday
	 * @method
	 * @private
	 * @param {Object} date
	 * @return {Boolean}
	 */
	isWeekend: function(date){
		return date.getDay() === 0 || date.getDay() === 6;
	},

	/**
	 * Returns the Date associated with the specified cell
	 * @method
	 * @param {Ext.Element} dateCell
	 * @return {Date}
	 */
	getCellDate: function(dateCell) {
		var date = dateCell.dom.getAttribute('datetime');
		return this.stringToDate(date);
	},
	
	/**
	 * Returns the cell representing the specified date
	 * @method
	 * @param {Ext.Element} date
	 * @return {Ext.Element}
	 */
	getDateCell: function(date){
		return this.body.select('td[datetime="' + this.getDateAttribute(date) + '"]').first();
	},
	
	/**
	 * Returns a string format of the specified date
	 * Used when assigning the datetime attribute to a table cell
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {String}
	 */
	getDateAttribute: function(date){
		return date.format('Y-m-d');
	},

	/**
	 * Converts a string date (used to add to table cells) to a Date object
	 * @method
	 * @private
	 * @param {String} dateString
	 * @return {Date}
	 */
	stringToDate: function(dateString) {
		return Date.parseDate(dateString, 'Y-m-d');
	}
});
/**
 * @copyright 		(c) 2011, by SwarmOnline.com
 * @date      		2nd October 2011
 * @version   		0.1
 * @documentation	
 * @website	  		http://www.swarmonline.com
 */
/**
 * @class Ext.ux.CalendarEvents
 * @author Stuart Ashworth
 */
Ext.ux.CalendarEvents = Ext.extend(Ext.util.Observable, {

    /**
     * @cfg {String} startEventField Name of the Model field which contains the Event's Start date
     */
    startEventField: 'start',
    
    /**
     * @cfg {Stirng} endEventField Name of the Model field which contains the Event's End date
     */
    endEventField: 'end',
	
	/**
	 * @cfg {String} colourField Name of the Model field which contains a colour to be applied to the 
	 * event bar
	 */
	colourField: 'colour',
    
    /**
     * @cfg {String} eventBarCls Base CSS class given to each EventBar
     */
    eventBarCls: 'event-bar',
    
    /**
     * @cfg {String} eventWrapperCls CSS class given to the EventBars' wrapping element
     */
    eventWrapperCls: 'event-wrapper',
    
    /**
     * @cfg {String} eventBarSelectedCls CSS class given to the EventBar after it has been selected
     */
    eventBarSelectedCls: 'event-bar-selected',
    
	/**
	 * @cfg {String} cellHoverCls CSS class given to date cells when an event is dragged over
	 */
    cellHoverCls: 'date-cell-hover',
    
	/**
	 * @cfg {Boolean} autoUpdateEvent Decides whether the configured startEventField and endEventField 
	 * dates are updated after an event is dragged and dropped
	 */
	autoUpdateEvent: true,
	
	/**
	 * @cfg {Boolean} allowEventDragAndDrop Decides whether the Event Bars can be dragged and dropped
	 */
	allowEventDragAndDrop: false,
	
    /**
     * @cfg {Number} eventBarSpacing Space (in pixels) between EventBars
     */
    eventBarSpacing: 1,
	
	/**
	 * @cfg {Ext.XTemplate} eventBarTpl Template that will be used to fill the Event Bar
	 */
	eventBarTpl: new Ext.XTemplate('{title}'),
    
    init: function(calendar){
    
        this.calendar = calendar; // cache the parent calendar
        this.calendar.eventsPlugin = this; // cache the plugin instance on the calendar itself  
        
		this.calendar.addEvents(
		
			/**
			 * @event eventtap
			 * Fires when an Event Bar is tapped
			 * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
			 * @param {Event} e The event object for the tap operation 
			 */
			'eventtap',
			
			/**
			 * @event eventdragstart
			 * Fires when an Event Bar is initially dragged.
			 * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
			 * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
			 * @param {Event} e The event object for the drag operation
			 */
			'eventdragstart',
			
			/**
			 * @event beforeeventdrop
			 * Fires before an Event Bar drop is accepted. Return false to prevent the drop from 
			 * happening. This event can be used to add additional validation for Event moves
			 * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
			 * @param {Ext.util.Droppable} droppable The Calendar's Ext.util.Droppable instance
			 * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
			 * @param {Event} e The event object for the drag operation
			 */
			'beforeeventdrop',
			
			/**
			 * @event eventdrop
			 * Fires when an Event Bar is dragged and dropped on a date
			 * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
			 * @param {Ext.util.Droppable} droppable The Calendar's Ext.util.Droppable instance
			 * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
			 * @param {Event} e The event object for the drag operation
			 */
			'eventdrop',
			
			/**
			 * @event eventdrag
			 * Fires while an Event Bar is being dragged.
			 * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
			 * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
			 * @param {Date} currentDate The date that the Event Bar is currently over
			 * @param {Ext.Element} currentDateCell The Ext.Element representing the table cell of the current date
			 * @param {Event} e The event object for the drag operation
			 */
			'eventdrag'
			
		);
        
        this.calendar.on({
			initialrender: this.refreshEvents,
            refresh: this.refreshEvents,
            scope: this
        });
    },
    
    /**
     * Regenerates the Event Bars
     * @method
     * @return {void}
     */
    refreshEvents: function(){
        this.removeEvents();
        
        this.generateEventBars();
        
        this.createEventWrapper();
        
        this.renderEventBars(this.eventBarStore);
        
		if (this.allowEventDragAndDrop) {
			this.createDroppableRegion();
		}
    },
	
	/**
	 * Creates a Ext.util.Droppable region for the Calendar's body element
	 * @method
	 * @private
	 */
	createDroppableRegion: function(){
		var me = this;
		var onDragCount = 0;
		/**
		 * @property {Ext.util.Droppable} droppable Contains the Ext.util.Droppable instance on the Calendar's body element
		 */
		this.droppable = new Ext.util.Droppable(this.calendar.body, {
			/**
			 * Override for Droppable's onDrag function to add hover class to active date cell
			 * @method			 
			 * @private
			 * @param {Object} draggable
			 * @param {Object} e
			 */
            onDrag: function(draggable, e){
				if (draggable.el.hasCls(me.eventBarCls)) {
					this.setCanDrop(this.isDragOver(draggable), draggable, e);
					onDragCount++;

					if (onDragCount % 15 === 0) {
						var currentDateCell, currentDate, eventRecord = me.getEventRecord(draggable.el.getAttribute('eventID'));
						
						me.calendar.dateCellEls.removeCls(me.cellHoverCls);
						
						me.calendar.dateCellEls.each(function(cell, index){
							var cellRegion = cell.getPageBox(true);
							var eventBarRegion = draggable.el.getPageBox(true);
							
							if (cellRegion.partial(eventBarRegion)) {
								currentDateCell = cell;
								currentDate = this.calendar.getCellDate(cell);
								
								cell.addCls(me.cellHoverCls);
								return;
							}
						}, me);
						
						me.calendar.fireEvent('eventdrag', draggable, eventRecord, currentDate, currentDateCell, e);
						onDragCount = 0;
					}
				}
			}
        });
		
		this.droppable.on({
			drop: this.onEventDrop,
            dropdeactivate: this.onEventDropDeactivate,
            scope: this
		});
	},
	
	/**
	 * Handler for when an Event's drag is invalid and must be reset
	 * @method
	 * @private
	 * @param {Ext.util.Droppable} droppable
	 * @param {Ext.util.Draggable} draggable
	 * @param {Event} e
	 * @param {Object} opts
	 */
	onEventDropDeactivate: function(droppable, draggable, e, opts){
		if (draggable.el.hasCls(this.eventBarCls)) {
			var eventRecord = this.getEventRecord(draggable.el.getAttribute('eventID'));
			
			// reshow all the hidden linked Event Bars
			this.calendar.body.select('div.' + eventRecord.internalId).each(function(eventBar){
				eventBar.show();
			}, this);
		}
    },
	
	/**
	 * Function to handle the dropping of an event onto the calendar.
	 * Figures out what date is was dropped on and updates its store with the new details.
	 * @method
	 * @private
	 * @param {Ext.util.Droppable} droppable
	 * @param {Ext.util.Draggable} draggable
	 * @param {Event} e
	 * @param {Object} opts
	 */
	onEventDrop: function(droppable, draggable, e, opts){
        var validDrop = false;
        
		this.calendar.dateCellEls.each(function(cell){
            var cellRegion = cell.getPageBox(true);
            var eventBarRegion = draggable.el.getPageBox(true);
            
            if (cellRegion.partial(eventBarRegion) && this.calendar.fireEvent('beforeeventdrop', draggable, droppable, eventRecord, e)) {
                validDrop = true;                       
                var eventRecord = this.getEventRecord(draggable.el.getAttribute('eventID')),
					droppedDate = this.calendar.getCellDate(cell),
					daysDifference = this.getDaysDifference(eventRecord.get(this.startEventField), droppedDate);
                
				if (this.autoUpdateEvent) {
					eventRecord.set(this.startEventField, droppedDate);
					eventRecord.set(this.endEventField, eventRecord.get(this.endEventField).add(Date.DAY, daysDifference));
				}
                
                this.refreshEvents();
				
				this.calendar.fireEvent('eventdrop', draggable, droppable, eventRecord, e)
                
                return;
            }  
        }, this);
		
		this.calendar.dateCellEls.removeCls(this.cellHoverCls);
        
        if (!validDrop) { // if it wasn't a valid drop then move the Event Bar back to its original location
			draggable.setOffset(draggable.startOffset, true);
        }
    },
    
    /**
     * Processes the Events store and generates the EventBar records needed to create the markup
     * @method
     * @private
     */
    generateEventBars: function(){
		/**
		 * @property {Ext.data.Store} eventBarStore Store to store the Event Bar definitions. It is defined 
		 * with the Ext.ux.CalendarEventBarModel model.
		 * @private
		 */
        this.eventBarStore = new Ext.data.Store({
            model: 'Ext.ux.CalendarEventBarModel',
            data: []
        });
        
        var dates = this.calendar.dateCollection;
        var store = this.calendar.store;
        var eventBarRecord;
        
        // Loop through Calendar's date collection of visible dates
        dates.each(function(dateObj){
            var currentDate = dateObj.date,
				currentDateTime = currentDate.clearTime(true).getTime(),
				takenDatePositions = []; // stores 'row positions' that are taken on current date
				
            // Filter the Events Store for events that are happening on the currentDate
            store.filterBy(function(record){
                var startDate = record.get(this.startEventField).clearTime(true).getTime(),
					endDate = record.get(this.endEventField).clearTime(true).getTime();
                
                return (startDate <= currentDateTime) && (endDate >= currentDateTime);
            }, this);
            
            // sort the Events Store so we have a consistent ordering to ensure no overlaps
            store.sort(this.startEventField, 'ASC');
            
            // Loop through currentDate's Events
            store.each(function(event){
                // Find any Event Bar record in the EventBarStore for the current Event's record (using internalID)
                var eventBarIndex = this.eventBarStore.findBy(function(record, id){
                    return record.get('EventID') === event.internalId;
                }, this);
                
                // if an EventBarRecord was found then it is a multiple day Event so we must link them
                if (eventBarIndex > -1) {
                    eventBarRecord = this.eventBarStore.getAt(eventBarIndex); // get the actual EventBarRecord
                    
                    // recurse down the linked EventBarRecords to get the last record in the chain for
                    // wrapping Events
                    while (eventBarRecord.linked().getCount() > 0) {
                        eventBarRecord = eventBarRecord.linked().getAt(eventBarRecord.linked().getCount() - 1);
                    }
                    
                    // if currentDate is at the start of the week then we must create a new EventBarRecord
                    // to represent the new bar on the next row.
                    if (currentDate.getDay() === this.calendar.weekStart) {
                        // push the inherited BarPosition of the parent 
                        // EventBarRecord onto the takenDatePositions array
                        takenDatePositions.push(eventBarRecord.get('BarPosition'));
                        
                        // create a new EventBar record 
                        var wrappedEventBarRecord = Ext.ModelMgr.create({
                            EventID: event.internalId,
                            Date: currentDate,
                            BarLength: 1,
                            BarPosition: eventBarRecord.get('BarPosition'),
							Colour: eventBarRecord.get('Colour'),
                            Record: event
                        }, 'Ext.ux.CalendarEventBarModel');
                        
                        // add it as a linked EventBar of the parent
                        eventBarRecord.linked().add(wrappedEventBarRecord);
                    }
                    else {
                        // add the inherited BarPosition to the takenDatePositions array
                        takenDatePositions.push(eventBarRecord.get('BarPosition'));
                        
                        // increment the BarLength value for this day
                        eventBarRecord.set('BarLength', eventBarRecord.get('BarLength') + 1);
                    }
                }
                else {
                    // get the next free bar position
                    var barPos = this.getNextFreePosition(takenDatePositions);
                    
                    // push it onto array so it isn't reused
                    takenDatePositions.push(barPos);
                    
                    // create new EventBar record
                    eventBarRecord = Ext.ModelMgr.create({
                        EventID: event.internalId,
                        Date: currentDate,
                        BarLength: 1,
                        BarPosition: barPos,
						Colour: this.getRandomColour(),
                        Record: event
                    }, 'Ext.ux.CalendarEventBarModel');
                    
                    // add EventBar record to main store
                    this.eventBarStore.add(eventBarRecord);
                }
                
            }, this);
            
            // remove the filter
            store.clearFilter();
        }, this);
    },
    
    /**
     * After the Event store has been processed, this method recursively creates and positions the Event Bars
     * @method
     * @private
     * @param {Ext.data.Store} store The store to process - used to then recurse into
     */
    renderEventBars: function(store){
    	var me = this;
		
        store.each(function(record){
            var eventRecord = this.getEventRecord(record.get('EventID')),
				dayEl = this.calendar.getDateCell(record.get('Date')),
				doesWrap = this.eventBarDoesWrap(record),
				hasWrapped = this.eventBarHasWrapped(record);
            
            // create the event bar
            var eventBar = Ext.DomHelper.append(this.eventWrapperEl, {
                tag: 'div',
				style: {
					'background-color': eventRecord.get(this.colourField)
				},
                html: this.eventBarTpl.apply(eventRecord.data),
                eventID: record.get('EventID'),
                cls: this.eventBarCls + ' ' + record.get('EventID') + (doesWrap ? ' wrap-end' : '') + (hasWrapped ? ' wrap-start' : '')
            }, true);
			
			if (this.allowEventDragAndDrop) {
			
				new Ext.util.Draggable(eventBar, {
					revert: true,
					
					/**
					 * Override for Ext.util.Draggable's onStart method to process the Event Bar's element before dragging
					 * and raise the 'eventdragstart' event
					 * @method
					 * @private
					 * @param {Event} e
					 */
					onStart: function(e){
					
						var draggable = this, eventID = draggable.el.getAttribute('eventID'), eventRecord = me.getEventRecord(eventID), eventBarRecord = me.getEventBarRecord(eventID);
						
						// Resize dragged Event Bar so it is 1 cell wide
						draggable.el.setWidth(draggable.el.getWidth() / eventBarRecord.get('BarLength'));
						// Reposition dragged Event Bar so it is in the middle of the User's finger.
						draggable.el.setLeft(e.startX - (draggable.el.getWidth() / 2));
						
						// hide all linked Event Bars
						me.calendar.body.select('div.' + eventRecord.internalId).each(function(eventBar){
							if (eventBar.dom !== draggable.el.dom) {
								eventBar.hide();
							}
						}, this);
						
						Ext.util.Draggable.prototype.onStart.apply(this, arguments);
						
						me.calendar.fireEvent('eventdragstart', draggable, eventRecord, e);
						
						return true;
					}
				});
			}
            
            var barPosition = record.get('BarPosition'),
				barLength = record.get('BarLength'),
				dayCellX = dayEl.getX(),
				dayCellY = dayEl.getY(),
				dayCellHeight = dayEl.getHeight(),
				dayCellWidth = dayEl.getWidth(),
            	eventBarHeight = eventBar.getHeight(),            
            	spacing = this.eventBarSpacing;
            
            // set sizes and positions
            eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
            eventBar.setTop((((dayCellY - this.calendar.body.getY()) + dayCellHeight) - eventBarHeight) - ((barPosition * eventBarHeight + (barPosition * spacing) + spacing)));
            eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));
            
            if (record.linked().getCount() > 0) {
                this.renderEventBars(record.linked());
            }
        }, this);
    },
	
	/**
	 * Handler function for the Event Bars' 'dragstart' event
	 * @method
	 * @private
	 * @param {Ext.util.Draggable} draggable
	 * @param {Event} e
	 */
	onEventDragStart: function(draggable, e){
        var eventID = draggable.el.getAttribute('eventID'),
			eventRecord = this.getEventRecord(eventID),
			eventBarRecord = this.getEventBarRecord(eventID);
        
		//TODO Reposition dragged Event Bar so it is in the middle of the User's finger.
		
		// Resize dragged Event Bar so it is 1 cell wide
        draggable.el.setWidth(draggable.el.getWidth() / eventBarRecord.get('BarLength'));
		
		// Update the draggables boundary so the resized bar can be dragged right to the edge.
		draggable.updateBoundary(true);

		// hide all linked Event Bars
        this.calendar.body.select('div.' + eventRecord.internalId).each(function(eventBar){
            if (eventBar.dom !== draggable.el.dom) {
                eventBar.hide();
            }
        }, this);
		
		this.calendar.fireEvent('eventdragstart', draggable, eventRecord, e);
    },
    
    /**
     * Returns true if the specified EventBar record will wrap and so will need square ends
     * Compares the calculated date that the bar will end on and the actual end date of the event. If they aren't the same
     * the bar will wrap to the next row
     * @method
     * @private
     * @param {Ext.ux.CalendarEventBarModel} r The EventBar model instance to figure out if it wraps to the next row of dates
     */
    eventBarDoesWrap: function(r){
        var barEndDate = r.get('Date').add(Date.DAY, (r.get('BarLength') - 1));
        return barEndDate.clearTime(true).getTime() !== r.get('Record').get(this.endEventField).clearTime(true).getTime();
    },
    /**
     * Returns true if the specified EventBar record has been wrapped from the row before.
     * @method
     * @private
     * @param {Ext.ux.CalendarEventBarModel} r The EventBar model instance to figure out if it has wrapped from the previous row of dates
     */
    eventBarHasWrapped: function(r){
        return r.get('Date').clearTime(true).getTime() !== r.get('Record').get(this.startEventField).clearTime(true).getTime();
    },
    
    /**
     * Creates the Event Bars' wrapper element and attaches a handler to it's click event
     * to handle taps on the Event Bars
     * @method
     * @private
     */
    createEventWrapper: function(){
        if (this.calendar.rendered && !this.eventWrapperEl) {
            this.eventWrapperEl = Ext.DomHelper.append(this.calendar.body, {
                tag: 'div',
                cls: this.eventWrapperCls
            }, true);
            
            this.calendar.mon(this.eventWrapperEl, 'click', this.onEventWrapperTap, this, {
                delegate: 'div.' + this.eventBarCls
            });
        }
    },
    
    /**
     * Handler function for the tap event on the eventWrapperEl
     * @method
     * @private
     * @param {Event} e
     * @param {Object} node
     */
    onEventWrapperTap: function(e, node){
        var eventID = node.attributes['eventID'];
        if (eventID) {
            var eventRecord = this.getEventRecord(node.attributes['eventID'].value);
            
            this.deselectEvents();
            
            this.eventWrapperEl.select('div.' + eventRecord.internalId).addCls(this.eventBarSelectedCls);
            
            this.calendar.fireEvent('eventtap', eventRecord, e);
        }
    },
    
    /**
     * Returns the first index number that isn't in the specified array
     * @method
     * @private
     * @param {Aarray[Numbers]} datePositions An array of numbers representing the current date cell's taken positions 
     */
    getNextFreePosition: function(datePositions){
        var i = 0;
        
        // loop until the i value isn't present in the array
        while (datePositions.indexOf(i) > -1) {
            i++;
        }
        return i;
    },
    
    /**
     * Get the Event record with the specified eventID (eventID equates to a record's internalId)
     * @method
     * @private
     * @param {Object} eventID
     */
    getEventRecord: function(eventID){
        var eventRecordIndex = this.calendar.store.findBy(function(rec){
            return rec.internalId === eventID;
        }, this);
        return this.calendar.store.getAt(eventRecordIndex);
    },
    
    /**
     * Get the EventBar record with the specified eventID
     * @method
     * @private
     * @param {String} eventID InternalID of a Model instance
     */
    getEventBarRecord: function(eventID){
        var eventRecordIndex = this.eventBarStore.findBy(function(rec){
            return rec.get('EventID') === eventID;
        }, this);
        return this.eventBarStore.getAt(eventRecordIndex);
    },
    
    /**
     * Remove the selected CSS class from all selected Event Bars
     * @method
     * @return {void}
     */
    deselectEvents: function(){
        this.calendar.body.select('.' + this.eventBarSelectedCls).removeCls(this.eventBarSelectedCls);
    },
    
    /**
     * Returns the number of days between the two dates passed in (ignoring time)
     * @method
     * @private
     * @param {Date} date1
     * @param {Date} date2
     */
    getDaysDifference: function(date1, date2){
        date1 = date1.clearTime(true).getTime();
        date2 = date2.clearTime(true).getTime();
        
        return (date2 - date1) / 1000 / 60 / 60 / 24;
    },
    
    /**
     * Removes all the event markers and their markup
     * @method
     * @private
     */
    removeEvents: function(){
        if (this.eventWrapperEl) {
            this.eventWrapperEl.dom.innerHTML = '';
            this.eventWrapperEl.remove();
            this.eventWrapperEl = null;
        }
        
        if (this.eventBarStore) {
            this.eventBarStore.remove(this.eventBarStore.getRange());
            this.eventBarStore = null;
        }
		
		if(this.droppable){
			this.droppable = null;
		}
    },
	
	getRandomColour: function(){
		return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}
});


/**
 * Ext.data.Model to store information about the EventBars to be generated from the 
 * bound data store
 * @private
 */
Ext.regModel('Ext.ux.CalendarEventBarModel', {
    fields: [{
        name: 'EventID',
        type: 'string'
    }, {
        name: 'Date',
        type: 'date'
    }, {
        name: 'BarLength',
        type: 'int'
    }, {
        name: 'BarPosition',
        type: 'int'
    }, {
		name: 'Colour',
		type: 'string'
	}, 'Record'],
    
    hasMany: [{
        model: 'Ext.ux.CalendarEventBarModel',
        name: 'linked'
    }]
});

/**
 * @class Ext.util.Region
 */
Ext.override(Ext.util.Region, {
	/**
	 * Figures out if the Event Bar passed in is within the boundaries of the current Date Cell (this)
	 * @method
	 * @param {Object} region
	 */
    partial: function(region){
        var me = this, // cell
			dragWidth = region.right - region.left,
			dragHeight = region.bottom - region.top,
			dropWidth = me.right - me.left,
			dropHeight = me.bottom - me.top,
			 
			verticalValid = region.top > me.top && region.top < me.bottom;
			        
        	horizontalValid = region.left > me.left && region.left < me.right;
        
        return horizontalValid && verticalValid;
    }
});/**
 * @copyright 		(c) 2011, by SwarmOnline.com
 * @date      		2nd October 2011
 * @version   		0.1
 * @documentation	
 * @website	  		http://www.swarmonline.com
 */
/**
 * @class Ext.ux.CalendarSimpleEvents
 * @author Stuart Ashworth
 *
 * A simple plugin for the Ext.ux.Calendar extension that allows a store to be bound to it so marker dots
 * are placed on the days.
 * 
 * ![Ext.ux.CalendarSimpleEvents Screenshot](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/Ext.ux.CalendarSimpleEvents-ss.png)
 * 
 * # Sample Usage
 * 
 *     Ext.regModel('Event', {
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
       
       var calendar = new Ext.ux.Calendar({
           fullscreen: true,
           mode: 'month',
           weekStart: 1,
           value: new Date(),
           
           store: new Ext.data.Store({
		        model: 'Event',
		        data: [{
		            event: 'Sencha Con',
		            location: 'Austin, Texas',
		            start: new Date(2011, 9, 23),
		            end: new Date(2011, 9, 26)
		        }]
		    },
                        
           plugins: [new Ext.ux.CalendarSimpleEvents()]
       });
 *    
 * # Demo
 * [Ext.ux.CalendarSimpleEvents Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.Calendar/examples/Ext.ux.CalendarSimpleEvents.html)
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
