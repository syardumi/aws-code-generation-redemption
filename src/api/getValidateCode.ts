import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'
import createError from 'http-errors'

const ddb = new AWS.DynamoDB.DocumentClient()

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash } = event.pathParameters

  try {
    await ddb
      .get({
        TableName: process.env.CODE_TABLE_NAME,
        Key: {
          code_domain,
          code_hash
        }
      })
      .promise()
      .then((data) => {
        if (!data.Item) throw createError(404)
      })
      .catch((e) => {
        throw createError(404)
      })

    return {
      statusCode: 200
    }
  } catch (e) {
    return {
      statusCode: e.statusCode
    }
  }
}
