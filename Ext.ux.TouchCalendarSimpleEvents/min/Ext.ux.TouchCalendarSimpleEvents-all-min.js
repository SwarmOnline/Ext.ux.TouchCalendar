/*
Ext.ux.TouchCalendarSimpleEvents
*/
/**
 * @copyright 		(c) 2011, by SwarmOnline.com
 * @date      		2nd November 2011
 * @version   		0.1
 * @documentation	
 * @website	  		http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendar
 * @author Stuart Ashworth
 * 
 * This extension wraps the Ext.ux.TouchCalendarView in a Ext.Carousel component and allows the calendar to respond to swipe
 * gestures to switch the displayed period. It works by creating 3 Ext.ux.TouchCalendarViews and dynamically creating/removing
 * views as the user moves back/forward through time. 
 * 
 * ![Ext.ux.TouchCalendar Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendar-month-ss.png)
 * 
 * [Ext.ux.TouchCalendar Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)
 * 
 */
//Ext.ux.TouchCalendar = Ext.extend(Ext.carousel.Carousel, {
Ext.define('Ext.ux.TouchCalendar',{
  extend: 'Ext.carousel.Carousel',
  xtype: 'calendar',
  
	/**
	 * @cfg {Boolean} enableSwipeNavigate True to allow the calendar's period to be change by swiping across it.
	 */
	enableSwipeNavigate: true,
	
	/**
	 * @cfg {Boolean} enableSimpleEvents True to enable the Ext.ux.TouchCalendarSimpleEvents plugin. When true the Ext.ux.TouchCalendarSimpleEvents JS and CSS files
	 * must be included and an eventStore option, containing an Ext.data.Store instance, be given to the viewConfig.
	 */
	enableSimpleEvents: false,
	
	/**
	 * @cfg {Boolean} enableEventBars True to enable the Ext.ux.TouchCalendarEvents plugin. When true the Ext.ux.TouchCalendarEvents JS and CSS files
	 * must be included and an eventStore option, containing an Ext.data.Store instance, be given to the viewConfig.
	 */
	enableEventBars: false,
	
	/**
	 * @cfg {Object} viewConfig A set of configuration options that will be applied to the TouchCalendarView component 
	 */
	viewConfig: {
		
	},
	
	defaultViewConfig: {
		mode: 'MONTH',
        weekStart: 1,
        bubbleEvents: ['selectionchange']
	},
	
	indicator: false,
	
    initComponent: function(){
				
		this.viewConfig = Ext.applyIf(this.viewConfig || {}, this.defaultViewConfig);
		
		this.viewConfig.currentDate = this.viewConfig.currentDate || this.viewConfig.value || new Date();
		
		this.mode = this.viewConfig.mode.toUpperCase();
	
		this.initViews();
	
        Ext.apply(this, {
			cls: 'touch-calendar',
            activeItem: (this.enableSwipeNavigate ? 1: 0),
            direction: 'horizontal'      
        });
        
        Ext.ux.TouchCalendar.superclass.initComponent.call(this);
        
        this.on('selectionchange', this.onSelectionChange);
    },
    
    /**
     * Builds the necessary configuration object for the creation of the TouchCalendarView.
     * @param {Date} viewValue The date Value that the new TouchCalendarView will have
     * @method
     * @private 
     * @return {Object} The new config object for the view
     */
    getViewConfig: function(viewValue){
		var plugins = [];
		
		if(this.enableSimpleEvents){
			plugins.push(new Ext.ux.TouchCalendarSimpleEvents());				
		} else if (this.enableEventBars){
			plugins.push(new Ext.ux.TouchCalendarEvents());				
		}

    	Ext.apply(this.viewConfig, {
			plugins: plugins,
			currentDate: viewValue,
			onTableHeaderTap: Ext.createDelegate(this.onTableHeaderTap, this)
		});
    	
    	return this.viewConfig;    	
    },
    
    getViewDate: function(date, i){
    	var scale = (this.mode === 'WEEK' ? 'DAY' : this.mode.toUpperCase()),
    		number = (this.mode === 'WEEK' ? (8 * i) : i);
    	
    	return date.add(Date[scale], number)
    },
	
    /**
     * Creates all the TouchCalendarView instances needed for the Calendar
     * @method
     * @private
     * @return {void}
     */
	initViews: function(){
		this.items = [];
		var origCurrentDate = Ext.clone(this.viewConfig.currentDate.clone(),
			i = (this.enableSwipeNavigate ? -1 : 0),
			iMax = (this.enableSwipeNavigate ? 1 : 0),
			plugins = [];
		
		// first out of view
		var viewValue = this.getViewDate(origCurrentDate, -1);
		this.items.push(
				new Ext.ux.TouchCalendarView(Ext.applyIf({
						currentDate: viewValue
					}, this.getViewConfig(viewValue)))
		);
		
		// active view
		this.items.push(
				new Ext.ux.TouchCalendarView(this.getViewConfig(origCurrentDate))
		);
		
		// second out of view (i.e. third)
		viewValue = this.getViewDate(origCurrentDate, 1);
		this.items.push(
				new Ext.ux.TouchCalendarView(Ext.applyIf({
						currentDate: viewValue
					}, this.getViewConfig(viewValue)))
		);

		this.view = this.items[(this.enableSwipeNavigate ? 1: 0)];
	},
	
	/**
	 * Override for the TouchCalendarView's onTableHeaderTap method which is executed when the view's header (specificly the arrows) is tapped.
	 * When using the TouchCalendar wrapper we must intercept it and use the carousel's prev/next methods to do the switching.
	 */
	onTableHeaderTap: function(e, el){
		el = Ext.fly(el);		

		if (el.hasCls(this.view.prevPeriodCls) || el.hasCls(this.view.nextPeriodCls)) {
			this[(el.hasCls(this.view.prevPeriodCls) ? 'prev' : 'next')]();
		}
	},
	
	/**
	 * Changes the mode of the calendar to the specified string's value. Possible values are 'month', 'week' and 'day'.
	 * @method
	 * @returns {void}
	 */
	setMode: function(mode){
		this.mode = mode.toUpperCase();
		this.viewConfig.mode = this.mode;
		
		this.items.each(function(view, index){
			
			view.currentDate = this.getViewDate(this.view.currentDate.clone(), index-1);
			
			view.setMode(mode, true);
			view.refresh();
		}, this);
	},
	
	/**
	 * Returns the Date that is selected.
	 * @method
	 * @returns {Date} The selected date
	 */
	getValue: function(){
		var selectedDates = this.view.getSelectionModel().selected;

		return (selectedDates.getCount() > 0) ? selectedDates.first().get('date') : null;
	},
	
	/**
	 * Set selected date.
	 * @method
	 * @param {Date} v Date to select.
	 * @return {void}
	 */
	setValue: function(v) {
		this.view.setValue(v)
	},
	
	/**
	 * Override of the Ext.Carousel's afterRender method to enable/disable the swipe navigation if the enableSwipeNavigate option is set to true/false.
	 */
	afterRender: function() {
        Ext.Carousel.superclass.afterRender.call(this);

		if (this.enableSwipeNavigate) {
			// Bind the required listeners
			this.mon(this.body, {
				drag: this.onDrag,
				dragThreshold: 5,
				dragend: this.onDragEnd,
				direction: 'forward',
				scope: this
			});
			
			this.el.addCls(this.baseCls + '-' + 'forward');
		}
    },
	
    /**
     * Override of the onCardSwitch method which adds a new card to the end/beginning of the carousel depending on the direction configured with the next period's
     * dates.
     * @method
     * @private
     */
	onCardSwitch: function(newCard, oldCard, index, animated){
		
		if (this.enableSwipeNavigate) {
			var newIndex = this.items.indexOf(newCard), oldIndex = this.items.indexOf(oldCard), direction = (newIndex > oldIndex) ? 'forward' : 'backward';
			
			this.counter = (this.counter || 0) + 1;
			
			if (direction === 'forward') {
				this.remove(this.items.get(0));
				
				this.add(new Ext.ux.TouchCalendarView(this.getViewConfig(newCard.currentDate.add(Date[this.mode], 1))));
			}
			else {
				this.remove(this.items.get(this.items.getCount() - 1));
				
				this.insert(0, new Ext.ux.TouchCalendarView(this.getViewConfig(newCard.currentDate.add(Date[this.mode], -1))));
			}
			
			this.doLayout();
			
			this.view = newCard;
		}
		Ext.ux.TouchCalendar.superclass.onCardSwitch.apply(this, arguments);
	}
    
    
});

/**
 * @copyright 		(c) 2011, by SwarmOnline.com
 * @date      		2nd November 2011
 * @version   		0.1
 * @documentation	
 * @website	  		http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendarSimpleEvents
 * @author Stuart Ashworth
 *
 * This plugin can be added to an Ext.ux.TouchCalendarView instance to allow a store to be bound to the calendar so events can be shown in a similar style to the iPhone
 * does with a dot added to each day to represent the presence of an event.
 * 
 * ![Ext.ux.TouchCalendarSimpleEvents Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendarSimpleEvents-month-ss.png)
 * 
 * # Sample Usage
 * 
 *     Ext.regModel('Event', {
           fields: [{
               name: 'event',
               type: 'string'
           }, {
               name: 'location',
               type: 'string'
           }, {
               name: 'start',
               type: 'date',
               dateFormat: 'c'
           }, {
               name: 'end',
               type: 'date',
               dateFormat: 'c'
           }]
       });
       
       var calendar = new Ext.ux.Calendar({
           fullscreen: true,
           mode: 'month',
           weekStart: 1,
           value: new Date(),
           
           store: new Ext.data.Store({
		        model: 'Event',
		        data: [{
		            event: 'Sencha Con',
		            location: 'Austin, Texas',
		            start: new Date(2011, 9, 23),
		            end: new Date(2011, 9, 26)
		        }]
		    },
                        
           plugins: [new Ext.ux.CalendarSimpleEvents()]
       });
 *    
 * # Demo
 * [Ext.ux.CalendarSimpleEvents Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.CalendarSimpleEvents.html)
 */
Ext.ux.TouchCalendarSimpleEvents = Ext.extend(Ext.util.Observable, {
	
    /**
     * @cfg {String} startEventField Name of the Model field which contains the Event's Start date
     */
    startEventField: 'start',
    
    /**
     * @cfg {Stirng} endEventField Name of the Model field which contains the Event's End date
     */
    endEventField: 'end',
	
	/**
	 * @cfg {Boolean} multiEventDots True to display a dot for each event on a day. False to only show one dot regardless
	 * of how many events there are
	 */
	multiEventDots: true,
	
	/**
	 * @cfg {String} wrapperCls CSS class that is added to the event dots' wrapper element
	 */
	wrapperCls: 'simple-event-wrapper',
	
	/**
	 * @cfg {String} eventDotCls CSS class that is added to the event dot element itself. Used to provide
	 * the dots' styling
	 */
	eventDotCls: 'simple-event',
	
	/**
	 * @cfg {Number} dotWidth Width in pixels of the dots as defined by CSS. This is used for calculating the positions and
	 * number of dots able to be shown.
	 */
	dotWidth: 6,
	
	/**
	 * @cfg {Ext.XTemplate} eventTpl Template used to create the Event markup. Template is merged with the records left
	 * following the filter
	 * 
	 */
	eventTpl: new Ext.XTemplate(
	'<span class="{wrapperCls}">',
		'<tpl for="events">',
			'<span class="{[parent.eventDotCls]}"></span>',
		'</tpl>',
	'</span>'),
	
	/**
	 * Function used to filter the store for each of the displayed dates
	 * @method
	 * @private
	 * @param {Object} record - current record
	 * @param {Object} id - ID of passed in record
	 * @param {Object} currentDate - date we are currently dealing while looping Calendar's dateCollection property
	 */
	filterFn: function(record, id, currentDate){
		var startDate = record.get(this.startEventField).clearTime(true).getTime(),
			endDate = record.get(this.endEventField).clearTime(true).getTime(),
			currentDate = currentDate.clearTime(true).getTime();
	                            
	    return (startDate <= currentDate) && (endDate >= currentDate);
	},
	
	init: function(calendar){
		
		this.calendar = calendar; // cache the parent calendar
		this.calendar.simpleEventsPlugin = this; // cache the plugin instance on the calendar itself
		
		this.wrapperCls = this.wrapperCls + (this.multiEventDots ? '-multi' : '');
		this.eventDotCls = this.eventDotCls + (this.multiEventDots ? '-multi' : '');
		
		this.calendar.showEvents = this.showEvents;
		this.calendar.hideEvents = this.hideEvents;
		this.calendar.removeEvents = this.removeEvents;
		
		// After the calendar's height is synced with it's container we must refresh the events
		this.calendar.syncHeight = Ext.createSequence(this.calendar.syncHeight, this.refreshEvents, this);
	},

	
	/**
	 * Function to execute when the Calendar is refreshed.
	 * It loops through the Calendar's current dateCollection and gets all Events
	 * for the current date and inserts the appropriate markup
	 * @method
	 * @private
	 * @return {void}
	 */
	refreshEvents: function(){
		if (!this.disabled) {
			var datesStore = this.calendar.store;

			if (datesStore && this.calendar.isVisible()) {
				
				this.removeEvents(); // remove the event dots already existing
				
				// loop through Calendar's current dateCollection
				datesStore.each(function(dateObj){
					var date = dateObj.get('date');
					
					var cell = this.calendar.getDateCell(date); // get the table cell for the current date
					var store = this.calendar.eventStore;
					
					if (cell) {
						store.clearFilter();

						// if we only want to show a single dot per day then use findBy for better performance
						var matchIndex = store[this.multiEventDots ? 'filterBy' : 'findBy'](Ext.createDelegate(this.filterFn, this, [date], true));
						var eventCount = store.getRange().length;
						
						if ((!this.multiEventDots && matchIndex > -1) || (this.multiEventDots && eventCount > 0)) {
							// get maximum number of dots that can fitted in the cell
							var maxDots = Math.min((cell.getWidth()/this.dotWidth), eventCount);
							
							// append the event markup
							var t = this.eventTpl.append(cell, {
								events: (this.multiEventDots ? store.getRange().slice(0, maxDots) : ['event']),
								wrapperCls: this.wrapperCls,
								eventDotCls: this.eventDotCls
							}, true);
							
							// position the dot wrapper based on the cell dimensions and dot count
							t.setWidth(Math.min((this.multiEventDots ? store.getRange().length : 1) * this.dotWidth, cell.getWidth()));
							t.setY((cell.getY() + cell.getHeight()) - (t.getHeight() + (cell.getHeight()*0.1)) );
							t.setX((cell.getX() + (cell.getWidth()/2)) - (t.getWidth()/2) );
						}
					}
				}, this);
			}
		}
	},
	
	/**
	 * Hides all the event markers
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	hideEvents: function(){
		this.simpleEventsPlugin.disabled = true;
		
		this.calendar.el.select('span.' + this.wrapperCls).hide();
	},
	
	/**
	 * Shows all the event markers
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	showEvents: function(){
		this.simpleEventsPlugin.disabled = false;
		
		this.calendar.el.select('span.' + this.wrapperCls).show();
	},
	
	/**
	 * Removes all the event markers and their markup
	 * This is added to the parent Calendar's class so must be executed via the parent
	 * @method
	 * @return {void}
	 */
	removeEvents: function(){
		if(this.calendar.el){
			this.calendar.el.select('span.' + this.wrapperCls).remove();
		}
	}	
});


