/**
 * @license Deferred Updates plugin for Knockout http://knockoutjs.com/
 * (c) Michael Best, Steven Sanderson
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 * Version 2.3.1
 */

(function(factory) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // [1] CommonJS/Node.js
        factory(require('knockout'));
    } else if (typeof define === 'function' && define.amd) {
        // [2] AMD anonymous module
        define(['knockout'], factory);
    } else {
        // [3] No module loader (plain <script> tag) - ko is directly in global namespace
        factory(ko);
    }
}
(function(ko, undefined) {

    var g = typeof global === "object" && global ? global : window;

    /*
     * Task manager for deferred tasks
     */
    ko.tasks = (function() {
        // Use setImmediate functions if available; otherwise use setTimeout
        var setImmediate, clearImmediate;
        if (g.setImmediate) {
            setImmediate = 'setImmediate';
            clearImmediate = 'clearImmediate';
        } else {
            setImmediate = 'setTimeout';
            clearImmediate = 'clearTimeout';
        }

        var evaluatorHandler, taskQueueHead = {}, taskQueueEnd = taskQueueHead, contextStack = [], processingItem, contextStart = taskQueueHead;

        // Begin a new task context. Any tasks that are scheduled during this context will be processed when the context ends
        function startTaskContext() {
            // Save the previous context start in the stack
            contextStack.push(contextStart);
            // Set the new context start to the current task length: any newly scheduled tasks are part of the current context
            contextStart = taskQueueEnd;
        }

        // End the current task context and process any scheduled tasks
        function endTaskContext() {
            try {
                // Process any tasks that were scheduled within this context
                if (contextStart._next)
                    processTasks(contextStart);
            } finally {
                // Move back into the previous context
                contextStart = contextStack.pop() || taskQueueHead;
            }
        }

        function processTasks(start) {
            var countProcessed = 0;
            try {
                for (var item = start; item = item._next; ) {
                    processingItem = item;
                    if (!item._done) {
                        item._done = true;
                        item._func.apply(item.object, item.args || []);
                        countProcessed++;
                    }
                }
            } finally {
                if (start !== taskQueueHead) {
                    // Remove the items we've just processed
                    start._next = null;
                    taskQueueEnd = start;
                } else {
                    // Clear the queue, stack and handler
                    contextStack = [];
                    taskQueueHead._next = null;
                    contextStart = taskQueueEnd = taskQueueHead;

                    if (evaluatorHandler)
                        g[clearImmediate](evaluatorHandler);
                    evaluatorHandler = undefined;
                }
                processingItem = undefined;
            }
            return countProcessed++;
        }

        function processAllTasks() {
            // Don't process all tasks if already processing tasks
            if (!processingItem) {
                return processTasks(taskQueueHead);
            }
        }

        function clearDuplicate(evaluator) {
            for (var link = processingItem || contextStart, item; item = link._next; link = item)
                if (item._func === evaluator && !item._done) {
                    // remove the item from the queue
                    link._next = item._next;
                    if (!link._next)
                        taskQueueEnd = link;
                    return true;
                }
            return false;
        }

        var tasks = {
            processImmediate: function(evaluator, object, args) {
                startTaskContext();
                try {
                    return evaluator.apply(object, args || []);
                } finally {
                    endTaskContext();
                }
            },

            processDelayed: function(evaluator, distinct, options) {
                var foundDup = (distinct || distinct === undefined) && clearDuplicate(evaluator);

                var item = options || {};
                item._func = evaluator;

                taskQueueEnd._next = item;
                taskQueueEnd = item;

                if (!contextStack.length && !evaluatorHandler) {
                    evaluatorHandler = g[setImmediate](processAllTasks);
                }
                return !foundDup;
            },

            makeProcessedCallback: function(evaluator) {
                return function() {
                    return tasks.processImmediate(evaluator, this, arguments);
                }
            }
        };

        ko.processDeferredBindingUpdatesForNode =       // deprecated (included for compatibility)
            ko.processAllDeferredBindingUpdates = function() {
                for (var item = taskQueueHead; item = item._next; ) {
                    if (item.node && !item._done) {
                        item._done = true;
                        item._func.call();
                    }
                }
            };

        ko.processAllDeferredUpdates = processAllTasks;

        ko.evaluateAsynchronously = function(evaluator, timeout) {
            return setTimeout(tasks.makeProcessedCallback(evaluator), timeout);
        };

        return tasks;
    })();

    /*
     * Add ko.utils.objectForEach and ko.utils.objectMap if not present
     */
    if (!ko.utils.objectForEach) {
        ko.utils.objectForEach = function(obj, action) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    action(prop, obj[prop]);
                }
            }
        };
    }

    if (!ko.utils.objectMap) {
        ko.utils.objectMap = function(source, mapping) {
            if (!source)
                return source;
            var target = {};
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    target[prop] = mapping(source[prop], prop, source);
                }
            }
            return target;
        };
    }

