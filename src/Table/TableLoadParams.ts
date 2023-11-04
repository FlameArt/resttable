export default interface ITableLoadParams {

   where?: any
   fields?: Array<string>,
   expand?: Array<any>,
   sort?: Array<string>,
   page?: number,
   perPage?: number,
   params?: any,

   export?: {
      format: 'xlsx' | 'csv',
      titles?: Array<string>,
      filename?: string,
   }

}