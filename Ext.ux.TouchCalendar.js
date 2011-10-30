Ext.ux.TouchCalendar = Ext.extend(Ext.Carousel, {
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
    
    onSelectionChange: function(selModel, records){
    	
    	
    	
    	/*if(records.length > 0){
			this.setValue(records[0].get('date'));
		}*/
    },
	
    /**
     * Creates all the TouchCalendarView instances needed for the Calendar
     * @method
     * @private
     * @return {void}
     */
	initViews: function(){
		this.items = [];
		var origCurrentDate = this.viewConfig.currentDate.clone(),
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
		
		
/*		for(; i <= iMax; i++){
			var viewValue = this.getViewDate(this.viewConfig.currentDate, i);			
			
			this.items.push(
				new Ext.ux.TouchCalendarView(this.getViewConfig(viewValue))
			);
			
			this.viewConfig.currentDate = origVal;
		}*/
		
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
			if(index !== 1){
				view.value
			}
			
			view.setMode(mode);
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
				direction: this.direction,
				scope: this
			});
			
			this.el.addCls(this.baseCls + '-' + this.direction);
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