// Helper functions for sniffing the minified Knockout code
    function findNameMethodSignatureContaining(obj, match) {
        for (var a in obj)
            if (obj.hasOwnProperty(a) && obj[a].toString().indexOf(match) >= 0)
                return a;
    }
    function findPropertyName(obj, equals) {
        for (var a in obj)
            if (obj.hasOwnProperty(a) && obj[a] === equals)
                return a;
    }
    function findSubObjectWithProperty(obj, prop) {
        for (var a in obj)
            if (obj.hasOwnProperty(a) && obj[a] && obj[a][prop])
                return obj[a];
    }


    /*
     * Sniff out the names and objects of Knockout internals
     */

// Find ko.dependencyDetection and its methods
    var depDet = findSubObjectWithProperty(ko, 'end'),
        depDetIgnoreName = findNameMethodSignatureContaining(depDet, '.apply(') || 'ignore',
        depDetBeginName = findNameMethodSignatureContaining(depDet, '.push({'),
        depDetRegisterName = findNameMethodSignatureContaining(depDet, '.length');

// Find hidden properties and methods of ko.computed and its returned values
// Also find the minified name of ko.computed (so Knockout will also use the new version)
    var oldComputed = ko.computed,
        computedName = findPropertyName(ko, oldComputed),
        koProtoName = findPropertyName(oldComputed.fn, oldComputed),
        computedProto = ko.computed(function() {}),
        peekName = findPropertyName(computedProto, computedProto.peek) || 'peek',
        isActiveName = findPropertyName(computedProto, computedProto.isActive) || 'isActive',
        getDependenciesCountName = findPropertyName(computedProto, computedProto.getDependenciesCount),
        hasWriteFunctionName = findPropertyName(computedProto, false),
        disposeName = findPropertyName(computedProto, computedProto.dispose),
        disposeWhenNodeIsRemovedName = 'disposeWhenNodeIsRemoved',
        disposeWhenName = 'disposeWhen';

// Find hidden names for disposeWhenNodeIsRemoved and disposeWhen by examining the function source
    if (hasWriteFunctionName != 'hasWriteFunction') {
        var oldComputedStr = oldComputed.toString(), match1, match2;
        if (match1 = oldComputedStr.match(/.\.disposeWhenNodeIsRemoved\|\|.\.([^|]+)\|\|/))
            disposeWhenNodeIsRemovedName = match1[1];
        if (match2 = oldComputedStr.match(/.\.disposeWhen\|\|.\.([^|]+)\|\|/))
            disposeWhenName = match2[1];
    }

// Find ko.utils.domNodeIsAttachedToDocument
    var nodeInDocName = findNameMethodSignatureContaining(ko.utils, 'ocument)');

// Find the name of the ko.subscribable.fn.subscribe function
    var subFnObj = ko.subscribable.fn,
        subFnName = findNameMethodSignatureContaining(subFnObj, '.bind(');

