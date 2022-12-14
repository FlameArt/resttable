import { Column, IColumn } from './Columns';

import merge from 'lodash.merge'
import FlameTable from './FlameTable';

export default class TableOpts {

  /**
   * Колонки
   */
  public columnsOpts: { [key: string]: IColumn } = {};

  public set(ColumnName: string, mergingOpts: IColumn) {
    // TODO: ЕСТЬ ОШИБКА???
    if (this.columnsOpts[ColumnName] === undefined) this.columnsOpts[ColumnName] = new Column as any
    merge(this.columnsOpts[ColumnName], mergingOpts)
  }

  /**
   * Удалить одну колонку или сразу несколько
   * @param ColumnName Полностью удалить строку
   */
  public delete(ColumnName: string | Array<string>) {

    let arr: Array<string> = [];
    if (typeof ColumnName === 'string') arr = [ColumnName as string];
    else arr = ColumnName as Array<string>;

    for (const key in arr) {
      // TODO: ????? as any
      if (this.columnsOpts[arr[key]] === undefined) this.columnsOpts[arr[key]] = new Column as any
      merge(this.columnsOpts[arr[key]], { Table: { isShow: false }, Popup: { isShow: false } })
    }

  }

  public Add = {
    can: true,
    buttonTitle: "Добавить",
    func: () => {
    }
  };
  public Remove = {
    can: true,
    func: () => {
    }
  };
  public Edit = {
    can: true,
    func: () => {
    }
  };

  public Popup = {
    /**
     * Функция при загрузке попапа
     */
    load: async (row: any, table: typeof FlameTable.prototype) => {
    },

    /**
     * Выполняет код перед сохранением записи, и ждёт true для продолжения
     * @param row 
     * @param table 
     * @returns 
     */
    beforeEdit: async (row: any, table: typeof FlameTable.prototype): Promise<boolean> => {
      return true;
    },
    beforeAdd: async (row: any, table: typeof FlameTable.prototype): Promise<boolean> => {
      return true;
    },



  }


  /**
   * Запрос на поиск записей
   */
  public find = () => {

  }


}

export interface TableFilter {
  type: "float" | "integer" | "string" | "text" | "date" | "selector"
}