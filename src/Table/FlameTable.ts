import { Column } from './Columns';
import { Rows, SavedObject } from 'flamerest';
import TableOpts from "./TableOpts";
import { reactive, UnwrapRef } from 'vue';
import merge from 'lodash-es/merge'
import ITableLoadParams from './TableLoadParams';
import TableRowParams from './TableRowParams';

// Подгрузчик типа класса
type Class<T> = new (...args: any[]) => T

/**
 * Объект с состоянием REST таблицы
 */
export default class FlameTable<T> {

  /**
   * Режим таблицы
   */
  public mode: "table" | "add" | "edit" = "table"

  /**
   * Готовый набор колонок [уже обработанный]
   * key - имя колонки, Column - её опции
   */
  public columns: { [key: string]: Column } = reactive({});

  /**
   * Параметры таблицы
   */
  public opts: TableOpts = new TableOpts;

  /**
   * Инициализированная модель REST-таблицы
   */
  public model: T;

  /**
   * Строки
   */
  public Rows = reactive({ rows: [] as Array<T> });

  /**
   * Динамические параметры строк
   */
  public RowsParams: { [key: string]: TableRowParams } = reactive({});

  /**
   * Параметры паджинации
   */
  public Pager = reactive({
    page: 1,
    perPage: 20,
    count: 0,
    total: 0,
  })

  /**
   * Открытая в попапе строка
   */
  public OpenedRow: any = null;

  /**
   * Выделенные галочками чекбоксы
   */
  public RowsSelected: Array<T> = [];

  /**
   * Проинициализировать модели
   */
  public constructor(TableModel: Class<T>, opts: TableOpts) {

    // Инициализируем переданный класс
    this.model = new TableModel;

    // забираем все колонки из модели и из опций
    // так мы можем вставлять люое число колонок не привязываясь
    // удалим так же дубликаты
    // TODO: as any
    const allColumns = [...Object.keys(this.model as any), ...Object.keys(opts.columnsOpts)].filter((value, index, self) => self.indexOf(value) === index)

    // генерим полноценные колонки из описания модели
    for (const key of allColumns) {
      const newCol = new Column;
      this.columns[key] = newCol;

      // Выключаем из редактирования все праймари ключи
      if ((this.model as any).constructor['primaryKeys'].includes(key))
        newCol.Popup.isEnabled = false

      // Мержим стандартные параметры с опциями юзера
      merge(newCol, opts.columnsOpts[key]);

      // Жёстко устанавливаем название поля из базы для этой колонки
      newCol.name = key;

      // Загружаем селекторы один раз за страницу
      if (newCol.Popup.popupType === 'selector' && newCol.Popup.Selector.loader !== null)
        newCol.Popup.Selector.values = reactive(newCol.Popup.Selector.loader(newCol) ?? newCol.Popup.Selector.values)

    }

    // Мержим параметры с базовой версией
    merge(this.opts, opts);

    // TODO: Сортируем колонки, если указан порядок
    //this.columns



    // Далее юзер просто будет делать set("колонка", опции)

  }

  /**
   * Загрузить результаты от RESTа в таблицу
   * @param rows Отданный объект
   */
  public load(rows: Rows<T>) {

    if (rows.data) {
      this.Rows.rows = (rows.data ?? []) as any;
      Object.keys(this.Pager).forEach((key) => (this.Pager as any)[key] = (rows.pages as any)[key])

      // удаляем чтобы при перезагрузке не сохранялось состояние пред. строк
      // производительность: если не стирать параметры строк, то при долгом пользовании таблицей и больших её объёмах в памяти накопится куча позиций, это утечка
      for (const key in this.RowsParams) delete this.RowsParams[key];

      // Заполняем параметры каждой строки
      this.Rows.rows.forEach(row => {
        // @ts-expect-error okay
        this.RowsParams[row[this.model.constructor.primaryKeys[0]]] = new TableRowParams
      })
    }

  }

  /**
   * Обновить результаты от RESTа
   * @param SaveLoadParams Сохранить стандартные параметры загрузки
   */
  public async update(SaveLoadParams: any = null) {

    if (SaveLoadParams !== null) this.opts.LoadParams = SaveLoadParams;

    // Дополняем загрузочные параметры фильтрами
    const filters = this.applyFiltersParams();

    const rows: Rows<T> = await (this.model as any).constructor.all(merge({}, this.opts.LoadParams, filters, { page: this.Pager.page, perPage: this.Pager.perPage }));

    this.load(rows);

  }