// Find the name of ko.subscription.dispose
    var subscription = new ko.subscribable().subscribe(),
        oldSubDispose = subscription.dispose,
        subscriptionProto = subscription.constructor.prototype,
        subDisposeName = findPropertyName(subscriptionProto, oldSubDispose);
    subscription.dispose();
    subscription = null;


    /*
     * Update dependencyDetection to use an id for each observable
     */
    var _frames = [], nonce = 0;
    function getId() {
        // The main concern for this method of generating a unique id is that you could eventually
        // overflowing the number storage size. In JavaScript, the largest exact integral value
        // is 2^53 or 9,007,199,254,740,992; which seems plenty for any normal application.
        // See http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
        return ++nonce;
    }
    depDet[depDetBeginName] = function (callback) {
        _frames.push({ callback: callback, deps:{} });
    };
    depDet.end = function () {
        _frames.pop();
    };
    depDet[depDetRegisterName] = function (subscribable) {
        if (!ko.isSubscribable(subscribable))
            throw new Error("Only subscribable things can act as dependencies");
        if (_frames.length > 0) {
            var topFrame = _frames[_frames.length - 1],
                id = (subscribable._id = subscribable._id || getId());
            if (!topFrame || topFrame.deps[id])
                return;
            topFrame.deps[id] = true;
            topFrame.callback(subscribable, id);
        }
    };
    ko.ignoreDependencies = depDet[depDetIgnoreName] = function(callback, callbackTarget, callbackArgs) {
        try {
            _frames.push(null);
            return callback.apply(callbackTarget, callbackArgs || []);
        } finally {
            _frames.pop();
        }
    };


    /*
     * Replace ko.subscribable.fn.subscribe with one where change events are deferred
     */
    var oldSubscribe = subFnObj[subFnName];    // Save old subscribe function
    subFnObj[subFnName] = function (callback, callbackTarget, event, deferUpdates, computed) {
        event = event || 'change';
        var newCallback;
        if (!computed) {
            var boundCallback = function(valueToNotify) {
                callback.call(callbackTarget, valueToNotify, event);
            };
            if (event != 'change') {
                newCallback = boundCallback;
            } else {
                newCallback = function(valueToNotify) {
                    if ((newComputed.deferUpdates && subscription.deferUpdates !== false) || subscription.deferUpdates)
                        ko.tasks.processDelayed(boundCallback, true, {args: [valueToNotify]});
                    else
                        boundCallback(valueToNotify);
                };
            }
        } else {
            newCallback = function(valueToNotify) {
                callback(valueToNotify, event);
            };
            if (event == 'change') {
                this.dependents = this.dependents || [];
                this.dependents.push(computed);
            }
        }
        var subscription = oldSubscribe.call(this, newCallback, null, event);
        subscription.target = this;
        subscription.event = event;
        subscription.dependent = computed;
        subscription.deferUpdates = deferUpdates;
        return subscription;
    }
    /*
     * Replace ko.subscribable.fn.notifySubscribers with one where dirty and change notifications are deferred
     */
    var oldnotifySubscribers = subFnObj.notifySubscribers, notifyQueue;
    subFnObj.notifySubscribers = function (valueToNotify, event) {
        if (event === 'change' || event === 'dirty' || event === undefined) {
            if (!notifyQueue) {
                try {
                    notifyQueue = [];
                    oldnotifySubscribers.call(this, valueToNotify, event);
                    if (notifyQueue.length) {
                        for (var i = 0, n; n = notifyQueue[i]; i++) {
                            oldnotifySubscribers.call(n.object, n.value, n.event);
                        }
                    }
                } finally {
                    notifyQueue = null;
                }
            } else {
                notifyQueue.push({
                    object: this,
                    value: valueToNotify,
                    event: event
                });
            }
        } else {
            oldnotifySubscribers.call(this, valueToNotify, event);
        }
    };
// Provide a method to return a list of dependents (computed observables that depend on the subscribable)
    subFnObj.getDependents = function() {
        return this.dependents ? [].concat(this.dependents) : [];
    }
