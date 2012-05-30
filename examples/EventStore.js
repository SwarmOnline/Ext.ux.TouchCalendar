Ext.define("Event", {
	extend: "Ext.data.Model",
	config: {
		fields: [{
			name: 'event',
			type: 'string'
		}, {
			name: 'location',
			type: 'string'
		}, {
			name: 'start',
			type: 'date',
			dateFormat: 'c'
		}, {
			name: 'end',
			type: 'date',
			dateFormat: 'c'
		}]
	}
});


var eventStore = Ext.create('Ext.data.Store', {
    model: 'Event',
    data: [{
        event: 'Breaking Development 2012',
        location: 'Nashville',
        title: 'test',
        start: new Date(2012, 4, 5),
        end: new Date(2012, 4, 7)
    }, {
        event: 'TechCrunch Disrupt SF',
        location: 'San Francisco',
        start: new Date(2012, 4, 5),
        end: new Date(2012, 4, 14)
    }, {
        event: 'ATypl Reykjavik 2012',
        location: 'Reykjavik',
        start: new Date(2012, 5, 14),
        end: new Date(2012, 5, 18)
    }, {
        event: 'Do Wales 2012',
        location: 'Cardigan',
        start: new Date(2012, 5, 14),
        end: new Date(2012, 5, 18)
    }, {
        event: 'Future of Mobile',
        location: 'London',
        start: new Date(2012, 5, 16),
        end: new Date(2012, 5, 16)
    }, {
        event: 'WindyCityRails 2012',
        location: 'Chicago',
        start: new Date(2012, 5, 17),
        end: new Date(2012, 5, 17)
    }, {
        event: 'CapitoUS',
        location: 'Washington DC',
        start: new Date(2012, 5, 18),
        end: new Date(2012, 5, 18)
    }, {
        event: 'Strange Loop 2012',
        location: 'St Louis',
        start: new Date(2012, 5, 18),
        end: new Date(2012, 5, 20)
    }, {
        event: 'Frozen Rails 2012',
        location: 'Helsinki',
        start: new Date(2012, 5, 20),
        end: new Date(2012, 5, 21)
    }, {
        event: 'Web Accessibility',
        location: 'London',
        start: new Date(2012, 5, 21),
        end: new Date(2012, 5, 21)
    }, {
        event: 'onGameStart',
        location: 'Warsaw',
        start: new Date(2012, 5, 22),
        end: new Date(2012, 5, 23)
    }, {
        event: 'Improving Reality',
        location: 'Brighton',
        start: new Date(2012, 5, 23),
        end: new Date(2012, 5, 23)
    }, {
        event: 'Android Homecoming',
        location: 'Mountain View',
        start: new Date(2012, 5, 23),
        end: new Date(2012, 5, 25)
    }, {
        event: 'Mobilize',
        location: 'San Francisco',
        start: new Date(2012, 5, 26),
        end: new Date(2012, 5, 27)
    }, {
        event: 'Accessibility Summit',
        location: 'Online',
        start: new Date(2012, 5, 27),
        end: new Date(2012, 5, 27)
    }, {
        event: 'UX Web Summit',
        location: 'Online',
        start: new Date(2012, 5, 28),
        end: new Date(2012, 5, 28)
    }, {
        event: 'Modernizer with Faruk Ates',
        location: 'San Francisco',
        start: new Date(2012, 5, 29),
        end: new Date(2012, 5, 29)
    }, {
        event: 'Creative JavaScript and HTML5',
        location: 'Brighton',
        start: new Date(2012, 5, 29),
        end: new Date(2012, 5, 30)
    }, {
        event: 'UX Camp Brighton',
        location: 'Brighton',
        start: new Date(2012, 9, 1),
        end: new Date(2012, 9, 1)
    }, {
        event: 'Future of Web Apps',
        location: 'London',
        start: new Date(2012, 9, 3),
        end: new Date(2012, 9, 5)
    }, {
        event: 'droidcon 2012',
        location: 'London',
        start: new Date(2012, 9, 6),
        end: new Date(2012, 9, 7)
    }, {
        event: 'PHP NW 2012',
        location: 'Manchester',
        start: new Date(2012, 9, 7),
        end: new Date(2012, 9, 9)
    }, {
        event: 'O\'Reilly Android Open Conference',
        location: 'San Francisco',
        start: new Date(2012, 9, 9),
        end: new Date(2012, 9, 11)
    }, {
        event: 'Web 2.0 Expo/NY',
        location: 'New York',
        start: new Date(2012, 9, 10),
        end: new Date(2012, 9, 13)
    }, {
        event: 'Sencha Con',
        location: 'Austin, Texas',
        start: new Date(2012, 9, 23),
        end: new Date(2012, 9, 26)
    }, {
        event: 'Future of Web Design',
        location: 'New York',
        start: new Date(2012, 10, 7),
        end: new Date(2012, 10, 9)
    }, {
        event: 'Build',
        location: 'Belfast',
        start: new Date(2012, 10, 7),
        end: new Date(2012, 10, 11)
    }, {
        event: 'Heart &amp; Sole',
        location: 'Portsmouth',
        start: new Date(2012, 10, 18),
        end: new Date(2012, 10, 18)
    }]
});
