/**
 * @copyright     (c) 2012, by SwarmOnline.com
 * @date          29th May 2012
 * @version       0.1
 * @documentation  
 * @website        http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendar
 * @author Stuart Ashworth
 *
 * For use with Sencha Touch 2
 * 
 * This extension wraps the Ext.ux.TouchCalendarView in a Ext.Carousel component and allows the calendar to respond to swipe
 * gestures to switch the displayed period. It works by creating 3 Ext.ux.TouchCalendarViews and dynamically creating/removing
 * views as the user moves back/forward through time. 
 * 
 * ![Ext.ux.TouchCalendar Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendar-month-ss.png)
 * 
 * [Ext.ux.TouchCalendar Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)
 * 
 */
Ext.define('Ext.ux.TouchCalendar',{
	extend: 'Ext.carousel.Carousel',

	xtype: 'calendar',

	/**
	* @cfg {Boolean} enableSwipeNavigate True to allow the calendar's period to be change by swiping across it.
	*/
	enableSwipeNavigate: true,

	/**
	* @cfg {Boolean} enableSimpleEvents True to enable the Ext.ux.TouchCalendarSimpleEvents plugin. When true the Ext.ux.TouchCalendarSimpleEvents JS and CSS files
	* must be included and an eventStore option, containing an Ext.data.Store instance, be given to the viewConfig.
	*/
	enableSimpleEvents: false,

	/**
	* @cfg {Boolean} enableEventBars True to enable the Ext.ux.TouchCalendarEvents plugin. When true the Ext.ux.TouchCalendarEvents JS and CSS files
	* must be included and an eventStore option, containing an Ext.data.Store instance, be given to the viewConfig.
	*/
	enableEventBars: false,

	/**
	* @cfg {Object} viewConfig A set of configuration options that will be applied to the TouchCalendarView component
	*/
	viewConfig: {

	},

	defaultViewConfig: {
		viewMode: 'MONTH',
		weekStart: 1,
		bubbleEvents: ['selectionchange']
	},
	indicator: false,

	initialize: function(){

		this.viewConfig = Ext.applyIf(this.viewConfig || {}, this.defaultViewConfig);

		this.viewConfig.currentDate = this.viewConfig.currentDate || this.viewConfig.value || new Date();

		this.viewMode = this.viewConfig.viewMode.toUpperCase();

		this.initViews();

		Ext.apply(this, {
			cls: 'touch-calendar',
			activeItem: (this.enableSwipeNavigate ? 1: 0),
			direction: 'horizontal'
		});

		this.setIndicator(false); // for some reason, indicator: false is not being applied unless explicitly set.
		this.setActiveItem(1); // for some reason, activeItem: 1 is not being applied unless explicitly set.

		this.on('selectionchange', this.onSelectionChange);
		this.on('activeitemchange', this.onActiveItemChange);

		if (this.enableSwipeNavigate) {
			// Bind the required listeners
			this.on(this.element, {
				drag: this.onDrag,
				dragThreshold: 5,
				dragend: this.onDragEnd,
				direction: this.direction,
				scope: this
			});

			this.element.addCls(this.baseCls + '-' + this.direction);
		}
	},

	/**
	* Builds the necessary configuration object for the creation of the TouchCalendarView.
	* @param {Date} viewValue The date Value that the new TouchCalendarView will have
	* @method
	* @private
	* @return {Object} The new config object for the view
	*/
	getViewConfig: function(viewValue){
		var plugins = [];

		if(this.enableSimpleEvents){
			plugins.push(new Ext.ux.TouchCalendarSimpleEvents());
		} else if (this.enableEventBars){
			plugins.push(new Ext.ux.TouchCalendarEvents());
		}

		Ext.apply(this.viewConfig, {
			plugins: plugins,
			currentDate: viewValue,
			onTableHeaderTap: Ext.bind(this.onTableHeaderTap, this)
		});

		return this.viewConfig;
	},

	getViewDate: function(date, i){
		var scale = (this.viewMode === 'WEEK' ? 'DAY' : this.viewMode.toUpperCase()),
		  number = (this.viewMode === 'WEEK' ? (8 * i) : i);

		return Ext.Date.add(date, Ext.Date[scale], number)
	},

	/**
	 * Creates all the TouchCalendarView instances needed for the Calendar
	 * @method
	 * @private
	 * @return {void}
	 */
	initViews: function(){
		var items = [];
		var origCurrentDate = Ext.Date.clone(this.viewConfig.currentDate),
		  i = (this.enableSwipeNavigate ? -1 : 0),
		  iMax = (this.enableSwipeNavigate ? 1 : 0),
		  plugins = [];

		// first out of view
		var viewValue = this.getViewDate(origCurrentDate, -1);
		items.push(
		    new Ext.ux.TouchCalendarView(Ext.applyIf({
		        currentDate: viewValue
		      }, this.getViewConfig(viewValue)))
		);

		// active view
		items.push(
		    new Ext.ux.TouchCalendarView(this.getViewConfig(origCurrentDate))
		);

		// second out of view (i.e. third)
		viewValue = this.getViewDate(origCurrentDate, 1);
		items.push(
		    new Ext.ux.TouchCalendarView(Ext.applyIf({
		        currentDate: viewValue
		    }, this.getViewConfig(viewValue)))
		);

		this.setItems(items);
		this.view = items[(this.enableSwipeNavigate ? 1: 0)];
	},

	/**
	* Override for the TouchCalendarView's onTableHeaderTap method which is executed when the view's header (specificly the arrows) is tapped.
	* When using the TouchCalendar wrapper we must intercept it and use the carousel's prev/next methods to do the switching.
	*/
	onTableHeaderTap: function(e, el){
		el = Ext.fly(el);

		if (el.hasCls(this.view.prevPeriodCls) || el.hasCls(this.view.nextPeriodCls)) {
			this[(el.hasCls(this.view.prevPeriodCls) ? 'prev' : 'next')]();
		}
	},

	/**
	* Changes the mode of the calendar to the specified string's value. Possible values are 'month', 'week' and 'day'.
	* @method
	* @returns {void}
	*/
	setMode: function(mode){
		this.viewMode = mode.toUpperCase();
		this.viewConfig.viewMode = this.viewMode;

		this.getItems().each(function(view, index){

			view.currentDate = this.getViewDate(Ext.Date.clone(this.view.currentDate), index-1);

			view.setViewMode(mode, true);
			view.refresh();
		}, this);
	},

	/**
	* Returns the Date that is selected.
	* @method
	* @returns {Date} The selected date
	*/
	getValue: function(){
		var selectedDates = this.view.getSelectionModel().selected;

		return (selectedDates.getCount() > 0) ? selectedDates.first().get('date') : null;
	},

	/**
	* Set selected date.
	* @method
	* @param {Date} v Date to select.
	* @return {void}
	*/
	setValue: function(v) {
		this.view.setValue(v)
	},

	/**
	 * Override of the onCardSwitch method which adds a new card to the end/beginning of the carousel depending on the direction configured with the next period's
	 * dates.
	 * @method
	 * @private
	 */
	onActiveItemChange: function(container, newCard, oldCard){
		if (this.enableSwipeNavigate) {
			var items = this.getItems();
			var newIndex = items.indexOf(newCard), oldIndex = items.indexOf(oldCard), direction = (newIndex > oldIndex) ? 'forward' : 'backward';

			this.counter = (this.counter || 0) + 1;

			if (direction === 'forward') {
				this.remove(items.get(0));
				var newCalendar = new Ext.ux.TouchCalendarView(this.getViewConfig(Ext.Date.add(newCard.currentDate, Ext.Date[this.viewMode], 1)));
				this.add(newCalendar);
			}
			else {
				this.remove(items.get(items.getCount() - 1));
				var newCalendar = new Ext.ux.TouchCalendarView(this.getViewConfig(Ext.Date.add(newCard.currentDate, Ext.Date[this.viewMode], -1)));
				this.insert(0, newCalendar);
			}

			this.view = newCard;
		}
	}
    
    
});
/**
 * @copyright     (c) 2012, by SwarmOnline.com
 * @date          29th May 2012
 * @version       0.1
 * @documentation
 * @website        http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendarView
 * @author Stuart Ashworth
 *
 * For use with Sencha Touch 2
 *
 */
