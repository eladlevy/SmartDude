define([
    'jquery',
    'backbone',
    'bootstrap',
    'bootstrapSwitch'
//    'jquery-mobile'
], function (
    $,
    Backbone,
    Bootstrap,
    BootstrapSwitch
//    JqueryMobile

    ) {

    var MainBaseView = Backbone.View.extend({

        events: {
            'click .main-button' : 'mainButtonClicked',
            'click .sendpassword' : 'sendPassword',
            'switch-change #dimension-switch' : 'switchChanged',
            'change .slider' : 'sliderChanged'
        },

        initialize: function(options) {
            if(!localStorage.getItem('dude-auth')) {
                this.showAuthPopUp();
            } else {
                this.$('#dimension-switch').bootstrapSwitch();
                this.$('#dimension-switch').bootstrapSwitch('setSizeClass', 'switch-large');
                this.$('#dimension-switch').bootstrapSwitch('setDisabled', true);
            }

            this.minutes = 60;
            this.setButtonState((options.dudeState == 1));
        },

        showAuthPopUp: function() {
            this.$('#auth-popup').modal('show');
        },

        sendPassword: function() {
            this.$('#auth-popup').modal('hide');
            var password = this.$('.password').val();

            Backbone.ajax({
                url: '/authenticate',
                method: 'PUT',
                data: {
                    password: password
                },
                success: function(response) {
                    if (response.auth) {

                        localStorage.setItem('dude-auth', true);
                    }
                }
            });
        },

        sliderChanged: function() {
            if (this.$('#dimension-switch').bootstrapSwitch('isDisabled')) {
                this.$('#dimension-switch').bootstrapSwitch('setDisabled', false);
            }
            var minutes = this.$('.slider').val();
            this.$('.slider-minutes').html(minutes);
            this.minutes = minutes;
        },

        switchChanged: function(e, data) {
            var value = data.value ? 'HIGH' : 'LOW';
            var thisView = this;

            var success = function(res) {
                thisView.$('#popup').modal('show');
                setTimeout(function(){
                    thisView.$('#popup').modal('hide');
                }, 2000);
            }

            var error = function() {
                thisView.setButtonState(data.value);
            }
            Backbone.ajax({
                url: '/toggle-dude',
                method: 'PUT',
                data: {
                    value: value,
                    minutes: thisView.minutes
                },
                success: success,
                error: success
            });
        },

        getDudeState: function() {
            var thisView = this;
            var success = function(res) {
                thisView.setButtonState((res.result == 1));
            }

            var error = function(res) {
                //thisView.setButtonState((res.result == 1));
            }
            Backbone.ajax({
                url: '/dude-status',
                method: 'GET',
                success: success,
                error: error
            });
        },

        setButtonState: function(state) {
            $('#dimension-switch').bootstrapSwitch('setState', state);
        }
    });

    return MainBaseView;

});