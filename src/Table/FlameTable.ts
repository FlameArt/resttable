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
   * Состояние экспорта
   */
  public exportStatus: 'completed' | 'exportprocess' | string = 'completed';

  /**
   * Состояние загрузки
   */
  public loadingStatus: 'completed' | 'process' | string = 'process';

  /**
   * Последний прогруженный элемент
   */
  public lastLoadedID: number = 0;

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

    // Предзагружаем колонки
    this.preloadRelated()



  }

  /**
   * Загрузить результаты от RESTа в таблицу
   * @param rows Отданный объект
   */
  public load(rows: Rows<T>, isAppend: boolean = false) {

    rows.pages = rows.pages ?? { count: 0, page: 1, perPage: 1, total: 0 };

    if (rows.data) {

      // Заполняем массив
      if (isAppend)
        this.Rows.rows.push(...(rows.data ?? []) as any);
      else
        this.Rows.rows = (rows.data ?? []) as any;

      Object.keys(this.Pager).forEach((key) => (this.Pager as any)[key] = (rows.pages as any)[key])

      // удаляем чтобы при перезагрузке не сохранялось состояние пред. строк
      // производительность: если не стирать параметры строк, то при долгом пользовании таблицей и больших её объёмах в памяти накопится куча позиций, это утечка

      // upd: Не удаляем, чтобы хранить данные по выделениям между фильтрацией и паджинацией. Сбрасывается вручную
      for (const key in this.RowsParams)
        if (!this.RowsParams[key].selected)
          delete this.RowsParams[key];

      // Заполняем параметры каждой строки
      const pk = (this.model as any).constructor.primaryKeys[0];
      this.Rows.rows.forEach((row: any) => {
        if (typeof this.RowsParams[row[pk]] === 'undefined') {
          const newParam = new TableRowParams;
          newParam.item = row;
          this.RowsParams[row[pk]] = newParam;
        }
      })
    }

  }

  public async preloadRelated() {

    const allPreloadPromises: Promise<any>[] = [];
    for (const key in this.columns) {
      const col = this.columns[key];

      // только где предзагрузка включена
      if (col.Selector.preload !== true) continue;

      // если указана модель, то загружаем через неё
      if (col.Selector.model !== null)
        allPreloadPromises.push(col.Selector.model.prototype.constructor.all({
          perPage: 1000 // лимит в 1000 ответов для уменьшения дефолтного нагруза
        }).then((r: any) => {

          // Значение загрузилось: делаем преобразования

          // ключ модели
          const pk = (col.Selector.model).prototype.constructor['primaryKeys'][0];

          // Ручные
          if (typeof col.Selector.loader === 'function') {
            col.Selector.values.push(...col.Selector.loader(r.data))
          }

          // Преобразования не найдено, попытка автоматически определить параметры
          if (col.Selector.loader === null) {
            const rows = r.data;
            for (const row of rows) {
              if (typeof row[pk] !== 'undefined') {

                let name = typeof row['name'] !== 'undefined' ? row['name'].toString() : null;
                name = name ?? (typeof row['title'] !== 'undefined' ? row['title'].toString() : null);
                name = name ?? (typeof row['desc'] !== 'undefined' ? row['desc'].toString() : null);
                const color = (typeof row['color'] !== 'undefined' ? row['color'].toString() : null);
                const position = typeof row[pk] === 'number' ? row[pk] : 0;

                col.Selector.values.push({
                  id: row[pk],
                  title: name,
                  label: name,
                  color: color,
                  position: position
                })

              }
            }
          }
        }))
    }

    // Начинаем процесс предзагрузки
    await Promise.allSettled(allPreloadPromises);

  }

  /**
   * Обновить результаты от RESTа
   * @param CustomLoadParams Применить кастомные параметры загрузки
   * @param exportFilename имя файла для экспорта, если указано, данные будут выгружены
   */
  public async update(CustomLoadParams: ITableLoadParams = {}, exportFilename: string | null = null, from: 'pager' | 'filters' = 'pager') {

    // Дополняем загрузочные параметры фильтрами
    const filters = merge(this.applyFiltersParams(), CustomLoadParams);

    // Операции перед обновлением
    const isNeedUpdate = this.opts.onBeforeUpdate(filters, exportFilename !== null);
    if (!isNeedUpdate) return;


    // совмещаем все параметры загрузки
    const allParams = merge({}, { page: this.Pager.page, perPage: this.Pager.perPage }, this.opts.LoadParams, filters);

    // Если всё уже загружено
    if (this.Pager.total !== 0 && allParams.page - 1 > this.Pager.total / this.Pager.perPage) return;

    // Запускаем прогрузку
    this.loadingStatus = 'process';

    const rows: Rows<T> = await (this.model as any).constructor.all(allParams);

    if (exportFilename === null) {

      // Режим прогрузки
      let loadModeAppend: boolean = false;
      if (this.opts.Pagination.type === 'scrollable' && from === 'pager') loadModeAppend = true;

      // Строки: загружаем
      this.load(rows, loadModeAppend);

    }

    else {

      this.exportStatus = 'completed';

      // Файл: скачиваем
      if (typeof this.opts.customDownloadHandler === 'function') {
        // Кастомный загрузчик
        this.opts.customDownloadHandler((rows as any).data, exportFilename, (rows as any).MimeType)
      }
      else {
        // Нативный загрузчик через браузер
        const url = window.URL.createObjectURL((rows as any).data);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportFilename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    }

    this.loadingStatus = 'completed'

  }

  /**
   * Применить параметры, указанные в фильтрах
   * @returns 
   */
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
          case 'text':
            customFilters.params[key] = el.valueString;
            continue;
          case 'daterange':
            customFilters.params[key] = el.valueRange;
            continue;
          case 'number':
            customFilters.params[key] = el.valueRangeNumbers;
            continue;
          case 'selector':
            if (this.columns[key].Filter.selector.multiselect) {
              customFilters.params[key] = el.valueRange;
            }
            else
              customFilters.params[key] = el.valueString;
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

          if (el.valueString.trim() === '') continue;
          customFilters.where[key] = el.valueString;

          break;

        // ЧИСЛА
        case 'number':

          if (el.valueRangeNumbers.from.length > 0)
            customFilters.where[key + '_from'] = ['>=', key, el.valueRangeNumbers.from];
          if (el.valueRangeNumbers.to.length > 0)
            customFilters.where[key + '_to'] = ['<=', key, el.valueRangeNumbers.to];

          break;

        // ДИАПАЗОН ДАТ
        case 'daterange':

          if (el.valueRange.length > 0) {
            customFilters.where[key + '_from'] = ['>=', key, el.valueRange[0]];
            customFilters.where[key + '_to'] = ['<=', key, el.valueRange[1]];
          }

          break;



        case 'selector':

          if (el.selector.multiselect) {
            if (el.valueRange.length > 0)
              customFilters.where[key] = ['IN', key, el.valueRange];
          }
          else
            customFilters.where[key] = el.valueString;

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

  /**
   * Получить все выбранные колонки массивом объектов строк
   * @returns 
   */
  public getSelectedRows() {
    const res = [];
    for (const key in this.RowsParams) {
      const el = this.RowsParams[key];
      if (el.selected)
        res.push(el.item)
    }
    this.RowsSelected.splice(0);
    this.RowsSelected.push(...res);
    return res;
  }

  /**
   * Выгрузить существующие колонки в CSV средствами браузера
   * @param filename 
   * @param arr 
   */
  public exportToCSV(filename: string = "table.csv", arr: any = null) {

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

  /**
   * Выгрузить в Excel средствами бекенда
   * @param filename 
   * @param arr 
   */
  public exportToXLS(onlySelected: boolean = false, filename: string | null = null, arr: any = null, columnList: Array<string> | null = null): Promise<void> {

    const tClass = Object.getPrototypeOf(this.model).constructor;
    const indexKey = tClass.primaryKeys[0];

    const customFilter: ITableLoadParams = {
      where: {}
    };

    // Только выбранные элементы
    if (onlySelected) {
      // Получаем айдишки и затем вносим их в условие IN
      arr = arr ?? this.getSelectedRows();
      const INArray: Array<any> = [];
      for (const row of arr) {
        if (typeof row[indexKey] !== 'undefined') {
          INArray.push(row[indexKey]);
        }
      }
      if (INArray.length > 0) {
        customFilter.where = {
          indexKey: ['IN', indexKey, INArray]
        }
      }
    }

    customFilter.export = {
      format: "xlsx",
      titles: [],
      filename: filename ?? 'export_' + Date.now() + ".xlsx"
    };
    customFilter.fields = [];

    for (const colKey in this.columns) {

      const col = this.columns[colKey];
      if (columnList !== null && (!columnList.includes(col.name))) continue;
      if (columnList === null && (col.isVirtual || !col.Table.isShow)) continue;

      // проверки пройдены, все оставшиеся колонки добавляем в вывод
      (customFilter as any).export.titles.push(col.title !== '' ? col.title : col.name);
      customFilter.fields.push(col.name);

    }

    this.exportStatus = 'exportprocess';

    // Делаем запрос на отдачу
    return this.update(customFilter, customFilter.export.filename ?? null);

  }

}