import { Column, IColumn } from './Columns';

import merge from 'lodash-es/merge'
import FlameTable from './FlameTable';
import ITableLoadParams from './TableLoadParams';

export default class TableOpts {

  /**
   * Нужна ли автозагрузка
   */
  public autoload: boolean = true;

  /**
   * Добавить колонку выбора записей галочками
   */
  public rowSelectors: boolean = true;

  /**
   * Режим отображения таблицы
   * 'table' - стандартная таблица
   * 'custom' - произвольный вид строк через слот
   */
  public displayMode: 'table' | 'custom' = 'table';

  /**
   * Колонки
   */
  public columnsOpts: { [key: string]: IColumn } = {};

  /**
   * Параметры прогрузки
   */
  public LoadParams: ITableLoadParams = {};

  /**
   * Открывать субслот в таблице при клике
   */
  public onRowClickOpenSlot: 'popup' | 'rowspace' | 'none' = 'rowspace';

  /**
   * Клик по строке
   * @param row 
   * @returns 
   */
  public rowClick = (row: Array<{ [key: string]: IColumn }>) => null

  /**
   * Язык
   */
  public lang: 'ru' | 'en' = "ru";

  /**
   * Кастомный загрузчик файлов
   */
  public customDownloadHandler: null | ((data: Blob, filename: string, mime: string) => void) = null;

  /**
   * Функция, выполняемая перед обновлением данных и при возврате false - запрещающая обновление
   * @returns 
   */
  public onBeforeUpdate: ((filters: object, isExport: boolean) => boolean) = () => true;

  /**
   * Добавить виртуальный столбец (не будет учтён в запросах, но будет передан на бек для кастомизации фильтров)
   * @param ColumnName 
   * @param mergingOpts 
   */
  public addVirtual(ColumnName: string, mergingOpts: IColumn) {
    this.columnsOpts[ColumnName] = new Column as any
    merge(this.columnsOpts[ColumnName], mergingOpts)
    this.columnsOpts[ColumnName].isVirtual = true;
  }

  public set(ColumnName: string, mergingOpts: IColumn) {
    // TODO: ЕСТЬ ОШИБКА???
    if (this.columnsOpts[ColumnName] === undefined) this.columnsOpts[ColumnName] = new Column as any
    merge(this.columnsOpts[ColumnName], mergingOpts)
  }

  /**
   * Удалить одну колонку или сразу несколько
   * @param ColumnName Полностью удалить строку
   */
  public delete(ColumnName: string | Array<string>, opts: IColumn = {}) {

    let arr: Array<string> = [];
    if (typeof ColumnName === 'string') arr = [ColumnName as string];
    else arr = ColumnName as Array<string>;

    for (const key in arr) {
      // TODO: ????? as any
      if (this.columnsOpts[arr[key]] === undefined) this.columnsOpts[arr[key]] = new Column as any
      merge(this.columnsOpts[arr[key]], { Table: { isShow: false }, Popup: { isShow: false }, Filter: { isShow: false } })
    }

  }

  public Export = {
    isShow: true,
    CSV: {
      can: false,
      buttonTitle: "Export to CSV",
    },
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
   * Постраничная разбивка
   */
  public Pagination: {
    type: 'scrollable' | 'pages'
  } = { type: 'pages' }


}

export interface TableFilter {
  type: "float" | "integer" | "string" | "text" | "date" | "selector"
}