# Gte-node-client

Node.js library for in service request measurements

## Usage

```javascript
const GteClient = require('gte-node-client')
const client = new GteClient({ uri: 'http://explorer:4000/', service: 'service-name' })

//....
const details = { id: 'service-request-id', context: 'service.http-handler', type: 'user-registration' }
client.start(details)

// ....

client.stop(details)
```

# TBD

