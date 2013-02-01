/**
 * TouchCalendar.store.Events
 */
Ext.define('TouchCalendar.store.Events', {

    extend: 'Ext.data.Store',

    config: {
	    storeId : 'Events',
        model   : 'TouchCalendar.model.Event',
	    proxy   : {
		    type    : 'ajax',
		    url     : 'data/eventData.json',
		    reader  : {
			    type        : 'json',
			    rootProperty : 'rows'
		    }
	    },
	    autoLoad: true
    },

    constructor: function(config){
        this.callParent(arguments);
    }

});