import { Handler } from 'aws-lambda'
import AWS from 'aws-sdk'

export const ddb = new AWS.DynamoDB.DocumentClient()

export const fire: Handler = async (event, _context, _callback) => {
  // TODO: get all domains and send to SQS
}
