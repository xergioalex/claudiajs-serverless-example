const ApiBuilder = require('claudia-api-builder')
const AWS = require('aws-sdk')

let api = new ApiBuilder()
let dynamoDb = new AWS.DynamoDB.DocumentClient()

api.post('/icecreams', function (request) { // SAVE your icecream
  let params = {
    TableName: 'icecreams',
    Item: {
      icecreamid: request.body.icecreamId,
      name: request.body.name // your icecream name
    }
  }
  return dynamoDb.put(params).promise(); // returns dynamo result
}, { success: 201 }) // returns HTTP status 201 - Created if successful

api.get('/icecreams', function (request) { // GET all users
  return dynamoDb.scan({ TableName: 'icecreams' }).promise()
    .then(response => {
      return {
        status: 'ok',
        items: response.Items
      }
    })
})

module.exports = api