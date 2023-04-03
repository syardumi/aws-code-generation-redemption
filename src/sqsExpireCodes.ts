import { SQSHandler } from 'aws-lambda'
import AWS from 'aws-sdk'
import { asyncForEach } from './util/asyncForEach'

export const ddb = new AWS.DynamoDB.DocumentClient()

export const receive: SQSHandler = async (event, _context, _callback) => {
  const { Records } = event

  await asyncForEach(Records, async (record) => {
    const { domain } = JSON.parse(record.body)

    let result, ExclusiveStartKey
    try {
      do {
        result = await ddb
          .query({
            TableName: process.env.CODE_HASH_TABLE_NAME,
            IndexName: 'expired_in_domain_GSI',
            KeyConditionExpression:
              'code_domain = :d and expire_timestamp < :time',
            ExpressionAttributeValues: {
              ':d': domain,
              ':time': new Date().getTime()
            },
            ScanIndexForward: true,
            ExclusiveStartKey,
            Limit: 100
          })
          .promise()

        await Promise.all(
          result.Items.map(async (Item) => {
            await ddb
              .delete({
                TableName: process.env.CODE_HASH_TABLE_NAME,
                Key: {
                  code_domain: Item.code_domain,
                  code_hash: Item.code_hash
                }
              })
              .promise()
              .catch((e) => {
                console.error('Delete Record Error', e)
              })
          })
        )

        ExclusiveStartKey = result.LastEvaluatedKey
      } while (result.Items.length && result.LastEvaluatedKey)
    } catch (e) {
      console.error('Expire Codes Error', e)
    }
  })
}
