export default class TableRowParams {

   public collapsed: boolean = true;
   public selected: boolean = false;
   public item: any = null;

   // Аттрибуты до сохранения новых
   public previousAttributes: {[key:string]:any} = {};

}