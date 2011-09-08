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




Ext.ux.CalendarEvents = Ext.extend(Ext.util.Observable, {

    /**
     * Name of the field which contains the Event's dates
     */
    startEventField: 'start',
    
    endEventField: 'end',
    
    init: function(calendar){
    
        this.calendar = calendar; // cache the parent calendar
        this.calendar.eventsPlugin = this; // cache the plugin instance on the calendar itself  
        
		this.calendar.addEvents('eventtap');      
		
		this.calendar.on({
            refresh: this.refreshEvents,
            scope: this
        });
    },
	
	refreshEvents: function(){
		this.removeEvents();
		
		this.generateEventBars();
				
		this.createWrapper();
		
		this.renderEventBars();
	},
    
    
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
            var currentDate = dateObj.date.clearTime(true).getTime();
            var takenDatePositions = []; // stores 'row positions' that are taken on current date
			
			// Filter the Events Store for events that are happening on the currentDate
            store.filterBy(function(record){
				var startDate = record.get(this.startEventField).clearTime(true).getTime(),
					endDate = record.get(this.endEventField).clearTime(true).getTime();
					
                return (startDate <= currentDate) && (endDate >= currentDate);
            }, this);
            
			// sort the Events Store so we have a consistent ordering over dates
            store.sort(this.storeDateField, 'ASC');
            
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
							Date: date,
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
					var pos = this.getNextFreePosition(takenDatePositions);
					
					// push it onto array so it isn't reused
					takenDatePositions.push(pos);
					
					// create new EventBar record
					eventBarRecord = Ext.ModelMgr.create({
						EventID: event.internalId,
						Date: date,
						BarLength: 1,
						BarPosition: pos,
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
	
	renderEventBars: function(){
		var store = this.eventBarStore;
		
		store.each(function(record){
			var eventRecord = this.getEventRecord(record.get('EventID')),			
				dayEl = this.calendar.getDateCell(record.get('Date')),
				doesWrap = record.linked().getCount() > 0,
				hasWrapped = record.get('Date').clearTime(true).getTime() !== record.get('Record').get('start').clearTime(true).getTime();
			
			var eventBar = Ext.DomHelper.append(this.eventWrapperEl, {
				tag: 'div',
				html: eventRecord.get('title'),
				eventID: record.get('EventID'),
				cls: 'event-bar ' + record.get('EventID') + (doesWrap ? ' wrap-end' : '') + (hasWrapped ? ' wrap-start' : '')
			}, true);
			
			var barPosition = record.get('BarPosition'),
				barLength = record.get('BarLength'),
				dayCellX = dayEl.getX(),
				dayCellY = dayEl.getY(),
				dayCellHeight = dayEl.getHeight(),
				dayCellWidth = dayEl.getWidth();
				eventBarHeight = eventBar.getHeight();
				
			var spacing = 4;

			eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
			eventBar.setTop((((dayCellY - this.calendar.body.getY()) + dayCellHeight) - eventBarHeight) - ((barPosition * eventBarHeight + (barPosition * spacing) + spacing)));
			eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));
			
			if(record.linked().getCount() > 0){
				this.createBars(record.linked());
			}
		}, this);
	},
    
    createWrapper: function(){
        if (this.calendar.rendered && !this.eventWrapperEl) {
            this.eventWrapperEl = Ext.DomHelper.append(this.calendar.body, {
                tag: 'div',
                cls: 'event-wrapper'
            }, true);
			
			this.eventWrapperEl.on('click', function(e, node){
					var eventRecord = this.getEventRecord(node.attributes['eventID'].value);
					
					this.deselectEvents();
					
					Ext.fly(node).addCls('event-bar-selected');
					
					this.calendar.fireEvent('eventtap', eventRecord);
				}, this, {
					delegate: 'div.event-bar'
				});
        }
    },
	
	getNextFreePosition: function(datePositions){
		var i = 0;
		
		while(datePositions.indexOf(i) > -1){
			i++;
		}
		return i;
	},
	
	getEventRecord: function(eventID){
		var eventRecordIndex = this.calendar.store.findBy(function(rec){
				return rec.internalId === eventID;
			}, this);
		return this.calendar.store.getAt(eventRecordIndex);
	},
	
	deselectEvents: function(){
		this.calendar.body.select('.event-bar-selected').removeCls('event-bar-selected');
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
