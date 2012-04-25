/**
 * {@link Ext.TitleBar}'s are most commonly used as a docked item within an {@link Ext.Container}.
 *
 * The main difference between a {@link Ext.TitleBar} and an {@link Ext.Toolbar} is that
 * the {@link #title} configuration is **always** centered horiztonally in a {@link Ext.TitleBar} between
 * any items aligned left or right.
 *
 * You can also give items of a {@link Ext.TitleBar} an `align` configuration of `left` or `right`
 * which will dock them to the `left` or `right` of the bar.
 *
 * ## Examples
 *
 *     @example preview
 *     Ext.Viewport.add({
 *         xtype: 'titlebar',
 *         docked: 'top',
 *         title: 'Navigation',
 *         items: [
 *             {
 *                 iconCls: 'add',
 *                 iconMask: true,
 *                 align: 'left'
 *             },
 *             {
 *                 iconCls: 'home',
 *                 iconMask: true,
 *                 align: 'right'
 *             }
 *         ]
 *     });
 *
 *     Ext.Viewport.setStyleHtmlContent(true);
 *     Ext.Viewport.setHtml('This shows the title being centered and buttons using align <i>left</i> and <i>right</i>.');
 *
 * <br />
 *
 *     @example preview
 *     Ext.Viewport.add({
 *         xtype: 'titlebar',
 *         docked: 'top',
 *         title: 'Navigation',
 *         items: [
 *             {
 *                 align: 'left',
 *                 text: 'This button has a super long title'
 *             },
 *             {
 *                 iconCls: 'home',
 *                 iconMask: true,
 *                 align: 'right'
 *             }
 *         ]
 *     });
 *
 *     Ext.Viewport.setStyleHtmlContent(true);
 *     Ext.Viewport.setHtml('This shows how the title is automatically moved to the right when one of the aligned buttons is very wide.');
 *
 * <br />
 *
 *     @example preview
 *     Ext.Viewport.add({
 *         xtype: 'titlebar',
 *         docked: 'top',
 *         title: 'A very long title',
 *         items: [
 *             {
 *                 align: 'left',
 *                 text: 'This button has a super long title'
 *             },
 *             {
 *                 align: 'right',
 *                 text: 'Another button'
 *             },
 *         ]
 *     });
 *
 *     Ext.Viewport.setStyleHtmlContent(true);
 *     Ext.Viewport.setHtml('This shows how the title and buttons will automatically adjust their size when the width of the items are too wide..');
 *
 * The {@link #defaultType} of Toolbar's is {@link Ext.Button button}.
 */
