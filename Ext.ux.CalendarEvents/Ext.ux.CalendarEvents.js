Ext.regModel('Ext.ux.CalendarEventBar', {
    fields: ['eventID', {
        name: 'date',
        type: 'date'
    }, 'barLength', 'barPosition', 'colour'],
    
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
        this.eventBarStore = new Ext.data.Store({
            model: 'Ext.ux.CalendarEventBar',
			data: []
        });
        
		
		this.calendar.on('afterlayout', function(){
			clearTimeout(this.layoutTimeout);
			
			this.layoutTimeout = setTimeout(Ext.createDelegate(function(){
				clearTimeout(this.layoutTimeout);
								
				// Rerender the markup
				this.processEvents();
			}, this), 400);

		}, this);
		
        /*
this.calendar.on({
            afterrender: this.createWrapper,
            refresh: this.processEvents,
            scope: this
        });
*/
    },
    
    
    processEvents: function(){
		this.removeEvents();
		
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
							colour: eventBarRecord.get('colour')
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
						colour: "#"+("000"+(Math.random()*(1<<24)|0).toString(16)).substr(-6)
					}, 'Ext.ux.CalendarEventBar');
					
					this.eventBarStore.add(eventBarRecord);
				}
                
            }, this);
			
			store.clearFilter();
        }, this);
		
		this.createWrapper();
		
		this.createBars(this.eventBarStore);
        
        console.log(this.eventBarStore);       
    },
	
	createBars: function(store){
		store.each(function(record){
			var eventRecordIndex = this.calendar.store.findBy(function(rec){
				return rec.internalId === record.get('eventID');
			}, this);
			var eventRecord = this.calendar.store.getAt(eventRecordIndex);
			
			var dayEl = this.calendar.getDateCell(record.get('date'));
			
			var el = Ext.DomHelper.append(this.eventWrapperEl, {
				tag: 'div',
				html: eventRecord.get('title'),
				cls: 'event-bar ' + record.get('eventID'),
				style: 'background-color: ' + record.get('colour')
			}, true);
			
			var pos = record.get('barPosition');

			el.setLeft(dayEl.getX());
			el.setTop((((dayEl.getY() - this.calendar.body.getY()) + dayEl.getHeight()) - el.getHeight()) - ((pos * el.getHeight() + (pos * 3))));
			el.setWidth(dayEl.getWidth() * record.get('barLength'));
			
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
        }
    },
	
	getNextFreePosition: function(datePositions){
		var i = 0;
		
		while(datePositions.indexOf(i) > -1){
			i++;
		}
		return i;
	},
	
	/**
	 * Removes all the event markers and their markup
	 * This is added to the parent Calendar's class so must be executed via the parent
	 */
	removeEvents: function(){
		if(this.eventWrapperEl){
			this.eventWrapperEl.dom.innerHTML = '';
		}
	}
});
