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
	 * @cfg {Date} minDate Minimum date allowed to be shown/selected
	 */
	minDate: null,
	
	/**
	 * @cfg {Date} maxDate Maximum date allowed to be shown/selected
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
