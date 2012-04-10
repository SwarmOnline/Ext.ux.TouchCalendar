/**
 * @copyright     (c) 2011, by SwarmOnline.com
 * @date          2nd November 2011
 * @version       0.1
 * @documentation  
 * @website        http://www.swarmonline.com
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
  
  initialize: function(){
        
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
      onTableHeaderTap: Ext.bind(this.onTableHeaderTap, this)
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
    var items = [];
    var origCurrentDate = this.viewConfig.currentDate.clone(),
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
    this.mode = mode.toUpperCase();
    this.viewConfig.mode = this.mode;
    
    this.getItems().each(function(view, index){
      
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
      this.mon(this.element, {
        drag: this.onDrag,
        dragThreshold: 5,
        dragend: this.onDragEnd,
        direction: 'forward',
        scope: this
      });
      
      this.element.addCls(this.baseCls + '-' + 'forward');
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
      var newIndex = this.getItems().indexOf(newCard), oldIndex = this.getItems.indexOf(oldCard), direction = (newIndex > oldIndex) ? 'forward' : 'backward';
      
      this.counter = (this.counter || 0) + 1;
      
      if (direction === 'forward') {
        this.remove(this.getItems().get(0));
        
        this.add(new Ext.ux.TouchCalendarView(this.getViewConfig(newCard.currentDate.add(Date[this.mode], 1))));
      }
      else {
        this.remove(this.getItems().get(this.getItems().getCount() - 1));
        
        this.insert(0, new Ext.ux.TouchCalendarView(this.getViewConfig(newCard.currentDate.add(Date[this.mode], -1))));
      }
      
      this.doLayout();
      
      this.view = newCard;
    }
    Ext.ux.TouchCalendar.superclass.onCardSwitch.apply(this, arguments);
  }
    
    
});


Ext.apply(Date.prototype, {
  
  dateFormat: function(format) {
      if (Date.formatFunctions[format] == null) {
          Date.createFormat(format);
      }
      return Date.formatFunctions[format].call(this);
  },

  
  getTimezone: function() {
      
      
      
      
      
      
      
      
      
      
      
      
      return this.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
  },

  
  getGMTOffset: function(colon) {
      return (this.getTimezoneOffset() > 0 ? "-": "+")
      + Ext.util.Format.leftPad(Math.floor(Math.abs(this.getTimezoneOffset()) / 60), 2, "0")
      + (colon ? ":": "")
      + Ext.util.Format.leftPad(Math.abs(this.getTimezoneOffset() % 60), 2, "0");
  },

  
  getDayOfYear: function() {
      var num = 0,
      d = this.clone(),
      m = this.getMonth(),
      i;

      for (i = 0, d.setDate(1), d.setMonth(0); i < m; d.setMonth(++i)) {
          num += d.getDaysInMonth();
      }
      return num + this.getDate() - 1;
  },

  
  getWeekOfYear: function() {
      
      var ms1d = 864e5,
      
      ms7d = 7 * ms1d;
      
      return function() {
          
          var DC3 = Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 3) / ms1d,
          
          AWN = Math.floor(DC3 / 7),
          
          Wyr = new Date(AWN * ms7d).getUTCFullYear();

          return AWN - Math.floor(Date.UTC(Wyr, 0, 7) / ms7d) + 1;
      };
  }(),

  
  isLeapYear: function() {
      var year = this.getFullYear();
      return !! ((year & 3) == 0 && (year % 100 || (year % 400 == 0 && year)));
  },

  
  getFirstDayOfMonth: function() {
      var day = (this.getDay() - (this.getDate() - 1)) % 7;
      return (day < 0) ? (day + 7) : day;
  },

  
  getLastDayOfMonth: function() {
      return this.getLastDateOfMonth().getDay();
  },


  
  getFirstDateOfMonth: function() {
      return new Date(this.getFullYear(), this.getMonth(), 1);
  },

  
  getLastDateOfMonth: function() {
      return new Date(this.getFullYear(), this.getMonth(), this.getDaysInMonth());
  },

  
  getDaysInMonth: function() {
      var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      return function() {
          
          var m = this.getMonth();

          return m == 1 && this.isLeapYear() ? 29: daysInMonth[m];
      };
  }(),

  
  getSuffix: function() {
      switch (this.getDate()) {
      case 1:
      case 21:
      case 31:
          return "st";
      case 2:
      case 22:
          return "nd";
      case 3:
      case 23:
          return "rd";
      default:
          return "th";
      }
  },

  
  clone: function() {
      return new Date(this.getTime());
  },

  
  isDST: function() {
      
      
      return new Date(this.getFullYear(), 0, 1).getTimezoneOffset() != this.getTimezoneOffset();
  },

  
  clearTime: function(clone) {
      if (clone) {
          return this.clone().clearTime();
      }

      
      var d = this.getDate();

      
      this.setHours(0);
      this.setMinutes(0);
      this.setSeconds(0);
      this.setMilliseconds(0);

      if (this.getDate() != d) {
          
          
          
          
          for (var hr = 1, c = this.add(Date.HOUR, hr); c.getDate() != d; hr++, c = this.add(Date.HOUR, hr));

          this.setDate(d);
          this.setHours(c.getHours());
      }

      return this;
  },

  
  add: function(interval, value) {
      var d = this.clone();
      if (!interval || value === 0) return d;

      switch (interval.toLowerCase()) {
      case Date.MILLI:
          d.setMilliseconds(this.getMilliseconds() + value);
          break;
      case Date.SECOND:
          d.setSeconds(this.getSeconds() + value);
          break;
      case Date.MINUTE:
          d.setMinutes(this.getMinutes() + value);
          break;
      case Date.HOUR:
          d.setHours(this.getHours() + value);
          break;
      case Date.DAY:
          d.setDate(this.getDate() + value);
          break;
      case Date.MONTH:
          var day = this.getDate();
          if (day > 28) {
              day = Math.min(day, this.getFirstDateOfMonth().add('mo', value).getLastDateOfMonth().getDate());
          }
          d.setDate(day);
          d.setMonth(this.getMonth() + value);
          break;
      case Date.YEAR:
          d.setFullYear(this.getFullYear() + value);
          break;
      }
      return d;
  },

  
  between: function(start, end) {
      var t = this.getTime();
      return start.getTime() <= t && t <= end.getTime();
  }
});