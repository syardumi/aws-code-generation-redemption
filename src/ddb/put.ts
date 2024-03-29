import { Code } from 'src/types/Code'
import { ddb } from './_client'

/**
 *
 * @param Item
 * @param isOverwrite
 */
export const putItem = async (Item: Code, isOverwrite?: boolean) => {
  await ddb
    .put({
      TableName: process.env.CODE_DOMAIN_TABLE_NAME,
      Item: { code_domain: Item.code_domain }
    })
    .promise()
    .catch((e) => {
      console.error('Code Domain Put Error', e)
      throw e
    })

  const putParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
    TableName: process.env.CODE_HASH_TABLE_NAME,
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
      console.error('Code Hash Put Error', e)
      throw e
    })
}
