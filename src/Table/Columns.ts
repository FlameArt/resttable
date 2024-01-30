import ITableSelectorItem from "./TableSelectorItem";

// Подгрузчик типа класса
type Class<T> = new (...args: any[]) => T

export class Column implements IColumn {

  /**
   * Текстовое название поля [колонки], как оно есть в базе
   */
  public name: string = "";

  /**
   * Общее отображаемое имя
   * Если не установлены более детализированные имена для заголовков таблицы или в попапе - используется оно
   */
  public title: string = "";

  /**
   * Поддержка виртуальных столбцов для кастомных запросов
   */
  public isVirtual: boolean = false;

  /**
   * Параметры таблицы
   */
  public Table = {
    /**
     * Показывать ли поле в таблице
     */
    isShow: true,

    /**
     * Заголовок столбца в таблице
     */
    title: "",

    /**
     * Кастомный заголовок
     * @param row 
     * @param col 
     * @returns 
     */
    titleCustom: null,

    /**
     * Выделена ли строка чекбоксом
     */
    isSelected: false,

    /**
     * Возможность преобразовать вывод из любой колонки
     * @param row строка
     * @param column колонка
     * @returns преобразованное значение
     */
    value: (row: any, column: Column) => {
      return row[column.name]
    },

    /**
     * Выводить ли значение из функции value() в чистом html-виде
     * При значении false любые спецсимволы интерпретируются как строковые символы
     * При значении true - результат из value() будет напрямую подставлен в HTML
     * ОСТОРОЖНО С XSS: если подставлять при true чистый пользовательский ввод, он сможет выполнить любой код
     */
    isRawValue: false,

    /**
     * Клик
     * @param row 
     * @param column 
     * @returns 
     */
    click: (row: any, column: Column) => { },

    /**
     * CSS-классы колонки в таблице
     */
    classes: '',

    /**
     * CSS-классы заголовка таблице
     */
    classesHeader: '',

    /**
     * Ширина таблицы
     */
    width: null,

  }

  /**
   * Это related данные для всех селекторов и внутри таблицы
   */
  public Selector = {

    /**
     * Нужна авто-предзагрузка значений при загрузке страницы
     * [полная таблица]
     */
    preload: true,

    /**
     * Загрузчик значений
     * @returns ITableSelectorItem[]
     */
    loader: null as ((rows?: Array<any>) => ITableSelectorItem[]) | null,

    /**
     * Модель, с которой выгружать значения
     */
    model: null as any | null,

    /**
     * Здесь список готовых значений
     */
    values: [] as ITableSelectorItem[],

    /**
     * Кастомизация вывода отдельного элемента
     * @param row 
     * @param col 
     * @returns 
     */
    value: (row: any, col: string) => row[col]

  };

  /**
   * Настройки фильтра
   */
  public Filter = {

    // Показываем ли фильтр
    isShow: true,

    // Значение
    valueString: "",
    valueRange: [],
    valueRangeNumbers: {
      from: '',
      to: ''
    },

    // Тип фильтра
    type: 'text' as "text" | "fixed" | "fulltext" | "number" | "date" | "daterange" | "selector",

    /**
     * Список значений под выбор
     */
    selector: {
      mode: 'vertical' as 'vertical' | 'horizontal',
      multiselect: true,
    },

    // Минимальное число символов в строке фильтра, после которого будет произведён запрос
    filterMinSymbolsRequest: 0,

    // Позиция фильтра по порядку
    filterRow: 0,
    filterColumn: 0,

    /**
     * CSS-классы, 
     */
    classes: '',

    /**
     * Заголовок фильтра. null - заголовок равен title общему
     */
    title: null,

    /**
     * Классы для заголовка
     */
    titleClasses: ''

  }

  public Popup = {

    // Тут привязка к реальным данным
    model: "",

    // Заголовок поля в попапе
    title: "",

    // Подсказка
    desc: "",

    // Текст плейсхолдера
    placeholder: "",

    isShow: true,
    isEnabled: true,

    // Отправлять ли поле на бекенд при сохранении записи: добавлении и удалении
    isSendFromAdd: true,
    isSendFromEdit: true,

    // Количество строк текстового поля
    popupTextRows: 6,

    // Настройка загрузчика картинок
    popupImage: {
      buttons: false,
      convertTo: 'image/jpeg'
    },

    // Тип элемента в попапе
    // string - обычная строка или селектор строк
    // text - text area
    // button - кнопка
    popupType: 'string' as "string" | "text" | "button" | "date" | "selector" | "image" | "file",

    // Текст ошибки добавления/обновления
    errorMessage: '',

    // Настройки селектора, если он включён в popupType
    Selector: {

      // Значения селектора - готовые
      values: [],

      // Загрузчик значений - используется всегда и перекрывает values
      loader: (column: Column) => null

    },

  }

  // Ленивая загрузка полей базы или вообще их не загрузка для экономии траффика
  public isLoadToTable = true;
  public isLoadToPopup = true;

  // Порядок колонки в сортировке вывода
  SortOrder: number | null = null;


  // Функция кнопки
  public buttonFunction = (row: any) => { return true; };



