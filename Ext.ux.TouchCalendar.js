Ext.ux.TouchCalendar = Ext.extend(Ext.Carousel, {
	/**
	 * @cfg {Boolean} enableSwipeNavigate True to allow the calendar's period to be change by swiping across it.
	 */
	enableSwipeNavigate: false,
	
	
	/**
	 * @cfg {Object} viewConfig A set of configuration options that will be applied to the TouchCalendarView component 
	 */
	viewConfig: {
		
	},
	
	defaultViewConfig: {
		mode: 'month',
        weekStart: 1,
        value: new Date()
	},
	
	indicator: false,
	
    initComponent: function(){
		
		this.defaultViewConfig = Ext.applyIf({
			minDate: this.minDate,
            maxDate: this.maxDate,
			mode: this.mode,
            weekStart: this.week,
            value: this.value
		}, this.defaultViewConfig);
    
		this.view = new Ext.ux.TouchCalendarView(Ext.applyIf(this.viewConfig || {}, this.defaultViewConfig));
	
        Ext.apply(this, {
            activeItem: 0,
            direction: 'horizontal',
            items: [this.view]        
        });
        
        Ext.ux.TouchCalendar.superclass.initComponent.call(this);
    },
	
	setMode: function(mode){
		this.view.setMode(mode);
	},
	
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
    }
    
    
});
