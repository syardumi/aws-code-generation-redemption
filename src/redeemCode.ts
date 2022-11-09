import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'
import httpErrors from 'http-errors'

export const ddb = new AWS.DynamoDB.DocumentClient()

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash } = JSON.parse(event.body)

  try {
    const response = await ddb
      .delete({
        TableName: process.env.CODE_TABLE_NAME,
        Key: {
          code_domain,
          code_hash
        },
        ReturnValues: 'ALL_OLD'
      })
      .promise()
      .catch((e) => {
        console.error('Record Delete Error', e)
        throw e
      })
    if (!response.Attributes) {
      throw httpErrors(404, 'Record Not Found')
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.Attributes)
    }
  } catch (e) {
    return {
      statusCode: e.statusCode,
      body: e.message
    }
  }
}