// Update dispose function to clean up pointers to dependents
    subscriptionProto[subDisposeName] = function() {
        oldSubDispose.call(this);
        if (this.dependent && this.event == 'change')
            ko.utils.arrayRemoveItem(this.target.dependents, this.dependent);
    }

// Helper function for subscribing to two events for computed observables.
// This returns a single "subscription" object to simplify the computed code.
    function subscribeToComputed(target, dirtyCallback, changeCallback, subscriber) {
        var dirtySub = target.subscribe(dirtyCallback, null, 'dirty', false, subscriber),
            changeSub = target.subscribe(changeCallback, null, 'change', false, subscriber);
        return {
            dispose: function() {
                dirtySub.dispose();
                changeSub.dispose();
            },
            target: target
        };
    }

    /*
     * New ko.computed with support for deferred updates (and other fixes)
     */
    var newComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
        var _latestValue,
            _possiblyNeedsEvaluation = false,
            _needsEvaluation = true,
            _dontEvaluate = false,
            readFunction = evaluatorFunctionOrOptions;

        if (readFunction && typeof readFunction == 'object') {
            // Single-parameter syntax - everything is on this 'options' param
            options = readFunction;
            readFunction = options.read;
        } else {
            // Multi-parameter syntax - construct the options according to the params passed
            options = options || {};
            if (!readFunction)
                readFunction = options.read;
        }
        // By here, 'options' is always non-null
        if (typeof readFunction != 'function')
            throw Error('Pass a function that returns the value of the ko.computed');

        var writeFunction = options.write;
        if (!evaluatorFunctionTarget)
            evaluatorFunctionTarget = options.owner;

        var _subscriptionsToDependencies = {}, _dependenciesCount = 0, othersToDispose = [];
        function disposeAllSubscriptionsToDependencies() {
            ko.utils.objectForEach(_subscriptionsToDependencies, function (id, subscription) {
                subscription.dispose();
            });
            ko.utils.arrayForEach(othersToDispose, function (subscription) {
                subscription.dispose();
            });
            _subscriptionsToDependencies = {};
            _dependenciesCount = 0;
            othersToDispose = [];
            _possiblyNeedsEvaluation = _needsEvaluation = false;
        }

        var evaluationTimeoutInstance = null;
        function evaluatePossiblyAsync(value, event) {
            var isDirtyEvent = (event == 'dirty');
            var shouldNotify = isDirtyEvent && !_possiblyNeedsEvaluation && !_needsEvaluation;
            if (isDirtyEvent)
                _possiblyNeedsEvaluation = true;
            else
                _needsEvaluation = true;
            var throttleEvaluationTimeout = dependentObservable.throttleEvaluation;
            if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
                clearTimeout(evaluationTimeoutInstance);
                evaluationTimeoutInstance = ko.evaluateAsynchronously(evaluateImmediate, throttleEvaluationTimeout);
            } else if ((newComputed.deferUpdates && dependentObservable.deferUpdates !== false) || dependentObservable.deferUpdates)
                shouldNotify = ko.tasks.processDelayed(evaluateImmediate, true, {node: disposeWhenNodeIsRemoved});
            else if (_needsEvaluation)
                shouldNotify = evaluateImmediate();

            if (shouldNotify && dependentObservable.notifySubscribers) {     // notifySubscribers won't exist on first evaluation (but there won't be any subscribers anyway)
                dependentObservable.notifySubscribers(_latestValue, 'dirty');
                if (!_possiblyNeedsEvaluation && throttleEvaluationTimeout)  // The notification might have triggered an evaluation
                    clearTimeout(evaluationTimeoutInstance);
            }
        }

        function markAsChanged(value, event) {
            if (!_possiblyNeedsEvaluation && !_needsEvaluation) {
                evaluatePossiblyAsync(value, event);
            } else {
                _needsEvaluation = true;
            }
        }

        function addDependency(subscribable, id) {
            var subscription;
            if (subscribable[koProtoName] === newComputed) {
                subscription = subscribeToComputed(subscribable, evaluatePossiblyAsync, markAsChanged, dependentObservable);
            } else {
                subscription = subscribable.subscribe(evaluatePossiblyAsync, null, 'change', false, dependentObservable);
            }
            _subscriptionsToDependencies[id] = subscription;
            _dependenciesCount++;
        }

        function getDependencies() {
            var result = [];
            ko.utils.objectForEach(_subscriptionsToDependencies, function(id, item) {
                result.push(item.target);
            });
            return result;
        }

        function evaluateImmediate(force) {
            if (_dontEvaluate || (!_needsEvaluation && !(force === true))) {    // test for exact *true* value since Firefox will pass an integer value when this function is called through setTimeout
                _possiblyNeedsEvaluation = _needsEvaluation;
                return false;
            }

            // disposeWhen won't be set until after initial evaluation
            if (disposeWhen && disposeWhen()) {
                dependentObservable.dispose();
                return false;
            }

            _dontEvaluate = true;
            try {
                // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
                // Then, during evaluation, we cross off any that are in fact still being used.
                var disposalCandidates = ko.utils.objectMap(_subscriptionsToDependencies, function() {return true;});
                depDet[depDetBeginName](function(subscribable, id) {
                    if (id in disposalCandidates) {
                        disposalCandidates[id] = undefined;  // Don't want to dispose this subscription, as it's still being used
                    } else {
                        addDependency(subscribable, id); // Brand new subscription - add it
                    }
                });

                var newValue = readFunction.call(evaluatorFunctionTarget);

                // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
                ko.utils.objectForEach(disposalCandidates, function(id, toDispose) {
                    if (toDispose) {
                        _subscriptionsToDependencies[id].dispose();
                        delete _subscriptionsToDependencies[id];
                        _dependenciesCount--;
                    }
                });

                _possiblyNeedsEvaluation = _needsEvaluation = false;

                if (!dependentObservable.equalityComparer || !dependentObservable.equalityComparer(_latestValue, newValue)) {
                    dependentObservable.notifySubscribers(_latestValue, 'beforeChange');

                    _latestValue = newValue;
                    dependentObservable._latestValue = _latestValue;
                    dependentObservable.notifySubscribers(_latestValue);
                }
            } finally {
                depDet.end();
                _dontEvaluate = false;
                // For compatibility with Knockout 2.3.0, mark computed as evaluated even if the evaluator threw an exception
                _possiblyNeedsEvaluation = _needsEvaluation = false;
            }

            return true;
        }

        function evaluateInitial() {
            _dontEvaluate = true;
            try {
                depDet[depDetBeginName](addDependency);
                dependentObservable._latestValue = _latestValue = readFunction.call(evaluatorFunctionTarget);
            } finally {
                depDet.end();
                _needsEvaluation = _dontEvaluate = false;
            }
        }

        function dependentObservable() {
            if (arguments.length > 0) {
                if (typeof writeFunction === 'function') {
                    // Writing a value
                    // Turn off deferred updates for this observable during the write so that the 'write' is registered
                    // immediately (assuming that the read function accesses any observables that are written to).
                    var saveDeferValue = dependentObservable.deferUpdates;
                    dependentObservable.deferUpdates = false;
                    try {
                        writeFunction.apply(evaluatorFunctionTarget, arguments);
                    } finally {
                        dependentObservable.deferUpdates = saveDeferValue;
                    }
                } else {
                    throw Error('Cannot write a value to a ko.computed unless you specify a "write" option. If you wish to read the current value, don\'t pass any parameters.');
                }
                return this; // Permits chained assignments
            } else {
                // Reading the value
                if (_needsEvaluation || _possiblyNeedsEvaluation)
                    evaluateImmediate(true);
                depDet[depDetRegisterName](dependentObservable);
                return _latestValue;
            }
        }

        function peek() {
            if (_needsEvaluation || _possiblyNeedsEvaluation)
                evaluateImmediate(true);
            return _latestValue;
        }

        function isActive() {
            return _needsEvaluation || _possiblyNeedsEvaluation || _dependenciesCount > 0;
        }

        var activeWhenComputed;
        function activeWhen(obsToWatch) {
            if (!activeWhenComputed) {
                activeWhenComputed = ko.computed(function() {
                    _dontEvaluate = !obsToWatch();
                    if (!_dontEvaluate && _needsEvaluation) {
                        evaluatePossiblyAsync(undefined, 'change');
                    }
                });
                activeWhenComputed.deferUpdates = false;
                othersToDispose.push(activeWhenComputed);
            }
        }

        // Need to set disposeWhenNodeIsRemoved here in case we get a notification during the initial evaluation
        var disposeWhenNodeIsRemoved = options[disposeWhenNodeIsRemovedName] || options.disposeWhenNodeIsRemoved || null;

        if (options.deferEvaluation !== true)
            evaluateInitial();

        var dispose = disposeAllSubscriptionsToDependencies;

        // Build 'disposeWhenNodeIsRemoved' and 'disposeWhenNodeIsRemovedCallback' option values.
        // But skip if isActive is false (there will never be any dependencies to dispose).
        // (Note: 'disposeWhenNodeIsRemoved' option both proactively disposes as soon as the node is removed using ko.removeNode(),
        // plus adds a 'disposeWhen' callback that, on each evaluation, disposes if the node was removed by some other means.)
        var disposeWhen = options[disposeWhenName] || options.disposeWhen || function() { return false; };
        if (disposeWhenNodeIsRemoved && isActive()) {
            dispose = function() {
                ko.utils.domNodeDisposal.removeDisposeCallback(disposeWhenNodeIsRemoved, dispose);
                disposeAllSubscriptionsToDependencies();
            };
            ko.utils.domNodeDisposal.addDisposeCallback(disposeWhenNodeIsRemoved, dispose);
            var existingDisposeWhenFunction = disposeWhen;
            disposeWhen = function () {
                return !ko.utils[nodeInDocName](disposeWhenNodeIsRemoved) || existingDisposeWhenFunction();
            }
        }

        // Set properties of returned function
        ko.subscribable.call(dependentObservable);
        ko.utils.extend(dependentObservable, newComputed.fn);

        dependentObservable[peekName] = dependentObservable.peek = peek;
        dependentObservable[getDependenciesCountName] = dependentObservable.getDependenciesCount = function () { return _dependenciesCount; };
        dependentObservable[hasWriteFunctionName] = dependentObservable.hasWriteFunction = typeof writeFunction === 'function';
        dependentObservable[disposeName] = dependentObservable.dispose = function () { dispose(); };
        dependentObservable[isActiveName] = dependentObservable.isActive = isActive;
        dependentObservable.activeWhen = activeWhen;
        dependentObservable.getDependencies = getDependencies;

        return dependentObservable;
    };

