/**
 * This component is used in {@link Ext.navigation.View} to control animations in the toolbar. You should never need to
 * interact with the component directly, unless you are subclassing it.
 * @private
 * @author Robert Dougan <rob@sencha.com>
 */
Ext.define('Ext.navigation.Bar', {
    extend: 'Ext.Container',

    requires: [
        'Ext.Button',
        'Ext.TitleBar',
        'Ext.Spacer'
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
         * The title of the toolbar. You should NEVER set this, it is used internally. You set the title of the
         * navigation bar by giving a navigation views children a title configuration.
         * @private
         * @accessor
         */
        title: null,

        /**
         * @cfg
         * @hide
         * @accessor
         */
        defaultType: 'button',

        /**
         * @cfg
         * @hide
         * @accessor
         */
        layout: {
            type: 'hbox'
        },

        /**
         * @cfg {Array/Object} items The child items to add to this NavigationBar. The {@link #cfg-defaultType} of
         * a NavigationBar is {@link Ext.Button}, so you do not need to specify an `xtype` if you are adding
         * buttons.
         *
         * You can also give items a `align` configuration which will align the item to the `left` or `right` of
         * the NavigationBar.
         * @hide
         * @accessor
         */

        /**
         * @cfg {String} defaultBackButtonText
         * The text to be displayed on the back button if:
         * a) The previous view does not have a title
         * b) The {@link #useTitleForBackButtonText} configuration is true.
         * @private
         * @accessor
         */
        defaultBackButtonText: 'Back',

        /**
         * @cfg {Object} animation
         * @private
         * @accessor
         */
        animation: {
            duration: 300
        },

        /**
         * @cfg {Boolean} useTitleForBackButtonText
         * Set to false if you always want to display the {@link #defaultBackButtonText} as the text
         * on the back button. True if you want to use the previous views title.
         * @private
         * @accessor
         */
        useTitleForBackButtonText: null,

        /**
         * @cfg {Ext.navigation.View} view A reference to the navigation view this bar is linked to.
         * @private
         * @accessor
         */
        view: null,

        /**
         * @cfg {Ext.Button/Object} backButton The configuration for the back button
         * @private
         * @accessor
         */
        backButton: {
            align: 'left',
            ui: 'back',
            hidden: true
        }
    },

    /**
     * @event back
     * Fires when the back button was tapped.
     * @param {Ext.navigation.Bar} this This bar
     */

    /**
     * The minmum back button width allowed.
     * @private
     */
    minBackButtonWidth: 80,

    constructor: function(config) {
        config = config || {};

        if (!config.items) {
            config.items = [];
        }

        this.backButtonStack = [];

        this.callParent([config]);
    },

    initialize: function() {
        this.on({
            painted: 'refreshProxy',
            resize: 'refreshProxy'
        });
    },

    /**
     * @private
     */
    updateView: function(newView) {
        var me = this,
            backButton = me.getBackButton(),
            innerItems, i, backButtonText;

        me.getItems();

        if (newView) {
            //update the back button stack with the current inner items of the view
            innerItems = newView.getInnerItems();
            for (i = 0; i < innerItems.length; i++) {
                me.backButtonStack.push(innerItems[i].config.title || '&nbsp;');
            }

            me.titleComponent.setTitle(me.getTitleText());

            backButtonText = me.getBackButtonText();
            if (backButtonText) {
                backButton.setText(backButtonText);
                backButton.show();
            }
        }
    },

    /**
     * @private
     */
    onViewAdd: function(view, item) {
        var me = this,
            animation = view.getLayout().getAnimation(),
            backButtonStack = me.backButtonStack,
            animations = [],
            hasPrevious, titleText, backButtonText;

        me.endAnimation();

        backButtonStack.push(item.config.title || '&nbsp;');
        titleText = me.getTitleText();
        backButtonText = me.getBackButtonText();
        hasPrevious = backButtonStack.length > 1;

        me.refreshNavigationBarProxy();

        if (animation && animation.isAnimation && view.isPainted()) {
            if (hasPrevious) {
                animations = animations.concat(me.pushBackButtonAnimated(backButtonText));
            }
            animations = animations.concat(me.pushTitleAnimated(titleText));
            me.activeAnimations = animations;
        }
        else {
            if (hasPrevious) {
                me.pushBackButton(backButtonText);
            }
            me.pushTitle(titleText);
        }
    },

    /**
     * @private
     */
    onViewRemove: function(view) {
        var me = this,
            animation = view.getLayout().getAnimation(),
            animations = [],
            titleText, backButtonText;

        me.endAnimation();

        me.backButtonStack.pop();
        titleText = me.getTitleText();
        backButtonText = me.getBackButtonText();

        me.refreshNavigationBarProxy();

        if (animation && animation.isAnimation && view.isPainted()) {
            animations = animations.concat(me.popBackButtonAnimated(backButtonText));
            animations = animations.concat(me.popTitleAnimated(titleText));
            me.activeAnimations = animations;
        }
        else {
            me.popBackButton(backButtonText);
            me.popTitle(titleText);
        }
    },

    endAnimation: function() {
        var activeAnimations = this.activeAnimations,
            animation, i, ln;

        if (activeAnimations) {
            ln = activeAnimations.length;
            for (i = 0; i < ln; i++) {
                animation = activeAnimations[i];
                if (animation.isAnimating) {
                    animation.stopAnimation();
                }
                else {
                    animation.destroy();
                }
            }
            delete this.activeAnimations;
        }
    },

    /**
     * @private
     */
    applyBackButton: function(config) {
        return Ext.factory(config, Ext.Button, this.getBackButton());
    },

    /**
     * @private
     */
    updateBackButton: function(newBackButton, oldBackButton) {
        if (oldBackButton) {
            this.remove(oldBackButton);
        }

        if (newBackButton) {
            this.add(newBackButton);

            newBackButton.on({
                scope: this,
                tap: this.onBackButtonTap
            });
        }
    },

    onBackButtonTap: function() {
        this.fireEvent('back', this);
    },

    updateUseTitleForBackButtonText: function() {
        var backButton = this.getBackButton();

        if (backButton) {
            backButton.setText(this.getBackButtonText());
        }

        this.refreshProxy();
    },

    applyItems: function(items) {
        var me = this;

        if (!me.initialized) {
            var defaults = me.getDefaults() || {};

            me.leftBox = me.add({
                xtype: 'container',
                style: 'position: relative',
                layout: {
                    type: 'hbox',
                    align: 'center'
                }
            });
            me.spacer = me.add({
                xtype: 'component',
                style: 'position: relative',
                flex: 1
            });
            me.rightBox = me.add({
                xtype: 'container',
                style: 'position: relative',
                layout: {
                    type: 'hbox',
                    align: 'center'
                }
            });
            me.titleComponent = me.add({
                xtype: 'title',
                hidden: defaults.hidden,
                centered: true
            });

            me.doAdd = me.doBoxAdd;
            me.doInsert = me.doBoxInsert;
        }

        me.callParent(arguments);
    },

    doBoxAdd: function(item) {
        if (item.config.align == 'right') {
            this.rightBox.add(item);
        }
        else {
            this.leftBox.add(item);
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

    /**
     * Called when any size of this component changes.
     * It refreshes the navigation bar proxy so that the title and back button is in the correct location.
     * @private
     */
    refreshProxy: function() {
        if (!this.rendered) {
            return;
        }

        var backButton = this.getBackButton(),
            titleComponent = this.titleComponent;

        if (backButton && backButton.rendered) {
            backButton.setWidth(null);
        }

        this.refreshNavigationBarProxy();

        var properties = this.getNavigationBarProxyProperties();

        if (backButton && backButton.rendered) {
            backButton.setWidth(properties.backButton.width);
        }

        titleComponent.setStyle('-webkit-transform', null);
        titleComponent.setWidth(properties.title.width);
        titleComponent.element.setLeft(properties.title.left);
    },

    /**
     * Calculates and returns the position values needed for the back button when you are pushing a title.
     * @private
     */
    getBackButtonAnimationProperties: function(reverse) {
        var me = this,
            element = me.element,
            backButtonElement = me.getBackButton().element,
            titleElement = me.titleComponent.element,
            minButtonOffset = Math.min(element.getWidth() / 3, 200),
            proxyProperties = this.getNavigationBarProxyProperties(),
            proxyBackButtonWidth = proxyProperties.backButton.width,
            elementX = element.getX(),
            titleX = titleElement.getX(),
            backButtonX = backButtonElement.getX(),
            backButtonWidth = backButtonElement.getWidth(),
            buttonOffset, buttonGhostOffset;

        if (reverse) {
            buttonOffset = elementX - backButtonX - backButtonWidth;
            buttonGhostOffset = Math.min(titleX - backButtonWidth, minButtonOffset);
        }
        else {
            buttonGhostOffset = elementX - backButtonX - backButtonWidth;
            buttonOffset = Math.min(titleX - elementX, minButtonOffset);
        }

        return {
            element: {
                from: {
                    left: buttonOffset,
                    width: proxyBackButtonWidth,
                    opacity: 0
                },
                to: {
                    left: 0,
                    width: proxyBackButtonWidth,
                    opacity: 1
                }
            },

            ghost: {
                from: null,
                to: {
                    left: buttonGhostOffset,
                    opacity: 0
                }
            }
        };
    },

    /**
     * Calculates and returns the position values needed for the title when you are pushing a title.
     * @private
     */
    getTitleAnimationProperties: function(reverse) {
        var me = this,
            element = me.element,
            titleElement = me.titleComponent.element,
            proxyProperties = this.getNavigationBarProxyProperties(),
            ghostLeft = titleElement.getLeft(),
            elementX = element.getX(),
            elementWidth = element.getWidth(),
            titleX = titleElement.getX(),
            titleWidth = titleElement.getWidth(),
            backLeft = proxyProperties.backButton.left,
            backWidth = proxyProperties.backButton.width,
            proxyTitleWidth = proxyProperties.title.width,
            titleOffset, titleGhostOffset;

        if (reverse) {
            titleElement.setLeft(0);

            titleOffset = elementX - titleX + backWidth;
            titleGhostOffset = elementX + elementWidth;

            if ((backLeft + titleWidth) > titleX) {
                titleOffset = elementX - titleX - titleWidth;
            }
        }
        else {
            titleOffset = elementWidth - titleX;
            titleGhostOffset = elementX - titleX + backWidth;

            if ((backLeft + titleWidth) > titleX) {
                titleGhostOffset = elementX - titleX - titleWidth;
            }
        }

        return {
            element: {
                from: {
                    left: titleOffset,
                    width: proxyTitleWidth,
                    opacity: 0
                },
                to: {
                    left: proxyProperties.title.left,
                    width: proxyTitleWidth,
                    opacity: 1
                }
            },
            ghost: {
                from: ghostLeft,
                to: {
                    left: titleGhostOffset,
                    opacity: 0
                }
            }
        };
    },

    /**
     * Helper method used to animate elements.
     * You pass it an element, objects for the from and to positions an option onEnd callback called when the animation is over.
     * Normally this method is passed configurations returned from the methods such as {@link #getTitleAnimationProperties}(true) etc.
     * It is called from the {@link #pushBackButtonAnimated}, {@link #pushTitleAnimated}, {@link #popBackButtonAnimated} and {@link #popTitleAnimated}
     * methods.
     *
     * If the current device is Android, it will use top/left to animate.
     * If it is anything else, it will use transform.
     * @private
     */
    animate: function(component, element, from, to, callback) {
        var me = this,
            config = {
                element: element,
                easing: 'ease-in-out',
                duration: this.getAnimation().duration,
                replacePrevious: true,
                preserveEndState: true
            },
            animation, fn;

        //reset the left of the element
        element.setLeft(0);

        if (Ext.os.is.Android) {
            if (from) {
                config.from = {
                    left: from.left,
                    opacity: from.opacity
                };

                if (from.width) {
                    config.from.width = from.width;
                }
            }

            if (to) {
                config.to = {
                    left: to.left,
                    opacity: to.opacity
                };

                if (to.width) {
                    config.to.width = to.width;
                }
            }
        }
        else {
            if (from) {
                config.from = {
                    transform: {
                        translateX: from.left
                    },
                    opacity: from.opacity
                };

                if (from.width) {
                    config.from.width = from.width;
                }
            }

            if (to) {
                config.to = {
                    transform: {
                        translateX: to.left
                    },
                    opacity: to.opacity
                };

                if (to.width) {
                    config.to.width = to.width;
                }
            }
        }

        fn = function() {
            if (callback) {
                callback.call(me);
            }

            if (component && Ext.isNumber(to.width)) {
                component.setWidth(to.width);
            }
        };

        animation = new Ext.fx.Animation(config);
        animation.on('animationend', fn, this);

        Ext.Animator.run(animation);

        return animation;
    },

    /**
     * Returns the text needed for the current back button at anytime.
     * @private
     */
    getBackButtonText: function() {
        var text = this.backButtonStack[this.backButtonStack.length - 2],
            useTitleForBackButtonText = this.getUseTitleForBackButtonText();

        if (!useTitleForBackButtonText) {
            if (text) {
                text = this.getDefaultBackButtonText();
            }
        }

        return text;
    },

    /**
     * Returns the text needed for the current title at anytime.
     * @private
     */
    getTitleText: function() {
        return this.backButtonStack[this.backButtonStack.length - 1];
    },

    /**
     * Pushes a back button into the bar with no animations
     * @private
     */
    pushBackButton: function(title) {
        var backButton = this.getBackButton(),
            to;
        backButton.setText(title);
        backButton.show();

        to = this.getBackButtonAnimationProperties().element.to;

        if (to.left) {
            backButton.setLeft(to.left);
        }

        if (to.width) {
            backButton.setWidth(to.width);
        }
    },

    /**
     * Pushes a new back button into the bar with animations
     * @private
     */
    pushBackButtonAnimated: function() {
        var me = this,
            backButton = me.getBackButton(),
            previousTitle = backButton.getText(),
            backButtonElement = backButton.element,
            properties = me.getBackButtonAnimationProperties(),
            animations = [],
            buttonGhost;

        //if there is a previoustitle, there should be a buttonGhost. so create it.
        if (previousTitle) {
            buttonGhost = me.createProxy(backButton);
        }

        //update the back button, and make sure it is visible
        backButton.setText(this.getBackButtonText());
        backButton.show();

        //animate the backButton, which always has the new title
        animations.push(me.animate(backButton, backButtonElement, properties.element.from, properties.element.to));

        //if there is a buttonGhost, we must animate it too.
        if (buttonGhost) {
            animations.push(me.animate(null, buttonGhost, properties.ghost.from, properties.ghost.to, function() {
                buttonGhost.destroy();
            }));
        }
        return animations;
    },

    /**
     * Pops the back button with no animations
     * @private
     */
    popBackButton: function(title) {
        var backButton = this.getBackButton();

        backButton.setText(null);

        if (title) {
            backButton.setText(this.getBackButtonText());
        } else {
            backButton.hide();
        }

        var properties = this.getBackButtonAnimationProperties(true),
            to = properties.element.to;

        if (to.left) {
            backButton.setLeft(to.left);
        }

        if (to.width) {
            backButton.setWidth(to.width);
        }
    },

    /**
     * Pops the current back button with animations.
     * It will automatically know whether or not it should show the previous backButton or not. And proceed accordingly
     * @private
     */
    popBackButtonAnimated: function(title) {
        var me = this,
            backButton = me.getBackButton(),
            previousTitle = backButton.getText(),
            backButtonElement = backButton.element,
            properties = me.getBackButtonAnimationProperties(true),
            animations = [],
            buttonGhost;

        //if there is a previoustitle, there should be a buttonGhost. so create it.
        if (previousTitle) {
            buttonGhost = me.createProxy(backButton);
        }

        //update the back button, and make sure it is visible
        if (title && me.backButtonStack.length) {
            backButton.setText(me.getBackButtonText());
            backButton.show();

            animations.push(me.animate(backButton, backButtonElement, properties.element.from, properties.element.to));
        } else {
            backButton.hide();
        }

        //if there is a buttonGhost, we must animate it too.
        if (buttonGhost) {
            animations.push(me.animate(null, buttonGhost, properties.ghost.from, properties.ghost.to, function() {
                buttonGhost.destroy();

                if (!title) {
                    backButton.setText(null);
                }
            }));
        }
        return animations;
    },

    /**
     * Pushes a new title into the bar without any animations
     * @private
     */
    pushTitle: function(newTitle) {
        var title = this.titleComponent,
            titleElement = title.element,
            properties = this.getTitleAnimationProperties(),
            to = properties.element.to;

        title.setTitle(newTitle);

        if (to.left) {
            titleElement.setLeft(to.left);
        }

        if (to.width) {
            title.setWidth(to.width);
        }
    },

    /**
     * Pushs a new title into the navigation bar, animating as it goes.
     * @private
     */
    pushTitleAnimated: function(newTitle) {
        var me = this,
            backButton = me.getBackButton(),
            previousTitle = (backButton) ? backButton.getText() : null,
            title = me.titleComponent,
            titleElement = title.element,
            animations = [],
            properties, titleGhost;

        //if there is a previoustitle, there should be a buttonGhost. so create it.
        if (previousTitle) {
            titleGhost = me.createProxy(title, true);
        }

        title.setTitle(newTitle);

        properties = me.getTitleAnimationProperties();

        //animate the new title
        animations.push(me.animate(title, titleElement, properties.element.from, properties.element.to));

        //if there is a titleGhost, we must animate it too.
        if (titleGhost) {
            animations.push(me.animate(null, titleGhost, properties.ghost.from, properties.ghost.to, function() {
                titleGhost.destroy();
            }));
        }
        return animations;
    },

    /**
     * Pops the title without any animation.
     * Simply gets the correct positions for the title and sets it on the dom.
     * @private
     */
    popTitle: function(newTitle) {
        var title = this.titleComponent,
            titleElement = title.element,
            properties = this.getTitleAnimationProperties(true),
            to = properties.element.to;

        title.setTitle(newTitle);

        if (to.left) {
            titleElement.setLeft(to.left);
        }

        if (to.width) {
            title.setWidth(to.width);
        }
    },

    /**
     * Method which pops the current title and animates it. It will automatically know whether or not to use a titleGhost
     * element, and how to animate it.
     * @private
     */
    popTitleAnimated: function(newTitle) {
        var me = this,
            previousTitle = me.titleComponent.getTitle(),
            title = me.titleComponent,
            titleElement = title.element,
            properties = me.getTitleAnimationProperties(true),
            animations = [],
            titleGhost;

        //if there is a previoustitle, there should be a buttonGhost. so create it.
        if (previousTitle) {
            titleGhost = me.createProxy(title, true);
        }

        title.setTitle(newTitle || '');

        //animate the new title
        animations.push(me.animate(title, titleElement, properties.element.from, properties.element.to));

        //if there is a titleGhost, we must animate it too.
        if (titleGhost) {
            animations.push(me.animate(null, titleGhost, properties.ghost.from, properties.ghost.to, function() {
                titleGhost.destroy();
            }));
        }
        return animations;
    },

    /**
     * This creates a proxy of the whole navigation bar and positions it out of the view.
     * This is used so we know where the back button and title needs to be at any time, either if we are
     * animating, not animating, or resizing.
     * @private
     */
    createNavigationBarProxy: function() {
        var proxy = this.proxy;

        if (proxy) {
            return;
        }

        //create a titlebar for the proxy
        this.proxy = proxy = Ext.create('Ext.TitleBar', {
            items: [{
                xtype: 'button',
                ui: 'back',
                text: ''
            }],
            style: {
                position: 'absolute',
                visibility: 'hidden',
                left: 0,
                top: '-1000px'
            },
            title: this.backButtonStack[0]
        });

        proxy.backButton = proxy.down('button[ui=back]');

        //add the proxy to the body
        this.element.appendChild(proxy.element);
    },

    /**
     * A Simple helper method which returns the current positions and sizes of the title and back button
     * in the navigation bar proxy.
     * @private
     */
    getNavigationBarProxyProperties: function() {
        var proxy = this.proxy,
            titleElement = proxy.titleComponent.element,
            buttonElement = proxy.backButton.element;
        return {
            title: {
                left: titleElement.getLeft(),
                width: titleElement.getWidth()
            },
            backButton: {
                left: buttonElement.getLeft(),
                width: buttonElement.getWidth()
            }
        };
    },

    /**
     * Refreshes the navigation bar proxy with the latest data available in the backButtonStack.
     * @private
     */
    refreshNavigationBarProxy: function() {
        var me = this,
            proxy = me.proxy,
            element = me.element,
            backButtonStack = me.backButtonStack,
            title = backButtonStack[backButtonStack.length - 1],
            oldTitle = me.getBackButtonText(),
            proxyBackButton;

        if (!proxy) {
            me.createNavigationBarProxy();
            proxy = me.proxy;
        }
        proxyBackButton = proxy.backButton;

        proxy.setWidth(element.getWidth());
        proxy.setHeight(element.getHeight());

        proxy.setTitle(title);

        if (oldTitle) {
            proxyBackButton.setText(oldTitle);
            proxyBackButton.show();
        }
        else {
            proxyBackButton.hide();
        }

        proxy.refreshTitlePosition();
    },

    /**
     * Handles removing back button stacks from this bar
     * @private
     */
    beforePop: function(count) {
        count--;
        for (var i = 0; i < count; i++) {
            this.backButtonStack.pop();
        }
    },

    /**
     * We override the hidden method because we don't want to remove it from the view using display:none. Instead we just position it off
     * the screen, much like the navigation bar proxy. This means that all animations, pushing, popping etc. all still work when if you hide/show
     * this bar at any time.
     * @private
     */
    doSetHidden: function(hidden) {
        if (!hidden) {
            this.element.setStyle({
                position: 'relative',
                top: 'auto',
                left: 'auto',
                width: 'auto'
            });
        } else {
            this.element.setStyle({
                position: 'absolute',
                top: '-1000px',
                left: '-1000px',
                width: this.element.getWidth() + 'px'
            });
        }
    },

    /**
     * Creates a proxy element of the passed element, and positions it in the same position, using absolute positioning.
     * The createNavigationBarProxy method uses this to create proxies of the backButton and the title elements.
     * @private
     */
    createProxy: function(component, useParent) {
        var element = (useParent) ? component.element.getParent() : component.element,
            ghost = Ext.get(element.id + '-proxy');

        if (!ghost) {
            ghost = element.dom.cloneNode(true);
            ghost.id = element.id + '-proxy';

            //insert it into the toolbar
            element.getParent().dom.appendChild(ghost);

            //set the x/y
            ghost = Ext.get(ghost);
            ghost.setStyle('position', 'absolute');
            ghost.setY(element.getY());
            ghost.setX(element.getX());
        }

        return ghost;
    },

    destroy: function() {
        Ext.destroy(this.proxy);
        delete this.proxy;
    }
});
