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
Ext.define('Ext.ux.TouchCalendarView', {
	
	extend: 'Ext.dataview.DataView',

	config: {
        /**
         * @cfg {String} mode The mode the Calendar will be displayed in. Possible values 'month', 'week' or 'day'.
         */
        viewMode: 'month',

		/**
		 * cfg {Number} weekStart Starting day of the week. (0 = Sunday, 1 = Monday ... etc)
		 */
		weekStart: 1,
		
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
		
		baseTpl: [	
					'<table class="{[this.me.getViewMode().toLowerCase()]}">',
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
					'</table>'],

        cls: 'touch-calendar-view',

	itemSelector: 'td.time-block'
	
	},
	

	
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
				classes.push(this.me.getSelectedCls());
			}
			if(values.unselectable){
				classes.push(this.me.getUnselectableCls());
			}
			if(values.prevMonth){
				classes.push(this.me.getPrevMonthCls());
			}
			if(values.nextMonth){
				classes.push(this.me.getNextMonthCls());
			}
			if(values.weekend){
				classes.push(this.me.getWeekendCls());
			}
			if(values.today){
				classes.push(this.me.getTodayCls());
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
			return currentIndex === 1 ? this.me.getPrevPeriodCls() : currentIndex === 7 ? this.me.getPrevPeriodCls() : '';
		}
	},
	
	constructor: function(config){
		
		this.initModel();

		Ext.apply(this, config || {
			selectionMode: 'SINGLE'
		});		
		
			
			/**
			 * @event selectionchange Fires when the Calendar's selected date is changed
			 * @param {Ext.ux.Calendar} this
			 * @param {Date} previousValue Previously selected date
			 * @param {Date} newValue Newly selected date
			 */

			
			/**
			 * @event periodchange Fires when the calendar changes to a different date period (i.e. switch using the arrows)
			 * @param {Ext.ux.Calendar} this
			 * @param {Date} minDate New view's minimum date
			 * @param {Date} maxDate New view's maximum date
			 * @param {string} direction Direction that the view moved ('forward' or 'back')
			 */
		
		this.callParent(arguments);

        this.suspendRefresh = true;
        this.setViewMode('month');
        this.suspendRefresh = false;

		this.setStore(Ext.create('Ext.data.Store', {
			model: 'TouchCalendarViewModel'
		}));

		this.minDate = this.minDate ? Ext.Date.clearTime(this.minDate, true) : null;
		this.maxDate = this.maxDate ? Ext.Date.clearTime(this.maxDate, true) : null;	
	
		this.on({
			selectionchange: this.onSelectionChange,
			scope: this
		});
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
	initialize: function(ct, position) {
		this.setScrollable(false);

		this.element.on({
			click: this.onTableHeaderTap,
			scope: this,
			delegate: 'th'
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
		if(!Ext.ModelMgr.getModel('TouchCalendarViewModel'))
		{
			Ext.define('TouchCalendarViewModel', {
				extend: 'Ext.data.Model',
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
	 */
	applyViewMode: function(viewMode){

        var viewModeFns = Ext.ux.TouchCalendarView[viewMode.toUpperCase()];

		// Update the mode specific functions/values
        this.getStartDate = viewModeFns.getStartDate;
        this.getTotalDays = viewModeFns.getTotalDays;
        this.dateAttributeFormat = viewModeFns.dateAttributeFormat;
        this.getNextIterationDate = viewModeFns.getNextIterationDate;
        this.getDeltaDate = viewModeFns.getDeltaDate;
        this.periodRowDayCount = viewModeFns.periodRowDayCount;
		
		// Create the template
		this.setTpl(new Ext.XTemplate((viewModeFns.tpl || this.getBaseTpl()).join(''), Ext.apply(this.commonTemplateFunctions, {me: this})));
		
		// if the mode is DAY then we need to enable the scroller
		if (this.scroller) {
			this.scroller.moveTo(0, this.element.getY()); // reset it back to the top
			this.scroller.setEnabled((this.viewMode === 'DAY'));
		}	
		
		if(!this.suspendRefresh){
			this.refresh();
			
			this.selectDate(this.value);
		}

        return viewMode;
	},

    doRefresh: function(me) {
        var store = me.getStore(),
            records = store.getRange(),
            scrollable = me.getScrollable(),
            i, item;

        if (scrollable) {
            scrollable.getScroller().scrollTo(0, 0);
        }

/*        // No items, hide all the items from the collection.
        if (recordsLn < 1) {
            me.onStoreClear();
            return;
        }

        // Too many items, hide the unused ones
        if (deltaLn < 0) {
            this.moveItemsToCache(itemsLn + deltaLn, itemsLn - 1);
            // Items can changed, we need to refresh our references
            items = me.getViewItems();
            itemsLn = items.length;
        }
        // Not enough items, create new ones
        else if (deltaLn > 0) {
            this.doCreateItems(store.getRange(itemsLn), itemsLn);
        }

        // Update Data and insert the new html for existing items
        for (i = 0; i < itemsLn; i++) {
            item = items[i];
            me.updateListItem(records[i], item);
        }*/
        console.log('MY REFRESH');

        this.setData(this.collectData(records));
    },

    collectData: function(records){
        var data = [];

        Ext.each(records, function(record, index){
            data.push(record.data);
        }, this);

        return data;
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
				
		this.getStore().suspendEvents();
		this.getStore().data.clear();
		
		// create dates based on startDate and number of days to render
		for(var i = 0; i < totalDays; i++){
			
			// increment the date by one day (except on first run)
			iterDate = this.getNextIterationDate(iterDate, (i===0?0:1));
			
			unselectable = (this.minDate && iterDate < this.minDate) || (this.maxDate && iterDate > this.maxDate);
			
			this.getStore().add({
				today: this.isSameDay(iterDate, new Date()),
				unselectable: unselectable,
				selected: this.isSameDay(iterDate, this.value) && !unselectable,
				prevMonth: (iterDate.getMonth() < baseDate.getMonth()),
				nextMonth: (iterDate.getMonth() > baseDate.getMonth()),
				weekend: this.isWeekend(iterDate),
				date: iterDate
			});
		}
		
		this.getStore().resumeEvents();
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
		
		if(this.viewMode === 'MONTH'){
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
		
		this.callParent(arguments);
		
		//this.syncHeight();
	},
	
	/**
	 * Override of the Ext.DataView's afterComponentLayout method to sync the height of the table
	 * @method
	 * @private
	 */
	afterComponentLayout: function(){
		Ext.ux.TouchCalendarView.superclass.afterComponentLayout.call(this);
		
		//this.syncHeight();
	},
	
	/**
	 * Syncs the table's Ext.Element to the height of the Ext.DataView's component. (Only if it isn't in DAY mode)
	 */
	syncHeight: function(){
		if (this.viewMode !== 'DAY') {
			this.element.select('table').first().setHeight(this.element.getHeight());
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
				//this.select(recordToSelect); TODO
			}
		}
	},
	
	/**
	 * Returns the TouchCalendarViewModel model instance containing the passed in date
	 * @method
	 * @privatee
	 * @param {Date} date
	 */
	getDateRecord: function(date){
		return this.store.findBy(function(record){
			var recordDate = Ext.Date.clearTime(record.get('date'), true).getTime();
                
            return recordDate === Ext.Date.clearTime(date, true).getTime();
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
		return Ext.Date.clearTime(date1, true).getTime() === Ext.Date.clearTime(date2, true).getTime();
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
		return this.element.select('td[datetime="' + this.getDateAttribute(date) + '"]').first();
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
	},
	
	statics: {
		
		MONTH: {
				
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
					var firstDate = Ext.Date.getFirstDateOfMonth(date);
					
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
					return Ext.bind(Ext.ux.TouchCalendarView.WEEK.getStartDate, this)(new Date(date.getFullYear(), date.getMonth(), 1));
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
			},
			
			WEEK: {
				
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
			},
			
			DAY: {
					/**
					 * Date format that the 'datetime' attribute, given to each time slot, has. Day mode needs the time in aswell so
					 * events etc know what time slot it is
					 */
					dateAttributeFormat: 'd-m-Y H:i',
						
					/**
					 * Template for the DAY view
					 */
					tpl: [
						'<table class="{[this.me.viewMode.toLowerCase()]}">',			
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
						return Ext.Date.clearTime(date, true);
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
				}
	}
});