// Set ko.computed properties
    newComputed[koProtoName] = oldComputed[koProtoName];
    newComputed.fn = oldComputed.fn;
    newComputed.fn[koProtoName] = newComputed;
    newComputed.deferUpdates = true;

// Make all pointers to ko.computed point to the new one
    ko[computedName] = ko.computed = ko.dependentObservable = newComputed;

// Clear objects references we don't need anymore
    oldComputed = computedProto = null;

    /*
     * New throttle extender
     */
    ko.extenders.throttle = function(target, timeout) {
        // Throttling means two things:

        if (ko.isWriteableObservable(target)) {
            // (1) For writable targets (observables, or writable dependent observables), we throttle *writes*
            //     so the target cannot change value synchronously or faster than a certain rate
            var writeTimeoutInstance = null;
            return ko.computed({
                read: target,
                write: function(value) {
                    clearTimeout(writeTimeoutInstance);
                    writeTimeoutInstance = ko.evaluateAsynchronously(function() {
                        target(value);
                    }, timeout);
                }
            });
        } else {
            // (2) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
            //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
            target.throttleEvaluation = timeout;
            return target;
        }
    };

    /*
     * Add deferred extender
     */
    ko.extenders.deferred = function(target, value) {
        target.deferUpdates = value;
    };

    return ko;

}));