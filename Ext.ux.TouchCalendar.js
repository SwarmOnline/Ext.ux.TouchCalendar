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
 * [Ext.ux.TouchCalendar Demo](http://www.swarmonline.com/wp-content/uploads/Ext.ux.TouchCalendar/examples/Ext.ux.TouchCalendar.html)
 * 
 */
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
		viewMode: 'MONTH',
		weekStart: 1,
		bubbleEvents: ['selectionchange']
	},
	indicator: false,

	initialize: function(){

		this.viewConfig = Ext.applyIf(this.viewConfig || {}, this.defaultViewConfig);

		this.viewConfig.currentDate = this.viewConfig.currentDate || this.viewConfig.value || new Date();

		this.viewMode = this.viewConfig.viewMode.toUpperCase();

		this.initViews();

		Ext.apply(this, {
			cls: 'touch-calendar',
			activeItem: (this.enableSwipeNavigate ? 1: 0),
			direction: 'horizontal'
		});

		this.setIndicator(false); // for some reason, indicator: false is not being applied unless explicitly set.
		this.setActiveItem(1); // for some reason, activeItem: 1 is not being applied unless explicitly set.

		this.on('selectionchange', this.onSelectionChange);
		this.on('activeitemchange', this.onActiveItemChange);

		if (this.enableSwipeNavigate) {
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

		if(this.enableSimpleEvents){
			plugins.push(new Ext.ux.TouchCalendarSimpleEvents());
		} else if (this.enableEventBars){
			plugins.push(new Ext.ux.TouchCalendarEvents());
		}

		Ext.apply(this.viewConfig, {
			plugins: plugins,
			currentDate: viewValue,
			onTableHeaderTap: Ext.bind(this.onTableHeaderTap, this)
		});

		return this.viewConfig;
	},

	getViewDate: function(date, i){
		var scale = (this.viewMode === 'WEEK' ? 'DAY' : this.viewMode.toUpperCase()),
		  number = (this.viewMode === 'WEEK' ? (8 * i) : i);

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
		  i = (this.enableSwipeNavigate ? -1 : 0),
		  iMax = (this.enableSwipeNavigate ? 1 : 0),
		  plugins = [];

		// first out of view
		var viewValue = this.getViewDate(origCurrentDate, -1);
		items.push(
		    new Ext.ux.TouchCalendarView(Ext.applyIf({
		        currentDate: viewValue
		      }, this.getViewConfig(viewValue)))
		);

		// active view
		items.push(
		    new Ext.ux.TouchCalendarView(this.getViewConfig(origCurrentDate))
		);

		// second out of view (i.e. third)
		viewValue = this.getViewDate(origCurrentDate, 1);
		items.push(
		    new Ext.ux.TouchCalendarView(Ext.applyIf({
		        currentDate: viewValue
		    }, this.getViewConfig(viewValue)))
		);

		this.setItems(items);
		this.view = items[(this.enableSwipeNavigate ? 1: 0)];
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
		this.viewMode = mode.toUpperCase();
		this.viewConfig.viewMode = this.viewMode;

		this.getItems().each(function(view, index){

			view.currentDate = this.getViewDate(Ext.Date.clone(this.view.currentDate), index-1);

			view.setViewMode(mode, true);
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
	 * Override of the onCardSwitch method which adds a new card to the end/beginning of the carousel depending on the direction configured with the next period's
	 * dates.
	 * @method
	 * @private
	 */
	onActiveItemChange: function(container, newCard, oldCard){
		if (this.enableSwipeNavigate) {
			var items = this.getItems();
			var newIndex = items.indexOf(newCard), oldIndex = items.indexOf(oldCard), direction = (newIndex > oldIndex) ? 'forward' : 'backward';

			this.counter = (this.counter || 0) + 1;

			if (direction === 'forward') {
				this.remove(items.get(0));
				var newCalendar = new Ext.ux.TouchCalendarView(this.getViewConfig(Ext.Date.add(newCard.currentDate, Ext.Date[this.viewMode], 1)));
				this.add(newCalendar);
			}
			else {
				this.remove(items.get(items.getCount() - 1));
				var newCalendar = new Ext.ux.TouchCalendarView(this.getViewConfig(Ext.Date.add(newCard.currentDate, Ext.Date[this.viewMode], -1)));
				this.insert(0, newCalendar);
			}

			this.view = newCard;
		}
	}
    
    
});
