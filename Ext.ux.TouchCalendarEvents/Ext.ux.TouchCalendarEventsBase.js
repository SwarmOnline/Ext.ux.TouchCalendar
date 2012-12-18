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

			// Filter the Events Store for events that are happening on the currentDate
			eventStore.filterBy(Ext.bind(this.eventFilterFn, this, [currentDateTime], true), this);

			// sort the Events Store so we have a consistent ordering to ensure no overlaps
			eventStore.sort(this.getPlugin().getStartEventField(), this.getEventSortDirection());

			// Loop through currentDate's Events
			eventStore.each(function(event){

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

			// remove the filter
			eventStore.clearFilter();

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
	 * Get the Event record with the specified eventID (eventID equates to a record's internalId)
	 * @method
	 * @private
	 * @param {Object} eventID
	 */
	getEventRecord: function(eventID){
		var eventRecordIndex = this.getCalendar().eventStore.findBy(function(rec){
			return rec.internalId === eventID;
		}, this);
		return this.getCalendar().eventStore.getAt(eventRecordIndex);
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
				(hasWrapped ? ' wrap-start' : '')
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

});