//TODO: Remove this Sencha Touch 1.0 code & start using Ext.Date?
Ext.apply(Date, {
  y2kYear: 50,

  /**
* Date interval constant
* @static
* @type String
*/
  MILLI: "ms",

  /**
* Date interval constant
* @static
* @type String
*/
  SECOND: "s",

  /**
* Date interval constant
* @static
* @type String
*/
  MINUTE: "mi",

  /** Date interval constant
* @static
* @type String
*/
  HOUR: "h",

  /**
* Date interval constant
* @static
* @type String
*/
  DAY: "d",

  /**
* Date interval constant
* @static
* @type String
*/
  MONTH: "mo",

  /**
* Date interval constant
* @static
* @type String
*/
  YEAR: "y"

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