  /**
   * Релативная таблица
   */
  public linkedto: any = {};
  public selectResults: Array<any> = [];

  /**
   * Загружать ли данные от foreign keys, т.к. данных может быть много, по-умолчанию выключено
   */
  public isLoadKeys = false;

  // Какие параметры при загрузке ключа
  public loadKeysParams = {
    where: null,
    expand: null,
    fields: null,
    sortfields: null,
    page: 1,
    perPage: 9999
  }

  public selectRepresentAs = function (item: any) { return item };

  public Edit = {
    name: "",
    desc: "",
    can: true,
  }
  public Add = {
    name: "",
    desc: "",
    can: true,
    default: undefined
  }




}


export interface IColumn {
  /**
   * Текстовое название поля, как оно есть в базе
   */
  name?: string,

  /**
   * Отображаемое имя
   */
  title?: string,

  /**
   * Поддержка виртуальных столбцов для кастомных запросов
   */
  isVirtual?: boolean,

  /**
   * Параметры таблицы
   */
  Table?: {
    isShow?: boolean,
    title?: string,
    value?: (row: any, column: Column) => string,
    isRawValue?: boolean,
    click?: (row: any, column: Column) => void,
    classes?: string,
    classesHeader?: string,
    width?: number | null,
    isSelected?: boolean,

    /**
     * Кастомный заголовок
     * @param row 
     * @param col 
     * @returns 
     */
    titleCustom?: ((col: Column) => string) | null,

  },

  /**
   * Настройки фильтра
   */
  Filter?: {

    // Показываем ли фильтр
    isShow?: boolean,

    // Тип фильтра
    type?: "text" | "fixed" | "fulltext" | "number" | "date" | "daterange" | "selector",

    // Значение
    valueString?: string,
    valueRange?: Array<string>,
    valueRangeNumbers?: {
      from?: string,
      to?: string
    },

    // Минимальное число символов в строке фильтра, после которого будет произведён запрос
    filterMinSymbolsRequest?: number,

    // Позиция фильтра по порядку
    filterRow?: number,
    filterColumn?: number,

    /**
     * Список значений под выбор
     */
    selector?: {
      mode?: 'vertical' | 'horizontal',
      multiselect?: boolean,
    },

    /**
     * CSS-классы, применяемые к фильтру, 
     */
    classes?: string,

  },

  /**
   * Это единые related данные для всех селекторов:
   * внутри таблицы для замены id названий на значения
   * селектор для фильтров
   * селектор в попапе
   */
  Selector?: {

    /**
     * Загрузчик значений ручной
     * @returns ITableSelectorItem[]
     */
    loader?: ((rows?: Array<any>) => ITableSelectorItem[]) | null,

    /**
     * Здесь список готовых значений
     */
    values?: ITableSelectorItem[],


    /**
     * Модель, с которой выгружать значения
     */
    model?: Class<any> | null,


    /**
     * Кастомизация вывода отдельного элемента
     * @param row 
     * @param col 
     * @returns 
     */
    value?: (row: any, col: string) => string

  },


  Popup?: {

    // Тут привязка к реальным данным
    model?: any,

    // Заголовок поля в попапе
    title?: string,

    // Подсказка
    desc?: string,

    // Текст плейсхолдера
    placeholder?: string,


    isShow?: boolean,
    isEnabled?: boolean,

    // Отправлять ли поле на бекенд при сохранении записи: добавлении и удалении
    isSendFromAdd?: boolean,
    isSendFromEdit?: boolean,

    // Количество строк текстового поля
    popupTextRows?: number,

    // Настройка загрузчика картинок
    popupImage?: {
      buttons?: boolean,
      convertTo?: string
    },

    // Тип элемента в попапе
    // string - обычная строка или селектор строк
    // text - text area
    // button - кнопка
    popupType?: "string" | "text" | "button" | "date" | "selector" | "image" | "file",

    // Текст ошибки добавления/обновления
    errorMessage?: string,


    // Настройки селектора, если он включён в popupType
    Selector?: {

      // Значения селектора - готовые
      values?: Array<any>,

      // Загрузчик значений - используется всегда и перекрывает values
      loader?: (column: Column) => Array<any> | null

    },

  },

  // Ленивая загрузка полей базы или вообще их не загрузка для экономии траффика
  isLoadToTable?: boolean,
  isLoadToPopup?: boolean,


  // Функция кнопки
  buttonFunction?: any,


  // Порядок колонки
  SortOrder?: number | null,

  /**
   * Релативная таблица
   */
  linkedto?: any,
  selectResults?: Array<any>,

  /**
   * Загружать ли данные от foreign keys, т.к. данных может быть много, по-умолчанию выключено
   */
  isLoadKeys?: boolean,

  // Какие параметры при загрузке ключа
  loadKeysParams?: {
    where?: any,
    expand?: any,
    fields?: any,
    sortfields?: any,
    page?: number,
    perPage?: number
  },

  selectRepresentAs?: any,

  Edit?: {
    name?: string,
    desc?: string,
    can?: boolean,
  },
  Add?: {
    name?: string,
    desc?: string,
    can?: boolean,
    default?: any
  }

}
