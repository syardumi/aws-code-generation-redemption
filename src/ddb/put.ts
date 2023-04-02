import AWS from 'aws-sdk'
import { Code } from 'src/types/Code'

const ddb = new AWS.DynamoDB.DocumentClient()

/**
 *
 * @param Item
 */
export const putItem = async (Item: Code, isOverwrite?: boolean) => {
  await ddb
    .put({
      TableName: process.env.DOMAIN_TABLE_NAME,
      Item: { code_domain: Item.code_domain }
    })
    .promise()
    .catch((e) => {
      console.error('Domain Put Error', e)
      throw e
    })

  const putParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
    TableName: process.env.CODE_TABLE_NAME,
    Item
  }

  if (!isOverwrite) {
    putParams.ConditionExpression =
      'attribute_not_exists(code_domain) and attribute_not_exists(code_hash)'
  }

  return ddb
    .put(putParams)
    .promise()
    .catch((e) => {
      console.error('Code Put Error', e)
      throw e
    })
}
