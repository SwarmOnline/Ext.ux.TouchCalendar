/**
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

});