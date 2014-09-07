/**
 * Service for tab initialize. This is used on every modal that has some
 * tabs on it which needs to be initialized.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('TabInit',
            [
                'CurrentUser',
                function(CurrentUser) {
                    return {
                        /**
                         * Tab initialize method. This is called from modal controllers tab
                         * selection function.
                         *
                         * @param   {helpers.tabConfig} tab
                         */
                        init: function(tab) {
                            var currentTime = new Date();

                            // Yeah tab has init method and we need to run it
                            if (tab.hasInit
                                && (
                                    !tab.lastUpdate
                                    || !CurrentUser.user().tabRefreshTime
                                    || currentTime.getTime() > tab.lastUpdate.getTime()
                                )
                            ) {
                                // Add user specified interval to current time in seconds
                                currentTime.setSeconds(currentTime.getSeconds() + CurrentUser.user().tabRefreshTime);

                                // Update tab last update time
                                tab.lastUpdate = currentTime;

                                // Determine current tab controller and call 'init' function from it
                                angular.element(document.querySelector(tab.hasInit)).scope().init();
                            }
                        }
                    };
                }
            ]
        );
}());
