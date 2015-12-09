/**
 * @copyright     (c) 2012, by SwarmOnline.com
 * @date          29th May 2012
 * @version       0.1
 * @documentation  
 * @website        http://www.swarmonline.com
 */
/**
 * @class Ext.ux.TouchCalendar
 * @author Stuart Ashworth
 *
 * For use with Sencha Touch 2
 * 
 * This extension wraps the Ext.ux.TouchCalendarView in a Ext.Carousel component and allows the calendar to respond to swipe
 * gestures to switch the displayed period. It works by creating 3 Ext.ux.TouchCalendarViews and dynamically creating/removing
 * views as the user moves back/forward through time. 
 * 
 * ![Ext.ux.TouchCalendar Screenshot](http://www.swarmonline.com/Ext.ux.TouchCalendar/screenshots/Ext.ux.TouchCalendar-month-ss.png)
 * 
 * [Ext.ux.TouchCalendar Demo](http://www.swarmonline.com/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)
 * 
 */
Ext.define('Ext.ux.TouchCalendar',{
	extend: 'Ext.carousel.Carousel',

	xtype: 'calendar',

	config: {

		/**
		 * @cfg {String} viewMode This config should not be used directly, instead the 'viewMode' config should be added to the 'viewConfig' config object. Use the setViewMode method to change the viewMode of the calendar at runtime.
		 * @accessor
		 */
		viewMode: 'month',

		/**
		* @cfg {Boolean} enableSwipeNavigate True to allow the calendar's period to be change by swiping across it.
		*/
		enableSwipeNavigate: true,

		/**
		* @cfg {Boolean/Object} enableSimpleEvents True to enable the Ext.ux.TouchCalendarSimpleEvents plugin. When true the Ext.ux.TouchCalendarSimpleEvents JS and CSS files
		* must be included and an eventStore option, containing an Ext.data.Store instance, be given to the viewConfig. If an object is passed in this is used as the config for the plugin.
		*/
		enableSimpleEvents: false,

		/**
		* @cfg {Boolean/Object} enableEventBars True to enable the Ext.ux.TouchCalendarEvents plugin. When true the Ext.ux.TouchCalendarEvents JS and CSS files
		* must be included and an eventStore option, containing an Ext.data.Store instance, be given to the viewConfig.  If an object is passed in this is used as the config for the plugin.
		*/
		enableEventBars: false,

		/**
		* @cfg {Object} viewConfig A set of configuration options that will be applied to the TouchCalendarView component
		*/
		viewConfig: {

		}
	},

	defaultViewConfig: {
		viewMode: 'MONTH',
		weekStart: 1,
		bubbleEvents: ['selectionchange']
	},

	indicator: false,

	initialize: function(){

		this.viewConfig = Ext.applyIf(this.viewConfig || {}, this.defaultViewConfig);

		this.viewConfig.currentDate = this.viewConfig.currentDate || this.viewConfig.value || new Date();

		this.setViewMode(this.viewConfig.viewMode.toUpperCase());

		this.initViews();

		Ext.apply(this, {
			cls: 'touch-calendar',
			activeItem: (this.getEnableSwipeNavigate() ? 1: 0),
			direction: 'horizontal'
		});

		this.setIndicator(false); // for some reason, indicator: false is not being applied unless explicitly set.
		this.setActiveItem(1); // for some reason, activeItem: 1 is not being applied unless explicitly set.

		this.on('selectionchange', this.onSelectionChange);
		this.on('activeitemchange', this.onActiveItemChange);

		if (this.getEnableSwipeNavigate()) {
			// Bind the required listeners
			this.on(this.element, {
				drag: this.onDrag,
				dragThreshold: 5,
				dragend: this.onDragEnd,
				direction: this.direction,
				scope: this
			});

			this.element.addCls(this.baseCls + '-' + this.direction);
		}
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

		if(this.getEnableSimpleEvents()){
			var config = Ext.isObject(this.getEnableSimpleEvents()) ? this.getEnableSimpleEvents() : {};
			plugins.push(Ext.create('Ext.ux.TouchCalendarSimpleEvents', config));
		} else if (this.getEnableEventBars()){
			var config = Ext.isObject(this.getEnableEventBars()) ? this.getEnableEventBars() : {};
			plugins.push(Ext.create('Ext.ux.TouchCalendarEvents', config));
		}

		Ext.apply(this._viewConfig, {
			plugins: plugins,
			currentDate: viewValue,
			viewMode: this.getViewMode(),
			onTableHeaderTap: Ext.bind(this.onTableHeaderTap, this),
			bubbleEvents: ['periodchange', 'eventtap', 'selectionchange']
		});

		return this._viewConfig;
	},

	getViewDate: function(date, i){
		var scale = (this.getViewMode() === 'WEEK' ? 'DAY' : this.getViewMode().toUpperCase()),
		  number = (this.getViewMode() === 'WEEK' ? (8 * i) : i);

		return Ext.Date.add(date, Ext.Date[scale], number)
	},

	/**
	 * Creates all the TouchCalendarView instances needed for the Calendar
	 * @method
	 * @private
	 * @return {void}
	 */
	initViews: function(){
		var items = [];
		var origCurrentDate = Ext.Date.clone(this.viewConfig.currentDate),
		  i = (this.getEnableSwipeNavigate() ? -1 : 0),
		  iMax = (this.getEnableSwipeNavigate() ? 1 : 0),
		  plugins = [];

		// first out of view
		var viewValue = this.getViewDate(origCurrentDate, -1);
		items.push(
		    Ext.create('Ext.ux.TouchCalendarView', Ext.applyIf({
		        currentDate: viewValue
		      }, this.getViewConfig(viewValue)))
		);

		// active view
		items.push(
			Ext.create('Ext.ux.TouchCalendarView', Ext.ux.TouchCalendarView(this.getViewConfig(origCurrentDate)))
		);

		// second out of view (i.e. third)
		viewValue = this.getViewDate(origCurrentDate, 1);
		items.push(
			Ext.create('Ext.ux.TouchCalendarView', Ext.ux.TouchCalendarView(Ext.applyIf({
		        currentDate: viewValue
		    }, this.getViewConfig(viewValue))))
		);

		this.setItems(items);
		this.view = items[(this.getEnableSwipeNavigate() ? 1: 0)];
	},

	/**
	* Override for the TouchCalendarView's onTableHeaderTap method which is executed when the view's header (specificly the arrows) is tapped.
	* When using the TouchCalendar wrapper we must intercept it and use the carousel's prev/next methods to do the switching.
	*/
	onTableHeaderTap: function(e, el){
		el = Ext.fly(el);

		if (el.hasCls(this.view.getPrevPeriodCls()) || el.hasCls(this.view.getNextPeriodCls())) {
			this[(el.hasCls(this.view.getPrevPeriodCls()) ? 'previous' : 'next')]();
		}
	},

	applyViewMode: function(mode){
		return mode.toUpperCase();
	},

	/**
	* Changes the mode of the calendar to the specified string's value. Possible values are 'month', 'week' and 'day'.
	* @method
	* @returns {void}
	*/
	updateViewMode: function(mode){
		this.viewConfig = this.viewConfig || {};
		this.viewConfig.viewMode = mode;

		if(this.view){
			Ext.each(this.getInnerItems(), function(view, index){
				view.currentDate = this.getViewDate(Ext.Date.clone(this.view.currentDate), index-1);

				view.setViewMode(mode, true);
				view.refresh();
			}, this);
		}
	},

	/**
	* Returns the Date that is selected.
	* @method
	* @returns {Date} The selected date
	*/
	getValue: function(){
		var selectedDates = this.view.getSelected();

		return (selectedDates.length > 0) ? selectedDates : null;
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
	 * Override of the onCardSwitch method which adds a new card to the end/beginning of the carousel depending on the direction configured with the next period's
	 * dates.
	 * @method
	 * @private
	 */
	onActiveItemChange: function(container, newCard, oldCard){
		if (this.getEnableSwipeNavigate()) {
			var items = this.getItems();
			var newIndex = items.indexOf(newCard), oldIndex = items.indexOf(oldCard), direction = (newIndex > oldIndex) ? 'forward' : 'backward';

			this.counter = (this.counter || 0) + 1;

			if (direction === 'forward') {
				this.remove(items.get(0));
				var newCalendar = new Ext.ux.TouchCalendarView(this.getViewConfig(this.getViewDate(newCard.currentDate, 1)));
				this.add(newCalendar);
			}
			else {
				this.remove(items.get(items.getCount() - 1));
				var newCalendar = new Ext.ux.TouchCalendarView(this.getViewConfig(this.getViewDate(newCard.currentDate, -1)));
				this.insert(0, newCalendar);
			}

			this.view = newCard;

			var dateRange = this.view.getPeriodMinMaxDate();
			this.fireEvent('periodchange', this.view, dateRange.min.get('date'), dateRange.max.get('date'), direction);
		}
	}
    
    
});
