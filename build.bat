cd Builder

java -jar JSBuilder2.jar -v -p D:\workspace\Ext.ux.TouchCalendar\builder\Ext.ux.TouchCalendarEvents.jsb2 -d D:\workspace\Ext.ux.TouchCalendar

java -jar JSBuilder2.jar -v -p D:\workspace\Ext.ux.TouchCalendar\builder\Ext.ux.TouchCalendarSimpleEvents.jsb2 -d D:\workspace\Ext.ux.TouchCalendar

java -jar JSBuilder2.jar -v -p D:\workspace\Ext.ux.TouchCalendar\builder\Ext.ux.TouchCalendarEvents.jsb2 -d D:\workspace\Ext.ux.TouchCalendar

cd..

cd..

jsduck-3.0.pre.exe Ext.ux.TouchCalendar --output Ext.ux.TouchCalendar/docs --ignore-global --title "Ext.ux.TouchCalendar Documentation" --footer "Generated with JSDuck"

PAUSE