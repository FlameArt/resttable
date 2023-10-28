export default interface ITableLoadParams {

   where?: any
   fields?: any,
   expand?: any,
   sort?: Array<string>,
   page?: number,
   perPage?: number

}