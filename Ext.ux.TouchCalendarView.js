/**
 * @copyright 		(c) 2011, by SwarmOnline.com
 * @date      		2nd November 2011
 * @version   		0.1
 * @documentation	
 * @website	  		http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendarView
 * @author Stuart Ashworth
 * 
 * The main extension is contained in the root folder of the repository and can be included in your project (along with its CSS file located within 
 * the resources/css folder) and will give you a basic calendar view (either showing a month, week or day) that can be configured with various options.
 * 
 * ![Ext.ux.TouchCalendarView Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarView-month-ss.png)
 * ![Ext.ux.TouchCalendarView Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarView-week-ss.png)
 * ![Ext.ux.TouchCalendarView Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarView-day-ss.png)
 * 
 * [Ext.ux.TouchCalendarView Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)
 */
Ext.ux.TouchCalendarView = Ext.extend(Ext.DataView, {
	cls: 'touch-calendar-view',
	
	/**
	 * cfg {Number} weekStart Starting day of the week. (0 = Sunday, 1 = Monday ... etc)
	 */
	weekStart: 1,
	
	/**
	 * @cfg {String} mode The mode the Calendar will be displayed in. Possible values 'month', 'week' or 'day'.
	 */
	mode: 'month',
	
	/**
	 * @cfg {String} todayCls CSS class added to the today's date cell 
	 */
	todayCls: 'today',
	
	/**
	 * @cfg {String} selectedItemCls CSS class added to the date cell that is currently selected 
	 */
	selectedItemCls: 'selected',
	
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
	 * @cfg {Number} dayTimeSlotSize The number of minutes the Day View's time slot will increment by. Defaults to 30 minutes.
	 */
	dayTimeSlotSize: 30,
	
	itemSelector: 'td.time-block',
	
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
		 * @return {Boolean}
		 */
		isEndOfRow: function(currentIndex){
			return (currentIndex % 7) === 0 && (currentIndex > 0);
		},
		
		/**
		 * Returns true if the specific index is at the start of the row.
		 * USed to determine whether if a row opening tag is needed
		 * @method
		 * @private 
		 * @param {Number} currentIndex
		 * @return {Boolean}
		 */
		isStartOfRow: function(currentIndex){
			return ((currentIndex-1) % 7) === 0 && (currentIndex-1 >= 0);
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
			
			for(i = 0; i < this.me.periodRowDayCount; i++){
				daysArray.push(values[i]);
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
	
	constructor: function(config){
		
		this.initModel();
		
		this.store = new Ext.data.Store({
			model: 'Ext.ux.TouchCalendarViewModel'
		});
		
		this.baseTpl = [	
			'<table class="{[this.me.mode.toLowerCase()]}">',		
				'<thead>',
					'<tr>',
						'<tpl for="this.getDaysArray(values)">',
							'<th class="{[this.getHeaderClass(xindex)]}">',
								'<tpl if="xindex === 4">',
									'<span>{[this.me.currentDate.format("F")]} {[this.me.currentDate.format("Y")]}</span>',
								'</tpl>',
								'{date:date("D")}',
							'</th>',
						'</tpl>',
					'</tr>',
				'</thead>',	
				'<tbody>',
					'<tr>',
					'<tpl for=".">',
					
						'<td class="time-block {[this.getClasses(values)]}" datetime="{[this.me.getDateAttribute(values.date)]}">',
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
			'</table>'];

		Ext.apply(this, config || {
			selectionMode: 'SINGLE'
		});		
		
		this.addEvents(

			/**
			 * @event selectionchange Fires when the Calendar's selected date is changed
			 * @param {Ext.ux.Calendar} this
			 * @param {Array[Ext.ux.TouchCalendarViewModel]} selectedDates An array of the selected date records
			 */

			/**
			 * @event periodchange Fires when the calendar changes to a different date period (i.e. switch using the arrows)
			 * @param {Ext.ux.Calendar} this
			 * @param {Date} minDate New view's minimum date
			 * @param {Date} maxDate New view's maximum date
			 * @param {string} direction Direction that the view moved ('forward' or 'back')
			 */
			'periodchange'
		
		);
		
		this.setMode(this.mode, true);
		
		Ext.ux.TouchCalendarView.superclass.constructor.call(this, config);

		this.minDate = this.minDate ? this.minDate.clearTime(true) : null;
		this.maxDate = this.maxDate ? this.maxDate.clearTime(true) : null;	
	
		this.on({
			afterrender: function(){
				this.scroller.disable();
			},
			selectionchange: this.onSelectionChange,
			scope: this
		});

		
	},
	
	/**
	 * Handler for the selectionchange event which sets the internal value to the selected one.
	 * @method
	 * @private
	 * @param {Object} selectionModel
	 * @param {Object} records
	 */
	onSelectionChange: function(selectionModel, records){
		if(records.length > 0){
			this.setValue(records[0].get('date'));
		}
	},
	
	/**
	 * Creates the Calendar's Model if it doesn't already exist
	 * @method
	 * @private
	 */
	initModel: function(){
		if(!Ext.ModelMgr.getModel('Ext.ux.TouchCalendarViewModel'))
		{
			Ext.regModel('Ext.ux.TouchCalendarViewModel', {
				fields: [
					{name: 'date', type: 'date'},
					{name: 'today', type: 'boolean'},
					{name: 'unselectable', type: 'boolean'},
					{name: 'selected', type: 'boolean'},
					{name: 'prevMonth', type: 'boolean'},
					{name: 'nextMonth', type: 'boolean'},
					{name: 'weekend', type: 'boolean'},
					'timeSlots'
				]
			});
		}
	},
	
	/**
	 * Sets the mode that the Calendar is displayed in. Possible values are 'month', 'week' or 'day'.
	 * @param {String} mode Either 'month', 'week' or 'day'
	 * @param {String} noRefresh True to stop the Calendar refreshing after changing the mode 
	 */
	setMode: function(mode, noRefresh){
		this.mode = mode.toUpperCase();
		
		// Update the mode specific functions/values
        Ext.apply(this, Ext.applyIf(Ext.ux.TouchCalendarView[mode.toUpperCase()], {
            tpl: this.baseTpl
        }));
		
		// Create the template
		this.tpl = new Ext.XTemplate(this.tpl.join(''), Ext.apply(this.commonTemplateFunctions, {me: this}));
		
		// if the mode is DAY then we need to enable the scroller
		if (this.scroller) {
			this.scroller.moveTo(0, this.el.getY()); // reset it back to the top
			this.scroller.setEnabled((this.mode === 'DAY'));
		}	
		
		if(!noRefresh){
			this.refresh();
			
			this.selectDate(this.value);
		}	
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
	populateStore: function(){
		
		this.currentDate = this.currentDate || this.value || new Date();
		
		var unselectable = true, // variable used to indicate whether a day is allowed to be selected
			baseDate = this.currentDate, // date to use as base
			iterDate = this.getStartDate(baseDate), // date current mode will start at
			totalDays = this.getTotalDays(baseDate); // total days to be rendered in current mode
				
		this.store.suspendEvents();
		this.store.data.clear();
		
		// create dates based on startDate and number of days to render
		for(var i = 0; i < totalDays; i++){
			
			// increment the date by one day (except on first run)
			iterDate = this.getNextIterationDate(iterDate, (i===0?0:1));
			
			unselectable = (this.minDate && iterDate < this.minDate) || (this.maxDate && iterDate > this.maxDate);
			
			this.store.add({
				today: this.isSameDay(iterDate, new Date()),
				unselectable: unselectable,
				selected: this.isSameDay(iterDate, this.value) && !unselectable,
				prevMonth: (iterDate.getMonth() < baseDate.getMonth()),
				nextMonth: (iterDate.getMonth() > baseDate.getMonth()),
				weekend: this.isWeekend(iterDate),
				date: iterDate
			});
		}
		
		this.store.resumeEvents();
	},
	
	/**
	 * Override of onRender method. Attaches event handlers to the element to handler
	 * day taps and period switch taps
	 * @method
	 * @private
	 * @return {void}
	 * @param {Object} ct
	 * @param {Object} position
	 */	
	onRender: function(ct, position) {
		Ext.ux.TouchCalendarView.superclass.onRender.apply(this, arguments);
		
		this.el.on({
			click: this.onTableHeaderTap,
			scope: this,
			delegate: 'th'
		});
	},
	
	/**
	 * Refreshes the calendar moving it forward (delta = 1) or backward (delta = -1)
	 * @method
	 * @param {Number} delta - integer representing direction (1 = forward, =1 = backward)
	 * @return {void}
	 */
	refreshDelta: function(delta) {
		var v = this.currentDate || new Date();

		var newDate = this.getDeltaDate(v, delta);

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
			min: this.store.data.first(),
			max: this.store.data.last()
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
		
		if(this.mode === 'MONTH'){
			outside = ((this.minDate && date.getLastDateOfMonth() < this.minDate) || (this.maxDate && date.getFirstDateOfMonth() > this.maxDate));
		} else {
			outside = ((this.minDate && this.getWeekendDate(date) < this.minDate) || (this.maxDate && this.getStartDate(date) > this.maxDate));
		}
		
		return outside;
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
	 * Override for the Ext.DataView's refresh method. Repopulates the store, calls parent then sync the height of the table
	 * @method
	 */
	refresh: function(){
		this.populateStore();
		
		Ext.ux.TouchCalendarView.superclass.refresh.call(this);
		
		this.syncHeight();
	},
	
	/**
	 * Override of the Ext.DataView's afterComponentLayout method to sync the height of the table
	 * @method
	 * @private
	 */
	afterComponentLayout: function(){
		Ext.ux.TouchCalendarView.superclass.afterComponentLayout.call(this);
		
		this.syncHeight();
	},
	
	/**
	 * Syncs the table's Ext.Element to the height of the Ext.DataView's component. (Only if it isn't in DAY mode)
	 */
	syncHeight: function(){
		if (this.mode !== 'DAY') {
			this.el.select('table').first().setHeight(this.el.getHeight());
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
	 * Selects the specified date in the DataView's selection model
	 * @method
	 * @param {Date} date
	 */
	selectDate: function(date){
		if (date) {
			var recordToSelect = this.getDateRecord(date);
			
			if (recordToSelect < 0) {
				this.refresh();
				
				recordToSelect = this.getDateRecord(date);
			}
			if (recordToSelect >= 0) {
				this.getSelectionModel().select(recordToSelect);
			}
		}
	},
	
	/**
	 * Returns the Ext.ux.TouchCalendarViewModel model instance containing the passed in date
	 * @method
	 * @privatee
	 * @param {Date} date
	 */
	getDateRecord: function(date){
		return this.store.findBy(function(record){
			var recordDate = record.get('date').clearTime(true).getTime();
                
            return recordDate === date.clearTime(true).getTime();
		}, this);
	},
	
	/**
	 * Returns the same day
	 * @method
	 * @private
	 * @param {Number} day
	 * @param {Number} month - 0 based month representation (0 = Jan, 11 = Dec)
	 * @param {Number} year
	 * @return {Date}
	 */
	getDayStartDate: function(date){
		return date;
	},
	
	/**
	 * Returns true if the two dates are the same date (ignores time)
	 * @method
	 * @private
	 * @param {Date} date1
	 * @param {Date} date2
	 * @return {Boolean}
	 */
	isSameDay: function(date1, date2){
		if(!date1 || !date2){
			return false;
		}
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
	 * Returns the last day of the week based on the specified date.
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {Date}
	 */
	getWeekendDate: function(date){
		var dayOffset = date.getDay() - this.weekStart;
		dayOffset = dayOffset < 0 ? 6 : dayOffset;
		
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()+0+dayOffset);
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
		return this.el.select('td[datetime="' + this.getDateAttribute(date) + '"]').first();
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
		return date.format(this.dateAttributeFormat);
	},

	/**
	 * Converts a string date (used to add to table cells) to a Date object
	 * @method
	 * @private
	 * @param {String} dateString
	 * @return {Date}
	 */
	stringToDate: function(dateString) {
		return Date.parseDate(dateString, this.dateAttributeFormat);
	}
});


Ext.ux.TouchCalendarView.MONTH = {
			
	dateAttributeFormat: 'd-m-Y',
			
	/**
	 * Called during the View's Store population. This calculates the next date for the current period.
	 * The MONTH mode's version just adds 1 (or 0 on the first iteration) to the specified date. 
	 * @param {Date} d Current Iteration date
	 * @param {Number} index
	 */
	getNextIterationDate: function(d, index){
		return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (index===0?0:1));
	},
	
	/**
	 * Returns the total number of days to be shown in this view.
	 * @method
	 * @private
	 * @param {Date} date
	 */
	getTotalDays: function(date){
		var firstDate = date.getFirstDateOfMonth();
		
		return this.isWeekend(firstDate) ? 42 : 35;
	},
	
	/**
	 * Returns the first day that should be visible for a month view (may not be in the same month)
	 * Gets the first day of the week that the 1st of the month falls on.
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {Date}
	 */
	getStartDate: function(date){
		return Ext.createDelegate(Ext.ux.TouchCalendarView.WEEK.getStartDate, this)(new Date(date.getFullYear(), date.getMonth(), 1));
	},
	
	/**
	 * Returns a new date based on the date passed and the delta value for MONTH view.
	 * @method
	 * @private
	 * @param {Date} date
	 * @param {Number} delta
	 * @return {Date}
	 */
	getDeltaDate: function(date, delta){
		var newMonth = date.getMonth() + delta,
			newDate = new Date(date.getFullYear(), newMonth, 1);
		
		newDate.setDate(newDate.getDaysInMonth() < date.getDate() ? newDate.getDaysInMonth() : date.getDate());
		
		return newDate;
	},
	
	periodRowDayCount: 7
};

Ext.ux.TouchCalendarView.WEEK = {
	
	dateAttributeFormat: 'd-m-Y',
		
	/**
	 * Called during the View's Store population. This calculates the next date for the current period.
	 * The WEEK mode's version just adds 1 (or 0 on the first iteration) to the specified date. 
	 * @param {Date} d Current Iteration date
	 * @param {Number} index
	 */
	getNextIterationDate: function(d, index){
		return new Date(d.getFullYear(), d.getMonth(), d.getDate() + (index===0?0:1));
	},
	
	/**
	 * Returns the total number of days to be shown in this view.
	 * As it is the WEEK view it is always 7
	 * @method
	 * @private
	 * @param {Date} date
	 */
	getTotalDays: function(date){
		return 7;
	},
	
	/**
	 * Returns the first day of the week based on the specified date.
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {Date}
	 */
	getStartDate: function(date){
		var dayOffset = date.getDay() - this.weekStart;
		dayOffset = dayOffset < 0 ? 6 : dayOffset;
		
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()-0-dayOffset);
	},
	
	/**
	 * Returns a new date based on the date passed and the delta value for WEEK view.
	 * @method
	 * @private
	 * @param {Date} date
	 * @param {Number} delta
	 * @return {Date}
	 */
	getDeltaDate: function(date, delta){
		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (delta * 7));
	},
	
	periodRowDayCount: 7
};

Ext.ux.TouchCalendarView.DAY = {
	/**
	 * Date format that the 'datetime' attribute, given to each time slot, has. Day mode needs the time in aswell so
	 * events etc know what time slot it is
	 */
	dateAttributeFormat: 'd-m-Y H:i',
		
	/**
	 * Template for the DAY view
	 */
	tpl: [
		'<table class="{[this.me.mode.toLowerCase()]}">',			
			'<tbody>',
				'<tpl for=".">',
					'<tr>',
				
						'<td class="time-block" datetime="{[this.me.getDateAttribute(values.date)]}">',

							'{date:date("H:i")}',
						
						'</td>',
					'</tr>',
				'</tpl>',
			'</tbody>',
		'</table>'],
		
	/**
	 * Called during the View's Store population. This calculates the next date for the current period.
	 * The DAY mode's version just adds another time period on.
	 * @param {Date} currentIterationDate
	 * @param {Number} index
	 */
	getNextIterationDate: function(currentIterationDate, index){
		var d = currentIterationDate.getTime() + ((index===0?0:1) * (this.dayTimeSlotSize * 60 * 1000));
		
		return new Date(d);
	},

	/**
	 * Returns the total number of time slots to be shown in this view.
	 * This is derived from the dayTimeSlotSize property
	 * @method
	 * @private
	 * @param {Date} date
	 */
	getTotalDays: function(date){
		return 1440 / this.dayTimeSlotSize;
	},
	
	/**
	 * Returns the same date as passed in because there is only one date visible
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {Date}
	 */
	getStartDate: function(date){
		return date.clearTime(true);
	},
	
	/**
	 * Returns a new date based on the date passed and the delta value for DAY view.
	 * @method
	 * @private
	 * @param {Date} date
	 * @param {Number} delta
	 * @return {Date}
	 */
	getDeltaDate: function(date, delta){
		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
	},
	
	periodRowDayCount: 1
};

