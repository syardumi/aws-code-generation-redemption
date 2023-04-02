import AWS, { AWSError } from 'aws-sdk'

const ddb = new AWS.DynamoDB.DocumentClient()

/**
 *
 * @param Item
 */
export const deleteItem = (Key: { code_domain: string; code_hash: string }) => {
  return ddb
    .delete({
      TableName: process.env.CODE_TABLE_NAME,
      Key,
      ReturnValues: 'ALL_OLD'
    })
    .promise()
    .catch((e) => {
      console.error('Record Delete Error', e)
      throw e
    })
}
