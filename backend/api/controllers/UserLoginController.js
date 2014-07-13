'use strict';

var _ = require('lodash');

/**
 * UserLoginController
 *
 * @description :: Server-side logic for managing UserLogins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
module.exports = _.merge(_.cloneDeep(require('../base/Controller')), {
    /**
     * Action to fetch user login data grouped by IP addresses. Note that this
     * action handles sort and pagination via helper function because .sort(),
     * .limit() and .skip() doesn't work with 'groupBy' criteria.
     *
     * Sent response is an array of objects in following format:
     *
     *  [
     *      {
     *          ip: "123.123.123.123",
     *          count: 3
     *      },
     *      {
     *          ip: "10.0.0.1",
     *          count: 1
     *      }
     *  ]
     *
     * If error occurs while fetching data function will sent error object with
     * HTTP status 500.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    dataIp: function(request, response) {
        var extraCriteria = {groupBy: ['ip'], sum: ['count']};

        DataService.getCollection(request, extraCriteria, function(error, items) {
            if (error) {
                response.json(500, error);
            } else {
                response.json(200, DataService.sortAndPaginate(items, request));
            }
        });
    },

    /**
     * Action to fetch user login data grouped by user-agent. Note that this
     * action handles sort and pagination via helper function because .sort(),
     * .limit() and .skip() doesn't work with 'groupBy' criteria.
     *
     * Sent response is an array of objects in following format:
     *
     *  [
     *      {
     *          agent: "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko",
     *          count: 3
     *      },
     *      {
     *          agent: "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36",
     *          count: 1
     *      }
     *  ]
     *
     * If error occurs while fetching data function will sent error object with
     * HTTP status 500.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    dataAgent: function(request, response) {
        var extraCriteria = {groupBy: ['agent'], sum: ['count']};

        DataService.getCollection(request, extraCriteria, function(error, items) {
            if (error) {
                response.json(500, error);
            } else {
                response.json(200, DataService.sortAndPaginate(items, request));
            }
        });
    },

    /**
     * Action to fetch count of unique IP addresses of specified user. Sent response
     * is an object in following format:
     *
     *  {
     *      count: 12
     *  }
     *
     * If error occurs while fetching data function will sent error object with HTTP
     * status 500.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    countIp: function(request, response) {
        var extraCriteria = {groupBy: ['ip'], sum: ['count']};

        DataService.getCollection(request, extraCriteria, function(error, items) {
            if (error) {
                response.json(500, error);
            } else {
                response.json(200, {count: items.length});
            }
        });
    },

    /**
     * Action to fetch count of unique user-agents of specified user. Sent response
     * is an object in following format:
     *
     *  {
     *      count: 12
     *  }
     *
     * If error occurs while fetching data function will sent error object with HTTP
     * status 500.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    countAgent: function(request, response) {
        var extraCriteria = {groupBy: ['agent'], sum: ['count']};

        DataService.getCollection(request, extraCriteria, function(error, items) {
            if (error) {
                response.json(500, error);
            } else {
                response.json(200, {count: items.length});
            }
        });
    }
});
