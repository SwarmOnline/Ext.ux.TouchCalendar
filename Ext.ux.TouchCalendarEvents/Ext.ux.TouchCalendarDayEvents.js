/**
 * Ext.ux.TouchCalendarDayEvents
 */
Ext.define('Ext.ux.TouchCalendarDayEvents', {

    extend: 'Ext.ux.TouchCalendarEventsBase',

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

		var dates = this.getCalendar().getStore();
		var store = this.getCalendar().eventStore;
		var eventBarRecord;

		// Loop through Calendar's date collection of visible dates
		dates.each(function(dateObj){
			var currentDate = dateObj.get('date'),
				currentDateTime = currentDate.getTime(),
				takenDatePositions = []; // stores 'row positions' that are taken on current date

			// Filter the Events Store for events that are happening on the currentDate
			store.filterBy(Ext.bind(this.eventFilterFn, this, [currentDateTime], true), this);

			// sort the Events Store so we have a consistent ordering to ensure no overlaps
			store.sort(this.getPlugin().startEventField, 'ASC');

			// Loop through currentDate's Events
			store.each(function(event){
				//debugger;
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
					if (currentDate.getDay() === this.getCalendar().weekStart) {
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


	eventFilterFn: function(record, currentDateTime){
		//debugger;
		var startDate   = this.getRoundedTime(record.get(this.getPlugin().startEventField)).getTime(),
			endDate     = this.getRoundedTime(record.get(this.getPlugin().endEventField)).getTime();

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

				verticalPos     = this.getVerticalDayPosition(rec),
				horizontalPos   = this.getHorizontalDayPosition(rec),
				eventHeight     = this.getEventBarHeight(rec);

			eventBar.setLeft(horizontalPos);
			eventBar.setTop(verticalPos - this.getCalendar().element.getY());

			eventBar.setHeight(eventHeight);
			eventBar.setWidth(100);

			eventBar.addCls(eventRecord.get(this.getPlugin().getCssClassField()));
		}

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
		var startDate           = event.data.Record.get(this.getPlugin().startEventField),
			endDate             = event.data.Record.get(this.getPlugin().endEventField),
			roundedStartDate    = this.getRoundedTime(startDate),
			minutesLength       = (endDate.getTime() - startDate.getTime()) / 1000 / 60,
			timeSlotEl          = this.getCalendar().getDateCell(roundedStartDate),
			timeSlotRowEl       = timeSlotEl.parent('tr', false),
			heightPixels        = 0;

		if(timeSlotRowEl){
			var timeSlotHeight  = timeSlotEl.getHeight(),
				minutesPerPixel = timeSlotHeight / 30;

			heightPixels    = minutesLength * minutesPerPixel;

			console.log('Height: ' + heightPixels.toString());
		}

		return heightPixels;
	},

	getVerticalDayPosition: function(event){
		var startDate           = event.data.Record.get(this.getPlugin().startEventField),
			roundedStartDate    = this.getRoundedTime(startDate),
			timeSlotCount       = (roundedStartDate.getHours() * 2) + (roundedStartDate.getMinutes() === 30 ? 1 : 0),
			minutesDiff         = (startDate.getTime() - roundedStartDate.getTime()) / 1000 / 60,
			firstTimeSlotEl     = this.getCalendar().element.select('td').first(),
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

	getHorizontalDayPosition: function(event){
		var barPos      = event.get('BarPosition'),
			leftMargin  = 50,
			barWidth    = 100,
			spacing = this.getPlugin().eventBarSpacing;

		return leftMargin + (barPos * barWidth) + (barPos * spacing);
	},

	/**
	 * Returns the specified date rounded to the nearest 30 minute block.
	 * @method
	 * @private
	 * @param {Date} date
	 * @return {Date}
	 */
	getRoundedTime: function(date){
		date = Ext.Date.clone(date);

		var minutes = date.getMinutes();

		date.setMinutes(minutes - (minutes % 30));

		return date;
	}

});