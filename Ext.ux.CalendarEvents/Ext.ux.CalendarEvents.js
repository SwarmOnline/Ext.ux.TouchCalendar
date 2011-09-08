Ext.regModel('Ext.ux.CalendarEventBarModel', {
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
	}, 'Record'],
    
    hasMany: [{
        model: 'Ext.ux.CalendarEventBarModel',
        name: 'linked'
    }]
});

Ext.override(Ext.util.Region, {
	partial: function(region) {
        var me = this, // cell
        dragWidth = region.right - region.left,
		dragHeight = region.bottom - region.top,
		
		horizontalValid = me.right > (region.left + (dragWidth/2)),
		verticalValid = me.bottom > (region.top + (dragHeight/2));
		
		return horizontalValid && verticalValid;
    }
});


Ext.ux.CalendarEvents = Ext.extend(Ext.util.Observable, {

    /**
     * Name of the Model field which contains the Event's Start date
     */
    startEventField: 'start',
    
    /**
     * Name of the Model field which contains the Event's End date
     */
    endEventField: 'end',
	
	/**
	 * Base CSS class given to each EventBar 
	 * @param {Object} calendar
	 */
	eventBarCls: 'event-bar',
	
	/**
	 * CSS class given to the EventBars' wrapping element
	 * @param {Object} calendar
	 */
	eventWrapperCls: 'event-wrapper',
	
	/**
	 * CSS class given to the EventBar after it has been selected
	 * @param {Object} calendar
	 */
	eventBarSelectedCls: 'event-bar-selected',
	
	/**
	 * Space (in pixels) between EventBars
	 */
	eventBarSpacing: 4,
    
    init: function(calendar){
    
        this.calendar = calendar; // cache the parent calendar
        this.calendar.eventsPlugin = this; // cache the plugin instance on the calendar itself  
        
		this.calendar.addEvents('eventtap');      
		
		this.calendar.on({
            refresh: this.refreshEvents,
            scope: this
        });
    },
	
	/**
	 * Regenerates the EventBars
	 */
	refreshEvents: function(){
		console.log('Event Bars generated');
		this.removeEvents();
		
		this.generateEventBars();
				
		this.createEventWrapper();
		
		this.renderEventBars(this.eventBarStore);

		new Ext.util.Droppable(this.calendar.body.select('td.day').first(), {
			validDropMode: 'partial',
			listeners: {
				drop: function(droppable, draggable, e, opts){
					var eventRecord = this.getEventRecord(draggable.el.getAttribute('eventID')),
						droppedDate = this.calendar.getCellDate(droppable.el),
						daysDifference = this.getDaysDifference(eventRecord.get(this.startEventField), droppedDate);
					
					eventRecord.set(this.startEventField, droppedDate);
					eventRecord.set(this.endEventField, eventRecord.get(this.endEventField).add(Date.DAY, daysDifference));
					
					this.refreshEvents();
				},
				dropactivate: function(droppable, draggable, e, opts){
					var eventRecord = this.getEventRecord(draggable.el.getAttribute('eventID'));
					
					this.calendar.body.select('div.' + eventRecord.internalId).each(function(eventBar){
						if (eventBar.dom !== draggable.el.dom) {
							eventBar.hide();
						}
					}, this);
				},
				dropdeactivate: function(){
					console.log('deactivate');
				},
				scope: this
			}
		});
	},
    
    /**
     * Processes the Events store and generates the EventBar records needed to create the markup
     */
    generateEventBars: function(){
		// create a new store to store the Event Bars as they are defined
		this.eventBarStore = new Ext.data.Store({
            model: 'Ext.ux.CalendarEventBarModel',
			data: []
        });
		
        var dates = this.calendar.dateCollection;
        var store = this.calendar.store;
        var eventBarRecord;
		
		// Loop through Calendar's date collection of visible dates
        dates.each(function(dateObj){
            var currentDate = dateObj.date,
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
					while(eventBarRecord.linked().getCount() > 0){
						eventBarRecord = eventBarRecord.linked().getAt(eventBarRecord.linked().getCount() - 1);
					}				
					
					// if currentDate is at the start of the week then we must create a new EventBarRecord
					// to represent the new bar on the next row.
					if (currentDate.getDay() === 1) {
						// push the inherited BarPosition of the parent 
						// EventBarRecord onto the takenDatePositions array
						takenDatePositions.push(eventBarRecord.get('BarPosition'));
						
						// create a new EventBar record 
						var wrappedEventBarRecord = Ext.ModelMgr.create({
							EventID: event.internalId,
							Date: currentDate,
							BarLength: 1,
							BarPosition: eventBarRecord.get('BarPosition'),
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
	 * @param {Object} store
	 */
	renderEventBars: function(store){
		
		store.each(function(record){
			var eventRecord = this.getEventRecord(record.get('EventID')),			
				dayEl = this.calendar.getDateCell(record.get('Date')),
				doesWrap = this.eventBarDoesWrap(record),
				hasWrapped = this.eventBarHasWrapped(record);
			
			// create the event bar
			var eventBar = Ext.DomHelper.append(this.eventWrapperEl, {
				tag: 'div',
				html: eventRecord.get('title'),
				eventID: record.get('EventID'),
				cls: this.eventBarCls + ' ' + record.get('EventID') + (doesWrap ? ' wrap-end' : '') + (hasWrapped ? ' wrap-start' : '')
			}, true);
			
			new Ext.util.Draggable(eventBar, {
				revert: true
			});
			
			var barPosition = record.get('BarPosition'),
				barLength = record.get('BarLength'),
				dayCellX = dayEl.getX(),
				dayCellY = dayEl.getY(),
				dayCellHeight = dayEl.getHeight(),
				dayCellWidth = dayEl.getWidth();
				eventBarHeight = eventBar.getHeight();
				
			var spacing = this.eventBarSpacing;

			// set sizes and positions
			eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
			eventBar.setTop((((dayCellY - this.calendar.body.getY()) + dayCellHeight) - eventBarHeight) - ((barPosition * eventBarHeight + (barPosition * spacing) + spacing)));
			eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));
			
			if(record.linked().getCount() > 0){
				this.renderEventBars(record.linked());
			}
		}, this);
	},
	
	/**
	 * Returns true if the specified EventBar record will wrap and so will need square ends
	 * Compares the calculated date that the bar will end on and the actual end date of the event. If they aren't the same
	 * the bar will wrap to the next row
	 * @param {Ext.ux.CalendarEventBarModel} r
	 */
	eventBarDoesWrap: function(r){
		var barEndDate = r.get('Date').add(Date.DAY,(r.get('BarLength')-1));
		return barEndDate.clearTime(true).getTime() !== r.get('Record').get(this.endEventField).clearTime(true).getTime();
	},
	/**
	 * Returns true if the specified EventBar record has been wrapped from the row before.
	 * @param {Ext.ux.CalendarEventBarModel} r
	 */
	eventBarHasWrapped: function(r){
		return r.get('Date').clearTime(true).getTime() !== r.get('Record').get(this.startEventField).clearTime(true).getTime();
	},
    
	/**
	 * Creates the Event Bars' wrapper element and attaches a handler to it's click event
	 * to handle taps on the Event Bars
	 */
    createEventWrapper: function(){
        if (this.calendar.rendered && !this.eventWrapperEl) {
            this.eventWrapperEl = Ext.DomHelper.append(this.calendar.body, {
                tag: 'div',
                cls: this.eventWrapperCls
            }, true);
			
			this.calendar.mon(this.eventWrapperEl, 'click', this.onEventWrapperTap, this, {
				delegate: 'div.' + this.eventBarCls
			});
        }
    },
	
	/**
	 * Handler function for the tap event on the eventWrapperEl
	 * @param {Object} e
	 * @param {Object} node
	 */
	onEventWrapperTap: function(e, node){
		var eventID = node.attributes['eventID'];
		if (eventID) {
			var eventRecord = this.getEventRecord(node.attributes['eventID'].value);
			
			this.deselectEvents();
			
			this.eventWrapperEl.select('div.' + eventRecord.internalId).addCls(this.eventBarSelectedCls);
			
			this.calendar.fireEvent('eventtap', eventRecord);
		}
	},
	
	/**
	 * Returns the first index number that isn't in the specified array
	 * @param {array} datePositions
	 */
	getNextFreePosition: function(datePositions){
		var i = 0;
		
		// loop until the i value isn't present in the array
		while(datePositions.indexOf(i) > -1){
			i++;
		}
		return i;
	},
	
	/**
	 * Get the Event record with the specified eventID (eventID equates to a record's internalId)
	 * @param {Object} eventID
	 */
	getEventRecord: function(eventID){
		var eventRecordIndex = this.calendar.store.findBy(function(rec){
				return rec.internalId === eventID;
			}, this);
		return this.calendar.store.getAt(eventRecordIndex);
	},
	
	/**
	 * Remove the selected CSS class from all selected Event Bars
	 */
	deselectEvents: function(){
		this.calendar.body.select('.' + this.eventBarSelectedCls).removeCls(this.eventBarSelectedCls);
	},
	
	getDaysDifference: function(date1, date2){
		date1 = date1.clearTime(true).getTime(),
		date2 = date2.clearTime(true).getTime();
		
		var diff = date2 - date1;
		
		return diff/1000/60/60/24;
	},
	
	/**
	 * Removes all the event markers and their markup
	 * This is added to the parent Calendar's class so must be executed via the parent
	 */
	removeEvents: function(){
		if(this.eventWrapperEl){
			this.eventWrapperEl.dom.innerHTML = '';
			this.eventWrapperEl.remove();
			this.eventWrapperEl = null;
		}
		
		if(this.eventBarStore){
			this.eventBarStore.remove(this.eventBarStore.getRange());
			this.eventBarStore = null;
		}
	}
});
