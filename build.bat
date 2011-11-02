cd Builder


java -jar JSBuilder2.jar -v -p c:\www\Ext.ux.TouchCalendar\Builder\Ext.ux.TouchCalendar.jsb2 -d c:\www\

java -jar JSBuilder2.jar -v -p c:\www\Ext.ux.TouchCalendar\Builder\Ext.ux.TouchCalendarSimpleEvents.jsb2 -d c:\www\Ext.ux.TouchCalendar

java -jar JSBuilder2.jar -v -p c:\www\Ext.ux.TouchCalendar\Builder\Ext.ux.TouchCalendarEvents.jsb2 -d c:\www\Ext.ux.TouchCalendar

cd..

cd..

jsduck-3.0.pre.exe Ext.ux.TouchCalendar --output Ext.ux.TouchCalendar/docs --ignore-global --title "Ext.ux.TouchCalendar Documentation" --footer "Generated with JSDuck"

PAUSE