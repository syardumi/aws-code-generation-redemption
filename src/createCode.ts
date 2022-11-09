import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'

export const ddb = new AWS.DynamoDB.DocumentClient()

export const handler: Handler = async (event, _context, _callback) => {
  const Item = JSON.parse(event.body)

  try {
    await ddb
      .put({
        TableName: process.env.CODE_TABLE_NAME,
        Item
      })
      .promise()

    return {
      statusCode: 200
    }
  } catch (e) {
    return {
      statusCode: e.statusCode,
      body: e.message
    }
  }
}
