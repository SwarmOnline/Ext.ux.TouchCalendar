describe("Ext.ux.TouchCalendarDayEvents", function(){

	describe("getRoundedTime", function(){
		var slotSize = 30,
			calendar = {
			getDayTimeSlotSize: function(){ return slotSize; }
		};

		it("returns 11:00am when passed in 11:01am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 1);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 0), 'c'));
		});

		it("returns 11:00am when passed in 11:15am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 15);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 0), 'c'));
		});

		it("returns 11:00am when passed in 11:16am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 16);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 0), 'c'));
		});

		it("returns 11:00am when passed in 11:29am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 29);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 0), 'c'));
		});

		it("returns 11:30am when passed in 11:30am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 30);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 30), 'c'));
		});

		it("returns 11:30am when passed in 11:31am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 31);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 30), 'c'));
		});

		it("returns 11:30am when passed in 11:45am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 45);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 30), 'c'));
		});

		it("returns 11:30am when passed in 11:59am", function(){

			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
			}),
				testDate = new Date(2012, 1, 1, 11, 59);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 30), 'c'));
		});


		it("returns 11:50am when passed in 11:59am", function(){
			slotSize = 25;
			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
				}),
				testDate = new Date(2012, 1, 1, 11, 59);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 50), 'c'));
		});

		it("returns 11:00am when passed in 11:10am", function(){
			slotSize = 25;
			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
				}),
				testDate = new Date(2012, 1, 1, 11, 10);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 00), 'c'));
		});

		it("returns 11:25am when passed in 11:29am", function(){
			slotSize = 25;
			var calendarEvents = new Ext.ux.TouchCalendarDayEvents({
					calendar: calendar
				}),
				testDate = new Date(2012, 1, 1, 11, 29);

			var actualDate = calendarEvents.getRoundedTime(testDate);

			expect(Ext.Date.format(actualDate, 'c')).toEqual(Ext.Date.format(new Date(2012, 1, 1, 11, 25), 'c'));
		});

	});

	describe("getVerticalDayPosition", function(){



		it("", function(){

		});


	})

});
