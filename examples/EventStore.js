Ext.define("Event", {
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

// always
var day = (new Date()).getDate(),
	month = (new Date()).getMonth(),
	year = (new Date()).getFullYear();

var eventStore = Ext.create('Ext.data.Store', {
    model: 'Event',
    data: [{
        event: '8.03 - 8:05',
        weight: 5,
	    wasteWeight: 0.5,
        title: 'test',
        start: new Date(year, month, day, 8, 3),
        end: new Date(year, month, day, 8, 5),
	    css: 'tester'
    }, {
        event: '7:00 - 7:05',
	    weight: 5,
	    wasteWeight: 0.5,
	    title: 'test',
        start: new Date(year, month, day, 7, 0),
        end: new Date(year, month, day, 7, 5),
	    css: 'tester'
    }, {
        event: '7:00 - 7:10',
	    weight: 5,
	    wasteWeight: 0.5,
	    title: 'test',
        start: new Date(year, month, day, 7, 0),
        end: new Date(year, month, day, 7, 10),
	    css: 'tester'
    }, {
        event: '7:06 - 7:15',
	    weight: 5,
	    wasteWeight: 0.5,
	    title: 'test',
        start: new Date(year, month, day, 7, 6),
        end: new Date(year, month, day, 7, 15),
	    css: 'tester'
    }]
});
