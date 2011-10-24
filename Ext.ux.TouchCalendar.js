Ext.ux.TouchCalendar = Ext.extend(Ext.Carousel, {
	weekStart: 1,
    initComponent: function(){
    
		this.view = new Ext.ux.TouchCalendarView(Ext.applyIf(this.viewConfig || {}, {
			minDate: this.minDate,
            maxDate: this.maxDate,
			mode: this.mode,
            weekStart: this.week,
            value: this.value

        }));
	
        Ext.apply(this, {
            activeItem: 0,
            direction: 'horizontal',
            items: [this.view]        
        });
        
        Ext.ux.TouchCalendar.superclass.initComponent.call(this);
    },
	
	setMode: function(mode){
		this.items.each(function(view){
			view.setMode(mode);
		}, this);
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
	}
    
    
});
