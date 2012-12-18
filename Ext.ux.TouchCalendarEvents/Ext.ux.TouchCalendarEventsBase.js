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
		var doesWrap    = this.getPlugin().eventBarDoesWrap(record),
			hasWrapped  = this.getPlugin().eventBarHasWrapped(record),
			cssClasses  = [
				this.getPlugin().getEventBarCls(),
				'e-' + record.get('EventID'),
				(doesWrap ? ' wrap-end' : ''),
				(hasWrapped ? ' wrap-start' : '')
			];


		// create the event bar
		var eventBar = Ext.DomHelper.append(this.getPlugin().eventWrapperEl, {
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