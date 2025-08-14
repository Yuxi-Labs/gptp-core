// test-run.ts
import { validateGPTP } from '../schema/validateSchema'

const result = await validateGPTP('./docs/examples/hello-world.gptp')
console.log(result)
