# Gt-client

Node.js library for in service request measurements

## Usage

```javascript
const GtClient = require('gt-client')
const client = new GtClient({ explorerUri: 'http://explorer:4000/', service: 'service-name' })

//....
const details = { id: 'service-request-id', context: 'service.http-handler', type: 'user-registration' }
client.start(details)

// ....

client.stop(details)
```

# TBD

