import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'
import { ddb } from './ddb/_client'

export { ddb }
export const sqs = new AWS.SQS()

export const fire: Handler = async (event, _context, _callback) => {
  let result, ExclusiveStartKey
  try {
    do {
      result = await ddb
        .scan({
          TableName: process.env.CODE_DOMAIN_TABLE_NAME,
          ExclusiveStartKey,
          Limit: 100
        })
        .promise()

      await Promise.all(
        result.Items.map(async (Item) => {
          const msg = {
            MessageBody: JSON.stringify({ domain: Item.code_domain }),
            QueueUrl: process.env.CODE_EXPIRATION_QUEUE_URL
          }
          await sqs
            .sendMessage(msg)
            .promise()
            .catch((err) => {
              console.error('Failed to send message to SQS', { msg }, err)
            })
        })
      )

      ExclusiveStartKey = result.LastEvaluatedKey
    } while (result.Items.length && result.LastEvaluatedKey)
  } catch (e) {
    console.error('Schedule Get All Domains Error', e)
  }
}
