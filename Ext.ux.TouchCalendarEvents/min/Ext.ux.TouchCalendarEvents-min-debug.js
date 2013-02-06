/*!
 * Ext.ux.TouchCalendarEvents
 */
/**
 * Ext.ux.TouchCalendarEventsBase
 */
Ext.define('Ext.ux.TouchCalendarEventsBase', {

    extend: 'Ext.Base',

	config: {
		calendar: null,
		plugin: null,

		/**
		 * @accessor {Object} eventsPerTimeSlot Tracks the number of events that occur in specified time slots so it can be used to calculate widths
		 * when rendering. The counts are only stored if 1 or more events exist. The numeric value of the time slot's date (i.e. date.getTime()) is used
		 * as the key with the count as the value.
		 * @private
		 */
		eventsPerTimeSlot: {},

		/**
		 * @accessor {String} eventSortDirection Used to define the sort direction the Event Store is sorted in while generating the Event models.
		 * This is required to be configurable because Month/Week modes work from bottom to top, whereas Day view works from left to right so we want the ordering to be different.
		 * Default to 'DESC' for the Month and Week views.
		 */
		eventSortDirection: 'DESC'
	},

	constructor: function(config){
		this.initConfig(config);

		this.callParent(arguments);
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

		this.setEventsPerTimeSlot({});

		var dates = this.getCalendar().getStore(),
			eventStore = this.getCalendar().eventStore,
			eventBarRecord,
			eventsPerTimeSlotCount = 0;

		// Loop through Calendar's date collection of visible dates
		dates.each(function(dateObj){
			var currentDate = dateObj.get('date'),
				currentDateTime = currentDate.getTime(),
				takenDatePositions = []; // stores 'row positions' that are taken on current date

			// sort the Events Store so we have a consistent ordering to ensure no overlaps
			eventStore.sort(this.getPlugin().getStartEventField(), this.getEventSortDirection());

			// Loop through currentDate's Events
			eventStore.each(function(event){

				// If the Event doesn't match the filter for events that are happening on the currentDate then we skip the Event Record
				// we do this rather than a real filterBy call is so that if the store is part of an association we don't lose the original filter
				if(!this.eventFilterFn.call(this, event, event.getId(), currentDateTime)){
					return;
				}

				eventsPerTimeSlotCount = eventsPerTimeSlotCount + 1;

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
					if (currentDate.getDay() === this.getCalendar().getWeekStart()) {
						// push the inherited BarPosition of the parent
						// EventBarRecord onto the takenDatePositions array
						takenDatePositions.push(eventBarRecord.get('BarPosition'));

						// create a new EventBar record
						var wrappedEventBarRecord = Ext.create('Ext.ux.CalendarEventBarModel', {
							EventID: event.internalId,
							Date: currentDate,
							BarLength: 1,
							BarPosition: eventBarRecord.get('BarPosition'),
							Colour: eventBarRecord.get('Colour'),
							Record: event
						});

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
					eventBarRecord = Ext.create('Ext.ux.CalendarEventBarModel', {
						EventID: event.internalId,
						Date: currentDate,
						BarLength: 1,
						BarPosition: barPos,
						Colour: this.getRandomColour(),
						Record: event
					});

					// add EventBar record to main store
					this.eventBarStore.add(eventBarRecord);
				}

			}, this);

			// keep track of the number of Events per time
			if(eventsPerTimeSlotCount > 0){
				this.getEventsPerTimeSlot()[currentDate.getTime()] = eventsPerTimeSlotCount;
			}

			eventsPerTimeSlotCount = 0;
		}, this);
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
		var barEndDate = Ext.Date.add(r.get('Date'), Ext.Date.DAY, (r.get('BarLength') - 1));
		return Ext.Date.clearTime(barEndDate, true).getTime() !== Ext.Date.clearTime(r.get('Record').get(this.getPlugin().getEndEventField()), true).getTime();
	},
	/**
	 * Returns true if the specified EventBar record has been wrapped from the row before.
	 * @method
	 * @private
	 * @param {Ext.ux.CalendarEventBarModel} r The EventBar model instance to figure out if it has wrapped from the previous row of dates
	 */
	eventBarHasWrapped: function(r){
		return Ext.Date.clearTime(r.get('Date'), true).getTime() !== Ext.Date.clearTime(r.get('Record').get(this.getPlugin().getStartEventField()), true).getTime();
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


	createEventBar: function(record, eventRecord){
		var doesWrap    = this.eventBarDoesWrap(record),
			hasWrapped  = this.eventBarHasWrapped(record),
			cssClasses  = [
				this.getPlugin().getEventBarCls(),
				'e-' + record.get('EventID'),
				(doesWrap ? ' wrap-end' : ''),
				(hasWrapped ? ' wrap-start' : ''),
				eventRecord.get(this.getPlugin().getCssClassField())
			];


		// create the event bar
		var eventBar = Ext.DomHelper.append(this.getPlugin().getEventWrapperEl(), {
			tag: 'div',
			html: this.getPlugin().getEventBarTpl().apply(eventRecord.data),
			eventID: record.get('EventID'),
			cls: cssClasses.join(' ')
		}, true);

		return eventBar;
	},

	getRandomColour: function(){
		return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}

});/**
 * Ext.ux.TouchCalendarDayEvents
 */
Ext.define('Ext.ux.TouchCalendarDayEvents', {

    extend: 'Ext.ux.TouchCalendarEventsBase',

	config: {
		/**
		 * Sort the generated events early to late so they appear Left to Right, early to late.
		 */
		eventSortDirection: 'ASC'
	},

	eventFilterFn: function(record, id, currentDateTime){
		var startDate   = this.getRoundedTime(record.get(this.getPlugin().getStartEventField())).getTime(),
			endDate     = this.getRoundedTime(record.get(this.getPlugin().getEndEventField())).getTime();

		return (startDate <= currentDateTime) && (endDate >= currentDateTime);
	},

	renderEventBars: function(store){
		var me = this,
			l = store.getCount(),
			i = 0,
			rec;

		for(; i < l; i++){
			rec = store.getAt(i);

			var eventRecord     = rec.data.Record,
				eventBar        = this.createEventBar(rec, eventRecord),

				eventWidth      = this.getEventBarWidth(rec, 50+10), // 50 = left margin, 10 = right margin TODO: make configurable

				verticalPos     = this.getVerticalDayPosition(rec),
				horizontalPos   = this.getHorizontalDayPosition(rec, eventWidth),
				eventHeight     = this.getEventBarHeight(rec);

			eventBar.setLeft(horizontalPos);
			eventBar.setTop(verticalPos - this.getCalendar().element.getY());

			eventBar.setHeight(eventHeight);
			eventBar.setWidth(eventWidth);
		}

	},

	getEventBarWidth: function(event, offset){
		var eventsInTimeSlot    = this.getEventsPerTimeSlot()[event.get('Date').getTime()],
			calendarWidth       = this.getCalendar().element.getWidth();

		eventsInTimeSlot    = eventsInTimeSlot || 1;
		offset              = offset || 0;

		return Math.floor((calendarWidth - offset) / eventsInTimeSlot);
	},

	getEventBarHeight: function(event){
		var eventHeight = this.getPlugin().getEventHeight();

		if(Ext.isNumeric(eventHeight)){
			return eventHeight;
		} else if(eventHeight === 'duration'){
			return this.getEventBarHeightDuration(event);
		} else {
			return 'auto';
		}
	},

	getEventBarHeightDuration: function(event){
		var startDate           = event.data.Record.get(this.getPlugin().getStartEventField()),
			endDate             = event.data.Record.get(this.getPlugin().getEndEventField()),
			roundedStartDate    = this.getRoundedTime(startDate),
			minutesLength       = (endDate.getTime() - startDate.getTime()) / 1000 / 60,
			timeSlotEl          = this.getCalendar().getDateCell(roundedStartDate),
			timeSlotRowEl       = timeSlotEl.parent('tr', false),
			heightPixels        = 0;

		if(timeSlotRowEl){
			var timeSlotHeight  = timeSlotEl.getHeight(),
				minutesPerPixel = timeSlotHeight / 30;

			heightPixels    = minutesLength * minutesPerPixel;
		}

		return heightPixels;
	},

	getVerticalDayPosition: function(event){
		var startDate           = event.data.Record.get(this.getPlugin().getStartEventField()),
			roundedStartDate    = this.getRoundedTime(startDate),
			timeSlotCount       = (roundedStartDate.getHours() * 2) + (roundedStartDate.getMinutes() === 30 ? 1 : 0),
			minutesDiff         = (startDate.getTime() - roundedStartDate.getTime()) / 1000 / 60,
			firstTimeSlotEl     = this.getCalendar().element.select('table.time-slot-table td', this.getCalendar().element.dom).first(),
			verticalPosition    = 0;

		if(firstTimeSlotEl){
			var firstTimeSlotHeight = firstTimeSlotEl.getHeight(),
				firstTimeSlotY      = firstTimeSlotEl.getY(), // first time slot position - needed so we take the header row into account
				minutesPerPixel     = firstTimeSlotHeight / 30,
				extraMinutesY       = minutesDiff * minutesPerPixel;

			verticalPosition = firstTimeSlotY + (timeSlotCount * firstTimeSlotHeight) + extraMinutesY;
		}

		return verticalPosition;
	},

	getHorizontalDayPosition: function(event, eventBarWidth){
		var barPos      = event.get('BarPosition'),
			leftMargin  = 50,
			spacing = this.getPlugin().getEventBarSpacing();

		return leftMargin + (barPos * eventBarWidth) + (barPos * spacing);
	},

	/**
	 * Returns the specified date rounded to the nearest minute block.
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {Date}
	 */
	getRoundedTime: function(date){
		date = Ext.Date.clone(date);

		var minutes = date.getMinutes();

		date.setMinutes(minutes - (minutes % this.getCalendar().getDayTimeSlotSize()));

		date.setSeconds(0);
		date.setMilliseconds(0);

		return date;
	}

});/**
 * Ext.ux.TouchCalendarMonthEvents
 */
Ext.define('Ext.ux.TouchCalendarMonthEvents', {

    extend: 'Ext.ux.TouchCalendarEventsBase',

	eventFilterFn: function(record, id, currentDateTime){
		var startDate = Ext.Date.clearTime(record.get(this.getPlugin().getStartEventField()), true).getTime(),
			endDate = Ext.Date.clearTime(record.get(this.getPlugin().getEndEventField()), true).getTime();

		return (startDate <= currentDateTime) && (endDate >= currentDateTime);
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
			var eventRecord = this.getPlugin().getEventRecord(record.get('EventID')),
				dayEl = this.getCalendar().getDateCell(record.get('Date')),
				doesWrap = this.eventBarDoesWrap(record),
				hasWrapped = this.eventBarHasWrapped(record),
				cssClasses  = [
					this.getPlugin().getEventBarCls(),
					'e-' + record.get('EventID'),
					(doesWrap ? ' wrap-end' : ''),
					(hasWrapped ? ' wrap-start' : ''),
					eventRecord.get(this.getPlugin().getCssClassField())
				];

			// create the event bar
			var eventBar = Ext.DomHelper.append(this.getPlugin().getEventWrapperEl(), {
				tag: 'div',
				style: {
					'background-color': eventRecord.get(this.getPlugin().colourField)
				},
				html: this.getPlugin().getEventBarTpl().apply(eventRecord.data),
				eventID: record.get('EventID'),
				cls: cssClasses.join(' ')
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

						var draggable = this, eventID = draggable.el.getAttribute('eventID'), eventRecord = me.getPlugin().getEventRecord(eventID), eventBarRecord = me.getEventBarRecord(eventID);

						// Resize dragged Event Bar so it is 1 cell wide
						draggable.el.setWidth(draggable.el.getWidth() / eventBarRecord.get('BarLength'));
						// Reposition dragged Event Bar so it is in the middle of the User's finger.
						draggable.el.setLeft(e.startX - (draggable.el.getWidth() / 2));

						// hide all linked Event Bars
						me.calendar.element.select('div.' + eventRecord.internalId, me.calendar.element.dom).each(function(eventBar){
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

			var headerHeight = this.getCalendar().element.select('thead', this.getCalendar().element.dom).first().getHeight();
			var bodyHeight = this.getCalendar().element.select('tbody', this.getCalendar().element.dom).first().getHeight();
			var rowCount = this.getCalendar().element.select('tbody tr', this.getCalendar().element.dom).getCount();
			var rowHeight = bodyHeight/rowCount;

			var dateIndex = this.getCalendar().getStore().findBy(function(dateRec){
				return dateRec.get('date').getTime() === Ext.Date.clearTime(record.get('Date'), true).getTime();
			}, this);

			var rowIndex = Math.floor(dateIndex / 7) + 1;

			var eventY = headerHeight + (rowHeight * rowIndex);

			var barPosition = record.get('BarPosition'),
				barLength = record.get('BarLength'),
				dayCellX = (this.getCalendar().element.getWidth() / 7) * dayEl.dom.cellIndex,
				dayCellWidth = dayEl.getWidth(),
				eventBarHeight = eventBar.getHeight(),
				spacing = this.getPlugin().getEventBarSpacing();

			// set sizes and positions
			eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
			eventBar.setTop(eventY - eventBarHeight - (barPosition * eventBarHeight + (barPosition * spacing) + spacing));
			eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));

			if (record.linked().getCount() > 0) {
				this.renderEventBars(record.linked());
			}
		}, this);
	}

});/**
 * Ext.ux.TouchCalendarWeekEvents
 */
Ext.define('Ext.ux.TouchCalendarWeekEvents', {

    extend: 'Ext.ux.TouchCalendarMonthEvents'

});/**
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

		viewModeProcessor: null,

		/**
		 * @cfg {String} eventBarTpl Template that will be used to fill the Event Bar
		 */
		eventBarTpl : '{title}', // make this an internal set-able property

		/**
		 * @cfg {String} eventBarCls Base CSS class given to each EventBar
		 */
		eventBarCls: 'event-bar',

		/**
		 * @cfg {String} colourField Name of the Model field which contains a colour to be applied to the
		 * event bar
		 */
		colourField: 'colour',

		/**
		 * @cfg {String} cssClassField Name of the Model field which contains a CSS class to be applied to the
		 * event bar
		 */
		cssClassField: 'css',

		/**
		 * @cfg {String/Number} eventHeight How the height of an event bar will be calculated in Day View.
		 * Possible values:
		 * auto: This will expand the event bar to contain it's content.
		 * duration: (default) This will set the event bar to be the height equivalent of its duration
		 * <number>: This will make the event bars to this explicit height
		 */
	    eventHeight: 'duration',

		/**
		 * @cfg {String/Number} eventWidth How the width of an event bar will be calculated in Day View
		 * Possible values:
		 * auto: This will expand the bar to fill the space
		 * <number>: This will make the event bars this explicit width
		 */
		eventWidth: 'auto',

		/**
		 * @cfg {String} startEventField Name of the Model field which contains the Event's Start date
		 */
		startEventField: 'start',

		/**
		 * @cfg {String} endEventField Name of the Model field which contains the Event's End date
		 */
		endEventField: 'end',

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
		 * {Ext.Element} eventWrapperEl The Ext.Element that contains all of the Event Bar elements
		 * @accessor
		 */
		eventWrapperEl: null

	},
    
    init: function(calendar){
	    var me = this;

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
	    this.calendar.setViewMode = this.createPreSequence(this.calendar.setViewMode, this.onViewModeUpdate, this);
	    this.calendar.onComponentResize = Ext.Function.createSequence(this.calendar.onComponentResize, this.onComponentResize, this);

	    // default to Day mode processor
		this.onViewModeUpdate(this.calendar.getViewMode());
    },

	/**
	 * Method that is executed after the parent calendar's onComponentResize event handler has completed.
	 * We want to refresh the event bars we're displaying but we must delay the refresh so the resize (mainly a
	 * orientation change) to take place so the calculations are using figures from final positions (i.e. the underlying table cells are
	 * where they are going to be, if we do it too soon the bars are in the wrong place.)
	 * @method
	 * @private
	 */
	onComponentResize: function(){
		var me = this;

		setTimeout(function(){
			me.refreshEvents();
		}, 200);
	},

	/**
	 * Creates a "Pre-Sequence" function.
	 * Identical to the Ext.Function.createSequence function but reverses the order the functions are executed in.
	 * This calls the newFn first and then the originalFn
	 * @method
	 * @private
	 * @param originalFn
	 * @param newFn
	 * @param scope
	 * @return {*}
	 */
	createPreSequence: function(originalFn, newFn, scope){
		if (!newFn) {
			return originalFn;
		}
		else {
			return function() {
				newFn.apply(scope || this, arguments);

				var result = originalFn.apply(this, arguments);

				return result;
			};
		}
	},

	/**
	 * Called BEFORE the parent calendar's setViewMode method is executed.
	 * This is because we need to have the new processor in place so the calendar refresh can use it.
	 * @method
	 * @private
	 * @param {String} viewMode
	 */
	onViewModeUpdate: function(viewMode){
		this.setViewModeProcessor(Ext.create(this.getViewModeProcessorClass(viewMode), {
			calendar: this.calendar,
			plugin: this
		}));
	},

	/**
	 * Returns the appropriate ViewMode Processor class based on the ViewMode
	 * passed in
	 * @method
	 * @private
	 * @param {String} viewMode The viewMode to get the processor class for
	 * @return {String} The Processor class name
	 */
	getViewModeProcessorClass: function(viewMode){
		var processorCls    = '';

		switch(viewMode.toLowerCase()){

			case 'month':
				processorCls = 'Ext.ux.TouchCalendarMonthEvents';
				break;

			case 'week':
				processorCls = 'Ext.ux.TouchCalendarWeekEvents';
				break;

			case 'day':
				processorCls = 'Ext.ux.TouchCalendarDayEvents';
				break;
		}

		return processorCls;
	},
    
    /**
     * Regenerates the Event Bars
     * @method
     * @return {void}
     */
    refreshEvents: function(){

	    // scroll the parent calendar to the top so we're calculating positions from the base line.
	    if(this.calendar.getScrollable()){
		    this.calendar.getScrollable().getScroller().scrollTo(0,0);
	    }

	    this.removeEvents();
        
        this.getViewModeProcessor().generateEventBars(); // in turn calls this.renderEventBars(this.eventBarStore);
        
        this.createEventWrapper();
        
        
        if (this.getAllowEventDragAndDrop()) {
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
      this.calendar.element.select('div.' + eventRecord.internalId, this.calendar.element.dom).each(function(eventBar){
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
                        daysDifference = this.getDaysDifference(eventRecord.get(this.getStartEventField()), droppedDate);

                    if (this.getAutoUpdateEvent()) {
                        eventRecord.set(this.getStartEventField(), droppedDate);
                        eventRecord.set(this.getEndEventField(), eventRecord.get(this.getEndEventField()).add(Date.DAY, daysDifference));
                    }

                    this.refreshEvents();

                    this.calendar.fireEvent('eventdrop', draggable, droppable, eventRecord, e)

                    return;
                }
            }, this);

            this.calendar.all.removeCls(this.getCellHoverCls());

            if (!validDrop) { // if it wasn't a valid drop then move the Event Bar back to its original location
                draggable.setOffset(draggable.startOffset, true);
            }
        }
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
        this.calendar.element.select('div.' + eventRecord.internalId, this.calendar.element.dom).each(function(eventBar){
            if (eventBar.dom !== draggable.el.dom) {
                eventBar.hide();
            }
        }, this);
    
        this.calendar.fireEvent('eventdragstart', draggable, eventRecord, e);
    },
    
    /**
     * Creates the Event Bars' wrapper element and attaches a handler to it's click event
     * to handle taps on the Event Bars
     * @method
     * @private
     */
    createEventWrapper: function(){
        if (this.calendar.rendered && !this.getEventWrapperEl()) {
            this.setEventWrapperEl(Ext.DomHelper.append(this.getEventsWrapperContainer(), {
                tag: 'div',
                cls: this.getEventWrapperCls()
            }, true));

            this.getEventWrapperEl().on('tap', this.onEventWrapperTap, this, {
                delegate: 'div.' + this.getEventBarCls()
            });

	        if(this.getViewModeProcessor().eventBarStore){
	            this.getViewModeProcessor().renderEventBars(this.getViewModeProcessor().eventBarStore);
	        }
        } else {
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

	    var eventBarDom = e.getTarget('div.' + this.getEventBarCls());

	    if(eventBarDom){
		    var eventID = eventBarDom.getAttribute('eventID'),
			    eventBarEl  = Ext.fly(eventBarDom);

		    if (eventID) {
			    var eventRecord = this.getEventRecord(eventID);

			    this.deselectEvents();

			    eventBarEl.addCls(this.getEventBarSelectedCls());

			    this.calendar.fireEvent('eventtap', eventRecord, e);
		    }
	    }
    },
  
	getEventsWrapperContainer: function(){
		return this.calendar.element.select('thead th', this.calendar.element.dom).first() || this.calendar.element.select('tr td', this.calendar.element.dom).first();
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
        this.calendar.element.select('.' + this.getEventBarSelectedCls(), this.calendar.element.dom).removeCls(this.getEventBarSelectedCls());
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
        if (this.getEventWrapperEl()) {
            this.getEventWrapperEl().dom.innerHTML = '';
            this.getEventWrapperEl().destroy();
            this.setEventWrapperEl(null);
        }
        
        if (this.eventBarStore) {
            this.eventBarStore.remove(this.eventBarStore.getRange());
            this.eventBarStore = null;
        }
    
    if(this.droppable){
      this.droppable = null;
    }
    },

	applyEventBarTpl: function(tpl){
		if(Ext.isString(tpl) || Ext.isArray(tpl)){
			tpl = Ext.create('Ext.XTemplate', tpl);
		}

		return tpl;
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
});