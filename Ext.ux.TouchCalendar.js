Ext.ux.TouchCalendar = Ext.extend(Ext.Carousel, {
	/**
	 * @cfg {Boolean} enableSwipeNavigate True to allow the calendar's period to be change by swiping across it.
	 */
	enableSwipeNavigate: true,
	
	
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
		
		this.viewConfig = Ext.applyIf(this.viewConfig || {}, this.defaultViewConfig);
		
		Ext.apply(this, this.viewConfig);
		this.mode = this.mode.toUpperCase();
	
		this.initViews();
	
        Ext.apply(this, {
			cls: 'touch-calendar',
            activeItem: (this.enableSwipeNavigate ? 1: 0),
            direction: 'horizontal'      
        });
        
        Ext.ux.TouchCalendar.superclass.initComponent.call(this);
    },
	
	initViews: function(){
		this.items = [];
		var origVal = this.value.clone();
		
		for(var i = -1; i <= 1; i++){
			var viewValue = origVal.add(Date[this.mode.toUpperCase()], i);
			console.log(this.origVal);
			this.items.push(
				new Ext.ux.TouchCalendarView(Ext.apply(this.viewConfig, {
					value: viewValue
				}))
			);
			
			this.viewConfig.value = origVal;
		}
		
		this.view = this.items[(this.enableSwipeNavigate ? 1: 0)];
	},
	
	setMode: function(mode){
		this.mode = mode.toUpperCase();
		
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
    },
	
	onCardSwitch: function(newCard, oldCard, index, animated){
		
		if (this.enableSwipeNavigate) {
			var newIndex = this.items.indexOf(newCard), oldIndex = this.items.indexOf(oldCard), direction = (newIndex > oldIndex) ? 'forward' : 'backward';
			
			this.counter = (this.counter || 0) + 1;
			
			if (direction === 'forward') {
				this.remove(this.items.get(0));
				
				this.add(new Ext.ux.TouchCalendarView(Ext.apply(this.viewConfig, {
					value: newCard.value.add(Date[this.mode], 1)
				})));
			}
			else {
				this.remove(this.items.get(this.items.getCount() - 1));
				
				this.insert(0, new Ext.ux.TouchCalendarView(Ext.apply(this.viewConfig, {
					value: newCard.value.add(Date[this.mode], -1)
				})));
			}
			
			this.doLayout();
			
			this.view = newCard;
		}
		Ext.ux.TouchCalendar.superclass.onCardSwitch.apply(this, arguments);
	}
    
    
});
