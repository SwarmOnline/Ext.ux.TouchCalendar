Ext.regModel('Ext.ux.CalendarEventBar', {
    fields: ['eventID', {
        name: 'date',
        type: 'date'
    }, 'barLength', 'barPosition', 'colour', 'record'],
    
    hasMany: [{
        model: 'Ext.ux.CalendarEventBar',
        name: 'children'
    }]
});




Ext.ux.CalendarEvents = Ext.extend(Ext.util.Observable, {

    /**
     * Name of the field which contains the Event's date
     */
    startEventField: 'start',
    
    endEventField: 'end',
    
    init: function(calendar){
    
        this.calendar = calendar; // cache the parent calendar
        this.calendar.eventsPlugin = this; // cache the plugin instance on the calendar itself  
        
		this.calendar.addEvents('eventtap');      
		
		this.calendar.on({
            refresh: this.processEvents,
            scope: this
        });
    },
    
    
    processEvents: function(){
		this.removeEvents();
		
		this.eventBarStore = new Ext.data.Store({
            model: 'Ext.ux.CalendarEventBar',
			data: []
        });
		
        var dates = this.calendar.dateCollection;
        var store = this.calendar.store;
        var eventBarRecord;
		
        dates.each(function(dateObj){
            var date = dateObj.date;
            var datePositions = [];
			
            store.filterBy(function(record){
                return (record.get('start').clearTime(true).getTime() <= date.clearTime(true).getTime()) && (record.get('end').clearTime(true).getTime() >= date.clearTime(true).getTime());
            });
            
            store.sort(this.storeDateField, 'ASC');
            
            store.each(function(event){
                var eventBarIndex = this.eventBarStore.findBy(function(record, id){
                    return record.get('eventID') === event.internalId;
                }, this);
                
                if (eventBarIndex > -1) {
					eventBarRecord = this.eventBarStore.getAt(eventBarIndex);
					
					while(eventBarRecord.children().getCount() > 0){
						eventBarRecord = eventBarRecord.children().getAt(eventBarRecord.children().getCount() - 1);
					}				
					
					if (date.getDay() === 1) {
						datePositions.push(eventBarRecord.get('barPosition'));
						
						var wrappedEventBarRecord = Ext.ModelMgr.create({
							eventID: event.internalId,
							date: date,
							barLength: 1,
							barPosition: eventBarRecord.get('barPosition'),
							colour: eventBarRecord.get('colour'),
							record: event
						}, 'Ext.ux.CalendarEventBar');
						
						eventBarRecord.children().add(wrappedEventBarRecord);
					}
					else {
						datePositions.push(eventBarRecord.get('barPosition'));
						eventBarRecord.set('barLength', eventBarRecord.get('barLength') + 1);
					}
				}
				else {
					var pos = this.getNextFreePosition(datePositions);
					datePositions.push(pos);
					
					eventBarRecord = Ext.ModelMgr.create({
						eventID: event.internalId,
						date: date,
						barLength: 1,
						barPosition: pos,
						colour: "#"+("000"+(Math.random()*(1<<24)|0).toString(16)).substr(-6),
						record: event
					}, 'Ext.ux.CalendarEventBar');
					
					this.eventBarStore.add(eventBarRecord);
				}
                
            }, this);
			
			store.clearFilter();
        }, this);
		
		this.createWrapper();
		
		this.createBars(this.eventBarStore);
        
        if(!this.refreshListenerAdded){
			
			this.refreshListenerAdded = true;
		}
    },
	
	createBars: function(store){
		store.each(function(record){
			var eventRecord = this.getEventRecord(record.get('eventID')),			
				dayEl = this.calendar.getDateCell(record.get('date')),
				doesWrap = record.children().getCount() > 0,
				hasWrapped = record.get('date').clearTime(true).getTime() !== record.get('record').get('start').clearTime(true).getTime();
			
			var eventBar = Ext.DomHelper.append(this.eventWrapperEl, {
				tag: 'div',
				html: eventRecord.get('title'),
				eventID: record.get('eventID'),
				cls: 'event-bar ' + record.get('eventID') + (doesWrap ? ' wrap-end' : '') + (hasWrapped ? ' wrap-start' : '')//,
				//style: 'background-color: ' + record.get('colour')
			}, true);
			
			var barPosition = record.get('barPosition');
				barLength = record.get('barLength');
				dayCellX = dayEl.getX(),
				dayCellY = dayEl.getY(),
				dayCellHeight = dayEl.getHeight(),
				dayCellWidth = dayEl.getWidth();
				eventBarHeight = eventBar.getHeight();
				
			var spacing = 4;

			eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
			eventBar.setTop((((dayCellY - this.calendar.body.getY()) + dayCellHeight) - eventBarHeight) - ((barPosition * eventBarHeight + (barPosition * spacing) + spacing)));
			eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));
			
			if(record.children().getCount() > 0){
				this.createBars(record.children());
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
		return eventRecord = this.calendar.store.getAt(eventRecordIndex);
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
