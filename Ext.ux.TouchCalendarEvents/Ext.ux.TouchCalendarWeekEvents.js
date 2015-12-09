/**
 * Ext.ux.TouchCalendarWeekEvents
 */
Ext.define('Ext.ux.TouchCalendarWeekEvents', {

    extend: 'Ext.ux.TouchCalendarMonthEvents',

renderEventBars: function(store){
		var me = this;
		//should get pulled

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

    	    var dateIndex = this.getCalendar().getStore().findBy(function(dateRec){
        	    return dateRec.get('date').getTime() === Ext.Date.clearTime(record.get('Date'), true).getTime();
	        }, this);

    	    var rowIndex = Math.floor(dateIndex / 7) + 1;

	        //calculate where it should be in the day roughly      
    	    //FIXME: figure out how to get the month bar height and the size of the text for the day numbers
        	//20 is just a rough guess that seems to work decently.  
	        var hour = (bodyHeight-20)/24;
    	    var minute = hour/60;
        	var startHour = record.data.Record.get(this.getPlugin().getStartEventField()).getHours();
	        var startMinutes = record.data.Record.get(this.getPlugin().getStartEventField()).getMinutes();
    	    var eventY = headerHeight + 20 + ((startHour * hour) + (startMinutes * minute));


	        var barLength = record.get('BarLength'),
	            dayCellX = (this.getCalendar().element.getWidth() / 7) * dayEl.dom.cellIndex,
	            dayCellWidth = dayEl.getWidth(),
	            spacing = this.getPlugin().getEventBarSpacing();

	        // set sizes and positions
	        eventBar.setLeft(dayCellX);
	        eventBar.setTop(eventY);
	        eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));

				if (record.linked().getCount() > 0) {
					this.renderEventBars(record.linked());
				}
			}, this);
	}
});