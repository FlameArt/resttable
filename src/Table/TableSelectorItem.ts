export default interface ITableSelectorItem {

   id: string | number,
   title?: string,
   label?: string,
   color?: string,
   position?: number,
   
   /**
    * Строка, которая будет добавлена перед элементом
    */
   prepend?: string,

   /**
    * Строка, которая будет добавлена после элемента
    */
   append?: string,

   /**
    * CSS-классы для блока с препендом
    */
   prependClasses?: string,

   /**
    * CSS-классы для блока с аппендом
    */
   appendClasses?: string,

}