import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'

export const ddb = new AWS.DynamoDB.DocumentClient()

export const fire: Handler = async (event, _context, _callback) => {
  let result, ExclusiveStartKey
  try {
    do {
      result = await ddb
        .query({
          TableName: process.env.CODE_TABLE_NAME,
          IndexName: 'expired_in_domain_GSI',
          KeyConditionExpression:
            'domain = :domain and expire_timestamp < :time',
          ExpressionAttributeValues: {
            ':domain': { S: process.env.DOMAIN },
            ':time': { N: new Date().getTime() }
          },
          ConsistentRead: true,
          ScanIndexForward: true,
          ExclusiveStartKey,
          Limit: 100
        })
        .promise()

      await Promise.all(
        result.Items.map(async (Item) => {
          await ddb
            .delete({
              TableName: process.env.CODE_TABLE_NAME,
              Key: {
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
}
