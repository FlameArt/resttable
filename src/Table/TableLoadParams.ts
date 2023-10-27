export default interface ITableLoadParams {

   where?: any
   fields?: any,
   expand?: any,
   sortfields?: Array<string>,
   page?: number,
   perPage?: number

}