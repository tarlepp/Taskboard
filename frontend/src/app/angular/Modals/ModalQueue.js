/**
 * Service to keep record of modal queue. This is needed because basic workflow on
 * TaskBoard application relies on this. This service is used from 'ModalService'.
 */
(function() {
    'use strict';

    angular.module('Taskboard.services')
        .factory('ModalQueue',
            [
                '_',
                function(_) {
                    // Initialize modal queue array
                    var queue = [];

                    return {
                        /**
                         * Setter method for new modal queue item. Note that this will automatically
                         * close currently opened modal in way that it won't fire opening another
                         * modal.
                         *
                         * @todo Can this be handled some "smarter" way?
                         *
                         * @param   {bootstrap.modalInstance}   modalInstance
                         * @param   {string}                    method
                         * @param   {*[]}                       parameters
                         */
                        set: function(modalInstance, method, parameters) {
                            var currentModal = _.last(queue);

                            // Yeah, we found previous modal so close that
                            if (currentModal) {
                                currentModal.instance.close(false);
                            }

                            // Add new item to current queue
                            queue.push({
                                instance: modalInstance,
                                method: method,
                                parameters: parameters
                            });
                        },
                        /**
                         * Getter method for "previous" modal in queue. Note that we need to run
                         * queue.pop() twice to get the previous one. That is needed because queue
                         * contains current modal at this point.
                         *
                         * @returns {helper.modalQueue}
                         */
                        get: function() {
                            queue.pop();

                            return queue.pop();
                        },
                        /**
                         * Queue reset method. This will just simply reset current queue.
                         */
                        reset: function() {
                            queue = [];
                        }
                    };
                }
            ]
        );
}());
