/**
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

});