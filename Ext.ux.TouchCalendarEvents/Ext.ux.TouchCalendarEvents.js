/**
 * @copyright     (c) 2012, by SwarmOnline.com
 * @date          29th May 2012
 * @version       0.1
 * @documentation  
 * @website        http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendarEvents
 * @author Stuart Ashworth
 *
 * For use with Sencha Touch 2
 * 
 * This plugin also allows a store to be bound to the Ext.ux.TouchCalendar and will display the store's events as bars spanning its relevant days. 
 * 
 * ![Ext.ux.TouchCalendarEvents Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarEvents--month-ss.png)
 * 
 * [Ext.ux.TouchCalendarEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendarEvents.html)
 * 
 */
Ext.define('Ext.ux.TouchCalendarEvents', {
  extend: 'Ext.mixin.Observable',
  config: {
    /**
     * @cfg {String} eventBarTpl Template that will be used to fill the Event Bar
     */
    eventBarTpl : '{title}' // make this an internal set-able property
  },
  /**
   * @cfg {String} startEventField Name of the Model field which contains the Event's Start date
   */
  startEventField: 'start',
  
  /**
   * @cfg {Stirng} endEventField Name of the Model field which contains the Event's End date
   */
  endEventField: 'end',
  
  /**
   * @cfg {String} colourField Name of the Model field which contains a colour to be applied to the 
   * event bar
   */
  colourField: 'colour',
  
  /**
   * @cfg {String} eventBarCls Base CSS class given to each EventBar
   */
  eventBarCls: 'event-bar',
  
  /**
   * @cfg {String} eventWrapperCls CSS class given to the EventBars' wrapping element
   */
  eventWrapperCls: 'event-wrapper',
  
  /**
   * @cfg {String} eventBarSelectedCls CSS class given to the EventBar after it has been selected
   */
  eventBarSelectedCls: 'event-bar-selected',
  
  /**
   * @cfg {String} cellHoverCls CSS class given to date cells when an event is dragged over
   */
  cellHoverCls: 'date-cell-hover',
    
  /**
   * @cfg {Boolean} autoUpdateEvent Decides whether the configured startEventField and endEventField 
   * dates are updated after an event is dragged and dropped
   */
  autoUpdateEvent: true,
  
  /**
   * @cfg {Boolean} allowEventDragAndDrop Decides whether the Event Bars can be dragged and dropped
   */
  allowEventDragAndDrop: false,
  
    /**
     * @cfg {Number} eventBarSpacing Space (in pixels) between EventBars
     */
    eventBarSpacing: 1,
 
    
    init: function(calendar){
        this.calendar = calendar; // cache the parent calendar
        this.calendar.eventsPlugin = this; // cache the plugin instance on the calendar itself  
        

	      /**
	       * @event eventtap
	       * Fires when an Event Bar is tapped
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the tap operation
	       */

	      /**
	       * @event eventdragstart
	       * Fires when an Event Bar is initially dragged.
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the drag operation
	       */

	      /**
	       * @event beforeeventdrop
	       * Fires before an Event Bar drop is accepted. Return false to prevent the drop from
	       * happening. This event can be used to add additional validation for Event moves
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.util.Droppable} droppable The Calendar's Ext.util.Droppable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the drag operation
	       */

	      /**
	       * @event eventdrop
	       * Fires when an Event Bar is dragged and dropped on a date
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.util.Droppable} droppable The Calendar's Ext.util.Droppable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Event} e The event object for the drag operation
	       */

	      /**
	       * @event eventdrag
	       * Fires while an Event Bar is being dragged.
	       * @param {Ext.util.Draggable} draggable The Event Bar's Ext.util.Draggable instance
	       * @param {Ext.data.Model} eventRecord The model that the dragged Event Bar represents
	       * @param {Date} currentDate The date that the Event Bar is currently over
	       * @param {Ext.Element} currentDateCell The Ext.Element representing the table cell of the current date
	       * @param {Event} e The event object for the drag operation
	       */


	    // create a sequence to refresh the Event Bars when the calendar either refreshes or has a component layout happen
	    this.calendar.refresh = Ext.Function.createSequence(this.calendar.refresh, this.refreshEvents, this);
	    this.calendar.afterComponentLayout = Ext.Function.createSequence(this.calendar.afterComponentLayout, this.refreshEvents, this);
    },
    
    /**
     * Regenerates the Event Bars
     * @method
     * @return {void}
     */
    refreshEvents: function(){
        this.removeEvents();
        
        this.generateEventBars(); // in turn calls this.renderEventBars(this.eventBarStore);
        
        this.createEventWrapper();
        
        
    if (this.allowEventDragAndDrop) {
      this.createDroppableRegion();
    }
    },
  
  /**
   * Creates a Ext.util.Droppable region for the Calendar's body element
   * @method
   * @private
   */
  createDroppableRegion: function(){
    var me = this;
    var onDragCount = 0;
    /**
     * @property {Ext.util.Droppable} droppable Contains the Ext.util.Droppable instance on the Calendar's body element
     */
    //TODO: Re-implement when droppable is supported in ST2 again
//    this.droppable = new Ext.util.Droppable(this.calendar.getEl(), {
//      /**
//       * Override for Droppable's onDrag function to add hover class to active date cell
//       * @method       
//       * @private
//       * @param {Object} draggable
//       * @param {Object} e
//       */
//            onDrag: function(draggable, e){
//        if (draggable.el.hasCls(me.eventBarCls)) {
//          this.setCanDrop(this.isDragOver(draggable), draggable, e);
//          onDragCount++;
//
//          if (onDragCount % 15 === 0) {
//            var currentDateCell, currentDate, eventRecord = me.getEventRecord(draggable.el.getAttribute('eventID'));
//            
//            me.calendar.all.removeCls(me.cellHoverCls);
//            
//            me.calendar.all.each(function(cell, index){
//              var cellRegion = cell.getPageBox(true);
//              var eventBarRegion = draggable.el.getPageBox(true);
//              
//              if (cellRegion.partial(eventBarRegion)) {
//                currentDateCell = cell;
//                currentDate = this.calendar.getCellDate(cell);
//                
//                cell.addCls(me.cellHoverCls);
//                return;
//              }
//            }, me);
//            
//            me.calendar.fireEvent('eventdrag', draggable, eventRecord, currentDate, currentDateCell, e);
//            onDragCount = 0;
//          }
//        }
//      }
//        });
//    
//    this.droppable.on({
//      drop: this.onEventDrop,
//            dropdeactivate: this.onEventDropDeactivate,
//            scope: this
//    });
  },
  
  /**
   * Handler for when an Event's drag is invalid and must be reset
   * @method
   * @private
   * @param {Ext.util.Droppable} droppable
   * @param {Ext.util.Draggable} draggable
   * @param {Event} e
   * @param {Object} opts
   */
  onEventDropDeactivate: function(droppable, draggable, e, opts){
    if (draggable.el.hasCls(this.eventBarCls)) {
      var eventRecord = this.getEventRecord(draggable.el.getAttribute('eventID'));
      
      // reshow all the hidden linked Event Bars
      this.calendar.element.select('div.' + eventRecord.internalId).each(function(eventBar){
        eventBar.show();
      }, this);
    }
    },
  
  /**
   * Function to handle the dropping of an event onto the calendar.
   * Figures out what date is was dropped on and updates its store with the new details.
   * @method
   * @private
   * @param {Ext.util.Droppable} droppable
   * @param {Ext.util.Draggable} draggable
   * @param {Event} e
   * @param {Object} opts
   */
  onEventDrop: function(droppable, draggable, e, opts){
        var validDrop = false;

        if(draggable.el.hasCls(this.eventBarCls)){
        
            this.calendar.all.each(function(cell){
                var cellRegion = cell.getPageBox(true);
                var eventBarRegion = draggable.el.getPageBox(true);

                if (cellRegion.partial(eventBarRegion) && this.calendar.fireEvent('beforeeventdrop', draggable, droppable, eventRecord, e)) {
                    validDrop = true;
                    var eventRecord = this.getEventRecord(draggable.el.getAttribute('eventID')),
                        droppedDate = this.calendar.getCellDate(cell),
                        daysDifference = this.getDaysDifference(eventRecord.get(this.startEventField), droppedDate);

                    if (this.autoUpdateEvent) {
                        eventRecord.set(this.startEventField, droppedDate);
                        eventRecord.set(this.endEventField, eventRecord.get(this.endEventField).add(Date.DAY, daysDifference));
                    }

                    this.refreshEvents();

                    this.calendar.fireEvent('eventdrop', draggable, droppable, eventRecord, e)

                    return;
                }
            }, this);

            this.calendar.all.removeCls(this.cellHoverCls);

            if (!validDrop) { // if it wasn't a valid drop then move the Event Bar back to its original location
                draggable.setOffset(draggable.startOffset, true);
            }
        }
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
        
        var dates = this.calendar.getStore();
        var store = this.calendar.eventStore;
        var eventBarRecord;
        
        // Loop through Calendar's date collection of visible dates
        dates.each(function(dateObj){
            var currentDate = dateObj.get('date'),
        currentDateTime = Ext.Date.clearTime(currentDate, true).getTime(),
        takenDatePositions = []; // stores 'row positions' that are taken on current date
        
            // Filter the Events Store for events that are happening on the currentDate
            store.filterBy(function(record){
                var startDate = Ext.Date.clearTime(record.get(this.startEventField), true).getTime(),
                    endDate = Ext.Date.clearTime(record.get(this.endEventField), true).getTime();
                
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
                    while (eventBarRecord.linked().getCount() > 0) {
                        eventBarRecord = eventBarRecord.linked().getAt(eventBarRecord.linked().getCount() - 1);
                    }
                    
                    // if currentDate is at the start of the week then we must create a new EventBarRecord
                    // to represent the new bar on the next row.
                    if (currentDate.getDay() === this.calendar.weekStart) {
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
		        dayEl = this.calendar.getDateCell(record.get('Date')),
		        doesWrap = this.eventBarDoesWrap(record),
		        hasWrapped = this.eventBarHasWrapped(record);

            // create the event bar
            var eventBar = Ext.DomHelper.append(this.eventWrapperEl, {
                tag: 'div',
		        style: {
		          'background-color': eventRecord.get(this.colourField)
		        },
                html: new Ext.XTemplate(this.getEventBarTpl()).apply(eventRecord.data),
                eventID: record.get('EventID'),
                cls: this.eventBarCls + ' ' + record.get('EventID') + (doesWrap ? ' wrap-end' : '') + (hasWrapped ? ' wrap-start' : '')
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


	        var headerHeight = this.calendar.element.select('thead').first().getHeight();
	        var bodyHeight = this.calendar.element.select('tbody').first().getHeight();
	        var rowCount = this.calendar.element.select('tbody tr').getCount();
	        var rowHeight = bodyHeight/rowCount;

	        var dateIndex = this.calendar.getStore().findBy(function(dateRec){
		        return dateRec.get('date').getTime() === Ext.Date.clearTime(record.get('Date'), true).getTime();
	        }, this);

	        var rowIndex = Math.floor(dateIndex / 7) + 1;

	        var eventY = headerHeight + (rowHeight * rowIndex);

            var barPosition = record.get('BarPosition'),
		        barLength = record.get('BarLength'),
		        dayCellX = (this.calendar.element.getWidth() / 7) * dayEl.dom.cellIndex,
		        dayCellWidth = dayEl.getWidth(),
				eventBarHeight = eventBar.getHeight(),
				spacing = this.eventBarSpacing;

            // set sizes and positions
            eventBar.setLeft(dayCellX + (hasWrapped ? 0 : spacing));
            eventBar.setTop(eventY - eventBarHeight - (barPosition * eventBarHeight + (barPosition * spacing) + spacing));
            eventBar.setWidth((dayCellWidth * barLength) - (spacing * (doesWrap ? (doesWrap && hasWrapped ? 0 : 1) : 2)));
            
            if (record.linked().getCount() > 0) {
                this.renderEventBars(record.linked());
            }
        }, this);
    },
  
  /**
   * Handler function for the Event Bars' 'dragstart' event
   * @method
   * @private
   * @param {Ext.util.Draggable} draggable
   * @param {Event} e
   */
  onEventDragStart: function(draggable, e){
        var eventID = draggable.el.getAttribute('eventID'),
      eventRecord = this.getEventRecord(eventID),
      eventBarRecord = this.getEventBarRecord(eventID);
        
    //TODO Reposition dragged Event Bar so it is in the middle of the User's finger.
    
    // Resize dragged Event Bar so it is 1 cell wide
        draggable.el.setWidth(draggable.el.getWidth() / eventBarRecord.get('BarLength'));
    
    // Update the draggables boundary so the resized bar can be dragged right to the edge.
    draggable.updateBoundary(true);

    // hide all linked Event Bars
        this.calendar.element.select('div.' + eventRecord.internalId).each(function(eventBar){
            if (eventBar.dom !== draggable.el.dom) {
                eventBar.hide();
            }
        }, this);
    
    this.calendar.fireEvent('eventdragstart', draggable, eventRecord, e);
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
        return Ext.Date.clearTime(barEndDate, true).getTime() !== Ext.Date.clearTime(r.get('Record').get(this.endEventField), true).getTime();
    },
    /**
     * Returns true if the specified EventBar record has been wrapped from the row before.
     * @method
     * @private
     * @param {Ext.ux.CalendarEventBarModel} r The EventBar model instance to figure out if it has wrapped from the previous row of dates
     */
    eventBarHasWrapped: function(r){
        return Ext.Date.clearTime(r.get('Date'), true).getTime() !== Ext.Date.clearTime(r.get('Record').get(this.startEventField), true).getTime();
    },
    
    /**
     * Creates the Event Bars' wrapper element and attaches a handler to it's click event
     * to handle taps on the Event Bars
     * @method
     * @private
     */
    createEventWrapper: function(){
        if (this.calendar.rendered && !this.eventWrapperEl) {
            this.eventWrapperEl = Ext.DomHelper.append(this.getEventsWrapperContainer(), {
                tag: 'div',
                cls: this.eventWrapperCls
            }, true);
            
            this.eventWrapperEl.on('tap', this.onEventWrapperTap, this, {
                delegate: 'div.' + this.eventBarCls
            });
            this.renderEventBars(this.eventBarStore);
        }else{
          this.calendar.on('painted', this.createEventWrapper, this);
        }
    },
    
    /**
     * Handler function for the tap event on the eventWrapperEl
     * @method
     * @private
     * @param {Event} e
     * @param {Object} node
     */
    onEventWrapperTap: function(e, node){
        e.stopPropagation(); // stop event bubbling up
        
        var eventID = node.attributes['eventID'];
        if (eventID) {
            var eventRecord = this.getEventRecord(node.attributes['eventID'].value);
            
            this.deselectEvents();

            this.eventWrapperEl.select('div.' + eventRecord.internalId).addCls(this.eventBarSelectedCls);
            
            this.calendar.fireEvent('eventtap', eventRecord, e);
        }
    },
  
	getEventsWrapperContainer: function(){
		return this.calendar.element.select('thead th').first() || this.calendar.element.select('tr td').first();
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
    
    /**
     * Get the Event record with the specified eventID (eventID equates to a record's internalId)
     * @method
     * @private
     * @param {Object} eventID
     */
    getEventRecord: function(eventID){
        var eventRecordIndex = this.calendar.eventStore.findBy(function(rec){
            return rec.internalId === eventID;
        }, this);
        return this.calendar.eventStore.getAt(eventRecordIndex);
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
     * Remove the selected CSS class from all selected Event Bars
     * @method
     * @return {void}
     */
    deselectEvents: function(){
        this.calendar.element.select('.' + this.eventBarSelectedCls).removeCls(this.eventBarSelectedCls);
    },
    
    /**
     * Returns the number of days between the two dates passed in (ignoring time)
     * @method
     * @private
     * @param {Date} date1
     * @param {Date} date2
     */
    getDaysDifference: function(date1, date2){
        date1 = date1.clearTime(true).getTime();
        date2 = date2.clearTime(true).getTime();
        
        return (date2 - date1) / 1000 / 60 / 60 / 24;
    },
    
    /**
     * Removes all the event markers and their markup
     * @method
     * @private
     */
    removeEvents: function(){
        if (this.eventWrapperEl) {
            this.eventWrapperEl.dom.innerHTML = '';
            this.eventWrapperEl.destroy();
            this.eventWrapperEl = null;
        }
        
        if (this.eventBarStore) {
            this.eventBarStore.remove(this.eventBarStore.getRange());
            this.eventBarStore = null;
        }
    
    if(this.droppable){
      this.droppable = null;
    }
    },
  
  getRandomColour: function(){
    return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
  }
});


/**
 * Ext.data.Model to store information about the EventBars to be generated from the 
 * bound data store
 * @private
 */
Ext.define("Ext.ux.CalendarEventBarModel", {
  extend: "Ext.data.Model",
	config: {
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
	  }, {
	    name: 'Colour',
	    type: 'string'
	  }, 'Record'],
	  hasMany: [{
	      model: 'Ext.ux.CalendarEventBarModel',
	      name: 'linked'
	  }]
	}
});

///**
// * @class Ext.util.Region
// */
//Ext.override(Ext.util.Region, {
//  
//});

Ext.define('Ext.util.Region.partial', {
  extend: 'Ext.util.Region',
  /**
   * Figures out if the Event Bar passed in is within the boundaries of the current Date Cell (this)
   * @method
   * @param {Object} region
   */
    partial: function(region){
        var me = this, // cell
      dragWidth = region.right - region.left,
      dragHeight = region.bottom - region.top,
      dropWidth = me.right - me.left,
      dropHeight = me.bottom - me.top,
       
      verticalValid = region.top > me.top && region.top < me.bottom;
              
          horizontalValid = region.left > me.left && region.left < me.right;
        
        return horizontalValid && verticalValid;
    }
});