#!/bin/sh
here="`dirname \"$0\"`"

cd "$here" || exit 1

cd builder

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendar.jsb2 -d ../

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendarView.jsb2 -d ../

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendarSimpleEvents.jsb2 -d ../

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendarEvents.jsb2 -d ../

jsduck ../min --output ../docs --ignore-global --title "Ext.ux.TouchCalendar Documentation" --footer "Generated with JSDuck"