  public applyFiltersParams() {
    const customFilters: ITableLoadParams = {
      where: {},
      params: {}
    };
    for (const key in this.columns) {
      const el = this.columns[key].Filter;

      // Виртуальные элементы не фильтруем, но добавляем в массив
      if (this.columns[key].isVirtual) {
        switch (el.type) {
          case 'date':
          case 'fixed':
          case 'fulltext':
          case 'selector':
          case 'text':
            customFilters.params[key] = el.valueString;
            continue;
          case 'daterange':
          case 'number':
            customFilters.params[key] = el.valueRange;
            continue;
          default:
            alert('НЕИЗВЕСТНЫЙ ТИП')
            continue;
        }
      }

      switch (el.type) {

        // Частичное совпадение
        case 'text':

          if (el.valueString.trim() === '') continue;
          customFilters.where[key] = ['LIKE', key, el.valueString];

          break;

        // Фуллтекстовый поиск
        case 'fulltext':

          if (el.valueString.trim() === '') continue;
          customFilters.where[key] = ['FULLTEXT', key, el.valueString];
          break;

        // Точное совпадение
        case 'fixed':
        case 'date':
        case 'selector':

          if (el.valueString.trim() === '') continue;
          customFilters.where[key] = el.valueString;

          break;

        // ДИАПАЗОН
        case 'number':
        case 'daterange':

          if (el.valueRange.length > 0) {
            customFilters.where[key + '_from'] = ['>=', key, el.valueRange[0]];
            customFilters.where[key + '_to'] = ['<=', key, el.valueRange[1]];
          }

          break;

        default:
          alert('Unknown table filter type');
      }
    }
    return customFilters;
  }


  public async add(): Promise<SavedObject<T> | null> {

    // Сперва предобработка
    // TODO: убрать пустой массив т.к. при добавлении он не нужен или прикрепить реактивную модель?
    if (await this.opts.Popup.beforeAdd({}, this) === false) { return null; }

    const res: SavedObject<T> = await Object.getPrototypeOf(this.model).constructor.create(this.getColumnsForUpdate('add'));

    if (!res.ok || !res.data) {
      throw res;
    }

    this.Rows.rows.push(reactive(res.data as any))

    return res;

  }

  public async save(): Promise<SavedObject<T> | null> {

    const tClass = Object.getPrototypeOf(this.model).constructor;
    const columns = this.getColumnsForUpdate('edit');
    const indexKey = tClass.primaryKeys[0];

    // Сперва предобработка
    if (await this.opts.Popup.beforeEdit(columns, this) === false) { return null; }

    // Сохраняем
    const res: SavedObject<T> = await tClass.edit(columns[indexKey], columns);

    if (!res.ok) {
      throw res;
    }

    if (res.data) {
      const findedIdx = this.Rows.rows.findIndex((row: any) => row[indexKey] === (res.data as any)[indexKey])
      if (findedIdx !== -1)
        this.Rows.rows[findedIdx] = reactive(res.data as any);
    }

    return res;

  }


  public async remove(row: T): Promise<SavedObject<T>> {

    const tClass = Object.getPrototypeOf(this.model).constructor;
    const columns = this.getColumnsForUpdate('edit');
    const indexKey = tClass.primaryKeys[0];
    const res = await tClass.delete((row as any)[indexKey]);

    const findedIdx = this.Rows.rows.findIndex((rowx: any) => rowx[indexKey] === (row as any)[indexKey])
    if (findedIdx !== -1)
      this.Rows.rows.splice(findedIdx, 1);

    return res;

  }

  private getColumnsForUpdate(mode: "add" | "edit") {
    const res: { [key: string]: string } = {};
    for (const key in this.columns) {
      if (mode === 'add' && !this.columns[key].Popup.isSendFromAdd) continue;
      if (mode === 'edit' && !this.columns[key].Popup.isSendFromEdit) continue;
      // TODO: здесь может быть полезно сохранять пустую строку
      if (this.columns[key].Popup.model !== '') { res[key] = this.columns[key].Popup.model }
    }
    return res;
  }

  public getSelectedRows() {
    const result: Array<T> = [];
    this.Rows.rows.forEach((r: any) => {
      const param = this.RowsParams[r[(this.model as any).constructor.primaryKeys[0]]]
      if (param.selected)
        result.push(r)
    })
    return result;
  }

  /**
   * Выгрузить существующие колонки в CSV
   * @param filename 
   * @param arr 
   */
  public exportSelectedToCSV(filename: string = "table.csv", arr: any = null) {

    arr = arr ?? this.getSelectedRows();

    const array = [Object.keys(arr[0])].concat(arr);
    const csv = array.map(row => Object.values(row).map(val => `"${val}"`).join(';')).join('\n');

    const csvData = new Blob([csv], { type: 'text/csv' });
    const csvURL = URL.createObjectURL(csvData);
    const link = document.createElement('a');
    link.href = csvURL;
    link.download = filename;
    link.click();

  }

}