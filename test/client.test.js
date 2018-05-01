'use strict'

const expect = require('chai').expect
const nock = require('nock')
const GtClient = require('../index')

const EXPLORER_URI = 'http://gt-explorer.com'

const random = () => {
    return require('crypto').randomBytes(20).toString('hex')
}

describe('Base test :: ', () => {

    before(() => {

        nock(EXPLORER_URI)
            .persist()
            .post('/add')
            .reply(200, {})
    })

    it('Send everything', () => {
        const config = { uri: EXPLORER_URI, service: 'test-service' }
        const client = new GtClient(config)

        const details = { id: random(), context: 'test.handler', type: 'test-type' }
        client.start(details)

        return new Promise((resolve) => {

            setTimeout(() => {
                client.stop(details)
                resolve()
            }, 500)
        })
    })
})
