/**
 * Ext.ux.TouchCalendarMonthEvents
 */
Ext.define('Ext.ux.TouchCalendarMonthEvents', {

    extend: 'Ext.ux.TouchCalendarEventsBase',

	eventFilterFn: function(record, currentDateTime){
		var startDate = Ext.Date.clearTime(record.get(this.getPlugin().startEventField), true).getTime(),
			endDate = Ext.Date.clearTime(record.get(this.getPlugin().endEventField), true).getTime();

		return (startDate <= currentDateTime) && (endDate >= currentDateTime);
	},
	weekFilterFn: function(record, currentDateTime){
		return this.monthFilterFn.call(this, record, currentDateTime);
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

		var dates = this.getCalendar().getStore();
		var store = this.getCalendar().eventStore;
		var eventBarRecord;

		// Loop through Calendar's date collection of visible dates
		dates.each(function(dateObj){
			var currentDate = dateObj.get('date'),
				currentDateTime = this.getCalendar().getViewMode().toLowerCase() === 'day' ? currentDate.getTime() : Ext.Date.clearTime(currentDate, true).getTime(),
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
				dayEl = this.getCalendar().getDateCell(record.get('Date')),
				doesWrap = this.getPlugin().eventBarDoesWrap(record),
				hasWrapped = this.getPlugin().eventBarHasWrapped(record);

			// create the event bar
			var eventBar = Ext.DomHelper.append(this.getPlugin().eventWrapperEl, {
				tag: 'div',
				style: {
					'background-color': eventRecord.get(this.getPlugin().colourField)
				},
				html: this.getPlugin().getEventBarTpl().apply(eventRecord.data),
				eventID: record.get('EventID'),
				cls: this.getPlugin().getEventBarCls() + ' ' + record.get('EventID') + (doesWrap ? ' wrap-end' : '') + (hasWrapped ? ' wrap-start' : '')
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


			var headerHeight = this.getCalendar().element.select('thead').first().getHeight();
			var bodyHeight = this.getCalendar().element.select('tbody').first().getHeight();
			var rowCount = this.getCalendar().element.select('tbody tr').getCount();
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
				spacing = this.getPlugin().eventBarSpacing;

			// set sizes and positions
			eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
			eventBar.setTop(eventY - eventBarHeight - (barPosition * eventBarHeight + (barPosition * spacing) + spacing));
			eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));

			if (record.linked().getCount() > 0) {
				this.renderEventBars(record.linked());
			}
		}, this);
	}

});