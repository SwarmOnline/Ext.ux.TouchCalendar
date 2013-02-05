clear

### Check for errors; abandon the process if error exist
function checkError {
    if [[ $1 != 0 ]] ; then
        exit 99
    fi
}

### Change to the directory the script is in
here="`dirname \"$0\"`"
cd "$here" || exit 1

cd unittests

echo "*** Jasmine Tests... ***"
phantomjs Jasmine-Runner.js
checkError $?

cd ../builder

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendar.jsb2 -d ../

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendarView.jsb2 -d ../

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendarSimpleEvents.jsb2 -d ../

java -jar JSBuilder2.jar -v -p Ext.ux.TouchCalendarEvents.jsb2 -d ../

jsduck ../min --output ../docs --ignore-global --title "Ext.ux.TouchCalendar Documentation" --footer "Generated with JSDuck"


echo "*** Success ***"

### Exit successfully
exit 0