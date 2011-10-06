cd Builder


java -jar JSBuilder2.jar -v -p D:\workspace\Ext.ux.Calendar\Builder\Ext.ux.Calendar.jsb2 -d D:\workspace\

java -jar JSBuilder2.jar -v -p D:\workspace\Ext.ux.Calendar\Builder\Ext.ux.CalendarSimpleEvents.jsb2 -d D:\workspace\Ext.ux.Calendar

java -jar JSBuilder2.jar -v -p D:\workspace\Ext.ux.Calendar\Builder\Ext.ux.CalendarEvents.jsb2 -d D:\workspace\Ext.ux.Calendar

cd..

cd..

jsduck-3.0.pre.exe Ext.ux.Calendar --output Ext.ux.Calendar/docs --ignore-global --title "Ext.ux.Calendar Documentation" --footer "Generated with JSDuck"

PAUSE