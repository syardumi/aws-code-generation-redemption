import { Handler } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { putItem, ddb } from '../ddb/index'

export { ddb }

export const handler: Handler = async (event, _context, _callback) => {
  const item = JSON.parse(event.body)

  try {
    const codeHash = uuidv4().split('-').slice(-1)[0].toUpperCase()
    item.code_hash = item.code_hash || codeHash
    await putItem(item)

    return {
      statusCode: 200,
      body: JSON.stringify({
        item
      })
    }
  } catch (e) {
    return {
      statusCode: e.statusCode,
      body:
        e.message === 'The conditional request failed'
          ? 'Record Already Exists'
          : e.message
    }
  }
}
