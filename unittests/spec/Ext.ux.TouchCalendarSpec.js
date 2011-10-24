describe("Ext.ux.TouchCalendar", function () {

	describe( "getDateCollection", function () {
	    it("returns 26/09/2011 when current date is 01/10/2011 (MONTH mode)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
	        expect(dateCollection.first().date).toEqual(new Date(2011, 8, 26));
	    });
		
		it("returns 06/11/2011 when current date is 01/10/2011 (MONTH mode)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.last().date).toEqual(new Date(2011, 10, 6));
	    });
		
		it("returns 42 items when current date is 01/10/2011 (MONTH mode)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.getCount()).toEqual(42);
	    });
		
		it("returns 26/09/2011 when current date is 01/10/2011 (MONTH mode, SUNDAY weekStart)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'month', weekStart: 0});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
	        expect(dateCollection.first().date).toEqual(new Date(2011, 8, 25));
	    });
		
		it("returns 06/11/2011 when current date is 01/10/2011 (MONTH mode, SUNDAY weekStart)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'month', weekStart: 0});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.last().date).toEqual(new Date(2011, 10, 5));
	    });
		
		it("returns 42 items when current date is 01/10/2011 (MONTH mode, SUNDAY weekStart)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'month', weekStart: 0});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.getCount()).toEqual(42);
	    });
		
		it("returns 35 items when current date is 01/07/2011 (MONTH mode)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
			var dateCollection = calendar.getDateCollection(1, 6, 2011);
			
			expect(dateCollection.getCount()).toEqual(35);
	    });
		
	    it("returns 26/09/2011 when current date is 01/10/2011 (WEEK mode)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
	        expect(dateCollection.first().date).toEqual(new Date(2011, 8, 26));
	    });
		
		it("returns 02/10/2011 when current date is 01/10/2011 (WEEK mode)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.last().date).toEqual(new Date(2011, 9, 2));
	    });
		
		it("returns 7 items when current date is 01/10/2011 (WEEK mode)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.getCount()).toEqual(7);
	    });
		
		it("returns 26/09/2011 when current date is 01/10/2011 (WEEK mode, SUNDAY weekStart)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'week', weekStart: 0});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
	        expect(dateCollection.first().date).toEqual(new Date(2011, 8, 25));
	    });
		
		it("returns 02/10/2011 when current date is 01/10/2011 (WEEK mode, SUNDAY weekStart)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'week', weekStart: 0});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.last().date).toEqual(new Date(2011, 9, 1));
	    });
		
		it("returns 7 items when current date is 01/10/2011 (WEEK mode, SUNDAY weekStart)", function () {
			
			var calendar = new Ext.ux.Calendar({mode: 'week', weekStart: 0});
			
			var dateCollection = calendar.getDateCollection(1, 9, 2011);
			
			expect(dateCollection.getCount()).toEqual(7);
	    });
	});
	
	describe( "getWeekStartDate", function () {
        it("returns 26/09/2011 when 01/10/2011 is passed in (MONTH mode, MONDAY weekStart)", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
            expect(calendar.getWeekStartDate(1, 9, 2011)).toEqual(new Date(2011, 8, 26));
        });
		
		it(" returns 26/09/2011 when 01/10/2011 is passed in (WEEK mode, MONDAY weekStart)", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
            expect(calendar.getWeekStartDate(1, 9, 2011)).toEqual(new Date(2011, 8, 26));
        });
		
		it("returns 26/09/2011 when 01/10/2011 is passed in (MONTH mode, SUNDAY weekStart)", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month', weekStart: 0});
			
            expect(calendar.getWeekStartDate(1, 9, 2011)).toEqual(new Date(2011, 8, 25));
        });
		
		it("returns 26/09/2011 when 01/10/2011 is passed in (WEEK mode, SUNDAY weekStart)", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week', weekStart: 0});
			
            expect(calendar.getWeekStartDate(1, 9, 2011)).toEqual(new Date(2011, 8, 25));
        });
    });
	
	describe( "getMonthDeltaDate", function () {
        it("returns 01/11/2011 when 01/10/2011 and 1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
            expect(calendar.getMonthDeltaDate(new Date(2011, 9, 1), 1)).toEqual(new Date(2011, 10, 1));
        });
		
		it("returns 01/09/2011 when 01/10/2011 and -1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
            expect(calendar.getMonthDeltaDate(new Date(2011, 9, 1), -1)).toEqual(new Date(2011, 8, 1));
        });
		
		it("returns 01/01/2012 when 01/12/2011 and 1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
            expect(calendar.getMonthDeltaDate(new Date(2011, 11, 1), 1)).toEqual(new Date(2012, 0, 1));
        });
		
		it("returns 01/12/2011 when 01/01/2012 and -1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
            expect(calendar.getMonthDeltaDate(new Date(2012, 0, 1), -1)).toEqual(new Date(2011, 11, 1));
        });
    });
	
	describe( "getWeekDeltaDate", function () {
        it("returns 03/10/2011 when 30/09/2011 and 1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
            expect(calendar.getWeekDeltaDate(new Date(2011, 8, 30), 1)).toEqual(new Date(2011, 9, 7));
        });
		
		it("returns 03/10/2011 when 30/09/2011 and -1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
            expect(calendar.getWeekDeltaDate(new Date(2011, 8, 30), -1)).toEqual(new Date(2011, 8, 23));
        });
		
		it("returns 06/01/2012 when 30/12/2011 and 1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
            expect(calendar.getWeekDeltaDate(new Date(2011, 11, 30), 1)).toEqual(new Date(2012, 0, 6));
        });
		
		it("returns 27/12/2011 when 03/01/2012 and -1 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'month'});
			
            expect(calendar.getWeekDeltaDate(new Date(2012, 0, 3), -1)).toEqual(new Date(2011, 11, 27));
        });
    });
	
	describe( "isSameDay", function () {
        it("returns true", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
            expect(calendar.isSameDay(new Date(2011, 8, 30), new Date(2011, 8, 30))).toEqual(true);
        });
		
		it("returns false", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
            expect(calendar.isSameDay(new Date(2011, 8, 30), new Date(2011, 8, 29))).toEqual(false);
        });
    });
	
	
	describe( "isWeekend", function () {
        it("returns true when Saturday", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
			expect(calendar.isWeekend(new Date(2011, 9, 1))).toEqual(true);
        });
		
        it("returns true when Sunday", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
            expect(calendar.isWeekend(new Date(2011, 9, 2))).toEqual(true);
        });
		
		it("returns false when Monday", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
            expect(calendar.isWeekend(new Date(2011, 9, 3))).toEqual(false);
        });
    });
	
	
	describe( "getDateAttribute", function () {
        it("returns \"2011-10-01\" when 01/10/2011 is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
			expect(calendar.getDateAttribute(new Date(2011, 9, 1))).toEqual('2011-10-01');
        });
    });
	
	
	describe( "stringToDate", function () {
        it("returns 01/10/2011 when \"2011-10-01\" is passed in", function () {
			var calendar = new Ext.ux.Calendar({mode: 'week'});
			
			expect(calendar.stringToDate('2011-10-01')).toEqual(new Date(2011, 9, 1));
        });
    });
});
