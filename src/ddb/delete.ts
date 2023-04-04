import { CodeKey } from 'src/types/Code'
import { ddb } from './_client'

/**
 *
 * @param Key
 */
export const deleteItem = (Key: CodeKey) => {
  return ddb
    .delete({
      TableName: process.env.CODE_HASH_TABLE_NAME,
      Key,
      ReturnValues: 'ALL_OLD'
    })
    .promise()
    .catch((e) => {
      console.error('Code Hash Delete Error', e)
      throw e
    })
}
