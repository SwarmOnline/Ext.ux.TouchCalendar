/**
 * Ext.ux.TouchCalendarEventsBase
 */
Ext.define('Ext.ux.TouchCalendarEventsBase', {

    extend: 'Ext.Base',

	config: {
		calendar: null,
		plugin: null
	},

	constructor: function(config){
		this.initConfig(config);

		this.callParent(arguments);
	},

	/**
	 * Returns true if the specified EventBar record will wrap and so will need square ends
	 * Compares the calculated date that the bar will end on and the actual end date of the event. If they aren't the same
	 * the bar will wrap to the next row
	 * @method
	 * @private
	 * @param {Ext.ux.CalendarEventBarModel} r The EventBar model instance to figure out if it wraps to the next row of dates
	 */
	eventBarDoesWrap: function(r){
		var barEndDate = Ext.Date.add(r.get('Date'), Ext.Date.DAY, (r.get('BarLength') - 1));
		return Ext.Date.clearTime(barEndDate, true).getTime() !== Ext.Date.clearTime(r.get('Record').get(this.getPlugin().getEndEventField()), true).getTime();
	},
	/**
	 * Returns true if the specified EventBar record has been wrapped from the row before.
	 * @method
	 * @private
	 * @param {Ext.ux.CalendarEventBarModel} r The EventBar model instance to figure out if it has wrapped from the previous row of dates
	 */
	eventBarHasWrapped: function(r){
		return Ext.Date.clearTime(r.get('Date'), true).getTime() !== Ext.Date.clearTime(r.get('Record').get(this.getPlugin().getStartEventField()), true).getTime();
	},

	/**
	 * Get the Event record with the specified eventID (eventID equates to a record's internalId)
	 * @method
	 * @private
	 * @param {Object} eventID
	 */
	getEventRecord: function(eventID){
		var eventRecordIndex = this.getCalendar().eventStore.findBy(function(rec){
			return rec.internalId === eventID;
		}, this);
		return this.getCalendar().eventStore.getAt(eventRecordIndex);
	},

	/**
	 * Get the EventBar record with the specified eventID
	 * @method
	 * @private
	 * @param {String} eventID InternalID of a Model instance
	 */
	getEventBarRecord: function(eventID){
		var eventRecordIndex = this.eventBarStore.findBy(function(rec){
			return rec.get('EventID') === eventID;
		}, this);
		return this.eventBarStore.getAt(eventRecordIndex);
	},



	/**
	 * Returns the first index number that isn't in the specified array
	 * @method
	 * @private
	 * @param {Aarray[Numbers]} datePositions An array of numbers representing the current date cell's taken positions
	 */
	getNextFreePosition: function(datePositions){
		var i = 0;

		// loop until the i value isn't present in the array
		while (datePositions.indexOf(i) > -1) {
			i++;
		}
		return i;
	},


	createEventBar: function(record, eventRecord){
		var doesWrap    = this.eventBarDoesWrap(record),
			hasWrapped  = this.eventBarHasWrapped(record),
			cssClasses  = [
				this.getPlugin().getEventBarCls(),
				'e-' + record.get('EventID'),
				(doesWrap ? ' wrap-end' : ''),
				(hasWrapped ? ' wrap-start' : '')
			];


		// create the event bar
		var eventBar = Ext.DomHelper.append(this.getPlugin().getEventWrapperEl(), {
			tag: 'div',
			html: this.getPlugin().getEventBarTpl().apply(eventRecord.data),
			eventID: record.get('EventID'),
			cls: cssClasses.join(' ')
		}, true);

		return eventBar;
	},

	getRandomColour: function(){
		return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	}

});