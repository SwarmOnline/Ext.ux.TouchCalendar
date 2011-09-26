Ext.regModel('Event', {
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
});

var eventStore = new Ext.data.Store({
    model: 'Event',
    data: [{
        event: 'Breaking Development 2011',
        location: 'Nashville',
        start: new Date(2011, 8, 12),
        end: new Date(2011, 8, 14)
    }, {
        event: 'TechCrunch Disrupt SF',
        location: 'San Francisco',
        start: new Date(2011, 8, 12),
        end: new Date(2011, 8, 14)
    }, {
        event: 'ATypl Reykjavik 2011',
        location: 'Reykjavik',
        start: new Date(2011, 8, 14),
        end: new Date(2011, 8, 18)
    }, {
        event: 'Do Wales 2011',
        location: 'Cardigan',
        start: new Date(2011, 8, 14),
        end: new Date(2011, 8, 18)
    }, {
        event: 'Future of Mobile',
        location: 'London',
        start: new Date(2011, 8, 16),
        end: new Date(2011, 8, 16)
    }, {
        event: 'WindyCityRails 2011',
        location: 'Chicago',
        start: new Date(2011, 8, 17),
        end: new Date(2011, 8, 17)
    }, {
        event: 'CapitoUS',
        location: 'Washington DC',
        start: new Date(2011, 8, 18),
        end: new Date(2011, 8, 18)
    }, {
        event: 'Strange Loop 2011',
        location: 'St Louis',
        start: new Date(2011, 8, 18),
        end: new Date(2011, 8, 20)
    }, {
        event: 'Frozen Rails 2011',
        location: 'Helsinki',
        start: new Date(2011, 8, 20),
        end: new Date(2011, 8, 21)
    }, {
        event: 'Web Accessibility',
        location: 'London',
        start: new Date(2011, 8, 21),
        end: new Date(2011, 8, 21)
    }, {
        event: 'onGameStart',
        location: 'Warsaw',
        start: new Date(2011, 8, 22),
        end: new Date(2011, 8, 23)
    }, {
        event: 'Improving Reality',
        location: 'Brighton',
        start: new Date(2011, 8, 23),
        end: new Date(2011, 8, 23)
    }, {
        event: 'Android Homecoming',
        location: 'Mountain View',
        start: new Date(2011, 8, 23),
        end: new Date(2011, 8, 25)
    }, {
        event: 'Mobilize',
        location: 'San Francisco',
        start: new Date(2011, 8, 26),
        end: new Date(2011, 8, 27)
    }, {
        event: 'Accessibility Summit',
        location: 'Online',
        start: new Date(2011, 8, 27),
        end: new Date(2011, 8, 27)
    }, {
        event: 'UX Web Summit',
        location: 'Online',
        start: new Date(2011, 8, 28),
        end: new Date(2011, 8, 28)
    }, {
        event: 'Modernizer with Faruk Ates',
        location: 'San Francisco',
        start: new Date(2011, 8, 29),
        end: new Date(2011, 8, 29)
    }, {
        event: 'Creative JavaScript and HTML5',
        location: 'Brighton',
        start: new Date(2011, 8, 29),
        end: new Date(2011, 8, 30)
    }, {
        event: 'UX Camp Brighton',
        location: 'Brighton',
        start: new Date(2011, 9, 1),
        end: new Date(2011, 9, 1)
    }, {
        event: 'Future of Web Apps',
        location: 'London',
        start: new Date(2011, 9, 3),
        end: new Date(2011, 9, 5)
    }, {
        event: 'droidcon 2011',
        location: 'London',
        start: new Date(2011, 9, 6),
        end: new Date(2011, 9, 7)
    }, {
        event: 'PHP NW 2011',
        location: 'Manchester',
        start: new Date(2011, 9, 7),
        end: new Date(2011, 9, 9)
    }, {
        event: 'O\'Reilly Android Open Conference',
        location: 'San Francisco',
        start: new Date(2011, 9, 9),
        end: new Date(2011, 9, 11)
    }, {
        event: 'Web 2.0 Expo/NY',
        location: 'New York',
        start: new Date(2011, 9, 10),
        end: new Date(2011, 9, 13)
    }, {
        event: 'Sencha Con',
        location: 'Austin, Texas',
        start: new Date(2011, 9, 23),
        end: new Date(2011, 9, 26)
    }, {
        event: 'Future of Web Design',
        location: 'New York',
        start: new Date(2011, 10, 7),
        end: new Date(2011, 10, 9)
    }, {
        event: 'Build',
        location: 'Belfast',
        start: new Date(2011, 10, 7),
        end: new Date(2011, 10, 11)
    }, {
        event: 'Heart &amp; Sole',
        location: 'Portsmouth',
        start: new Date(2011, 10, 18),
        end: new Date(2011, 10, 18)
    }]
});
