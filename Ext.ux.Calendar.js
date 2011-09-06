Ext.ns('Ext.ux');

/**
 * 
 *
 * @cfg {Date} value Initially selected date (default is today)
 * @cfg {String[]} days Day names.
 * @cfg {String[]} months Month names.
 * @cfg {Number} weekstart Starting day of the week. (1 for monday, 7 for sunday)
 * @cfg {Date} minDate The lowest selectable date.
 * @cfg {Date} maxDate The highest selectable date.
 */
Ext.ux.Calendar = Ext.extend(Ext.Panel, {

	cls: 'ux-date-picker',
	
	autoHeight: true,
	
	/**
	 * Starting day of the week. (0 = Sunday, 1 = Monday ... etc)
	 */
	weekStart: 1,
	
	/**
	 * Minimum date allowed to be shown/selected
	 */
	minDate: null,
	
	/**
	 * Maximum date allowed to be shown/selected
	 */
	maxDate: null,
	
	/**
	 * True to have the calendar fill the height of the Panel
	 */
	fullHeight: true,
	
	/**
	 * CSS Classes used for styling and selecting
	 */
	todayCls: 'today',
	selectedCls: 'selected',
	unselectableCls: 'unselectable',
	prevMonthCls: 'prev-month',
	nextMonthCls: 'next-month',
	weekendCls: 'weekend',
	prevPeriodCls: 'goto-prev',
	nextPeriodCls: 'goto-next',
	
	commonTemplateFunctions: {
		
		/**
		 * Gets the classes that should be applied to the current day's cell
		 * @param {string} space separated list of CSS classes
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
			
			return classes.join(' ');
		},
		
		/**
		 * Returns true if the specific index is at the end of the row
		 * Used to determine if a row terminating tag is needed
		 * @param {boolean} currentIndex
		 */
		isEndOfRow: function(currentIndex){
			return (currentIndex % 7) === 0 && (currentIndex > 0)
		},
		
		/**
		 * Returns true if the specific index is at the current mode's period
		 * Used to determine if another row opening tag is needed
		 * @param {boolean} currentIndex
		 */
		isEndOfPeriod: function(currentIndex){
			return currentIndex === this.me.totalDays[this.me.mode](this.me.value);
		},
		
		/**
		 * Gets a formatted date to be used in the 'datetime' attribute added to the day cell
		 * @param {Object} date
		 */
		getDateAttribute: function(date){
			return date.format('Y-m-d');
		},
		
		/**
		 * Gets an array containing the first 7 dates to be used in headings
		 * @param {Object} values
		 */
		getDaysArray: function(values){
			var daysArray = [];
			
			for(var i = 0; i < 7; i++){
				daysArray.push(values.dates[i])	
			}
			
			return daysArray;
		},
		
		getHeaderClass: function(currentIndex){
			return currentIndex === 1 ? this.me.prevPeriodCls : currentIndex === 7 ? this.me.nextPeriodCls : '';
		}
	},
	

	/**
	 * Create new calendar
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
				
					'<td class="day {[this.getClasses(values)]}" datetime="{[this.getDateAttribute(values.date)]}">',
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

		this.addEvents('refresh');

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
		
		this.on('afterrender', this.syncHeight, this);
	},

	onRender: function(ct, position) {
		Ext.ux.Calendar.superclass.onRender.apply(this, arguments);

		this.refresh();

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
	
	setMode: function(mode){
		this.mode = mode;
		
		this.refresh();
	},
	
	/**
	 * Updates the Calendar's table's height to match the wrapping Panel
	 */
	syncHeight: function(){
		if(this.fullHeight){
			this.body.down('table').setHeight(this.body.getHeight());
		}
	},

	/**
	 * Refreshes the Calendar focussed around the date in "this.value".
	 * Fires the 'refresh' event 
	 */
	refresh: function() {
		var d = this.value || new Date();
		
		this.currentDate = d;
		
		var dateCollection = this.getDateCollection(this.currentDate.getDate(), this.currentDate.getMonth(), this.currentDate.getFullYear());
		
		this.update({
			currentDate: this.currentDate,
			dates: dateCollection.items
		});
		// will force repaint() on iPod Touch 4G
		this.body.getHeight();

		this.fireEvent('refresh');
		
		this.syncHeight();
	},
	
	/**
	 * Handler for a tap on a day's cell
	 * @param {Object} e
	 * @param {Object} el
	 */
	onDayTap: function(e, el){
		el = Ext.fly(el);
	
		if (!el.hasCls('unselectable')) {
			this.setValue(this.getCellDate(el));
		}
	},
	
	/**
	 * Handler for a tap on the table header
	 * @param {Object} e
	 * @param {Object} el
	 */
	onTableHeaderTap: function(e, el){
		el = Ext.fly(el);

		if (el.hasCls("goto-prev")) {
			this.refreshDelta(-1);
		}

		if (el.hasCls("goto-next")) {
			this.refreshDelta(1);
		}
	},
	
	/**
	 * Set selected date.
	 * @cfg {Date} v Date to select.
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
				this.selectDate(this.value);
			}
		}
	},
	
	/**
	 * Adds the selected class to the specified date's cell. If it isn't in the current view
	 * then the calendar will be refreshed to move the date into view.
	 * @param {Object} date
	 */
	selectDate: function(date) {
		var selectionChanged = false; // flag to store whether a date was selected on the current page
		
		this.removeSelectedCell();
		
		this.body.select('td').each(function(td) {
			var clickedDate = this.getCellDate(td);
			if (!td.hasCls(this.prevMonthCls) && !td.hasCls(this.nextMonthCls) && this.isSameDay(date, clickedDate)) {
				td.addCls(this.selectedCls);
					
				if((this.value && this.previousValue) && !this.isSameDay(this.value, this.previousValue)){
					this.fireEvent('selectionchange', this.value);	
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
	 * @param {integer} delta - integer representing direction (1 = forward, =1 = backward)
	 */
	refreshDelta: function(delta) {
		var v = this.value || new Date();

		var newDay = this.modeDeltaFns[this.mode](v, delta);

		// don't move if we've reached the min/max dates
		if (this.minDate && newDay.getLastDateOfMonth() < this.minDate) {
			return;
		}
		if (this.maxDate && newDay.getFirstDateOfMonth() > this.maxDate) {
			return;
		}

		this.setValue(newDay);
	},
	
	/**
	 * Removes the selectedCls from any cells that have it
	 */
	removeSelectedCell: function() {
		this.body.select('.' + this.selectedCls).removeCls(this.selectedCls);
	},
	
	/**
	 * Builds a collection of dates that need to be rendered in the current configuration
	 * @param {Object} day
	 * @param {Object} month
	 * @param {Object} year
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
	 * @param {Object} day
	 * @param {Object} month - 0 based month representation (0 = Jan, 11 = Dec)
	 * @param {Object} year
	 */
	getMonthStartDate: function(day, month, year){
		return this.getWeekStartDate(1, month, year);
	},
	
	/**
	 * Returns the first day of the week based on the specified date.
	 * @param {Object} day
	 * @param {Object} month - 0 based month representation (0 = Jan, 11 = Dec)
	 * @param {Object} year
	 */
	getWeekStartDate: function(day, month, year){
		var currentDate = new Date(year, month, day);
		var dayOffset = currentDate.getDay() - this.weekStart;
		dayOffset = dayOffset < 0 ? 6 : dayOffset;
		
		return new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()-0-dayOffset);
	},
	
	getMonthDeltaDate: function(date, delta){
		return new Date(date.getFullYear(), date.getMonth() + delta, date.getDate());
	},
	
	getWeekDeltaDate: function(date, delta){
		return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (delta * 7));
	},
	
	/**
	 * Returns true if the two dates are the same date (ignores time)
	 * @param {Object} date1
	 * @param {Object} date2
	 */
	isSameDay: function(date1, date2){
		return date1.clearTime(true).getTime() === date2.clearTime(true).getTime();
	},
	/**
	 * Returns true if the specified date is a Saturday/Sunday
	 * @param {Object} date
	 */
	isWeekend: function(date){
		return date.getDay() === 0 || date.getDay() === 6;
	},

	/**
	 * Returns the Date associated with the specified cell
	 * @param {Object} dateCell
	 */
	getCellDate: function(dateCell) {
		var date = dateCell.dom.getAttribute('datetime');
		return this.stringToDate(date);
	},

	/**
	 * Converts a string date (used to add to table cells) to a Date object
	 * @param {Object} dateString
	 */
	stringToDate: function(dateString) {
		var a = dateString.split('-');
		return new Date(Number(a[0]), (a[1]-1), Number(a[2]));
	},

	/**
	 * Converts a Date to its string format to be added to table cell's attribute
	 * @param {Object} date
	 */
	dateToString: function(date) {
		return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
	}
});
