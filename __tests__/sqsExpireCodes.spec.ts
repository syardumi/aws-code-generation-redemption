import { Context, SQSRecord } from 'aws-lambda'
import { receive, ddb } from '../src/sqsExpireCodes'

jest.setTimeout(30e3)

const { query } = ddb
const deleteItem = ddb.delete

let deleteKeys: { [key: string]: string }[]

describe(`SQS Expire Codes`, () => {
  beforeEach(() => {
    deleteKeys = []
    ddb.query = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.resolve({
            Items: [
              { code_domain: 'ABC', code_hash: '1234' },
              { code_domain: 'ABC', code_hash: '4561' },
              { code_domain: 'ABC', code_hash: '8432' }
            ]
          })
      }
    })
    ddb.delete = jest.fn().mockImplementation((params) => {
      deleteKeys.push(params.Key)
      return {
        promise: () => Promise.resolve()
      }
    })
  })

  afterAll(() => {
    Object.assign(ddb, { query, delete: deleteItem })
  })

  it('gets a domain for which it expires any active codes', async () => {
    await receive(
      {
        Records: [
          {
            body: '{"domain":"ABC"}'
          } as SQSRecord
        ]
      },
      {} as Context,
      () => {}
    )

    expect(deleteKeys).toEqual([
      { code_domain: 'ABC', code_hash: '1234' },
      { code_domain: 'ABC', code_hash: '4561' },
      { code_domain: 'ABC', code_hash: '8432' }
    ])
  })

  // TODO: failure
})
