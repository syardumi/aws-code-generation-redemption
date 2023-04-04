import { CodeKey } from 'src/types/Code'
import { ddb } from './_client'

/**
 *
 * @param Key
 */
export const getItem = (Key: CodeKey) => {
  return ddb
    .get({
      TableName: process.env.CODE_HASH_TABLE_NAME,
      Key
    })
    .promise()
    .catch((e) => {
      console.error('Code Hash Get Error', e)
      throw e
    })
}
