/**
 * TouchCalendar.model.Event
 */
Ext.define('TouchCalendar.model.Event', {

	extend: "Ext.data.Model",

	config: {
		fields: [{
			name: 'event',
			type: 'string'
		}, {
			name: 'weight',
			type: 'float'
		},  {
			name: 'wasteWeight',
			type: 'float'
		}, {
			name: 'start',
			type: 'date',
			dateFormat: 'c'
		}, {
			name: 'end',
			type: 'date',
			dateFormat: 'c'
		}, {
			name: 'css',
			type: 'string'
		}]
	}
});