Ext.define('Ext.ux.TouchCalendarView', {
	
	extend: 'Ext.Container',

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

        value: null,

        store: null,

        baseTpl: [
                    '<table class="{[this.me.getViewMode().toLowerCase()]}">',
                        '<thead>',
                            '<tr>',
                                '<tpl for="this.getDaysArray(values)">',
                                    '<th class="{[this.getHeaderClass(xindex)]}">',
                                        '<tpl if="xindex === 4">',
                                            '<span>{[Ext.Date.format(this.me.currentDate, "F")]} {[Ext.Date.format(this.me.currentDate, "Y")]}</span>',
                                        '</tpl>',
                                        '{date:date("D")}',
                                    '</th>',
                                '</tpl>',
                            '</tr>',
                        '</thead>',
                        '<tbody>',
                            '<tr class="time-block-row">',
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
   				classes.push(this.me.getSelectedItemCls());
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
   			return currentIndex === 1 ? this.me.getPrevPeriodCls() : currentIndex === 7 ? this.me.getNextPeriodCls() : '';
   		}
   	},

	constructor: function(config){
		
		this.initModel();
		
		var store = Ext.create('Ext.data.Store', {
	        model: 'TouchCalendarViewModel'
	    });

	    this.setStore(store);

		Ext.apply(this, config || {
		});
		
        /**
         * @event selectionchange Fires when the Calendar's selected date is changed
         * @param {Ext.ux.TouchCalendarView} this
         * @param {Array[Ext.ux.TouchCalendarViewModel]} selectedDates An array of the selected date records
         */

        /**
         * @event periodchange Fires when the calendar changes to a different date period (i.e. switch using the arrows)
         * @param {Ext.ux.TouchCalendarView} this
         * @param {Date} minDate New view's minimum date
         * @param {Date} maxDate New view's maximum date
         * @param {string} direction Direction that the view moved ('forward' or 'back')
         */
		
		this.callParent(arguments);

		this.minDate = this.minDate ? Ext.Date.clearTime(this.minDate, true) : null;
		this.maxDate = this.maxDate ? Ext.Date.clearTime(this.maxDate, true) : null;

        this.refresh();
    },
    
	/**
	 * Override of onRender method. Attaches event handlers to the element to handler
	 * day taps and period switch taps
	 * @method
	 * @private
	 * @return {void}
	 */
	initialize: function() {

		this.element.on({
			tap: this.onTableHeaderTap,
			scope: this,
			delegate: 'th'
		});

        this.element.on({
            tap: this.onTimeSlotTap,
            scope: this,
            delegate: this.getItemSelector()
        });

        this.on({
            painted: this.syncHeight,
            scope: this
        });

        this.callParent();
	},

	/**
	 * Creates the Calendar's Model if it doesn't already exist
	 * @method
	 * @private
	 */
	initModel: function(){
		if(!Ext.ModelManager.isRegistered('TouchCalendarViewModel')) // TODO: Throws an error in opening Ext.ux.TouchCalendar.html example?? 
		{
			Ext.define('TouchCalendarViewModel', {
				extend: 'Ext.data.Model',
                config: {
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
                }
			});
		}
	},

    /**
     * Updater for the viewMode configuration option.
     * Refreshes the calendar once the new viewMode is applied and set.
     * @param viewMode
     * @param oldViewMode
     */
    updateViewMode: function(viewMode, oldViewMode){
        this.refresh();
    },
	
	/**
	 * Applies the view mode change requested to the Calendar. Possible values are 'month', 'week' or 'day'.
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

        Ext.apply(this.commonTemplateFunctions, {me: this})

		// Create the template
		this.setTpl(new Ext.XTemplate((viewModeFns.tpl || this.getBaseTpl()).join(''), this.commonTemplateFunctions));
		
		this.setScrollable(viewMode.toUpperCase() === 'DAY' ? 'vertical' : false);

        return viewMode;
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
			totalDays = this.getTotalDays(baseDate), // total days to be rendered in current mode
            record;
				
		this.getStore().suspendEvents();
		this.getStore().data.clear();
		
		// create dates based on startDate and number of days to render
		for(var i = 0; i < totalDays; i++){
			
			// increment the date by one day (except on first run)
			iterDate = this.getNextIterationDate(iterDate, (i===0?0:1));
			
			unselectable = (this.minDate && iterDate < this.minDate) || (this.maxDate && iterDate > this.maxDate);

            record = Ext.create('TouchCalendarViewModel', {
                today: this.isSameDay(iterDate, new Date()),
                unselectable: unselectable,
                selected: this.isSameDay(iterDate, this.value) && !unselectable,
                prevMonth: (iterDate.getMonth() < baseDate.getMonth()),
                nextMonth: (iterDate.getMonth() > baseDate.getMonth()),
                weekend: this.isWeekend(iterDate),
                date: iterDate
            });
			
			this.getStore().add(record);
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
		
		this.fireEvent('periodchange', this, minMaxDate.min.get('date'), minMaxDate.max.get('date'), (delta > 0 ? 'forward' : 'back'));
	},
	
	/**
	 * Returns the current view's minimum and maximum date collection objects
	 * @method
	 * @private
	 * @return {Object} Object in the format {min: {}, max: {}}
	 */
	getPeriodMinMaxDate: function(){
		return {
			min: this.getStore().data.first(),
			max: this.getStore().data.last()
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

		if (el.hasCls(this.getPrevPeriodCls()) || el.hasCls(this.getNextPeriodCls())) {
			this.refreshDelta(el.hasCls(this.getPrevPeriodCls()) ? -1 : 1);
		}
	},

    /**
     * Handler for taps on the Calendar's timeslot elements.
     * Processes the tapped element and selects it visually then fires the selectionchange event
     * @method
     * @private
     * @param {Ext.EventObject} e The taps event object
     * @return {void}
     */
    onTimeSlotTap: function(e){
        var target = Ext.fly(e.getTarget());

        this.selectCell(target);

        var newDate = this.getCellDate(target);

        var previousValue = this.getValue();

        this.setValue(newDate);

        this.fireEvent('selectionchange', this, newDate, previousValue);
    },

	/**
	 * Override for the Ext.DataView's refresh method. Repopulates the store, calls parent then sync the height of the table
	 * @method
	 */
	refresh: function(){
		this.populateStore();

        var records = this.getStore().getRange();

        this.setData(this.collectData(records));

        this.syncHeight();
	},

    /**
   	 * Syncs the table's Ext.Element to the height of the Ext.DataView's component. (Only if it isn't in DAY mode)
   	 */
   	syncHeight: function(){
        if (this.getViewMode().toUpperCase() !== 'DAY') {
   			var tableEl = this.element.select('table').first();

            if(tableEl){
                tableEl.setHeight(this.element.getHeight());
            }
   		}
   	},

	/**
	 * Selects the specified cell
	 * @method
	 * @param {Ext.Element} cell
	 */
	selectCell: function(cell){
        var selCls = this.getSelectedItemCls();

        var selectedEl = this.element.select('td.' + selCls).first();

        if(selectedEl){
            selectedEl.removeCls(selCls);
        }

        cell.addCls(selCls);
	},
	
	/**
	 * Returns the TouchCalendarViewModel model instance containing the passed in date
	 * @method
	 * @privatee
	 * @param {Date} date
	 */
	getDateRecord: function(date){
		return this.getStore().findBy(function(record){
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
		var dayOffset = date.getDay() - this.getWeekStart();
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
		return Ext.Date.format(date, this.dateAttributeFormat);
	},

	/**
	 * Converts a string date (used to add to table cells) to a Date object
	 * @method
	 * @private
	 * @param {String} dateString
	 * @return {Date}
	 */
	stringToDate: function(dateString) {
		return Ext.Date.parseDate(dateString, this.dateAttributeFormat);
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
					
					newDate.setDate(Ext.Date.getDaysInMonth(newDate) < date.getDate() ? Ext.Date.getDaysInMonth(newDate) : date.getDate());
					
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
					var dayOffset = date.getDay() - this.getWeekStart();
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
						'<table class="{[this.me.getViewMode().toLowerCase()]}">',
                            '<thead>',
                                '<tr>',
                                    '<th class="{[this.me.getPrevPeriodCls()]} style="display: block;">',
                                    '</th>',
                                    '<th>',
                                        '<span style="position: static;">{[Ext.Date.format(values[0].date, "D jS M Y")]}</span>',
                                    '</th>',
                                    '<th class="{[this.me.getNextPeriodCls()]} style="display: block;"">',
                                    '</th>',
                                '</tr>',
                            '</thead>',
							'<tbody>',
								'<tpl for=".">',
									'<tr>',
								
										'<td class="time-block" datetime="{[this.me.getDateAttribute(values.date)]}" colspan="3">',
	
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
						var d = currentIterationDate.getTime() + ((index===0?0:1) * (this.getDayTimeSlotSize() * 60 * 1000));
						
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
						return 1440 / this.getDayTimeSlotSize();
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

/**
 * @copyright     (c) 2012, by SwarmOnline.com
 * @date          29th May 2012
 * @version       0.1
 * @documentation  
 * @website        http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendarEvents
 * @author Stuart Ashworth
 *
 * For use with Sencha Touch 2
 * 
 * This plugin also allows a store to be bound to the Ext.ux.TouchCalendar and will display the store's events as bars spanning its relevant days. 
 * 
 * ![Ext.ux.TouchCalendarEvents Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarEvents--month-ss.png)
 * 
 * [Ext.ux.TouchCalendarEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarEvents.html)
 * 
 */
Ext.define('Ext.ux.TouchCalendarEvents', {
  extend: 'Ext.mixin.Observable',
  config: {
    /**
     * @cfg {String} eventBarTpl Template that will be used to fill the Event Bar
     */
    eventBarTpl : '{title}' // make this an internal set-able property
  },
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
 
    
    init: function(calendar){
        this.calendar = calendar; // cache the parent calendar
        this.calendar.eventsPlugin = this; // cache the plugin instance on the calendar itself  
        

	      /**
	       * @event eventtap
	       * Fires when an Event Bar is tapped
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the tap operation
	       */

	      /**
	       * @event eventdragstart
	       * Fires when an Event Bar is initially dragged.
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the drag operation
	       */

	      /**
	       * @event beforeeventdrop
	       * Fires before an Event Bar drop is accepted. Return false to prevent the drop from
	       * happening. This event can be used to add additional validation for Event moves
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.util.Droppable} droppable The Calendar's Ext.util.Droppable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the drag operation
	       */

	      /**
	       * @event eventdrop
	       * Fires when an Event Bar is dragged and dropped on a date
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.util.Droppable} droppable The Calendar's Ext.util.Droppable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the drag operation
	       */

	      /**
	       * @event eventdrag
	       * Fires while an Event Bar is being dragged.
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Date} currentDate The date that the Event Bar is currently over
	       * @param {Ext.Element} currentDateCell The Ext.Element representing the table cell of the current date
	       * @param {Event} e The event object for the drag operation
	       */


	    // create a sequence to refresh the Event Bars when the calendar either refreshes or has a component layout happen
	    this.calendar.refresh = Ext.Function.createSequence(this.calendar.refresh, this.refreshEvents, this);
	    this.calendar.afterComponentLayout = Ext.Function.createSequence(this.calendar.afterComponentLayout, this.refreshEvents, this);
    },
    
    /**
     * Regenerates the Event Bars
     * @method
     * @return {void}
     */
    refreshEvents: function(){
        this.removeEvents();
        
        this.generateEventBars(); // in turn calls this.renderEventBars(this.eventBarStore);
        
        this.createEventWrapper();
        
        
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
    //TODO: Re-implement when droppable is supported in ST2 again
//    this.droppable = new Ext.util.Droppable(this.calendar.getEl(), {
//      /**
//       * Override for Droppable's onDrag function to add hover class to active date cell
//       * @method       
//       * @private
//       * @param {Object} draggable
//       * @param {Object} e
//       */
//            onDrag: function(draggable, e){
//        if (draggable.el.hasCls(me.eventBarCls)) {
//          this.setCanDrop(this.isDragOver(draggable), draggable, e);
//          onDragCount++;
//
//          if (onDragCount % 15 === 0) {
//            var currentDateCell, currentDate, eventRecord = me.getEventRecord(draggable.el.getAttribute('eventID'));
//            
//            me.calendar.all.removeCls(me.cellHoverCls);
//            
//            me.calendar.all.each(function(cell, index){
//              var cellRegion = cell.getPageBox(true);
//              var eventBarRegion = draggable.el.getPageBox(true);
//              
//              if (cellRegion.partial(eventBarRegion)) {
//                currentDateCell = cell;
//                currentDate = this.calendar.getCellDate(cell);
//                
//                cell.addCls(me.cellHoverCls);
//                return;
//              }
//            }, me);
//            
//            me.calendar.fireEvent('eventdrag', draggable, eventRecord, currentDate, currentDateCell, e);
//            onDragCount = 0;
//          }
//        }
//      }
//        });
//    
//    this.droppable.on({
//      drop: this.onEventDrop,
//            dropdeactivate: this.onEventDropDeactivate,
//            scope: this
//    });
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
      this.calendar.element.select('div.' + eventRecord.internalId).each(function(eventBar){
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

        if(draggable.el.hasCls(this.eventBarCls)){
        
            this.calendar.all.each(function(cell){
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

            this.calendar.all.removeCls(this.cellHoverCls);

            if (!validDrop) { // if it wasn't a valid drop then move the Event Bar back to its original location
                draggable.setOffset(draggable.startOffset, true);
            }
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
        this.eventBarStore = Ext.create('Ext.data.Store', {
            model: 'Ext.ux.CalendarEventBarModel',
            data: []
        });
        
        var dates = this.calendar.getStore();
        var store = this.calendar.eventStore;
        var eventBarRecord;
        
        // Loop through Calendar's date collection of visible dates
        dates.each(function(dateObj){
            var currentDate = dateObj.get('date'),
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
                html: new Ext.XTemplate(this.getEventBarTpl()).apply(eventRecord.data),
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
						me.calendar.element.select('div.' + eventRecord.internalId).each(function(eventBar){
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


	        var headerHeight = this.calendar.element.select('thead').first().getHeight();
	        var bodyHeight = this.calendar.element.select('tbody').first().getHeight();
	        var rowCount = this.calendar.element.select('tbody tr').getCount();
	        var rowHeight = bodyHeight/rowCount;

	        var dateIndex = this.calendar.getStore().findBy(function(dateRec){
		        return dateRec.get('date').getTime() === Ext.Date.clearTime(record.get('Date'), true).getTime();
	        }, this);

	        var rowIndex = Math.floor(dateIndex / 7) + 1;

	        var eventY = headerHeight + (rowHeight * rowIndex);

            var barPosition = record.get('BarPosition'),
		        barLength = record.get('BarLength'),
		        dayCellX = (this.calendar.element.getWidth() / 7) * dayEl.dom.cellIndex,
		        dayCellWidth = dayEl.getWidth(),
				eventBarHeight = eventBar.getHeight(),
				spacing = this.eventBarSpacing;

            // set sizes and positions
            eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
            eventBar.setTop(eventY - eventBarHeight - (barPosition * eventBarHeight + (barPosition * spacing) + spacing));
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
        this.calendar.element.select('div.' + eventRecord.internalId).each(function(eventBar){
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
            this.eventWrapperEl = Ext.DomHelper.append(this.getEventsWrapperContainer(), {
                tag: 'div',
                cls: this.eventWrapperCls
            }, true);
            
            this.eventWrapperEl.on('tap', this.onEventWrapperTap, this, {
                delegate: 'div.' + this.eventBarCls
            });
            this.renderEventBars(this.eventBarStore);
        }else{
          this.calendar.on('painted', this.createEventWrapper, this);
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
        e.stopPropagation(); // stop event bubbling up
        
        var eventID = node.attributes['eventID'];
        if (eventID) {
            var eventRecord = this.getEventRecord(node.attributes['eventID'].value);
            
            this.deselectEvents();

            this.eventWrapperEl.select('div.' + eventRecord.internalId).addCls(this.eventBarSelectedCls);
            
            this.calendar.fireEvent('eventtap', eventRecord, e);
        }
    },
  
	getEventsWrapperContainer: function(){
		return this.calendar.element.select('thead th').first() || this.calendar.element.select('tr td').first();
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
        var eventRecordIndex = this.calendar.eventStore.findBy(function(rec){
            return rec.internalId === eventID;
        }, this);
        return this.calendar.eventStore.getAt(eventRecordIndex);
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
        this.calendar.element.select('.' + this.eventBarSelectedCls).removeCls(this.eventBarSelectedCls);
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
            this.eventWrapperEl.destroy();
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
Ext.define("Ext.ux.CalendarEventBarModel", {
  extend: "Ext.data.Model",
	config: {
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
	}
});

///**
// * @class Ext.util.Region
// */
//Ext.override(Ext.util.Region, {
//  
//});

Ext.define('Ext.util.Region.partial', {
  extend: 'Ext.util.Region',
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
 * @copyright     (c) 2012, by SwarmOnline.com
 * @date          29th May 2012
 * @version       0.1
 * @documentation
 * @website        http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendarSimpleEvents
 * @author Stuart Ashworth
 *
 * For use with Sencha Touch 2
 *
 * This plugin can be added to an Ext.ux.TouchCalendarView instance to allow a store to be bound to the calendar so events can be shown in a similar style to the iPhone
 * does with a dot added to each day to represent the presence of an event.
 * 
 * ![Ext.ux.TouchCalendarSimpleEvents Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarSimpleEvents-month-ss.png)
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
 * [Ext.ux.CalendarSimpleEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.CalendarSimpleEvents.html)
 */
Ext.define('Ext.ux.TouchCalendarSimpleEvents', {
  extend: 'Ext.mixin.Observable',
	
    /**
     * @cfg {String} startEventField Name of the Model field which contains the Event's Start date
     */
    startEventField: 'start',
    
    /**
     * @cfg {Stirng} endEventField Name of the Model field which contains the Event's End date
     */
    endEventField: 'end',
	
	/**
	 * @cfg {Boolean} multiEventDots True to display a dot for each event on a day. False to only show one dot regardless
	 * of how many events there are
	 */
	multiEventDots: true,
	
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
	 * @cfg {Number} dotWidth Width in pixels of the dots as defined by CSS. This is used for calculating the positions and
	 * number of dots able to be shown.
	 */
	dotWidth: 6,
	
	/**
	 * @cfg {String} eventTpl Template used to create the Event markup. Template is merged with the records left
	 * following the filter
	 * 
	 */
	eventTpl:	['<span class="{wrapperCls}">',
		'<tpl for="events">',
			'<span class="{[parent.eventDotCls]}"></span>',
		'</tpl>',
	'</span>'].join(''),
	
	/**
	 * Function used to filter the store for each of the displayed dates
	 * @method
	 * @private
	 * @param {Object} record - current record
	 * @param {Object} id - ID of passed in record
	 * @param {Object} currentDate - date we are currently dealing while looping Calendar's dateCollection property
	 */
	filterFn: function(record, id, currentDate){
	  if (arguments.length===2){
	    currentDate = id;
	  }
		var startDate = Ext.Date.clearTime(record.get(this.startEventField), true).getTime(),
			endDate = Ext.Date.clearTime(record.get(this.endEventField), true).getTime(),
			currentDate = Ext.Date.clearTime(currentDate, true).getTime();
	                            
	    return (startDate <= currentDate) && (endDate >= currentDate);
	},
	
	init: function(calendar){
		
		this.calendar = calendar; // cache the parent calendar
		this.calendar.simpleEventsPlugin = this; // cache the plugin instance on the calendar itself
		
		this.wrapperCls = this.wrapperCls + (this.multiEventDots ? '-multi' : '');
		this.eventDotCls = this.eventDotCls + (this.multiEventDots ? '-multi' : '');
		
		this.calendar.showEvents = this.showEvents;
		this.calendar.hideEvents = this.hideEvents;
		this.calendar.removeEvents = this.removeEvents;
		
		// After the calendar's refreshed we must refresh the events
		this.calendar.refresh = Ext.Function.createSequence(this.calendar.refresh, this.refreshEvents, this);
		this.calendar.syncHeight = Ext.Function.createSequence(this.calendar.syncHeight, this.refreshEvents, this);
	},

	
	/**
	 * Function to execute when the Calendar is refreshed.
	 * It loops through the Calendar's current dateCollection and gets all Events
	 * for the current date and inserts the appropriate markup
	 * @method
	 * @private
	 * @return {void}
	 */
	refreshEvents: function(){
		if (!this.disabled) {
			var datesStore = this.calendar.getStore();

			if (datesStore) {
				
				this.removeEvents(); // remove the event dots already existing
				
				// loop through Calendar's current dateCollection
				datesStore.each(function(dateObj){
					var date = dateObj.get('date');
					
					var cell = this.calendar.getDateCell(date); // get the table cell for the current date
					var store = this.calendar.eventStore;
					
					if (cell) {
						store.clearFilter();
						
						// if we only want to show a single dot per day then use findBy for better performance
						var matchIndex = store[this.multiEventDots ? 'filterBy' : 'findBy'](Ext.bind(this.filterFn, this, [date], true));
						var eventCount = store.getRange().length;
						
						if ((!this.multiEventDots && matchIndex > -1) || (this.multiEventDots && eventCount > 0)) {
							// get maximum number of dots that can fitted in the cell
							var maxDots = Math.min((cell.getWidth()/this.dotWidth), eventCount);
							
							// append the event markup
							var t =  new Ext.XTemplate(this.eventTpl).append(cell, {
								events: (this.multiEventDots ? store.getRange().slice(0, maxDots) : ['event']),
								wrapperCls: this.wrapperCls,
								eventDotCls: this.eventDotCls
							}, true);
							
							// position the dot wrapper based on the cell dimensions and dot count
							t.setWidth(Math.min((this.multiEventDots ? store.getRange().length : 1) * this.dotWidth, cell.getWidth()));
							t.setY((cell.getY() + cell.getHeight()) - (t.getHeight() + (cell.getHeight()*0.1)) );
							t.setX((cell.getX() + (cell.getWidth()/2)) - (t.getWidth()/2) + 2 ); // add 2 for margin value
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
		
		this.calendar.element.select('span.' + this.wrapperCls).hide();
	},
	
	/**
	 * Shows all the event markers
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	showEvents: function(){
		this.simpleEventsPlugin.disabled = false;
		
		this.calendar.element.select('span.' + this.wrapperCls).show();
	},
	
	/**
	 * Removes all the event markers and their markup
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	removeEvents: function(){
		if(this.calendar.element){
			this.calendar.element.select('span.' + this.wrapperCls).remove();
		}
	}	
});