Ext.define('Ext.TitleBar', {
    extend: 'Ext.Container',
    xtype: 'titlebar',

    requires: [
        'Ext.Button',
        'Ext.Title',
        'Ext.Spacer',
        'Ext.util.SizeMonitor'
    ],

    // private
    isToolbar: true,

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        baseCls: Ext.baseCSSPrefix + 'toolbar',

        /**
         * @cfg
         * @inheritdoc
         */
        cls: Ext.baseCSSPrefix + 'navigation-bar',

        /**
         * @cfg {String} ui
         * Style options for Toolbar. Either 'light' or 'dark'.
         * @accessor
         */
        ui: 'dark',

        /**
         * @cfg {String} title
         * The title of the toolbar.
         * @accessor
         */
        title: null,

        /**
         * @cfg {String} defaultType
         * The default xtype to create.
         * @accessor
         */
        defaultType: 'button',

        /**
         * @cfg
         * @hide
         */
        layout: {
            type: 'hbox'
        },

        /**
         * @cfg {Array/Object} items The child items to add to this TitleBar. The {@link #defaultType} of
         * a TitleBar is {@link Ext.Button}, so you do not need to specify an `xtype` if you are adding
         * buttons.
         *
         * You can also give items a `align` configuration which will align the item to the `left` or `right` of
         * the TitleBar.
         * @accessor
         */
        items: []
    },

    /**
     * The max button width in this toolbar
     * @private
     */
    maxButtonWidth: '40%',

    constructor: function() {
        this.refreshTitlePosition = Ext.Function.createThrottled(this.refreshTitlePosition, 50, this);

        this.callParent(arguments);
    },

    beforeInitialize: function() {
        this.applyItems = this.applyInitialItems;
    },

    initialize: function() {
        delete this.applyItems;

        this.doAdd = this.doBoxAdd;
        this.remove = this.doBoxRemove;
        this.doInsert = this.doBoxInsert;

        this.add(this.initialItems);
        delete this.initialItems;

        this.on({
            painted: 'onPainted',
            erased: 'onErased'
        });
    },

    applyInitialItems: function(items) {
        var SizeMonitor = Ext.util.SizeMonitor,
            defaults = this.getDefaults() || {},
            leftBox, rightBox, spacer;

        this.initialItems = items;

        this.leftBox = leftBox = this.add({
            xtype: 'container',
            style: 'position: relative',
            layout: {
                type: 'hbox',
                align: 'center'
            }
        });

        this.spacer = spacer = this.add({
            xtype: 'component',
            style: 'position: relative',
            flex: 1
        });

        this.rightBox = rightBox = this.add({
            xtype: 'container',
            style: 'position: relative',
            layout: {
                type: 'hbox',
                align: 'center'
            }
        });

        this.titleComponent = this.add({
            xtype: 'title',
            hidden: defaults.hidden,
            centered: true
        });

        this.sizeMonitors = {
            leftBox: new SizeMonitor({
                element: leftBox.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            }),
            spacer: new SizeMonitor({
                element: spacer.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            }),
            rightBox: new SizeMonitor({
                element: rightBox.renderElement,
                callback: this.refreshTitlePosition,
                scope: this
            })
        };
    },

    doBoxAdd: function(item) {
        if (item.config.align == 'right') {
            this.rightBox.add(item);
        }
        else {
            this.leftBox.add(item);
        }

        if (this.painted) {
            this.refreshTitlePosition();
        }
    },

    doBoxRemove: function(item) {
        if (item.config.align == 'right') {
            this.rightBox.remove(item);
        }
        else {
            this.leftBox.remove(item);
        }

        if (this.painted) {
            this.refreshTitlePosition();
        }
    },

    doBoxInsert: function(index, item) {
        if (item.config.align == 'right') {
            this.rightBox.add(item);
        }
        else {
            this.leftBox.add(item);
        }
    },

    onPainted: function() {
        var sizeMonitors = this.sizeMonitors;

        this.painted = true;
        this.refreshTitlePosition();

        sizeMonitors.leftBox.refresh();
        sizeMonitors.spacer.refresh();
        sizeMonitors.rightBox.refresh();
    },

    onErased: function() {
        this.painted = false;
    },

    getMaxButtonWidth: function() {
        var value = this.maxButtonWidth;

        //check if it is a percentage
        if (Ext.isString(this.maxButtonWidth)) {
            value = parseInt(value.replace('%', ''), 10);
            value = Math.round((this.element.getWidth() / 100) * value);
        }

        return value;
    },

    refreshTitlePosition: function() {
        var titleElement = this.titleComponent.renderElement;

        titleElement.setWidth(null);
        titleElement.setLeft(null);

        //set the min/max width of the left button
        var leftBox = this.leftBox,
            leftButton = leftBox.down('button'),
            leftBoxWidth, maxButtonWidth;

        if (leftButton) {
            if (leftButton.getWidth() == null) {
                leftButton.renderElement.setWidth('auto');
            }

            leftBoxWidth = leftBox.renderElement.getWidth();
            maxButtonWidth = this.getMaxButtonWidth();

            if (leftBoxWidth > maxButtonWidth) {
                leftButton.renderElement.setWidth(maxButtonWidth);
            }
        }

        var spacerBox = this.spacer.renderElement.getPageBox(),
            titleBox = titleElement.getPageBox(),
            widthDiff = titleBox.width - spacerBox.width,
            titleLeft = titleBox.left,
            titleRight = titleBox.right,
            halfWidthDiff, leftDiff, rightDiff;

        if (widthDiff > 0) {
            titleElement.setWidth(spacerBox.width);
            halfWidthDiff = widthDiff / 2;
            titleLeft += halfWidthDiff;
            titleRight -= halfWidthDiff;
        }

        leftDiff = spacerBox.left - titleLeft;
        rightDiff = titleRight - spacerBox.right;

        if (leftDiff > 0) {
            titleElement.setLeft(leftDiff);
        }
        else if (rightDiff > 0) {
            titleElement.setLeft(-rightDiff);
        }

        titleElement.repaint();
    },

    // @private
    updateTitle: function(newTitle) {
        this.titleComponent.setTitle(newTitle);

        this.titleBox = null;

        if (this.painted) {
            this.refreshTitlePosition();
        }
    },

    destroy: function() {
        this.callParent();

        var sizeMonitors = this.sizeMonitors;

        sizeMonitors.leftBox.destroy();
        sizeMonitors.spacer.destroy();
        sizeMonitors.rightBox.destroy();
    }
});
