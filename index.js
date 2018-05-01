'use strict'

const debug = require('debug')('gte-node-client')
const _ = require('lodash')
const request = require('superagent')

/**
 * Default configuration for client
 * @type {Object}
 */
const defaultConfig = {
    uri: '',
    service: ''
}

const NS_PER_SEC = 1e9

module.exports = class GtClient {

    /**
     * Initialisation of client
     *
     * @param {Object} config
     * @param {String} config.uri
     * @param {String} config.service
     */
    constructor(config = {}) {

        if (!_.isObject(config) || _.isEmpty(config.uri)) {
            throw new Error('Wrong Explorer URI provied for client')
        }
        this.config = _.defaultsDeep(config, defaultConfig)
        // List of active finished mesurements
        // that was not flushed to explorer service
        // will be stored in format `{id: { context: {start: time, stop: time, type: string....}}}`
        this._measurements = {}
    }

    /**
     * Start measurement
     *
     * @param {Object} details
     * @param {String} details.id - RequestID for tracking whole request
     * @param {String} details.context - Execution context
     * @param {String} [details.type] - Request Type(more like debug info for what action started execution)
     */
    start(details) {

        if (!_.isObject(details) || _.isEmpty(details.id) || _.isEmpty(details.context)) {
            debug('Failed to start measurement because of no id/context provided')
            return
        }
        if (_.hasIn(this._measurements, [details.id, details.context])) {
            debug(`Measurement already started for id: ${details.id} and context: ${details.context}`)
            return
        }
        // Check for request id existence
        if (!_.isObject(this._measurements[details.id])) {
            this._measurements[details.id] = {}
        }
        this._measurements[details.id][details.context] = {
            type: details.type || 'unknown',
            start: this._time(),
        }
    }

    /**
     * Stop measurement for ID + Context action.
     *
     * @param {Object} details
     * @param {String} details.id - RequestID for tracking whole request
     * @param {String} details.context - Execution context
     * @param {String} [details.type] - Request Type(more like debug info for what action started execution)
     */
    stop(details) {

        if (!_.isObject(details) || _.isEmpty(details.id) || _.isEmpty(details.context)) {
            debug('Failed to stop measurement because of no id/context provided')
        }
        if (!_.hasIn(this._measurements, [details.id, details.context]) || !_.isObject(this._measurements[details.id][details.context])) {
            debug(`Measurement was not started for id: ${details.id} and context: ${details.context}`)
        }
        this._measurements[details.id][details.context].stop = this._time()
        // Run flush
        this._flush(details)
    }

    /**
     * Get current nanotime
     *
     * @private
     * @return {Number}
     */
    _time() {

        const time = process.hrtime()
        return time[0] * NS_PER_SEC + time[1]
    }

    /**
     * Remove measurement from list fo stored
     *
     * @private
     * @param {Object} details
     * @param {String} details.id - RequestID for tracking whole request
     * @param {String} details.context - Execution context
     */
    _clear(details) {

        if (!_.isObject(details) || _.isEmpty(details.id) || _.isEmpty(details.context)) {
            debug('Failed to clear measurement because of no id/context provided')
            return
        }
        if (!_.hasIn(this._measurements, [details.id, details.context])) {
            return
        }
        delete this._measurements[details.id][details.context]
    }

    /**
     * Send measurement to request-explorer service
     *
     * @private
     * @param {Object} details
     * @param {String} details.id - RequestID for tracking whole request
     * @param {String} details.context - Execution context
     */
    _flush(details) {

        if (!_.isObject(details) || _.isEmpty(details.id) || _.isEmpty(details.context)) {
            debug('Failed to flush measurement because of no id/context provided')
            return
        }
        if (!_.hasIn(this._measurements, [details.id, details.context])) {
            debug(`Failed to flush measurement for id: ${details.id} and context: ${details.context}`)
            return
        }
        const meta = this._measurements[details.id][details.context]
        const data = {
            id: details.id,
            context: details.context,
            type: meta.type,
            start: meta.start,
            stop: meta.stop,
        }
        debug('Sending data for backend %o', data)
        return request
            .post(`${this.config.uri}/add`)
            .send(data)
            .type('application/json')
            .then(() => this._clear(details))
            .catch((err) => {

            })
    }
}
